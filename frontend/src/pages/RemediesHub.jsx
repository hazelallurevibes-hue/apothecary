import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MedicalResearchDisclaimer from '../components/MedicalResearchDisclaimer';
import {
  categoryLabel,
  getFreeRemedies,
  getHotRemedies,
  getRemedyCategories,
  getRemedyCount,
  searchRemedies,
} from '../lib/remedies/remedyLibrary';

export default function RemediesHub() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [tab, setTab] = useState('mixed'); // mixed | free | hot
  const categories = useMemo(() => getRemedyCategories(), []);
  const freeAll = useMemo(() => getFreeRemedies(), []);
  const hotAll = useMemo(() => getHotRemedies(), []);
  const total = getRemedyCount();

  const results = useMemo(() => {
    let list = searchRemedies(q, { category, hotOnly: tab === 'hot' });
    if (tab === 'free') list = list.filter((e) => !e.hot);
    if (tab === 'mixed' && !q && !category) {
      // Interleave free-first so users don't open to a Pro wall
      const free = list.filter((e) => !e.hot);
      const hot = list.filter((e) => e.hot);
      const out = [];
      let fi = 0;
      let hi = 0;
      while (fi < free.length || hi < hot.length) {
        for (let k = 0; k < 3 && fi < free.length; k += 1, fi += 1) out.push(free[fi]);
        if (hi < hot.length) {
          out.push(hot[hi]);
          hi += 1;
        }
      }
      return out;
    }
    // Prefer free before hot within search results
    return [...list].sort((a, b) => {
      if (!!a.hot !== !!b.hot) return a.hot ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }, [q, category, tab]);

  const freeFeatured = useMemo(() => freeAll.slice(0, 9), [freeAll]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 pb-16">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#4a1942]/60 font-semibold">Research library</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#4a1942] heading-font mt-1">
          Common concerns &amp; natural remedies
        </h1>
        <p className="text-gray-600 mt-3 max-w-2xl leading-relaxed">
          {total}+ educational monographs, free topics first — full conventional care notes, traditional approaches,
          history, and red-flag warnings without paying. Pro hot topics unlock the densest deep-dives for frequent researchers.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {freeAll.length} free monographs · {hotAll.length} Pro hot topics · Educational only, not medical advice
        </p>
      </header>

      <MedicalResearchDisclaimer className="mb-8" />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label className="flex-1">
          <span className="sr-only">Search remedies</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cold, migraine, reflux, sleep…"
            className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a1942]/30"
          />
        </label>
        <label>
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:w-48 rounded-2xl border border-gray-200 px-3 py-2.5 text-sm bg-white"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 text-xs">
        {[
          { id: 'mixed', label: 'Free + Pro mixed' },
          { id: 'free', label: `Free only (${freeAll.length})` },
          { id: 'hot', label: `Pro hot (${hotAll.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-full border font-semibold ${
              tab === t.id
                ? 'bg-[#4a1942] text-white border-[#4a1942]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!q && !category && tab !== 'hot' && (
        <section className="mb-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-bold text-[#4a1942]">Start free — full monographs</h2>
            <span className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">No paywall</span>
          </div>
          <p className="text-sm text-gray-600 mb-3 max-w-2xl">
            These open completely: conventional care notes, traditional approaches, history, and warnings — so you can
            see the quality of the library before upgrading for Pro hot topics.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {freeFeatured.map((r) => (
              <Link
                key={r.slug}
                to={`/remedies/${r.slug}`}
                className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-white p-4 hover:shadow-md transition"
              >
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Free</span>
                <p className="font-semibold text-[#4a1942] mt-1">{r.name}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                <p className="text-[10px] text-gray-400 mt-2">{r.readMinutes} min · {categoryLabel(r.category)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!q && !category && tab !== 'free' && (
        <section className="mb-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-bold text-[#4a1942]">Hot topics (Pro deep-dives)</h2>
            <Link to="/pro-upgrade?type=customer&from=remedies" className="text-xs font-medium text-[#c9a227] underline">
              Unlock with Pro
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {hotAll.slice(0, 9).map((r) => (
              <Link
                key={r.slug}
                to={`/remedies/${r.slug}`}
                className="rounded-2xl border border-[#c9a227]/40 bg-gradient-to-br from-[#faf7f0] to-white p-4 hover:shadow-md transition"
              >
                <span className="text-[10px] uppercase tracking-wider text-[#c9a227] font-semibold">Pro</span>
                <p className="font-semibold text-[#4a1942] mt-1">{r.name}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-[#4a1942] mb-3">
          {q || category ? `Results (${results.length})` : `Browse topics (${results.length})`}
        </h2>
        <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white overflow-hidden">
          {results.map((r) => (
            <li key={r.slug}>
              <Link
                to={`/remedies/${r.slug}`}
                className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-[#faf7f9] transition"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[#4a1942] text-sm sm:text-base">
                    {r.name}
                    {r.hot ? (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-[#c9a227] font-semibold">Pro</span>
                    ) : (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">Free</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {categoryLabel(r.category)} · {r.readMinutes} min read
                  </p>
                </div>
                <span className="text-[#4a1942] text-sm shrink-0" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-gray-500">No topics match. Try another search.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
