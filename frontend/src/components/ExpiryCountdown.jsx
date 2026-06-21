import { useEffect, useState } from 'react';
import { getExpiryInfo, formatCountdown } from '../lib/expiryUtils';

export default function ExpiryCountdown({ goodByDate, compact, showHarvest }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const info = getExpiryInfo(goodByDate);
  void tick;

  const styles = {
    fresh: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-300',
    critical: 'bg-red-50 text-red-800 border-red-300 animate-pulse',
    expired: 'bg-gray-100 text-gray-600 border-gray-300',
    unknown: 'bg-gray-50 text-gray-500 border-gray-200',
  };

  if (!goodByDate && !showHarvest) return null;

  return (
    <div
      className={`inline-flex flex-col gap-0.5 text-[10px] font-semibold px-2 py-1 rounded-lg border ${styles[info.status]}`}
      title={goodByDate ? `Good by ${goodByDate}` : undefined}
    >
      {goodByDate ? (
        <>
          <span>
            {info.status === 'expired' ? '⚠ Expired' : `⏳ ${formatCountdown(info.msRemaining)}`}
          </span>
          {!compact && <span className="font-normal opacity-80">Good by {goodByDate}</span>}
        </>
      ) : (
        <span>No expiry set</span>
      )}
    </div>
  );
}