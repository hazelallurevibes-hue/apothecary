export default function VerifiedVendorBadge({ vendor, compact = false }) {
  if (!vendor) return null;
  const idOk = !!vendor.identity_verified;
  const permitOk = !!vendor.permit_verified;
  if (!idOk && !permitOk) return null;

  if (compact) {
    return (
      <span className="inline-flex gap-1">
        {idOk && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800" title="Identity verified">ID✓</span>}
        {permitOk && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800" title="Permit on file">Permit✓</span>}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {idOk && (
        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
          ✓ Identity verified
        </span>
      )}
      {permitOk && (
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          ✓ Permit on file
        </span>
      )}
    </div>
  );
}