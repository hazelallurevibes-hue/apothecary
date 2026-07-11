import { useMemo } from 'react';
import { haversineMiles } from '../lib/geoUtils';

function buildMapUrl(markers, width = 640, height = 260) {
  if (!markers.length) return null;

  const lats = markers.map((m) => m.lat);
  const lngs = markers.map((m) => m.lng);
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  const span = Math.max(
    Math.max(...lats) - Math.min(...lats),
    Math.max(...lngs) - Math.min(...lngs),
    0.02,
  );
  const zoom = span > 0.5 ? 9 : span > 0.2 ? 10 : span > 0.08 ? 11 : 12;

  const markerStr = markers
    .slice(0, 12)
    .map((m) => `${m.lat},${m.lng},${m.color || 'lightblue1'}`)
    .join('|');

  return `https://staticmap.openstreetmap.de/staticmap.php?center=${centerLat},${centerLng}&zoom=${zoom}&size=${width}x${height}&markers=${markerStr}`;
}

export default function VendorMap({ vendors = [], places = [], userCoords, height = 260 }) {
  const markers = useMemo(() => {
    const list = [];
    if (userCoords) {
      list.push({ lat: userCoords.lat, lng: userCoords.lng, color: 'red', label: 'You' });
    }
    vendors.forEach((v) => {
      if (v.latitude != null && v.longitude != null) {
        list.push({
          lat: Number(v.latitude),
          lng: Number(v.longitude),
          color: 'lightblue1',
          label: v.name,
        });
      }
    });
    places.forEach((p) => {
      if (p.lat != null && p.lng != null) {
        list.push({ lat: p.lat, lng: p.lng, color: 'orange', label: p.name });
      }
    });
    return list;
  }, [vendors, places, userCoords]);

  const mapUrl = buildMapUrl(markers);
  if (!mapUrl) return null;

  return (
    <div className="rounded-2xl overflow-hidden border border-[#c9a227]/30 bg-[#f5f0e8] mb-4">
      <img
        src={mapUrl}
        alt="Map of nearby practitioners and places"
        className="w-full object-cover"
        style={{ height }}
        loading="lazy"
      />
      <div className="flex flex-wrap gap-3 px-3 py-2 text-[10px] text-[#4a1942]/70 bg-white border-t border-[#c9a227]/20">
        {userCoords && <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />You</span>}
        <span><span className="inline-block w-2 h-2 rounded-full bg-sky-400 mr-1" />Practitioners</span>
        {places.length > 0 && (
          <span><span className="inline-block w-2 h-2 rounded-full bg-orange-400 mr-1" />Google places</span>
        )}
      </div>
    </div>
  );
}

export function vendorsWithinRadius(vendors, coords, radiusMi = 25) {
  if (!coords) return vendors.filter((v) => v.latitude != null);
  return vendors
    .filter((v) => v.latitude != null && v.longitude != null)
    .map((v) => ({
      ...v,
      distanceMi: haversineMiles(coords.lat, coords.lng, Number(v.latitude), Number(v.longitude)),
    }))
    .filter((v) => v.distanceMi <= radiusMi);
}