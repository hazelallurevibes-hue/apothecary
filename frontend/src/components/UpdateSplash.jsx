import { useCallback, useEffect, useState } from 'react';
import { APP_VERSION, SEEN_VERSION_KEY, UPDATE_SPLASH } from '../lib/appVersion';

/**
 * Full-screen splash when a new app version is available (version.json).
 * Works for website visitors and home-screen installs using the web manifest.
 */
export default function UpdateSplash() {
  const [open, setOpen] = useState(false);
  const [remote, setRemote] = useState(null);
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
    // Clear caches when possible so SPA shell reloads fresh assets
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      /* ignore */
    }
    window.location.reload();
  }, [markSeen, remote]);

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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2d1230]/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ha-update-splash-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#c9a227]/35">
        <div className="bg-gradient-to-br from-[#4a1942] via-[#6b3a62] to-[#b76e79] px-6 pt-8 pb-6 text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 85% 15%, rgba(201,162,39,0.6), transparent 45%)',
            }}
          />
          <p className="text-xs font-black uppercase tracking-widest text-[#e8dcc8] relative">
            Hazel Allure Apothecary
          </p>
          <h2 id="ha-update-splash-title" className="heading-font font-bold text-2xl mt-1 leading-tight relative">
            {title}
          </h2>
          <p className="text-sm text-white/90 mt-2 leading-relaxed relative">{message}</p>
          <p className="text-[10px] font-bold text-[#e8dcc8]/90 mt-3 relative">v{version}</p>
        </div>
        <div className="px-6 py-5">
          {highlights?.length > 0 && (
            <ul className="space-y-2 mb-5">
              {highlights.map((h) => (
                <li key={h} className="flex gap-2 text-sm text-[#2d1230]/80">
                  <span className="text-[#c9a227] shrink-0 font-black">✓</span>
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
              className="flex-1 text-sm py-3 rounded-xl font-semibold text-white bg-[#4a1942] hover:bg-[#2d1230] disabled:opacity-50 transition"
            >
              {updating ? 'Updating…' : 'Update now'}
            </button>
            <button
              type="button"
              disabled={updating}
              onClick={dismiss}
              className="flex-1 text-sm py-3 rounded-xl font-semibold border border-[#4a1942]/25 text-[#4a1942] hover:bg-[#4a1942]/5 disabled:opacity-50 transition"
            >
              Later
            </button>
          </div>
          <p className="text-[11px] text-[#4a1942]/45 mt-3 text-center">
            Refresh loads the newest marketplace code. Works on web and home-screen installs.
          </p>
        </div>
      </div>
    </div>
  );
}
