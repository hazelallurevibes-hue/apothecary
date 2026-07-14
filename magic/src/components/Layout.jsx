import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_VERSION } from '../lib/appVersion';
import { HAZEL_LINKS } from '../lib/hazel';
import { signOut } from '../lib/auth';
import { BRAND } from '../lib/brand';

const NAV = [
  { to: '/', label: 'Sphere', icon: '⑧' },
  { to: '/hearth-court', label: 'Court', icon: '⚖' },
  { to: '/familiar', label: 'Familiar', icon: '🐾' },
  { to: '/before-the-storm', label: 'Storm', icon: '🕯' },
  { to: '/cauldron', label: 'Cauldron', icon: '🔥' },
  { to: '/free', label: 'Free', icon: '🎁' },
  { to: '/guides', label: 'Guides', icon: '📖' },
  { to: '/settings', label: 'You', icon: '⚙' },
];

export default function Layout({ children }) {
  const { user, isPremium, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const compact = pathname === '/widget';

  if (compact) {
    return <div className="min-h-screen bg-transparent">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#4a1942]/10 bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a0a18] to-[#4a1942] text-white flex items-center justify-center font-bold border border-[#c9a227]/50">
              8
            </span>
            <div className="min-w-0">
              <p className="font-display font-bold text-lg text-[#4a1942] leading-tight truncate">
                {BRAND.appName}
              </p>
              <p className="text-[10px] text-[#4a1942]/50 font-mono">
                v{APP_VERSION} · Hazel Allure
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            {isPremium && <span className="chip-pro">Pro</span>}
            {isAdmin && <span className="chip bg-[#1a0a18] text-white">Admin</span>}
            {user ? (
              <button type="button" onClick={() => signOut()} className="text-[#4a1942]/60 hover:text-[#4a1942]">
                Sign out
              </button>
            ) : (
              <a href="/auth" className="btn-primary py-1.5 px-3 text-xs">
                Sign in
              </a>
            )}
          </div>
        </div>
        <nav className="max-w-3xl mx-auto px-2 pb-2 flex gap-1 overflow-x-auto">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  isActive ? 'bg-[#4a1942] text-white' : 'text-[#4a1942]/70 hover:bg-[#4a1942]/8'
                }`
              }
            >
              <span className="mr-1">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="border-b border-amber-200/60 bg-gradient-to-r from-amber-50/90 to-rose-50/40">
        <p className="max-w-3xl mx-auto px-4 py-1.5 text-[11px] text-amber-950">
          <span className="font-black uppercase tracking-widest text-[9px] text-orange-700 mr-2">Beta</span>
          <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-orange-100 border border-orange-200/80 mr-2">
            v{APP_VERSION}
          </span>
          Entertainment only ·{' '}
          <Link to="/legal" className="underline font-semibold">
            policies
          </Link>{' '}
          ·{' '}
          <a href={HAZEL_LINKS.marketplace()} className="underline font-semibold text-[#4a1942]">
            apothecary
          </a>
        </p>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">{children}</main>

      <footer className="border-t border-[#4a1942]/10 py-6 text-center text-xs text-[#4a1942]/50 space-y-2">
        <p className="font-display text-sm text-[#4a1942]/70">Stir, breathe, receive.</p>
        <p>
          <Link to="/guides" className="underline mx-1">
            Guides
          </Link>
          <Link to="/legal" className="underline mx-1">
            Legal
          </Link>
          <Link to="/free" className="underline mx-1">
            Free playground
          </Link>
          <a href="/sitemap.xml" className="underline mx-1">
            Sitemap
          </a>
        </p>
        <p>
          © {new Date().getFullYear()} Hazel Allure ·{' '}
          <a href={HAZEL_LINKS.marketplace()} className="underline">
            Shop the apothecary
          </a>
        </p>
      </footer>
    </div>
  );
}
