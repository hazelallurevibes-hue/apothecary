import { useState } from 'react';
import { Link } from 'react-router-dom';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import SeoHead from '../components/SeoHead';
import ShareBar from '../components/ShareBar';
import ProValueStrip from '../components/ProValueStrip';
import { settleArgument, packStats } from '../lib/engines';
import { BRAND, DISCLAIMER } from '../lib/brand';
import { unlockAchievement } from '../lib/achievements';
import { recordHistory } from '../lib/historyStore';
import { moderateSides, POLICY_BLURB } from '../lib/contentPolicy';
import { createLivePoll, pollShareUrl } from '../lib/pollLive';
import { postAnonymousCourt, loadAnonCourtFeed } from '../lib/anonCourt';
import { useAuth } from '../context/AuthContext';
import { HAZEL_LINKS } from '../lib/hazel';

/**
 * Free: tribunal (2 sides) + same-device vote/poll + computer basic ruling
 * Pro: 3–4 sides, live multi-device, anonymous post, full cliff library
 */
export default function Settler() {
  const { user, isPremium } = useAuth();
  const [mode, setMode] = useState('tribunal'); // tribunal | poll | live | anon | showcase
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
  const freeMaxSides = 2;
  const maxSides = isPremium ? 4 : freeMaxSides;

  const setSide = (i, patch) => {
    setSides((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const addSide = () => {
    if (sides.length >= maxSides) return;
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

  const runTribunal = () => {
    setErr('');
    const mod = moderateSides(sides.slice(0, maxSides));
    if (!mod.ok) {
      setErr(mod.message);
      return;
    }
    const v = settleArgument(mod.sides, { freeBasic: !isPremium });
    setVerdict(v);
    setPollNote(isPremium ? '' : 'Free basic computer decision — Pro unlocks full cliff library.');
    if (!v.error) {
      unlockAchievement('first_court');
      recordHistory({
        type: 'court',
        title: isPremium ? 'Hearth Court tribunal' : 'Hearth Court free basic',
        summary: v.shared ? 'Shared moon' : `Edge: ${v.winner}`,
        payload: { sides: mod.sides, verdict: v },
      });
    }
  };

  const runShowcase = () => {
    const v = settleArgument([], { freePeek: true });
    setVerdict(v);
    setPollNote('Showcase ruling — a sample of full Pro theater.');
    unlockAchievement('first_court');
    unlockAchievement('pro_showcase');
    recordHistory({
      type: 'court',
      title: 'Hearth Court showcase',
      summary: v.shared ? 'Shared moon (showcase)' : `Edge: ${v.winner}`,
      payload: { verdict: v, showcase: true },
    });
  };

  const runLocalPoll = () => {
    setErr('');
    const mod = moderateSides(sides.slice(0, maxSides));
    if (!mod.ok) {
      setErr(mod.message);
      return;
    }
    const total = sides.reduce((a, s) => a + (Number(s.votes) || 0), 0);
    const ranked = [...sides]
      .filter((s) => s.label?.trim())
      .sort((a, b) => (b.votes || 0) - (a.votes || 0));
    const top = ranked[0];
    const tie =
      ranked.length > 1 && (ranked[0].votes || 0) === (ranked[1].votes || 0) && (ranked[0].votes || 0) > 0;
    // Merge votes into sides for computer scoring influence
    const withVotes = mod.sides.map((s) => {
      const match = sides.find((x) => x.label === s.label);
      return { ...s, votes: match?.votes || 0 };
    });
    const textVerdict = settleArgument(withVotes, { freeBasic: !isPremium });
    setPollNote(
      total === 0
        ? 'No votes yet — tap Vote on a side, then close & rule.'
        : tie
          ? 'Poll tied — shared moon energy.'
          : `Crowd lead: ${top.label} (${top.votes}/${total}). Computer also scored the arguments.`,
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
      winner: total === 0 ? textVerdict.winner : tie ? null : top.label || textVerdict.winner,
      shared: tie || textVerdict.shared,
    };
    setVerdict(v);
    unlockAchievement('first_poll');
    unlockAchievement('first_court');
    recordHistory({
      type: 'poll',
      title: 'Same-device poll + computer',
      summary: v.shared ? 'Tied / shared' : `Lead: ${v.winner}`,
      payload: { sides, verdict: v },
    });
  };

  const startLive = async () => {
    if (!isPremium) {
      setErr('Multi-device live polls are Pro — free users can vote same-device below.');
      return;
    }
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

  const runAnon = async () => {
    if (!isPremium) {
      setErr('Anonymous public court is Pro. Free court still works privately on this device.');
      return;
    }
    setErr('');
    try {
      const { post, verdict: v } = await postAnonymousCourt({ sides, peek: false });
      setVerdict(v);
      setAnonFeed(loadAnonCourtFeed());
      setPollNote('Posted anonymously to the public court feed (sanitized).');
      unlockAchievement('first_court');
    } catch (e) {
      setErr(e.message || 'Anonymous post blocked');
    }
  };

  const modes = [
    { id: 'tribunal', label: 'Tribunal', free: true },
    { id: 'poll', label: 'Vote + rule', free: true },
    { id: 'showcase', label: 'Pro sample', free: true },
    { id: 'live', label: 'Live multi-device', free: false },
    { id: 'anon', label: 'Anonymous', free: false },
  ];

  return (
    <>
      <SeoHead
        title={`${b.name} — Free Vote, Computer Ruling & Pro Live Polls`}
        description="Free: enter two sides, vote, let the computer decide. Pro: multi-device live polls, 4 sides, full cliff library."
        path="/hearth-court"
      />
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">
            {b.emoji} Free court · Pro live theater
          </p>
          <h1 className="font-display font-bold text-3xl text-[#4a1942]">{b.name}</h1>
          <p className="text-sm text-[#4a1942]/65 mt-1">
            Free seekers can enter arguments, vote on this device, and get a real computer decision.
            Pro unlocks live multi-phone polls, 3–4 sides, and {stats.settlerCliff || '2,800'}+ cliff notes.
          </p>
          <p className="text-[10px] text-[#4a1942]/50 mt-2">{POLICY_BLURB}</p>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <Link to="/dashboard?tab=results" className="underline text-[#4a1942]">
              Your results →
            </Link>
            <Link to="/this-or-that" className="underline text-[#4a1942]">
              This or That (free)
            </Link>
            <Link to="/dice" className="underline text-[#4a1942]">
              Sanctum Dice (free)
            </Link>
          </div>
        </div>

        {!isPremium && (
          <div className="rounded-2xl border border-[#c9a227]/40 bg-gradient-to-r from-amber-50/90 to-white px-4 py-3 text-xs text-[#4a1942]/80">
            <span className="font-black uppercase tracking-widest text-[9px] text-[#c9a227] mr-2">
              Free forever
            </span>
            Write two sides · tap Vote · let the sanctum score clarity, tone, and plans. Install the app for
            one-tap court on your home screen.
            <div className="mt-2 flex flex-wrap gap-2">
              <a href={HAZEL_LINKS.proUpgrade()} className="btn-gold text-xs py-1.5 px-3">
                See Pro court
              </a>
              <Link to="/settings" className="btn-secondary text-xs py-1.5 px-3">
                Install app
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setVerdict(null);
                setErr('');
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                mode === m.id
                  ? 'bg-[#4a1942] text-white border-[#4a1942]'
                  : 'border-[#4a1942]/20 text-[#4a1942]/80'
              }`}
            >
              {m.label}
              {!m.free && !isPremium ? ' · Pro' : ''}
            </button>
          ))}
        </div>

        {mode === 'live' && (
          <p className="text-xs bg-amber-50 border border-amber-100 rounded-xl p-3 text-[#4a1942]/75">
            {isPremium
              ? 'Create a code, share the link. Friends open it on their phones and vote live.'
              : 'Pro feature — free users: use Vote + rule on this phone (same-device poll).'}
          </p>
        )}
        {mode === 'anon' && (
          <p className="text-xs bg-rose-50 border border-rose-100 rounded-xl p-3 text-[#4a1942]/75">
            {isPremium
              ? 'Anonymous public feed — no names. Policies still apply.'
              : 'Pro feature — free tribunal stays private on this device.'}
          </p>
        )}
        {mode === 'showcase' && (
          <p className="text-xs rounded-xl border border-[#c9a227]/35 bg-amber-50/80 px-3 py-2 text-[#4a1942]/75">
            One-tap sample of full Pro theater (no typing). Your real free court is under Tribunal / Vote.
          </p>
        )}
        {mode === 'poll' && (
          <p className="text-xs rounded-xl bg-[#4a1942]/5 border border-[#4a1942]/10 px-3 py-2 text-[#4a1942]/75">
            Enter both sides, pass the phone, tap <strong>Vote</strong>, then <strong>Close poll & rule</strong>.
            The computer blends crowd votes with argument quality.
          </p>
        )}

        {mode !== 'showcase' &&
          sides.slice(0, maxSides).map((s, i) => (
            <div key={i} className="card p-4 space-y-2">
              <div className="flex gap-2 items-center">
                <input
                  className="input flex-1"
                  value={s.label}
                  onChange={(e) => setSide(i, { label: e.target.value })}
                  placeholder={mode === 'poll' || mode === 'live' ? `Participant ${i + 1}` : `Side ${i + 1}`}
                />
                {(mode === 'poll' || mode === 'tribunal') && (
                  <button type="button" className="btn-primary text-xs shrink-0 px-3" onClick={() => vote(i)}>
                    Vote ({s.votes || 0})
                  </button>
                )}
              </div>
              <textarea
                className="textarea"
                value={s.text}
                onChange={(e) => setSide(i, { text: e.target.value })}
                placeholder="Their argument — what happened, what they need, any plan…"
                maxLength={isPremium ? 800 : 500}
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
          {(mode === 'tribunal' || mode === 'poll' || mode === 'live' || mode === 'anon') && (
            <button
              type="button"
              className="btn-secondary"
              onClick={addSide}
              disabled={sides.length >= maxSides}
            >
              Add side ({Math.min(sides.length, maxSides)}/{maxSides})
              {!isPremium && sides.length >= 2 ? ' · Pro for 3–4' : ''}
            </button>
          )}
          {mode === 'tribunal' && (
            <button type="button" className="btn-primary flex-1" onClick={runTribunal}>
              {isPremium ? 'Convene Court' : 'Computer decision (free)'}
            </button>
          )}
          {mode === 'poll' && (
            <button type="button" className="btn-primary flex-1" onClick={runLocalPoll}>
              Close poll & rule
            </button>
          )}
          {mode === 'showcase' && (
            <button type="button" className="btn-gold flex-1" onClick={runShowcase}>
              Reveal Pro sample ruling
            </button>
          )}
          {mode === 'live' && (
            <button type="button" className="btn-primary flex-1" onClick={startLive}>
              {isPremium ? 'Create multi-device poll' : 'Unlock live polls (Pro)'}
            </button>
          )}
          {mode === 'anon' && (
            <button type="button" className="btn-primary flex-1" onClick={runAnon}>
              {isPremium ? 'Post anonymously' : 'Unlock anon court (Pro)'}
            </button>
          )}
        </div>

        {verdict && !verdict.error && (
          <div className="card card-glow p-5 space-y-3 border-[#c9a227]/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#c9a227]">
              {verdict.freePeek
                ? 'Showcase ruling'
                : verdict.freeBasic
                  ? 'Free basic ruling'
                  : 'Pro ruling'}
              {verdict.ritualScore != null ? ` · ritual ${verdict.ritualScore}` : ''}
            </p>
            <p className="font-display font-bold text-xl text-[#4a1942]">
              {verdict.shared || verdict.poll?.tie
                ? 'Shared moon — both hold pieces'
                : `Playful edge: ${verdict.winner || verdict.poll?.winner}`}
            </p>
            {verdict.template?.note && (
              <p className="text-xs text-[#4a1942]/60">{verdict.template.note}</p>
            )}
            {verdict.poll?.ranked && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-[#4a1942]/40">Crowd votes</p>
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
            <p className="text-sm italic leading-relaxed text-[#4a1942]/85">{verdict.cliffNote}</p>
            {verdict.secondaryCliff && (
              <p className="text-xs text-[#4a1942]/55 border-l-2 border-[#c9a227]/50 pl-3">
                Secondary seal: {verdict.secondaryCliff}
              </p>
            )}
            {verdict.sides?.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-bold uppercase text-[#4a1942]/40">Computer scores</p>
                {verdict.sides.map((s) => (
                  <div key={s.label} className="rounded-xl bg-[#4a1942]/5 p-3 text-xs">
                    <p className="font-bold text-[#4a1942]">
                      {s.label} · score {s.score}
                    </p>
                    <ul className="mt-1 space-y-0.5 text-[#4a1942]/70">
                      {(s.notes || []).map((n) => (
                        <li key={n}>· {n}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {verdict.seal && (
              <p className="text-[10px] font-bold text-[#c9a227] uppercase tracking-wide">{verdict.seal}</p>
            )}
            <p className="text-[10px] text-red-600">{verdict.disclaimer || DISCLAIMER}</p>
            <ShareBar
              title="Hearth Court"
              text={
                verdict.shared
                  ? `Hearth Court: shared moon. ${verdict.cliffNote || ''}`
                  : `Hearth Court edge: ${verdict.winner}. ${verdict.cliffNote || ''}`
              }
            />
            <ProValueStrip
              freePeek={verdict.freePeek || verdict.freeBasic}
              unlocks={verdict.proUnlocks}
              title={
                verdict.freeBasic
                  ? 'You already got a real decision — Pro never runs out of cliff notes'
                  : 'Pro Hearth Court goes further'
              }
            />
            <Link to="/dashboard?tab=results" className="text-xs underline">
              Saved to your results →
            </Link>
          </div>
        )}

        {mode === 'anon' && isPremium && anonFeed.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-[#4a1942]/40">Anonymous court feed</p>
            {anonFeed.slice(0, 5).map((p) => (
              <div key={p.id} className="card p-3 text-xs">
                <p className="font-bold">{p.summary}</p>
                <p className="italic mt-1">{p.cliffNote}</p>
              </div>
            ))}
          </div>
        )}

        <ApothecaryFunnel variant="compact" />
      </div>
    </>
  );
}
