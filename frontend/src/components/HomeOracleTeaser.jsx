import { Link } from 'react-router-dom';
import { guestOracleRemaining, GUEST_ORACLE_LIMIT } from '../lib/guestOracle';

export default function HomeOracleTeaser({ user }) {
  const remaining = guestOracleRemaining(user);

  return (
    <section className="mb-6 rounded-3xl border border-[#4a1942]/15 bg-gradient-to-r from-[#faf7f9] via-white to-indigo-50/40 p-5 sm:p-6 flex flex-wrap items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a0a18] to-[#4a1942] text-white flex items-center justify-center text-xl font-bold shadow-lg border border-[#c9a227]/40 shrink-0">
        8
      </div>
      <div className="flex-1 min-w-[200px]">
        <h2 className="text-lg font-semibold text-[#4a1942]">Ask the Sanctum sphere</h2>
        <p className="text-sm text-gray-600 mt-1">
          {user?.email
            ? 'Tap the sphere in the bottom-left corner — unlimited questions for signed-in seekers.'
            : `Try ${GUEST_ORACLE_LIMIT} free questions without an account. Tap the sphere at the bottom-left of any page.`}
        </p>
        {!user?.email && remaining != null && (
          <p className="text-xs text-indigo-800 mt-2 font-medium">
            {remaining > 0 ? `${remaining} guest question${remaining === 1 ? '' : 's'} remaining today.` : 'Guest limit reached — create a free account for more.'}
          </p>
        )}
      </div>
      {!user?.email && (
        <div className="flex flex-wrap gap-2">
          <Link to="/customer-signup" className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm font-medium">
            Create account
          </Link>
          <Link to="/login" className="px-4 py-2 rounded-full border border-[#4a1942]/30 text-[#4a1942] text-sm font-medium">
            Log in
          </Link>
        </div>
      )}
    </section>
  );
}