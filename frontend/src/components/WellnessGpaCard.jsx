import { useEffect, useState } from 'react';
import { computeWellnessLearningScore } from '../lib/sanctumAdvancedApi';

export default function WellnessGpaCard({ user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    computeWellnessLearningScore(user.email).then(setData).catch(() => {});
  }, [user?.email]);

  if (!data) return null;

  return (
    <div className="rounded-2xl border border-indigo-200/50 bg-indigo-50/30 p-4">
      <p className="text-xs uppercase tracking-widest text-indigo-900/60">Wellness learning score</p>
      <p className="text-3xl font-semibold text-[#4a1942]">{data.score.toFixed(2)}</p>
      <p className="text-[10px] text-red-600 mt-1">Illustrative only — not an academic GPA or professional credential.</p>
    </div>
  );
}