import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_VERSION } from '../lib/appVersion';
import { HAZEL_LINKS } from '../lib/hazel';
import { signOut } from '../lib/auth';
import { BRAND, TOOL_LINKS } from '../lib/brand';
import UpdateSplash from './UpdateSplash';
import InstallAppBanner from './InstallAppBanner';
import SanctumLogo from './SanctumLogo';
import SanctumFamiliar from './SanctumFamiliar';
import AchievementToast from './AchievementToast';

const NAV = [
  { to: '/', label: 'Sphere', icon: '⑧' },
  { to: '/dashboard', label: 'You', icon: '⭐' },
  { to: '/hearth-court', label: 'Court', icon: '⚖' },
  { to: '/dice', label: 'Dice', icon: '🎲' },
  { to: '/this-or-that', label: 'T/T', icon: '⚡' },
  { to: '/mood', label: 'Mood', icon: '🌙' },
  { to: '/familiar', label: 'Familiar', icon: '🐾' },
  { to: '/before-the-storm', label: 'Storm', icon: '🕯' },
  { to: '/cauldron', label: 'Cauldron', icon: '🔥' },
  { to: '/compatibility', label: 'Harmony', icon: '💞' },
  { to: '/widget', label: 'Desk Orb', icon: '🖥' },
  { to: '/free', label: 'Free', icon: '🎁' },
  { to: '/guides', label: 'Guides', icon: '📖' },
  { to: '/settings', label: 'More', icon: '⚙' },
];

const BOTTOM_NAV = [
  { to: '/', label: 'Sphere', icon: '⑧' },
  { to: '/hearth-court', label: 'Court', icon: '⚖' },
  { to: '/dice', label: 'Dice', icon: '🎲' },
  { to: '/widget', label: 'Orb', icon: '🖥' },
  { to: '/settings', label: 'More', icon: '✦' },
];

export default function Layout({ children }) {
  const { user, isPremium, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const compact = pathname === '/widget';

  if (compact) {
    return (
      <div className="min-h-screen bg-transparent">
        <UpdateSplash />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <UpdateSplash />
      <InstallAppBanner />
      <AchievementToast />
      <SanctumFamiliar />

      <header className="border-b border-[#4a1942]/10 bg-white/75 backdrop-blur-xl sticky top-0 z-40 shadow-sm shadow-[#4a1942]/5">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 min-w-0 group" aria-label="Magic Sanctum home">
            <SanctumLogo
              size={42}
              className="shrink-0 group-hover:scale-105 transition-transform drop-shadow-sm"
              decorative
            />
            <div className="min-w-0">
              <p className="font-display font-bold text-lg text-brand-gradient leading-tight truncate">
                {BRAND.appName}
              </p>
              <p className="text-[10px] text-[#4a1942]/50 font-mono tracking-wide">
                v{APP_VERSION} · Hazel Allure
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            {isPremium && <span className="chip-pro">Pro</span>}
            {isAdmin && <span className="chip bg-[#1a0a18] text-white">Admin</span>}
            <Link
              to="/widget"
              className="hidden sm:inline-flex text-[#4a1942]/60 hover:text-[#4a1942] font-semibold"
              title="Desk Orb companion"
            >
              Desk Orb
            </Link>
            {user ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="text-[#4a1942]/60 hover:text-[#4a1942] font-semibold"
              >
                Sign out
              </button>
            ) : (
              <Link to="/auth" className="btn-primary py-1.5 px-3 text-xs">
                Sign in
              </Link>
            )}
          </div>
        </div>
        <nav className="max-w-3xl mx-auto px-2 pb-2 gap-1 overflow-x-auto scrollbar-none hidden md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-[#4a1942] to-[#6b2d7a] text-white shadow-sm'
                    : 'text-[#4a1942]/70 hover:bg-[#4a1942]/8'
                }`
              }
            >
              <span className="mr-1">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="border-b border-[#c9a227]/30 bg-gradient-to-r from-amber-50/95 via-rose-50/50 to-violet-50/60">
        <p className="max-w-3xl mx-auto px-4 py-1.5 text-[11px] text-amber-950 flex flex-wrap items-center gap-x-1 gap-y-0.5">
          <span className="font-black uppercase tracking-widest text-[9px] text-orange-700">Beta App</span>
          <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-white/80 border border-orange-200/80 text-[#4a1942]">
            v{APP_VERSION}
          </span>
          <span className="text-amber-900/70">·</span>
          <Link to="/legal" className="underline font-semibold">
            policies
          </Link>
          <span className="text-amber-900/70">·</span>
          <Link to="/widget" className="underline font-semibold text-[#4a1942]">
            desk orb
          </Link>
          <span className="text-amber-900/70">·</span>
          <a href={HAZEL_LINKS.marketplace()} className="underline font-semibold text-[#4a1942]">
            apothecary
          </a>
          <span className="text-amber-900/70">·</span>
          <a href={HAZEL_LINKS.proUpgrade()} className="underline font-semibold text-[#4a1942]">
            go pro
          </a>
        </p>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 app-main">{children}</main>

      <footer className="hidden md:block border-t border-[#4a1942]/10 py-8 text-center text-xs text-[#4a1942]/50 space-y-4 bg-white/40 backdrop-blur">
        <div className="flex justify-center">
          <SanctumLogo size={48} decorative />
        </div>
        <p className="font-display text-sm text-[#4a1942]/70">{BRAND.tagline}</p>
        <div className="max-w-2xl mx-auto flex flex-wrap justify-center gap-x-3 gap-y-1.5 px-4">
          {TOOL_LINKS.filter((l) => !l.to.includes('?')).map((l) => (
            <Link key={l.to} to={l.to} className="underline hover:text-[#4a1942]">
              {l.emoji} {l.label}
            </Link>
          ))}
          <Link to="/?mode=coin" className="underline hover:text-[#4a1942]">
            🪙 Coin flip
          </Link>
        </div>
        <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          <a href={HAZEL_LINKS.marketplace()} className="underline font-semibold text-[#4a1942]/70">
            Shop apothecary
          </a>
          <a href={HAZEL_LINKS.services()} className="underline">
            Book practitioners
          </a>
          <a href={HAZEL_LINKS.courses()} className="underline">
            Courses
          </a>
          <a href={HAZEL_LINKS.proUpgrade()} className="underline font-semibold text-[#4a1942]/70">
            Become Pro
          </a>
          <a href={HAZEL_LINKS.brandSite()} className="underline">
            hazelallure.com
          </a>
          <a href="/sitemap.xml" className="underline">
            Sitemap
          </a>
        </p>
        <p>
          © {new Date().getFullYear()} Hazel Allure LLC · Entertainment only · v{APP_VERSION}
        </p>
      </footer>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 app-bottom-nav" aria-label="Primary">
        <div className="max-w-3xl mx-auto flex items-stretch justify-around px-1 pt-1.5 pb-1">
          {BOTTOM_NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[3.5rem] px-2 py-1 rounded-xl text-[10px] font-bold transition ${
                  isActive
                    ? 'text-[#4a1942] bg-[#4a1942]/8'
                    : 'text-[#4a1942]/55 hover:text-[#4a1942]'
                }`
              }
            >
              <span className="text-lg leading-none mb-0.5" aria-hidden>
                {n.icon}
              </span>
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
