import { useCallback, useEffect, useState } from 'react';
import { APP_VERSION, SEEN_VERSION_KEY, UPDATE_SPLASH } from '../lib/appVersion';

/**
 * Full-screen splash when a new app version is available (version.json and/or PWA SW).
 * Works for installed PWA and regular website visitors.
 */
export default function UpdateSplash() {
  const [open, setOpen] = useState(false);
  const [remote, setRemote] = useState(null);
  const [needSwRefresh, setNeedSwRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState(null);
  const [updating, setUpdating] = useState(false);

  const markSeen = useCallback((version) => {
    try {
      localStorage.setItem(SEEN_VERSION_KEY, version || APP_VERSION);
    } catch {
      /* ignore */
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    setUpdating(true);
    const ver = remote?.version || APP_VERSION;
    markSeen(ver);
    try {
      if (needSwRefresh && typeof updateSW === 'function') {
        await updateSW(true);
      }
    } catch {
      /* fall through to hard reload */
    }
    window.location.reload();
  }, [markSeen, needSwRefresh, remote, updateSW]);

  const dismiss = useCallback(() => {
    markSeen(remote?.version || APP_VERSION);
    setOpen(false);
  }, [markSeen, remote]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data?.version) return;
        setRemote(data);
        const seen = localStorage.getItem(SEEN_VERSION_KEY);
        if (seen !== data.version) {
          setOpen(true);
        }
      } catch {
        /* offline — skip */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let unmounted = false;
    (async () => {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        const update = registerSW({
          immediate: true,
          onNeedRefresh() {
            if (!unmounted) {
              setNeedSwRefresh(true);
              setOpen(true);
            }
          },
          onOfflineReady() {
            /* ready for offline */
          },
        });
        if (!unmounted) setUpdateSW(() => update);
      } catch {
        /* PWA virtual module unavailable in some envs */
      }
    })();
    return () => {
      unmounted = true;
    };
  }, []);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(SEEN_VERSION_KEY);
      if (seen && seen !== APP_VERSION) {
        setOpen(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  if (!open) return null;

  const title = remote?.title || UPDATE_SPLASH.title;
  const message = remote?.message || UPDATE_SPLASH.message;
  const highlights = remote?.highlights?.length ? remote.highlights : UPDATE_SPLASH.highlights;
  const version = remote?.version || APP_VERSION;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#120510]/75 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-splash-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#c9a227]/40">
        <div className="bg-gradient-to-br from-[#2d0f2a] via-[#4a1942] to-[#6b2d7a] px-6 pt-8 pb-6 text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 80% 20%, rgba(212,175,55,0.5), transparent 50%)',
            }}
          />
          <p className="text-xs font-black uppercase tracking-widest text-[#e8c547] relative">
            Magic Sanctum
          </p>
          <h2 id="update-splash-title" className="font-display font-bold text-2xl mt-1 leading-tight relative">
            {title}
          </h2>
          <p className="text-sm text-white/85 mt-2 leading-relaxed relative">{message}</p>
          <p className="text-[10px] font-bold text-[#e8c547]/90 mt-3 relative">v{version}</p>
        </div>
        <div className="px-6 py-5">
          {highlights?.length > 0 && (
            <ul className="space-y-2 mb-5">
              {highlights.map((h) => (
                <li key={h} className="flex gap-2 text-sm text-[#2d0f2a]/80">
                  <span className="text-[#c9a227] shrink-0 font-black">✦</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              disabled={updating}
              onClick={applyUpdate}
              className="btn-primary flex-1 text-sm py-3"
            >
              {updating ? 'Updating…' : needSwRefresh ? 'Update app now' : 'Got it — refresh'}
            </button>
            <button
              type="button"
              disabled={updating}
              onClick={dismiss}
              className="btn-secondary flex-1 text-sm py-3"
            >
              Later
            </button>
          </div>
          <p className="text-[11px] text-[#4a1942]/45 mt-3 text-center">
            Works on the website and the installed home-screen app.
          </p>
        </div>
      </div>
    </div>
  );
}
