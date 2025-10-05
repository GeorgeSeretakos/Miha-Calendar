export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, googleApiGet } from "@lib/googleAuth";
import { prisma } from "@lib/prisma";

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateStr = url.searchParams.get("state") || "";

  // Parse state (studioId + nonce) from start route
  const state = new URLSearchParams(stateStr);
  const studioId = state.get("studioId");
  const stateNonce = state.get("nonce");
  const cookieNonce = cookies().get("gcal_oauth_state")?.value;

  // Clear nonce cookie (one-time use)
  cookies().set("gcal_oauth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  if (!code || !studioId) {
    return new NextResponse("Missing code or studioId", { status: 400 });
  }
  if (!stateNonce || !cookieNonce || stateNonce !== cookieNonce) {
    return new NextResponse("Invalid OAuth state", { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.OAUTH_REDIRECT_URI,
    });

    const expiresAt =
      tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : new Date(Date.now() + (tokens.expires_in || 0) * 1000);

    // Upsert connection — DO NOT overwrite refreshToken with null/undefined
    await prisma.calendarConnection.upsert({
      where: { studioId },
      update: {
        accessToken: tokens.access_token || undefined,
        // Only update refreshToken if Google returned one (prompt=consent ensures this on first grant)
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
        expiry: expiresAt,
        grantedScopes: tokens.scope?.split(" ") ?? [],
      },
      create: {
        studioId,
        accessToken: tokens.access_token || null,
        refreshToken: tokens.refresh_token || null,
        expiry: expiresAt,
        grantedScopes: tokens.scope?.split(" ") ?? [],
      },
    });

    // Try to auto-select the primary calendar (optional convenience)
    try {
      const calendars = await googleApiGet(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        tokens.access_token
      );
      const primary = calendars.items?.find(c => c.primary) || calendars.items?.[0];
      if (primary?.id) {
        await prisma.calendarConnection.update({
          where: { studioId },
          data: { calendarId: primary.id },
        });
      }
    } catch (e) {
      // Non-fatal: we can let the admin pick later
      console.warn("Calendar list fetch failed (non-fatal):", e?.message || e);
    }

    // Success — redirect back to your admin screen
    return NextResponse.redirect(
      new URL(`/admin/integrations?connected=1&studioId=${studioId}`, req.url)
    );
  } catch (err) {
    console.error("OAuth callback error:", err?.message || err);
    // Consider redirecting with an error flag for nicer UX
    return new NextResponse("OAuth callback error", { status: 500 });
  }
}
