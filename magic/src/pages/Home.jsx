import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { askOracle, flipCoin, freeDailyLine, packStats } from '../lib/engines';
import { HAZEL_LINKS } from '../lib/hazel';
import { BRAND, DISCLAIMER } from '../lib/brand';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import SeoHead from '../components/SeoHead';
import JsonLd from '../components/JsonLd';
import ShareBar from '../components/ShareBar';
import { unlockAchievement } from '../lib/achievements';
import { recordHistory } from '../lib/historyStore';

export default function Home() {
  const { isPremium, can, user } = useAuth();
  const [mode, setMode] = useState('classic');
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [coin, setCoin] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const stats = packStats();
  const daily = freeDailyLine();

  const reveal = () => {
    if (mode === 'coin') {
      setFlipping(true);
      setCoin(null);
      setResult(null);
      setTimeout(() => {
        setCoin(flipCoin());
        setFlipping(false);
        unlockAchievement('first_coin');
      }, 900);
      return;
    }
    if (mode === 'reverse' && !can('reverse_oracle')) {
      setResult({ text: 'Moon Mirror Proverbs unlock with Pro — sneak a free sphere answer instead.', kind: 'locked' });
      return;
    }
    setCoin(null);
    const ans = askOracle(q, mode === 'reverse' ? 'reverse' : 'classic');
    setResult(ans);
    unlockAchievement('first_sphere');
    recordHistory({
      type: 'sphere',
      title: 'Sanctum Sphere',
      summary: ans.text,
      payload: { question: q, answer: ans.text, mode },
    });
  };

  const tools = [
    { name: 'Dashboard', emoji: '⭐', tagline: user ? 'Results, history, fortune' : 'Sign in for daily fortune', path: '/dashboard', pro: false, count: 'You' },
    { name: 'Chart harmony', emoji: '💞', tagline: 'Two birthdays · playful score', path: '/compatibility', pro: false, count: 'Viral' },
    { ...BRAND.settler, path: BRAND.settler.route, count: `${stats.settlerCliff || '2k+'} notes` },
    { ...BRAND.pet, path: BRAND.pet.route, count: `${stats.petPhrases || '2k+'} phrases` },
    { ...BRAND.coach, path: BRAND.coach.route, count: `${stats.coachEntries || '2k+'} insights` },
    { ...BRAND.journal, path: BRAND.journal.route, count: 'Free journal' },
    { name: 'Desk Orb', emoji: '🖥', tagline: 'Installable companion', path: '/widget', pro: false, count: 'PWA' },
    { name: 'Free playground', emoji: '🎁', tagline: 'Guides, daily ink, peeks', path: '/free', pro: false, count: 'SEO + fun' },
  ];

  return (
    <div className="space-y-6">
      <SeoHead
        title="Magic Sanctum — Free Sphere, Coin Flip & Pro Drama Tools | Hazel Allure"
        description="Sanctum Sphere, Heaven & Ember Coin, Hearth Court, Familiar Whisperer, Before the Storm. Free tools + Pro libraries. Entertainment only."
        path="/"
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Magic Sanctum',
          url: 'https://magic.hazelallure.com',
          applicationCategory: 'EntertainmentApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          description:
            'Free magic 8 ball style sphere, heaven/ember coin flip, and Pro tools for playful argument settling, pet translation, and pre-argument coaching.',
          publisher: {
            '@type': 'Organization',
            name: 'Hazel Allure',
            url: 'https://apothecary.hazelallure.com',
          },
        }}
      />

      <section className="text-center animate-fade-up">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a227]">
          Hazel Allure · Magic Sanctum App
        </p>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-brand-gradient mt-1 leading-tight">
          Ask the sanctum
        </h1>
        <p className="text-sm text-[#4a1942]/70 mt-2 max-w-md mx-auto leading-relaxed">
          Free sphere & coin for every seeker. Pro unlocks Hearth Court, Familiar Whisperer, and Before
          the Storm — with free sneak peeks so you feel the magic first.
        </p>
      </section>

      {/* Hero sphere visual */}
      {mode !== 'coin' && (
        <div className="flex flex-col items-center animate-fade-up-delay py-2">
          <div className="sanctum-sphere" aria-hidden>
            <div className="sanctum-sphere-window">
              {result?.text
                ? result.text.length > 28
                  ? `${result.text.slice(0, 26)}…`
                  : result.text
                : '⑧'}
            </div>
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4a1942]/45">
            Sanctum Sphere
          </p>
        </div>
      )}

      <div className="card card-glow px-4 py-3 text-sm italic text-[#4a1942]/85 animate-fade-up-delay">
        <span className="not-italic font-bold text-[10px] uppercase tracking-widest text-[#c9a227] mr-2">
          Free daily ink
        </span>
        {daily}
      </div>

      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'classic', label: 'Sanctum Sphere' },
            { id: 'reverse', label: 'Moon Mirror', pro: true },
            { id: 'coin', label: 'Heaven & Ember' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setResult(null);
                setCoin(null);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${
                mode === m.id
                  ? 'bg-gradient-to-r from-[#4a1942] to-[#6b2d7a] text-white border-transparent shadow-md'
                  : 'border-[#4a1942]/20 text-[#4a1942]/80 hover:border-[#c9a227]/50'
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') reveal();
            }}
          />
        )}

        {mode === 'coin' && (
          <p className="text-xs text-[#4a1942]/70 mb-3">
            One face: a <strong>heaven-scape YES</strong>. The other: a <strong>hell-scape NO</strong>.
            Free. Viral. Theatrical.
          </p>
        )}

        <button type="button" className="btn-primary w-full py-3 text-base" onClick={reveal} disabled={flipping}>
          {flipping ? 'Spinning the coin…' : mode === 'coin' ? 'Flip Heaven & Ember' : 'Reveal the sphere'}
        </button>

        {mode === 'coin' && (flipping || coin) && (
          <div
            className={`mt-4 rounded-2xl min-h-[160px] flex items-center justify-center overflow-hidden border ${
              flipping
                ? 'bg-gradient-to-br from-slate-800 via-violet-950 to-[#1a0a18] border-[#c9a227]/30 animate-pulse'
                : coin === 'yes'
                  ? 'bg-gradient-to-br from-sky-300 via-indigo-200 to-amber-100 border-sky-300/50'
                  : 'bg-gradient-to-br from-red-950 via-orange-900 to-black border-orange-800/50'
            }`}
          >
            {flipping ? (
              <span className="text-6xl animate-coin-spin">🪙</span>
            ) : coin === 'yes' ? (
              <div className="text-center py-8 animate-fade-up">
                <p className="text-[10px] uppercase tracking-[0.25em] text-sky-900/70 font-bold">Heaven-scape</p>
                <p className="text-6xl font-black text-sky-950 drop-shadow-sm">YES</p>
              </div>
            ) : (
              <div className="text-center py-8 animate-fade-up">
                <p className="text-[10px] uppercase tracking-[0.25em] text-orange-200/70 font-bold">Hell-scape</p>
                <p className="text-6xl font-black text-orange-50 drop-shadow">NO</p>
              </div>
            )}
          </div>
        )}

        {result && mode !== 'coin' && (
          <div
            className={`mt-4 rounded-2xl p-5 text-center border animate-fade-up ${
              result.kind === 'proverb' || result.kind === 'locked'
                ? 'bg-indigo-50/90 text-indigo-950 italic border-indigo-100'
                : result.tone === 'yes'
                  ? 'bg-emerald-50 text-emerald-900 font-bold text-2xl border-emerald-100'
                  : result.tone === 'no'
                    ? 'bg-rose-50 text-rose-900 font-bold text-2xl border-rose-100'
                    : 'bg-amber-50 text-amber-950 font-bold text-xl border-amber-100'
            }`}
          >
            {result.text}
          </div>
        )}

        {(result || coin) && (
          <ShareBar
            title={mode === 'coin' ? 'Heaven & Ember' : 'Sanctum Sphere'}
            text={
              mode === 'coin'
                ? coin === 'yes'
                  ? 'Heaven-scape says YES'
                  : 'Hell-scape says NO'
                : `Sphere says: ${result?.text}`
            }
          />
        )}

        {user && (
          <p className="mt-3 text-center text-xs">
            <Link to="/dashboard" className="underline font-semibold text-[#4a1942]">
              Open dashboard for daily cookie fortune + celestial chart →
            </Link>
          </p>
        )}

        <p className="mt-3 text-[10px] text-center text-red-600">{DISCLAIMER}</p>
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        {tools.map((f) => (
          <Link
            key={f.path + f.name}
            to={f.path}
            className="card p-4 hover:-translate-y-0.5 active:translate-y-0 transition-transform"
          >
            <p className="font-display font-bold text-[#4a1942] text-lg">
              <span className="mr-1.5">{f.emoji}</span>
              {f.name}
              {f.pro && <span className="chip-pro ml-2 align-middle">Pro · free peek</span>}
            </p>
            <p className="text-xs text-[#4a1942]/65 mt-1 leading-relaxed">{f.tagline}</p>
            <p className="text-[10px] text-[#c9a227] mt-2 font-bold uppercase tracking-wide">{f.count}</p>
          </Link>
        ))}
      </section>

      <section className="card p-4">
        <h2 className="font-display font-bold text-lg text-[#4a1942]">Guides for seekers (SEO + lore)</h2>
        <ul className="mt-2 space-y-1 text-sm">
          <li>
            <Link className="underline text-[#4a1942]" to="/guides">
              All Magic Sanctum guides
            </Link>
          </li>
          <li>
            <Link className="underline" to="/guides/hearth-court">
              How Hearth Court works
            </Link>
          </li>
          <li>
            <Link className="underline" to="/guides/familiar-whisperer">
              Familiar Whisperer explained
            </Link>
          </li>
          <li>
            <Link className="underline" to="/legal">
              Policies & entertainment disclaimers
            </Link>
          </li>
        </ul>
      </section>

      {!isPremium && (
        <div className="card p-4 text-center bg-gradient-to-br from-[#4a1942]/5 to-[#c9a227]/10">
          <p className="text-sm text-[#4a1942]/80">
            Free forever: Sphere, Heaven & Ember, Cauldron journal, daily ink, sneak peeks.
            <br />
            Pro: full 2k+ libraries + Hearth posts — same plan as the apothecary.
          </p>
          <a href={HAZEL_LINKS.proUpgrade()} className="btn-primary mt-3 inline-flex">
            Become Pro
          </a>
        </div>
      )}

      <ApothecaryFunnel />
    </div>
  );
}
