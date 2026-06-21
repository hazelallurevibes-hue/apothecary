import { getSafetyDisplay } from '../lib/foodSafety';

export default function SafetyStatusBadge({ item, className = '', compact = false }) {
  const info = getSafetyDisplay(item);
  const verified = info.status === 'verified';

  if (compact) {
    if (verified) {
      return (
        <span
          className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 ${className}`}
          title={info.detail}
        >
          ✓ Safe
        </span>
      );
    }
    return (
      <span
        className={`text-[9px] text-gray-400 font-normal ${className}`}
        title={info.detail}
      >
        unverified
      </span>
    );
  }

  if (verified) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border-2 bg-emerald-50 text-emerald-800 border-emerald-400 shadow-sm ${className}`}
        title={info.detail}
      >
        <span className="text-sm">✓</span> {info.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[9px] font-normal text-gray-400 ${className}`}
      title={info.detail}
    >
      {info.label}
    </span>
  );
}