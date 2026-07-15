import { useEffect, useState } from 'react';
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

/** Primary always-visible (like eat.bpicius Decide/Eat out) */
const PRIMARY_NAV = [
  { to: '/', label: 'Sphere', icon: '⑧' },
  { to: '/hearth-court', label: 'Court', icon: '⚖' },
  { to: '/compatibility', label: 'Harmony', icon: '💞' },
  { to: '/pathfinder', label: 'Path', icon: '🗺' },
  { to: '/dashboard', label: 'You', icon: '⭐' },
];

const MORE_NAV = [
  { to: '/dice', label: 'Dice', icon: '🎲' },
  { to: '/this-or-that', label: 'This/That', icon: '⚡' },
  { to: '/mood', label: 'Mood', icon: '🌙' },
  { to: '/before-the-storm', label: 'Storm', icon: '🕯' },
  { to: '/familiar', label: 'Familiar', icon: '🐾' },
  { to: '/cauldron', label: 'Cauldron', icon: '🔥' },
  { to: '/widget', label: 'Desk Orb', icon: '🖥' },
  { to: '/free', label: 'Free hub', icon: '🎁' },
  { to: '/guides', label: 'Guides', icon: '📖' },
  { to: '/legal', label: 'Policies', icon: '📜' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

const BOTTOM_NAV = [
  { to: '/', label: 'Sphere', icon: '⑧' },
  { to: '/hearth-court', label: 'Court', icon: '⚖' },
  { to: '/pathfinder', label: 'Path', icon: '🗺' },
  { to: '/dashboard', label: 'You', icon: '⭐' },
  { to: '/settings', label: 'More', icon: '✦' },
];

export default function Layout({ children }) {
  const { user, isPremium, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const compact = pathname === '/widget';

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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

      <header className="border-b border-[#4a1942]/10 bg-white/90 backdrop-blur-xl sticky top-0 z-40 shadow-sm shadow-[#4a1942]/5">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="shrink-0 w-10 h-10 rounded-xl border border-[#4a1942]/15 bg-white hover:bg-[#4a1942]/5 flex flex-col items-center justify-center gap-1"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className={`block w-4 h-0.5 bg-[#4a1942] transition ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block w-4 h-0.5 bg-[#4a1942] transition ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-4 h-0.5 bg-[#4a1942] transition ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>
            <Link to="/" className="flex items-center gap-2 min-w-0 group" aria-label="Magic Sanctum home">
              <SanctumLogo size={40} className="shrink-0 group-hover:scale-105 transition-transform" decorative />
              <div className="min-w-0 hidden xs:block sm:block">
                <p className="font-display font-bold text-lg text-brand-gradient leading-tight truncate">
                  {BRAND.appName}
                </p>
                <p className="text-[10px] text-[#4a1942]/50 font-mono">v{APP_VERSION}</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs shrink-0">
            {isPremium && <span className="chip-pro">Pro</span>}
            {isAdmin && <span className="chip bg-[#1a0a18] text-white">Admin</span>}
            <Link to="/dashboard" className="font-semibold text-[#4a1942]/70 hover:text-[#4a1942] hidden sm:inline">
              Dashboard
            </Link>
            <Link to="/settings" className="font-semibold text-[#4a1942]/70 hover:text-[#4a1942] hidden sm:inline">
              Settings
            </Link>
            {user ? (
              <button type="button" onClick={() => signOut()} className="text-[#4a1942]/60 hover:text-[#4a1942] font-semibold">
                Sign out
              </button>
            ) : (
              <Link to="/auth" className="btn-primary py-1.5 px-3 text-xs">
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Primary pills — always visible on md+ */}
        <nav className="max-w-3xl mx-auto px-2 pb-2 flex gap-1 overflow-x-auto">
          {PRIMARY_NAV.map((n) => (
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
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              menuOpen ? 'bg-[#4a1942] text-white border-[#4a1942]' : 'border-[#4a1942]/15 text-[#4a1942]/70'
            }`}
          >
            {menuOpen ? 'Close ▴' : 'More ▾'}
          </button>
        </nav>

        {/* Collapsible more menu */}
        {menuOpen && (
          <div className="border-t border-[#4a1942]/10 bg-white/95 max-h-[70vh] overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MORE_NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded-xl border border-[#4a1942]/10 px-3 py-2.5 text-sm font-semibold text-[#4a1942] hover:border-[#c9a227]/50 hover:bg-amber-50/50"
                >
                  <span className="mr-1.5">{n.icon}</span>
                  {n.label}
                </Link>
              ))}
              <a
                href={HAZEL_LINKS.marketplace()}
                className="rounded-xl border border-[#c9a227]/40 px-3 py-2.5 text-sm font-semibold text-[#4a1942] bg-amber-50/50 col-span-2 sm:col-span-1"
              >
                🛍 Apothecary
              </a>
              <Link
                to={HAZEL_LINKS.proExplainer('magic_general')}
                className="rounded-xl border border-[#4a1942]/20 px-3 py-2.5 text-sm font-semibold text-[#4a1942]"
              >
                ✦ Why Pro?
              </Link>
            </div>
          </div>
        )}
      </header>

      <div className="border-b border-[#c9a227]/30 bg-gradient-to-r from-amber-50/95 via-rose-50/50 to-violet-50/60">
        <p className="max-w-3xl mx-auto px-4 py-1.5 text-[11px] text-amber-950 flex flex-wrap items-center gap-x-1 gap-y-0.5">
          <span className="font-black uppercase tracking-widest text-[9px] text-orange-700">Beta</span>
          <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-white/80 border border-orange-200/80 text-[#4a1942]">
            v{APP_VERSION}
          </span>
          <Link to="/legal" className="underline font-semibold">
            policies
          </Link>
          ·
          <a href={HAZEL_LINKS.marketplace()} className="underline font-semibold text-[#4a1942]">
            apothecary
          </a>
          ·
          <Link to={HAZEL_LINKS.proExplainer('magic_general')} className="underline font-semibold">
            why pro
          </Link>
        </p>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 app-main">{children}</main>

      <footer className="hidden md:block border-t border-[#4a1942]/10 py-8 text-center text-xs text-[#4a1942]/50 space-y-4 bg-white/40 backdrop-blur">
        <p className="font-display text-sm text-[#4a1942]/70">{BRAND.tagline}</p>
        <div className="max-w-2xl mx-auto flex flex-wrap justify-center gap-x-3 gap-y-1.5 px-4">
          {TOOL_LINKS.filter((l) => !l.to.includes('?')).slice(0, 12).map((l) => (
            <Link key={l.to} to={l.to} className="underline hover:text-[#4a1942]">
              {l.emoji} {l.label}
            </Link>
          ))}
        </div>
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
                  isActive ? 'text-[#4a1942] bg-[#4a1942]/8' : 'text-[#4a1942]/55'
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
