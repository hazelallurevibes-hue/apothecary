import { useState } from 'react';
import { vendorLocationLabel } from '../lib/geoUtils';

export default function VendorAddressFields({ vendor, onChange }) {
  const [pinning, setPinning] = useState(false);
  const [pinError, setPinError] = useState('');
  const set = (patch) => onChange(patch);

  const usePracticeLocation = () => {
    if (!navigator.geolocation) {
      setPinError('Geolocation not available — enter city and region manually.');
      return;
    }
    setPinning(true);
    setPinError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setPinning(false);
      },
      () => {
        setPinError('Could not detect location. Enter your city and region for text search instead.');
        setPinning(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  };

  const hasCoords = vendor?.latitude != null && vendor?.longitude != null;

  return (
    <div className="space-y-3 border-t pt-6 mt-6">
      <h3 className="font-semibold">Practice location (for nearby search)</h3>
      <p className="text-xs text-gray-500">
        Seekers find you by city, region, or postal code worldwide. Optional: save map coordinates for &ldquo;near me&rdquo; radius search.
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
          disabled={pinning}
          className="text-sm px-4 py-2 border rounded-2xl hover:border-[#4a1942] disabled:opacity-60"
        >
          {pinning ? 'Detecting…' : '📍 Save coordinates for near-me search'}
        </button>
        {hasCoords && (
          <button
            type="button"
            onClick={() => set({ latitude: null, longitude: null })}
            className="text-xs text-gray-500 underline"
          >
            Remove coordinates
          </button>
        )}
      </div>
      {pinError && <p className="text-xs text-amber-800">{pinError}</p>}
      {hasCoords && (
        <p className="text-xs text-emerald-700">
          Coordinates saved — seekers using &ldquo;Near me&rdquo; can find you within their radius.
          {vendor?.city && ` Listed as ${vendorLocationLabel(vendor)}.`}
        </p>
      )}
    </div>
  );
}