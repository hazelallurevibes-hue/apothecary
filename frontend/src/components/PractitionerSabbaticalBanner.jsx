export default function PractitionerSabbaticalBanner({ vendor }) {
  if (!vendor?.sabbatical_active) return null;

  const returns = vendor.sabbatical_returns_at
    ? new Date(vendor.sabbatical_returns_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/80 px-5 py-4">
      <div className="flex flex-wrap items-start gap-3">
        <span className="text-2xl" aria-hidden>🌙</span>
        <div>
          <p className="font-semibold text-indigo-950">Practitioner sabbatical</p>
          <p className="text-sm text-indigo-900/80 mt-1">
            {vendor.sabbatical_note || 'This practitioner is resting and may respond slowly or pause new bookings.'}
            {returns && (
              <span className="block mt-1 text-indigo-700">
                Expected return: {returns}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}