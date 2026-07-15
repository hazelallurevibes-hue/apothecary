import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { askOracle, flipCoin } from '../lib/engines';
import SanctumLogo from '../components/SanctumLogo';

/**
 * Desk Orb companion — install as PWA / pin tab.
 * Fix: askOracle returns kind:'classic' — never overwrite display kind incorrectly.
 */
export default function Widget() {
  const [mode, setMode] = useState('8');
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);
  const [deferred, setDeferred] = useState(null);
  const [installHint, setInstallHint] = useState('');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean(window.navigator.standalone);
    setIsStandalone(!!standalone);

    const onBip = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', onBip);

    // Catch install prompt that may have fired before mount (unlikely) + SW register for PWA
    (async () => {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        registerSW({ immediate: true });
      } catch {
        /* dev without PWA module */
      }
    })();

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos && !standalone) {
      setInstallHint('iPhone: tap Share → Add to Home Screen. Then open Desk Orb from the icon.');
    } else if (!standalone) {
      setInstallHint('Chrome/Edge: menu (⋮) → Install app / Cast, save, and share → Install page as app.');
    }

    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, []);

  const installApp = useCallback(async () => {
    if (deferred) {
      deferred.prompt();
      try {
        await deferred.userChoice;
      } catch {
        /* ignore */
      }
      setDeferred(null);
      return;
    }
    // Fallback: copy link + show instructions
    try {
      await navigator.clipboard.writeText('https://magic.hazelallure.com/widget');
      setInstallHint('Link copied. Open in Chrome → Install app, or pin this tab. iPhone: Share → Add to Home Screen.');
    } catch {
      setInstallHint('Open this page in Chrome or Safari, then use Install / Add to Home Screen.');
    }
  }, [deferred]);

  const go = () => {
    if (busy) return;
    setBusy(true);
    setOut(null);
    const delay = mode === 'coin' ? 650 : 380;
    window.setTimeout(() => {
      try {
        if (mode === 'coin') {
          const value = flipCoin();
          setOut({
            kind: 'coin',
            value,
            text: value === 'yes' ? 'YES' : 'NO',
            flavor: value === 'yes' ? 'Heaven-scape' : 'Hell-scape',
          });
        } else {
          const ans = askOracle('', 'classic');
          // Keep kind as 'sphere' so UI always finds the result (askOracle uses kind: classic)
          setOut({
            kind: 'sphere',
            text: ans.text || 'MAYBE',
            tone: ans.tone || 'maybe',
            flavor: ans.flavor || ans.whisper || '',
          });
        }
      } catch (e) {
        setOut({
          kind: 'sphere',
          text: 'MAYBE',
          tone: 'maybe',
          flavor: 'The sphere blinked — tap again.',
        });
      }
      setBusy(false);
    }, delay);
  };

  const toneStyles = {
    yes: 'from-emerald-400/30 to-emerald-900/40 border-emerald-300/40 text-emerald-50',
    no: 'from-rose-900/50 to-red-950/60 border-rose-400/30 text-rose-50',
    maybe: 'from-amber-500/20 to-violet-900/50 border-amber-200/30 text-amber-50',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#120510] via-[#2d0f2a] to-[#4a1942]">
      <div className="w-full max-w-sm rounded-3xl border border-[#d4af37]/45 bg-[#120510]/95 p-5 text-center shadow-2xl backdrop-blur">
        <div className="flex justify-center mb-2">
          <SanctumLogo size={40} decorative />
        </div>
        <p className="text-[#e8c547] text-[10px] uppercase tracking-[0.22em] mb-0.5 font-bold">
          Desk Orb
        </p>
        <p className="text-white/45 text-[10px] mb-3">Magic Sanctum companion · tap the ball</p>

        <div className="mb-4 rounded-2xl border border-[#d4af37]/30 bg-white/5 px-3 py-2.5 text-left space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#e8c547]">
            Independent Desk Orb (any computer)
          </p>
          <p className="text-[11px] text-white/70 leading-snug">
            Download a single HTML file that runs offline — no app store, no login. Open it like a document.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/desk-orb-standalone.html"
              download="Magic-Sanctum-Desk-Orb.html"
              className="btn-gold text-xs py-1.5 px-3 inline-flex"
            >
              Download standalone HTML
            </a>
            <a
              href="/desk-orb-standalone.html"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary text-xs py-1.5 px-3 !text-[#4a1942] inline-flex"
            >
              Open standalone
            </a>
          </div>
          {!isStandalone && (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#e8c547] pt-1">
                Or install full Magic app
              </p>
              <p className="text-[11px] text-white/70 leading-snug">
                {installHint ||
                  'Chrome: menu → Install app. iPhone: Share → Add to Home Screen.'}
              </p>
              <button type="button" onClick={installApp} className="btn-primary text-xs py-1.5 px-3">
                {deferred ? 'Install app now' : 'Try browser install / copy link'}
              </button>
            </>
          )}
          {isStandalone && (
            <p className="text-[10px] text-emerald-300/80 font-semibold">Running as installed app ✓</p>
          )}
        </div>

        <div className="flex justify-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('8');
              setOut(null);
            }}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
              mode === '8' ? 'bg-[#d4af37] text-[#120510]' : 'text-white/70 border border-white/20 hover:border-white/40'
            }`}
          >
            8-ball
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('coin');
              setOut(null);
            }}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
              mode === 'coin'
                ? 'bg-[#d4af37] text-[#120510]'
                : 'text-white/70 border border-white/20 hover:border-white/40'
            }`}
          >
            Coin
          </button>
        </div>

        <button
          type="button"
          onClick={go}
          disabled={busy}
          className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#8b3d9b] via-[#4a1942] to-[#120510] border-[3px] border-[#d4af37] text-white text-5xl font-bold hover:scale-105 active:scale-95 transition shadow-[0_0_48px_rgba(212,175,55,0.35)] disabled:opacity-80 flex items-center justify-center"
          aria-label={mode === 'coin' ? 'Flip coin' : 'Ask the 8 ball'}
        >
          {busy ? (
            <span className="text-2xl animate-pulse text-[#e8c547]">…</span>
          ) : mode === 'coin' ? (
            '🪙'
          ) : (
            '8'
          )}
        </button>
        <p className="text-white/50 text-[11px] mt-2 font-medium">
          {busy ? 'Consulting the sphere…' : mode === 'coin' ? 'Tap to flip Heaven & Ember' : 'Tap for YES · NO · MAYBE'}
        </p>

        {/* Always reserve space so the answer is visible */}
        <div className="mt-4 min-h-[7.5rem] flex items-center justify-center">
          {out?.kind === 'sphere' && (
            <div
              className={`w-full rounded-2xl border bg-gradient-to-br px-4 py-5 animate-fade-up ${
                toneStyles[out.tone] || toneStyles.maybe
              }`}
            >
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-70 font-bold">
                Sanctum Sphere
              </p>
              <p className="text-3xl sm:text-4xl font-black tracking-wide mt-1 drop-shadow">{out.text}</p>
              {out.flavor && (
                <p className="text-xs mt-2 opacity-80 leading-relaxed">{out.flavor}</p>
              )}
            </div>
          )}
          {out?.kind === 'coin' && (
            <div
              className={`w-full rounded-2xl py-5 animate-fade-up border ${
                out.value === 'yes'
                  ? 'bg-gradient-to-br from-sky-300 to-amber-100 text-sky-950 border-sky-200/50'
                  : 'bg-gradient-to-br from-red-900 to-black text-orange-100 border-orange-800/40'
              }`}
            >
              <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">
                {out.flavor}
              </p>
              <p className="text-4xl font-black mt-1">{out.text}</p>
            </div>
          )}
          {!out && !busy && (
            <p className="text-white/25 text-[11px] px-4">Your answer appears here after you tap</p>
          )}
        </div>

        <div className="mt-5 space-y-2 text-[11px]">
          <Link to="/" className="block text-[#e8c547] hover:underline font-semibold">
            Full Magic Sanctum →
          </Link>
          <div className="flex justify-center gap-3 text-white/50">
            <Link to="/hearth-court" className="hover:text-white/80 underline">
              Free Court
            </Link>
            <Link to="/free" className="hover:text-white/80 underline">
              Free play
            </Link>
            <Link to="/settings" className="hover:text-white/80 underline">
              Settings
            </Link>
          </div>
        </div>
        <p className="mt-3 text-[9px] text-white/30 leading-relaxed">
          Prefer offline? Download the standalone HTML above · Entertainment only
        </p>
      </div>
    </div>
  );
}
