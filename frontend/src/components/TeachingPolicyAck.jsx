import { Link } from 'react-router-dom';
import { TEACHING_POLICY_SUMMARY } from '../lib/teachingCancellation';

/**
 * Required acknowledgment before Teaching Sanctum enroll / book.
 */
export default function TeachingPolicyAck({ checked, onChange, className = '' }) {
  const p = TEACHING_POLICY_SUMMARY;
  return (
    <div className={`rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-950 space-y-2 ${className}`}>
      <p className="font-semibold text-sm text-[#4a1942]">Teaching Sanctum cancellation &amp; safety policy</p>
      <ul className="list-disc pl-4 space-y-1">
        {p.bullets.map((b) => (
          <li key={b.slice(0, 40)}>{b}</li>
        ))}
      </ul>
      <p className="text-[11px] text-gray-600">
        Full terms:{' '}
        <Link to="/agreements#teaching" className="underline text-[#4a1942] font-medium">
          Teaching Sanctum Agreements
        </Link>
        . Platform is not a school, medical provider, or guarantor of outcomes.
      </p>
      <label className="flex items-start gap-2 cursor-pointer pt-1">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={!!checked}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span>
          I acknowledge the {p.cancelHours}-hour cancel rule, the {p.freeCancelLimit} free-cancel limit, the non-refundable{' '}
          {p.holdFeePercent}% hold fee after that, and that I am responsible for my own due diligence.
        </span>
      </label>
    </div>
  );
}
