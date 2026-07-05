import { useLocale } from '../i18n';

const STAT_KEYS = [
  { value: 'pro.stat1.value', label: 'pro.stat1.label' },
  { value: 'pro.stat2.value', label: 'pro.stat2.label' },
  { value: 'pro.stat3.value', label: 'pro.stat3.label' },
  { value: 'pro.stat4.value', label: 'pro.stat4.label' },
];

const MEMBER_STAT_KEYS = [
  { value: 'pro.memberStat1.value', label: 'pro.memberStat1.label' },
  { value: 'pro.memberStat2.value', label: 'pro.memberStat2.label' },
  { value: 'pro.memberStat3.value', label: 'pro.memberStat3.label' },
  { value: 'pro.memberStat4.value', label: 'pro.memberStat4.label' },
];

export default function ProSocialProof({ memberOnly = false }) {
  const { t } = useLocale();
  const heading = memberOnly ? t('pro.socialProofHeadingMember') : t('pro.socialProofHeading');
  const blurb = memberOnly ? t('pro.socialProofMember') : t('pro.socialProof');
  const statKeys = memberOnly ? MEMBER_STAT_KEYS : STAT_KEYS;

  return (
    <section className="mt-8 space-y-6" aria-label={heading}>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[#4a1942]">{heading}</h2>
        <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">{blurb}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statKeys.map((item) => (
          <div
            key={item.value}
            className="bg-white border border-[#4a1942]/10 rounded-2xl p-4 text-center shadow-sm"
          >
            <div className="text-xl font-bold text-[#4a1942]">{t(item.value)}</div>
            <div className="text-xs text-gray-500 mt-1">{t(item.label)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}