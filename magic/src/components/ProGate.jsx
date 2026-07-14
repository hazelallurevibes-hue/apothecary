import { Link } from 'react-router-dom';
import { HAZEL_LINKS } from '../lib/hazel';
import { useAuth } from '../context/AuthContext';
import { magicCanPeek } from '../lib/plans';

/**
 * Pro gate with optional free sneak-peek mode.
 * If feature allows freePeek, render children with peek=true instead of hard lock.
 */
export default function ProGate({ featureId, children, teaser, allowPeek = true }) {
  const { user, isPremium } = useAuth();
  const access = magicCanPeek(user, featureId);

  if (access.full) {
    return typeof children === 'function' ? children({ peek: false, isPremium: true }) : children;
  }

  if (allowPeek && access.peek) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#c9a227]/45 bg-gradient-to-br from-amber-50/90 via-white to-rose-50/60 px-4 py-3.5 text-xs text-[#4a1942]/85 shadow-sm">
          <p className="font-black uppercase tracking-[0.2em] text-[9px] text-[#c9a227] mb-1">
            Free showcase · not a tease
          </p>
          <p className="leading-relaxed">
            {teaser ||
              'Enjoy a complete, beautiful sample of this Pro tool. Pro unlocks the full library, multi-cards, live modes, and endless freshness.'}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {!user ? (
              <>
                <Link to="/auth" className="btn-primary text-xs py-1.5 px-3">
                  Sign in
                </Link>
                <a href={HAZEL_LINKS.signup()} className="btn-secondary text-xs py-1.5 px-3">
                  Join free
                </a>
              </>
            ) : (
              <a href={HAZEL_LINKS.proUpgrade()} className="btn-gold text-xs py-1.5 px-3">
                Unlock full Pro library
              </a>
            )}
            <Link to="/free" className="btn-secondary text-xs py-1.5 px-3">
              Free playground
            </Link>
            <Link to="/guides" className="text-xs underline py-1.5 px-1 text-[#4a1942]/60">
              Guides
            </Link>
          </div>
        </div>
        {typeof children === 'function' ? children({ peek: true, isPremium: false }) : children}
      </div>
    );
  }

  return (
    <div className="card p-5 text-center">
      <p className="text-3xl mb-2">✨</p>
      <h2 className="font-display font-bold text-xl text-[#4a1942]">Pro Sanctum feature</h2>
      <p className="text-sm text-[#4a1942]/70 mt-2">
        {teaser ||
          'This tool opens fully for Hazel Allure Pro members (customer or vendor Pro).'}
      </p>
      <div className="flex flex-col gap-2 mt-4">
        {!user ? (
          <>
            <a href={HAZEL_LINKS.signup()} className="btn-primary">
              Create Hazel account
            </a>
            <Link to="/auth" className="btn-secondary">
              Sign in
            </Link>
          </>
        ) : (
          <a href={HAZEL_LINKS.proUpgrade()} className="btn-primary">
            Upgrade to Pro on Hazel Allure
          </a>
        )}
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <Link to="/" className="underline">
            Free sphere
          </Link>
          <Link to="/widget" className="underline">
            Desk Orb
          </Link>
          <Link to="/free" className="underline">
            Free playground
          </Link>
          <a href={HAZEL_LINKS.marketplace()} className="underline">
            Apothecary
          </a>
        </div>
        {!isPremium && user && (
          <p className="text-[11px] text-[#4a1942]/50">
            Signed in as {user.email} · plan: {user.customer_plan || 'free'}
          </p>
        )}
      </div>
    </div>
  );
}
