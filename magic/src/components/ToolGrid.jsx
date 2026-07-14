import { Link } from 'react-router-dom';
import { BRAND, TOOL_LINKS } from '../lib/brand';
import { packStats } from '../lib/engines';
import { HAZEL_LINKS } from '../lib/hazel';

/**
 * Fully clickable tool directory — used on home, settings, free playground.
 */
export default function ToolGrid({ compact = false, showExternal = true }) {
  const stats = packStats();
  const tools = [
    {
      to: '/',
      name: BRAND.sphere.name,
      emoji: BRAND.sphere.emoji,
      tagline: BRAND.sphere.tagline,
      meta: 'Free',
    },
    {
      to: '/?mode=coin',
      name: BRAND.coin.name,
      emoji: BRAND.coin.emoji,
      tagline: BRAND.coin.tagline,
      meta: 'Free',
    },
    {
      to: '/dashboard',
      name: 'Your dashboard',
      emoji: '⭐',
      tagline: 'Fortune, chart, history, badges',
      meta: 'Sign in',
    },
    {
      to: '/compatibility',
      name: 'Chart harmony',
      emoji: '💞',
      tagline: 'Two birthdays · playful score',
      meta: 'Viral',
    },
    {
      to: BRAND.settler.route,
      name: BRAND.settler.name,
      emoji: BRAND.settler.emoji,
      tagline: BRAND.settler.tagline,
      meta: 'Free vote + basic AI ruling',
    },
    {
      to: '/dice',
      name: 'Sanctum Dice',
      emoji: '🎲',
      tagline: 'List options · dice decides',
      meta: 'Free · viral',
    },
    {
      to: '/this-or-that',
      name: 'This or That',
      emoji: '⚡',
      tagline: 'Two options · theatrical pick',
      meta: 'Free · pass phone',
    },
    {
      to: '/mood',
      name: 'Mood Meter',
      emoji: '🌙',
      tagline: 'Energy · peace · connection + moon',
      meta: 'Free · daily',
    },
    {
      to: BRAND.pet.route,
      name: BRAND.pet.name,
      emoji: BRAND.pet.emoji,
      tagline: BRAND.pet.tagline,
      meta: `${stats.petPhrases || '2k+'} · Pro showcase`,
      pro: true,
    },
    {
      to: BRAND.coach.route,
      name: BRAND.coach.name,
      emoji: BRAND.coach.emoji,
      tagline: BRAND.coach.tagline,
      meta: `${stats.coachEntries || '2k+'} · Pro showcase`,
      pro: true,
    },
    {
      to: BRAND.journal.route,
      name: BRAND.journal.name,
      emoji: BRAND.journal.emoji,
      tagline: BRAND.journal.tagline,
      meta: 'Free journal',
    },
    {
      to: '/widget',
      name: BRAND.widget.name,
      emoji: BRAND.widget.emoji,
      tagline: BRAND.widget.tagline,
      meta: 'Install companion',
    },
    {
      to: '/free',
      name: 'Free playground',
      emoji: '🎁',
      tagline: 'All free doors + conversion map',
      meta: 'Start here',
    },
    {
      to: '/guides',
      name: 'Sanctum guides',
      emoji: '📖',
      tagline: 'How every tool works (SEO + lore)',
      meta: 'Learn',
    },
    {
      to: '/oracle/daily',
      name: 'Daily oracle',
      emoji: '🌙',
      tagline: 'A free line for today',
      meta: 'Daily',
    },
    {
      to: '/settings',
      name: 'Settings & install',
      emoji: '⚙',
      tagline: 'Account, widget tips, app install',
      meta: 'App',
    },
    {
      to: '/legal',
      name: 'Policies',
      emoji: '📜',
      tagline: 'Entertainment disclaimers & agreements',
      meta: 'Legal',
    },
  ];

  return (
    <div className="space-y-3">
      <div className={`grid ${compact ? 'grid-cols-2' : 'sm:grid-cols-2'} gap-2.5`}>
        {tools.map((t) => (
          <Link
            key={t.to + t.name}
            to={t.to}
            className="card p-3.5 hover:-translate-y-0.5 active:translate-y-0 transition-transform group"
          >
            <p className="font-display font-bold text-[#4a1942] leading-snug group-hover:text-[#6b2d7a]">
              <span className="mr-1.5" aria-hidden>
                {t.emoji}
              </span>
              {t.name}
              {t.pro && <span className="chip-pro ml-1.5 align-middle">Pro</span>}
            </p>
            {!compact && (
              <p className="text-[11px] text-[#4a1942]/60 mt-1 leading-relaxed">{t.tagline}</p>
            )}
            <p className="text-[10px] text-[#c9a227] mt-1.5 font-bold uppercase tracking-wide flex items-center justify-between">
              <span>{t.meta}</span>
              <span className="text-[#4a1942]/35 group-hover:text-[#4a1942]">Open →</span>
            </p>
          </Link>
        ))}
      </div>

      {showExternal && (
        <div className="card p-3 flex flex-wrap gap-2 items-center justify-center text-xs">
          <span className="font-bold text-[#4a1942]/50 uppercase tracking-wider text-[10px] w-full text-center sm:w-auto">
            Hazel Allure
          </span>
          <a href={HAZEL_LINKS.marketplace()} className="btn-secondary py-1.5 px-3 text-xs">
            Shop apothecary
          </a>
          <a href={HAZEL_LINKS.services()} className="btn-secondary py-1.5 px-3 text-xs">
            Book practitioners
          </a>
          <a href={HAZEL_LINKS.proUpgrade()} className="btn-primary py-1.5 px-3 text-xs">
            Go Pro
          </a>
          <a href={HAZEL_LINKS.home()} className="underline text-[#4a1942]/60 px-1">
            Brand home
          </a>
        </div>
      )}
    </div>
  );
}

export { TOOL_LINKS };
