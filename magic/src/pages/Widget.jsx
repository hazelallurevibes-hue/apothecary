import { useState } from 'react';
import { Link } from 'react-router-dom';
import { askOracle, flipCoin } from '../lib/engines';
import SanctumLogo from '../components/SanctumLogo';

/** Minimal floating companion — install as PWA for a desk orb */
export default function Widget() {
  const [mode, setMode] = useState('8');
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);

  const go = () => {
    if (busy) return;
    setBusy(true);
    setOut(null);
    setTimeout(() => {
      if (mode === 'coin') {
        setOut({ kind: 'coin', value: flipCoin() });
      } else {
        setOut({ kind: 'oracle', ...askOracle('', 'classic') });
      }
      setBusy(false);
    }, mode === 'coin' ? 600 : 200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#120510] via-[#2d0f2a] to-[#4a1942]">
      <div className="w-full max-w-xs rounded-3xl border border-[#d4af37]/45 bg-[#120510]/92 p-5 text-center shadow-2xl backdrop-blur">
        <div className="flex justify-center mb-2">
          <SanctumLogo size={36} decorative />
        </div>
        <p className="text-[#e8c547] text-[10px] uppercase tracking-[0.22em] mb-0.5 font-bold">
          Desk Orb
        </p>
        <p className="text-white/40 text-[10px] mb-4">Magic Sanctum companion · entertainment only</p>

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
            Sphere
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
          className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-[#6b2d7a] via-[#4a1942] to-[#120510] border-[3px] border-[#d4af37] text-white text-4xl font-bold hover:scale-105 active:scale-95 transition shadow-[0_0_40px_rgba(212,175,55,0.25)] disabled:opacity-70"
          aria-label={mode === 'coin' ? 'Flip coin' : 'Ask sphere'}
        >
          {busy ? '…' : mode === 'coin' ? '🪙' : '8'}
        </button>
        <p className="text-white/35 text-[10px] mt-2">Tap to {mode === 'coin' ? 'flip' : 'reveal'}</p>

        {out?.kind === 'oracle' && (
          <p className="mt-4 text-white font-bold text-xl tracking-wide animate-fade-up">{out.text}</p>
        )}
        {out?.kind === 'coin' && (
          <div
            className={`mt-4 rounded-xl py-4 animate-fade-up ${
              out.value === 'yes'
                ? 'bg-gradient-to-br from-sky-300 to-amber-100 text-sky-950'
                : 'bg-gradient-to-br from-red-900 to-black text-orange-100'
            }`}
          >
            <p className="text-[10px] uppercase tracking-widest opacity-70">
              {out.value === 'yes' ? 'Heaven' : 'Hell'}
            </p>
            <p className="text-3xl font-black">{out.value === 'yes' ? 'YES' : 'NO'}</p>
          </div>
        )}

        <div className="mt-5 space-y-2 text-[11px]">
          <Link to="/" className="block text-[#e8c547] hover:underline font-semibold">
            Full Magic Sanctum →
          </Link>
          <div className="flex justify-center gap-3 text-white/45">
            <Link to="/free" className="hover:text-white/80 underline">
              Free play
            </Link>
            <Link to="/settings" className="hover:text-white/80 underline">
              Install tips
            </Link>
            <Link to="/guides/desk-orb" className="hover:text-white/80 underline">
              Guide
            </Link>
          </div>
        </div>
        <p className="mt-3 text-[9px] text-white/30 leading-relaxed">
          Bookmark this page · Install app from full Sanctum · Same account as apothecary.hazelallure.com
        </p>
      </div>
    </div>
  );
}
