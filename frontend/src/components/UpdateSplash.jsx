import { useEffect, useRef, useState } from 'react';
import { APP_VERSION, SEEN_VERSION_KEY, UPDATE_SPLASH } from '../lib/appVersion';

const RELOAD_GUARD_KEY = 'ha_auto_update_at';
const RELOAD_GUARD_MS = 25_000;

/**
 * Auto-updates once when version.json is newer than the running bundle.
 * Avoids repeated “Update now” clicks after multi-deploys / cached shells.
 */
export default function UpdateSplash() {
  const [phase, setPhase] = useState('idle'); // idle | updating
  const [remote, setRemote] = useState(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let cancelled = false;

    const markSeen = (version) => {
      try {
        localStorage.setItem(SEEN_VERSION_KEY, version || APP_VERSION);
      } catch {
        /* ignore */
      }
    };

    const recentlyReloaded = () => {
      try {
        const t = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || 0);
        return t > 0 && Date.now() - t < RELOAD_GUARD_MS;
      } catch {
        return false;
      }
    };

    const setReloadGuard = () => {
      try {
        sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
    };

    const clearCaches = async () => {
      try {
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch {
        /* ignore */
      }
    };

    const applyUpdate = async (targetVersion) => {
      if (cancelled) return;
      if (recentlyReloaded()) {
        markSeen(APP_VERSION);
        setPhase('idle');
        return;
      }
      setPhase('updating');
      setReloadGuard();
      markSeen(targetVersion || APP_VERSION);
      await clearCaches();
      window.setTimeout(() => {
        if (cancelled) return;
        const url = new URL(window.location.href);
        url.searchParams.set('_v', targetVersion || APP_VERSION);
        url.searchParams.set('_t', String(Date.now()));
        window.location.replace(url.toString());
      }, 600);
    };

    (async () => {
      if (recentlyReloaded()) {
        markSeen(APP_VERSION);
        try {
          const url = new URL(window.location.href);
          if (url.searchParams.has('_v') || url.searchParams.has('_t')) {
            url.searchParams.delete('_v');
            url.searchParams.delete('_t');
            window.history.replaceState({}, '', url.pathname + url.search + url.hash);
          }
        } catch {
          /* ignore */
        }
        return;
      }

      let data = null;
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) data = await res.json();
      } catch {
        /* offline */
      }
      if (cancelled) return;
      if (data?.version) setRemote(data);

      const remoteVer = data?.version;
      if (!remoteVer || remoteVer === APP_VERSION) {
        markSeen(APP_VERSION);
        return;
      }

      await applyUpdate(remoteVer);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (phase !== 'updating') return null;

  const version = remote?.version || APP_VERSION;
  const title = remote?.title || UPDATE_SPLASH.title;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2d1230]/75 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Updating app"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#c9a227]/35 text-center">
        <div className="bg-gradient-to-br from-[#4a1942] via-[#6b3a62] to-[#b76e79] px-6 py-8 text-white">
          <p className="text-xs font-black uppercase tracking-widest text-[#e8dcc8]">Hazel Allure</p>
          <h2 className="heading-font font-bold text-xl mt-2">Updating…</h2>
          <p className="text-sm text-white/90 mt-2">Loading v{version} automatically — one moment.</p>
          <p className="text-[10px] text-[#e8dcc8]/90 mt-4 animate-pulse">{title}</p>
        </div>
        <div className="px-6 py-4">
          <div className="h-1.5 rounded-full bg-[#4a1942]/10 overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#4a1942] to-[#c9a227] animate-pulse" />
          </div>
          <p className="text-[11px] text-[#4a1942]/45 mt-3">
            One automatic update per version — no repeated taps.
          </p>
        </div>
      </div>
    </div>
  );
}
