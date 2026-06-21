import { ALLERGENS } from '../lib/allergens';

export default function AllergenPicker({ selected = [], onChange, disabled }) {
  const set = new Set(selected);

  const toggle = (id) => {
    if (disabled) return;
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  return (
    <div>
      <div className="text-sm font-medium mb-2">Allergens in your home kitchen</div>
      <p className="text-xs text-gray-500 mb-3">
        Check every allergen that is cooked with, stored, or present in your home when you prepare this item.
        Symbols appear on your public listing.
      </p>
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 gap-2">
        {ALLERGENS.map((a) => {
          const on = set.has(a.id);
          return (
            <button
              key={a.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(a.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-left text-sm transition ${
                on ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-lg" aria-hidden>{a.symbol}</span>
              <span className="font-medium">{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}