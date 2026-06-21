import { Link } from 'react-router-dom';

/** Shown when vendors list medicinal/therapeutic plants — legal compliance reminder. */
export default function MedicinalPlantWarning({ compact = false, showAck = false, acknowledged = false, onAckChange }) {
  const body = (
    <>
      <strong>Medicinal &amp; therapeutic plants:</strong> You are solely responsible for compliance with all applicable{' '}
      <strong>local, state, and federal laws</strong>, including restrictions on sale, labeling, licensing, and interstate
      shipment. Hazel Allure does not verify legality. List only what you are authorized to sell. Buyers must also comply with
      laws in their jurisdiction.{' '}
      <Link to="/policies-procedures" className="underline text-amber-900">Policies</Link>
      {' · '}
      <Link to="/faq" className="underline text-amber-900">FAQ</Link>
      {' · '}
      <Link to="/agreements" className="underline text-amber-900">Agreements</Link>
    </>
  );

  if (compact) {
    return (
      <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 leading-snug">
        ⚠️ Medicinal plant — vendor &amp; buyer must follow all local &amp; federal laws. Hazel Allure does not verify legality.
      </p>
    );
  }

  return (
    <div className="text-sm text-amber-950 bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-3">
      <p className="leading-relaxed">{body}</p>
      {showAck && (
        <label className="flex items-start gap-2 cursor-pointer text-xs font-medium">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => onAckChange?.(e.target.checked)}
            className="mt-0.5 shrink-0"
          />
          <span>
            I confirm this listing complies with all applicable local, state, and federal laws, and I accept full liability
            for this listing.
          </span>
        </label>
      )}
    </div>
  );
}