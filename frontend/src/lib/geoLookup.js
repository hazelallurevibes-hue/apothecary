/** Free OpenStreetMap Nominatim helpers for practice location (no API key). */

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const UA = 'HazelAllureApothecary/1.0 (practice-location; hazelallurevibes@gmail.com)';

async function nominatimFetch(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
    },
  });
  if (!res.ok) throw new Error(`Location lookup failed (${res.status})`);
  return res.json();
}

/** Reverse geocode lat/lng → city, state, country, postal */
export async function reverseGeocode(lat, lon) {
  const url = `${NOMINATIM}/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
  const data = await nominatimFetch(url);
  const a = data?.address || {};
  return {
    city: a.city || a.town || a.village || a.municipality || a.county || '',
    state: a.state || a.region || a.province || '',
    zip: a.postcode || '',
    region: a.country || a.country_code?.toUpperCase() || '',
    street_address: [a.road, a.house_number].filter(Boolean).join(' ') || '',
    display_name: data?.display_name || '',
  };
}

/** Forward geocode free-text place → first match coords + address bits */
export async function forwardGeocode(query) {
  const q = (query || '').trim();
  if (q.length < 2) throw new Error('Enter a city and region (or postal code) first.');
  const url = `${NOMINATIM}/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(q)}`;
  const rows = await nominatimFetch(url);
  if (!rows?.length) throw new Error('No match for that place — try City, State or a postal code.');
  const hit = rows[0];
  const a = hit.address || {};
  return {
    latitude: Number(hit.lat),
    longitude: Number(hit.lon),
    city: a.city || a.town || a.village || a.municipality || '',
    state: a.state || a.region || a.province || '',
    zip: a.postcode || '',
    region: a.country || '',
    display_name: hit.display_name || '',
  };
}

export function geolocationErrorMessage(err) {
  if (!err) return 'Could not detect location.';
  if (err.code === 1) {
    return 'Location permission denied. Allow location for this site, or use city/region search below.';
  }
  if (err.code === 2) {
    return 'Position unavailable. Try city + state search instead.';
  }
  if (err.code === 3) {
    return 'Location timed out. Try again or search by city and state.';
  }
  return err.message || 'Could not detect location. Enter city and state for text search.';
}
