import { useEffect, useRef, useState } from 'react';
import { APP_VERSION, SEEN_VERSION_KEY, UPDATE_SPLASH } from '../lib/appVersion';

const RELOAD_GUARD_KEY = 'magic_auto_update_at';
const RELOAD_GUARD_MS = 25_000;

/**
 * Auto-updates once when a new version is available (version.json and/or PWA SW).
 * Prevents the “click upgrade many times” loop by:
 *  - only reloading once per deploy (session guard)
 *  - marking the running APP_VERSION as seen after a reload settles
 *  - not prompting again for the same remote version in a loop
 */
export default function UpdateSplash() {
  const [phase, setPhase] = useState('idle'); // idle | updating | error
  const [remote, setRemote] = useState(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let cancelled = false;
    let updateSW = null;
    let latestRemoteVer = null;
    let updateInFlight = false;

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

    const hardReload = (version) => {
      const url = new URL(window.location.href);
      url.searchParams.set('_v', version || APP_VERSION);
      url.searchParams.set('_t', String(Date.now()));
      window.location.replace(url.toString());
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
      try {
        if (navigator.serviceWorker) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            regs.map(async (reg) => {
              if (reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
            }),
          );
        }
      } catch {
        /* ignore */
      }
    };

    const applyUpdate = async (targetVersion, { fromSW = false } = {}) => {
      if (cancelled || updateInFlight) return;
      if (recentlyReloaded()) {
        markSeen(APP_VERSION);
        setPhase('idle');
        return;
      }
      updateInFlight = true;
      const ver = targetVersion || latestRemoteVer || APP_VERSION;
      setPhase('updating');
      setReloadGuard();
      markSeen(ver);
      try {
        if (fromSW && typeof updateSW === 'function') {
          await updateSW(true);
        }
      } catch {
        /* fall through */
      }
      await clearCaches();
      window.setTimeout(() => {
        if (!cancelled) hardReload(ver);
      }, 600);
    };

    (async () => {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        updateSW = registerSW({
          immediate: true,
          onNeedRefresh() {
            applyUpdate(latestRemoteVer || APP_VERSION, { fromSW: true });
          },
          onOfflineReady() {
            /* ok */
          },
        });
      } catch {
        /* no PWA in some envs */
      }

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
      if (data?.version) {
        latestRemoteVer = data.version;
        setRemote(data);
      }

      const remoteVer = data?.version;
      if (!remoteVer || remoteVer === APP_VERSION) {
        markSeen(APP_VERSION);
        return;
      }

      await applyUpdate(remoteVer, { fromSW: false });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  if (phase !== 'updating') return null;

  const version = remote?.version || APP_VERSION;
  const title = remote?.title || UPDATE_SPLASH.title;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#120510]/80 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-label="Updating app"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#c9a227]/40 text-center">
        <div className="bg-gradient-to-br from-[#2d0f2a] via-[#4a1942] to-[#6b2d7a] px-6 py-8 text-white">
          <p className="text-xs font-black uppercase tracking-widest text-[#e8c547]">Magic Sanctum</p>
          <h2 className="font-display font-bold text-xl mt-2 leading-tight">Updating…</h2>
          <p className="text-sm text-white/85 mt-2">
            Loading v{version} automatically — one moment.
          </p>
          <p className="text-[10px] text-[#e8c547]/90 mt-4 animate-pulse">{title}</p>
        </div>
        <div className="px-6 py-4">
          <div className="h-1.5 rounded-full bg-[#4a1942]/10 overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#4a1942] to-[#c9a227] animate-pulse" />
          </div>
          <p className="text-[11px] text-[#4a1942]/45 mt-3">
            You only need this once per version. No extra taps required.
          </p>
        </div>
      </div>
    </div>
  );
}
