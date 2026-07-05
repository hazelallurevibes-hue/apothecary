import { Link } from 'react-router-dom';
import { useLocale } from '../i18n';
import {
  PRO_MEMBER_BENEFIT_CARDS,
  PRO_VENDOR_BENEFIT_CARDS,
  TIER_STYLES,
} from '../lib/proBenefitHub';

function BenefitCard({ card, t }) {
  const tier = TIER_STYLES[card.tier] || TIER_STYLES.essential;

  return (
    <Link
      to={card.to}
      className={`group relative flex flex-col rounded-3xl border-2 ${tier.border} bg-white/90 backdrop-blur-sm p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ring-1 ${tier.ring}`}
    >
      <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest text-[#4a1942]/45">
        {t(tier.badgeKey)}
      </span>
      <div className={`w-12 h-12 rounded-2xl ${tier.iconBg} flex items-center justify-center text-xl mb-4 shadow-inner`}>
        <span aria-hidden>{card.icon}</span>
      </div>
      <h3 className="text-base sm:text-lg font-semibold heading-font text-[#4a1942] pr-16">
        {t(card.titleKey)}
      </h3>
      <p className="text-sm text-gray-600 mt-2 leading-relaxed flex-1">
        {t(card.descKey)}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#4a1942] group-hover:text-[#c9a227] transition-colors">
        {t(card.ctaKey)}
        <span aria-hidden className="group-hover:translate-x-0.5 transition-transform">→</span>
      </span>
    </Link>
  );
}

export default function ProBenefitsHub({
  planType = 'customer',
  planLabel,
  onManageBilling,
  billingLoading = false,
}) {
  const { t } = useLocale();
  const isVendor = planType === 'vendor';
  const cards = isVendor ? PRO_VENDOR_BENEFIT_CARDS : PRO_MEMBER_BENEFIT_CARDS;
  const title = isVendor ? t('pro.hub.vendor.title') : t('pro.hub.member.title');
  const subtitle = isVendor ? t('pro.hub.vendor.subtitle') : t('pro.hub.member.subtitle');

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      <header className="relative overflow-hidden rounded-[2rem] border border-[#c9a227]/30 bg-gradient-to-br from-[#2d1230] via-[#4a1942] to-[#3a1335] text-white p-8 sm:p-10 mb-8 shadow-xl shadow-[#4a1942]/20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_#c9a227_0%,_transparent_55%)]" aria-hidden />
        <div className="relative">
          <p className="text-[10px] font-mono tracking-[3px] uppercase text-[#c9a227] mb-3">
            {t('pro.strip.badge')}
          </p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold heading-font tracking-tight">
                {title}
              </h1>
              <p className="text-white/75 mt-3 max-w-xl leading-relaxed text-sm sm:text-base">
                {subtitle}
              </p>
            </div>
            <div className="shrink-0 px-4 py-2 rounded-full bg-[#c9a227]/20 border border-[#c9a227]/40 text-[#e8dcc8] text-xs font-bold uppercase tracking-widest">
              {planLabel}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={billingLoading}
              onClick={onManageBilling}
              className="px-6 py-2.5 rounded-2xl bg-white/10 border border-white/25 text-sm font-semibold hover:bg-white/20 transition disabled:opacity-50"
            >
              {billingLoading ? t('pro.hub.billingLoading') : t('pro.hub.manageBilling')}
            </button>
            <Link
              to="/account-settings#billing"
              className="px-6 py-2.5 rounded-2xl bg-[#c9a227] text-[#1a0a18] text-sm font-semibold hover:bg-[#d4b04a] transition"
            >
              {t('pro.hub.accountBilling')}
            </Link>
          </div>
        </div>
      </header>

      <section aria-label={t('pro.hub.featuresHeading')}>
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-lg sm:text-xl font-semibold heading-font text-[#4a1942]">
            {t('pro.hub.featuresHeading')}
          </h2>
          <p className="text-xs text-gray-500 hidden sm:block">{t('pro.hub.featuresHint')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {cards.map((card) => (
            <BenefitCard key={card.id} card={card} t={t} />
          ))}
        </div>
      </section>

      <footer className="mt-10 rounded-3xl border border-[#c9a227]/25 bg-gradient-to-r from-[#f5f0e8] via-white to-[#4a1942]/5 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">
              {t('pro.hub.footer.badge')}
            </p>
            <p className="text-sm text-gray-600 mt-1 max-w-md">{t('pro.hub.footer.note')}</p>
          </div>
          <Link
            to={isVendor ? '/vendor-dashboard' : '/customer-portal'}
            className="shrink-0 inline-flex items-center justify-center px-8 py-3 bg-[#4a1942] text-white rounded-2xl font-semibold hover:bg-[#2d1230] transition"
          >
            {isVendor ? t('pro.hub.footer.vendorDash') : t('pro.hub.footer.memberPortal')} →
          </Link>
        </div>
      </footer>
    </div>
  );
}