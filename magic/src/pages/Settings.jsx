import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HAZEL_LINKS } from '../lib/hazel';
import { loadSettings, saveSettings } from '../lib/storage';
import { APP_VERSION } from '../lib/appVersion';
import { packStats } from '../lib/engines';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { user, isPremium, isAdmin, refresh } = useAuth();
  const [settings, setSettings] = useState(() => loadSettings());
  const stats = packStats();

  const patch = (p) => setSettings(saveSettings(p));

  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-2xl text-[#4a1942]">Settings</h1>

      <div className="card p-4 space-y-2 text-sm">
        <p className="font-bold text-[#4a1942]">Account</p>
        {user ? (
          <>
            <p>{user.email}</p>
            <p className="text-xs text-[#4a1942]/60">
              Plan: {user.customer_plan || 'free'}
              {user.vendor_plan && user.vendor_plan !== 'free' ? ` · vendor ${user.vendor_plan}` : ''}
              {isPremium ? ' · Magic Pro unlocked' : ''}
              {isAdmin ? ' · Admin' : ''}
            </p>
            <button type="button" className="btn-secondary text-xs" onClick={() => refresh()}>
              Refresh session
            </button>
            <a href={HAZEL_LINKS.account()} className="btn-secondary text-xs block text-center">
              Manage on Hazel Allure
            </a>
          </>
        ) : (
          <>
            <p className="text-[#4a1942]/70">
              Same account as the apothecary. Sign in here or create an account on Hazel Allure.
            </p>
            <a href="/auth" className="btn-primary block text-center">
              Sign in on Magic Sanctum
            </a>
            <a href={HAZEL_LINKS.signup()} className="btn-secondary block text-center">
              Create account on Hazel Allure
            </a>
            <a
              href={HAZEL_LINKS.login(
                typeof window !== 'undefined'
                  ? `${window.location.origin}/settings`
                  : 'https://magic.hazelallure.com/settings',
              )}
              className="text-xs underline text-center block text-[#4a1942]/60"
            >
              Full apothecary login (Google, etc.)
            </a>
          </>
        )}
      </div>

      <div className="card p-4 space-y-3">
        <p className="font-bold text-[#4a1942] text-sm">Display name (local)</p>
        <input
          className="input"
          value={settings.name || ''}
          onChange={(e) => patch({ name: e.target.value.slice(0, 40) })}
          placeholder="Optional nickname"
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={!!settings.compactWidget}
            onChange={(e) => patch({ compactWidget: e.target.checked })}
          />
          Prefer compact companion defaults
        </label>
      </div>

      <div className="card p-4 text-sm space-y-1">
        <p className="font-bold text-[#4a1942]">Desktop companion</p>
        <p className="text-xs text-[#4a1942]/65">
          Install this site as an app (browser → Install / Add to Dock). Open{' '}
          <a href="/widget" className="underline">
            /widget
          </a>{' '}
          for a minimal always-handy sphere. True always-on-top over other apps needs a tiny desktop
          shell later — the PWA is the web-native first step.
        </p>
      </div>

      <div className="card p-4 text-xs text-[#4a1942]/55 space-y-1">
        <p>App version v{APP_VERSION}</p>
        <p>
          Libraries: Familiar Whisperer {stats.petPhrases} · Before the Storm {stats.coachEntries} ·
          Hearth Court notes {stats.settlerCliff}
        </p>
        <p>
          <Link to="/legal" className="underline">
            Magic policies
          </Link>{' '}
          ·{' '}
          <Link to="/guides" className="underline">
            Guides
          </Link>{' '}
          ·{' '}
          <a href="/sitemap.xml" className="underline">
            Sitemap
          </a>
        </p>
      </div>
    </div>
  );
}
