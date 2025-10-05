import { prisma } from "@lib/prisma";
import { refreshAccessToken } from "@lib/googleAuth";

export class ReconnectRequiredError extends Error {
  constructor(message = "Reconnect calendar required") {
    super(message);
    this.name = "ReconnectRequiredError";
    this.code = "RECONNECT_REQUIRED";
  }
}

/**
 * Returns a valid Google access token for the given CalendarConnection.
 * - Refreshes silently when expired/near expiry
 * - Never triggers browser redirects
 * - Throws ReconnectRequiredError if refresh cannot be performed
 */
export async function getValidAccessToken(connectionId) {
  const conn = await prisma.calendarConnection.findUnique({
    where: { id: connectionId },
    select: {
      accessToken: true,
      refreshToken: true,
      expiry: true,
      studioId: true,           // handy for logs
      grantedScopes: true,
    },
  });

  if (!conn || !conn.refreshToken) {
    throw new ReconnectRequiredError("Missing refresh token");
  }

  // If we have a fresh-enough access token, use it
  const skewMs = 60_000; // refresh 1 minute early
  const hasAccess = !!conn.accessToken && !!conn.expiry;
  const stillValid = hasAccess && (Date.now() + skewMs) < new Date(conn.expiry).getTime();
  if (stillValid) {
    return conn.accessToken;
  }

  // Otherwise refresh
  try {
    const data = await refreshAccessToken({
      refreshToken: conn.refreshToken,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });

    const nextAccess = data.access_token;
    const expiresIn = data.expires_in ?? 3600; // seconds
    const nextExpiry = new Date(Date.now() + expiresIn * 1000);

    if (!nextAccess) {
      throw new ReconnectRequiredError("No access token returned on refresh");
    }

    await prisma.calendarConnection.update({
      where: { id: connectionId },
      data: {
        accessToken: nextAccess,
        expiry: nextExpiry,
        // Do NOT touch refreshToken here (Google rarely returns it on refresh)
      },
    });

    return nextAccess;
  } catch (err) {
    // Map common Google errors to a clean reconnect signal
    const msg = String(err?.message || err);
    if (msg.includes("invalid_grant") || msg.includes("unauthorized_client")) {
      throw new ReconnectRequiredError("Refresh token invalid or revoked");
    }
    // Bubble others (network, 5xx) to caller to treat as transient errors
    throw err;
  }
}
