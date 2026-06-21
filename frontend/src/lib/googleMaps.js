const MAPS_SCRIPT_ID = 'google-maps-js';

export function getGoogleMapsApiKey() {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
}

export function isGoogleMapsConfigured() {
  return !!getGoogleMapsApiKey();
}

export function loadGoogleMaps(apiKey = getGoogleMapsApiKey()) {
  if (!apiKey) return Promise.reject(new Error('Google Maps API key not configured'));
  if (window.google?.maps) return Promise.resolve(window.google.maps);

  return new Promise((resolve, reject) => {
    if (document.getElementById(MAPS_SCRIPT_ID)) {
      const wait = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(wait);
          resolve(window.google.maps);
        }
      }, 50);
      setTimeout(() => {
        clearInterval(wait);
        reject(new Error('Google Maps failed to load'));
      }, 10000);
      return;
    }

    window.__hazelAllureMapsReady = () => {
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error('Google Maps unavailable'));
    };

    const script = document.createElement('script');
    script.id = MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&callback=__hazelAllureMapsReady`;
    script.async = true;
    script.onerror = () => reject(new Error('Could not load Google Maps'));
    document.head.appendChild(script);
  });
}

export async function geocodeAddress(address, apiKey = getGoogleMapsApiKey()) {
  if (!apiKey || !address?.trim()) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address.trim())}&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  const data = await res.json();
  const loc = data?.results?.[0]?.geometry?.location;
  if (!loc) return null;
  return { lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address };
}

export function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function attachPlacesAutocomplete(inputEl, onPlace) {
  if (!inputEl || !window.google?.maps?.places) return null;
  const ac = new window.google.maps.places.Autocomplete(inputEl, {
    types: ['(regions)'],
    fields: ['geometry', 'formatted_address', 'address_components'],
  });
  ac.addListener('place_changed', () => {
    const place = ac.getPlace();
    if (place?.geometry?.location) {
      onPlace({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        formatted: place.formatted_address || inputEl.value,
      });
    }
  });
  return ac;
}