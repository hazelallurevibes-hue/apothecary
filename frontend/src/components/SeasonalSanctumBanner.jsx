import { getMoonPhase, getSeasonalAccent } from '../lib/seasonalSanctum';
import DailyOracleCard from './DailyOracleCard';

export default function SeasonalSanctumBanner() {
  const moon = getMoonPhase();
  const season = getSeasonalAccent();

  return (
    <div className="mb-8 space-y-4">
      <div className={`rounded-3xl border border-[#4a1942]/10 bg-gradient-to-r ${season.gradient} p-5 flex flex-wrap items-center gap-4`}>
        <span className="text-3xl" aria-hidden>{moon.emoji}</span>
        <div className="flex-1 min-w-[200px]">
          <p className="text-xs uppercase tracking-widest text-[#4a1942]/60">{season.label} · {moon.name}</p>
          <p className="text-sm text-gray-700 mt-1">{moon.tone}</p>
        </div>
      </div>
      <DailyOracleCard />
    </div>
  );
}