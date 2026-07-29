import { Link } from 'react-router-dom';

/**
 * Concrete Pro vendor ROI — retention + conversion messaging.
 */
const PRO_LEVERS = [
  {
    title: 'Subscribe & Save on your bestsellers',
    body: 'Turn oils, teas, and staples into monthly Stripe subscriptions. Few website builders give independent makers true recurring checkout without custom code.',
    cta: 'Open POS inventory',
    to: '/vendor-dashboard',
  },
  {
    title: 'POS stock that prevents sold-out rage',
    body: 'Low-stock alerts and one-tap qty adjust reduce “I ordered what was gone” refunds and protect reviews.',
    cta: 'Manage stock',
    to: '/vendor-dashboard',
  },
  {
    title: 'Checkout blessings that lift AOV',
    body: 'Optional charms, mini blessings, or sample sachets at checkout — pure margin when shoppers say yes.',
    cta: 'Configure add-ons',
    to: '/storefront-settings',
  },
  {
    title: 'Email people who already bought',
    body: 'Campaigns to your own shoppers beat cold ads. Restock notes and seasonal kits convert warmer lists.',
    cta: 'Campaigns',
    to: '/vendor-campaigns',
  },
  {
    title: 'Unlimited shelf + Teaching Sanctum',
    body: 'No 5-item free cap. Sell courses with dual Pro/free student pricing so education feeds product sales.',
    cta: 'Teaching Sanctum',
    to: '/vendor-teaching',
  },
  {
    title: 'Team seats & storefront studio',
    body: 'Employees with permissions, banners, theme, international shop links — run a real brand, not a temporary booth.',
    cta: 'Storefront editor',
    to: '/storefront-settings',
  },
  {
    title: 'Member discounts that pull Pro seekers',
    body: 'Reward Hazel Pro shoppers and become the preferred shelf when they filter for member deals.',
    cta: 'Compare Free vs Pro',
    to: '/pro-upgrade?type=vendor&from=worth-panel',
  },
  {
    title: 'Priority trust signals',
    body: 'Permit badges, credentials, shelf score coaching, and Pro promoted placement help serious buyers choose you.',
    cta: 'Verification & growth',
    to: '/vendor-verification',
  },
];

export default function VendorProWorthPanel({ isPro = false, className = '' }) {
  return (
    <div className={`rounded-3xl border border-[#c9a227]/40 bg-gradient-to-br from-[#faf7f0] via-white to-[#f5f0e8] p-5 sm:p-6 ${className}`}>
      <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">Why Pro is worth it</p>
      <h2 className="text-xl font-bold text-[#4a1942] heading-font mt-1">
        {isPro ? 'Use every Pro lever this week' : 'Built for makers who want real revenue tools'}
      </h2>
      <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
        Free lets you start. Pro pays for itself when one Subscribe & Save customer, one campaign restock, or one
        blessing upsell covers the month — then compounds.
      </p>
      <ul className="mt-4 grid sm:grid-cols-2 gap-3">
        {PRO_LEVERS.map((item) => (
          <li key={item.title} className="rounded-2xl border border-[#4a1942]/10 bg-white/90 p-3.5">
            <p className="text-sm font-semibold text-[#4a1942]">{item.title}</p>
            <p className="text-[11px] text-gray-600 mt-1 leading-snug">{item.body}</p>
            <Link to={item.to} className="inline-block mt-2 text-[11px] font-semibold text-[#4a1942] underline">
              {item.cta} →
            </Link>
          </li>
        ))}
      </ul>
      {!isPro && (
        <Link
          to="/pro-upgrade?type=vendor&from=worth-panel"
          className="inline-flex mt-4 text-sm font-semibold px-4 py-2 rounded-full bg-[#4a1942] text-white"
        >
          See Free vs Pro →
        </Link>
      )}
    </div>
  );
}
