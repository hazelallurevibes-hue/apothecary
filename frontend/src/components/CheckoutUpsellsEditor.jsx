import { createEmptyUpsell } from '../lib/itemOptions';

const CATEGORIES = [
  { id: 'drink', label: 'Drink' },
  { id: 'side', label: 'Side' },
  { id: 'dessert', label: 'Dessert' },
  { id: 'other', label: 'Other' },
];

export default function CheckoutUpsellsEditor({ value = [], onChange, disabled }) {
  const upsells = value.length ? value : [];

  const update = (next) => onChange?.(next);

  const add = () => update([...upsells, createEmptyUpsell()]);

  const patch = (idx, field, val) => {
    const next = [...upsells];
    next[idx] = { ...next[idx], [field]: val };
    update(next);
  };

  const remove = (idx) => update(upsells.filter((_, i) => i !== idx));

  return (
    <div className="border rounded-2xl p-4 bg-amber-50/50 space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="text-sm font-semibold">Checkout upsells (paid)</h4>
          <p className="text-[11px] text-gray-500">
            Drinks and sides customers can add at checkout — e.g. lemonade, fries.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={add}
          className="text-xs px-3 py-1.5 border rounded-xl bg-white shrink-0 disabled:opacity-50"
        >
          + Add upsell
        </button>
      </div>

      {upsells.length === 0 && (
        <p className="text-xs text-gray-400">No upsells — checkout shows cart only.</p>
      )}

      {upsells.map((u, idx) => (
        <div key={u.id || idx} className="bg-white border rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <input
            placeholder="Name (e.g. Fresh Lemonade)"
            value={u.name}
            disabled={disabled}
            onChange={(e) => patch(idx, 'name', e.target.value)}
            className="border p-2 rounded-lg sm:col-span-2"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Price"
            value={u.price}
            disabled={disabled}
            onChange={(e) => patch(idx, 'price', e.target.value)}
            className="border p-2 rounded-lg"
          />
          <select
            value={u.category || 'side'}
            disabled={disabled}
            onChange={(e) => patch(idx, 'category', e.target.value)}
            className="border p-2 rounded-lg"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <input
            placeholder="Short description (optional)"
            value={u.description || ''}
            disabled={disabled}
            onChange={(e) => patch(idx, 'description', e.target.value)}
            className="border p-2 rounded-lg sm:col-span-2 text-xs"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => remove(idx)}
            className="text-xs text-red-600 sm:col-span-2 text-left"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}