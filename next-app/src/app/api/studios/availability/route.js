export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { getValidAccessToken, ReconnectRequiredError } from "@lib/getValidAccessToken";
import { resolveCalendarIdByName, listEvents, freeBusy } from "@lib/googleCalendar";
import { alignSlots, overlaps, toISO } from "@lib/slots";

/**
 * Body:
 *  - studioId (string)        REQUIRED
 *  - day (YYYY-MM-DD)         REQUIRED (selected day on UI)
 *  - timezone (string)        OPTIONAL (fallback to studio.timezone or "Europe/Athens")
 *  - slotDurationMinutes(int) OPTIONAL (fallback to studio.slotDurationMinutes or 30)
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { studioId, day, timezone: tzOverride, slotDurationMinutes: slotOverride } = body || {};

    if (!studioId || !day) {
      return NextResponse.json({ error: "studioId and day are required." }, { status: 400 });
    }

    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: { calendarConnection: true },
    });
    if (!studio || !studio.calendarConnection) {
      return NextResponse.json({ error: "Studio or calendar connection not found." }, { status: 404 });
    }

    const timezone = tzOverride || studio.timezone || "Europe/Athens";
    const slotMinutes = slotOverride || studio.slotDurationMinutes || 30;

    // Build day window (UTC ISO for Google)
    const dayStartLocal = new Date(`${day}T00:00:00`);
    const dayEndLocal = new Date(dayStartLocal.getTime() + 24 * 60 * 60 * 1000);
    const timeMinISO = dayStartLocal.toISOString();
    const timeMaxISO = dayEndLocal.toISOString();

    // 0) Get a valid token (refresh if needed)
    let accessToken;
    try {
      accessToken = await getValidAccessToken(studio.calendarConnection.id);
    } catch (e) {
      if (e instanceof ReconnectRequiredError) {
        return NextResponse.json({ error: "Reconnect calendar" }, { status: 401 });
      }
      // transient / unknown error
      return NextResponse.json({ error: "Google auth error" }, { status: 502 });
    }

    // 1) Resolve calendars (Availability by name if not stored; Bookings uses primary if null)
    let availabilityCalendarId = studio.availabilityCalendarId || null;
    try {
      if (!availabilityCalendarId) {
        availabilityCalendarId = await resolveCalendarIdByName(accessToken, "Availability");
        if (!availabilityCalendarId) {
          return NextResponse.json(
            { error: "Availability calendar not found (must be named 'Availability')." },
            { status: 404 }
          );
        }
        // Best-effort persist for next calls
        await prisma.studio.update({
          where: { id: studio.id },
          data: { availabilityCalendarId },
        }).catch(() => {});
      }
    } catch (e) {
      return NextResponse.json({ error: "Failed to resolve calendars" }, { status: 502 });
    }
    const bookingCalendarId = studio.bookingCalendarId || "primary";

    // 2) Query Google: availability windows and busy slots
    let availResp, fb;
    try {
      availResp = await listEvents(accessToken, availabilityCalendarId, {
        timeMinISO,
        timeMaxISO,
        timezone,
      });

      fb = await freeBusy(accessToken, {
        calendarId: bookingCalendarId,
        timeMinISO,
        timeMaxISO,
        timezone,
      });
    } catch (e) {
      return NextResponse.json({ error: "Google service error" }, { status: 502 });
    }

    const availabilityWindows = (availResp.items || [])
      .filter(ev => (ev.transparency || "opaque") === "transparent")
      .map(ev => {
        const s = ev.start?.dateTime || ev.start?.date;
        const e = ev.end?.dateTime || ev.end?.date;
        if (!s || !e) return null;
        const start = new Date(s);
        const end = new Date(e);
        return start < end ? { start, end } : null;
      })
      .filter(Boolean);

    const busyWindows = (fb.calendars?.[bookingCalendarId]?.busy || []).map(b => ({
      start: new Date(b.start),
      end: new Date(b.end),
    }));

    // 3) Slice into fixed slots and filter by busy
    const outSlots = [];
    for (const w of availabilityWindows) {
      const wStart = new Date(Math.max(w.start.getTime(), new Date(timeMinISO).getTime()));
      const wEnd = new Date(Math.min(w.end.getTime(), new Date(timeMaxISO).getTime()));
      if (!(wStart < wEnd)) continue;

      const candidates = alignSlots(wStart, wEnd, slotMinutes);
      for (const s of candidates) {
        const conflict = busyWindows.some(b => overlaps(s.start, s.end, b.start, b.end));
        if (!conflict) outSlots.push({ start: toISO(s.start), end: toISO(s.end) });
      }
    }

    outSlots.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

    return NextResponse.json({
      studioId: studio.id,
      timezone,
      slotDurationMinutes: slotMinutes,
      window: {
        timeMin: new Date(timeMinISO).toLocaleString("sv-SE", { timeZone: "UTC" }),
        timeMax: new Date(timeMaxISO).toLocaleString("sv-SE", { timeZone: "UTC" }),
      },
      slots: outSlots,
      meta: {
        availabilityCalendarId,
        bookingCalendarId,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Availability POST error:", err);
    return NextResponse.json(
      { error: "Failed to compute availability.", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
