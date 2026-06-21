import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  attachPlacesAutocomplete,
  getGoogleMapsApiKey,
  haversineMiles,
  isGoogleMapsConfigured,
  loadGoogleMaps,
} from '../lib/googleMaps';
import { formatStars } from '../lib/reviewsApi';

function vendorLocationLabel(v) {
  const parts = [v.city, v.state, v.zip].filter(Boolean);
  return parts.join(', ') || v.street_address || v.region || 'Location not listed';
}

export default function VendorNearbySearch({ vendors = [], loading = false }) {
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState('');
  const [center, setCenter] = useState(null);
  const [radiusMi, setRadiusMi] = useState(25);
  const [textLocation, setTextLocation] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);

  const configured = isGoogleMapsConfigured();

  useEffect(() => {
    if (!configured) return;
    loadGoogleMaps()
      .then(() => setMapsReady(true))
      .catch((e) => setMapsError(e.message));
  }, [configured]);

  useEffect(() => {
    if (!mapsReady || !inputRef.current) return;
    attachPlacesAutocomplete(inputRef.current, (place) => {
      setCenter(place);
      setTextLocation(place.formatted || '');
    });
  }, [mapsReady]);

  const locatedVendors = vendors.filter((v) => v.latitude != null && v.longitude != null);

  const nearby = center
    ? locatedVendors
        .map((v) => ({
          ...v,
          distanceMi: haversineMiles(center.lat, center.lng, Number(v.latitude), Number(v.longitude)),
        }))
        .filter((v) => v.distanceMi <= radiusMi)
        .sort((a, b) => a.distanceMi - b.distanceMi)
    : [];

  const textFiltered = !center && textLocation.trim()
    ? vendors.filter((v) => {
        const q = textLocation.trim().toLowerCase();
        const blob = [v.city, v.state, v.zip, v.street_address, v.region, v.name].join(' ').toLowerCase();
        return blob.includes(q);
      })
    : [];

  const displayList = center ? nearby : textFiltered;

  useEffect(() => {
    if (!mapsReady || !mapRef.current || !window.google?.maps) return;

    const map =
      mapInstance ||
      new window.google.maps.Map(mapRef.current, {
        center: center || { lat: 39.8283, lng: -98.5795 },
        zoom: center ? 10 : 4,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

    if (!mapInstance) setMapInstance(map);

    markers.forEach((m) => m.setMap(null));
    const next = [];

    if (center) {
      next.push(
        new window.google.maps.Marker({
          map,
          position: center,
          title: 'Your search area',
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#4a1942', fillOpacity: 1, strokeWeight: 0 },
        }),
      );
    }

    (center ? nearby : locatedVendors).forEach((v) => {
      next.push(
        new window.google.maps.Marker({
          map,
          position: { lat: Number(v.latitude), lng: Number(v.longitude) },
          title: v.name,
        }),
      );
    });

    setMarkers(next);
    if (center) {
      map.setCenter(center);
      map.setZoom(10);
    }
  }, [mapsReady, center, nearby.length, locatedVendors.length]);

  return (
    <div className="mb-8 bg-white border rounded-3xl p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-1">Find vendors near you</h2>
      <p className="text-sm text-gray-600 mb-4">
        {configured
          ? 'Search by city, ZIP, or neighborhood — powered by Google Maps.'
          : 'Search by city or ZIP. Add VITE_GOOGLE_MAPS_API_KEY for the interactive map and autocomplete.'}
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          ref={inputRef}
          type="search"
          placeholder={configured ? 'City, ZIP, or address…' : 'City or ZIP…'}
          value={textLocation}
          onChange={(e) => setTextLocation(e.target.value)}
          className="border px-4 py-2.5 rounded-2xl text-sm flex-1 min-w-[200px]"
        />
        {center && (
          <select
            value={radiusMi}
            onChange={(e) => setRadiusMi(Number(e.target.value))}
            className="border px-3 py-2 rounded-2xl text-sm"
          >
            <option value={10}>Within 10 mi</option>
            <option value={25}>Within 25 mi</option>
            <option value={50}>Within 50 mi</option>
            <option value={100}>Within 100 mi</option>
          </select>
        )}
      </div>

      {mapsError && <p className="text-xs text-amber-800 mb-3">{mapsError}</p>}

      {configured && mapsReady && (
        <div ref={mapRef} className="w-full h-56 md:h-72 rounded-2xl border mb-4 bg-gray-100" aria-label="Vendor map" />
      )}

      {!configured && (
        <div className="text-xs text-gray-500 mb-4 p-3 bg-gray-50 rounded-xl border">
          Tip: Enable Maps JavaScript API + Places API in Google Cloud, then set{' '}
          <code className="text-[#4a1942]">VITE_GOOGLE_MAPS_API_KEY</code> in Vercel.
        </div>
      )}

      {loading && <p className="text-sm text-gray-500">Loading vendors…</p>}

      {!loading && center && nearby.length === 0 && (
        <p className="text-sm text-gray-500">No vendors with map locations within {radiusMi} miles. Vendors can add their address in Storefront Settings.</p>
      )}

      {!loading && !center && textLocation && textFiltered.length === 0 && (
        <p className="text-sm text-gray-500">No vendors match &ldquo;{textLocation}&rdquo;. Try a broader search.</p>
      )}

      {displayList.length > 0 && (
        <div className="space-y-2 mt-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {center ? `${nearby.length} vendor${nearby.length !== 1 ? 's' : ''} nearby` : `${textFiltered.length} match${textFiltered.length !== 1 ? 'es' : ''}`}
          </div>
          {displayList.slice(0, 8).map((v) => (
            <Link
              key={v.id}
              to={`/vendor/${v.id}`}
              className="flex justify-between items-center p-3 border rounded-2xl hover:border-[#4a1942] text-sm"
            >
              <div>
                <div className="font-medium">{v.name}</div>
                <div className="text-xs text-gray-500">{vendorLocationLabel(v)}</div>
              </div>
              <div className="text-right shrink-0">
                {v.distanceMi != null && <div className="text-xs text-emerald-700">{v.distanceMi.toFixed(1)} mi</div>}
                <div className="text-amber-500 text-xs">{formatStars(v.avg_rating || 0)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}