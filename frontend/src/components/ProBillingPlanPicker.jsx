import { useLocale } from '../i18n';

const YEARLY_PERKS = [
  'pro.yearlyPerk1',
  'pro.yearlyPerk2',
  'pro.yearlyPerk3',
  'pro.yearlyPerk4',
  'pro.yearlyPerk5',
];

export default function ProBillingPlanPicker({
  billingInterval,
  onSelect,
  monthlyPrice,
  annualPrice,
  annualSavings,
  vendorOnly = false,
}) {
  const { t, formatCurrency } = useLocale();
  const monthlyEquiv = (parseFloat(annualPrice) / 12).toFixed(2);

  const monthlyActive = billingInterval === 'monthly';
  const yearlyActive = billingInterval === 'annual';

  return (
    <div className="mb-8 space-y-6">
      <div className="text-center">
        <p className="text-[10px] font-mono tracking-[3px] uppercase text-[#c9a227] mb-2">
          {t('pro.billing.premiumBadge')}
        </p>
        <p className="text-sm font-medium text-[#4a1942]/70 uppercase tracking-widest">
          {t('pro.billing.choosePlan')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        <button
          type="button"
          onClick={() => onSelect('monthly')}
          aria-pressed={monthlyActive}
          className={`relative text-left rounded-[1.75rem] border-2 p-6 sm:p-7 transition-all duration-300 overflow-hidden ${
            monthlyActive
              ? 'border-[#4a1942] bg-gradient-to-br from-white via-[#faf7f9] to-[#f5f0e8] shadow-xl ring-2 ring-[#4a1942]/25 scale-[1.02]'
              : 'border-[#4a1942]/15 bg-white/90 hover:border-[#4a1942]/35 hover:shadow-lg'
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#4a1942]/5 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7f6a]">
            {t('pro.billing.tierEssential')}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-1">
            {t('pro.billing.monthlyLabel')}
          </p>
          <p className="text-3xl sm:text-4xl font-bold heading-font text-[#4a1942] mt-3">
            {formatCurrency(monthlyPrice)}
          </p>
          <p className="text-sm text-gray-600 mt-1 font-medium">{t('pro.billing.perMonth')}</p>
          <p className="text-xs text-gray-500 mt-4 leading-relaxed border-t border-[#4a1942]/8 pt-3">
            {t('pro.billing.monthlyHint')}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelect('annual')}
          aria-pressed={yearlyActive}
          className={`relative text-left rounded-[1.75rem] border-2 p-7 sm:p-9 transition-all duration-300 overflow-hidden sm:scale-[1.05] ${
            yearlyActive
              ? 'border-[#c9a227] bg-gradient-to-br from-[#fff9eb] via-white to-[#f5f0e8] shadow-2xl ring-2 ring-[#c9a227]/50'
              : 'border-[#c9a227]/45 bg-gradient-to-br from-amber-50/90 to-white shadow-lg hover:border-[#c9a227] hover:shadow-xl'
          }`}
        >
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_left,_#c9a227_0%,_transparent_60%)]" aria-hidden />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs bg-gradient-to-r from-[#c9a227] to-[#d4b896] text-[#1a0a18] px-4 py-1 rounded-full font-bold uppercase tracking-wide shadow-md z-10">
            {t('pro.billing.bestValue')}
          </span>
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b76e79] mt-2">
              {t('pro.billing.tierPremier')}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#4a1942]/70 mt-1">
              {t('pro.billing.yearlyLabel')}
            </p>
            <p className="text-4xl sm:text-5xl font-bold heading-font text-[#4a1942] mt-3">
              {formatCurrency(annualPrice)}
            </p>
            <p className="text-sm text-gray-700 mt-1 font-medium">
              {t('pro.billing.perYear')} · ≈ {formatCurrency(monthlyEquiv)}/{t('pro.billing.moShort')}
            </p>
            <p className="text-sm text-emerald-800 font-semibold mt-3">
              {(t('pro.billing.saveAmount') || 'Save about {amount} per year').replace('{amount}', formatCurrency(annualSavings))}
            </p>
            <p className="text-xs text-gray-600 mt-2">{t('pro.upgrade.annualNote')}</p>
          </div>
        </button>
      </div>

      {!vendorOnly && (
        <div className="rounded-[1.75rem] border border-[#c9a227]/30 bg-gradient-to-br from-[#faf7f9] via-white to-[#f5f0e8] p-6 sm:p-8 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-[#4a1942] heading-font">
            {yearlyActive ? t('pro.yearlyPerksTitle') : t('pro.yearlyPerksTeaser')}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {YEARLY_PERKS.map((key) => (
              <li key={key} className="flex gap-2.5 text-sm text-gray-700">
                <span className="text-[#c9a227] font-bold shrink-0" aria-hidden>✦</span>
                <span className={yearlyActive ? '' : 'opacity-90'}>{t(key)}</span>
              </li>
            ))}
          </ul>
          {!yearlyActive && (
            <button
              type="button"
              onClick={() => onSelect('annual')}
              className="mt-5 w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#4a1942] to-[#2d1230] text-white rounded-2xl font-semibold text-sm hover:opacity-95 transition shadow-md"
            >
              {t('pro.billing.switchYearlyCta')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}