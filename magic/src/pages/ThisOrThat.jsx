import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import ShareBar from '../components/ShareBar';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import { thisOrThatPick } from '../lib/freeTools';
import { unlockAchievement } from '../lib/achievements';
import { recordHistory } from '../lib/historyStore';
import { DISCLAIMER } from '../lib/brand';

/** Free viral This-or-That — pass the phone energy */
export default function ThisOrThat() {
  const [a, setA] = useState('Stay in');
  const [b, setB] = useState('Go out');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const flip = () => {
    setBusy(true);
    setResult(null);
    setTimeout(() => {
      const r = thisOrThatPick(a, b);
      setResult(r);
      setBusy(false);
      unlockAchievement('first_this_or_that');
      recordHistory({
        type: 'this_or_that',
        title: 'This or That',
        summary: r.winner,
        payload: r,
      });
    }, 450);
  };

  return (
    <div className="space-y-4">
      <SeoHead
        title="This or That — Free Viral Picker | Magic Sanctum"
        description="Two options. One playful winner. Free, shareable, perfect for group chats and the installed app."
        path="/this-or-that"
      />
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">Free · pass the phone</p>
        <h1 className="font-display font-bold text-3xl text-[#4a1942]">This or That</h1>
        <p className="text-sm text-[#4a1942]/65 mt-1">
          Two choices. Theatrical pick. Rematch forever. Pair with Hearth Court when the debate needs real
          sides and a computer ruling.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase text-[#4a1942]/45">This</p>
          <input className="input" value={a} onChange={(e) => setA(e.target.value)} maxLength={80} />
        </div>
        <div className="card p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase text-[#4a1942]/45">That</p>
          <input className="input" value={b} onChange={(e) => setB(e.target.value)} maxLength={80} />
        </div>
      </div>

      <button type="button" className="btn-primary w-full py-3" onClick={flip} disabled={busy}>
        {busy ? 'Choosing…' : 'Pick one'}
      </button>

      {result && (
        <div className="card card-glow p-6 text-center space-y-3 border-[#c9a227]/35">
          <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-black">Winner</p>
          <p className="font-display text-3xl font-bold text-[#4a1942]">{result.winner}</p>
          <p className="text-xs text-[#4a1942]/45">Not chosen: {result.loser}</p>
          <p className="text-xs text-[#4a1942]/55">{result.blurb}</p>
          <ShareBar title="This or That" text={`${result.winner} beat ${result.loser} on Magic Sanctum`} />
          <button type="button" className="btn-secondary text-xs" onClick={flip}>
            Rematch
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        <Link to="/dice" className="btn-secondary py-1.5 px-3">
          Sanctum Dice
        </Link>
        <Link to="/hearth-court" className="btn-secondary py-1.5 px-3">
          Hearth Court free vote
        </Link>
        <Link to="/mood" className="btn-secondary py-1.5 px-3">
          Mood Meter
        </Link>
      </div>
      <p className="text-[10px] text-red-600">{DISCLAIMER}</p>
      <ApothecaryFunnel variant="compact" />
    </div>
  );
}
