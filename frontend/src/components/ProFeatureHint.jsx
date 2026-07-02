import { Link } from 'react-router-dom';
import { dismissHint, isHintDismissed, PRO_HINTS, proUpgradePath } from '../lib/proFeatureHints';

export default function ProFeatureHint({ hintKey, className = '' }) {
  const hint = PRO_HINTS[hintKey];
  if (!hint || isHintDismissed(hintKey)) return null;

  return (
    <div
      className={`rounded-2xl border border-[#4a1942]/15 bg-gradient-to-br from-[#faf7f9] to-white p-4 text-sm shadow-sm ${className}`}
      role="note"
    >
      <p className="font-medium text-[#4a1942] mb-1">{hint.title}</p>
      <p className="text-gray-600 leading-relaxed mb-3">{hint.body}</p>
      <div className="flex flex-wrap gap-2 items-center">
        <Link
          to={proUpgradePath(hint.plan)}
          className="px-3 py-1.5 rounded-full bg-[#4a1942] text-white text-xs font-medium hover:bg-[#3d1536]"
        >
          {hint.cta}
        </Link>
        <button
          type="button"
          onClick={() => dismissHint(hintKey)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Not now
        </button>
      </div>
    </div>
  );
}