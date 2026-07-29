import { Link } from 'react-router-dom';

/** Curated kit-style entry points — increases AOV via discovery. */
const KITS = [
  {
    id: 'starter-apothecary',
    title: 'Starter apothecary kit',
    blurb: 'Oils · tea · candle — build a first shelf',
    q: 'kit starter set gift',
  },
  {
    id: 'evening-wind-down',
    title: 'Evening wind-down',
    blurb: 'Lavender, chamomile, ritual calm',
    q: 'lavender chamomile sleep evening',
  },
  {
    id: 'clean-home',
    title: 'Clean home ritual',
    blurb: 'Incense, sprays, sacred space goods',
    q: 'incense cleanse spray ritual',
  },
  {
    id: 'skin-ritual',
    title: 'Skin ritual set',
    blurb: 'Balms, oils, botanical care',
    q: 'skincare balm face oil',
  },
];

export default function ProductKitsStrip({ className = '' }) {
  return (
    <section className={`mb-10 ${className}`}>
      <div className="flex items-end justify-between gap-2 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227] font-semibold">Bundles & kits</p>
          <h2 className="text-xl font-semibold heading-font text-[#4a1942]">Ready-made shelves</h2>
        </div>
        <Link to="/products" className="text-xs font-semibold text-[#4a1942] underline">
          Shop all →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {KITS.map((k) => (
          <Link
            key={k.id}
            to={`/products?q=${encodeURIComponent(k.q)}`}
            className="rounded-2xl border border-[#4a1942]/10 bg-gradient-to-br from-[#faf7f9] to-white p-4 hover:shadow-md hover:border-[#c9a227]/40 transition"
          >
            <p className="font-semibold text-sm text-[#4a1942]">{k.title}</p>
            <p className="text-[11px] text-gray-500 mt-1">{k.blurb}</p>
            <span className="inline-block mt-3 text-[11px] font-semibold text-[#c9a227]">Explore →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
