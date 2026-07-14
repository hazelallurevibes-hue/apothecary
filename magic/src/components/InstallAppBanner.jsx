import { useEffect, useState } from 'react';

const DISMISS_KEY = 'magic_install_banner_dismissed';

/**
 * Prompts users to install Magic Sanctum as a home-screen / desktop app (PWA).
 */
export default function InstallAppBanner() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') return;
    } catch {
      /* ignore */
    }

    const onBip = (e) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBip);

    // iOS / browsers without beforeinstallprompt — soft hint after short delay
    const t = setTimeout(() => {
      const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isIos && !standalone) setVisible(true);
    }, 4000);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      clearTimeout(t);
    };
  }, []);

  if (isStandalone || !visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      /* ignore */
    }
    setDeferred(null);
    dismiss();
  };

  return (
    <div className="fixed bottom-[4.75rem] md:bottom-4 left-3 right-3 z-50 max-w-md mx-auto animate-fade-up">
      <div className="card card-glow p-3 flex items-start gap-3 shadow-xl">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1a0a18] to-[#4a1942] border border-[#c9a227]/60 flex items-center justify-center text-white font-display font-bold text-lg shrink-0">
          8
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#4a1942]">Install Magic Sanctum</p>
          <p className="text-[11px] text-[#4a1942]/65 leading-snug mt-0.5">
            {deferred
              ? 'Add the app to your home screen for one-tap sphere, coin, and court.'
              : 'On iPhone: Share → Add to Home Screen for the full app experience.'}
          </p>
          <div className="flex gap-2 mt-2">
            {deferred && (
              <button type="button" onClick={install} className="btn-gold text-xs py-1.5 px-3">
                Install app
              </button>
            )}
            <button type="button" onClick={dismiss} className="btn-secondary text-xs py-1.5 px-3">
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
