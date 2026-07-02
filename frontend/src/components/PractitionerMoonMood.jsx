import { getPractitionerMoonMood } from '../lib/seasonalSanctum';

export default function PractitionerMoonMood({ className = '' }) {
  const mood = getPractitionerMoonMood();

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-900/80 border border-indigo-200/50 ${className}`}
      title={mood.vibe}
    >
      <span aria-hidden>{mood.emoji}</span>
      <span className="font-medium">{mood.mood}</span>
      <span className="text-indigo-700/60 hidden sm:inline">· {mood.vibe}</span>
    </span>
  );
}