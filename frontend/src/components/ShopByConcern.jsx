import { Link } from 'react-router-dom';
import { SHOP_BY_CONCERN, shopConcernProductPath } from '../lib/shopByConcern';

/**
 * Compact concern chips + optional product hits for Amazon-style browse.
 * @param {{ items?: Array, className?: string, compact?: boolean }} props
 */
export default function ShopByConcern({ items = [], className = '', compact = true }) {
  const matchCount = (concern) => {
    if (!items?.length) return 0;
    const tokens = String(concern.productQuery || concern.title || '')
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const cat = (concern.categoryHint || '').toLowerCase();
    return items.filter((it) => {
      const blob = `${it.name || ''} ${it.description || ''} ${it.category || ''}`.toLowerCase();
      if (cat && String(it.category || '').toLowerCase().includes(cat)) return true;
      return tokens.some((t) => blob.includes(t));
    }).length;
  };

  const sampleNames = (concern, limit = 3) => {
    if (!items?.length) return [];
    const tokens = String(concern.productQuery || '')
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const cat = (concern.categoryHint || '').toLowerCase();
    return items
      .filter((it) => {
        const blob = `${it.name || ''} ${it.category || ''}`.toLowerCase();
        if (cat && String(it.category || '').toLowerCase().includes(cat)) return true;
        return tokens.some((t) => blob.includes(t));
      })
      .slice(0, limit)
      .map((it) => it.name);
  };

  return (
    <section className={`mb-6 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
        <div>
          <h2 className="text-lg font-semibold heading-font text-[#4a1942]">Shop by concern</h2>
          <p className="text-xs text-gray-500">Quick goals · educational shopping only</p>
        </div>
      </div>
      <div className={`grid gap-2 ${compact ? 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8' : 'grid-cols-2 md:grid-cols-4'}`}>
        {SHOP_BY_CONCERN.map((c) => {
          const count = matchCount(c);
          const samples = sampleNames(c);
          return (
            <Link
              key={c.id}
              to={shopConcernProductPath(c)}
              className="group rounded-xl border border-gray-200 bg-white p-2 sm:p-2.5 hover:border-[#c9a227]/60 hover:shadow-sm transition text-center sm:text-left"
            >
              <span className="text-lg sm:text-xl block" aria-hidden>
                {c.emoji}
              </span>
              <p className="font-semibold text-[#4a1942] text-[11px] sm:text-xs mt-0.5 leading-tight line-clamp-2">
                {c.title}
              </p>
              {count > 0 && (
                <p className="text-[10px] text-gray-500 mt-0.5">{count} item{count === 1 ? '' : 's'}</p>
              )}
              {samples.length > 0 && (
                <p className="hidden sm:block text-[9px] text-gray-400 mt-1 line-clamp-2 leading-snug">
                  {samples.join(' · ')}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
