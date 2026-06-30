import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { haversineMiles, vendorLocationBlob, vendorLocationLabel } from '../lib/geoUtils';
import { formatStars } from '../lib/reviewsApi';

const RADIUS_OPTIONS = [
  { mi: 10, km: 16 },
  { mi: 25, km: 40 },
  { mi: 50, km: 80 },
  { mi: 100, km: 160 },
];

export default function VendorNearbySearch({ vendors = [], loading = false, onNearbyVendors }) {
  const [userCoords, setUserCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [radiusMi, setRadiusMi] = useState(25);
  const [textLocation, setTextLocation] = useState('');
  const [useKm, setUseKm] = useState(false);

  const locatedVendors = vendors.filter((v) => v.latitude != null && v.longitude != null);

  const nearby = userCoords
    ? locatedVendors
        .map((v) => ({
          ...v,
          distanceMi: haversineMiles(
            userCoords.lat,
            userCoords.lng,
            Number(v.latitude),
            Number(v.longitude),
          ),
        }))
        .filter((v) => v.distanceMi <= radiusMi)
        .sort((a, b) => a.distanceMi - b.distanceMi)
    : [];

  const textFiltered = !userCoords && textLocation.trim()
    ? vendors.filter((v) => vendorLocationBlob(v).includes(textLocation.trim().toLowerCase()))
    : [];

  const displayList = userCoords ? nearby : textFiltered;
  const activeFilter = userCoords || textLocation.trim();

  useEffect(() => {
    if (!onNearbyVendors) return;
    if (userCoords) {
      onNearbyVendors(nearby.map((v) => Number(v.id)));
    } else if (textLocation.trim() && textFiltered.length) {
      onNearbyVendors(textFiltered.map((v) => Number(v.id)));
    } else {
      onNearbyVendors(null);
    }
  }, [userCoords, nearby.length, textFiltered.length, textLocation, onNearbyVendors]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Location is not available in this browser. Try city or postal code search instead.');
      return;
    }
    setLocating(true);
    setLocError('');
    setTextLocation('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocError('Could not get your location. Allow location access or search by city / postal code.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  };

  const clearFilters = () => {
    setUserCoords(null);
    setTextLocation('');
    setLocError('');
  };

  const formatDistance = (mi) => (useKm ? `${(mi * 1.60934).toFixed(1)} km` : `${mi.toFixed(1)} mi`);

  return (
    <div className="mb-8 bg-white border rounded-3xl p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-1">Find practitioners near you</h2>
      <p className="text-sm text-gray-600 mb-4">
        Worldwide search — use your location or type a city, region, or postal code. No map fees, works everywhere.
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="px-4 py-2.5 bg-[#4a1942] text-white rounded-2xl text-sm font-medium disabled:opacity-60 shrink-0"
        >
          {locating ? 'Locating…' : '📍 Use my location'}
        </button>
        <input
          type="search"
          placeholder="City, region, or postal code…"
          value={textLocation}
          onChange={(e) => {
            setTextLocation(e.target.value);
            if (e.target.value.trim()) setUserCoords(null);
          }}
          className="border px-4 py-2.5 rounded-2xl text-sm flex-1 min-w-[180px]"
        />
        {userCoords && (
          <select
            value={radiusMi}
            onChange={(e) => setRadiusMi(Number(e.target.value))}
            className="border px-3 py-2 rounded-2xl text-sm"
            aria-label="Search radius"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r.mi} value={r.mi}>
                {useKm ? `Within ${r.km} km` : `Within ${r.mi} mi`}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={() => setUseKm((k) => !k)}
          className="px-3 py-2 border rounded-2xl text-xs text-gray-600 hover:border-[#4a1942]"
        >
          {useKm ? 'km' : 'mi'}
        </button>
        {activeFilter && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-3 py-2 border rounded-2xl text-xs text-gray-600 hover:border-[#4a1942]"
          >
            Clear
          </button>
        )}
      </div>

      {locError && <p className="text-xs text-amber-800 mb-3">{locError}</p>}

      {userCoords && (
        <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mb-3">
          Showing practitioners with a saved location within your radius.
          {locatedVendors.length === 0 && ' Practitioners can add coordinates in Storefront Settings.'}
        </p>
      )}

      {loading && <p className="text-sm text-gray-500">Loading practitioners…</p>}

      {!loading && userCoords && nearby.length === 0 && (
        <p className="text-sm text-gray-500">
          No practitioners with a saved location within {useKm ? `${(radiusMi * 1.60934).toFixed(0)} km` : `${radiusMi} miles`}.
          Try a larger radius or search by city name.
        </p>
      )}

      {!loading && !userCoords && textLocation && textFiltered.length === 0 && (
        <p className="text-sm text-gray-500">
          No practitioners match &ldquo;{textLocation}&rdquo;. Try a broader city or region.
        </p>
      )}

      {displayList.length > 0 && (
        <div className="space-y-2 mt-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {userCoords
              ? `${nearby.length} practitioner${nearby.length !== 1 ? 's' : ''} nearby`
              : `${textFiltered.length} match${textFiltered.length !== 1 ? 'es' : ''}`}
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
                {v.distanceMi != null && (
                  <div className="text-xs text-emerald-700">{formatDistance(v.distanceMi)}</div>
                )}
                <div className="text-amber-500 text-xs">{formatStars(v.avg_rating || 0)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}