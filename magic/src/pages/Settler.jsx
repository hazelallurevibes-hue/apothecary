import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProGate from '../components/ProGate';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import SeoHead from '../components/SeoHead';
import { settleArgument, packStats } from '../lib/engines';
import { BRAND, DISCLAIMER } from '../lib/brand';

export default function Settler() {
  const [sides, setSides] = useState([
    { label: 'Side A', text: '' },
    { label: 'Side B', text: '' },
  ]);
  const [verdict, setVerdict] = useState(null);
  const stats = packStats();
  const b = BRAND.settler;

  const setSide = (i, patch) => {
    setSides((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const addSide = () => {
    if (sides.length >= 4) return;
    setSides((s) => [...s, { label: `Side ${String.fromCharCode(65 + s.length)}`, text: '' }]);
  };

  return (
    <>
      <SeoHead
        title={`${b.name} — Settle Arguments Playfully | Magic Sanctum`}
        description={`${b.tagline} ${stats.settlerCliff || '2000+'} cliff notes. Free sneak peeks. Entertainment only.`}
        path="/hearth-court"
        keywords="hearth court, argument settler, who is right, drama tribunal, hazel allure"
      />
      <ProGate
        featureId="hearth_court"
        teaser={`${b.name}: paste 2–4 sides. Offline scoring + ${stats.settlerCliff || '2000+'} cliff notes. Free sneak peek truncates the ruling — Pro unlocks the full tribunal.`}
      >
        {({ peek }) => (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">
                {b.emoji} Pro tool · free peek welcome
              </p>
              <h1 className="font-display font-bold text-3xl text-[#4a1942]">{b.name}</h1>
              <p className="text-sm text-[#4a1942]/65 mt-1">{b.tagline}</p>
              <p className="text-xs text-[#4a1942]/50 mt-1">
                Library: {stats.settlerCliff || '—'} cliff notes ·{' '}
                <Link to="/guides/hearth-court" className="underline">
                  SEO guide
                </Link>
              </p>
            </div>

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
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={() => setVerdict(settleArgument(sides, { freePeek: peek }))}
              >
                {peek ? 'Peek the ruling' : 'Convene Hearth Court'}
              </button>
            </div>

            {verdict?.error && <p className="text-sm text-red-600">{verdict.error}</p>}

            {verdict && !verdict.error && (
              <div className="card p-5 space-y-3 relative overflow-hidden">
                {peek && (
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
                <p className="font-display font-bold text-xl text-[#4a1942]">
                  {verdict.shared
                    ? 'Shared moon — both hold pieces'
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
                <p className="text-[10px] text-red-600">{verdict.disclaimer || DISCLAIMER}</p>
                {peek && (
                  <p className="text-xs font-semibold text-[#4a1942]">
                    Sneak peek ends here — Pro unlocks full side notes + the entire cliff-note vault (
                    {verdict.librarySize}).
                  </p>
                )}
              </div>
            )}

            <ApothecaryFunnel variant="compact" />
          </div>
        )}
      </ProGate>
    </>
  );
}
