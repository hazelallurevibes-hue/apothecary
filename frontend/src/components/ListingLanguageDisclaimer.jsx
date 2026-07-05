import {
  BANNED_DISEASE_CLAIM_HINTS,
  LISTING_LANGUAGE_DISCLAIMER,
  listingCopyLooksRisky,
} from '../lib/listingLanguageCompliance';

/** Humorous + legally informative FDA-style language reminder for practitioners. */
export default function ListingLanguageDisclaimer({ draftText = '', variant = 'service', className = '' }) {
  const risky = listingCopyLooksRisky(draftText);
  const d = LISTING_LANGUAGE_DISCLAIMER;

  return (
    <aside
      className={`rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-[#f5f0e8] p-4 text-sm ${className}`}
      role="note"
      aria-label="Listing language compliance reminder"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
        🪶 {d.title}
      </p>
      <p className="text-gray-700 mt-2 leading-relaxed">{d.body}</p>
      <p className="text-[#4a1942] font-medium mt-2 leading-relaxed">{d.punchline}</p>
      {variant === 'product' && (
        <p className="text-xs text-gray-600 mt-2 border-t border-amber-100 pt-2">{d.productNote}</p>
      )}
      {risky && (
        <p className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-3 font-medium">
          Heads up: your draft may include regulated words ({BANNED_DISEASE_CLAIM_HINTS.slice(0, 4).join(', ')}, etc.). Soften to wellness or spiritual support language before publishing.
        </p>
      )}
    </aside>
  );
}