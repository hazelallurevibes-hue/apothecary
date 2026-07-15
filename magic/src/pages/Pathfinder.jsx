import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import ShareBar from '../components/ShareBar';
import FeatureExplainer from '../components/FeatureExplainer';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import InfoTip from '../components/InfoTip';
import { APTITUDE_QUESTIONS, drawPathSpark, scoreAptitude, PATH_LINES } from '../lib/pathfinder';
import { unlockAchievement } from '../lib/achievements';
import { recordHistory } from '../lib/historyStore';
import { HAZEL_LINKS } from '../lib/hazel';
import { DISCLAIMER } from '../lib/brand';

export default function Pathfinder() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [spark, setSpark] = useState(() => drawPathSpark());

  const setAns = (qid, oid) => setAnswers((a) => ({ ...a, [qid]: oid }));

  const run = () => {
    const r = scoreAptitude(answers);
    setResult(r);
    unlockAchievement('first_pathfinder');
    recordHistory({
      type: 'pathfinder',
      title: 'Pathfinder aptitude',
      summary: r.top?.name || 'Path',
      payload: r,
    });
  };

  const complete = APTITUDE_QUESTIONS.every((q) => answers[q.id]);

  return (
    <div className="space-y-4">
      <SeoHead
        title="Pathfinder — Free Career & Money Aptitude Sparks | Magic Sanctum"
        description={`${PATH_LINES.length}+ path lines. Simple aptitude exam for career and money vibes. Entertainment only.`}
        path="/pathfinder"
      />
      <h1 className="font-display font-bold text-3xl text-[#4a1942]">Pathfinder</h1>
      <p className="text-sm text-[#4a1942]/65">
        A free aptitude-style check for career and money <em>vibes</em> — not a licensed career test. Library:{' '}
        {PATH_LINES.length.toLocaleString()} path lines.
      </p>

      <FeatureExplainer
        title="Learn your path without a sales trap"
        what="Pathfinder is a short quiz plus offline path lines (thousands of combinations). It suggests tracks like People, Craft, Builder, Money literacy — for reflection and conversation."
        how="Answer each question. Seal the reading. Share if you want. For real career or financial decisions, use humans (coaches, advisors, mentors)."
        tips={[
          'Trade one skill for money this month, even small.',
          'Track money weekly so fear gets less airtime.',
          'Rest is part of the path.',
        ]}
        freeNote="Full quiz + 3,200 path lines free."
        proNote="Pro unlocks deeper Magic libraries (Storm, Familiar, live Court) on the same Hazel plan."
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

      <button type="button" className="btn-primary w-full py-3" disabled={!complete} onClick={run}>
        {complete ? 'Seal my path reading' : 'Answer all questions'}
      </button>

      {result && (
        <div className="card card-glow p-5 space-y-3 border-emerald-200">
          <p className="text-[10px] font-black uppercase text-emerald-700">Primary track</p>
          <p className="font-display text-2xl font-bold text-[#4a1942]">{result.top.name}</p>
          <p className="text-sm text-[#4a1942]/70">{result.top.tip}</p>
          <p className="text-sm leading-relaxed border-l-2 border-[#c9a227] pl-3 italic">{result.pathLine}</p>
          <div>
            <InfoTip label="Money literacy line" title="Not financial advice">
              Playful money rhythm language only. For investments, taxes, or debt — use a licensed professional.
            </InfoTip>
            <p className="text-sm mt-1 text-[#4a1942]/80">{result.moneyLine}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-[#4a1942]/45">Other tracks</p>
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

      <ApothecaryFunnel variant="compact" />
    </div>
  );
}
