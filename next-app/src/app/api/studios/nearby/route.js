import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Reuse Prisma across invocations (serverless-friendly)
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

const DEFAULT_RADIUS_KM =
  Number(process.env.SEARCH_RADIUS_KM) > 0 ? Number(process.env.SEARCH_RADIUS_KM) : 25;

// --- Helpers ---
function normalizeNumber(n, fallback = undefined) {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

async function queryNearby({ lat, lng, radiusKm, limit }) {
  // Haversine (km) on Postgres via $queryRaw
  const rows = await prisma.$queryRaw`
    SELECT *
    FROM (
      SELECT s.*,
        (6371 * acos(
          cos(radians(${lat})) * cos(radians(s.lat)) *
          cos(radians(s.lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(s.lat))
        )) AS distance_km
      FROM "Studio" s
      WHERE s.lat IS NOT NULL AND s.lng IS NOT NULL
    ) t
    WHERE t.distance_km <= ${radiusKm}
    ORDER BY t.distance_km ASC
    LIMIT ${limit};
  `;
  return rows;
}

// --- POST: preferred for your client ---
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    const lat = normalizeNumber(body.lat);
    const lng = normalizeNumber(body.lng);
    const limit = normalizeNumber(body.limit, 50);
    const qRadius = normalizeNumber(body.radiusKm);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "lat & lng are required numbers" }, { status: 400 });
    }

    const radiusKm = Number.isFinite(qRadius) && qRadius > 0 ? qRadius : DEFAULT_RADIUS_KM;

    const items = await queryNearby({ lat, lng, radiusKm, limit });

    // Return the shape your client expects
    return NextResponse.json({ items, radiusKm });
  } catch (err) {
    console.error("POST /api/studios/nearby failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}