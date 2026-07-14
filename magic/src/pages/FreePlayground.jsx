import { Link } from 'react-router-dom';
import { freeDailyLine, packStats, askOracle, flipCoin } from '../lib/engines';
import { useState } from 'react';
import SeoHead from '../components/SeoHead';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import { DISCLAIMER } from '../lib/brand';

/** Unhinged free layer for acquisition */
export default function FreePlayground() {
  const stats = packStats();
  const [spark, setSpark] = useState(null);
  const [coin, setCoin] = useState(null);

  return (
    <div className="space-y-5">
      <SeoHead
        title="Free Magic Sanctum Playground — Sphere, Coin, Daily Ink | Hazel Allure"
        description="No paywall for the fun layer. Free sanctum tools that lead seekers to the apothecary and Pro libraries."
        path="/free"
      />
      <h1 className="font-display font-bold text-3xl text-[#4a1942]">Free playground</h1>
      <p className="text-sm text-[#4a1942]/65">
        We went unhinged (affectionately). Free content everywhere — so you stay, laugh, then wander
        into the apothecary when ready.
      </p>

      <div className="card p-4 border-[#c9a227]/40">
        <p className="text-[10px] font-black uppercase text-[#c9a227]">Today&apos;s free ink</p>
        <p className="italic text-[#4a1942] mt-1">{freeDailyLine()}</p>
      </div>

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
        </div>
      </div>

      <div className="card p-4 text-sm space-y-2">
        <h2 className="font-display font-bold text-lg">Unhinged free ideas we actually shipped</h2>
        <ul className="list-disc pl-5 text-[#4a1942]/75 space-y-1">
          <li>Daily free moon ink on the home porch</li>
          <li>Heaven-scape / hell-scape coin theater</li>
          <li>Desk Orb PWA companion at /widget</li>
          <li>Long-form guides for every tool (SEO + lore)</li>
          <li>Frustration Cauldron private journal free forever</li>
          <li>Apothecary funnel strips after every laugh</li>
        </ul>
      </div>

      <p className="text-[10px] text-red-600">{DISCLAIMER}</p>
      <ApothecaryFunnel />
    </div>
  );
}
