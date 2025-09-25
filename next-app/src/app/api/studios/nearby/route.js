import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const DEFAULT_RADIUS_KM =
  Number(process.env.SEARCH_RADIUS_KM) > 0 ? Number(process.env.SEARCH_RADIUS_KM) : 25;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const qRadius = Number(searchParams.get("radiusKm"));
  const limit = Number(searchParams.get("limit") ?? 50);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat & lng are required numbers" }, { status: 400 });
  }

  // default από .env όταν δεν υπάρχει/είναι άκυρο το query param
  const radiusKm = Number.isFinite(qRadius) && qRadius > 0 ? qRadius : DEFAULT_RADIUS_KM;

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

  // Προαιρετικά επιστρέφουμε και τι radius χρησιμοποιήθηκε
  return NextResponse.json({ results: rows, radiusKm });
}
