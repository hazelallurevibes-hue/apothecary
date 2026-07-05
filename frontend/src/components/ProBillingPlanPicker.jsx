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
    <div className="mb-8 space-y-5">
      <p className="text-center text-sm font-medium text-[#4a1942]/70 uppercase tracking-widest">
        {t('pro.billing.choosePlan')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        {/* Monthly — default selection size */}
        <button
          type="button"
          onClick={() => onSelect('monthly')}
          aria-pressed={monthlyActive}
          className={`text-left rounded-3xl border-2 p-5 sm:p-6 transition-all ${
            monthlyActive
              ? 'border-[#4a1942] bg-white shadow-lg ring-2 ring-[#4a1942]/20 scale-[1.02]'
              : 'border-gray-200 bg-white/80 hover:border-[#4a1942]/30'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('pro.billing.monthlyLabel')}</p>
          <p className="text-3xl sm:text-4xl font-bold heading-font text-[#4a1942] mt-2">
            {formatCurrency(monthlyPrice)}
          </p>
          <p className="text-sm text-gray-600 mt-1">{t('pro.billing.perMonth')}</p>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">{t('pro.billing.monthlyHint')}</p>
        </button>

        {/* Yearly — always visually emphasized */}
        <button
          type="button"
          onClick={() => onSelect('annual')}
          aria-pressed={yearlyActive}
          className={`relative text-left rounded-3xl border-2 p-6 sm:p-8 transition-all sm:scale-[1.04] ${
            yearlyActive
              ? 'border-[#c9a227] bg-gradient-to-br from-[#fff9eb] via-white to-[#f5f0e8] shadow-xl ring-2 ring-[#c9a227]/40'
              : 'border-[#c9a227]/50 bg-gradient-to-br from-amber-50/80 to-white shadow-md hover:border-[#c9a227] hover:shadow-lg'
          }`}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs bg-[#c9a227] text-[#1a0a18] px-3 py-1 rounded-full font-bold uppercase tracking-wide shadow">
            {t('pro.billing.bestValue')}
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#4a1942]/70 mt-1">{t('pro.billing.yearlyLabel')}</p>
          <p className="text-4xl sm:text-5xl font-bold heading-font text-[#4a1942] mt-2">
            {formatCurrency(annualPrice)}
          </p>
          <p className="text-sm text-gray-700 mt-1 font-medium">
            {t('pro.billing.perYear')} · ≈ {formatCurrency(monthlyEquiv)}/{t('pro.billing.moShort')}
          </p>
          <p className="text-sm text-emerald-800 font-semibold mt-2">
            {(t('pro.billing.saveAmount') || 'Save about {amount} per year').replace('{amount}', formatCurrency(annualSavings))}
          </p>
          <p className="text-xs text-gray-600 mt-2">{t('pro.upgrade.annualNote')}</p>
        </button>
      </div>

      {!vendorOnly && (
        <div className="rounded-3xl border border-[#c9a227]/25 bg-[#faf7f9] p-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-[#4a1942] heading-font">
            {yearlyActive ? t('pro.yearlyPerksTitle') : t('pro.yearlyPerksTeaser')}
          </h3>
          <ul className="mt-3 space-y-2">
            {YEARLY_PERKS.map((key) => (
              <li key={key} className="flex gap-2 text-sm text-gray-700">
                <span className="text-[#c9a227] font-bold shrink-0" aria-hidden>✦</span>
                <span className={yearlyActive ? '' : 'opacity-90'}>{t(key)}</span>
              </li>
            ))}
          </ul>
          {!yearlyActive && (
            <button
              type="button"
              onClick={() => onSelect('annual')}
              className="mt-4 w-full sm:w-auto px-6 py-3 bg-[#4a1942] text-white rounded-2xl font-semibold text-sm hover:bg-[#2d1230] transition"
            >
              {t('pro.billing.switchYearlyCta')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}