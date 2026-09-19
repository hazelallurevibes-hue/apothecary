import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  COOKIE_CATEGORIES,
  gpcOrDntEnabled,
  readConsent,
  writeConsent,
} from '../lib/cookieConsent';
import { regionPolicy } from '../lib/accountRegions';

export default function CookieConsentBar({ regionId }) {
  const policy = regionPolicy(regionId);
  const existing = readConsent();
  const [open, setOpen] = useState(() => !existing?.decided);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  if (!open) return null;

  const save = (allowAnalytics) => {
    writeConsent({ analytics: allowAnalytics && !gpcOrDntEnabled() });
    setOpen(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3">
      <div className="max-w-3xl mx-auto bg-[#2d1230] text-white rounded-2xl px-4 py-4 text-sm shadow-lg">
        <p className="font-semibold mb-1">Cookies &amp; analytics</p>
        <p className="text-white/80 mb-3">
          Essential cookies keep you signed in. Analytics (Google, Bing, Vercel, GoDaddy) only run if you allow them.
          We do not sell personal information.{' '}
          {policy.analyticsRequiresOptIn
            ? 'Your region requires a yes before analytics cookies.'
            : 'You can say no and still use the site.'}{' '}
          {gpcOrDntEnabled() && 'A Global Privacy Control / Do Not Track signal is on — analytics stay off.'}{' '}
          <Link to="/policies-procedures#cookies" className="underline">
            Policy
          </Link>
          {' · '}
          <Link to="/do-not-sell" className="underline">
            Do not sell
          </Link>
        </p>
        {customize && (
          <div className="space-y-2 mb-3 text-white/90">
            {COOKIE_CATEGORIES.map((c) => (
              <label key={c.id} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={c.required || analytics}
                  disabled={c.required || gpcOrDntEnabled()}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
                <span>
                  <strong>{c.label}</strong> — {c.description}
                </span>
              </label>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-white text-[#4a1942] font-semibold"
            onClick={() => save(true)}
            disabled={gpcOrDntEnabled()}
          >
            {policy.analyticsRequiresOptIn ? 'Accept analytics' : 'Accept all'}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl border border-white/40 font-semibold"
            onClick={() => save(false)}
          >
            Essential only
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl font-semibold underline"
            onClick={() => setCustomize((v) => !v)}
          >
            {customize ? 'Hide options' : 'Customize'}
          </button>
        </div>
      </div>
    </div>
  );
}
