import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";

export async function GET(req) {
  const url = new URL(req.url);
  const studioId = url.searchParams.get("studioId");
  if (!studioId) {
    return new NextResponse("Missing studioId", { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return new NextResponse("OAuth not configured", { status: 500 });
  }

  // CSRF: bind a random nonce to this initiation and verify it in the callback.
  const nonce = crypto.randomUUID();
  cookies().set("gcal_oauth_state", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });

  // Carry both studioId and nonce in 'state'. We'll verify nonce + ownership in callback.
  const state = new URLSearchParams({ studioId, nonce }).toString();

  // Scopes: readonly (to read availability) + events (to write bookings, if needed)
  const scope = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",           // required to receive refresh_token
    include_granted_scopes: "true",
    prompt: "consent",                // ensures refresh_token on first grant
    state,                            // studioId + nonce (verified in callback)
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
