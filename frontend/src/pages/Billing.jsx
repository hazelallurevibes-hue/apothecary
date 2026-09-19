import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getVendorContext,
  isCustomerPro,
  isEnterprisePlan,
  isVendorPro,
  planBadgeLabel,
} from '../lib/plans';
import { fetchMySubscriptions, fetchStripeInvoices, openBillingPortal } from '../lib/proBillingApi';
import YourDataPanel from '../components/YourDataPanel';

function money(n, currency = 'usd') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(Number(n || 0));
  } catch {
    return `$${Number(n || 0).toFixed(2)}`;
  }
}

export default function Billing({ user }) {
  const vendorCtx = getVendorContext(user);
  const [subs, setSubs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user?.email) return;
    fetchMySubscriptions(user.email).then(setSubs).catch(() => setSubs([]));
    fetchStripeInvoices(user.email).then(setInvoices).catch(() => setInvoices([]));
  }, [user?.email]);

  const openPortal = async (planType) => {
    setBusy(true);
    setErr('');
    try {
      await openBillingPortal({ planType, email: user.email });
    } catch (e) {
      setErr(e.message || 'Could not open billing portal.');
    }
    setBusy(false);
  };

  const vendorPaid = isVendorPro(user);
  const seekerPaid = isCustomerPro(user);
  const atelier = isEnterprisePlan(vendorCtx?.plan);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-[#4a1942]">Billing</h1>
        <p className="text-gray-600 mt-2">
          Pro and Atelier subscriptions, past invoices, and Stripe portal. Shop sales invoices stay under Incoming orders.
        </p>
      </div>

      {vendorCtx && !vendorCtx.isEmployee && (
        <div className="bg-white border rounded-3xl p-6">
          <div className="font-semibold">{planBadgeLabel(vendorCtx.plan, 'vendor')}</div>
          <p className="text-sm text-gray-600 mt-1">
            {atelier
              ? 'Atelier: 0% platform fee, 50 seats, Maker Studio Pro, Subscribe & Save, international storefronts.'
              : vendorPaid
                ? 'Pro Practitioner: listings, Teaching Sanctum, campaigns, analytics, team tools.'
                : 'Free practitioner. Upgrade when you want Pro or Atelier.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/pro-upgrade?type=vendor" className="px-4 py-2 rounded-2xl bg-[#4a1942] text-white text-sm font-semibold">
              {vendorPaid ? 'Plans & Atelier' : 'Upgrade'}
            </Link>
            {vendorPaid && (
              <button
                type="button"
                disabled={busy}
                onClick={() => openPortal('vendor')}
                className="px-4 py-2 rounded-2xl border text-sm font-semibold"
              >
                {busy ? 'Opening…' : 'Manage / cancel in Stripe'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-3xl p-6">
        <div className="font-semibold">Seeker membership</div>
        <p className="text-sm text-gray-600 mt-1">
          {seekerPaid ? 'Pro Member is active.' : 'Free seeker. Pro Member is optional.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/pro-upgrade?type=customer" className="px-4 py-2 rounded-2xl border text-sm font-semibold">
            {seekerPaid ? 'Member hub' : 'Pro Member'}
          </Link>
          {seekerPaid && (
            <button
              type="button"
              disabled={busy}
              onClick={() => openPortal('customer')}
              className="px-4 py-2 rounded-2xl border text-sm font-semibold"
            >
              {busy ? 'Opening…' : 'Manage / cancel in Stripe'}
            </button>
          )}
        </div>
      </div>

      {err && <p className="text-sm text-red-700">{err}</p>}

      <div className="bg-white border rounded-3xl p-6">
        <h2 className="font-semibold mb-3">Subscription status</h2>
        {subs.length === 0 ? (
          <p className="text-sm text-gray-500">No platform subscription on file yet.</p>
        ) : (
          <ul className="text-sm divide-y">
            {subs.map((s) => (
              <li key={s.id} className="py-2 flex justify-between gap-3">
                <span className="capitalize">
                  {s.plan_type} · {s.status}
                  {s.billing_interval ? ` · ${s.billing_interval}` : ''}
                </span>
                <span className="text-xs text-gray-500">
                  {s.current_period_end ? `Renews ${new Date(s.current_period_end).toLocaleDateString()}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border rounded-3xl p-6">
        <h2 className="font-semibold mb-3">Invoice history</h2>
        <p className="text-xs text-gray-500 mb-3">Stripe receipts for Pro / Atelier / Pro Member. Shop customer orders are on Invoices / Incoming orders.</p>
        {invoices.length === 0 ? (
          <p className="text-sm text-gray-500">No Stripe invoices yet. After a paid subscription, receipts appear here and in the Stripe portal.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t">
                  <td className="py-2">{inv.created ? new Date(inv.created * 1000).toLocaleDateString() : '—'}</td>
                  <td>{money(inv.amount_paid || inv.amount_due, inv.currency)}</td>
                  <td className="capitalize">{inv.status}</td>
                  <td>
                    {inv.hosted_invoice_url && (
                      <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="text-[#4a1942] underline">
                        Receipt
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <YourDataPanel user={user} />
    </div>
  );
}
