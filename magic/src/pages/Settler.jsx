import { useState } from 'react';
import { Link } from 'react-router-dom';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import SeoHead from '../components/SeoHead';
import ShareBar from '../components/ShareBar';
import ProValueStrip from '../components/ProValueStrip';
import FeatureExplainer from '../components/FeatureExplainer';
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
 * Free: circle of counsel (2 paths) + same-device stones + basic oracle ruling
 * Pro: 3–4 paths, live multi-device, anonymous circle, full cliff library
 * Tone: metaphysical / witchy decision ritual — not daytime-TV tribunal
 */
export default function Settler() {
  const { user, isPremium } = useAuth();
  const [mode, setMode] = useState('circle'); // circle | stones | live | anon | showcase
  const [sides, setSides] = useState([
    { label: 'Path A', text: '', votes: 0 },
    { label: 'Path B', text: '', votes: 0 },
  ]);
  const [verdict, setVerdict] = useState(null);
  const [pollNote, setPollNote] = useState('');
  const [liveCode, setLiveCode] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [anonFeed, setAnonFeed] = useState(() => loadAnonCourtFeed());
  const [err, setErr] = useState('');
  const [question, setQuestion] = useState('');
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
      { label: `Path ${String.fromCharCode(65 + s.length)}`, text: '', votes: 0 },
    ]);
  };

  const castStone = (i) => {
    setSides((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, votes: (s.votes || 0) + 1 } : s)),
    );
  };

  const runCircle = () => {
    setErr('');
    const mod = moderateSides(sides.slice(0, maxSides));
    if (!mod.ok) {
      setErr(mod.message);
      return;
    }
    const v = settleArgument(mod.sides, { freeBasic: !isPremium });
    setVerdict(v);
    setPollNote(
      isPremium
        ? 'The circle has spoken with the full cliff library.'
        : 'Basic oracle seal — Pro opens the full library of seals & multi-device rites.',
    );
    if (!v.error) {
      unlockAchievement('first_court');
      recordHistory({
        type: 'court',
        title: isPremium ? 'Hearth Court circle' : 'Hearth Court free seal',
        summary: v.shared ? 'Shared moon' : `Edge: ${v.winner}`,
        payload: { sides: mod.sides, verdict: v, question },
      });
    }
  };

  const runShowcase = () => {
    const v = settleArgument([], { freePeek: true });
    setVerdict(v);
    setPollNote('Sample of full Pro circle theater — no typing required.');
    unlockAchievement('first_court');
    unlockAchievement('pro_showcase');
    recordHistory({
      type: 'court',
      title: 'Hearth Court showcase',
      summary: v.shared ? 'Shared moon (showcase)' : `Edge: ${v.winner}`,
      payload: { verdict: v, showcase: true },
    });
  };

  const runStones = () => {
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
    const withVotes = mod.sides.map((s) => {
      const match = sides.find((x) => x.label === s.label);
      return { ...s, votes: match?.votes || 0 };
    });
    const textVerdict = settleArgument(withVotes, { freeBasic: !isPremium });
    setPollNote(
      total === 0
        ? 'No stones cast yet — tap Cast stone on a path, then close the rite.'
        : tie
          ? 'Stones tied — shared moon energy between paths.'
          : `Stone lead: ${top.label} (${top.votes}/${total}). The oracle also weighed the written cases.`,
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
      title: 'Stone circle + oracle',
      summary: v.shared ? 'Tied / shared' : `Lead: ${v.winner}`,
      payload: { sides, verdict: v, question },
    });
  };

  const startLive = async () => {
    if (!isPremium) {
      setErr('Multi-device living circle is Pro — free seekers cast stones on this device.');
      return;
    }
    setErr('');
    try {
      const { code, mode: m } = await createLivePoll({
        title: question || 'Hearth Court living circle',
        sides,
        hostId: user?.id,
        hostEmail: user?.email,
        anonymous: false,
      });
      const url = pollShareUrl(code);
      setLiveCode(code);
      setLiveUrl(url);
      setPollNote(`Living circle ${code} (${m}). Share the link — friends cast stones from their phones.`);
      unlockAchievement('first_poll');
      recordHistory({
        type: 'poll',
        title: `Living circle ${code}`,
        summary: 'Opened multi-device circle',
        payload: { code, url },
      });
    } catch (e) {
      setErr(e.message || 'Could not open living circle');
    }
  };

  const runAnon = async () => {
    if (!isPremium) {
      setErr('Anonymous public circle is Pro. Free counsel stays private on this device.');
      return;
    }
    setErr('');
    try {
      const { verdict: v } = await postAnonymousCourt({ sides, peek: false });
      setVerdict(v);
      setAnonFeed(loadAnonCourtFeed());
      setPollNote('Offered anonymously to the public circle feed (sanitized).');
      unlockAchievement('first_court');
    } catch (e) {
      setErr(e.message || 'Anonymous offering blocked');
    }
  };

  const modes = [
    { id: 'circle', label: 'Circle of counsel', free: true },
    { id: 'stones', label: 'Cast stones', free: true },
    { id: 'showcase', label: 'Pro sample', free: true },
    { id: 'live', label: 'Living circle', free: false },
    { id: 'anon', label: 'Anonymous veil', free: false },
  ];

  const winnerLabel = (v) => {
    if (v.shared || v.poll?.tie) return 'Shared moon — both paths hold medicine';
    return `The scales lean: ${v.winner || v.poll?.winner}`;
  };

  return (
    <>
      <SeoHead
        title={`${b.name} — Witchy Decision Circle, Stones & Oracle Seals`}
        description="Not a talk-show fight — a metaphysical decision ritual. Enter two paths, cast stones, receive an oracle seal. Pro: multi-device living circle, full cliff library."
        path="/hearth-court"
      />
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">
            {b.emoji} Decision ritual · not a spectacle
          </p>
          <h1 className="font-display font-bold text-3xl text-[#4a1942]">{b.name}</h1>
          <p className="text-sm text-[#4a1942]/65 mt-1 leading-relaxed">
            Bring a choice to the hearth. Write each path with care, cast stones if you wish, and let the sanctum
            weigh clarity, tone, and forward motion — like a quiet oracle, not a shouting match.
          </p>
          <p className="text-[10px] text-[#4a1942]/50 mt-2">{POLICY_BLURB}</p>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <Link to="/dashboard?tab=results" className="underline text-[#4a1942]">
              Your seals →
            </Link>
            <Link to="/this-or-that" className="underline text-[#4a1942]">
              This or That
            </Link>
            <Link to="/dice" className="underline text-[#4a1942]">
              Sanctum Dice
            </Link>
            <Link to="/guides/hearth-court" className="underline text-[#4a1942]">
              How the circle works
            </Link>
          </div>
        </div>

        <FeatureExplainer
          title="A circle for decisions — not drama"
          what="Hearth Court is a metaphysical decision aid. You name the paths (sides of a choice), optionally cast “stones” (votes), and receive an entertainment oracle seal based on clarity, repair language, and plans — never legal or therapeutic judgment."
          how="1) Optional: name the question at the hearth. 2) Write Path A and Path B with what happened and what you need. 3) Circle of counsel = oracle alone. Cast stones = pass the device, then close the rite. Pro opens living multi-phone circles and a deeper seal library."
          tips={[
            'Write what you need, not only what they did wrong.',
            'If anyone is unsafe, stop the game and get real help.',
            'Shared moon is not failure — both paths may hold truth.',
            'Use the seal to talk, not to humiliate.',
          ]}
          freeNote="Two paths, stones, and a real free oracle seal on this device."
          proNote={`Pro: 3–4 paths, living multi-device circle, anonymous veil, ${stats.settlerCliff || '2,800'}+ cliff seals.`}
          guideTo="/guides/hearth-court"
          accent="from-violet-50 to-white"
        />

        {!isPremium && (
          <div className="rounded-2xl border border-[#c9a227]/40 bg-gradient-to-r from-violet-50/90 via-amber-50/50 to-white px-4 py-3 text-xs text-[#4a1942]/80">
            <span className="font-black uppercase tracking-widest text-[9px] text-[#c9a227] mr-2">
              Free forever
            </span>
            Two paths · cast stones · receive a basic oracle seal. Install the app for one-tap circle on your home
            screen.
            <div className="mt-2 flex flex-wrap gap-2">
              <a href={HAZEL_LINKS.proUpgrade('hearth_court')} className="btn-gold text-xs py-1.5 px-3">
                See Pro circle
              </a>
              <Link to="/settings" className="btn-secondary text-xs py-1.5 px-3">
                Install app
              </Link>
            </div>
          </div>
        )}

        <div className="card p-4 space-y-2 border-violet-100/80">
          <label className="block">
            <span className="text-[10px] font-bold uppercase text-[#4a1942]/45">
              Question at the hearth (optional)
            </span>
            <input
              className="input mt-0.5"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Should we move? Who plans the holiday? What boundary needs naming?"
              maxLength={160}
            />
          </label>
          <p className="text-[11px] text-[#4a1942]/50">
            Naming the question focuses the rite. The oracle still reads the paths you write below.
          </p>
        </div>

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
          <p className="text-xs bg-violet-50 border border-violet-100 rounded-xl p-3 text-[#4a1942]/75">
            {isPremium
              ? 'Open a living circle code, share the link. Friends cast stones from their own phones — distance does not break the rite.'
              : 'Pro rite — free seekers: use Cast stones on this phone (same-device circle).'}
          </p>
        )}
        {mode === 'anon' && (
          <p className="text-xs bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-[#4a1942]/75">
            {isPremium
              ? 'Anonymous veil — no names on the public feed. Policies and kindness still apply.'
              : 'Pro rite — free circle stays private on this device.'}
          </p>
        )}
        {mode === 'showcase' && (
          <p className="text-xs rounded-xl border border-[#c9a227]/35 bg-amber-50/80 px-3 py-2 text-[#4a1942]/75">
            One-tap sample of full Pro circle theater. Your real free counsel lives under Circle of counsel / Cast
            stones.
          </p>
        )}
        {mode === 'stones' && (
          <p className="text-xs rounded-xl bg-[#4a1942]/5 border border-[#4a1942]/10 px-3 py-2 text-[#4a1942]/75">
            Write both paths, pass the phone, tap <strong>Cast stone</strong>, then <strong>Close the rite</strong>.
            Stones (crowd) blend with how clearly each path is written.
          </p>
        )}
        {mode === 'circle' && (
          <p className="text-xs rounded-xl bg-violet-50/80 border border-violet-100 px-3 py-2 text-[#4a1942]/75">
            No audience needed. Name two paths with honesty; the sanctum scores clarity, owned feelings, and next
            steps — then seals a reading.
          </p>
        )}

        {mode !== 'showcase' &&
          sides.slice(0, maxSides).map((s, i) => (
            <div
              key={i}
              className="card p-4 space-y-2 border-l-4 border-l-violet-300/80"
            >
              <div className="flex gap-2 items-center">
                <span className="text-lg shrink-0" aria-hidden>
                  {i === 0 ? '☽' : i === 1 ? '☾' : '✦'}
                </span>
                <input
                  className="input flex-1"
                  value={s.label}
                  onChange={(e) => setSide(i, { label: e.target.value })}
                  placeholder={mode === 'stones' || mode === 'live' ? `Voice ${i + 1}` : `Path ${i + 1}`}
                />
                {(mode === 'stones' || mode === 'circle') && (
                  <button
                    type="button"
                    className="btn-primary text-xs shrink-0 px-3"
                    onClick={() => castStone(i)}
                  >
                    Cast stone ({s.votes || 0})
                  </button>
                )}
              </div>
              <textarea
                className="textarea"
                value={s.text}
                onChange={(e) => setSide(i, { text: e.target.value })}
                placeholder="What this path holds — what happened, what you need, any offering or plan forward…"
                maxLength={isPremium ? 800 : 500}
              />
            </div>
          ))}

        {err && <p className="text-sm text-red-600">{err}</p>}
        {pollNote && <p className="text-xs font-semibold text-[#4a1942]">{pollNote}</p>}

        {liveCode && (
          <div className="card p-4 space-y-2 border-[#c9a227]/40">
            <p className="text-[10px] font-bold uppercase text-[#c9a227]">Living circle code</p>
            <p className="font-mono text-lg font-bold text-[#4a1942]">{liveCode}</p>
            <a href={liveUrl} className="text-xs underline break-all">
              {liveUrl}
            </a>
            <ShareBar title="Hearth Court living circle" text={`Cast a stone: ${liveCode}`} url={liveUrl} />
            <Link to={`/poll/${liveCode}`} className="btn-primary text-sm text-center block">
              Open living results board
            </Link>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {(mode === 'circle' || mode === 'stones' || mode === 'live' || mode === 'anon') && (
            <button
              type="button"
              className="btn-secondary"
              onClick={addSide}
              disabled={sides.length >= maxSides}
            >
              Add path ({Math.min(sides.length, maxSides)}/{maxSides})
              {!isPremium && sides.length >= 2 ? ' · Pro for 3–4' : ''}
            </button>
          )}
          {mode === 'circle' && (
            <button type="button" className="btn-primary flex-1" onClick={runCircle}>
              {isPremium ? 'Convene the circle' : 'Receive free oracle seal'}
            </button>
          )}
          {mode === 'stones' && (
            <button type="button" className="btn-primary flex-1" onClick={runStones}>
              Close the rite & seal
            </button>
          )}
          {mode === 'showcase' && (
            <button type="button" className="btn-gold flex-1" onClick={runShowcase}>
              Reveal Pro sample seal
            </button>
          )}
          {mode === 'live' && (
            <button type="button" className="btn-primary flex-1" onClick={startLive}>
              {isPremium ? 'Open living circle' : 'Unlock living circle (Pro)'}
            </button>
          )}
          {mode === 'anon' && (
            <button type="button" className="btn-primary flex-1" onClick={runAnon}>
              {isPremium ? 'Offer under the veil' : 'Unlock anonymous veil (Pro)'}
            </button>
          )}
        </div>

        {verdict && !verdict.error && (
          <div className="card card-glow p-5 space-y-3 border-violet-200/60 bg-gradient-to-b from-violet-50/40 to-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#c9a227]">
              {verdict.freePeek
                ? 'Showcase seal'
                : verdict.freeBasic
                  ? 'Free oracle seal'
                  : 'Pro circle seal'}
              {verdict.ritualScore != null ? ` · ritual ${verdict.ritualScore}` : ''}
            </p>
            {question && (
              <p className="text-xs text-[#4a1942]/55 italic">Question: {question}</p>
            )}
            <p className="font-display font-bold text-xl text-[#4a1942]">{winnerLabel(verdict)}</p>
            {verdict.template?.note && (
              <p className="text-xs text-[#4a1942]/60">{verdict.template.note}</p>
            )}
            {verdict.poll?.ranked && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-[#4a1942]/40">Stones cast</p>
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
                        className="h-full bg-gradient-to-r from-violet-700 to-[#c9a227]"
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm italic leading-relaxed text-[#4a1942]/85 border-l-2 border-[#c9a227]/60 pl-3">
              {verdict.cliffNote}
            </p>
            {verdict.secondaryCliff && (
              <p className="text-xs text-[#4a1942]/55 border-l-2 border-violet-300/50 pl-3">
                Second seal: {verdict.secondaryCliff}
              </p>
            )}
            {verdict.sides?.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-bold uppercase text-[#4a1942]/40">How the oracle weighed each path</p>
                {verdict.sides.map((s) => (
                  <div key={s.label} className="rounded-xl bg-[#4a1942]/5 p-3 text-xs">
                    <p className="font-bold text-[#4a1942]">
                      {s.label} · weight {s.score}
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
                  : `Hearth Court leans ${verdict.winner}. ${verdict.cliffNote || ''}`
              }
            />
            <ProValueStrip
              freePeek={verdict.freePeek || verdict.freeBasic}
              unlocks={verdict.proUnlocks}
              title={
                verdict.freeBasic
                  ? 'You already received a real seal — Pro never runs out of cliff notes'
                  : 'Pro Hearth Court goes deeper'
              }
            />
            <Link to="/dashboard?tab=results" className="text-xs underline">
              Saved to your seals →
            </Link>
          </div>
        )}

        {mode === 'anon' && isPremium && anonFeed.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-[#4a1942]/40">Anonymous circle feed</p>
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
