export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, googleApiGet } from "@lib/googleAuth";
import { prisma } from "@lib/prisma";

function buildSafeBase(req) {
  // Prefer explicit base from env if provided (e.g., https://miha-calendar.netlify.app)
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase && /^https?:\/\//i.test(envBase)) {
    const u = new URL(envBase);
    // Always force https in production
    if (process.env.NODE_ENV === "production") u.protocol = "https:";
    u.port = ""; // no explicit port
    return u;
  }
  // Fallback: derive from the incoming request and normalize
  const u = new URL(req.url);
  u.protocol = "https:";
  u.port = ""; // strip :80 etc.
  return u;
}

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateStr = url.searchParams.get("state") || "";

  // Parse state (studioId + nonce) from start route
  const state = new URLSearchParams(stateStr);
  const studioId = state.get("studioId");
  const stateNonce = state.get("nonce");
  const cookieNonce = cookies().get("gcal_oauth_state")?.value;

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

    // Upsert connection — don't overwrite refreshToken with null/undefined
    await prisma.calendarConnection.upsert({
      where: { studioId },
      update: {
        accessToken: tokens.access_token || undefined,
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

    // Optional: auto-select primary calendar
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
      console.warn("Calendar list fetch failed (non-fatal):", e?.message || e);
    }

    // Build safe redirect URL (force https, no :80)
    const base = buildSafeBase(req);
    const redirectUrl = new URL(
      `/admin/integrations?connected=1&studioId=${studioId}`,
      base
    );

    // Redirect + clear the nonce cookie on the response
    const res = NextResponse.redirect(redirectUrl);
    res.cookies.set("gcal_oauth_state", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch (err) {
    console.error("OAuth callback error:", err?.message || err);
    // Clear nonce cookie even on error
    const res = new NextResponse("OAuth callback error", { status: 500 });
    res.cookies.set("gcal_oauth_state", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  }
}
