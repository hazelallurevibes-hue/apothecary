import { Link } from 'react-router-dom';
import { REMEDY_DISCLAIMER_LONG, REMEDY_DISCLAIMER_SHORT } from '../lib/remedies/remedyLibrary';

/** Strong, reusable medical research disclaimer for remedies hub. */
export default function MedicalResearchDisclaimer({ variant = 'banner', className = '' }) {
  if (variant === 'compact') {
    return (
      <p className={`text-xs text-amber-900/90 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 ${className}`} role="note">
        <strong>Not medical advice.</strong> {REMEDY_DISCLAIMER_SHORT}{' '}
        <Link to="/customer-use-agreement" className="underline font-medium">
          Seeker agreement
        </Link>
        .
      </p>
    );
  }

  if (variant === 'footer') {
    return (
      <aside className={`rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-sm text-rose-950 ${className}`} role="note">
        <h2 className="font-bold text-base mb-2">Critical safety notice</h2>
        <ul className="list-disc pl-5 space-y-2 leading-relaxed">
          {REMEDY_DISCLAIMER_LONG.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs">
          Legal terms:{' '}
          <Link to="/agreements" className="underline">
            Agreements
          </Link>
          {' · '}
          <Link to="/policies-procedures" className="underline">
            Policies
          </Link>
          {' · '}
          <Link to="/customer-use-agreement" className="underline">
            Seeker use agreement
          </Link>
        </p>
      </aside>
    );
  }

  return (
    <div
      className={`rounded-2xl border-2 border-amber-400/70 bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-5 shadow-sm ${className}`}
      role="alert"
    >
      <p className="text-sm sm:text-base font-semibold text-amber-950">
        Research only — not medical advice
      </p>
      <p className="text-sm text-amber-950/90 mt-2 leading-relaxed">
        {REMEDY_DISCLAIMER_SHORT} If you have a health concern, <strong>stop and seek licensed medical attention</strong>.
        Emergency symptoms require emergency services — not this website.
      </p>
    </div>
  );
}
