import { useState } from 'react';
import { vendorLocationLabel } from '../lib/geoUtils';
import { forwardGeocode, geolocationErrorMessage, reverseGeocode } from '../lib/geoLookup';

export default function VendorAddressFields({ vendor, onChange }) {
  const [pinning, setPinning] = useState(false);
  const [searching, setSearching] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinOk, setPinOk] = useState('');
  const set = (patch) => onChange(patch);

  const usePracticeLocation = () => {
    if (!navigator.geolocation) {
      setPinError('Geolocation not available in this browser — use city/region search below.');
      return;
    }
    setPinning(true);
    setPinError('');
    setPinOk('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        try {
          const place = await reverseGeocode(latitude, longitude);
          onChange({
            latitude,
            longitude,
            city: place.city || vendor?.city || '',
            state: place.state || vendor?.state || '',
            zip: place.zip || vendor?.zip || '',
            region: place.region || vendor?.region || '',
            street_address: place.street_address || vendor?.street_address || '',
          });
          setPinOk(place.display_name ? `Pinned near ${place.display_name}` : 'Coordinates saved.');
        } catch {
          onChange({ latitude, longitude });
          setPinOk('Coordinates saved. Fill city/region if empty so seekers can find you by text.');
        }
        setPinning(false);
      },
      (err) => {
        setPinError(geolocationErrorMessage(err));
        setPinning(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 },
    );
  };

  const searchPlace = async () => {
    const bits = [vendor?.city, vendor?.state, vendor?.zip, vendor?.region].filter(Boolean).join(', ');
    if (!bits && !vendor?.street_address) {
      setPinError('Enter city and state (or postal code), then click Search place.');
      return;
    }
    setSearching(true);
    setPinError('');
    setPinOk('');
    try {
      const q = [vendor?.street_address, bits].filter(Boolean).join(', ');
      const place = await forwardGeocode(q || bits);
      onChange({
        latitude: place.latitude,
        longitude: place.longitude,
        city: place.city || vendor?.city || '',
        state: place.state || vendor?.state || '',
        zip: place.zip || vendor?.zip || '',
        region: place.region || vendor?.region || '',
      });
      setPinOk(place.display_name ? `Matched: ${place.display_name}` : 'Coordinates saved from search.');
    } catch (e) {
      setPinError(e.message || 'Search failed.');
    }
    setSearching(false);
  };

  const hasCoords = vendor?.latitude != null && vendor?.longitude != null;

  return (
    <div className="space-y-3 border-t pt-6 mt-6">
      <h3 className="font-semibold">Practice location (for nearby search)</h3>
      <p className="text-xs text-gray-500">
        Seekers find you by city, region, or postal code. Optional map coordinates power &ldquo;near me&rdquo; radius search.
        If GPS is blocked, type your city + state and use Search place.
      </p>
      <input
        placeholder="Street address (optional)"
        value={vendor?.street_address || ''}
        onChange={(e) => set({ street_address: e.target.value })}
        className="w-full border p-3 rounded-2xl text-sm"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          placeholder="City"
          value={vendor?.city || ''}
          onChange={(e) => set({ city: e.target.value })}
          className="border p-3 rounded-2xl text-sm"
        />
        <input
          placeholder="State / province / region"
          value={vendor?.state || ''}
          onChange={(e) => set({ state: e.target.value })}
          className="border p-3 rounded-2xl text-sm"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          placeholder="Postal code"
          value={vendor?.zip || ''}
          onChange={(e) => set({ zip: e.target.value })}
          className="border p-3 rounded-2xl text-sm"
        />
        <input
          placeholder="Country / market region"
          value={vendor?.region || ''}
          onChange={(e) => set({ region: e.target.value })}
          className="border p-3 rounded-2xl text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={usePracticeLocation}
          disabled={pinning || searching}
          className="text-sm px-4 py-2 border rounded-2xl hover:border-[#4a1942] disabled:opacity-60"
        >
          {pinning ? 'Detecting…' : '📍 Use my GPS location'}
        </button>
        <button
          type="button"
          onClick={searchPlace}
          disabled={pinning || searching}
          className="text-sm px-4 py-2 border rounded-2xl bg-[#faf7f9] hover:border-[#4a1942] disabled:opacity-60"
        >
          {searching ? 'Searching…' : '🔎 Search place from city/region'}
        </button>
        {hasCoords && (
          <button
            type="button"
            onClick={() => {
              set({ latitude: null, longitude: null });
              setPinOk('');
            }}
            className="text-xs text-gray-500 underline"
          >
            Remove coordinates
          </button>
        )}
      </div>
      {pinError && <p className="text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">{pinError}</p>}
      {pinOk && <p className="text-xs text-emerald-800">{pinOk}</p>}
      {hasCoords && (
        <p className="text-xs text-emerald-700">
          Coordinates saved ({Number(vendor.latitude).toFixed(4)}, {Number(vendor.longitude).toFixed(4)})
          {vendor?.city ? ` — listed as ${vendorLocationLabel(vendor)}` : ''}.
        </p>
      )}
    </div>
  );
}
