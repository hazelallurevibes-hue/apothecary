import { useState } from 'react';
import { Link } from 'react-router-dom';
import { askOracle, flipCoin } from '../lib/engines';

/** Minimal floating companion — install as PWA for a desk orb */
export default function Widget() {
  const [mode, setMode] = useState('8');
  const [out, setOut] = useState(null);

  const go = () => {
    if (mode === 'coin') {
      setOut({ kind: 'coin', value: flipCoin() });
    } else {
      setOut({ kind: 'oracle', ...askOracle('', 'classic') });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1a0a18] to-[#4a1942]">
      <div className="w-full max-w-xs rounded-3xl border border-[#c9a227]/40 bg-[#1a0a18]/90 p-5 text-center shadow-2xl">
        <p className="text-[#c9a227] text-[10px] uppercase tracking-[0.2em] mb-2">Sanctum companion</p>
        <div className="flex justify-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode('8')}
            className={`text-xs px-3 py-1 rounded-full ${mode === '8' ? 'bg-[#c9a227] text-[#1a0a18]' : 'text-white/70 border border-white/20'}`}
          >
            8-ball
          </button>
          <button
            type="button"
            onClick={() => setMode('coin')}
            className={`text-xs px-3 py-1 rounded-full ${mode === 'coin' ? 'bg-[#c9a227] text-[#1a0a18]' : 'text-white/70 border border-white/20'}`}
          >
            Coin
          </button>
        </div>
        <button
          type="button"
          onClick={go}
          className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#4a1942] to-[#1a0a18] border-2 border-[#c9a227] text-white text-3xl font-bold hover:scale-105 transition"
        >
          8
        </button>
        {out?.kind === 'oracle' && (
          <p className="mt-4 text-white font-bold text-xl tracking-wide">{out.text}</p>
        )}
        {out?.kind === 'coin' && (
          <div
            className={`mt-4 rounded-xl py-4 ${
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
        <Link to="/" className="block mt-5 text-[11px] text-[#c9a227]/80 hover:underline">
          Full Magic Sanctum
        </Link>
        <p className="mt-2 text-[9px] text-white/40">Install app · keep this tab pinned for desk use</p>
      </div>
    </div>
  );
}
