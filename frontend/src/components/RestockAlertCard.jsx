import { Link } from 'react-router-dom';

/**
 * Lightweight “notify me / restock” education for shoppers + signal to vendors
 * that waitlist demand exists. Uses existing waitlist/product routes when present.
 */
export default function RestockAlertCard({ className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-[#4a1942]/10 bg-white p-4 flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">
          Never miss a restock
        </p>
        <p className="text-sm font-semibold text-[#4a1942]">
          Follow makers & reorder favorites in one place
        </p>
        <p className="text-[11px] text-gray-500 mt-1 max-w-md">
          Favorite a shop, then use Buy again on Orders. Vendors see demand and restock smarter —
          you get first dibs when stock returns.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          to="/top-vendors"
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
        >
          Browse makers →
        </Link>
        <Link
          to="/orders"
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4a1942]/25 text-[#4a1942]"
        >
          My orders
        </Link>
      </div>
    </div>
  );
}
