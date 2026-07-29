import { Link } from 'react-router-dom';
import { createEmptyUpsell } from '../lib/itemOptions';

/** Hazel-appropriate checkout add-ons (not food/drinks). */
const CATEGORIES = [
  { id: 'blessing', label: 'Blessing / intention' },
  { id: 'spell', label: 'Spell / ritual add-on' },
  { id: 'reading', label: 'Mini reading add-on' },
  { id: 'charm', label: 'Charm / talisman' },
  { id: 'sample', label: 'Sample / sachet' },
  { id: 'other', label: 'Other' },
];

export default function CheckoutUpsellsEditor({ value = [], onChange, disabled, isPro = true }) {
  const upsells = value.length ? value : [];

  const update = (next) => onChange?.(next);
  const add = () => update([...upsells, { ...createEmptyUpsell(), category: 'blessing' }]);

  const patch = (idx, field, val) => {
    const next = [...upsells];
    next[idx] = { ...next[idx], [field]: val };
    update(next);
  };

  const remove = (idx) => update(upsells.filter((_, i) => i !== idx));

  if (!isPro) {
    return (
      <div className="border rounded-2xl p-4 bg-[#faf7f9] space-y-2">
        <h4 className="text-sm font-semibold text-[#4a1942]">Checkout blessings &amp; add-ons (Pro)</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          Pro practitioners can offer optional checkout add-ons — a blessing, intention setting, mini spell work, charm, or sample sachet — to deepen the seeker experience (not food or drinks).
        </p>
        <Link
          to="/pro-upgrade?type=vendor&from=checkout-upsells"
          className="inline-flex text-xs font-semibold text-white bg-[#4a1942] px-4 py-2 rounded-full hover:bg-[#3d1536]"
        >
          Upgrade to Pro Practitioner →
        </Link>
      </div>
    );
  }

  return (
    <div className="border rounded-2xl p-4 bg-[#faf7f9]/80 space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="text-sm font-semibold text-[#4a1942]">Checkout blessings &amp; add-ons</h4>
          <p className="text-[11px] text-gray-500">
            Optional extras at checkout — e.g. house blessing, protection charm, mini card pull, sample tea blend.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={add}
          className="text-xs px-3 py-1.5 border rounded-xl bg-white shrink-0 disabled:opacity-50"
        >
          + Add offer
        </button>
      </div>

      {upsells.length === 0 && (
        <p className="text-xs text-gray-400">No add-ons yet — checkout shows cart only.</p>
      )}

      {upsells.map((u, idx) => (
        <div key={u.id || idx} className="bg-white border rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <input
            placeholder="Name (e.g. Protection blessing)"
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
            value={u.category || 'blessing'}
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
