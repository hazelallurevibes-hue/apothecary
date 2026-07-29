import { Link } from 'react-router-dom';

const TIPS = [
  {
    title: 'List products first',
    body: 'Hero products with clear photos convert better than long service menus. Aim for 8–15 live goods.',
    to: '/vendor-dashboard',
    cta: 'Add products',
  },
  {
    title: 'Checkout blessings',
    body: 'Pro: offer a small blessing, charm, or sample at checkout to lift order value.',
    to: '/storefront-settings',
    cta: 'Storefront',
  },
  {
    title: 'Shelf score',
    body: 'Logo, bio, location, and product count raise trust. Improve your score weekly.',
    to: '/storefront-settings',
    cta: 'Edit store',
  },
  {
    title: 'Pro control guide',
    body: 'Plain-language map of every Pro tool — listings, campaigns, cancel anytime.',
    to: '/learn/pro-seller-control-panel',
    cta: 'Read guide',
  },
];

export default function SellerGrowthTips({ isPro = false, className = '' }) {
  return (
    <div className={`rounded-2xl border border-[#4a1942]/10 bg-white p-4 sm:p-5 mb-6 ${className}`}>
      <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">Grow your shelf</p>
      <h3 className="text-base font-semibold text-[#4a1942] mt-0.5">
        {isPro ? 'Pro seller playbook' : 'Get more from your free shop'}
      </h3>
      <ul className="mt-3 grid sm:grid-cols-2 gap-3">
        {TIPS.map((t) => (
          <li key={t.title} className="rounded-xl border border-gray-100 bg-[#faf7f9]/60 p-3">
            <p className="text-sm font-semibold text-[#4a1942]">{t.title}</p>
            <p className="text-[11px] text-gray-600 mt-1 leading-snug">{t.body}</p>
            <Link to={t.to} className="inline-block mt-2 text-[11px] font-semibold text-[#4a1942] underline">
              {t.cta} →
            </Link>
          </li>
        ))}
      </ul>
      {!isPro && (
        <Link
          to="/pro-upgrade?type=vendor&from=growth-tips"
          className="inline-flex mt-3 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
        >
          Compare Free vs Pro →
        </Link>
      )}
    </div>
  );
}
