import { Link } from 'react-router-dom';
import { useLocale } from '../i18n';
import { PRO_VENDOR_BENEFIT_CARDS } from '../lib/proBenefitHub';
import { STOREFRONT_SETTINGS_PATH } from '../lib/profileRoutes';

const QUICK_IDS = ['listings', 'teaching', 'storefront', 'campaigns', 'analytics', 'lounge'];

/** Clean active-Pro vendor strip — tools only, no upgrade ads. */
export default function ProVendorActiveStrip({ compact = false }) {
  const { t } = useLocale();
  const quickCards = PRO_VENDOR_BENEFIT_CARDS.filter((c) => QUICK_IDS.includes(c.id));

  if (compact) {
    return (
      <div className="mb-4 rounded-2xl border border-[#c9a227]/35 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#c9a227]">Pro Practitioner</p>
            <p className="text-sm text-gray-600 mt-0.5">Your Pro tools are active</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={STOREFRONT_SETTINGS_PATH}
              className="shrink-0 px-3 py-1.5 border border-[#4a1942]/20 rounded-xl text-xs font-semibold text-[#4a1942] hover:bg-[#faf7f9]"
            >
              Storefront
            </Link>
            <Link
              to="/account-settings"
              className="shrink-0 px-3 py-1.5 text-xs font-medium text-gray-600 underline"
            >
              Manage billing
            </Link>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickCards.map((card) => (
            <Link
              key={card.id}
              to={card.to}
              className="text-xs px-3 py-1.5 rounded-full border border-[#4a1942]/12 bg-[#faf7f9] text-[#4a1942] hover:border-[#c9a227]/50 font-medium"
            >
              {card.icon} {t(card.titleKey)}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="mb-8 rounded-3xl border border-[#c9a227]/30 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-[10px] font-mono tracking-[2.5px] uppercase text-[#c9a227] mb-2">Pro · Active</p>
          <h2 className="text-2xl font-semibold heading-font text-[#4a1942]">Your practice tools</h2>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Jump into listings, Teaching Sanctum, storefront, and campaigns. Cancel anytime from Account Settings — your store reverts to free limits.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            to="/vendor-dashboard"
            className="inline-flex px-5 py-2.5 bg-[#4a1942] text-white rounded-2xl text-sm font-semibold hover:bg-[#3d1536]"
          >
            Dashboard
          </Link>
          <Link
            to={STOREFRONT_SETTINGS_PATH}
            className="inline-flex px-5 py-2.5 border border-[#4a1942]/25 rounded-2xl text-sm font-semibold text-[#4a1942] hover:bg-[#faf7f9]"
          >
            Preview &amp; edit store
          </Link>
        </div>
      </div>
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRO_VENDOR_BENEFIT_CARDS.slice(0, 6).map((card) => (
          <li key={card.id}>
            <Link
              to={card.to}
              className="flex items-start gap-2 text-sm text-gray-700 bg-[#faf7f9]/80 border border-[#4a1942]/8 rounded-2xl px-3 py-2.5 hover:border-[#c9a227]/40 hover:shadow-sm transition h-full"
            >
              <span className="shrink-0" aria-hidden>{card.icon}</span>
              <span className="font-medium text-[#4a1942]">{t(card.titleKey)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
