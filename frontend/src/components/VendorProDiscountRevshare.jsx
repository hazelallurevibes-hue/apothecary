import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchVendorProDiscount,
  loadRevshareSettings,
  saveVendorProDiscount,
} from '../lib/proRevshareApi';

/**
 * Vendor controls: % off for Pro Members + optional rev-share enrollment.
 */
export default function VendorProDiscountRevshare({ vendorId }) {
  const [discountPct, setDiscountPct] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const [settings, setSettings] = useState(null);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    Promise.all([fetchVendorProDiscount(vendorId), loadRevshareSettings()]).then(([v, s]) => {
      setDiscountPct(v.discountPct);
      setEnrolled(v.enrolled);
      setSettings(s);
    });
  }, [vendorId]);

  const save = async () => {
    if (!vendorId) return;
    setSaving(true);
    setMsg('');
    try {
      const min = settings?.minDiscountPct ?? 5;
      const wantEnroll = enrolled && discountPct >= min;
      const res = await saveVendorProDiscount(vendorId, {
        discountPct,
        enrolled: wantEnroll,
      });
      setEnrolled(res.enrolled);
      setMsg(
        res.enrolled
          ? `Saved ${res.discountPct}% Pro Member discount — enrolled in revenue share (when admin program is ON).`
          : `Saved ${res.discountPct}% Pro discount. Enroll requires ≥${min}% and admin program ON.`,
      );
    } catch (e) {
      setMsg(e.message || 'Save failed — run latest SQL migration for pro_member_discount_pct.');
    }
    setSaving(false);
  };

  if (!vendorId) return null;

  return (
    <div className="mb-8 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-5 sm:p-6">
      <h3 className="font-bold text-lg text-[#4a1942]">Pro Member discount &amp; revenue share</h3>
      <p className="text-sm text-gray-600 mt-1 max-w-2xl">
        Pro Members see your discount automatically at checkout. Give enough off to join the optional revenue-share
        program (admin controls the pool formula; <strong>program default is OFF</strong> until admin enables it).
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
        <label className="flex items-center gap-2 text-sm pb-2">
          <input
            type="checkbox"
            checked={enrolled}
            onChange={(e) => setEnrolled(e.target.checked)}
          />
          Enroll in rev-share (min {settings?.minDiscountPct ?? 5}% discount)
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Pro discount'}
        </button>
      </div>
      <p className="text-[11px] text-gray-500 mt-3">
        Admin program status: {settings?.enabled ? 'ON' : 'OFF'}. See{' '}
        <Link to="/pro-upgrade?type=vendor" className="underline">
          Free vs Pro
        </Link>{' '}
        for membership pricing.
      </p>
      {msg && <p className="text-sm text-emerald-900 mt-2">{msg}</p>}
    </div>
  );
}
