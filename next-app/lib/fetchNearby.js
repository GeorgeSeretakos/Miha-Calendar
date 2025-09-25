export async function fetchNearby({ lat, lng, limit = 50, radiusKm }) {
  const res = await fetch("/api/studios/nearby", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng, limit, radiusKm }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Nearby fetch failed");
  }
  return res.json(); // can be [] or { items, radiusKm }
}
