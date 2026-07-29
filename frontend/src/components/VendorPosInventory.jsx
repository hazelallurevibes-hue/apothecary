import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { isProPlan } from '../lib/plans';

/**
 * Lightweight POS / inventory board for apothecary sellers.
 * Tracks stock counts, low-stock alerts, and quick adjust.
 */
export default function VendorPosInventory({ vendorId, plan = 'free', className = '' }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all | low | out
  const isPro = isProPlan(plan);

  const load = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    const vid = Number(vendorId);
    const [{ data: produce }, { data: menu }] = await Promise.all([
      supabase
        .from('produce_items')
        .select('id, name, price, quantity_available, unit, category, photo, subscribe_enabled, subscribe_interval_days, subscribe_discount_pct')
        .eq('vendor_id', vid)
        .order('name'),
      supabase
        .from('menu_items')
        .select('id, name, price, availability, category, photo')
        .eq('vendor_id', vid)
        .order('name'),
    ]);

    const mapped = [
      ...(produce || []).map((p) => ({
        key: `p-${p.id}`,
        id: p.id,
        kind: 'produce',
        name: p.name,
        price: Number(p.price) || 0,
        qty: p.quantity_available != null ? Number(p.quantity_available) : 0,
        unit: p.unit || 'each',
        category: p.category || '',
        photo: p.photo,
        subscribe_enabled: !!p.subscribe_enabled,
        subscribe_interval_days: p.subscribe_interval_days || 30,
        subscribe_discount_pct: p.subscribe_discount_pct != null ? Number(p.subscribe_discount_pct) : 10,
      })),
      ...(menu || []).map((m) => {
        const avail = String(m.availability || '').toLowerCase();
        let qty = 0;
        if (avail.includes('out') || avail.includes('sold')) qty = 0;
        else if (/\d+/.test(avail)) qty = Number(avail.match(/\d+/)[0]);
        else qty = avail.includes('stock') || avail === '' ? 12 : 5;
        return {
          key: `m-${m.id}`,
          id: m.id,
          kind: 'menu',
          name: m.name,
          price: Number(m.price) || 0,
          qty,
          unit: 'service',
          category: m.category || 'service',
          photo: m.photo,
          availabilityRaw: m.availability,
          subscribe_enabled: false,
        };
      }),
    ];
    setRows(mapped);
    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
    load();
  }, [load]);

  const lowCount = useMemo(() => rows.filter((r) => r.qty > 0 && r.qty <= 5).length, [rows]);
  const outCount = useMemo(() => rows.filter((r) => r.qty <= 0).length, [rows]);

  const visible = useMemo(() => {
    if (filter === 'low') return rows.filter((r) => r.qty > 0 && r.qty <= 5);
    if (filter === 'out') return rows.filter((r) => r.qty <= 0);
    return rows;
  }, [rows, filter]);

  const saveQty = async (row, nextQty) => {
    const qty = Math.max(0, Math.floor(Number(nextQty) || 0));
    setSavingId(row.key);
    setMessage('');
    try {
      if (row.kind === 'produce') {
        const { error } = await supabase
          .from('produce_items')
          .update({ quantity_available: qty })
          .eq('id', row.id);
        if (error) throw error;
      } else {
        const availability = qty <= 0 ? 'Out of stock' : qty <= 5 ? `Low stock (${qty})` : 'In stock';
        const { error } = await supabase
          .from('menu_items')
          .update({ availability })
          .eq('id', row.id);
        if (error) throw error;
      }
      setRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, qty } : r)));
      setMessage(`Updated ${row.name}`);
    } catch (e) {
      setMessage(e.message || 'Could not update stock');
    }
    setSavingId(null);
  };

  const saveSubscribe = async (row, patch) => {
    if (row.kind !== 'produce') return;
    if (!isPro) {
      setMessage('Product subscriptions are a Pro Practitioner tool — upgrade to enable Subscribe & Save on SKUs.');
      return;
    }
    setSavingId(row.key);
    const next = { ...row, ...patch };
    try {
      const { error } = await supabase
        .from('produce_items')
        .update({
          subscribe_enabled: !!next.subscribe_enabled,
          subscribe_interval_days: Number(next.subscribe_interval_days) || 30,
          subscribe_discount_pct: Math.min(40, Math.max(0, Number(next.subscribe_discount_pct) || 0)),
        })
        .eq('id', row.id);
      if (error) {
        if (/subscribe_/i.test(error.message)) {
          setMessage('Run POS & subscriptions SQL migration to enable Subscribe & Save columns.');
        } else throw error;
      } else {
        setRows((prev) => prev.map((r) => (r.key === row.key ? next : r)));
        setMessage(`Subscription settings saved for ${row.name}`);
      }
    } catch (e) {
      setMessage(e.message || 'Could not save subscription settings');
    }
    setSavingId(null);
  };

  if (!vendorId) return null;

  return (
    <div className={`rounded-3xl border border-[#4a1942]/12 bg-white p-4 sm:p-6 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">POS · Inventory</p>
          <h2 className="text-lg font-semibold text-[#4a1942] heading-font">Stock & subscriptions</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Track counts like a simple POS. Low stock (≤5) and out-of-stock lists help you restock before you lose sales.
            {isPro
              ? ' Pro: enable Subscribe & Save on products so shoppers pay on a recurring cycle.'
              : ' Upgrade to Pro to offer product Subscribe & Save (recurring revenue most website builders skip).'}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4a1942]/20 text-[#4a1942]"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        {[
          { id: 'all', label: `All (${rows.length})` },
          { id: 'low', label: `Low (${lowCount})` },
          { id: 'out', label: `Out (${outCount})` },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full border ${
              filter === f.id
                ? 'bg-[#4a1942] text-white border-[#4a1942]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {message && (
        <p className="text-xs mb-3 px-3 py-2 rounded-xl bg-[#faf7f9] border border-[#4a1942]/10 text-[#4a1942]">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading inventory…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-gray-500">No items in this filter. Add products from the dashboard first.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b">
                <th className="py-2 pr-2">Item</th>
                <th className="py-2 pr-2">Qty</th>
                <th className="py-2 pr-2">Adjust</th>
                <th className="py-2">Subscribe &amp; Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((row) => (
                <tr key={row.key} className={row.qty <= 0 ? 'bg-rose-50/40' : row.qty <= 5 ? 'bg-amber-50/40' : ''}>
                  <td className="py-2.5 pr-2">
                    <div className="font-medium text-gray-800">{row.name}</div>
                    <div className="text-[10px] text-gray-400">
                      {row.kind === 'produce' ? 'Product' : 'Service'} · ${row.price.toFixed(2)}
                      {row.unit ? ` / ${row.unit}` : ''}
                    </div>
                  </td>
                  <td className="py-2.5 pr-2 font-semibold tabular-nums">
                    {row.qty}
                    {row.qty <= 0 && <span className="ml-1 text-[10px] text-rose-600">OUT</span>}
                    {row.qty > 0 && row.qty <= 5 && <span className="ml-1 text-[10px] text-amber-700">LOW</span>}
                  </td>
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={savingId === row.key}
                        onClick={() => saveQty(row, row.qty - 1)}
                        className="w-7 h-7 rounded-lg border text-sm font-bold"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        className="w-14 border rounded-lg px-1 py-1 text-center text-xs"
                        value={row.qty}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.key === row.key ? { ...r, qty: Math.max(0, Number(e.target.value) || 0) } : r,
                            ),
                          )
                        }
                        onBlur={(e) => saveQty(row, e.target.value)}
                      />
                      <button
                        type="button"
                        disabled={savingId === row.key}
                        onClick={() => saveQty(row, row.qty + 1)}
                        className="w-7 h-7 rounded-lg border text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5">
                    {row.kind !== 'produce' ? (
                      <span className="text-[10px] text-gray-400">N/A for services</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="flex items-center gap-1 text-[11px]">
                          <input
                            type="checkbox"
                            checked={!!row.subscribe_enabled}
                            disabled={!isPro || savingId === row.key}
                            onChange={(e) => saveSubscribe(row, { subscribe_enabled: e.target.checked })}
                          />
                          Offer
                        </label>
                        <select
                          className="text-[11px] border rounded-lg px-1 py-0.5"
                          value={row.subscribe_interval_days || 30}
                          disabled={!isPro || !row.subscribe_enabled}
                          onChange={(e) =>
                            saveSubscribe(row, { subscribe_interval_days: Number(e.target.value) })
                          }
                        >
                          <option value={14}>Every 2 weeks</option>
                          <option value={30}>Monthly</option>
                          <option value={60}>Every 2 months</option>
                          <option value={90}>Quarterly</option>
                        </select>
                        <label className="text-[11px] flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={40}
                            className="w-12 border rounded-lg px-1 py-0.5"
                            value={row.subscribe_discount_pct ?? 10}
                            disabled={!isPro || !row.subscribe_enabled}
                            onBlur={(e) =>
                              saveSubscribe(row, { subscribe_discount_pct: Number(e.target.value) })
                            }
                            onChange={(e) =>
                              setRows((prev) =>
                                prev.map((r) =>
                                  r.key === row.key
                                    ? { ...r, subscribe_discount_pct: Number(e.target.value) }
                                    : r,
                                ),
                              )
                            }
                          />
                          % off
                        </label>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
