import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { JOURNEY_STEPS, computeJourneyProgress } from '../lib/journeyMapApi';

export default function SeekerJourneyMap({ user }) {
  const [progress, setProgress] = useState({ completed: ['account'], percent: 12 });

  useEffect(() => {
    if (!user?.email) return;
    computeJourneyProgress(user.email).then(setProgress).catch(() => {});
  }, [user?.email]);

  return (
    <section className="rounded-3xl border border-[#4a1942]/10 bg-white p-6">
      <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[#4a1942]">Your seeker journey</h2>
          <p className="text-sm text-gray-500">A quiet map of milestones — no rush, only presence.</p>
        </div>
        <span className="text-sm font-medium text-[#4a1942]">{progress.percent}% illuminated</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {JOURNEY_STEPS.map((step) => {
          const done = progress.completed.includes(step.id);
          return (
            <div
              key={step.id}
              title={step.hint}
              className={`px-3 py-2 rounded-2xl text-xs border flex items-center gap-1.5 ${done ? 'bg-[#4a1942]/5 border-[#4a1942]/25 text-[#4a1942]' : 'border-gray-100 text-gray-400'}`}
            >
              <span>{step.icon}</span>
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>
      <Link to="/sanctum-student-hub" className="text-sm text-[#4a1942] hover:underline">
        Open Sanctum student hub →
      </Link>
    </section>
  );
}