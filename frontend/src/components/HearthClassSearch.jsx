import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublishedCourses } from '../lib/teachingPlatform';
import { haversineMiles, vendorLocationLabel } from '../lib/geoUtils';

/**
 * Class search + nearby open classes for The Hearth (seeker gathering).
 */
export default function HearthClassSearch({ user }) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [geoNote, setGeoNote] = useState('');
  const [cityHint, setCityHint] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 280);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    fetchPublishedCourses({ search: debounced })
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [debounced]);

  useEffect(() => {
    if (!navigator?.geolocation) {
      setGeoNote('Share a city below to sort nearby classes.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoNote('Sorted by distance from you.');
      },
      () => setGeoNote('Location blocked — type a city to filter nearby classes.'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }, []);

  // Optional profile city as soft hint
  useEffect(() => {
    const c = user?.city || user?.location_city || '';
    if (c && !cityHint) setCityHint(String(c));
  }, [user, cityHint]);

  const ranked = useMemo(() => {
    const q = cityHint.trim().toLowerCase();
    let list = courses.map((c) => {
      const v = c.vendors || {};
      let distanceMi = null;
      if (
        coords &&
        v.latitude != null &&
        v.longitude != null &&
        !Number.isNaN(Number(v.latitude)) &&
        !Number.isNaN(Number(v.longitude))
      ) {
        distanceMi = haversineMiles(coords.lat, coords.lng, Number(v.latitude), Number(v.longitude));
      }
      const locBlob = [v.city, v.state, v.region, v.zip, v.name].filter(Boolean).join(' ').toLowerCase();
      const cityMatch = q ? locBlob.includes(q) : false;
      return { ...c, distanceMi, cityMatch, locationLabel: vendorLocationLabel(v) };
    });

    if (q) {
      list = list.filter(
        (c) =>
          c.cityMatch ||
          c.title?.toLowerCase().includes(q) ||
          c.vendors?.name?.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      if (a.distanceMi != null && b.distanceMi != null) return a.distanceMi - b.distanceMi;
      if (a.distanceMi != null) return -1;
      if (b.distanceMi != null) return 1;
      if (a.cityMatch !== b.cityMatch) return a.cityMatch ? -1 : 1;
      return (a.title || '').localeCompare(b.title || '');
    });
    return list.slice(0, 12);
  }, [courses, coords, cityHint]);

  return (
    <section className="mb-8 rounded-3xl border-2 border-[#4a1942]/12 bg-gradient-to-br from-white via-[#faf7f5] to-[#f5f0e8] p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#c9a227] font-bold">Teaching Sanctum</p>
          <h2 className="text-xl font-bold text-[#4a1942] heading-font">Classes near you</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Search open courses · {geoNote || 'Loading nearby…'}
          </p>
        </div>
        <Link
          to="/sanctum-student-hub"
          className="text-xs font-semibold text-[#4a1942] underline shrink-0"
        >
          Full student hub →
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="flex-1 flex rounded-xl overflow-hidden border-2 border-[#4a1942] bg-white">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes, topics, teachers…"
            className="flex-1 min-w-0 px-4 py-2.5 text-sm outline-none"
            aria-label="Search classes"
          />
          <Link
            to={`/courses${search ? `?q=${encodeURIComponent(search)}` : ''}`}
            className="px-4 bg-[#4a1942] text-white text-sm font-semibold flex items-center"
          >
            Catalog
          </Link>
        </div>
        <input
          type="text"
          value={cityHint}
          onChange={(e) => setCityHint(e.target.value)}
          placeholder="City / region"
          className="sm:w-40 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white"
          aria-label="Filter by city"
        />
      </div>

      {loading && <p className="text-sm text-gray-500 py-4">Loading classes…</p>}

      {!loading && ranked.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 p-6 text-center">
          <p className="text-sm text-gray-600">
            No open classes match yet. Browse the full Teaching Sanctum catalog or check back soon.
          </p>
          <Link to="/courses" className="inline-block mt-3 text-sm font-semibold text-[#4a1942] underline">
            Open course catalog →
          </Link>
        </div>
      )}

      <ul className="space-y-2">
        {ranked.map((c) => (
          <li key={c.id}>
            <Link
              to={`/courses/${c.id}`}
              className="flex flex-wrap sm:flex-nowrap items-start gap-3 rounded-2xl border border-white bg-white/95 p-3.5 hover:border-[#c9a227]/45 hover:shadow-sm transition"
            >
              <div className="w-10 h-10 rounded-xl bg-[#4a1942]/8 flex items-center justify-center text-lg shrink-0">
                📚
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#4a1942] text-sm line-clamp-1">{c.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {c.vendors?.name || 'Practitioner'}
                  {c.locationLabel && c.locationLabel !== 'Location not listed'
                    ? ` · ${c.locationLabel}`
                    : ' · Online / location TBD'}
                </p>
                {c.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">{c.description}</p>
                )}
              </div>
              <div className="text-right shrink-0 self-center">
                <p className="text-sm font-bold text-[#4a1942]">${Number(c.price || 0).toFixed(2)}</p>
                {c.distanceMi != null && (
                  <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    ~{c.distanceMi < 10 ? c.distanceMi.toFixed(1) : Math.round(c.distanceMi)} mi
                  </p>
                )}
                {c.cityMatch && c.distanceMi == null && (
                  <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Near your area</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {ranked.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/courses"
            className="text-xs px-3 py-1.5 rounded-full border border-[#4a1942]/20 bg-white font-medium text-[#4a1942]"
          >
            All open classes
          </Link>
          <Link
            to="/sanctum-student-hub"
            className="text-xs px-3 py-1.5 rounded-full bg-[#4a1942] text-white font-medium"
          >
            Student hub tools
          </Link>
        </div>
      )}
    </section>
  );
}
