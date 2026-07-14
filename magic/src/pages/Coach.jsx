import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProGate from '../components/ProGate';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import SeoHead from '../components/SeoHead';
import ProValueStrip from '../components/ProValueStrip';
import { coachArgument, packStats } from '../lib/engines';
import { BRAND, DISCLAIMER } from '../lib/brand';
import ShareBar from '../components/ShareBar';
import { unlockAchievement } from '../lib/achievements';
import { recordHistory } from '../lib/historyStore';

const SITUATIONS = [
  'chores', 'money', 'in-laws', 'plans', 'tone of voice', 'lateness', 'phones at dinner',
  'work stress', 'boundaries', 'holidays', 'friend drama', 'parenting style', 'emotional labor',
  'shared calendar chaos', 'family group chat',
];

const STAGES = [
  'you feel unheard', 'they feel attacked', 'both are tired', 'timing is wrong',
  'pride is in the room', 'someone needs a pause', 'feelings are loud', 'facts are fuzzy',
  'scorekeeping started', 'a boundary was crossed',
];

export default function Coach() {
  const [situation, setSituation] = useState(SITUATIONS[0]);
  const [stage, setStage] = useState(STAGES[0]);
  const [detail, setDetail] = useState('');
  const [out, setOut] = useState(null);
  const stats = packStats();
  const b = BRAND.coach;

  return (
    <>
      <SeoHead
        title={`${b.name} — Pre-Argument Coach (${stats.coachEntries || '2800+'} Insights)`}
        description={b.tagline}
        path="/before-the-storm"
        keywords="before the storm, what to say in an argument, communication scripts, conflict tips"
      />
      <ProGate
        featureId="before_the_storm"
        teaser={`${b.name}: free showcase draws a complete, beautiful card. Pro unlocks ${stats.coachEntries || '2,800+'} filtered insights + alternate cards every draw.`}
      >
        {({ peek }) => (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">
                {b.emoji} Prep ritual
              </p>
              <h1 className="font-display font-bold text-3xl text-[#4a1942]">{b.name}</h1>
              <p className="text-sm text-[#4a1942]/65 mt-1">{b.tagline}</p>
              <p className="text-xs text-[#4a1942]/50 mt-1">
                {stats.coachEntries || '—'} insights ·{' '}
                <Link to="/guides/before-the-storm" className="underline">
                  guide
                </Link>
              </p>
            </div>

            <div className="card p-4 space-y-3">
              <label className="text-xs font-bold uppercase text-[#4a1942]/50">Situation</label>
              <select
                className="input"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                disabled={peek}
              >
                {SITUATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {peek && (
                <p className="text-[10px] text-[#4a1942]/50">
                  Showcase uses curated situations — Pro filters the full deck to your exact vibe.
                </p>
              )}

              <label className="text-xs font-bold uppercase text-[#4a1942]/50">What is true right now?</label>
              <select
                className="input"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                disabled={peek}
              >
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
                disabled={peek}
              />

              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => {
                  const o = coachArgument({ situation, stage, detail, freePeek: peek });
                  setOut(o);
                  unlockAchievement('first_storm');
                  if (peek) unlockAchievement('pro_showcase');
                  recordHistory({
                    type: 'storm',
                    title: 'Before the Storm',
                    summary: o.primary?.opener?.slice(0, 100),
                    payload: { situation, stage, ...o },
                  });
                }}
              >
                {peek ? 'Reveal showcase card' : 'Draw full storm deck'}
              </button>
            </div>

            {out?.primary && (
              <div className="card card-glow p-5 space-y-3 border-[#c9a227]/30">
                <p className="text-[10px] uppercase tracking-widest text-[#4a1942]/50">
                  {out.freePeek ? 'Showcase card' : 'Primary card'} · library {out.librarySize}
                </p>
                <p className="font-semibold text-[#4a1942] text-lg leading-snug">{out.primary.opener}</p>
                <p className="text-sm text-[#4a1942]/80 leading-relaxed">{out.primary.insight}</p>
                <p className="text-sm italic text-[#4a1942]/70 leading-relaxed">{out.primary.shouldHaveSaid}</p>
                {out.primary.ritual && (
                  <p className="text-xs font-bold text-[#c9a227] rounded-xl bg-amber-50/80 border border-amber-100 px-3 py-2">
                    Ritual · {out.primary.ritual}
                  </p>
                )}
                <p className="text-xs text-[#4a1942]/55">{out.primary.blurb}</p>

                {out.alternatives?.length > 0 && (
                  <div className="border-t border-[#4a1942]/10 pt-3 space-y-2">
                    <p className="text-xs font-bold uppercase text-[#4a1942]/40">More Pro cards</p>
                    {out.alternatives.map((a, i) => (
                      <div key={i} className="rounded-xl bg-[#4a1942]/5 p-3 text-xs text-[#4a1942]/80 leading-relaxed">
                        <p className="font-semibold">{a.opener}</p>
                        <p className="mt-1 opacity-80">{a.insight}</p>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-red-600">{out.disclaimer || DISCLAIMER}</p>
                <ShareBar
                  title="Before the Storm"
                  text={`${out.primary.opener} ${out.primary.insight}`}
                />
                <ProValueStrip
                  freePeek={out.freePeek}
                  unlocks={out.proUnlocks}
                  title="Pro draws a whole storm deck"
                />
              </div>
            )}

            <ApothecaryFunnel variant="compact" />
          </div>
        )}
      </ProGate>
    </>
  );
}
