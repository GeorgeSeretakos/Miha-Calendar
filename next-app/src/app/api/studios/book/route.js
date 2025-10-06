export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { getValidAccessToken, ReconnectRequiredError } from "@lib/getValidAccessToken";
import { freeBusy } from "@lib/googleCalendar";
import { googleApiPost } from "@lib/googleAuth";

// helper: build RFC3339-ish local datetime and simple end-time math (no DST edge handling)
function buildDateTime(day, time) {
  return `${day}T${time}:00`;
}
function addMinutesToTime(timeHHMM, minutes) {
  const [h, m] = timeHHMM.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor((total % (24 * 60)) / 60);
  const mm = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return { hhmm: `${pad(hh)}:${pad(mm)}`, dayOverflow: total >= 24 * 60 };
}
const isEmail = (s) => typeof s === "string" && /\S+@\S+\.\S+/.test(s);

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      studioId,
      day,
      time,
      durationMinutes,
      timezone: tzOverride,
      firstName,
      lastName,
      email: customerEmail,
      phone,
      message = ""
    } = body || {};

    // Basic validation
    if (!studioId || !day || !time || !firstName || !lastName || !customerEmail || !phone) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Load studio + connection
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: { calendarConnection: true },
    });
    if (!studio || !studio.calendarConnection) {
      return NextResponse.json({ error: "Studio or calendar connection not found." }, { status: 404 });
    }

    const timezone = tzOverride || studio.timezone || "Europe/Athens";
    const slotMinutes = Number.isFinite(durationMinutes) ? durationMinutes : (studio.slotDurationMinutes || 30);

    // Ensure valid token (silent refresh)
    let accessToken;
    try {
      accessToken = await getValidAccessToken(studio.calendarConnection.id);
    } catch (e) {
      if (e instanceof ReconnectRequiredError) {
        return NextResponse.json({ error: "Reconnect calendar" }, { status: 401 });
      }
      return NextResponse.json({ error: "Google auth error" }, { status: 502 });
    }

    // Booking calendar
    const calendarId = studio.bookingCalendarId || "primary";

    // Build start/end datetimes in the studio's timezone
    const startDateTime = buildDateTime(day, time);
    const endCalc = addMinutesToTime(time, slotMinutes);

    let endDateStr = day;
    if (endCalc.dayOverflow) {
      const plus1 = new Date(new Date(`${day}T00:00:00Z`).getTime() + 24 * 60 * 60 * 1000);
      endDateStr = plus1.toISOString().slice(0, 10); // next day YYYY-MM-DD
    }
    const endDateTime = buildDateTime(endDateStr, endCalc.hhmm);

    // 1) Conflict check via freeBusy
    const timeMinISO = new Date(`${day}T${time}:00`).toISOString();
    const timeMaxISO = new Date(`${endDateStr}T${endCalc.hhmm}:00`).toISOString();

    let fb;
    try {
      fb = await freeBusy(accessToken, {
        calendarId,
        timeMinISO,
        timeMaxISO,
        timezone,
      });
    } catch (e) {
      return NextResponse.json({ error: "Google service error (freeBusy)" }, { status: 502 });
    }

    const conflicts = (fb.calendars?.[calendarId]?.busy || []).length > 0;
    if (conflicts) {
      return NextResponse.json({ error: "Time slot is no longer available." }, { status: 409 });
    }

    // 2) Create the event on the booking calendar
    // ONLY use studio.email for owner notifications
    const attendees = [
      { email: customerEmail, displayName: `${firstName} ${lastName}`.trim() },
      ...(isEmail(studio.email) ? [{ email: studio.email }] : []),
    ];

    const summary = `Miha Bodytec Appointment — ${firstName} ${lastName}`;
    const descriptionLines = [
      `Studio: ${studio.name}`,
      studio.address ? `Address: ${studio.address}` : null,
      `Client: ${firstName} ${lastName}`,
      `Email: ${customerEmail}`,
      `Phone: ${phone}`,
      message ? `Message:\n${message}` : null,
    ].filter(Boolean);

    console.log("Attendees: ", attendees);

    const eventBody = {
      summary,
      description: descriptionLines.join("\n"),
      start: { dateTime: startDateTime, timeZone: timezone },
      end: { dateTime: endDateTime, timeZone: timezone },
      attendees,
      transparency: "opaque",
      reminders: { useDefault: true },
    };

    let created;
    try {
      created = await googleApiPost(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
        accessToken,
        eventBody
      );
    } catch (e) {
      return NextResponse.json({ error: "Failed to create event." }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      eventId: created.id,
      htmlLink: created.htmlLink,
      start: created.start,
      end: created.end,
      attendees: created.attendees || [],
    });
  } catch (err) {
    console.error("Book POST error:", err);
    return NextResponse.json({ error: "Failed to book.", details: String(err?.message || err) }, { status: 500 });
  }
}
