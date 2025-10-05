export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, googleApiGet } from "@lib/googleAuth";
import { prisma } from "@lib/prisma";

function getSafeBaseUrl(req) {
  // Prefer explicit base from env (e.g., https://miha-calendar.netlify.app)
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase && /^https?:\/\//i.test(envBase)) {
    const u = new URL(envBase);
    if (process.env.NODE_ENV === "production") u.protocol = "https:";
    u.port = ""; // remove :80 etc
    return u.toString();
  }
  // Fallback: derive from request origin, force https and strip port
  const u = new URL(req.url);
  u.protocol = "https:";
  u.port = "";
  u.pathname = "/";
  u.search = "";
  u.hash = "";
  return u.toString();
}

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateStr = url.searchParams.get("state") || "";

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

    // Optional, non-fatal: auto-select primary calendar
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

    // Redirect to site root (NEXT_PUBLIC_BASE_URL or request origin)
    const target = getSafeBaseUrl(req);
    const res = NextResponse.redirect(target);
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
