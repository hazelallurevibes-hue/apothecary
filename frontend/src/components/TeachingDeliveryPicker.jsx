import { TEACHING_DELIVERY_MODES } from '../lib/teachingStudio';

/**
 * Multi-select delivery mode picker for course creation.
 * @param {{ value: string[], onChange: (ids: string[]) => void, disabled?: boolean, label?: string }} props
 */
export default function TeachingDeliveryPicker({
  value = [],
  onChange,
  disabled = false,
  label = 'How will seekers receive this teaching?',
}) {
  const selected = Array.isArray(value) ? value : [];

  const toggle = (id) => {
    if (disabled) return;
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    onChange?.(next);
  };

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-medium text-gray-700 mb-1">{label}</legend>
      <p className="text-xs text-gray-500 mb-3">
        Choose all formats that apply — async video, live streams, 1:1 mentorship, and more.
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        {TEACHING_DELIVERY_MODES.map((mode) => {
          const active = selected.includes(mode.id);
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => toggle(mode.id)}
              aria-pressed={active}
              className={`text-left p-3 rounded-2xl border transition text-sm ${
                active
                  ? 'border-[#4a1942] bg-[#f5f0e8] ring-1 ring-[#4a1942]/30'
                  : 'hover:border-[#c9a227]/40 hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="flex items-start gap-2">
                <span className="text-lg leading-none" aria-hidden="true">{mode.icon}</span>
                <span>
                  <span className="font-medium block">{mode.label}</span>
                  <span className="text-xs text-gray-500 line-clamp-2">{mode.description}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-[#4a1942] mt-2">
          {selected.length} delivery mode{selected.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </fieldset>
  );
}