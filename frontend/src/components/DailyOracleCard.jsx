import { getDailyOracle, getMoonPhase } from '../lib/seasonalSanctum';

export default function DailyOracleCard({ className = '' }) {
  const oracle = getDailyOracle();
  const moon = getMoonPhase();

  return (
    <div className={`rounded-2xl border border-[#c9a227]/25 bg-gradient-to-br from-[#faf7f9] to-white p-4 ${className}`}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#4a1942]/50 mb-1">Daily oracle · {moon.emoji} {moon.name}</p>
      <p className="text-sm text-[#4a1942]/90 italic leading-relaxed">&ldquo;{oracle}&rdquo;</p>
      <p className="text-[9px] text-gray-400 mt-2">Poetic reflection only — not advice.</p>
    </div>
  );
}