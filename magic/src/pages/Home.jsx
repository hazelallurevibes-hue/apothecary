import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { askOracle, askMoonMirror, flipCoin, freeDailyLine, packStats } from '../lib/engines';
import { HAZEL_LINKS } from '../lib/hazel';
import { BRAND, DISCLAIMER } from '../lib/brand';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import SeoHead from '../components/SeoHead';
import JsonLd from '../components/JsonLd';
import ShareBar from '../components/ShareBar';
import ToolGrid from '../components/ToolGrid';
import SanctumLogo from '../components/SanctumLogo';
import ProValueStrip from '../components/ProValueStrip';
import { unlockAchievement } from '../lib/achievements';
import { recordHistory } from '../lib/historyStore';

/** Rotating feature spotlight under the sphere — cycles by day + slot */
const ROTATING_FEATURES = [
  {
    to: '/hearth-court',
    emoji: '☽',
    title: 'Hearth Court',
    blurb: 'Name two paths. Cast stones. Receive an oracle seal — free decision ritual.',
    chip: 'Free circle',
  },
  {
    to: '/pathfinder',
    emoji: '🗺',
    title: 'Pathfinder',
    blurb: 'Career tracks, money literacy seals, and a Path & Personality spark.',
    chip: 'Career & path',
  },
  {
    to: '/compatibility',
    emoji: '💞',
    title: 'Chart Harmony',
    blurb: 'Two birthdays → elements, animals, money rhythm, career weave.',
    chip: 'Harmony',
  },
  {
    to: '/dice',
    emoji: '🎲',
    title: 'Sanctum Dice',
    blurb: 'List options. Let the dice choose. Free forever.',
    chip: 'Free forever',
  },
  {
    to: '/before-the-storm',
    emoji: '🕯',
    title: 'Before the Storm',
    blurb: 'Words before a hard talk — free showcase, Pro full deck.',
    chip: 'Prep',
  },
  {
    to: '/familiar',
    emoji: '🐾',
    title: 'Familiar Whisperer',
    blurb: 'What is your familiar actually plotting? Whimsy with a Pro vault.',
    chip: 'Pets',
  },
  {
    to: '/mood',
    emoji: '🌙',
    title: 'Mood Meter',
    blurb: 'Energy · peace · connection plus free moon-phase ink.',
    chip: 'Check-in',
  },
  {
    to: '/widget',
    emoji: '🖥',
    title: 'Desk Orb',
    blurb: 'Pin a sphere on any desk — widget + standalone HTML.',
    chip: 'Install',
  },
  {
    to: '/this-or-that',
    emoji: '⚡',
    title: 'This or That',
    blurb: 'Two options. One theatrical pick. Pass the phone.',
    chip: 'Social',
  },
  {
    to: '/oracle/daily',
    emoji: '✨',
    title: 'Daily Oracle',
    blurb: 'One free ink line for the day — ritual without the paywall.',
    chip: 'Daily',
  },
];

function daySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export default function Home() {
  const { isPremium, can, user } = useAuth();
  const [params, setParams] = useSearchParams();
  const modeParam = params.get('mode');
  const [mode, setMode] = useState(modeParam === 'coin' ? 'coin' : modeParam === 'reverse' ? 'reverse' : 'classic');
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [coin, setCoin] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [sphereTaps, setSphereTaps] = useState(0);
  const [gild, setGild] = useState(false);
  const [rotateSlot, setRotateSlot] = useState(0);
  const stats = packStats();
  const daily = freeDailyLine();

  const spotlight = useMemo(() => {
    const base = daySeed() % ROTATING_FEATURES.length;
    const idx = (base + rotateSlot) % ROTATING_FEATURES.length;
    const next = ROTATING_FEATURES[(idx + 1) % ROTATING_FEATURES.length];
    const third = ROTATING_FEATURES[(idx + 2) % ROTATING_FEATURES.length];
    return [ROTATING_FEATURES[idx], next, third];
  }, [rotateSlot]);

  useEffect(() => {
    if (modeParam === 'coin') setMode('coin');
    else if (modeParam === 'reverse') setMode('reverse');
  }, [modeParam]);

  // Auto-rotate feature cards under the sphere every 8s
  useEffect(() => {
    const t = setInterval(() => setRotateSlot((s) => s + 1), 8000);
    return () => clearInterval(t);
  }, []);

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
    if (mode === 'reverse') {
      setCoin(null);
      const freePeek = !can('reverse_oracle');
      const ans = freePeek
        ? askMoonMirror(q, { freePeek: true })
        : askMoonMirror(q, { freePeek: false });
      setResult(ans);
      unlockAchievement('first_sphere');
      if (freePeek) unlockAchievement('pro_showcase');
      recordHistory({
        type: 'sphere',
        title: freePeek ? 'Moon Mirror showcase' : 'Moon Mirror',
        summary: ans.text,
        payload: { question: q, answer: ans.text, mode, freePeek },
      });
      return;
    }
    setCoin(null);
    const ans = askOracle(q, 'classic');
    setResult(ans);
    unlockAchievement('first_sphere');
    recordHistory({
      type: 'sphere',
      title: 'Sanctum Sphere',
      summary: ans.text,
      payload: { question: q, answer: ans.text, mode },
    });
  };

  const onSphereTap = () => {
    const next = sphereTaps + 1;
    setSphereTaps(next);
    if (next >= 3) {
      setSphereTaps(0);
      setGild(true);
      unlockAchievement('sphere_secret');
      setTimeout(() => setGild(false), 1200);
    }
    reveal();
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
            'Free magic 8 ball style sphere, heaven/ember coin flip, desk orb widget, Hearth Court decision circle, Pathfinder career map, and Pro libraries for familiar whispers and storm prep.',
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
          <Link to="/hearth-court" className="btn-primary text-xs py-1.5 px-3">
            Free Court · oracle seal
          </Link>
          <Link to="/pathfinder" className="btn-secondary text-xs py-1.5 px-3">
            Pathfinder
          </Link>
          <Link to="/widget" className="btn-gold text-xs py-1.5 px-3">
            Desk Orb
          </Link>
          <Link to="/free" className="btn-secondary text-xs py-1.5 px-3">
            All free tools
          </Link>
          {!user && (
            <Link to="/auth" className="btn-secondary text-xs py-1.5 px-3">
              Sign in
            </Link>
          )}
        </div>
      </section>

      {mode !== 'coin' && (
        <div className="flex flex-col items-center animate-fade-up-delay py-2">
          <button
            type="button"
            onClick={onSphereTap}
            className={`sanctum-sphere cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227] focus-visible:ring-offset-2 rounded-full border-0 p-0 ${gild ? 'gild-flash' : ''}`}
            aria-label="Tap sphere to reveal YES, NO, or MAYBE"
          >
            <div className="sanctum-sphere-window">
              {result?.text
                ? result.text.length > 22
                  ? `${result.text.slice(0, 20)}…`
                  : result.text
                : '⑧'}
            </div>
          </button>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4a1942]/45">
            Tap for YES · NO · MAYBE
          </p>
          <Link
            to={BRAND.sphere.guide}
            className="text-[11px] underline text-[#4a1942]/55 mt-1 hover:text-[#4a1942]"
          >
            How the Sanctum Sphere works →
          </Link>

          {/* Rotating feature discovery under the 8-ball */}
          <div className="w-full max-w-md mt-5 space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a227]">
                Discover · rotates
              </p>
              <button
                type="button"
                className="text-[10px] font-bold underline text-[#4a1942]/50 hover:text-[#4a1942]"
                onClick={() => setRotateSlot((s) => s + 1)}
              >
                Next features
              </button>
            </div>
            <div className="grid gap-2">
              {spotlight.map((f, i) => (
                <Link
                  key={`${f.to}-${i}-${rotateSlot}`}
                  to={f.to}
                  className={`block rounded-2xl border px-3.5 py-3 text-left transition hover:shadow-md ${
                    i === 0
                      ? 'border-[#c9a227]/50 bg-gradient-to-r from-amber-50/90 to-white'
                      : 'border-[#4a1942]/12 bg-white/80 hover:border-[#c9a227]/35'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl leading-none mt-0.5" aria-hidden>
                      {f.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-sm text-[#4a1942]">{f.title}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider rounded-full bg-[#4a1942]/8 text-[#4a1942]/70 px-2 py-0.5">
                          {f.chip}
                        </span>
                      </div>
                      <p className="text-xs text-[#4a1942]/65 mt-0.5 leading-relaxed">{f.blurb}</p>
                    </div>
                    <span className="text-[#c9a227] text-sm font-bold shrink-0">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

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
            placeholder="Type your question… (or just tap the sphere)"
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
          {flipping ? 'Spinning the coin…' : mode === 'coin' ? 'Flip Heaven & Ember' : 'Reveal YES · NO · MAYBE'}
        </button>

        {/* Free daily ink — directly under the ask/reveal controls */}
        <Link
          to="/oracle/daily"
          className="mt-4 block rounded-xl border border-[#c9a227]/35 bg-gradient-to-r from-amber-50/90 to-white px-4 py-3 text-sm italic text-[#4a1942]/85 hover:border-[#c9a227]/60 transition"
        >
          <span className="not-italic font-bold text-[10px] uppercase tracking-widest text-[#c9a227] mr-2">
            Free daily ink
          </span>
          {daily}
          <span className="not-italic block text-[10px] font-bold text-[#4a1942]/45 mt-1.5">
            Open daily oracle →
          </span>
        </Link>

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
              result.kind === 'proverb'
                ? 'bg-indigo-50/90 text-indigo-950 italic border-indigo-100'
                : result.tone === 'yes'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-100'
                  : result.tone === 'no'
                    ? 'bg-rose-50 text-rose-900 border-rose-100'
                    : 'bg-amber-50 text-amber-950 border-amber-100'
            }`}
          >
            {result.kind !== 'proverb' && (
              <p className="text-[10px] not-italic font-black uppercase tracking-[0.2em] opacity-60 mb-1">
                {result.tone === 'yes' ? 'Yes' : result.tone === 'no' ? 'No' : 'Maybe'}
              </p>
            )}
            <p
              className={
                result.kind === 'proverb'
                  ? 'italic text-lg'
                  : 'font-black text-3xl sm:text-4xl tracking-wide'
              }
            >
              {result.text}
            </p>
            {(result.flavor || result.whisper) && (
              <p className="text-sm not-italic font-medium text-[#4a1942]/65 mt-2 leading-relaxed">
                {result.flavor || result.whisper}
              </p>
            )}
            {result.seal && (
              <p className="text-[10px] not-italic font-bold text-[#c9a227] mt-2 uppercase tracking-wide">
                {result.seal}
              </p>
            )}
            {result.alternatives?.length > 0 && (
              <div className="mt-3 not-italic text-left space-y-1.5">
                <p className="text-[10px] font-bold uppercase text-[#4a1942]/40">Pro alternate proverbs</p>
                {result.alternatives.map((a) => (
                  <p key={a} className="text-xs text-indigo-900/80 bg-white/60 rounded-lg px-2 py-1.5">
                    {a}
                  </p>
                ))}
              </div>
            )}
            {result.freePeek && (
              <div className="mt-3 not-italic text-left">
                <ProValueStrip
                  freePeek
                  unlocks={[
                    'Full Moon Mirror proverb vault',
                    'Alternate proverbs every reverse draw',
                    'Depth seals & share theater',
                  ]}
                  title="Pro Moon Mirror is a whole shelf of wisdom"
                />
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
