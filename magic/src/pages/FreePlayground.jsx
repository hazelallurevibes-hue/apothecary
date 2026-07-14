import { Link } from 'react-router-dom';
import { freeDailyLine, packStats, askOracle, flipCoin } from '../lib/engines';
import { useState } from 'react';
import SeoHead from '../components/SeoHead';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import ToolGrid from '../components/ToolGrid';
import { DISCLAIMER } from '../lib/brand';
import { HAZEL_LINKS } from '../lib/hazel';

/** Unhinged free layer for acquisition */
export default function FreePlayground() {
  const stats = packStats();
  const [spark, setSpark] = useState(null);
  const [coin, setCoin] = useState(null);

  return (
    <div className="space-y-5">
      <SeoHead
        title="Free Magic Sanctum Playground — Sphere, Coin, Daily Ink | Hazel Allure"
        description="No paywall for the fun layer. Free sanctum tools, Desk Orb widget, and peeks that lead seekers to the apothecary and Pro libraries."
        path="/free"
      />
      <h1 className="font-display font-bold text-3xl text-[#4a1942]">Free playground</h1>
      <p className="text-sm text-[#4a1942]/65">
        Free content everywhere — so you stay, laugh, then wander into the apothecary when ready.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link to="/" className="btn-primary text-xs py-1.5 px-3">
          Full sphere
        </Link>
        <Link to="/widget" className="btn-gold text-xs py-1.5 px-3">
          Desk Orb widget
        </Link>
        <Link to="/compatibility" className="btn-secondary text-xs py-1.5 px-3">
          Chart harmony
        </Link>
        <Link to="/auth" className="btn-secondary text-xs py-1.5 px-3">
          Sign in
        </Link>
      </div>

      <Link to="/oracle/daily" className="card p-4 border-[#c9a227]/40 block hover:border-[#c9a227]/70 transition">
        <p className="text-[10px] font-black uppercase text-[#c9a227]">Today&apos;s free ink</p>
        <p className="italic text-[#4a1942] mt-1">{freeDailyLine()}</p>
        <p className="text-[10px] font-bold text-[#4a1942]/45 mt-2 not-italic">Open daily oracle →</p>
      </Link>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          className="card p-4 text-left hover:border-[#4a1942]/40"
          onClick={() => setSpark(askOracle('free spark', 'classic'))}
        >
          <p className="font-bold text-[#4a1942]">One-tap sphere spark</p>
          <p className="text-xs text-[#4a1942]/60 mt-1">No typing. Pure chaos YES/NO/MAYBE.</p>
          {spark && <p className="mt-3 font-black text-2xl text-[#4a1942]">{spark.text}</p>}
        </button>
        <button
          type="button"
          className="card p-4 text-left hover:border-[#4a1942]/40"
          onClick={() => setCoin(flipCoin())}
        >
          <p className="font-bold text-[#4a1942]">Instant Heaven & Ember</p>
          <p className="text-xs text-[#4a1942]/60 mt-1">Tap for clouds or coals.</p>
          {coin && (
            <p className={`mt-3 font-black text-2xl ${coin === 'yes' ? 'text-sky-700' : 'text-orange-800'}`}>
              {coin === 'yes' ? 'YES · heaven' : 'NO · ember'}
            </p>
          )}
        </button>
      </div>
      <p className="text-xs text-center">
        <Link to="/?mode=coin" className="underline font-semibold text-[#4a1942]">
          Open full Heaven & Ember experience →
        </Link>
      </p>

      <div className="card p-4">
        <h2 className="font-display font-bold text-lg">Free sneak peeks of Pro</h2>
        <p className="text-sm text-[#4a1942]/65 mt-1">
          Hearth Court · Familiar Whisperer · Before the Storm — try truncated results, then unlock{' '}
          {stats.petPhrases || '2000'}+ / {stats.coachEntries || '2000'}+ / {stats.settlerCliff || '2000'}+
          lines with Pro.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link to="/hearth-court" className="btn-secondary text-xs">
            Peek Hearth Court
          </Link>
          <Link to="/familiar" className="btn-secondary text-xs">
            Peek Familiar Whisperer
          </Link>
          <Link to="/before-the-storm" className="btn-secondary text-xs">
            Peek Before the Storm
          </Link>
          <a href={HAZEL_LINKS.proUpgrade()} className="btn-primary text-xs">
            Unlock Pro
          </a>
        </div>
      </div>

      <div className="card p-4 space-y-2">
        <h2 className="font-display font-bold text-lg">Desk Orb widget</h2>
        <p className="text-sm text-[#4a1942]/65">
          Minimal sphere + coin companion — perfect for a pinned tab or after you install the app.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to="/widget" className="btn-gold text-xs">
            Open /widget
          </Link>
          <Link to="/settings" className="btn-secondary text-xs">
            Install tips
          </Link>
          <Link to="/guides/desk-orb" className="btn-secondary text-xs">
            Widget guide
          </Link>
        </div>
      </div>

      <section>
        <h2 className="font-display font-bold text-lg text-[#4a1942] mb-2">All free doors</h2>
        <ToolGrid />
      </section>

      <p className="text-[10px] text-red-600">{DISCLAIMER}</p>
      <ApothecaryFunnel />
    </div>
  );
}
