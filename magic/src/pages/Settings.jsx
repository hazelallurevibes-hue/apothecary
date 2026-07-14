import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HAZEL_LINKS } from '../lib/hazel';
import { loadSettings, saveSettings } from '../lib/storage';
import { APP_VERSION } from '../lib/appVersion';
import { packStats } from '../lib/engines';
import { BRAND } from '../lib/brand';
import ToolGrid from '../components/ToolGrid';
import SanctumLogo from '../components/SanctumLogo';
import SeoHead from '../components/SeoHead';
import ApothecaryFunnel from '../components/ApothecaryFunnel';

export default function Settings() {
  const { user, isPremium, isAdmin, refresh } = useAuth();
  const [settings, setSettings] = useState(() => loadSettings());
  const stats = packStats();

  const patch = (p) => setSettings(saveSettings(p));

  return (
    <div className="space-y-5">
      <SeoHead
        title="Settings, Desk Orb & App Install — Magic Sanctum"
        description="Manage Magic Sanctum account, install the app, open the Desk Orb widget, and jump to every tool."
        path="/settings"
      />

      <div className="flex items-center gap-3">
        <SanctumLogo size={48} decorative />
        <div>
          <h1 className="font-display font-bold text-2xl text-[#4a1942]">More · Settings</h1>
          <p className="text-xs text-[#4a1942]/55">Account, install, Desk Orb widget, every link</p>
        </div>
      </div>

      {/* App + Widget — primary ask from user */}
      <div className="card card-glow p-4 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#c9a227]">App & Desk Orb</p>
        <h2 className="font-display font-bold text-lg text-[#4a1942]">Where is the widget?</h2>
        <p className="text-sm text-[#4a1942]/70 leading-relaxed">
          The <strong>Desk Orb</strong> is a minimal companion for sphere + coin. Open it any time:
        </p>
        <div className="rounded-xl bg-[#1a0a18] text-white p-3 text-center">
          <p className="text-[#c9a227] text-[10px] uppercase tracking-widest">Direct link</p>
          <a
            href="https://magic.hazelallure.com/widget"
            className="font-mono text-sm text-white underline break-all"
          >
            magic.hazelallure.com/widget
          </a>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link to="/widget" className="btn-primary flex-1 text-center">
            Open Desk Orb now
          </Link>
          <Link to="/guides/desk-orb" className="btn-secondary flex-1 text-center">
            Desk Orb guide
          </Link>
        </div>
        <ol className="text-xs text-[#4a1942]/70 space-y-1.5 list-decimal pl-4 leading-relaxed">
          <li>
            <strong>Install the app:</strong> browser menu → Install / Add to Home Screen (iPhone: Share →
            Add to Home Screen).
          </li>
          <li>
            <strong>Open Desk Orb:</strong> use the Orb tab on mobile, the Desk Orb nav item, or the link
            above.
          </li>
          <li>
            <strong>Pin it:</strong> keep the widget tab handy for desk use, or bookmark{' '}
            <code className="bg-[#4a1942]/8 px-1 rounded">/widget</code>.
          </li>
        </ol>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={!!settings.compactWidget}
            onChange={(e) => patch({ compactWidget: e.target.checked })}
          />
          Prefer compact companion defaults (local preference)
        </label>
      </div>

      <div className="card p-4 space-y-2 text-sm">
        <p className="font-bold text-[#4a1942]">Account</p>
        {user ? (
          <>
            <p className="font-semibold">{user.email}</p>
            <p className="text-xs text-[#4a1942]/60">
              Plan: {user.customer_plan || 'free'}
              {user.vendor_plan && user.vendor_plan !== 'free' ? ` · vendor ${user.vendor_plan}` : ''}
              {isPremium ? ' · Magic Pro unlocked' : ''}
              {isAdmin ? ' · Admin' : ''}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" className="btn-secondary text-xs" onClick={() => refresh()}>
                Refresh session
              </button>
              <a href={HAZEL_LINKS.account()} className="btn-secondary text-xs">
                Manage on Hazel Allure
              </a>
              <Link to="/dashboard" className="btn-primary text-xs">
                Open dashboard
              </Link>
              {!isPremium && (
                <a href={HAZEL_LINKS.proUpgrade()} className="btn-gold text-xs">
                  Upgrade to Pro
                </a>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-[#4a1942]/70">
              Same account as the apothecary. Sign in here or create an account on Hazel Allure.
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/auth" className="btn-primary text-center">
                Sign in on Magic Sanctum
              </Link>
              <a href={HAZEL_LINKS.signup()} className="btn-secondary text-center">
                Create account on Hazel Allure
              </a>
              <a
                href={HAZEL_LINKS.login(
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/settings`
                    : 'https://magic.hazelallure.com/settings',
                )}
                className="text-xs underline text-center text-[#4a1942]/60"
              >
                Full apothecary login (Google, etc.)
              </a>
            </div>
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
      </div>

      <section>
        <h2 className="font-display font-bold text-lg text-[#4a1942] mb-2">Jump to any tool</h2>
        <ToolGrid compact />
      </section>

      <div className="card p-4 text-xs text-[#4a1942]/55 space-y-2">
        <p className="font-bold text-[#4a1942] text-sm">Build & libraries</p>
        <p>App version v{APP_VERSION}</p>
        <p>
          {BRAND.pet.name}: {stats.petPhrases} phrases · {BRAND.coach.name}: {stats.coachEntries}{' '}
          insights · {BRAND.settler.name}: {stats.settlerCliff} cliff notes
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          <Link to="/legal" className="underline">
            Magic policies
          </Link>
          <Link to="/guides" className="underline">
            Guides
          </Link>
          <a href="/sitemap.xml" className="underline">
            Sitemap
          </a>
          <a href={HAZEL_LINKS.policies()} className="underline">
            Apothecary policies
          </a>
          <a href={HAZEL_LINKS.agreements()} className="underline">
            Agreements
          </a>
        </div>
      </div>

      <ApothecaryFunnel />
    </div>
  );
}
