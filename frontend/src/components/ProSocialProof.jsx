import { useLocale } from '../i18n';

const TESTIMONIAL_KEYS = [
  { quote: 'pro.testimonial1.quote', name: 'pro.testimonial1.name', role: 'pro.testimonial1.role' },
  { quote: 'pro.testimonial2.quote', name: 'pro.testimonial2.name', role: 'pro.testimonial2.role' },
  { quote: 'pro.testimonial3.quote', name: 'pro.testimonial3.name', role: 'pro.testimonial3.role' },
];

export default function ProSocialProof() {
  const { t } = useLocale();

  return (
    <section className="mt-8 space-y-6" aria-label={t('pro.socialProofHeading')}>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[#4a1942]">{t('pro.socialProofHeading')}</h2>
        <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">{t('pro.socialProof')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TESTIMONIAL_KEYS.map((item) => (
          <blockquote
            key={item.quote}
            className="bg-white border border-[#4a1942]/10 rounded-2xl p-4 text-left shadow-sm"
          >
            <p className="text-sm text-gray-700 leading-relaxed">&ldquo;{t(item.quote)}&rdquo;</p>
            <footer className="mt-3 text-xs text-gray-500">
              <span className="font-medium text-[#4a1942]">{t(item.name)}</span>
              <span className="block">{t(item.role)}</span>
            </footer>
          </blockquote>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-6 text-center text-sm">
        <div>
          <div className="text-xl font-bold text-[#4a1942]">{t('pro.stat1.value')}</div>
          <div className="text-xs text-gray-500">{t('pro.stat1.label')}</div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#4a1942]">{t('pro.stat2.value')}</div>
          <div className="text-xs text-gray-500">{t('pro.stat2.label')}</div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#4a1942]">{t('pro.stat3.value')}</div>
          <div className="text-xs text-gray-500">{t('pro.stat3.label')}</div>
        </div>
      </div>
    </section>
  );
}