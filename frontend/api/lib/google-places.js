const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.googleMapsUri',
  'places.primaryType',
  'places.types',
  'places.location',
  'places.currentOpeningHours',
  'places.photos',
].join(',');

export function getGoogleKey() {
  return (
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_PLACES_API_KEY
  );
}

export async function googleTextSearch({ apiKey, lat, lng, radius, textQuery, maxResultCount = 10 }) {
  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius,
        },
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Text ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  return (data.places || []).map((p) => normalizeGooglePlace(p, lat, lng));
}

export function normalizeGooglePlace(place, userLat, userLng) {
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  const name = place.displayName?.text || 'Place';
  const primaryType = place.primaryType || place.types?.[0] || 'restaurant';
  const photoName = place.photos?.[0]?.name;

  return {
    id: place.id || `g-${name}`,
    name,
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? 0,
    address: place.formattedAddress || 'Address not listed',
    amenity: formatType(primaryType),
    lat,
    lng,
    distanceMi: lat != null && lng != null ? haversineMiles(userLat, userLng, lat, lng) : null,
    openNow: place.currentOpeningHours?.openNow ?? null,
    priceLevel: priceToLevel(place.priceLevel),
    mapsUrl: place.googleMapsUri || null,
    directionsUrl:
      lat != null && lng != null
        ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        : place.googleMapsUri,
    photoUrl: photoName ? `/api/place-photo?ref=${encodeURIComponent(photoName)}` : null,
    source: 'google',
  };
}

export function sortByStars(places) {
  return [...places].sort((a, b) => {
    const ra = a.rating ?? 0;
    const rb = b.rating ?? 0;
    if (rb !== ra) return rb - ra;
    return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
  });
}

function formatType(type) {
  if (!type) return 'Place';
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function priceToLevel(priceLevel) {
  const map = {
    PRICE_LEVEL_FREE: 1,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  return map[priceLevel] ?? null;
}

function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}