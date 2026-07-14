import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProGate from '../components/ProGate';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import SeoHead from '../components/SeoHead';
import ShareBar from '../components/ShareBar';
import { settleArgument, packStats } from '../lib/engines';
import { BRAND, DISCLAIMER } from '../lib/brand';
import { unlockAchievement } from '../lib/achievements';
import { recordHistory } from '../lib/historyStore';
import { moderateSides, POLICY_BLURB } from '../lib/contentPolicy';
import { createLivePoll, pollShareUrl } from '../lib/pollLive';
import { postAnonymousCourt, loadAnonCourtFeed } from '../lib/anonCourt';
import { useAuth } from '../context/AuthContext';

export default function Settler() {
  const { user } = useAuth();
  const [mode, setMode] = useState('tribunal'); // tribunal | poll | live | anon
  const [sides, setSides] = useState([
    { label: 'Side A', text: '', votes: 0 },
    { label: 'Side B', text: '', votes: 0 },
  ]);
  const [verdict, setVerdict] = useState(null);
  const [pollNote, setPollNote] = useState('');
  const [liveCode, setLiveCode] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [anonFeed, setAnonFeed] = useState(() => loadAnonCourtFeed());
  const [err, setErr] = useState('');
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
    setErr('');
    const mod = moderateSides(sides);
    if (!mod.ok) {
      setErr(mod.message);
      return;
    }
    const v = settleArgument(mod.sides, { freePeek: peek });
    setVerdict(v);
    setPollNote('');
    if (!v.error) {
      unlockAchievement('first_court');
      recordHistory({
        type: 'court',
        title: 'Hearth Court tribunal',
        summary: v.shared ? 'Shared moon' : `Edge: ${v.winner}`,
        payload: { sides: mod.sides, verdict: v },
      });
    }
  };

  const runLocalPoll = (peek) => {
    setErr('');
    const mod = moderateSides(sides);
    if (!mod.ok) {
      setErr(mod.message);
      return;
    }
    const filled = mod.sides;
    const total = sides.reduce((a, s) => a + (Number(s.votes) || 0), 0);
    const ranked = [...sides]
      .filter((s) => s.label?.trim())
      .sort((a, b) => (b.votes || 0) - (a.votes || 0));
    const top = ranked[0];
    const tie =
      ranked.length > 1 && (ranked[0].votes || 0) === (ranked[1].votes || 0) && (ranked[0].votes || 0) > 0;
    const textVerdict = settleArgument(mod.sides, { freePeek: peek });
    setPollNote(
      total === 0
        ? 'No votes yet — tap Vote, then close.'
        : tie
          ? 'Poll tied — shared moon.'
          : `Poll lead: ${top.label} (${top.votes}/${total}).`,
    );
    const v = {
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
    };
    setVerdict(v);
    unlockAchievement('first_poll');
    unlockAchievement('first_court');
    recordHistory({
      type: 'poll',
      title: 'Same-device poll',
      summary: v.shared ? 'Tied / shared' : `Lead: ${v.winner}`,
      payload: { sides, verdict: v },
    });
  };

  const startLive = async () => {
    setErr('');
    try {
      const { code, mode: m } = await createLivePoll({
        title: 'Hearth Court live poll',
        sides,
        hostId: user?.id,
        hostEmail: user?.email,
        anonymous: false,
      });
      const url = pollShareUrl(code);
      setLiveCode(code);
      setLiveUrl(url);
      setPollNote(`Live poll ${code} (${m}). Share the link — friends vote on their phones.`);
      unlockAchievement('first_poll');
      recordHistory({
        type: 'poll',
        title: `Live poll ${code}`,
        summary: 'Opened multi-device poll',
        payload: { code, url },
      });
    } catch (e) {
      setErr(e.message || 'Could not create live poll');
    }
  };

  const runAnon = async (peek) => {
    setErr('');
    try {
      const { post, verdict: v } = await postAnonymousCourt({ sides, peek });
      setVerdict(v);
      setAnonFeed(loadAnonCourtFeed());
      setPollNote('Posted anonymously to the public court feed (sanitized).');
      unlockAchievement('first_court');
    } catch (e) {
      setErr(e.message || 'Anonymous post blocked');
    }
  };

  return (
    <>
      <SeoHead
        title={`${b.name} — Tribunal, Live Polls & Anonymous Rulings`}
        description="Settle differences: tribunal scoring, multi-device live polls, anonymous posts. History on your dashboard."
        path="/hearth-court"
      />
      <ProGate
        featureId="hearth_court"
        teaser={`${b.name}: tribunal, same-device poll, multi-device live link, or anonymous public ruling. Free peek truncates notes.`}
      >
        {({ peek }) => (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">
                {b.emoji} Settle differences
              </p>
              <h1 className="font-display font-bold text-3xl text-[#4a1942]">{b.name}</h1>
              <p className="text-sm text-[#4a1942]/65 mt-1">{b.tagline}</p>
              <p className="text-[10px] text-[#4a1942]/50 mt-2">{POLICY_BLURB}</p>
              <Link to="/dashboard?tab=results" className="text-xs underline text-[#4a1942]">
                View your poll & court history →
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'tribunal', label: 'Tribunal' },
                { id: 'poll', label: 'Same-device poll' },
                { id: 'live', label: 'Multi-device live' },
                { id: 'anon', label: 'Anonymous post' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMode(m.id);
                    setVerdict(null);
                    setErr('');
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                    mode === m.id ? 'bg-[#4a1942] text-white border-[#4a1942]' : 'border-[#4a1942]/20'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {mode === 'live' && (
              <p className="text-xs bg-amber-50 border border-amber-100 rounded-xl p-3 text-[#4a1942]/75">
                Create a code, share the link. Friends open it on their phones and vote — results stream live
                on <code className="text-[10px]">/poll/CODE</code>.
              </p>
            )}
            {mode === 'anon' && (
              <p className="text-xs bg-rose-50 border border-rose-100 rounded-xl p-3 text-[#4a1942]/75">
                Anonymous public feed — no names. Content still must follow agreements (no threats, doxxing,
                illegal content). Saved to history as anonymous.
              </p>
            )}

            {sides.map((s, i) => (
              <div key={i} className="card p-4 space-y-2">
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    value={s.label}
                    onChange={(e) => setSide(i, { label: e.target.value })}
                    placeholder={mode === 'poll' || mode === 'live' ? `Participant ${i + 1}` : `Side ${i + 1}`}
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
                  placeholder="Their argument…"
                  maxLength={800}
                />
              </div>
            ))}

            {err && <p className="text-sm text-red-600">{err}</p>}
            {pollNote && <p className="text-xs font-semibold text-[#4a1942]">{pollNote}</p>}

            {liveCode && (
              <div className="card p-4 space-y-2 border-[#c9a227]/40">
                <p className="font-mono text-lg font-bold text-[#4a1942]">{liveCode}</p>
                <a href={liveUrl} className="text-xs underline break-all">
                  {liveUrl}
                </a>
                <ShareBar title="Hearth Court live poll" text={`Vote now: ${liveCode}`} url={liveUrl} />
                <Link to={`/poll/${liveCode}`} className="btn-primary text-sm text-center block">
                  Open live results board
                </Link>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <button type="button" className="btn-secondary" onClick={addSide} disabled={sides.length >= 4}>
                Add ({sides.length}/4)
              </button>
              {mode === 'tribunal' && (
                <button type="button" className="btn-primary flex-1" onClick={() => runTribunal(peek)}>
                  {peek ? 'Peek ruling' : 'Convene Court'}
                </button>
              )}
              {mode === 'poll' && (
                <button type="button" className="btn-primary flex-1" onClick={() => runLocalPoll(peek)}>
                  Close poll & rule
                </button>
              )}
              {mode === 'live' && (
                <button type="button" className="btn-primary flex-1" onClick={startLive}>
                  Create multi-device poll
                </button>
              )}
              {mode === 'anon' && (
                <button type="button" className="btn-primary flex-1" onClick={() => runAnon(peek)}>
                  Post anonymously
                </button>
              )}
            </div>

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
                <p className="text-sm italic">{verdict.cliffNote}</p>
                <p className="text-[10px] text-red-600">{verdict.disclaimer || DISCLAIMER}</p>
                <ShareBar
                  title="Hearth Court"
                  text={
                    verdict.shared
                      ? `Hearth Court: shared moon. ${verdict.cliffNote || ''}`
                      : `Hearth Court edge: ${verdict.winner}. ${verdict.cliffNote || ''}`
                  }
                />
                <Link to="/dashboard?tab=results" className="text-xs underline">
                  Saved to your results →
                </Link>
              </div>
            )}

            {mode === 'anon' && anonFeed.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-[#4a1942]/40">Anonymous court feed</p>
                {anonFeed.slice(0, 5).map((p) => (
                  <div key={p.id} className="card p-3 text-xs">
                    <p className="font-bold">{p.summary}</p>
                    <p className="italic mt-1">{p.cliffNote}</p>
                    <p className="text-[10px] opacity-50 mt-1">{new Date(p.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            <ApothecaryFunnel variant="compact" />
          </div>
        )}
      </ProGate>
    </>
  );
}
