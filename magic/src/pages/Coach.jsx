import { useState } from 'react';
import ProGate from '../components/ProGate';
import { coachArgument } from '../lib/engines';

const SITUATIONS = [
  'chores',
  'money',
  'in-laws',
  'plans',
  'tone of voice',
  'lateness',
  'phones at dinner',
  'work stress',
  'boundaries',
  'holidays',
  'friend drama',
  'parenting style',
];

const STAGES = [
  'you feel unheard',
  'they feel attacked',
  'both are tired',
  'timing is wrong',
  'pride is in the room',
  'someone needs a pause',
  'feelings are loud',
  'facts are fuzzy',
];

export default function Coach() {
  const [situation, setSituation] = useState(SITUATIONS[0]);
  const [stage, setStage] = useState(STAGES[0]);
  const [detail, setDetail] = useState('');
  const [out, setOut] = useState(null);

  const run = () => setOut(coachArgument({ situation, stage, detail }));

  return (
    <ProGate
      featureId="pre_argument"
      teaser="Filter 1000+ offline insights by situation and vibe — prep before a hard talk, or reflect after."
    >
      <div className="space-y-4">
        <h1 className="font-display font-bold text-2xl text-[#4a1942]">Pre-argument coach</h1>
        <p className="text-sm text-[#4a1942]/65">
          Going into a hard conversation — or replaying one? Answer a few filters. Get openers,
          cliff notes, and “what might have helped” lines from a large scripted library.
        </p>

        <div className="card p-4 space-y-3">
          <label className="text-xs font-bold uppercase text-[#4a1942]/50">Situation</label>
          <select className="input" value={situation} onChange={(e) => setSituation(e.target.value)}>
            {SITUATIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label className="text-xs font-bold uppercase text-[#4a1942]/50">What is true right now?</label>
          <select className="input" value={stage} onChange={(e) => setStage(e.target.value)}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label className="text-xs font-bold uppercase text-[#4a1942]/50">Optional detail</label>
          <textarea
            className="textarea"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="One sentence context…"
            maxLength={300}
          />

          <button type="button" className="btn-primary w-full" onClick={run}>
            Draw insight
          </button>
        </div>

        {out?.primary && (
          <div className="card p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-[#4a1942]/50">
              Primary card · library {out.librarySize}
            </p>
            <p className="font-semibold text-[#4a1942]">{out.primary.opener}</p>
            <p className="text-sm text-[#4a1942]/80">{out.primary.insight}</p>
            <p className="text-sm italic text-[#4a1942]/70">{out.primary.shouldHaveSaid}</p>
            <p className="text-xs text-[#4a1942]/55">{out.primary.blurb}</p>

            <div className="border-t border-[#4a1942]/10 pt-3 space-y-2">
              <p className="text-xs font-bold uppercase text-[#4a1942]/40">More cards</p>
              {out.alternatives.map((a, i) => (
                <div key={i} className="rounded-xl bg-[#4a1942]/5 p-3 text-xs text-[#4a1942]/80">
                  {a.opener} — {a.insight}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-red-600">{out.disclaimer}</p>
          </div>
        )}
      </div>
    </ProGate>
  );
}
