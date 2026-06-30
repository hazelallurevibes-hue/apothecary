import { PRACTITIONER_BADGE_CATALOG, parseBusinessBadges, toggleBadgeSelection } from '../lib/practitionerBadges';

export default function PractitionerBadgeEditor({ value, onChange, disabled = false }) {
  const selected = parseBusinessBadges(value);

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 leading-relaxed">
        Select badges that describe your practice. These appear on your public storefront. Self-declared — Hazel Allure does not independently verify ownership claims.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PRACTITIONER_BADGE_CATALOG.map((badge) => {
          const checked = selected.includes(badge.id);
          return (
            <label
              key={badge.id}
              className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                checked ? 'border-ha-primary bg-ha-rose-light/50' : 'border-gray-200 hover:border-ha-rose/40'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(toggleBadgeSelection(selected, badge.id))}
                className="mt-0.5 shrink-0"
              />
              <span className="min-w-0">
                <span className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                  <span aria-hidden="true">{badge.icon}</span>
                  {badge.label}
                </span>
                <span className="text-[11px] text-gray-500 block mt-0.5">{badge.title}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}