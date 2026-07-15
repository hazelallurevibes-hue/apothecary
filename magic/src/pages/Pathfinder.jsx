import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import ShareBar from '../components/ShareBar';
import FeatureExplainer from '../components/FeatureExplainer';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import InfoTip from '../components/InfoTip';
import ProValueStrip from '../components/ProValueStrip';
import {
  APTITUDE_QUESTIONS,
  MBTI_TEASER_QUESTIONS,
  MBTI_PRO_QUESTIONS,
  drawPathSpark,
  scoreAptitude,
  scoreMbti,
  weavePathAndType,
  PATH_LINES,
} from '../lib/pathfinder';
import { unlockAchievement } from '../lib/achievements';
import { recordHistory } from '../lib/historyStore';
import { HAZEL_LINKS } from '../lib/hazel';
import { DISCLAIMER } from '../lib/brand';
import { useAuth } from '../context/AuthContext';

export default function Pathfinder() {
  const { isPremium } = useAuth();
  const [tab, setTab] = useState('aptitude'); // aptitude | personality | weave
  const [answers, setAnswers] = useState({});
  const [mbtiAnswers, setMbtiAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [mbtiResult, setMbtiResult] = useState(null);
  const [weave, setWeave] = useState(null);
  const [spark, setSpark] = useState(() => drawPathSpark());

  const setAns = (qid, oid) => setAnswers((a) => ({ ...a, [qid]: oid }));
  const setMbti = (qid, oid) => setMbtiAnswers((a) => ({ ...a, [qid]: oid }));

  const mbtiQs = isPremium ? MBTI_PRO_QUESTIONS : MBTI_TEASER_QUESTIONS;
  const complete = APTITUDE_QUESTIONS.every((q) => answers[q.id]);
  const mbtiComplete = mbtiQs.every((q) => mbtiAnswers[q.id]);

  const runAptitude = () => {
    const r = scoreAptitude(answers);
    setResult(r);
    unlockAchievement('first_pathfinder');
    recordHistory({
      type: 'pathfinder',
      title: 'Pathfinder aptitude',
      summary: r.top?.name || 'Path',
      payload: r,
    });
    if (mbtiResult && !mbtiResult.error) {
      setWeave(weavePathAndType(r, mbtiResult));
    }
  };

  const runMbti = () => {
    const r = scoreMbti(mbtiAnswers, { pro: isPremium });
    setMbtiResult(r);
    if (r.error) return;
    unlockAchievement('first_pathfinder');
    recordHistory({
      type: 'pathfinder_mbti',
      title: isPremium ? 'Path & Personality (full)' : 'Path & Personality (spark)',
      summary: r.type,
      payload: r,
    });
    if (result) {
      setWeave(weavePathAndType(result, r));
    }
  };

  return (
    <div className="space-y-4">
      <SeoHead
        title="Pathfinder — Career, Money Literacy & Path Personality | Magic Sanctum"
        description={`${PATH_LINES.length}+ path lines. Career aptitude, money seals, and Myers-Briggs-style path personality. Free spark + Pro depth. Entertainment only.`}
        path="/pathfinder"
      />
      <h1 className="font-display font-bold text-3xl text-[#4a1942]">Pathfinder</h1>
      <p className="text-sm text-[#4a1942]/65">
        Career tracks, money literacy seals, and a Path & Personality map — built for reflection and conversation,
        not hiring, diagnosis, or financial advice. Library: {PATH_LINES.length.toLocaleString()} path lines.
      </p>

      <FeatureExplainer
        title="Map your work without a sales trap"
        what="Pathfinder combines a vocation aptitude quiz, money-rhythm seals, and an optional Myers-Briggs–style personality spark. Free users get the full aptitude exam + a 4-question personality teaser. Pro unlocks the 12-question battery and a linked weave between type and career tracks."
        how="Finish Career aptitude and/or Path & Personality. Seal each reading. On Pro (or after both free pieces), open Weave to see how temperament and vocation talk to each other."
        tips={[
          'Trade one skill for money this month, even small.',
          'Track money weekly so fear gets less airtime.',
          'Rest is part of the path.',
          'Type language is a mirror, not a cage.',
        ]}
        freeNote="Full aptitude + 4-question personality spark + thousands of path lines free."
        proNote="Pro: 12-question Path & Personality, full type career overlays, money seals, aptitude×type weave, plus Storm / Familiar / live Court on the same Hazel plan."
        apothecaryHint="Courses & practitioners →"
        apothecaryHref={HAZEL_LINKS.courses()}
        accent="from-emerald-50 to-white"
      />

      <div className="card p-4 border-emerald-100">
        <p className="text-[10px] font-black uppercase text-emerald-800">Free path spark</p>
        <p className="text-sm text-[#4a1942] mt-1 leading-relaxed">{spark}</p>
        <button type="button" className="btn-secondary text-xs mt-2" onClick={() => setSpark(drawPathSpark(Date.now()))}>
          New spark
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'aptitude', label: 'Career & money' },
          { id: 'personality', label: 'Path & personality' },
          { id: 'weave', label: 'Weave both' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${
              tab === t.id
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'border-[#4a1942]/20 text-[#4a1942]/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'aptitude' && (
        <>
          <p className="text-xs text-[#4a1942]/60">
            Five questions map vocation energy, money stance, conflict style, day shape, and gifts into robust career
            tracks — not a joke quiz.
          </p>
          <div className="space-y-3">
            {APTITUDE_QUESTIONS.map((q) => (
              <div key={q.id} className="card p-4 space-y-2">
                <p className="font-semibold text-[#4a1942] text-sm sm:text-base">{q.q}</p>
                <div className="grid gap-2">
                  {q.options.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setAns(q.id, o.id)}
                      className={`text-left rounded-xl border px-3 py-2.5 text-sm transition ${
                        answers[q.id] === o.id
                          ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-950'
                          : 'border-[#4a1942]/15 hover:border-emerald-300 bg-white'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="btn-primary w-full py-3" disabled={!complete} onClick={runAptitude}>
            {complete ? 'Seal my career & money reading' : 'Answer all questions'}
          </button>

          {result && (
            <div className="card card-glow p-5 space-y-3 border-emerald-200">
              <p className="text-[10px] font-black uppercase text-emerald-700">Primary vocation track</p>
              <p className="font-display text-2xl font-bold text-[#4a1942]">{result.top.name}</p>
              <p className="text-sm text-[#4a1942]/70">{result.top.tip}</p>
              <p className="text-sm leading-relaxed border-l-2 border-[#c9a227] pl-3 italic">{result.pathLine}</p>

              {result.careerIdeas?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-[#4a1942]/45">Career idea sparks</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {result.careerIdeas.map((c) => (
                      <span
                        key={c}
                        className="text-[11px] font-semibold rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-emerald-950"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.secondaryTrack && (
                <div className="rounded-xl bg-[#4a1942]/5 p-3 text-sm">
                  <p className="text-[10px] font-bold uppercase text-[#4a1942]/45">Secondary track</p>
                  <p className="font-semibold text-[#4a1942]">{result.secondaryTrack.name}</p>
                  <p className="text-xs text-[#4a1942]/70 mt-0.5">{result.secondaryTrack.tip}</p>
                </div>
              )}

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                <InfoTip label={`Money literacy · ${result.moneyDepth?.title || 'Seal'}`} title="Not financial advice">
                  Money seals are reflection language for budgets, pricing honesty, and fear management. For
                  investments, taxes, debt, or legal money decisions — use a licensed professional.
                </InfoTip>
                <p className="text-sm mt-1 text-[#4a1942]/85 leading-relaxed">{result.moneyDepth?.line}</p>
                <p className="text-xs mt-2 italic text-[#4a1942]/65">{result.moneyLine}</p>
                {isPremium && result.moneyDepth?.allLines?.length > 1 && (
                  <ul className="mt-2 space-y-1 text-xs text-[#4a1942]/75 list-disc pl-4">
                    {result.moneyDepth.allLines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>

              {result.categories?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase text-[#4a1942]/45">Reading categories</p>
                  {result.categories.map((c) => (
                    <div key={c.id} className="rounded-lg border border-[#4a1942]/10 px-3 py-2 text-xs">
                      <p className="font-bold text-[#4a1942]">{c.label}</p>
                      <p className="text-[#4a1942]/75 mt-0.5 leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-[#4a1942]/45">All tracks scored</p>
                {result.ranked.map((t) => (
                  <div key={t.id} className="flex justify-between text-xs rounded-lg bg-[#4a1942]/5 px-2 py-1.5">
                    <span>{t.name}</span>
                    <span className="font-bold">{t.n}</span>
                  </div>
                ))}
              </div>
              <ul className="text-sm list-disc pl-4 space-y-1 text-[#4a1942]/75">
                {result.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="text-[10px] text-red-600">{result.disclaimer || DISCLAIMER}</p>
              <ShareBar title="Pathfinder" text={`${result.top.name}: ${result.pathLine}`} />
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-secondary text-xs" onClick={() => setTab('personality')}>
                  Add Path & personality →
                </button>
                <a href={HAZEL_LINKS.courses()} className="btn-primary text-xs">
                  Browse courses
                </a>
                <a href={HAZEL_LINKS.services()} className="btn-secondary text-xs">
                  Book practitioners
                </a>
                <Link to={HAZEL_LINKS.proExplainer('pathfinder')} className="btn-gold text-xs">
                  Why Pro?
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'personality' && (
        <>
          <div className="rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2 text-xs text-[#4a1942]/75">
            {isPremium ? (
              <>
                <strong>Pro Path & Personality:</strong> 12 questions across energy, information, decisions, and
                lifestyle — then a type seal with career fit tracks, money seal, and growth edge.
              </>
            ) : (
              <>
                <strong>Free spark:</strong> 4 questions (one per dimension) for a quick type lean.{' '}
                <Link to={HAZEL_LINKS.proExplainer('pathfinder')} className="underline font-semibold">
                  Pro unlocks the full 12-question battery
                </Link>{' '}
                and the aptitude×type weave.
              </>
            )}
          </div>

          <div className="space-y-3">
            {mbtiQs.map((q, idx) => (
              <div key={q.id} className="card p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase text-violet-700/70">
                  {isPremium ? `Q${idx + 1} · ${q.dim}` : `Spark · ${q.dim}`}
                </p>
                <p className="font-semibold text-[#4a1942] text-sm sm:text-base">{q.q}</p>
                <div className="grid gap-2">
                  {q.options.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setMbti(q.id, o.id)}
                      className={`text-left rounded-xl border px-3 py-2.5 text-sm transition ${
                        mbtiAnswers[q.id] === o.id
                          ? 'border-violet-500 bg-violet-50 font-semibold text-violet-950'
                          : 'border-[#4a1942]/15 hover:border-violet-300 bg-white'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="btn-primary w-full py-3" disabled={!mbtiComplete} onClick={runMbti}>
            {mbtiComplete
              ? isPremium
                ? 'Seal full Path & Personality'
                : 'Seal free personality spark'
              : 'Answer all questions'}
          </button>

          {mbtiResult && !mbtiResult.error && (
            <div className="card card-glow p-5 space-y-3 border-violet-200">
              <p className="text-[10px] font-black uppercase text-violet-700">
                {mbtiResult.depth === 'full' ? 'Full type seal' : 'Free type spark'} · {mbtiResult.clarity}
              </p>
              <p className="font-display text-3xl font-bold text-[#4a1942] tracking-wide">{mbtiResult.type}</p>
              <p className="font-semibold text-[#4a1942]">{mbtiResult.title}</p>
              <p className="text-sm text-[#4a1942]/75 leading-relaxed">{mbtiResult.blurb}</p>

              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {(mbtiResult.dimensions || []).map((d) => (
                  <div key={d.id} className="rounded-lg bg-violet-50/80 border border-violet-100 px-2.5 py-2">
                    <p className="font-bold text-violet-900">{d.label}</p>
                    <p className="text-[#4a1942]/70 mt-0.5">
                      Leans <strong>{d.lean}</strong>
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-white border border-[#4a1942]/10 p-3 text-sm space-y-2">
                <p>
                  <span className="text-[10px] font-bold uppercase text-[#4a1942]/45">Work style</span>
                  <br />
                  {mbtiResult.workStyle}
                </p>
                <p>
                  <span className="text-[10px] font-bold uppercase text-[#4a1942]/45">Growth edge</span>
                  <br />
                  {mbtiResult.growth}
                </p>
                <p>
                  <span className="text-[10px] font-bold uppercase text-[#4a1942]/45">Money seal</span>
                  <br />
                  {mbtiResult.moneySeal}
                </p>
              </div>

              {mbtiResult.fitTracks?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-[#4a1942]/45">Career tracks that often fit</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {mbtiResult.fitTracks.map((t) => (
                      <span
                        key={t.id}
                        className="text-[11px] font-semibold rounded-full bg-violet-50 border border-violet-100 px-2.5 py-1"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm italic border-l-2 border-[#c9a227] pl-3">{mbtiResult.pathLine}</p>
              <p className="text-xs text-[#4a1942]/70">{mbtiResult.moneyLine}</p>
              <p className="text-[10px] text-red-600">{mbtiResult.disclaimer}</p>

              {!isPremium && (
                <ProValueStrip
                  freePeek
                  unlocks={mbtiResult.proUnlocks}
                  title="Pro Path & Personality is a full map"
                />
              )}

              <ShareBar
                title="Path & Personality"
                text={`${mbtiResult.type} — ${mbtiResult.title}. ${mbtiResult.blurb}`}
              />
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-secondary text-xs" onClick={() => setTab('weave')}>
                  Weave with career aptitude →
                </button>
                {!isPremium && (
                  <a href={HAZEL_LINKS.proUpgrade('pathfinder_mbti')} className="btn-gold text-xs">
                    Unlock full 12-question map
                  </a>
                )}
              </div>
            </div>
          )}
          {mbtiResult?.error && <p className="text-sm text-red-600">{mbtiResult.error}</p>}
        </>
      )}

      {tab === 'weave' && (
        <div className="space-y-3">
          <p className="text-sm text-[#4a1942]/70">
            Link your vocation aptitude with your Path & Personality type for a single decision-friendly summary.
          </p>
          {(!result || !mbtiResult || mbtiResult.error) && (
            <div className="card p-4 text-sm text-[#4a1942]/75 space-y-2">
              <p>Complete both pieces first:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <button type="button" className="underline font-semibold" onClick={() => setTab('aptitude')}>
                    Career & money aptitude
                  </button>
                  {result ? ' ✓' : ' — not sealed yet'}
                </li>
                <li>
                  <button type="button" className="underline font-semibold" onClick={() => setTab('personality')}>
                    Path & personality
                  </button>
                  {mbtiResult && !mbtiResult.error ? ' ✓' : ' — not sealed yet'}
                </li>
              </ul>
              {!isPremium && (
                <p className="text-xs text-[#4a1942]/55 pt-1">
                  Free users can weave the aptitude with the 4-question spark. Pro deepens both sides of the map.
                </p>
              )}
            </div>
          )}
          {weave && (
            <div className="card card-glow p-5 space-y-3 border-[#c9a227]/40">
              <p className="text-[10px] font-black uppercase text-[#c9a227]">Aptitude × type weave</p>
              <p className="font-display text-xl font-bold text-[#4a1942]">{weave.summary}</p>
              <p className="text-sm leading-relaxed text-[#4a1942]/80">{weave.bridge}</p>
              <p className="text-sm italic border-l-2 border-emerald-400 pl-3">{weave.seal}</p>
              <div>
                <p className="text-[10px] font-bold uppercase text-[#4a1942]/45">Ritual stack</p>
                <ul className="mt-1 text-sm list-disc pl-4 space-y-1 text-[#4a1942]/75">
                  {weave.rituals.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              {isPremium && (
                <div className="rounded-xl bg-amber-50/80 border border-amber-100 p-3 text-xs text-[#4a1942]/75">
                  <p className="font-bold text-[10px] uppercase text-[#c9a227]">Pro depth note</p>
                  <p className="mt-1">
                    Your full type battery and money seals are active. Revisit Pathfinder after big life chapters —
                    vocation is a path, not a prison.
                  </p>
                </div>
              )}
              <ShareBar title="Path weave" text={weave.summary} meta={weave.bridge} />
              <Link to={HAZEL_LINKS.proExplainer('pathfinder')} className="btn-gold text-xs inline-flex">
                Pro libraries & Hazel plan
              </Link>
            </div>
          )}
        </div>
      )}

      <ApothecaryFunnel variant="compact" />
    </div>
  );
}
