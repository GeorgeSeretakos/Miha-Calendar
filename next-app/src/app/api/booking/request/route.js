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

function baseUrl(req) {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
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

    const timezone = studio.timezone || "Europe/Athens";
    const calendarId = studio.bookingCalendarId || "primary";

    // Re-check Google availability right now
    const fb = await freeBusy(accessToken, {
      calendarId,
      timeMinISO: new Date(startISO).toISOString(),
      timeMaxISO: new Date(endISO).toISOString(),
      timezone,
    });
    const taken = (fb.calendars?.[calendarId]?.busy || []).length > 0;
    if (taken) {
      return NextResponse.json({ ok: false, reason: "slot_taken" }, { status: 409 });
    }

    // Create a DB HOLD (5 minutes)
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MIN * 60 * 1000);
    const jti = crypto.randomUUID();
    try {
      await prisma.appointmentHold.create({
        data: {
          studioId,
          startISO: new Date(startISO),
          endISO: new Date(endISO),
          expiresAt,
          jti,
        },
      });
    } catch (e) {
      // Unique constraint => someone else is holding this slot
      if (e?.code === "P2002") {
        return NextResponse.json({ ok: false, reason: "slot_taken" }, { status: 409 });
      }
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

    // Send magic-link email to client
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
