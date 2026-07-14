/** Client for Google Places (New) text search — server-proxied, cost-capped. */


let lastFetch = 0;
const MIN_INTERVAL_MS = 1200;

export async function fetchPlacesSearch({ q, lat, lng, radius = 8000 }) {
  const now = Date.now();
  if (now - lastFetch < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - (now - lastFetch)));
  }
  lastFetch = Date.now();

  const params = new URLSearchParams({
    q,
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
  });
  const res = await fetch(`/api/places-search?${params}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Places search failed');
  }
  return res.json();
}