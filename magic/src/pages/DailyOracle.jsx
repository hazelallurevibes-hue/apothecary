import { freeDailyLine, askOracle } from '../lib/engines';
import { useMemo, useState } from 'react';
import SeoHead from '../components/SeoHead';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import { DISCLAIMER } from '../lib/brand';
import { Link } from 'react-router-dom';

export default function DailyOracle() {
  const dayKey = Math.floor(Date.now() / 86400000);
  const ink = useMemo(() => freeDailyLine(), []);
  const [extra, setExtra] = useState(null);

  return (
    <div className="space-y-5">
      <SeoHead
        title="Daily Sanctum Oracle — Free Moon Ink | Magic Sanctum"
        description="A free daily line from Magic Sanctum plus optional sphere spark. Updated every day for seekers."
        path="/oracle/daily"
      />
      <h1 className="font-display font-bold text-3xl text-[#4a1942]">Daily sanctum oracle</h1>
      <p className="text-xs text-[#4a1942]/50">Day seal #{dayKey} · free forever</p>
      <div className="card p-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227]">Moon ink</p>
        <p className="font-display text-2xl text-[#4a1942] mt-3 leading-snug italic">{ink}</p>
      </div>
      <button
        type="button"
        className="btn-primary w-full"
        onClick={() => setExtra(askOracle(`daily-${dayKey}`, 'classic'))}
      >
        Bonus sphere spark
      </button>
      {extra && (
        <div className="card p-4 text-center font-black text-2xl text-[#4a1942]">{extra.text}</div>
      )}
      <p className="text-sm">
        <Link to="/" className="underline">
          Full Sanctum Sphere
        </Link>{' '}
        ·{' '}
        <Link to="/guides/sanctum-sphere" className="underline">
          Guide
        </Link>
      </p>
      <p className="text-[10px] text-red-600">{DISCLAIMER}</p>
      <ApothecaryFunnel />
    </div>
  );
}
