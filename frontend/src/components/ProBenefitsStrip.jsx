import { Link } from 'react-router-dom';
import { useLocale } from '../i18n';
import { getCustomerContext, getVendorContext, isProPlan } from '../lib/plans';

const CUSTOMER_BENEFIT_KEYS = [
  'pro.benefit.discounts',
  'pro.benefit.courses',
  'pro.benefit.loyalty',
  'pro.benefit.express',
];

const VENDOR_BENEFIT_KEYS = [
  'pro.benefit.listings',
  'pro.benefit.teaching',
  'pro.benefit.campaigns',
  'pro.benefit.analytics',
];

export default function ProBenefitsStrip({ user, variant = 'auto', compact = false }) {
  const { t } = useLocale();
  const role = (user?.role || '').toLowerCase();
  const customerCtx = user ? getCustomerContext(user) : null;
  const vendorCtx = user ? getVendorContext(user) : null;

  let planType = 'customer';
  if (variant === 'vendor') planType = 'vendor';
  else if (variant === 'customer') planType = 'customer';
  else if (role === 'vendor' || vendorCtx?.isOwner) planType = 'vendor';
  else planType = 'customer';

  const isPro =
    planType === 'vendor'
      ? vendorCtx && isProPlan(vendorCtx.plan)
      : customerCtx && isProPlan(customerCtx.plan);

  if (isPro) return null;

  const benefitKeys = planType === 'vendor' ? VENDOR_BENEFIT_KEYS : CUSTOMER_BENEFIT_KEYS;
  const upgradePath = `/pro-upgrade?type=${planType}`;
  const title = planType === 'vendor' ? t('pro.strip.vendorTitle') : t('pro.strip.memberTitle');
  const subtitle = planType === 'vendor' ? t('pro.strip.vendorSubtitle') : t('pro.strip.memberSubtitle');
  const cta = planType === 'vendor' ? t('pro.strip.vendorCta') : t('pro.strip.memberCta');
  const priceHint = planType === 'vendor' ? t('pro.strip.vendorPrice') : t('pro.strip.memberPrice');

  if (compact) {
    return (
      <div className="mt-4 mb-2 rounded-2xl border border-[#c9a227]/30 bg-gradient-to-r from-[#4a1942]/5 to-[#f5f0e8] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#4a1942]">{title}</p>
            <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
          </div>
          <Link
            to={upgradePath}
            className="shrink-0 px-4 py-2 bg-[#4a1942] text-white rounded-xl text-sm font-medium hover:opacity-95"
          >
            {cta}
          </Link>
        </div>
        <p className="text-[10px] text-gray-500 mt-2">{t('pro.socialProof')}</p>
      </div>
    );
  }

  return (
    <section className="mb-8 rounded-3xl border border-[#c9a227]/25 bg-gradient-to-br from-[#f5f0e8] via-white to-[#4a1942]/5 p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-xl">
          <p className="text-[10px] font-mono tracking-[2.5px] uppercase text-[#c9a227] mb-2">
            {t('pro.strip.badge')}
          </p>
          <h2 className="text-2xl font-semibold heading-font text-[#4a1942]">{title}</h2>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{subtitle}</p>
          <p className="text-xs text-[#4a1942]/70 mt-3 font-medium">{t('pro.socialProof')}</p>
        </div>
        <div className="flex flex-col sm:items-end gap-3 shrink-0">
          <div className="text-sm text-gray-500">{priceHint}</div>
          <Link
            to={upgradePath}
            className="inline-flex items-center justify-center px-8 py-3 bg-[#4a1942] text-white rounded-2xl font-semibold hover:bg-[#3a1335] transition"
          >
            {cta} →
          </Link>
        </div>
      </div>
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {benefitKeys.map((key) => (
          <li
            key={key}
            className="flex items-start gap-2 text-sm text-gray-700 bg-white/80 border border-[#4a1942]/10 rounded-2xl px-3 py-2.5"
          >
            <span className="text-emerald-600 shrink-0" aria-hidden>
              ✓
            </span>
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}