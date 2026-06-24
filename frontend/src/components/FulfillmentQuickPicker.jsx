import { FULFILLMENT_MODES } from '../lib/internationalStorefront';

/** Compact icons + short labels for practitioner quick-add flows */
export const FULFILLMENT_QUICK_META = {
  hazelallure: { icon: '📦', shortLabel: 'Ship / checkout', hint: 'Add to cart on Hazel Allure' },
  pickup_only: { icon: '🌿', shortLabel: 'Local pickup', hint: 'Customer picks up in person' },
  external_only: { icon: '↗️', shortLabel: 'External store', hint: 'Buy on Amazon, Etsy, your shop, etc.' },
};

/**
 * Reusable compact fulfillment mode picker (radio cards).
 * Props: value, onChange, disabled, allowModes (ids), compact, className
 */
export default function FulfillmentQuickPicker({
  value = 'hazelallure',
  onChange,
  disabled = false,
  allowModes = null,
  compact = false,
  className = '',
  idPrefix = 'fulfillment',
}) {
  const modes = allowModes
    ? FULFILLMENT_MODES.filter((m) => allowModes.includes(m.id))
    : FULFILLMENT_MODES;

  return (
    <fieldset className={`border-0 p-0 m-0 min-w-0 ${className}`}>
      <legend className="sr-only">How customers receive this item</legend>
      <div className={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {modes.map((mode) => {
          const meta = FULFILLMENT_QUICK_META[mode.id] || { icon: '✨', shortLabel: mode.label, hint: mode.description };
          const selected = value === mode.id;
          const inputId = `${idPrefix}-${mode.id}`;

          return (
            <label
              key={mode.id}
              htmlFor={inputId}
              className={`flex items-start gap-3 rounded-2xl border-2 p-4 cursor-pointer transition min-h-[3.5rem] ${
                selected
                  ? 'border-[#4a1942] bg-[#f5f0e8] shadow-sm'
                  : 'border-gray-200 bg-white hover:border-[#4a1942]/40'
              } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <input
                type="radio"
                id={inputId}
                name={idPrefix}
                value={mode.id}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange?.(mode.id)}
                className="mt-1 shrink-0 w-5 h-5 accent-[#4a1942]"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-semibold text-[#4a1942]">
                  <span className="text-xl leading-none" aria-hidden="true">{meta.icon}</span>
                  {meta.shortLabel}
                </span>
                <span className="block text-xs text-gray-600 mt-1">{meta.hint}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}