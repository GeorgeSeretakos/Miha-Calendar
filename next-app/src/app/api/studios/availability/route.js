export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { getValidAccessToken, ReconnectRequiredError } from "@lib/getValidAccessToken";
import { resolveCalendarIdByName, listEvents, freeBusy } from "@lib/googleCalendar";
import { alignSlots, toISO } from "@lib/slots";

// strict overlap: adjacent is allowed
function overlapsStrict(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

// day string (YYYY-MM-DD) for a Date as seen in a given IANA timezone
function ymdInTz(date, tz) {
  return new Date(date).toLocaleString("sv-SE", { timeZone: tz }).slice(0, 10);
}

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

    // ---- Wide fetch window to avoid server-TZ clipping ----
    // Base on UTC midnight of requested day, then expand: [-12h, +36h]
    const dayStartUTC = new Date(`${day}T00:00:00Z`);
    const timeMin = new Date(dayStartUTC.getTime() - 12 * 60 * 60 * 1000);
    const timeMax = new Date(dayStartUTC.getTime() + 36 * 60 * 60 * 1000);
    const timeMinISO = timeMin.toISOString();
    const timeMaxISO = timeMax.toISOString();

    // 0) Google access token
    let accessToken;
    try {
      accessToken = await getValidAccessToken(studio.calendarConnection.id);
    } catch (e) {
      if (e instanceof ReconnectRequiredError) {
        return NextResponse.json({ error: "Reconnect calendar" }, { status: 401 });
      }
      return NextResponse.json({ error: "Google auth error" }, { status: 502 });
    }

    // 1) Resolve calendars
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
        prisma.studio.update({ where: { id: studio.id }, data: { availabilityCalendarId } }).catch(() => {});
      }
    } catch {
      return NextResponse.json({ error: "Failed to resolve calendars" }, { status: 502 });
    }
    const bookingCalendarId = studio.bookingCalendarId || "primary";

    // 2) Query Google: availability windows (transparent) + busy windows
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
    } catch {
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

    // Busy from active DB holds (expiresAt > now)
    try {
      const now = new Date();
      const holds = await prisma.appointmentHold.findMany({
        where: {
          studioId: studio.id,
          startISO: { lt: timeMax },
          endISO:   { gt: timeMin },
          expiresAt: { gt: now },
        },
        select: { startISO: true, endISO: true },
      });
      for (const h of holds) busyWindows.push({ start: h.startISO, end: h.endISO });
    } catch (e) {
      console.warn("holds lookup failed:", e?.message || e);
    }

    // 3) Slice into fixed slots, filter by STRICT busy overlap
    const outSlots = [];
    for (const w of availabilityWindows) {
      const candidates = alignSlots(w.start, w.end, slotMinutes);
      for (const s of candidates) {
        // Keep only slots that belong to the requested *day* in the studio timezone
        if (ymdInTz(s.start, timezone) !== day) continue;

        const conflict = busyWindows.some(b => overlapsStrict(s.start, s.end, b.start, b.end));
        if (!conflict) outSlots.push({ start: toISO(s.start), end: toISO(s.end) });
      }
    }

    outSlots.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

    // 4) Hide already-started / near-now slots for *today* (server-side)
    const nowTZ = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
    const todayYMD = ymdInTz(nowTZ, timezone);
    const GRACE_MIN = 5;
    const slots = (day === todayYMD)
      ? outSlots.filter(s => new Date(s.start) > new Date(nowTZ.getTime() + GRACE_MIN * 60 * 1000))
      : outSlots;

    return NextResponse.json({
      studioId: studio.id,
      timezone,
      slotDurationMinutes: slotMinutes,
      window: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
      },
      slots,
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
