import { HAZEL_LINKS } from '../lib/hazel';
import { useAuth } from '../context/AuthContext';

export default function ProGate({ featureId, children, teaser }) {
  const { can, isPremium, user } = useAuth();
  if (can(featureId)) return children;

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
            <a href={HAZEL_LINKS.login('https://magic.hazelallure.com')} className="btn-secondary">
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
