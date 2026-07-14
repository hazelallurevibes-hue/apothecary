import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import ShareBar from '../components/ShareBar';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import { freeMoonPhase, moodReading } from '../lib/freeTools';
import { unlockAchievement } from '../lib/achievements';
import { recordHistory } from '../lib/historyStore';
import { DISCLAIMER } from '../lib/brand';
import { HAZEL_LINKS } from '../lib/hazel';

/** Free mood + moon snapshot — daily open, install hook */
export default function MoodMeter() {
  const [energy, setEnergy] = useState(5);
  const [peace, setPeace] = useState(5);
  const [connection, setConnection] = useState(5);
  const [saved, setSaved] = useState(null);
  const moon = useMemo(() => freeMoonPhase(), []);
  const live = moodReading({ energy, peace, connection });

  const seal = () => {
    const r = moodReading({ energy, peace, connection });
    setSaved(r);
    unlockAchievement('first_mood');
    recordHistory({
      type: 'mood',
      title: 'Mood Meter',
      summary: r.vibe,
      payload: { ...r, moon },
    });
  };

  return (
    <div className="space-y-4">
      <SeoHead
        title="Mood Meter & Moon Phase — Free Daily Check-In | Magic Sanctum"
        description="Slide energy, peace, and connection for a playful reading. Free moon phase ink. Install the app for a daily porch ritual."
        path="/mood"
      />
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">Free · daily open</p>
        <h1 className="font-display font-bold text-3xl text-[#4a1942]">Mood Meter</h1>
        <p className="text-sm text-[#4a1942]/65 mt-1">
          A 10-second check-in worth opening the app for. Soft, pretty, not clinical — when talks get hard,
          Before the Storm (Pro) goes deeper.
        </p>
      </div>

      <div className="card card-glow p-4 flex items-center gap-3">
        <span className="text-3xl" aria-hidden>
          {moon.emoji}
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#c9a227]">{moon.seal}</p>
          <p className="font-display font-bold text-lg text-[#4a1942]">{moon.name}</p>
          <p className="text-xs text-[#4a1942]/60">{moon.tip}</p>
        </div>
      </div>

      <div className="card p-4 space-y-4">
        {[
          { id: 'energy', label: 'Energy', value: energy, set: setEnergy },
          { id: 'peace', label: 'Peace', value: peace, set: setPeace },
          { id: 'connection', label: 'Connection', value: connection, set: setConnection },
        ].map((s) => (
          <div key={s.id}>
            <div className="flex justify-between text-xs font-bold text-[#4a1942]">
              <span>{s.label}</span>
              <span>{s.value}/10</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={s.value}
              onChange={(e) => s.set(Number(e.target.value))}
              className="w-full accent-[#4a1942]"
            />
          </div>
        ))}
        <div className="rounded-xl bg-[#4a1942]/5 p-3 text-sm">
          <p className="font-display font-bold text-[#4a1942]">{live.vibe}</p>
          <p className="text-xs text-[#4a1942]/55 mt-1">Avg {live.avg} · live preview</p>
        </div>
        <button type="button" className="btn-primary w-full" onClick={seal}>
          Seal today&apos;s reading
        </button>
      </div>

      {saved && (
        <div className="card p-5 space-y-2 border-[#c9a227]/30">
          <p className="text-[10px] font-black uppercase text-[#c9a227]">Sealed</p>
          <p className="font-display text-2xl font-bold text-[#4a1942]">{saved.vibe}</p>
          <ul className="text-sm text-[#4a1942]/75 space-y-1">
            {saved.tips.map((t) => (
              <li key={t}>· {t}</li>
            ))}
          </ul>
          <p className="text-xs text-[#4a1942]/50">{saved.blurb}</p>
          <ShareBar title="Mood Meter" text={`Today’s sanctum vibe: ${saved.vibe}`} />
          <div className="flex flex-wrap gap-2 pt-1">
            <Link to="/before-the-storm" className="btn-secondary text-xs">
              Peek Before the Storm
            </Link>
            <a href={HAZEL_LINKS.proUpgrade()} className="btn-gold text-xs">
              Go Pro
            </a>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        <Link to="/dice" className="btn-secondary py-1.5 px-3">
          Dice
        </Link>
        <Link to="/this-or-that" className="btn-secondary py-1.5 px-3">
          This or That
        </Link>
        <Link to="/hearth-court" className="btn-secondary py-1.5 px-3">
          Free Court
        </Link>
        <Link to="/widget" className="btn-gold py-1.5 px-3">
          Desk Orb
        </Link>
      </div>
      <p className="text-[10px] text-red-600">{DISCLAIMER}</p>
      <ApothecaryFunnel variant="compact" />
    </div>
  );
}
