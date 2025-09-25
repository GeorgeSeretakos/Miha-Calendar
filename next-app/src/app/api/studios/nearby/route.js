import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radiusKm = Number(searchParams.get("radiusKm") ?? 20); // default 20km
  const limit = Number(searchParams.get("limit") ?? 50);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat & lng are required numbers" }, { status: 400 });
  }

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

  return NextResponse.json({ results: rows });
}
