import { useMemo } from 'react';
import { getMoonPhase } from '../lib/seasonalSanctum';

export default function BloodMoonBanner() {
  const phase = useMemo(() => getMoonPhase(), []);
  if (phase.name !== 'Full Moon') return null;

  return (
    <div
      className="mb-6 rounded-2xl border border-rose-300/50 bg-gradient-to-r from-rose-950/90 via-[#4a1942] to-rose-900/80 text-white px-5 py-4 shadow-lg"
      role="status"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-3xl" aria-hidden>🌕</span>
        <div>
          <p className="font-semibold tracking-wide text-rose-100">Blood Moon over the Apothecary</p>
          <p className="text-sm text-rose-50/90 mt-0.5">
            Full moon energy — illuminate your ritual shelf, honor what you release, and shop with gentle intention. Entertainment mood only.
          </p>
        </div>
      </div>
    </div>
  );
}