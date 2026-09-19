import { ACCOUNT_REGIONS, normalizeRegion } from '../lib/accountRegions';

export default function RegionSelect({ value, onChange, disabled, id = 'account-region' }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-gray-600">
        Country / region you operate from
      </label>
      <select
        id={id}
        disabled={disabled}
        className="mt-1 w-full border rounded-2xl p-3 text-sm"
        value={normalizeRegion(value)}
        onChange={(e) => onChange(e.target.value)}
      >
        {ACCOUNT_REGIONS.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
      <p className="text-[11px] text-gray-500 mt-1">
        Rules follow this region (cookies, VAT notes, listing claims). Not a worldwide one-size list.
      </p>
    </div>
  );
}
