import { useState, useEffect } from 'react';
import {
  adminGrantPro,
  fetchAllSubscriptions,
  getProPricing,
  stripeDashboardUrl,
} from '../lib/proBillingApi';
import { updatePlatformSettings } from '../lib/platformSettingsApi';

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-800',
  trialing: 'bg-blue-100 text-blue-800',
  past_due: 'bg-amber-100 text-amber-800',
  canceled: 'bg-gray-100 text-gray-600',
  inactive: 'bg-gray-100 text-gray-600',
};

export default function AdminProPayments({ users, vendors, onMessage }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [rows, p] = await Promise.all([fetchAllSubscriptions(), getProPricing()]);
      setSubs(rows);
      setPricing(p);
      setDraft({
        stripe_vendor_pro_price_id: p.vendorPriceId || '',
        stripe_customer_pro_price_id: p.customerPriceId || '',
        stripe_vendor_pro_monthly_display: p.vendorMonthly,
        stripe_customer_pro_monthly_display: p.customerMonthly,
        stripe_vendor_pro_annual_price_id: p.vendorAnnualPriceId,
        stripe_customer_pro_annual_price_id: p.customerAnnualPriceId,
        stripe_vendor_pro_annual_display: p.vendorAnnual,
        stripe_customer_pro_annual_display: p.customerAnnual,
        pro_billing_enabled: p.billingEnabled ? 'true' : 'false',
        stripe_mode: p.stripeMode,
        stripe_live_mode_enabled: p.liveModeEnabled ? 'true' : 'false',
      });
    } catch (e) {
      onMessage?.(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const proVendors = vendors.filter((v) => (v.plan || 'free') === 'paid').length;
  const proCustomers = users.filter((u) => (u.customer_plan || 'free') === 'paid').length;
  const activeSubs = subs.filter((s) => ['active', 'trialing'].includes(s.status)).length;

  const grantManual = async (planType, id) => {
    try {
      if (planType === 'vendor') {
        await adminGrantPro({ planType: 'vendor', vendorId: id, active: true });
      } else {
        await adminGrantPro({ planType: 'customer', userId: id, active: true });
      }
      onMessage?.(`Pro ${planType} access granted.`);
      load();
    } catch (e) {
      onMessage?.(e.message);
    }
  };

  const revokeManual = async (planType, id) => {
    try {
      if (planType === 'vendor') {
        await adminGrantPro({ planType: 'vendor', vendorId: id, active: false });
      } else {
        await adminGrantPro({ planType: 'customer', userId: id, active: false });
      }
      onMessage?.(`Pro ${planType} access revoked.`);
      load();
    } catch (e) {
      onMessage?.(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-3xl p-4">
          <div className="text-sm text-gray-500">Pro Practitioners</div>
          <div className="text-2xl font-semibold text-emerald-600">{proVendors}</div>
        </div>
        <div className="bg-white border rounded-3xl p-4">
          <div className="text-sm text-gray-500">Pro Members</div>
          <div className="text-2xl font-semibold text-emerald-600">{proCustomers}</div>
        </div>
        <div className="bg-white border rounded-3xl p-4">
          <div className="text-sm text-gray-500">Stripe subscriptions</div>
          <div className="text-2xl font-semibold">{activeSubs}</div>
        </div>
        <a
          href={stripeDashboardUrl(draft?.stripe_mode === 'live')}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border rounded-3xl p-4 hover:border-[#4a1942] transition flex flex-col justify-center"
        >
          <div className="text-sm text-gray-500">Stripe Dashboard</div>
          <div className="text-sm font-medium text-[#4a1942] mt-1">Open payments →</div>
        </a>
      </div>

      {draft && (
        <div className="bg-white border rounded-3xl p-6">
          <h3 className="font-semibold mb-2">Stripe configuration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create products &amp; recurring prices in Stripe, then paste Price IDs here. Set secrets via{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">supabase secrets set STRIPE_SECRET_KEY</code> and deploy edge functions.
          </p>
          <div className="space-y-3 text-sm max-w-xl">
            <div>
              <label className="text-xs text-gray-600">Vendor Pro Price ID (price_…)</label>
              <input
                className="w-full border p-2 rounded-xl mt-1 font-mono text-xs"
                value={draft.stripe_vendor_pro_price_id}
                onChange={(e) => setDraft({ ...draft, stripe_vendor_pro_price_id: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Customer Pro Price ID (price_…)</label>
              <input
                className="w-full border p-2 rounded-xl mt-1 font-mono text-xs"
                value={draft.stripe_customer_pro_price_id}
                onChange={(e) => setDraft({ ...draft, stripe_customer_pro_price_id: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Vendor display price ($/mo)</label>
                <input
                  className="w-full border p-2 rounded-xl mt-1"
                  value={draft.stripe_vendor_pro_monthly_display}
                  onChange={(e) => setDraft({ ...draft, stripe_vendor_pro_monthly_display: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Customer display price ($/mo)</label>
                <input
                  className="w-full border p-2 rounded-xl mt-1"
                  value={draft.stripe_customer_pro_monthly_display}
                  onChange={(e) => setDraft({ ...draft, stripe_customer_pro_monthly_display: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600">Vendor Pro Annual Price ID</label>
              <input
                className="w-full border p-2 rounded-xl mt-1 font-mono text-xs"
                value={draft.stripe_vendor_pro_annual_price_id || ''}
                onChange={(e) => setDraft({ ...draft, stripe_vendor_pro_annual_price_id: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Customer Pro Annual Price ID</label>
              <input
                className="w-full border p-2 rounded-xl mt-1 font-mono text-xs"
                value={draft.stripe_customer_pro_annual_price_id || ''}
                onChange={(e) => setDraft({ ...draft, stripe_customer_pro_annual_price_id: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Vendor annual display ($/yr)</label>
                <input
                  className="w-full border p-2 rounded-xl mt-1"
                  value={draft.stripe_vendor_pro_annual_display || ''}
                  onChange={(e) => setDraft({ ...draft, stripe_vendor_pro_annual_display: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Customer annual display ($/yr)</label>
                <input
                  className="w-full border p-2 rounded-xl mt-1"
                  value={draft.stripe_customer_pro_annual_display || ''}
                  onChange={(e) => setDraft({ ...draft, stripe_customer_pro_annual_display: e.target.value })}
                />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.stripe_live_mode_enabled === 'true'}
                onChange={(e) => setDraft({ ...draft, stripe_live_mode_enabled: e.target.checked ? 'true' : 'false', stripe_mode: e.target.checked ? 'live' : 'test' })}
              />
              Live payments enabled (use sk_live_ + live webhook in Supabase secrets)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.pro_billing_enabled === 'true'}
                onChange={(e) => setDraft({ ...draft, pro_billing_enabled: e.target.checked ? 'true' : 'false' })}
              />
              Pro billing enabled
            </label>
            <select
              className="border p-2 rounded-xl"
              value={draft.stripe_mode}
              onChange={(e) => setDraft({ ...draft, stripe_mode: e.target.value })}
            >
              <option value="test">Test mode</option>
              <option value="live">Live mode</option>
            </select>
            <button
              type="button"
              disabled={syncing}
              onClick={async () => {
                setSyncing(true);
                setSyncResult(null);
                try {
                  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-sync-prices`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({ auto_sync: true, bootstrap: true }),
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.error || 'Sync failed');
                  setSyncResult(json);
                  onMessage?.('Stripe price IDs synced from your Stripe account.');
                  load();
                } catch (e) {
                  onMessage?.(e.message);
                }
                setSyncing(false);
              }}
              className="px-4 py-2 border rounded-2xl text-sm mr-2 disabled:opacity-50"
            >
              {syncing ? 'Syncing…' : 'Sync price IDs from Stripe'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await updatePlatformSettings(draft);
                  onMessage?.('Stripe settings saved.');
                  load();
                } catch (e) {
                  onMessage?.(e.message);
                }
                setSaving(false);
              }}
              className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Stripe settings'}
            </button>
          </div>
          {syncResult?.catalog?.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-2xl text-xs overflow-x-auto">
              <div className="font-semibold mb-2">Stripe catalog (matched by product name)</div>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-1 pr-2">Product</th>
                    <th className="py-1 pr-2">Interval</th>
                    <th className="py-1 pr-2">Price ID</th>
                    <th className="py-1">Slot</th>
                  </tr>
                </thead>
                <tbody>
                  {syncResult.catalog.map((row) => (
                    <tr key={row.price_id} className="border-t">
                      <td className="py-1 pr-2">{row.product_name}</td>
                      <td className="py-1 pr-2">{row.interval}</td>
                      <td className="py-1 pr-2 font-mono">{row.price_id}</td>
                      <td className="py-1">{row.slot || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 p-3 bg-blue-50 rounded-2xl text-xs text-blue-900">
            <strong>Webhook URL:</strong>{' '}
            <code>{import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-webhook</code>
            <br />
            Subscribe to: checkout.session.completed, customer.subscription.*, invoice.paid, invoice.payment_failed
          </div>
        </div>
      )}

      <div className="bg-white border rounded-3xl p-6">
        <h3 className="font-semibold mb-4">Subscription payments</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : subs.length === 0 ? (
          <p className="text-sm text-gray-500">
            No subscription records yet. Run STRIPE_PRO_SUBSCRIPTIONS.sql and complete a test checkout.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b text-xs text-gray-500">
                  <th className="py-2">Account</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Period end</th>
                  <th>Last payment</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="py-2">
                      {s.plan_type === 'vendor'
                        ? s.vendors?.name || `Vendor #${s.vendor_id}`
                        : s.users?.name || s.users?.email || `User #${s.user_id}`}
                    </td>
                    <td className="capitalize">{s.plan_type} Pro</td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] || STATUS_COLORS.inactive}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>{s.amount_cents ? `$${(s.amount_cents / 100).toFixed(2)}` : '—'}</td>
                    <td className="text-xs">{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}</td>
                    <td className="text-xs">
                      {s.last_payment_at ? new Date(s.last_payment_at).toLocaleDateString() : '—'}
                      {s.last_payment_status && ` (${s.last_payment_status})`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-3xl p-6">
        <h3 className="font-semibold mb-4">Manual Pro access</h3>
        <p className="text-sm text-gray-600 mb-4">Grant or revoke Pro without Stripe (comps, support overrides).</p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium mb-2">Vendors</div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {vendors.slice(0, 20).map((v) => (
                <div key={v.id} className="flex justify-between items-center py-1 border-b">
                  <span>{v.name} <span className="text-xs text-gray-400">({v.plan || 'free'})</span></span>
                  {(v.plan || 'free') === 'paid' ? (
                    <button type="button" onClick={() => revokeManual('vendor', v.id)} className="text-xs text-red-600">Revoke</button>
                  ) : (
                    <button type="button" onClick={() => grantManual('vendor', v.id)} className="text-xs text-[#4a1942]">Grant Pro</button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-medium mb-2">Customers</div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {users.filter((u) => u.role === 'customer').slice(0, 20).map((u) => (
                <div key={u.id} className="flex justify-between items-center py-1 border-b">
                  <span>{u.name || u.email} <span className="text-xs text-gray-400">({u.customer_plan || 'free'})</span></span>
                  {(u.customer_plan || 'free') === 'paid' ? (
                    <button type="button" onClick={() => revokeManual('customer', u.id)} className="text-xs text-red-600">Revoke</button>
                  ) : (
                    <button type="button" onClick={() => grantManual('customer', u.id)} className="text-xs text-[#4a1942]">Grant Pro</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}