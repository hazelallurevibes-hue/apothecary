import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProGate from '../components/ProGate';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import SeoHead from '../components/SeoHead';
import ShareBar from '../components/ShareBar';
import { settleArgument, packStats } from '../lib/engines';
import { BRAND, DISCLAIMER } from '../lib/brand';
import { unlockAchievement } from '../lib/achievements';

export default function Settler() {
  const [mode, setMode] = useState('tribunal'); // tribunal | poll
  const [sides, setSides] = useState([
    { label: 'Side A', text: '', votes: 0 },
    { label: 'Side B', text: '', votes: 0 },
  ]);
  const [verdict, setVerdict] = useState(null);
  const [pollNote, setPollNote] = useState('');
  const stats = packStats();
  const b = BRAND.settler;

  const setSide = (i, patch) => {
    setSides((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const addSide = () => {
    if (sides.length >= 4) return;
    setSides((s) => [
      ...s,
      { label: `Side ${String.fromCharCode(65 + s.length)}`, text: '', votes: 0 },
    ]);
  };

  const vote = (i) => {
    setSides((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, votes: (s.votes || 0) + 1 } : s)),
    );
  };

  const runTribunal = (peek) => {
    const v = settleArgument(sides, { freePeek: peek });
    setVerdict(v);
    setPollNote('');
    if (!v.error) unlockAchievement('first_court');
  };

  const runPoll = (peek) => {
    const filled = sides.filter((s) => s.label?.trim());
    if (filled.length < 2) {
      setVerdict({ error: 'Add at least 2 participant sides for a poll.' });
      return;
    }
    const total = filled.reduce((a, s) => a + (Number(s.votes) || 0), 0);
    const ranked = [...filled].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    const top = ranked[0];
    const tie =
      ranked.length > 1 && (ranked[0].votes || 0) === (ranked[1].votes || 0) && (ranked[0].votes || 0) > 0;

    // blend poll winner with text scoring if text present
    const textVerdict = settleArgument(
      sides.map((s) => ({ label: s.label, text: s.text || s.label })),
      { freePeek: peek },
    );

    setPollNote(
      total === 0
        ? 'No votes yet — tap Vote on each side as friends chime in, then close the poll.'
        : tie
          ? 'Poll is tied — Hearth Court offers a shared-moon note.'
          : `Poll lead: ${top.label} (${top.votes || 0}/${total} votes).`,
    );

    setVerdict({
      ...textVerdict,
      poll: {
        total,
        ranked: ranked.map((s) => ({
          label: s.label,
          votes: s.votes || 0,
          pct: total ? Math.round(((s.votes || 0) / total) * 100) : 0,
        })),
        winner: tie || total === 0 ? null : top.label,
        tie,
      },
      winner: total === 0 ? textVerdict.winner : tie ? null : top.label,
      shared: tie || textVerdict.shared,
    });
    unlockAchievement('first_poll');
    unlockAchievement('first_court');
  };

  return (
    <>
      <SeoHead
        title={`${b.name} — Settle Arguments & Live Polls | Magic Sanctum`}
        description={`${b.tagline} Tribunal scoring or friend poll mode. Share results. Free peeks.`}
        path="/hearth-court"
        keywords="hearth court, argument poll, settle differences, who is right poll"
      />
      <ProGate
        featureId="hearth_court"
        teaser={`${b.name}: tribunal scoring or live poll with participants. Free sneak peek truncates notes.`}
      >
        {({ peek }) => (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">
                {b.emoji} Settle differences
              </p>
              <h1 className="font-display font-bold text-3xl text-[#4a1942]">{b.name}</h1>
              <p className="text-sm text-[#4a1942]/65 mt-1">{b.tagline}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'tribunal', label: 'Tribunal (AI-free scoring)' },
                { id: 'poll', label: 'Live poll + friends' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMode(m.id);
                    setVerdict(null);
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                    mode === m.id
                      ? 'bg-[#4a1942] text-white border-[#4a1942]'
                      : 'border-[#4a1942]/20'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {mode === 'poll' && (
              <p className="text-xs text-[#4a1942]/65 bg-amber-50 border border-amber-100 rounded-xl p-3">
                Poll mode: name each participant/side, optional argument text, then tap <strong>Vote</strong>{' '}
                as people chime in (same device or pass the phone). Close poll for ranked results + cliff notes.
              </p>
            )}

            {sides.map((s, i) => (
              <div key={i} className="card p-4 space-y-2">
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    value={s.label}
                    onChange={(e) => setSide(i, { label: e.target.value })}
                    placeholder={mode === 'poll' ? `Participant ${i + 1}` : `Side ${i + 1}`}
                  />
                  {mode === 'poll' && (
                    <button type="button" className="btn-primary text-xs shrink-0 px-3" onClick={() => vote(i)}>
                      Vote ({s.votes || 0})
                    </button>
                  )}
                </div>
                <textarea
                  className="textarea"
                  value={s.text}
                  onChange={(e) => setSide(i, { text: e.target.value })}
                  placeholder={
                    mode === 'poll'
                      ? 'Optional: their one-liner argument…'
                      : 'Their argument in their words…'
                  }
                  maxLength={800}
                />
              </div>
            ))}

            <div className="flex gap-2">
              <button type="button" className="btn-secondary" onClick={addSide} disabled={sides.length >= 4}>
                Add {mode === 'poll' ? 'participant' : 'side'} ({sides.length}/4)
              </button>
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={() => (mode === 'poll' ? runPoll(peek) : runTribunal(peek))}
              >
                {mode === 'poll' ? 'Close poll & rule' : peek ? 'Peek ruling' : 'Convene Court'}
              </button>
            </div>

            {verdict?.error && <p className="text-sm text-red-600">{verdict.error}</p>}
            {pollNote && <p className="text-xs font-semibold text-[#4a1942]">{pollNote}</p>}

            {verdict && !verdict.error && (
              <div className="card p-5 space-y-3">
                <p className="font-display font-bold text-xl text-[#4a1942]">
                  {verdict.shared || verdict.poll?.tie
                    ? 'Shared moon — both hold pieces'
                    : `Playful edge: ${verdict.winner || verdict.poll?.winner}`}
                </p>

                {verdict.poll?.ranked && (
                  <div className="space-y-2">
                    {verdict.poll.ranked.map((r) => (
                      <div key={r.label}>
                        <div className="flex justify-between text-xs font-bold">
                          <span>{r.label}</span>
                          <span>
                            {r.votes} · {r.pct}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#4a1942]/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#4a1942] to-[#c9a227]"
                            style={{ width: `${r.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-sm italic text-[#4a1942]/80">{verdict.cliffNote}</p>
                <p className="text-xs text-[#4a1942]/60">{verdict.template?.note}</p>
                {verdict.sides && (
                  <ul className="space-y-2">
                    {verdict.sides.map((s) => (
                      <li key={s.label} className="rounded-xl bg-[#4a1942]/5 p-3 text-sm">
                        <span className="font-bold">{s.label}</span>
                        <span className="text-[10px] ml-2">score {s.score}</span>
                        <ul className="mt-1 text-xs list-disc pl-4">
                          {s.notes.map((n) => (
                            <li key={n}>{n}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-[10px] text-red-600">{verdict.disclaimer || DISCLAIMER}</p>
                <ShareBar
                  title="Hearth Court ruling"
                  text={
                    verdict.shared || verdict.poll?.tie
                      ? `Hearth Court: shared moon. ${verdict.cliffNote || ''}`
                      : `Hearth Court edge: ${verdict.winner}. ${verdict.cliffNote || ''}`
                  }
                  meta={
                    verdict.poll
                      ? `Poll ${verdict.poll.ranked.map((r) => `${r.label} ${r.pct}%`).join(' · ')}`
                      : 'Tribunal mode'
                  }
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
