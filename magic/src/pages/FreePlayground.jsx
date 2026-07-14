import { Link } from 'react-router-dom';
import { freeDailyLine, packStats, askOracle, flipCoin } from '../lib/engines';
import { useState } from 'react';
import SeoHead from '../components/SeoHead';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import ToolGrid from '../components/ToolGrid';
import { DISCLAIMER } from '../lib/brand';
import { HAZEL_LINKS } from '../lib/hazel';
import { FREE_VALUE_PITCH } from '../lib/freeTools';

/** Unhinged free layer for acquisition + install conversion */
export default function FreePlayground() {
  const stats = packStats();
  const [spark, setSpark] = useState(null);
  const [coin, setCoin] = useState(null);

  return (
    <div className="space-y-5">
      <SeoHead
        title="Free Magic Sanctum — Court, Dice, Mood, Sphere & App Tools"
        description="Robust free tier: Hearth Court vote + computer ruling, Sanctum Dice, This-or-That, Mood Meter, Desk Orb. Pro libraries still convert hard."
        path="/free"
      />
      <h1 className="font-display font-bold text-3xl text-[#4a1942]">Free playground</h1>
      <p className="text-sm text-[#4a1942]/65">
        Free is genuinely useful — so the app is worth installing. Pro is endless libraries and live multi-device
        theater when you outgrow the porch.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link to="/hearth-court" className="btn-primary text-xs py-1.5 px-3">
          Free Court (vote)
        </Link>
        <Link to="/dice" className="btn-secondary text-xs py-1.5 px-3">
          Dice
        </Link>
        <Link to="/this-or-that" className="btn-secondary text-xs py-1.5 px-3">
          This or That
        </Link>
        <Link to="/mood" className="btn-secondary text-xs py-1.5 px-3">
          Mood Meter
        </Link>
        <Link to="/widget" className="btn-gold text-xs py-1.5 px-3">
          Desk Orb
        </Link>
        <Link to="/settings" className="btn-secondary text-xs py-1.5 px-3">
          Install app
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card p-4 border-emerald-200/60">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Free is valuable</p>
          <ul className="mt-2 space-y-1.5 text-xs text-[#4a1942]/80">
            {FREE_VALUE_PITCH.free.map((line) => (
              <li key={line} className="flex gap-1.5">
                <span className="text-emerald-700 font-black">✓</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4 border-[#c9a227]/40 bg-gradient-to-br from-amber-50/50 to-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#c9a227]">Why people still go Pro</p>
          <ul className="mt-2 space-y-1.5 text-xs text-[#4a1942]/80">
            {FREE_VALUE_PITCH.pro.map((line) => (
              <li key={line} className="flex gap-1.5">
                <span className="text-[#c9a227] font-black">✦</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <a href={HAZEL_LINKS.proUpgrade()} className="btn-gold text-xs mt-3 inline-flex">
            Unlock Pro
          </a>
        </div>
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
        <h2 className="font-display font-bold text-lg">Free Court + Pro showcases</h2>
        <p className="text-sm text-[#4a1942]/65 mt-1">
          <strong>Hearth Court is free</strong> for 2 sides, votes, and a computer ruling. Familiar Whisperer &amp;
          Before the Storm still offer full showcase samples — Pro unlocks{' '}
          {stats.petPhrases || '2800'}+ / {stats.coachEntries || '2800'}+ / {stats.settlerCliff || '2800'}+ lines
          plus live multi-device court.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link to="/hearth-court" className="btn-primary text-xs">
            Free Court now
          </Link>
          <Link to="/familiar" className="btn-secondary text-xs">
            Familiar showcase
          </Link>
          <Link to="/before-the-storm" className="btn-secondary text-xs">
            Storm showcase
          </Link>
          <a href={HAZEL_LINKS.proUpgrade()} className="btn-gold text-xs">
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
