import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { askOracle, flipCoin, packStats } from '../lib/engines';
import { HAZEL_LINKS } from '../lib/hazel';

export default function Home() {
  const { isPremium, can } = useAuth();
  const [mode, setMode] = useState('classic');
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [coin, setCoin] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const stats = packStats();

  const reveal = () => {
    if (mode === 'coin') {
      setFlipping(true);
      setCoin(null);
      setResult(null);
      setTimeout(() => {
        setCoin(flipCoin());
        setFlipping(false);
      }, 900);
      return;
    }
    if (mode === 'reverse' && !can('reverse_oracle')) {
      setResult({ text: 'Sign in with Pro for reverse oracle proverbs.', kind: 'locked' });
      return;
    }
    setCoin(null);
    setResult(askOracle(q, mode === 'reverse' ? 'reverse' : 'classic'));
  };

  return (
    <div className="space-y-6">
      <section className="text-center">
        <h1 className="font-display font-bold text-3xl text-[#4a1942]">Ask the sanctum</h1>
        <p className="text-sm text-[#4a1942]/65 mt-2 max-w-md mx-auto">
          Sphere, heaven/hell coin, and playful tools — same hearth personality as Hazel Allure.
          Pro unlocks the full library.
        </p>
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'classic', label: '8-ball' },
            { id: 'reverse', label: 'Proverb', pro: true },
            { id: 'coin', label: 'Coin flip' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setResult(null);
                setCoin(null);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                mode === m.id
                  ? 'bg-[#4a1942] text-white border-[#4a1942]'
                  : 'border-[#4a1942]/20 text-[#4a1942]/80'
              }`}
            >
              {m.label}
              {m.pro && !isPremium ? ' · Pro' : ''}
            </button>
          ))}
        </div>

        {mode !== 'coin' && (
          <input
            className="input mb-3"
            placeholder="Type your question…"
            value={q}
            maxLength={240}
            onChange={(e) => setQ(e.target.value)}
          />
        )}

        {mode === 'coin' && (
          <p className="text-xs text-[#4a1942]/70 mb-3">
            One face: a <strong>heaven-scape YES</strong>. The other: a <strong>hell-scape NO</strong>.
          </p>
        )}

        <button type="button" className="btn-primary w-full" onClick={reveal} disabled={flipping}>
          {flipping ? 'Spinning…' : mode === 'coin' ? 'Flip the coin' : 'Reveal'}
        </button>

        {mode === 'coin' && (flipping || coin) && (
          <div
            className={`mt-4 rounded-2xl min-h-[140px] flex items-center justify-center overflow-hidden ${
              flipping
                ? 'bg-gradient-to-br from-slate-800 to-violet-950 animate-pulse'
                : coin === 'yes'
                  ? 'bg-gradient-to-br from-sky-300 via-indigo-200 to-amber-100'
                  : 'bg-gradient-to-br from-red-950 via-orange-900 to-black'
            }`}
          >
            {flipping ? (
              <span className="text-5xl animate-spin">🪙</span>
            ) : coin === 'yes' ? (
              <div className="text-center py-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-sky-900/70">Heaven-scape</p>
                <p className="text-6xl font-black text-sky-950">YES</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-orange-200/70">Hell-scape</p>
                <p className="text-6xl font-black text-orange-50">NO</p>
              </div>
            )}
          </div>
        )}

        {result && mode !== 'coin' && (
          <div
            className={`mt-4 rounded-2xl p-5 text-center ${
              result.kind === 'proverb'
                ? 'bg-indigo-50 text-indigo-950 italic'
                : result.tone === 'yes'
                  ? 'bg-emerald-50 text-emerald-900 font-bold text-2xl'
                  : result.tone === 'no'
                    ? 'bg-rose-50 text-rose-900 font-bold text-2xl'
                    : 'bg-amber-50 text-amber-950 font-bold text-xl'
            }`}
          >
            {result.text}
          </div>
        )}

        <p className="mt-3 text-[10px] text-center text-red-600">
          Not real advice. Entertainment only.
        </p>
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        {[
          { to: '/settler', title: 'Argument settler', desc: '2–4 sides → playful verdict + cliff notes', pro: true },
          { to: '/pet', title: 'Pet translator', desc: `Upload vibe + hope text · ${stats.petPhrases || '1000+'} phrases`, pro: true },
          { to: '/coach', title: 'Pre-argument coach', desc: `${stats.coachEntries || '1000+'} insights with filters`, pro: true },
          { to: '/hearth', title: 'Frustration box', desc: 'Private journal + anonymous hearth posts', pro: false },
          { to: '/widget', title: 'Desktop companion', desc: 'Installable mini sphere over your day', pro: false },
          { to: '/settings', title: 'Settings', desc: 'Profile prefs · link to Hazel account', pro: false },
        ].map((f) => (
          <Link key={f.to} to={f.to} className="card p-4 hover:border-[#4a1942]/30 transition">
            <p className="font-display font-bold text-[#4a1942]">
              {f.title}
              {f.pro && <span className="chip-pro ml-2 align-middle">Pro</span>}
            </p>
            <p className="text-xs text-[#4a1942]/60 mt-1">{f.desc}</p>
          </Link>
        ))}
      </section>

      {!isPremium && (
        <div className="card p-4 text-center bg-gradient-to-br from-[#4a1942]/5 to-[#c9a227]/10">
          <p className="text-sm text-[#4a1942]/80">
            Pro on Hazel Allure unlocks settler, pet talk, coach, reverse oracle, and hearth posts.
          </p>
          <a href={HAZEL_LINKS.proUpgrade()} className="btn-primary mt-3 inline-flex">
            Become Pro
          </a>
        </div>
      )}
    </div>
  );
}
