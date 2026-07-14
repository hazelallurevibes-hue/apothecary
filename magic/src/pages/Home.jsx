import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { askOracle, flipCoin, freeDailyLine, packStats } from '../lib/engines';
import { HAZEL_LINKS } from '../lib/hazel';
import { BRAND, DISCLAIMER } from '../lib/brand';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import SeoHead from '../components/SeoHead';
import JsonLd from '../components/JsonLd';
import ShareBar from '../components/ShareBar';
import ToolGrid from '../components/ToolGrid';
import SanctumLogo from '../components/SanctumLogo';
import { unlockAchievement } from '../lib/achievements';
import { recordHistory } from '../lib/historyStore';

export default function Home() {
  const { isPremium, can, user } = useAuth();
  const [params, setParams] = useSearchParams();
  const modeParam = params.get('mode');
  const [mode, setMode] = useState(modeParam === 'coin' ? 'coin' : modeParam === 'reverse' ? 'reverse' : 'classic');
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [coin, setCoin] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const stats = packStats();
  const daily = freeDailyLine();

  useEffect(() => {
    if (modeParam === 'coin') setMode('coin');
    else if (modeParam === 'reverse') setMode('reverse');
  }, [modeParam]);

  const setModeAndUrl = (id) => {
    setMode(id);
    setResult(null);
    setCoin(null);
    if (id === 'coin') setParams({ mode: 'coin' });
    else if (id === 'reverse') setParams({ mode: 'reverse' });
    else setParams({});
  };

  const reveal = () => {
    if (mode === 'coin') {
      setFlipping(true);
      setCoin(null);
      setResult(null);
      setTimeout(() => {
        const val = flipCoin();
        setCoin(val);
        setFlipping(false);
        unlockAchievement('first_coin');
        recordHistory({
          type: 'coin',
          title: 'Heaven & Ember',
          summary: val === 'yes' ? 'Heaven-scape YES' : 'Hell-scape NO',
          payload: { value: val },
        });
      }, 900);
      return;
    }
    if (mode === 'reverse' && !can('reverse_oracle')) {
      setResult({
        text: 'Moon Mirror Proverbs unlock with Pro — sneak a free sphere answer instead.',
        kind: 'locked',
      });
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

  return (
    <div className="space-y-6">
      <SeoHead
        title="Magic Sanctum — Free Sphere, Coin Flip & Pro Drama Tools | Hazel Allure"
        description="Sanctum Sphere, Heaven & Ember Coin, Hearth Court, Familiar Whisperer, Before the Storm. Free tools + Pro libraries. Desk Orb widget at /widget. Entertainment only."
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
            'Free magic 8 ball style sphere, heaven/ember coin flip, desk orb widget, and Pro tools for playful argument settling, pet translation, and pre-argument coaching.',
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
          the Storm — free peeks so you feel the magic first.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          <Link to="/widget" className="btn-gold text-xs py-1.5 px-3">
            Open Desk Orb widget
          </Link>
          <Link to="/free" className="btn-secondary text-xs py-1.5 px-3">
            Free playground
          </Link>
          <Link to="/guides" className="btn-secondary text-xs py-1.5 px-3">
            Read guides
          </Link>
          {!user && (
            <Link to="/auth" className="btn-primary text-xs py-1.5 px-3">
              Sign in
            </Link>
          )}
        </div>
      </section>

      {mode !== 'coin' && (
        <div className="flex flex-col items-center animate-fade-up-delay py-2">
          <button
            type="button"
            onClick={reveal}
            className="sanctum-sphere cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227] focus-visible:ring-offset-2 rounded-full border-0 p-0"
            aria-label="Tap sphere to reveal an answer"
          >
            <div className="sanctum-sphere-window">
              {result?.text
                ? result.text.length > 28
                  ? `${result.text.slice(0, 26)}…`
                  : result.text
                : '⑧'}
            </div>
          </button>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4a1942]/45">
            Tap the sphere · or type below
          </p>
          <Link
            to={BRAND.sphere.guide}
            className="text-[11px] underline text-[#4a1942]/55 mt-1 hover:text-[#4a1942]"
          >
            How the Sanctum Sphere works →
          </Link>
        </div>
      )}

      <Link
        to="/oracle/daily"
        className="card card-glow px-4 py-3 text-sm italic text-[#4a1942]/85 animate-fade-up-delay block hover:border-[#c9a227]/50 transition"
      >
        <span className="not-italic font-bold text-[10px] uppercase tracking-widest text-[#c9a227] mr-2">
          Free daily ink
        </span>
        {daily}
        <span className="not-italic block text-[10px] font-bold text-[#4a1942]/45 mt-1.5">
          Open daily oracle →
        </span>
      </Link>

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
              onClick={() => setModeAndUrl(m.id)}
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
          <div className="mb-3 space-y-2">
            <p className="text-xs text-[#4a1942]/70">
              One face: a <strong>heaven-scape YES</strong>. The other: a <strong>hell-scape NO</strong>.
              Free. Viral. Theatrical.
            </p>
            <Link to={BRAND.coin.guide} className="text-[11px] underline text-[#4a1942]/55">
              Coin flip guide →
            </Link>
          </div>
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
            {result.kind === 'locked' && (
              <div className="mt-3 not-italic flex flex-wrap justify-center gap-2">
                <a href={HAZEL_LINKS.proUpgrade()} className="btn-primary text-xs py-1.5 px-3">
                  Unlock Moon Mirror Pro
                </a>
                <button type="button" className="btn-secondary text-xs py-1.5 px-3" onClick={() => setModeAndUrl('classic')}>
                  Free sphere instead
                </button>
              </div>
            )}
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

        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
          <Link to="/dashboard" className="underline font-semibold text-[#4a1942]">
            {user ? 'Dashboard · fortune + history →' : 'Sign in for dashboard fortune →'}
          </Link>
          <Link to="/widget" className="underline font-semibold text-[#4a1942]">
            Desk Orb widget →
          </Link>
          <Link to="/compatibility" className="underline font-semibold text-[#4a1942]">
            Chart harmony →
          </Link>
        </div>

        <p className="mt-3 text-[10px] text-center text-red-600">{DISCLAIMER}</p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-xl text-[#4a1942]">Everything in the sanctum</h2>
          <Link to="/settings" className="text-xs underline text-[#4a1942]/60">
            All links
          </Link>
        </div>
        <ToolGrid />
      </section>

      <section className="card p-4">
        <h2 className="font-display font-bold text-lg text-[#4a1942]">Guides & next steps</h2>
        <ul className="mt-2 space-y-2 text-sm">
          <li>
            <Link className="underline font-semibold text-[#4a1942]" to="/guides">
              All Magic Sanctum guides
            </Link>
          </li>
          <li>
            <Link className="underline" to="/guides/hearth-court">
              How Hearth Court works
            </Link>
            {' · '}
            <Link className="underline" to="/hearth-court">
              Try it
            </Link>
          </li>
          <li>
            <Link className="underline" to="/guides/familiar-whisperer">
              Familiar Whisperer explained
            </Link>
            {' · '}
            <Link className="underline" to="/familiar">
              Try it
            </Link>
          </li>
          <li>
            <Link className="underline" to="/guides/desk-orb">
              Desk Orb widget guide
            </Link>
            {' · '}
            <Link className="underline" to="/widget">
              Open widget
            </Link>
          </li>
          <li>
            <Link className="underline" to="/legal">
              Policies & entertainment disclaimers
            </Link>
          </li>
          <li>
            <a className="underline" href={HAZEL_LINKS.marketplace()}>
              Shop the apothecary
            </a>
            {' · '}
            <a className="underline" href={HAZEL_LINKS.services()}>
              Book practitioners
            </a>
          </li>
        </ul>
        <p className="text-[10px] text-[#c9a227] mt-3 font-bold">
          Libraries: {stats.petPhrases}+ pet · {stats.coachEntries}+ coach · {stats.settlerCliff}+ court notes
        </p>
      </section>

      {!isPremium && (
        <div className="card p-4 text-center bg-gradient-to-br from-[#4a1942]/5 to-[#c9a227]/10">
          <div className="flex justify-center mb-2">
            <SanctumLogo size={36} decorative />
          </div>
          <p className="text-sm text-[#4a1942]/80">
            Free forever: Sphere, Heaven & Ember, Cauldron journal, daily ink, Desk Orb, sneak peeks.
            <br />
            Pro: full 2k+ libraries + Hearth posts — same plan as the apothecary.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <a href={HAZEL_LINKS.proUpgrade()} className="btn-primary">
              Become Pro
            </a>
            <Link to="/auth" className="btn-secondary">
              Sign in
            </Link>
          </div>
        </div>
      )}

      <ApothecaryFunnel />
    </div>
  );
}
