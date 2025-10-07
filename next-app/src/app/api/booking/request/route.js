export const runtime = "nodejs";

import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { getValidAccessToken, ReconnectRequiredError } from "@lib/getValidAccessToken";
import { freeBusy } from "@lib/googleCalendar";
import { SignJWT } from "jose";
import { sendBookingConfirmationEmail } from "@lib/mailer";

const JWT_SECRET = new TextEncoder().encode(process.env.BOOKING_JWT_SECRET);
const TOKEN_TTL_MIN = 5; // 5-minute magic link
const GRACE_MIN = 5;     // don't allow booking that starts within next 5 minutes

function baseUrl(req) {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  return `https://${host}`;
}

// strict overlap: adjacent is allowed
function overlapsStrict(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { studioId, startISO, endISO, firstName, lastName, email, phone, message } = body || {};
    if (!studioId || !startISO || !endISO || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: { calendarConnection: true },
    });
    if (!studio || !studio.calendarConnection) {
      return NextResponse.json({ error: "Studio or calendar connection not found." }, { status: 404 });
    }

    const timezone = studio.timezone || "Europe/Athens";
    const calendarId = studio.bookingCalendarId || "primary";

    // Reject slots starting too soon (server-side, only for "now" day)
    const nowTZ = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
    const start = new Date(startISO);
    const end   = new Date(endISO);
    const sameDay = new Date(start).toLocaleString("sv-SE", { timeZone: timezone }).slice(0,10)
      === nowTZ.toLocaleString("sv-SE", { timeZone: timezone }).slice(0,10);
    if (sameDay) {
      const cutoff = new Date(nowTZ.getTime() + GRACE_MIN * 60 * 1000);
      if (start <= cutoff) {
        return NextResponse.json(
          { ok: false, reason: "past_or_grace", nowTZ: nowTZ.toISOString(), cutoff: cutoff.toISOString() },
          { status: 409 }
        );
      }
    }

    // Google auth just to check current conflicts
    let accessToken;
    try {
      accessToken = await getValidAccessToken(studio.calendarConnection.id);
    } catch (e) {
      if (e instanceof ReconnectRequiredError) {
        return NextResponse.json({ error: "Reconnect calendar" }, { status: 401 });
      }
      return NextResponse.json({ error: "Google auth error" }, { status: 502 });
    }

    // Re-check Google availability right now (STRICT overlap)
    const fb = await freeBusy(accessToken, {
      calendarId,
      timeMinISO: start.toISOString(),
      timeMaxISO: end.toISOString(),
      timezone,
    });

    const busyBlocks = (fb.calendars?.[calendarId]?.busy || []).map(b => ({
      start: new Date(b.start),
      end: new Date(b.end),
    }));
    const gcalOverlap = busyBlocks.some(b => overlapsStrict(start, end, b.start, b.end));
    if (gcalOverlap) {
      return NextResponse.json(
        {
          ok: false,
          reason: "google_conflict",
          busy: busyBlocks.map(b => ({ start: b.start.toISOString(), end: b.end.toISOString() })),
        },
        { status: 409 }
      );
    }

    // Create/refresh a DB HOLD (5 minutes) — prune expired row first to avoid unique conflicts
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MIN * 60 * 1000);
    const jti = crypto.randomUUID();

    try {
      await prisma.$transaction(async (tx) => {
        await tx.appointmentHold.deleteMany({
          where: {
            studioId,
            startISO: start,
            endISO: end,
            expiresAt: { lte: new Date() },
          },
        });

        await tx.appointmentHold.create({
          data: { studioId, startISO: start, endISO: end, expiresAt, jti },
        });
      });
    } catch (e) {
      if (e?.code === "P2002") {
        return NextResponse.json({ ok: false, reason: "hold_active" }, { status: 409 });
      }
      // fallback: check existing
      try {
        const existing = await prisma.appointmentHold.findUnique({
          where: { studioId_startISO_endISO: { studioId, startISO: start, endISO: end } },
          select: { expiresAt: true },
        });
        if (existing && existing.expiresAt > new Date()) {
          return NextResponse.json({ ok: false, reason: "hold_active" }, { status: 409 });
        }
      } catch (_) {}
      throw e;
    }

    // Sign 5-minute token
    const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_MIN * 60;
    const token = await new SignJWT({
      studioId, startISO, endISO, firstName, lastName, email, phone, message, timezone, jti,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(exp)
      .setIssuedAt()
      .sign(JWT_SECRET);

    const confirmUrl = `${baseUrl(req)}/api/booking/finalize?token=${encodeURIComponent(token)}`;
    const whenText = new Date(startISO).toLocaleString("el-GR", {
      timeZone: timezone, dateStyle: "medium", timeStyle: "short",
    });

    await sendBookingConfirmationEmail({
      to: email,
      studioName: studio.name,
      whenText,
      confirmUrl,
      replyTo: studio.email || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("booking/request error:", err);
    return NextResponse.json(
      { error: "Failed to send confirmation.", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
