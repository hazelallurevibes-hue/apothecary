import { useState } from 'react';
import SeoHead from '../components/SeoHead';
import ShareBar from '../components/ShareBar';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import { computeCompatibility } from '../lib/compatibility';
import { recordHistory } from '../lib/historyStore';
import { unlockAchievement } from '../lib/achievements';
import { POLICY_BLURB } from '../lib/contentPolicy';
import { loadLocalProfile } from '../lib/profileStore';

export default function Compatibility() {
  const mine = loadLocalProfile();
  const [nameA, setNameA] = useState(mine?.birthName || 'You');
  const [dobA, setDobA] = useState(mine?.dob || '');
  const [nameB, setNameB] = useState('');
  const [dobB, setDobB] = useState('');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const run = () => {
    setErr('');
    try {
      const r = computeCompatibility(dobA, dobB, nameA, nameB || 'Them');
      setResult(r);
      recordHistory({
        type: 'compat',
        title: `Compatibility: ${nameA} × ${nameB || 'Them'}`,
        summary: `${r.score}% · ${r.vibe}`,
        payload: r,
      });
      unlockAchievement('first_fortune');
    } catch (e) {
      setErr(e.message || 'Could not compute');
    }
  };

  return (
    <div className="space-y-4">
      <SeoHead
        title="Chart Harmony — Two-Birthday Compatibility | Magic Sanctum"
        description="Entertainment compatibility from Western + Chinese charts. Consent required."
        path="/compatibility"
      />
      <h1 className="font-display font-bold text-3xl text-[#4a1942]">Chart harmony</h1>
      <p className="text-sm text-[#4a1942]/65">
        Two birthdays → playful score from elements, Chinese animals, and life paths. Get consent before
        using someone else’s date.
      </p>
      <p className="text-[10px] text-[#4a1942]/50">{POLICY_BLURB}</p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card p-4 space-y-2">
          <p className="text-xs font-bold uppercase text-[#4a1942]/45">Person A</p>
          <input className="input" value={nameA} onChange={(e) => setNameA(e.target.value)} placeholder="Name" />
          <input className="input" type="date" value={dobA} onChange={(e) => setDobA(e.target.value)} />
        </div>
        <div className="card p-4 space-y-2">
          <p className="text-xs font-bold uppercase text-[#4a1942]/45">Person B</p>
          <input className="input" value={nameB} onChange={(e) => setNameB(e.target.value)} placeholder="Name" />
          <input className="input" type="date" value={dobB} onChange={(e) => setDobB(e.target.value)} />
        </div>
      </div>

      <button type="button" className="btn-primary w-full" onClick={run}>
        Weave the charts
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}

      {result && (
        <div className="card p-5 space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-[#c9a227]">{result.vibe}</p>
          <p className="font-display text-5xl font-bold text-[#4a1942]">{result.score}%</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-[#4a1942]/5 p-3">
              <p className="font-bold">{result.a.name}</p>
              <p>
                {result.a.western.symbol} {result.a.western.sign}
              </p>
              <p>
                {result.a.chinese.emoji} {result.a.chinese.animal}
              </p>
            </div>
            <div className="rounded-xl bg-[#4a1942]/5 p-3">
              <p className="font-bold">{result.b.name}</p>
              <p>
                {result.b.western.symbol} {result.b.western.sign}
              </p>
              <p>
                {result.b.chinese.emoji} {result.b.chinese.animal}
              </p>
            </div>
          </div>
          <ul className="text-sm space-y-1 list-disc pl-4">
            {result.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p className="text-[10px] text-red-600">{result.disclaimer}</p>
          <ShareBar
            title="Chart harmony"
            text={`${result.a.name} × ${result.b.name}: ${result.score}% · ${result.vibe}`}
            meta={result.notes[0]}
          />
        </div>
      )}

      <ApothecaryFunnel variant="compact" />
    </div>
  );
}
