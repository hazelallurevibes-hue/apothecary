import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';
import YourDataPanel from '../components/YourDataPanel';
import { gpcOrDntEnabled, writeConsent } from '../lib/cookieConsent';

export default function DoNotSell({ user }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-[#4a1942] mb-3">Do not sell or share my personal information</h1>
        <p className="text-gray-700">
          {VERTICAL.legalEntity} does not sell personal information for third-party advertising. Analytics (Google, Bing,
          Vercel, GoDaddy) only run if you allow cookies. A Global Privacy Control signal is treated as “analytics off.”
        </p>
        {gpcOrDntEnabled() && (
          <p className="mt-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
            We detected GPC or Do Not Track. Analytics cookies stay off on this browser.
          </p>
        )}
        <button
          type="button"
          className="mt-4 px-4 py-2 rounded-2xl border font-semibold text-sm"
          onClick={() => writeConsent({ analytics: false })}
        >
          Turn off analytics cookies on this device
        </button>
      </div>
      {user?.email ? (
        <YourDataPanel user={user} />
      ) : (
        <p className="text-sm text-gray-600">
          <Link to="/login" className="text-[#4a1942] underline">
            Sign in
          </Link>{' '}
          to download your data or request deletion.
        </p>
      )}
    </div>
  );
}
