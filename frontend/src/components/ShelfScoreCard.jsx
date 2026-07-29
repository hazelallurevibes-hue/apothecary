import { Link } from 'react-router-dom';
import { computeShelfScore } from '../lib/shelfScore';
import { STOREFRONT_SETTINGS_PATH } from '../lib/profileRoutes';

/** Seller shelf health score — drives better listings & trust. */
export default function ShelfScoreCard({ vendor, listingCount = 0, className = '' }) {
  if (!vendor) return null;
  const { score, tier, next } = computeShelfScore(vendor, listingCount);
  const barColor =
    score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-[#c9a227]' : score >= 50 ? 'bg-amber-500' : 'bg-rose-400';

  return (
    <div className={`rounded-2xl border border-[#4a1942]/12 bg-white p-4 sm:p-5 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">Shelf score</p>
          <p className="text-2xl font-bold text-[#4a1942] heading-font mt-0.5">
            {score}
            <span className="text-sm font-medium text-gray-500">/100 · {tier}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Higher scores usually mean more shopper trust. Improve photos, bio, location, and product count.
          </p>
        </div>
        <Link
          to={STOREFRONT_SETTINGS_PATH}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white hover:bg-[#3d1536]"
        >
          Improve store →
        </Link>
      </div>
      <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${score}%` }} />
      </div>
      {next.length > 0 && (
        <ul className="mt-3 space-y-1">
          {next.map((n) => (
            <li key={n.label} className="text-xs text-gray-600 flex gap-2">
              <span className="text-amber-600">○</span>
              <span>
                {n.label} <span className="text-gray-400">(+{n.pts})</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
