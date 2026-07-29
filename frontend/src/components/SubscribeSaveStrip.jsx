import { Link } from 'react-router-dom';

/**
 * Shopper LTV + vendor recurring revenue nudge.
 * Routes into Pro member for priority restock / early access messaging.
 */
export default function SubscribeSaveStrip({ user, className = '' }) {
  const isPro = (user?.customer_plan || '').toLowerCase() === 'paid';

  return (
    <div
      className={`rounded-2xl border border-[#4a1942]/15 bg-gradient-to-r from-[#4a1942] to-[#2d1230] text-white px-4 py-4 sm:px-5 flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#c9a227] font-semibold">
          {isPro ? 'Pro member perks' : 'Subscribe & save the shelf'}
        </p>
        <p className="text-sm font-semibold mt-0.5">
          {isPro
            ? 'Reorder faster, get early drops, and support independent makers.'
            : 'Pro members get early product drops, reorder shortcuts, and exclusive remedy research.'}
        </p>
        <p className="text-[11px] text-white/70 mt-1">
          More loyal shoppers = steadier sales for vendors. Cancel anytime from Pro settings.
        </p>
      </div>
      <Link
        to={isPro ? '/orders' : '/pro-upgrade?type=customer&from=subscribe-save'}
        className="shrink-0 text-xs font-semibold px-4 py-2 rounded-full bg-[#c9a227] text-[#2d1230] hover:bg-[#e0bc4a]"
      >
        {isPro ? 'Reorder now →' : 'See Pro Member →'}
      </Link>
    </div>
  );
}
