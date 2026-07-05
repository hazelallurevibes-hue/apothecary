/** Seeker checkout — pickup & shipping only (no food-delivery apps). */

const OPTIONS = [
  { value: 'pickup', label: 'Local pickup', hint: 'Free — meet your practitioner', icon: '🌿' },
  { value: 'shipping', label: 'Shipping / delivery', hint: 'Rates set by practitioner', icon: '📦' },
];

export function deliveryOptionsForListingMode(fulfillmentMode) {
  const mode = fulfillmentMode || 'pickup_and_shipping';
  if (mode === 'pickup_only') return OPTIONS.filter((o) => o.value === 'pickup');
  if (mode === 'shipping') return OPTIONS.filter((o) => o.value === 'shipping');
  return OPTIONS;
}

export default function CheckoutDeliveryPicker({
  value = 'pickup',
  onChange,
  fulfillmentMode = 'pickup_and_shipping',
  className = '',
  selectId = 'delivery-select',
  variant = 'select',
}) {
  const options = deliveryOptionsForListingMode(fulfillmentMode);

  if (variant === 'radios') {
    return (
      <fieldset className={`border-0 p-0 m-0 ${className}`}>
        <legend className="text-sm font-medium mb-2 block">Fulfillment</legend>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border cursor-pointer text-sm ${
                value === opt.value ? 'border-[#4a1942] bg-[#f5f0e8]' : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={selectId}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange?.(opt.value)}
                className="accent-[#4a1942]"
              />
              <span>{opt.icon} {opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <select
      id={selectId}
      className={`w-full border p-2 rounded mb-3 text-sm ${className}`}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.icon} {opt.label} — {opt.hint}
        </option>
      ))}
    </select>
  );
}

export function formatDeliverySuccessNote(method) {
  if (method === 'pickup') return ' — ready for local pickup! Your practitioner will confirm details.';
  if (method === 'shipping') return ' — shipping arranged with your practitioner.';
  return '';
}