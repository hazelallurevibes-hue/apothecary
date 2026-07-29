import ProFeatureLink from './ProFeatureLink';

const TIPS = [
  {
    title: 'List products first',
    body: 'Hero products with clear photos convert better than long service menus. Aim for 8–15 live goods.',
    to: '/vendor-dashboard',
    cta: 'Add products',
    pro: false,
    feature: '',
  },
  {
    title: 'Checkout blessings',
    body: 'Pro: offer a small blessing, charm, or sample at checkout to lift order value.',
    to: '/storefront-settings',
    cta: 'Storefront',
    pro: true,
    feature: 'checkout_upsells',
  },
  {
    title: 'Maker Studio',
    body: 'Claims helper, harvest calendar, packing lists, wholesale & blends.',
    to: '/vendor-maker-studio',
    cta: 'Open studio',
    pro: false,
    feature: 'maker_studio',
  },
  {
    title: 'Growth Hub',
    body: 'All growth paths in one place — free tools and Pro upgrades.',
    to: '/vendor-growth',
    cta: 'Open hub',
    pro: false,
    feature: '',
  },
  {
    title: 'Pro SaaS toolkit',
    body: 'Tax pack, market day, review QR, shift notes — Pro only.',
    to: '/vendor-pro-tools',
    cta: 'Open tools',
    pro: true,
    feature: 'saas_toolkit',
  },
  {
    title: 'Subscribe & Save',
    body: 'Recurring product revenue on staples you can restock reliably.',
    to: '/vendor-dashboard',
    cta: 'Enable',
    pro: true,
    feature: 'product_subscriptions',
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
            <p className="text-sm font-semibold text-[#4a1942]">
              {t.title}
              {t.pro && !isPro && (
                <span className="ml-1 text-[10px] uppercase text-[#c9a227] font-bold">Pro</span>
              )}
            </p>
            <p className="text-[11px] text-gray-600 mt-1 leading-snug">{t.body}</p>
            <ProFeatureLink
              to={t.to}
              requiresPro={t.pro}
              isPro={isPro}
              feature={t.feature || 'pro'}
              className="inline-block mt-2 text-[11px] font-semibold text-[#4a1942] underline"
            >
              {t.pro && !isPro ? `Unlock ${t.cta}` : t.cta} →
            </ProFeatureLink>
          </li>
        ))}
      </ul>
      {!isPro && (
        <ProFeatureLink
          to="/pro-upgrade?type=vendor"
          requiresPro
          isPro={false}
          feature="pro"
          className="inline-flex mt-3 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
        >
          Compare Free vs Pro →
        </ProFeatureLink>
      )}
    </div>
  );
}
