import { listingFlagsForRegion, regionPolicy } from '../lib/accountRegions';

export default function RegionRulesPanel({ regionId, compact = false }) {
  const p = regionPolicy(regionId);
  const flags = listingFlagsForRegion(regionId);
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
      <p className="font-semibold">Rules for {p.label}</p>
      <ul className="mt-2 list-disc pl-4 space-y-1 text-xs">
        {flags.map((f) => (
          <li key={f.id}>{f.label}</li>
        ))}
        {p.distanceSellingWithdrawalDays > 0 && (
          <li>{p.distanceSellingWithdrawalDays}-day consumer withdrawal may apply to goods (not custom/opened hygiene products).</li>
        )}
        <li>Platform VAT/IOSS: not registered yet — you handle local tax until we finish banking and stamped articles.</li>
      </ul>
      {!compact && (
        <ul className="mt-3 space-y-1 text-xs text-amber-900/90">
          {p.notes.map((n) => (
            <li key={n.slice(0, 40)}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
