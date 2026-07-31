import { Link } from 'react-router-dom';
import { useLocale } from '../i18n';
import { PRO_MEMBER_BENEFIT_CARDS } from '../lib/proBenefitHub';

const QUICK_IDS = ['discounts', 'courses', 'favorites', 'profile', 'gathering', 'support'];

export default function ProMemberActiveStrip({ compact = false }) {
  const { t } = useLocale();
  const quickCards = PRO_MEMBER_BENEFIT_CARDS.filter((c) => QUICK_IDS.includes(c.id));

  if (compact) {
    return (
      <div className="mt-4 mb-2 rounded-2xl border border-[#c9a227]/35 bg-gradient-to-r from-[#4a1942]/8 via-[#f5f0e8] to-[#fff9eb] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#4a1942]">
              {t('pro.strip.memberTitle')} · {t('pro.hub.footer.badge')}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">{t('pro.hub.member.subtitle')}</p>
          </div>
          <Link
            to="/sanctum-student-hub"
            className="shrink-0 px-4 py-2 border-2 border-[#c9a227]/50 bg-white text-[#4a1942] rounded-xl text-sm font-semibold hover:bg-[#fff9eb]"
          >
            Your tools →
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickCards.map((card) => (
            <Link
              key={card.id}
              to={card.to}
              className="text-xs px-3 py-1.5 rounded-full border border-[#4a1942]/15 bg-white/90 text-[#4a1942] hover:border-[#c9a227]/50"
            >
              {card.icon} {t(card.titleKey)}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="mb-8 rounded-3xl border border-[#c9a227]/30 bg-gradient-to-br from-[#f5f0e8] via-white to-[#4a1942]/5 p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-xl">
          <p className="text-[10px] font-mono tracking-[2.5px] uppercase text-[#c9a227] mb-2">
            {t('pro.strip.badge')} · {t('pro.hub.footer.badge')}
          </p>
          <h2 className="text-2xl font-semibold heading-font text-[#4a1942]">{t('pro.hub.member.title')}</h2>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{t('pro.hub.member.subtitle')}</p>
        </div>
        <Link
          to="/account-settings"
          className="inline-flex items-center justify-center px-8 py-3 border-2 border-[#c9a227]/50 bg-white text-[#4a1942] rounded-2xl font-semibold hover:bg-[#fff9eb] transition shrink-0"
        >
          Manage membership →
        </Link>
      </div>
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRO_MEMBER_BENEFIT_CARDS.slice(0, 6).map((card) => (
          <li key={card.id}>
            <Link
              to={card.to}
              className="flex items-start gap-2 text-sm text-gray-700 bg-white/90 border border-[#4a1942]/10 rounded-2xl px-3 py-2.5 hover:border-[#c9a227]/40 hover:shadow-sm transition"
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