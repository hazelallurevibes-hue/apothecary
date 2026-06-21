import { useEffect, useRef } from 'react';
import { attachPlacesAutocomplete, isGoogleMapsConfigured, loadGoogleMaps } from '../lib/googleMaps';

export default function VendorAddressFields({ vendor, onChange }) {
  const streetRef = useRef(null);
  const mapsOn = isGoogleMapsConfigured();

  useEffect(() => {
    if (!mapsOn || !streetRef.current) return;
    loadGoogleMaps()
      .then(() => {
        attachPlacesAutocomplete(streetRef.current, (place) => {
          onChange({
            street_address: place.formatted || vendor?.street_address,
            latitude: place.lat,
            longitude: place.lng,
          });
        });
      })
      .catch(() => {});
  }, [mapsOn]);

  const set = (patch) => onChange(patch);

  return (
    <div className="space-y-3 border-t pt-6 mt-6">
      <h3 className="font-semibold">Store location (for customer map search)</h3>
      <p className="text-xs text-gray-500">
        Customers find you on Top Vendors map. {mapsOn ? 'Start typing for Google address suggestions.' : 'Add VITE_GOOGLE_MAPS_API_KEY for autocomplete.'}
      </p>
      <input
        ref={streetRef}
        placeholder="Street address"
        value={vendor?.street_address || ''}
        onChange={(e) => set({ street_address: e.target.value })}
        className="w-full border p-3 rounded-2xl text-sm"
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          placeholder="City"
          value={vendor?.city || ''}
          onChange={(e) => set({ city: e.target.value })}
          className="border p-3 rounded-2xl text-sm"
        />
        <input
          placeholder="State"
          value={vendor?.state || ''}
          onChange={(e) => set({ state: e.target.value })}
          className="border p-3 rounded-2xl text-sm"
        />
        <input
          placeholder="ZIP"
          value={vendor?.zip || ''}
          onChange={(e) => set({ zip: e.target.value })}
          className="border p-3 rounded-2xl text-sm"
        />
      </div>
      {vendor?.latitude != null && vendor?.longitude != null && (
        <p className="text-xs text-emerald-700">Map pin saved — customers can find you nearby.</p>
      )}
    </div>
  );
}