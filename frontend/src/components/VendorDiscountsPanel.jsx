import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vendorCan } from '../lib/plans';
import {
  DISCOUNT_APPLIES_TO,
  DISCOUNT_AUDIENCES,
  deleteVendorDiscount,
  fetchVendorDiscounts,
  formatDiscountLabel,
  saveVendorDiscount,
} from '../lib/vendorDiscounts';

const EMPTY = {
  name: '',
  code: '',
  discount_type: 'percent',
  discount_value: '10',
  applies_to: 'all',
  target_audience: 'pro_member',
  min_order: '0',
  max_uses: '',
  active: true,
};

export default function VendorDiscountsPanel({ user, vendorId }) {
  const [discounts, setDiscounts] = useState([]);
  const [draft, setDraft] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const canManage = vendorCan(user, 'member_discounts');

  useEffect(() => {
    if (!vendorId) return;
    fetchVendorDiscounts(vendorId)
      .then(setDiscounts)
      .catch(() => setDiscounts([]))
      .finally(() => setLoading(false));
  }, [vendorId]);

  if (!canManage) {
    return (
      <div className="mb-8 p-6 border border-[#c9a227]/30 rounded-3xl bg-gradient-to-br from-[#f5f0e8] to-white">
        <h3 className="font-bold text-lg text-[#4a1942]">Member discounts</h3>
        <p className="text-sm text-gray-600 mt-2">
          Pro Practitioners can run automatic discounts for Pro Members and free seekers — maximize revenue and loyalty.
        </p>
        <Link to="/pro-upgrade?type=vendor" className="inline-block mt-4 px-5 py-2 bg-[#4a1942] text-white rounded-2xl text-sm font-medium">
          Upgrade to Pro →
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    if (!draft.name || !draft.discount_value) return;
    setSaving(true);
    try {
      const payload = {
        ...draft,
        vendor_id: vendorId,
        discount_value: Number(draft.discount_value),
        min_order: Number(draft.min_order) || 0,
        max_uses: draft.max_uses ? Number(draft.max_uses) : null,
        code: draft.code?.trim() || null,
        id: editingId,
      };
      await saveVendorDiscount(payload);
      setDiscounts(await fetchVendorDiscounts(vendorId));
      setDraft({ ...EMPTY });
      setEditingId(null);
    } catch (e) {
      alert(e.message || 'Could not save discount. Run HAZELALLURE_APOTHECARY_PLATFORM.sql in Supabase.');
    }
    setSaving(false);
  };

  const startEdit = (d) => {
    setEditingId(d.id);
    setDraft({
      name: d.name,
      code: d.code || '',
      discount_type: d.discount_type,
      discount_value: String(d.discount_value),
      applies_to: d.applies_to,
      target_audience: d.target_audience,
      min_order: String(d.min_order || 0),
      max_uses: d.max_uses != null ? String(d.max_uses) : '',
      active: d.active,
    });
  };

  return (
    <div id="discounts" className="mb-8 p-6 border border-[#c9a227]/30 rounded-3xl bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-xl text-[#4a1942]">Member discounts</h3>
          <p className="text-sm text-gray-600 mt-1">
            Reward Pro Members, incentivize upgrades, and boost bookings — discounts apply automatically at checkout.
          </p>
        </div>
        <span className="text-[10px] tracking-widest font-mono text-[#c9a227] border border-[#c9a227]/40 px-3 py-1 rounded-full">
          PRO REVENUE
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <input
          placeholder="Discount name (e.g. Pro Member Blessing)"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className="border p-3 rounded-2xl text-sm"
        />
        <input
          placeholder="Promo code (optional)"
          value={draft.code}
          onChange={(e) => setDraft({ ...draft, code: e.target.value })}
          className="border p-3 rounded-2xl text-sm"
        />
        <select
          value={draft.discount_type}
          onChange={(e) => setDraft({ ...draft, discount_type: e.target.value })}
          className="border p-3 rounded-2xl text-sm"
        >
          <option value="percent">Percent off</option>
          <option value="fixed">Fixed $ off</option>
        </select>
        <input
          type="number"
          placeholder="Value"
          value={draft.discount_value}
          onChange={(e) => setDraft({ ...draft, discount_value: e.target.value })}
          className="border p-3 rounded-2xl text-sm"
        />
        <select
          value={draft.applies_to}
          onChange={(e) => setDraft({ ...draft, applies_to: e.target.value })}
          className="border p-3 rounded-2xl text-sm"
        >
          {DISCOUNT_APPLIES_TO.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
        <select
          value={draft.target_audience}
          onChange={(e) => setDraft({ ...draft, target_audience: e.target.value })}
          className="border p-3 rounded-2xl text-sm"
        >
          {DISCOUNT_AUDIENCES.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-[#4a1942] text-white rounded-2xl text-sm font-medium disabled:opacity-50"
        >
          {editingId ? 'Update discount' : 'Add discount'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => { setEditingId(null); setDraft({ ...EMPTY }); }}
            className="px-5 py-2 border rounded-2xl text-sm"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        {!loading && discounts.length === 0 && (
          <p className="text-sm text-gray-500">No discounts yet. Try &ldquo;10% off for Pro Members&rdquo; on services.</p>
        )}
        {discounts.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 p-3 border rounded-2xl text-sm">
            <div>
              <span className="font-medium">{formatDiscountLabel(d)}</span>
              {d.code && <span className="ml-2 text-xs text-gray-500">code: {d.code}</span>}
              {!d.active && <span className="ml-2 text-xs text-red-600">inactive</span>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => startEdit(d)} className="text-[#4a1942] text-xs">Edit</button>
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm('Delete this discount?')) return;
                  await deleteVendorDiscount(d.id);
                  setDiscounts(await fetchVendorDiscounts(vendorId));
                }}
                className="text-red-600 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}