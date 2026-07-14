import { useEffect, useState } from 'react';
import { fetchPlacesSearch } from '../lib/placesApi';
import { formatStars } from '../lib/reviewsApi';

export default function GooglePlacesResults({ query, coords, onPlacesChange }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(true);
  // Auto-open when user has a real query + coords (Places API New / text search)
  const [enabled, setEnabled] = useState(() => Boolean(query && String(query).trim().length >= 3));

  const q = (query || '').trim();

  useEffect(() => {
    if (!enabled || !coords || q.length < 3) {
      setPlaces([]);
      onPlacesChange?.([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchPlacesSearch({ q, lat: coords.lat, lng: coords.lng });
        if (!cancelled) {
          const list = data.places || [];
          setPlaces(list);
          setConfigured(data.configured !== false);
          onPlacesChange?.(list);
        }
      } catch {
        if (!cancelled) {
          setPlaces([]);
          onPlacesChange?.([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 700);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, q, coords?.lat, coords?.lng, onPlacesChange]);

  return (
    <div className="mt-4 pt-4 border-t border-[#c9a227]/20">
      <label className="flex items-center gap-2 text-sm cursor-pointer mb-3 text-[#4a1942]/80">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="accent-[#4a1942] rounded"
        />
        Also search wellness shops & studios nearby (Google Places)
      </label>

      {!configured && enabled && (
        <p className="text-xs text-amber-700">Google Places search is being set up.</p>
      )}

      {enabled && loading && <p className="text-sm text-gray-500">Searching places…</p>}

      {enabled && !loading && places.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#4a1942]/50">
            Nearby on Google Maps
          </p>
          {places.map((p) => (
            <a
              key={p.id}
              href={p.mapsUrl || p.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 p-3 border border-[#c9a227]/25 rounded-2xl hover:border-[#4a1942]/40 text-sm transition bg-white/60"
            >
              {p.photoUrl ? (
                <img src={p.photoUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 bg-gray-100" loading="lazy" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#f5f0e8] flex items-center justify-center text-xl shrink-0">🌿</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate text-[#4a1942]">{p.name}</div>
                <div className="text-xs truncate text-gray-500">{p.address}</div>
                <div className="flex gap-2 mt-1 text-xs">
                  {p.rating != null && (
                    <span className="text-amber-600">{formatStars(p.rating)} {p.rating.toFixed(1)}</span>
                  )}
                  {p.distanceMi != null && (
                    <span className="text-emerald-700">{p.distanceMi.toFixed(1)} mi</span>
                  )}
                </div>
              </div>
            </a>
          ))}
          <p className="text-[10px] text-gray-400">
            Google Places — only searches when enabled and you type 3+ characters.
          </p>
        </div>
      )}
    </div>
  );
}