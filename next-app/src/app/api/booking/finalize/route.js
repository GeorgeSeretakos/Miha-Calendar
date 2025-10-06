export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { getValidAccessToken } from "@lib/getValidAccessToken";
import { freeBusy } from "@lib/googleCalendar";
import { googleApiPost } from "@lib/googleAuth";
import { jwtVerify } from "jose";
import { notifyOrganizerAndFirm } from "@lib/notifyOrganizerAndFirm";

const JWT_SECRET = new TextEncoder().encode(process.env.BOOKING_JWT_SECRET);

/**
 * Build an absolute HTTPS URL for redirects.
 * - Prefers NEXT_PUBLIC_SITE_URL or SITE_URL (must include protocol).
 * - Otherwise derives from proxy headers and forces https://.
 */
function absUrl(req, pathWithQuery) {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL;

  if (site) return new URL(pathWithQuery, site);

  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host");

  // Always force https in redirects to avoid ERR_SSL_PROTOCOL_ERROR behind proxies
  const origin = `https://${host}`;
  return new URL(pathWithQuery, origin);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    // 1) No token at all -> missing_token
    if (!token) {
      return NextResponse.redirect(absUrl(req, "/thank-you?status=error&reason=missing_token"));
    }

    // 2) Verify token; if invalid/expired, redirect with specific reason
    let payload;
    try {
      ({ payload } = await jwtVerify(token, JWT_SECRET, { algorithms: ["HS256"] }));
    } catch (e) {
      const name = e?.name || "";
      if (name === "JWTExpired") {
        return NextResponse.redirect(absUrl(req, "/thank-you?status=error&reason=expired_token"));
      }
      return NextResponse.redirect(absUrl(req, "/thank-you?status=error&reason=invalid_token"));
    }

    const { studioId, startISO, endISO, firstName, lastName, email, phone, message, timezone, jti } = payload || {};

    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: { calendarConnection: true },
    });
    if (!studio || !studio.calendarConnection) {
      return NextResponse.redirect(absUrl(req, "/thank-you?status=error&reason=studio"));
    }

    // 3) Ensure a non-expired DB hold exists and matches this token (jti)
    const now = new Date();
    const hold = await prisma.appointmentHold.findUnique({
      where: {
        studioId_startISO_endISO: {
          studioId,
          startISO: new Date(startISO),
          endISO: new Date(endISO),
        },
      },
    });
    if (!hold || hold.expiresAt <= now || (jti && hold.jti !== jti)) {
      return NextResponse.redirect(absUrl(req, "/thank-you?status=taken"));
    }

    // 4) Google auth
    let accessToken;
    try {
      accessToken = await getValidAccessToken(studio.calendarConnection.id);
    } catch {
      return NextResponse.redirect(absUrl(req, "/thank-you?status=error&reason=google_auth"));
    }

    const calendarId = studio.bookingCalendarId || "primary";
    const tz = timezone || studio.timezone || "Europe/Athens";

    // 5) Defensive free/busy
    const fb = await freeBusy(accessToken, {
      calendarId,
      timeMinISO: new Date(startISO).toISOString(),
      timeMaxISO: new Date(endISO).toISOString(),
      timezone: tz,
    });
    if ((fb.calendars?.[calendarId]?.busy || []).length > 0) {
      return NextResponse.redirect(absUrl(req, "/thank-you?status=taken"));
    }

    // 6) Create event in Google Calendar (attendee only; Google sends invite to attendee)
    const summary = `Miha Bodytec Appointment — ${firstName} ${lastName}`;
    const description = [
      `Studio: ${studio.name}`,
      studio.address ? `Address: ${studio.address}` : null,
      `Client: ${firstName} ${lastName}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      message ? `Message:\n${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const attendees = [
      { email, displayName: `${firstName} ${lastName}`.trim() }, // attendee only
    ];

    const created = await googleApiPost(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
      accessToken,
      {
        summary,
        description,
        start: { dateTime: startISO, timeZone: tz },
        end:   { dateTime: endISO,   timeZone: tz },
        attendees,
        transparency: "opaque",
        status: "confirmed",
        reminders: { useDefault: true },
        extendedProperties: { private: { bookingJti: jti || "" } }, // tiny trace for idempotency/debug
      }
    );

    // 7) Notify firm + organizer via Resend (post-confirmation)
    try {
      await notifyOrganizerAndFirm({
        studio,
        booking: { id: hold?.id, startISO, endISO, firstName, lastName, email, phone, message },
        timezone: tz,
        eventId: created?.id,
        iCalUID: created?.iCalUID,
        organizerEmail: studio.email, // optional explicit organizer email
      });
    } catch (e) {
      console.warn("notifyOrganizerAndFirm failed:", e?.message || e);
      // do not fail the flow
    }

    // 8) Remove hold
    try {
      await prisma.appointmentHold.delete({
        where: {
          studioId_startISO_endISO: {
            studioId,
            startISO: new Date(startISO),
            endISO: new Date(endISO),
          },
        },
      });
    } catch (e) {
      console.warn("Hold delete failed:", e?.message || e);
    }

    return NextResponse.redirect(absUrl(req, "/thank-you?status=success"));
  } catch (err) {
    console.error("booking/finalize error:", err);
    return NextResponse.redirect(absUrl(req, "/thank-you?status=error"));
  }
}
