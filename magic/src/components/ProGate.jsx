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
        <div className="rounded-2xl border border-dashed border-[#c9a227]/60 bg-gradient-to-r from-amber-50/80 to-rose-50/50 px-4 py-3 text-xs text-[#4a1942]/80">
          <span className="font-black uppercase tracking-widest text-[9px] text-[#c9a227] mr-2">
            Free sneak peek
          </span>
          {teaser ||
            'Taste Pro magic — results are truncated. Full library unlocks with Hazel Allure Pro.'}
          <div className="mt-2 flex flex-wrap gap-2">
            {!user ? (
              <>
                <a href="/auth" className="btn-primary text-xs py-1.5 px-3">
                  Sign in
                </a>
                <a href={HAZEL_LINKS.signup()} className="btn-secondary text-xs py-1.5 px-3">
                  Join free
                </a>
              </>
            ) : (
              <a href={HAZEL_LINKS.proUpgrade()} className="btn-primary text-xs py-1.5 px-3">
                Unlock full Pro library
              </a>
            )}
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
            <a href="/auth" className="btn-secondary">
              Sign in
            </a>
          </>
        ) : (
          <a href={HAZEL_LINKS.proUpgrade()} className="btn-primary">
            Upgrade to Pro on Hazel Allure
          </a>
        )}
        {!isPremium && user && (
          <p className="text-[11px] text-[#4a1942]/50">
            Signed in as {user.email} · plan: {user.customer_plan || 'free'}
          </p>
        )}
      </div>
    </div>
  );
}
