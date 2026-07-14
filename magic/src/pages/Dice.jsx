import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import ShareBar from '../components/ShareBar';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import { pickOption } from '../lib/freeTools';
import { unlockAchievement } from '../lib/achievements';
import { recordHistory } from '../lib/historyStore';
import { DISCLAIMER } from '../lib/brand';

/** Free Sanctum Dice — 2–6 options, viral, install-worthy */
export default function Dice() {
  const [raw, setRaw] = useState('Pizza\nTacos\nSushi');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const roll = () => {
    const options = raw.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
    setSpinning(true);
    setResult(null);
    setTimeout(() => {
      const r = pickOption(options);
      setResult(r);
      setSpinning(false);
      if (!r.error) {
        unlockAchievement('first_dice');
        recordHistory({
          type: 'dice',
          title: 'Sanctum Dice',
          summary: r.winner,
          payload: r,
        });
      }
    }, 700);
  };

  return (
    <div className="space-y-4">
      <SeoHead
        title="Sanctum Dice — Free Decision Picker | Magic Sanctum"
        description="List options, let the sanctum dice choose. Free, viral, perfect for the installed app."
        path="/dice"
      />
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">Free · viral</p>
        <h1 className="font-display font-bold text-3xl text-[#4a1942]">Sanctum Dice</h1>
        <p className="text-sm text-[#4a1942]/65 mt-1">
          Type 2–6 options (one per line). Perfect for dinner, date ideas, or “who texts first.” Install the app
          for one-tap dice on your home screen.
        </p>
      </div>

      <div className="card p-4 space-y-3">
        <label className="text-xs font-bold uppercase text-[#4a1942]/50">Options</label>
        <textarea
          className="textarea min-h-[120px]"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={'Option one\nOption two\nOption three'}
        />
        <button type="button" className="btn-primary w-full py-3" onClick={roll} disabled={spinning}>
          {spinning ? 'Rolling…' : 'Roll the sanctum dice'}
        </button>
      </div>

      {result?.error && <p className="text-sm text-red-600">{result.error}</p>}

      {result && !result.error && (
        <div className="card card-glow p-6 text-center space-y-2 border-[#c9a227]/35">
          <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-black">The dice chose</p>
          <p className="font-display text-3xl font-bold text-[#4a1942] animate-fade-up">{result.winner}</p>
          <p className="text-xs text-[#4a1942]/55">{result.blurb}</p>
          <ShareBar title="Sanctum Dice" text={`The sanctum dice chose: ${result.winner}`} />
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        <Link to="/this-or-that" className="btn-secondary py-1.5 px-3">
          This or That
        </Link>
        <Link to="/hearth-court" className="btn-secondary py-1.5 px-3">
          Hearth Court (vote)
        </Link>
        <Link to="/widget" className="btn-gold py-1.5 px-3">
          Desk Orb
        </Link>
        <Link to="/settings" className="underline text-[#4a1942]/60 py-1.5">
          Install app tips
        </Link>
      </div>
      <p className="text-[10px] text-red-600">{DISCLAIMER}</p>
      <ApothecaryFunnel variant="compact" />
    </div>
  );
}
