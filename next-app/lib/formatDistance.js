export function formatDistance(km) {
  if (km == null) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${(Math.round(km * 10) / 10).toFixed(1)} km`;
}
