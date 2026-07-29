import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MedicalResearchDisclaimer from '../components/MedicalResearchDisclaimer';
import {
  categoryLabel,
  getRemedyCategories,
  getRemedyCount,
  getHotRemedies,
  searchRemedies,
} from '../lib/remedies/remedyLibrary';

export default function RemediesHub() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const categories = useMemo(() => getRemedyCategories(), []);
  const results = useMemo(() => searchRemedies(q, { category }), [q, category]);
  const hot = useMemo(() => getHotRemedies(), []);
  const total = getRemedyCount();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 pb-16">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#4a1942]/60 font-semibold">Research library</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#4a1942] heading-font mt-1">
          Common concerns &amp; natural remedies
        </h1>
        <p className="text-gray-600 mt-3 max-w-2xl leading-relaxed">
          {total}+ educational monographs covering what clinical care often involves, traditional natural approaches,
          historical accounts, and clear stop-and-seek-care warnings. Built to help you research wisely — then talk to a
          real clinician.
        </p>
      </header>

      <MedicalResearchDisclaimer className="mb-8" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
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

      {!q && !category && (
        <section className="mb-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-bold text-[#4a1942]">Hot topics (Pro deep-dives)</h2>
            <Link to="/pro-upgrade?type=customer&from=remedies" className="text-xs font-medium text-[#c9a227] underline">
              Unlock with Pro
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {hot.map((r) => (
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
          {q || category ? `Results (${results.length})` : `All topics (${results.length})`}
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
                    {r.hot && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-[#c9a227] font-semibold">Pro</span>
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

      <div className="mt-10 grid sm:grid-cols-3 gap-3 text-sm">
        <Link to="/products" className="rounded-2xl border border-gray-200 p-4 hover:border-[#4a1942]/30">
          <p className="font-semibold text-[#4a1942]">Shop apothecary</p>
          <p className="text-xs text-gray-500 mt-1">Herbs, teas, oils from independent makers</p>
        </Link>
        <Link to="/services" className="rounded-2xl border border-gray-200 p-4 hover:border-[#4a1942]/30">
          <p className="font-semibold text-[#4a1942]">Book a practitioner</p>
          <p className="text-xs text-gray-500 mt-1">Herbalists, homeopaths, energy workers</p>
        </Link>
        <Link to="/learn" className="rounded-2xl border border-gray-200 p-4 hover:border-[#4a1942]/30">
          <p className="font-semibold text-[#4a1942]">Wellness guides</p>
          <p className="text-xs text-gray-500 mt-1">How to choose practitioners wisely</p>
        </Link>
      </div>

      <MedicalResearchDisclaimer variant="footer" className="mt-10" />
    </div>
  );
}
