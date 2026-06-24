import { LEARNING_STYLES } from '../lib/teachingStudio';

/**
 * VARK+ learning style chips for inclusive course design.
 * @param {{ value: string[], onChange: (ids: string[]) => void, disabled?: boolean, label?: string }} props
 */
export default function LearningStyleChips({
  value = [],
  onChange,
  disabled = false,
  label = 'Learning styles you serve (VARK+)',
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
        Tag the modalities your course supports so seekers know it fits their learning path.
      </p>
      <div className="flex flex-wrap gap-2">
        {LEARNING_STYLES.map((style) => {
          const active = selected.includes(style.id);
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => toggle(style.id)}
              aria-pressed={active}
              title={style.description}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border transition ${
                active
                  ? 'bg-[#4a1942] text-white border-[#4a1942]'
                  : 'hover:bg-gray-50 hover:border-[#c9a227]/40'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span aria-hidden="true">{style.icon}</span>
              <span>{style.label}</span>
              {style.vark && style.vark !== '+' && (
                <span className={`text-[10px] font-mono ${active ? 'text-white/70' : 'text-gray-400'}`}>
                  {style.vark}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-2">
          Tip: selecting at least two styles helps more seekers feel included.
        </p>
      )}
    </fieldset>
  );
}