import { useEffect, useState } from 'react';
import { estimateVendorShareCents, loadRevshareSettings, saveRevshareSettings } from '../lib/proRevshareApi';

/**
 * Admin: toggle Pro revenue-share program + formula knobs (default OFF).
 */
export default function AdminRevsharePanel() {
  const [form, setForm] = useState({
    enabled: false,
    opsCostCents: 0,
    multiplier: 0.002,
    minDiscountPct: 5,
    featuredAdPriceCents: 4900,
    featuredAdDays: 7,
  });
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevshareSettings()
      .then((s) => {
        setForm({
          enabled: s.enabled,
          opsCostCents: s.opsCostCents,
          multiplier: s.multiplier,
          minDiscountPct: s.minDiscountPct,
          featuredAdPriceCents: s.featuredAdPriceCents,
          featuredAdDays: s.featuredAdDays,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Sample preview: $10k MRR, 200 pro users, 40 vendors, 10% vendor discount
    setPreview(
      estimateVendorShareCents({
        monthlyProRevenueCents: 1000000,
        proUserCount: 200,
        enrolledVendorCount: 40,
        opsCostCents: form.opsCostCents,
        multiplier: form.multiplier,
        vendorDiscountPct: 10,
        minDiscountPct: form.minDiscountPct,
      }),
    );
  }, [form]);

  const save = async () => {
    setMsg('');
    try {
      await saveRevshareSettings(form);
      setMsg('Saved. Program is ' + (form.enabled ? 'ON' : 'OFF (default safe).'));
    } catch (e) {
      setMsg(e.message || 'Save failed');
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading rev-share settings…</p>;

  return (
    <div className="rounded-3xl border border-[#4a1942]/15 bg-white p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg text-[#4a1942]">Pro revenue share</h3>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Vendors who discount Pro Members can earn a slice of Pro subscription revenue after ops cost.
            Formula uses your knobs below. <strong>Default is OFF</strong> until you enable.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          />
          Program {form.enabled ? 'ON' : 'OFF'}
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <label className="block">
          Ops cost (cents/month)
          <input
            type="number"
            className="mt-1 w-full border rounded-xl px-3 py-2"
            value={form.opsCostCents}
            onChange={(e) => setForm({ ...form, opsCostCents: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="block">
          Multiplier (e.g. 0.002)
          <input
            type="number"
            step="0.0001"
            className="mt-1 w-full border rounded-xl px-3 py-2"
            value={form.multiplier}
            onChange={(e) => setForm({ ...form, multiplier: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="block">
          Min Pro discount % to enroll
          <input
            type="number"
            className="mt-1 w-full border rounded-xl px-3 py-2"
            value={form.minDiscountPct}
            onChange={(e) => setForm({ ...form, minDiscountPct: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="block">
          Featured ad price (cents)
          <input
            type="number"
            className="mt-1 w-full border rounded-xl px-3 py-2"
            value={form.featuredAdPriceCents}
            onChange={(e) => setForm({ ...form, featuredAdPriceCents: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="block">
          Featured ad days
          <input
            type="number"
            className="mt-1 w-full border rounded-xl px-3 py-2"
            value={form.featuredAdDays}
            onChange={(e) => setForm({ ...form, featuredAdDays: Number(e.target.value) || 7 })}
          />
        </label>
      </div>

      <div className="text-xs bg-[#faf7f9] rounded-2xl p-3 border border-[#4a1942]/10">
        <p className="font-semibold text-[#4a1942]">Sample estimate (not live payout)</p>
        <p className="text-gray-600 mt-1">
          $10,000 Pro MRR · 40 enrolled vendors · 10% vendor discount → about{' '}
          <strong>${((preview?.shareCents || 0) / 100).toFixed(2)}</strong> / vendor / month with current knobs.
        </p>
        <p className="text-gray-500 mt-1">
          share ≈ (revenue − ops) / vendors × multiplier × discount weight
        </p>
      </div>

      <button
        type="button"
        onClick={save}
        className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm font-semibold"
      >
        Save settings
      </button>
      {msg && <p className="text-sm text-gray-700">{msg}</p>}
    </div>
  );
}
