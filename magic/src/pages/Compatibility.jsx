import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import ShareBar from '../components/ShareBar';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import FeatureExplainer from '../components/FeatureExplainer';
import DateOfBirthFields from '../components/DateOfBirthFields';
import InfoTip from '../components/InfoTip';
import { computeCompatibility } from '../lib/compatibility';
import { recordHistory } from '../lib/historyStore';
import { unlockAchievement } from '../lib/achievements';
import { POLICY_BLURB } from '../lib/contentPolicy';
import { loadLocalProfile } from '../lib/profileStore';
import { HAZEL_LINKS } from '../lib/hazel';

export default function Compatibility() {
  const mine = loadLocalProfile();
  const [nameA, setNameA] = useState(mine?.birthName || 'You');
  const [dobA, setDobA] = useState(mine?.dob || '');
  const [nameB, setNameB] = useState('');
  const [dobB, setDobB] = useState('');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const run = () => {
    setErr('');
    try {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dobA) || !/^\d{4}-\d{2}-\d{2}$/.test(dobB)) {
        throw new Error('Please finish both birthdays as year, month, and day (example 1955-06-15).');
      }
      const r = computeCompatibility(dobA, dobB, nameA, nameB || 'Them');
      setResult(r);
      recordHistory({
        type: 'compat',
        title: `Compatibility: ${nameA} × ${nameB || 'Them'}`,
        summary: `${r.score}% · ${r.vibe}`,
        payload: r,
      });
      unlockAchievement('first_fortune');
    } catch (e) {
      setErr(e.message || 'Could not compute');
    }
  };

  return (
    <div className="space-y-4">
      <SeoHead
        title="Chart Harmony — Typed Birthdays, Deep Notes | Magic Sanctum"
        description="Type birthdays easily (no tiny calendar only). Element, animal, life path scores with hover explainers."
        path="/compatibility"
      />
      <h1 className="font-display font-bold text-3xl text-[#4a1942]">Chart harmony</h1>
      <p className="text-sm text-[#4a1942]/65 leading-relaxed">
        Two birthdays → playful score from elements, Chinese animals, and life paths. Type the dates if calendars
        feel tiny. Consent before using someone else’s birthday.
      </p>
      <p className="text-[10px] text-[#4a1942]/50">{POLICY_BLURB}</p>

      <FeatureExplainer
        title="A weave for stories — not a sentence"
        what="Chart Harmony mixes Western-style elements, Chinese animal years, and a simple life-path number game. It is entertainment: a conversation starter, not destiny or therapy."
        how="Enter both names and birthdays (type year / month / day). Tap Weave. Hover the ! icons on each category to learn origin and meaning."
        tips={[
          'Get consent before charting another person.',
          'Use notes to talk, not to win.',
          'If the relationship is unsafe, stop the game and seek real help.',
        ]}
        freeNote="Full free weave with category scores and tips."
        proNote="Pro adds deeper sanctum libraries elsewhere (Storm, Familiar, live Court)."
        guideTo="/guides/chart-harmony"
        apothecaryHint="Book a human practitioner →"
        apothecaryHref={HAZEL_LINKS.services()}
        accent="from-rose-50 to-white"
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card p-4 space-y-3">
          <p className="text-xs font-bold uppercase text-[#4a1942]/45">Person A</p>
          <input className="input" value={nameA} onChange={(e) => setNameA(e.target.value)} placeholder="Name" />
          <DateOfBirthFields id="dobA" label="Birthday A" value={dobA} onChange={setDobA} />
        </div>
        <div className="card p-4 space-y-3">
          <p className="text-xs font-bold uppercase text-[#4a1942]/45">Person B</p>
          <input className="input" value={nameB} onChange={(e) => setNameB(e.target.value)} placeholder="Name" />
          <DateOfBirthFields id="dobB" label="Birthday B" value={dobB} onChange={setDobB} />
        </div>
      </div>

      <button type="button" className="btn-primary w-full py-3 text-base" onClick={run}>
        Weave the charts
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}

      {result && (
        <div className="card card-glow p-5 space-y-4 border-rose-200/60">
          <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-black">{result.vibe}</p>
          <p className="font-display text-5xl font-bold text-[#4a1942]">{result.score}%</p>
          <p className="text-sm text-[#4a1942]/65">Overall playful harmony — hover each category ! for origin & meaning.</p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-rose-50/80 p-3 border border-rose-100">
              <p className="font-bold text-sm">{result.a.name}</p>
              <p>
                {result.a.western.symbol} {result.a.western.sign} · {result.a.western.element}
              </p>
              <p className="text-[10px] text-[#4a1942]/55 mt-1">{result.a.elementMeaning}</p>
              <p className="mt-1">
                {result.a.chinese.emoji} {result.a.chinese.animal} · path {result.a.lifePath}
              </p>
            </div>
            <div className="rounded-xl bg-violet-50/80 p-3 border border-violet-100">
              <p className="font-bold text-sm">{result.b.name}</p>
              <p>
                {result.b.western.symbol} {result.b.western.sign} · {result.b.western.element}
              </p>
              <p className="text-[10px] text-[#4a1942]/55 mt-1">{result.b.elementMeaning}</p>
              <p className="mt-1">
                {result.b.chinese.emoji} {result.b.chinese.animal} · path {result.b.lifePath}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {result.categories?.map((c) => (
              <div key={c.id} className="rounded-xl border border-[#4a1942]/10 bg-white/80 p-3">
                <div className="flex items-center justify-between gap-2">
                  <InfoTip label={c.label} title={c.origin}>
                    <strong>Meaning:</strong> {c.meaning}
                    <br />
                    <strong>Tip:</strong> {c.tip}
                  </InfoTip>
                  <span className="font-black text-[#4a1942]">{c.score}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#4a1942]/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#4a1942] to-[#c9a227]"
                    style={{ width: `${Math.min(100, c.score)}%` }}
                  />
                </div>
                <p className="text-xs text-[#4a1942]/70 mt-2 leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>

          {result.mysticalExtras?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-[#c9a227]">Other playful measures</p>
              {result.mysticalExtras.map((x) => (
                <div key={x.label} className="rounded-xl bg-amber-50/80 border border-amber-100 px-3 py-2 text-xs">
                  <InfoTip label={x.label} title="Entertainment measure">
                    Not financial or career advice — a spark for conversation. For real money or job decisions, consult
                    qualified humans.
                  </InfoTip>
                  <p className="mt-1 text-[#4a1942]/75">{x.text}</p>
                </div>
              ))}
            </div>
          )}

          <div>
            <p className="text-[10px] font-black uppercase text-[#4a1942]/45 mb-1">How to keep the weave</p>
            <ul className="text-sm space-y-1 list-disc pl-4 text-[#4a1942]/80">
              {(result.keepTips || []).map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>

          <p className="text-[10px] text-red-600">{result.disclaimer}</p>
          <ShareBar
            title="Chart harmony"
            text={`${result.a.name} × ${result.b.name}: ${result.score}% · ${result.vibe}`}
            meta={result.notes[0]}
          />
          <div className="flex flex-wrap gap-2">
            <Link to="/pathfinder" className="btn-secondary text-xs">
              Career Pathfinder
            </Link>
            <a href={HAZEL_LINKS.services()} className="btn-primary text-xs">
              Talk with a practitioner
            </a>
          </div>
        </div>
      )}

      <ApothecaryFunnel variant="compact" />
    </div>
  );
}
