import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SanctumLogo from './SanctumLogo';

const DISMISS_KEY = 'magic_install_banner_dismissed';

/**
 * Prompts users to install Magic Sanctum as a home-screen app
 * and points them to the Desk Orb widget at /widget.
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

    // Show soft hint for everyone after a short delay (not only iOS)
    const t = setTimeout(() => {
      if (!standalone) setVisible(true);
    }, 3500);

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
      <div className="card card-glow p-3.5 shadow-xl">
        <div className="flex items-start gap-3">
          <SanctumLogo size={44} className="shrink-0" decorative />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#4a1942]">Install Magic Sanctum</p>
            <p className="text-[11px] text-[#4a1942]/65 leading-snug mt-0.5">
              {deferred
                ? 'Add the full app to your home screen — then open Desk Orb for a tiny companion.'
                : 'Browser menu → Install / Add to Home Screen. On iPhone: Share → Add to Home Screen.'}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-[#4a1942]/40 hover:text-[#4a1942] text-lg leading-none px-1"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>

        <div className="mt-3 rounded-xl bg-[#4a1942]/[0.05] border border-[#4a1942]/10 px-3 py-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#c9a227]">
            Where is the widget?
          </p>
          <p className="text-[11px] text-[#4a1942]/70 mt-0.5 leading-snug">
            <strong>Desk Orb</strong> lives at{' '}
            <Link to="/widget" className="underline font-bold text-[#4a1942]" onClick={dismiss}>
              magic.hazelallure.com/widget
            </Link>
            — a minimal sphere + coin companion. Pin that tab or open it after install.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {deferred && (
            <button type="button" onClick={install} className="btn-gold text-xs py-1.5 px-3">
              Install app
            </button>
          )}
          <Link to="/widget" onClick={dismiss} className="btn-primary text-xs py-1.5 px-3">
            Open Desk Orb
          </Link>
          <Link to="/settings" onClick={dismiss} className="btn-secondary text-xs py-1.5 px-3">
            Install tips
          </Link>
          <button type="button" onClick={dismiss} className="text-xs text-[#4a1942]/50 px-2">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
