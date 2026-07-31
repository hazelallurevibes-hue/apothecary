import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchVendorProDiscount, saveVendorProDiscount } from '../lib/proRevshareApi';

/**
 * Vendor interest signup: Pro Member checkout discount + rewards program waitlist.
 * Do not expose admin on/off controls to vendors.
 */
export default function VendorProDiscountRevshare({ vendorId }) {
  const [discountPct, setDiscountPct] = useState(10);
  const [interested, setInterested] = useState(false);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    fetchVendorProDiscount(vendorId).then((v) => {
      setDiscountPct(v.discountPct > 0 ? v.discountPct : 10);
      setInterested(v.enrolled);
    });
  }, [vendorId]);

  const save = async () => {
    if (!vendorId) return;
    setSaving(true);
    setMsg('');
    try {
      const pct = Math.min(50, Math.max(0, Number(discountPct) || 0));
      const res = await saveVendorProDiscount(vendorId, {
        discountPct: pct,
        enrolled: interested && pct > 0,
      });
      setInterested(res.enrolled);
      setMsg(
        res.enrolled
          ? `You're signed up: Pro Members get ${res.discountPct}% off at your checkout. We'll include you when Pro rewards share opens.`
          : `Saved ${res.discountPct}% Pro Member discount only (not signed up for rewards share).`,
      );
    } catch (e) {
      setMsg(e.message || 'Save failed — run latest SQL migration for pro_member_discount_pct.');
    }
    setSaving(false);
  };

  if (!vendorId) return null;

  return (
    <div className="mb-8 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-5 sm:p-6">
      <h3 className="font-bold text-lg text-[#4a1942]">Pro Member discounts &amp; rewards signup</h3>
      <p className="text-sm text-gray-600 mt-1 max-w-2xl">
        Offer Pro Members an automatic checkout discount to win loyal shoppers. Optionally{' '}
        <strong>sign up for Pro rewards share</strong> — practitioners who support Pro Members may earn a portion of
        Pro subscription revenue when the program rolls out. Signing up shows interest; you can update your discount anytime.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="text-sm">
          Pro Member discount %
          <input
            type="number"
            min={0}
            max={50}
            className="mt-1 block w-28 border rounded-xl px-3 py-2"
            value={discountPct}
            onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm pb-2 max-w-xs">
          <input
            type="checkbox"
            checked={interested}
            onChange={(e) => setInterested(e.target.checked)}
          />
          Sign me up for Pro rewards share (interest list)
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save &amp; sign up'}
        </button>
      </div>
      <p className="text-[11px] text-gray-500 mt-3">
        Pro Member checkout pricing is separate from your Pro Practitioner tools —{' '}
        <Link to="/pro-upgrade?type=vendor" className="underline">
          compare Free vs Pro
        </Link>
        .
      </p>
      {msg && <p className="text-sm text-emerald-900 mt-2">{msg}</p>}
    </div>
  );
}
