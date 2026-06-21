import { createEmptyOption, slugifyOptionId } from '../lib/itemOptions';

export default function ItemOptionsEditor({ value = [], onChange, disabled }) {
  const groups = value.length ? value : [];

  const update = (next) => onChange?.(next);

  const addGroup = () => update([...groups, createEmptyOption()]);

  const updateGroup = (idx, patch) => {
    const next = [...groups];
    next[idx] = { ...next[idx], ...patch };
    if (patch.label !== undefined && !next[idx].id?.startsWith('opt_')) {
      next[idx].id = slugifyOptionId(patch.label) || next[idx].id;
    }
    update(next);
  };

  const removeGroup = (idx) => update(groups.filter((_, i) => i !== idx));

  const updateChoice = (gIdx, cIdx, patch) => {
    const next = [...groups];
    const choices = [...(next[gIdx].choices || [])];
    choices[cIdx] = { ...choices[cIdx], ...patch };
    next[gIdx] = { ...next[gIdx], choices };
    update(next);
  };

  const addChoice = (gIdx) => {
    const next = [...groups];
    const choices = [...(next[gIdx].choices || [])];
    choices.push({ id: `choice_${Date.now()}`, label: '', price: 0 });
    next[gIdx] = { ...next[gIdx], choices };
    update(next);
  };

  const removeChoice = (gIdx, cIdx) => {
    const next = [...groups];
    const choices = (next[gIdx].choices || []).filter((_, i) => i !== cIdx);
    next[gIdx] = { ...next[gIdx], choices };
    update(next);
  };

  return (
    <div className="border rounded-2xl p-4 bg-gray-50/80 space-y-3 min-w-0 w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold">Customer options</h4>
          <p className="text-[11px] text-gray-500 break-words">Let buyers choose add-ons like salt, pepper, fork, or spoon.</p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={addGroup}
          className="text-xs px-3 py-1.5 border rounded-xl bg-white disabled:opacity-50 w-full sm:w-auto shrink-0 text-center"
        >
          + Add option group
        </button>
      </div>

      {groups.length === 0 && (
        <p className="text-xs text-gray-400">No options yet — customers add the item as-is.</p>
      )}

      {groups.map((group, gIdx) => (
        <div key={group.id || gIdx} className="bg-white border rounded-xl p-3 space-y-2 min-w-0 overflow-hidden">
          <input
            placeholder="Option name (e.g. Salt)"
            value={group.label}
            disabled={disabled}
            onChange={(e) => updateGroup(gIdx, { label: e.target.value })}
            className="w-full border p-2 rounded-lg text-sm min-w-0"
          />
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
            <label className="flex items-center gap-1 text-xs shrink-0">
              <input
                type="checkbox"
                checked={!!group.required}
                disabled={disabled}
                onChange={(e) => updateGroup(gIdx, { required: e.target.checked })}
              />
              Required
            </label>
            <label className="flex items-center gap-1 text-xs shrink-0">
              <input
                type="checkbox"
                checked={!!group.multi}
                disabled={disabled}
                onChange={(e) => updateGroup(gIdx, { multi: e.target.checked })}
              />
              Multi-select
            </label>
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeGroup(gIdx)}
              className="text-xs text-red-600 sm:ml-auto"
            >
              Remove
            </button>
          </div>

          <div className="space-y-1.5 pl-2 border-l-2 border-gray-100 min-w-0">
            {(group.choices || []).map((choice, cIdx) => (
              <div key={choice.id || cIdx} className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center text-sm min-w-0">
                <input
                  placeholder="Choice (e.g. Add salt)"
                  value={choice.label}
                  disabled={disabled}
                  onChange={(e) => updateChoice(gIdx, cIdx, { label: e.target.value })}
                  className="w-full min-[400px]:flex-1 border p-1.5 rounded-lg text-xs min-w-0"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="$0"
                    value={choice.price ?? 0}
                    disabled={disabled}
                    onChange={(e) => updateChoice(gIdx, cIdx, { price: e.target.value })}
                    className="w-20 border p-1.5 rounded-lg text-xs"
                    title="Extra price"
                  />
                  <button
                    type="button"
                    disabled={disabled || (group.choices?.length || 0) <= 1}
                    onClick={() => removeChoice(gIdx, cIdx)}
                    className="text-[10px] text-gray-400 disabled:opacity-30 px-2 py-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              disabled={disabled}
              onClick={() => addChoice(gIdx)}
              className="text-[10px] text-[#4a1942]"
            >
              + Add choice
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}