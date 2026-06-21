import { ALLERGENS, parseAllergenIds, serializeAllergenIds } from '../lib/allergens';

export default function CustomerAllergenProfile({ selected = [], onChange, compact }) {
  const set = new Set(selected);

  const toggle = (id) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  return (
    <div className={compact ? '' : 'border rounded-3xl p-6 bg-white'}>
      <div className="text-sm font-medium mb-1">My allergen profile</div>
      <p className="text-xs text-gray-500 mb-3">
        Items containing these allergens in the vendor&apos;s kitchen will be hidden automatically when you browse.
      </p>
      <div className={`grid gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {ALLERGENS.map((a) => {
          const on = set.has(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggle(a.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-left text-sm transition ${
                on ? 'border-red-400 bg-red-50 text-red-900' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span aria-hidden>{a.symbol}</span>
              <span className="font-medium">{a.label}</span>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-red-700 mt-3">
          Avoiding: {parseAllergenIds(serializeAllergenIds(selected)).map((id) => ALLERGENS.find((a) => a.id === id)?.label || id).join(', ')}
        </p>
      )}
    </div>
  );
}