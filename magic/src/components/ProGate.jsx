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
              <Link to={HAZEL_LINKS.proExplainer(featureId || 'magic_general')} className="btn-gold text-xs py-1.5 px-3">
                Why Pro? Explain first
              </Link>
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
    <div className="card p-5 text-center space-y-3">
      <p className="text-3xl mb-2">✨</p>
      <h2 className="font-display font-bold text-xl text-[#4a1942]">Pro Sanctum feature</h2>
      <p className="text-sm text-[#4a1942]/70 mt-2">
        {teaser ||
          'This tool opens fully for Hazel Allure Pro members (customer or vendor Pro).'}
      </p>
      <p className="text-xs text-[#4a1942]/55 leading-relaxed">
        You are seeing this because this area needs the full library or live multi-device modes. Free tools
        (sphere, court basic, dice, harmony, pathfinder) stay free — we explain Pro before checkout.
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
          <Link to={HAZEL_LINKS.proExplainer(featureId || 'magic_general')} className="btn-primary">
            Why Pro? Read first →
          </Link>
        )}
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <Link to="/" className="underline">
            Free sphere
          </Link>
          <Link to="/hearth-court" className="underline">
            Free court
          </Link>
          <Link to="/pathfinder" className="underline">
            Pathfinder
          </Link>
          <Link to="/widget" className="underline">
            Desk Orb
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
