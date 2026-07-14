import { useState } from 'react';
import ProGate from '../components/ProGate';
import { settleArgument } from '../lib/engines';

const emptySide = () => ({ label: '', text: '' });

export default function Settler() {
  const [sides, setSides] = useState([
    { label: 'Side A', text: '' },
    { label: 'Side B', text: '' },
  ]);
  const [verdict, setVerdict] = useState(null);

  const setSide = (i, patch) => {
    setSides((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const addSide = () => {
    if (sides.length >= 4) return;
    setSides((s) => [...s, { label: `Side ${String.fromCharCode(65 + s.length)}`, text: '' }]);
  };

  const run = () => setVerdict(settleArgument(sides));

  return (
    <ProGate
      featureId="argument_settler"
      teaser="Drop 2–4 sides of a spat. The sanctum scores tone, specifics, and solutions — with cliff notes. Offline, no AI API."
    >
      <div className="space-y-4">
        <h1 className="font-display font-bold text-2xl text-[#4a1942]">Argument settler</h1>
        <p className="text-sm text-[#4a1942]/65">
          Enter each side. We score clarity, empathy, and forward motion — then name a playful winner
          (or a shared draw). Not court. Not therapy. Hearth theater.
        </p>

        {sides.map((s, i) => (
          <div key={i} className="card p-4 space-y-2">
            <input
              className="input"
              value={s.label}
              onChange={(e) => setSide(i, { label: e.target.value })}
              placeholder={`Side ${i + 1} name`}
            />
            <textarea
              className="textarea"
              value={s.text}
              onChange={(e) => setSide(i, { text: e.target.value })}
              placeholder="Their argument in their words…"
              maxLength={800}
            />
          </div>
        ))}

        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={addSide} disabled={sides.length >= 4}>
            Add side ({sides.length}/4)
          </button>
          <button type="button" className="btn-primary flex-1" onClick={run}>
            Settle it
          </button>
        </div>

        {verdict?.error && <p className="text-sm text-red-600">{verdict.error}</p>}

        {verdict && !verdict.error && (
          <div className="card p-5 space-y-3">
            <p className="font-display font-bold text-xl text-[#4a1942]">
              {verdict.shared
                ? 'Shared truth — both hold pieces'
                : `Playful edge: ${verdict.winner}`}
            </p>
            <p className="text-sm italic text-[#4a1942]/80">{verdict.cliffNote}</p>
            <p className="text-xs text-[#4a1942]/60">{verdict.template?.note}</p>
            <ul className="space-y-2">
              {verdict.sides.map((s) => (
                <li key={s.label} className="rounded-xl bg-[#4a1942]/5 p-3 text-sm">
                  <span className="font-bold">{s.label}</span>
                  <span className="text-[10px] ml-2 text-[#4a1942]/50">score {s.score}</span>
                  <ul className="mt-1 text-xs text-[#4a1942]/70 list-disc pl-4">
                    {s.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-red-600">{verdict.disclaimer}</p>
          </div>
        )}
      </div>
    </ProGate>
  );
}
