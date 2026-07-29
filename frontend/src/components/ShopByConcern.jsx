import { Link } from 'react-router-dom';
import { SHOP_BY_CONCERN, shopConcernProductPath } from '../lib/shopByConcern';

/** Product discovery grid — educational framing, not medical claims. */
export default function ShopByConcern({ className = '' }) {
  return (
    <section className={`mb-10 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227] font-semibold">Shop the shelf</p>
          <h2 className="text-2xl font-semibold heading-font text-[#4a1942]">Shop by concern</h2>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Browse product ideas by everyday goal. Educational shopping only — not medical advice.
          </p>
        </div>
        <Link to="/products" className="text-sm font-semibold text-[#4a1942] underline">
          Full catalog →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SHOP_BY_CONCERN.map((c) => (
          <Link
            key={c.id}
            to={shopConcernProductPath(c)}
            className="group rounded-2xl border border-[#4a1942]/10 bg-white p-4 hover:border-[#c9a227]/50 hover:shadow-md transition"
          >
            <span className="text-2xl" aria-hidden>{c.emoji}</span>
            <p className="font-semibold text-[#4a1942] text-sm mt-2 group-hover:text-[#2d1230]">{c.title}</p>
            <p className="text-[11px] text-gray-500 mt-1 leading-snug">{c.blurb}</p>
            {c.remedySlug && (
              <span className="inline-block mt-2 text-[10px] text-[#4a1942]/70 underline">
                Research note →
              </span>
            )}
          </Link>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-3">
        Product links search the apothecary. For educational monographs, visit{' '}
        <Link to="/remedies" className="underline">Remedies research</Link>.
      </p>
    </section>
  );
}
