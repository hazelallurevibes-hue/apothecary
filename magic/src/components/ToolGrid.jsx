import { Link, useNavigate } from 'react-router-dom';
import { BRAND } from '../lib/brand';
import { packStats } from '../lib/engines';
import { HAZEL_LINKS } from '../lib/hazel';

/**
 * Psychology-tinted tool cards — color cues match intended feeling per area.
 * Uses navigate() for same-route query changes (coin mode) so clicks always work.
 */
const TOOL_META = {
  sphere: {
    to: '/',
    bg: 'from-violet-50 via-white to-purple-50/80',
    border: 'border-violet-200/80 hover:border-violet-400',
    chip: 'bg-violet-100 text-violet-900',
    feel: 'Curiosity & calm focus',
  },
  coin: {
    to: '/?mode=coin',
    path: '/',
    search: '?mode=coin',
    bg: 'from-sky-50 via-white to-amber-50/70',
    border: 'border-sky-200/80 hover:border-amber-400',
    chip: 'bg-sky-100 text-sky-900',
    feel: 'Clear decision energy',
  },
  dashboard: {
    to: '/dashboard',
    bg: 'from-amber-50 via-white to-yellow-50/60',
    border: 'border-amber-200/80 hover:border-amber-400',
    chip: 'bg-amber-100 text-amber-950',
    feel: 'Personal progress',
  },
  harmony: {
    to: '/compatibility',
    bg: 'from-rose-50 via-white to-pink-50/70',
    border: 'border-rose-200/80 hover:border-rose-400',
    chip: 'bg-rose-100 text-rose-900',
    feel: 'Warm connection',
  },
  court: {
    to: '/hearth-court',
    bg: 'from-stone-50 via-white to-orange-50/50',
    border: 'border-stone-300/80 hover:border-orange-400',
    chip: 'bg-stone-200 text-stone-900',
    feel: 'Fairness & resolution',
  },
  dice: {
    to: '/dice',
    bg: 'from-teal-50 via-white to-cyan-50/60',
    border: 'border-teal-200/80 hover:border-teal-400',
    chip: 'bg-teal-100 text-teal-900',
    feel: 'Playful release',
  },
  tt: {
    to: '/this-or-that',
    bg: 'from-orange-50 via-white to-red-50/40',
    border: 'border-orange-200/80 hover:border-orange-400',
    chip: 'bg-orange-100 text-orange-950',
    feel: 'Social spark',
  },
  mood: {
    to: '/mood',
    bg: 'from-indigo-50 via-white to-blue-50/50',
    border: 'border-indigo-200/80 hover:border-indigo-400',
    chip: 'bg-indigo-100 text-indigo-900',
    feel: 'Gentle self-check',
  },
  path: {
    to: '/pathfinder',
    bg: 'from-emerald-50 via-white to-lime-50/50',
    border: 'border-emerald-200/80 hover:border-emerald-500',
    chip: 'bg-emerald-100 text-emerald-950',
    feel: 'Growth & direction',
  },
  pet: {
    to: '/familiar',
    bg: 'from-fuchsia-50 via-white to-purple-50/50',
    border: 'border-fuchsia-200/80 hover:border-fuchsia-400',
    chip: 'bg-fuchsia-100 text-fuchsia-900',
    feel: 'Whimsy & delight',
  },
  storm: {
    to: '/before-the-storm',
    bg: 'from-slate-100 via-white to-blue-50/60',
    border: 'border-slate-300/80 hover:border-slate-500',
    chip: 'bg-slate-200 text-slate-900',
    feel: 'Steady preparation',
  },
  journal: {
    to: '/cauldron',
    bg: 'from-red-50 via-white to-orange-50/40',
    border: 'border-red-200/70 hover:border-red-400',
    chip: 'bg-red-100 text-red-900',
    feel: 'Safe release',
  },
  widget: {
    to: '/widget',
    bg: 'from-zinc-100 via-white to-violet-50/50',
    border: 'border-zinc-300 hover:border-violet-400',
    chip: 'bg-zinc-200 text-zinc-900',
    feel: 'Always-on companion',
  },
  free: {
    to: '/free',
    bg: 'from-lime-50 via-white to-green-50/50',
    border: 'border-lime-200 hover:border-lime-500',
    chip: 'bg-lime-100 text-lime-950',
    feel: 'Open invitation',
  },
  guides: {
    to: '/guides',
    bg: 'from-amber-50/80 via-white to-stone-50',
    border: 'border-amber-200/70 hover:border-amber-400',
    chip: 'bg-amber-100 text-amber-950',
    feel: 'Learning & trust',
  },
};

