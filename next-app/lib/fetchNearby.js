export async function fetchNearby({ lat, lng, radiusKm = 20, limit = 50 }) {
  const url = new URL("/api/studios/nearby", window.location.origin);
  url.searchParams.set("lat", lat);
  url.searchParams.set("lng", lng);
  url.searchParams.set("radiusKm", radiusKm);
  url.searchParams.set("limit", limit);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Nearby fetch failed: ${res.status}`);
  const data = await res.json();
  return data.results || [];
}