export default function ToolGrid({ compact = false, showExternal = true }) {
  const stats = packStats();
  const nav = useNavigate();

  const tools = [
    { key: 'sphere', name: BRAND.sphere.name, emoji: BRAND.sphere.emoji, tagline: 'Ask anything — YES, NO, or MAYBE with a wink.', meta: 'Free', ...TOOL_META.sphere },
    { key: 'coin', name: BRAND.coin.name, emoji: BRAND.coin.emoji, tagline: 'Heaven YES or Ember NO — theatrical coin.', meta: 'Free', ...TOOL_META.coin },
    { key: 'court', name: BRAND.settler.name, emoji: '⚖', tagline: 'Enter two sides, vote, let the computer rule.', meta: 'Free ruling', ...TOOL_META.court },
    { key: 'harmony', name: 'Chart Harmony', emoji: '💞', tagline: 'Two birthdays · playful score with deep notes.', meta: 'Free · viral', ...TOOL_META.harmony },
    { key: 'path', name: 'Pathfinder', emoji: '🗺', tagline: 'Career & money aptitude sparks + path tips.', meta: 'Free · new', ...TOOL_META.path },
    { key: 'dice', name: 'Sanctum Dice', emoji: '🎲', tagline: 'List options — dice chooses for the group.', meta: 'Free', ...TOOL_META.dice },
    { key: 'tt', name: 'This or That', emoji: '⚡', tagline: 'Two options. Pass the phone.', meta: 'Free', ...TOOL_META.tt },
    { key: 'mood', name: 'Mood Meter', emoji: '🌙', tagline: 'Energy · peace · connection + moon phase.', meta: 'Free daily', ...TOOL_META.mood },
    { key: 'dashboard', name: 'Your dashboard', emoji: '⭐', tagline: 'Fortune, chart, history, medals.', meta: 'Sign in', ...TOOL_META.dashboard },
    { key: 'storm', name: BRAND.coach.name, emoji: '🕯', tagline: 'Pick a situation & vibe — openers for hard talks.', meta: 'Free choices · Pro deck', pro: true, ...TOOL_META.storm },
    { key: 'pet', name: BRAND.pet.name, emoji: '🐾', tagline: 'What is your familiar plotting?', meta: `${stats.petPhrases || '2k+'} · Pro`, pro: true, ...TOOL_META.pet },
    { key: 'journal', name: BRAND.journal.name, emoji: '🔥', tagline: 'Private vent journal — free forever.', meta: 'Free', ...TOOL_META.journal },
    { key: 'widget', name: 'Desk Orb', emoji: '🖥', tagline: 'Standalone companion page + downloadable HTML.', meta: 'Works offline', ...TOOL_META.widget },
    { key: 'free', name: 'Free playground', emoji: '🎁', tagline: 'All free doors + Pro value map.', meta: 'Start here', ...TOOL_META.free },
    { key: 'guides', name: 'Guides', emoji: '📖', tagline: 'Plain-language lore for every tool.', meta: 'Learn', ...TOOL_META.guides },
  ];

  return (
    <div className="space-y-3">
      <div className={`grid ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
        {tools.map((t) => (
          <Link
            key={t.key}
            to={t.to}
            onClick={(e) => {
              if (t.key === 'coin') {
                e.preventDefault();
                nav({ pathname: '/', search: 'mode=coin' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className={`relative block rounded-2xl border-2 bg-gradient-to-br ${t.bg} ${t.border} p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer min-h-[7.5rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227] focus-visible:ring-offset-2`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-display font-bold text-[#4a1942] text-lg sm:text-xl leading-snug">
                <span className="mr-2 text-2xl align-middle" aria-hidden>
                  {t.emoji}
                </span>
                {t.name}
              </p>
              {t.pro && <span className="chip-pro shrink-0">Pro</span>}
            </div>
            {!compact && (
              <p className="text-sm text-[#4a1942]/75 mt-2 leading-relaxed">{t.tagline}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${t.chip}`}>
                {t.meta}
              </span>
              <span className="text-sm font-bold text-[#4a1942]">Open →</span>
            </div>
            <p className="text-[10px] text-[#4a1942]/40 mt-2 italic">Feel: {t.feel}</p>
          </Link>
        ))}
      </div>

      {showExternal && (
        <div className="card p-4 flex flex-wrap gap-2 items-center justify-center text-sm border-[#c9a227]/30">
          <span className="font-bold text-[#4a1942]/50 uppercase tracking-wider text-[10px] w-full text-center sm:w-auto">
            Continue on Hazel Allure
          </span>
          <a href={HAZEL_LINKS.marketplace()} className="btn-secondary py-2 px-4 text-sm">
            Shop apothecary
          </a>
          <a href={HAZEL_LINKS.services()} className="btn-secondary py-2 px-4 text-sm">
            Book a reading
          </a>
          <a href={HAZEL_LINKS.courses()} className="btn-secondary py-2 px-4 text-sm">
            Courses
          </a>
          <a href={HAZEL_LINKS.proUpgrade('magic_home_grid')} className="btn-primary py-2 px-4 text-sm">
            Go Pro
          </a>
        </div>
      )}
    </div>
  );
}
