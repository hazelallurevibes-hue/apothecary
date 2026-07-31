import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { createStripeConnectLink, saveVendorPayoutFields } from '../lib/vendorPayoutsApi';

/**
 * Real payout linking: save Stripe Connect / PayPal ids on vendors table.
 * Connect with Stripe opens Stripe-hosted Express onboarding when edge function is configured.
 */
export default function VendorPaymentsPanel({ vendorId, user }) {
  const [stripeId, setStripeId] = useState('');
  const [paypalId, setPaypalId] = useState('');
  const [connectStatus, setConnectStatus] = useState('none');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('vendors')
        .select('stripe_account_id, paypal_account_id, stripe_connect_status')
        .eq('id', Number(vendorId))
        .maybeSingle();
      if (cancelled) return;
      if (err) {
        // Column may be missing in partial schema
        const min = await supabase
          .from('vendors')
          .select('stripe_account_id, paypal_account_id')
          .eq('id', Number(vendorId))
          .maybeSingle();
        if (min.data) {
          setStripeId(min.data.stripe_account_id || '');
          setPaypalId(min.data.paypal_account_id || '');
        }
        if (min.error) setError(min.error.message);
      } else if (data) {
        setStripeId(data.stripe_account_id || '');
        setPaypalId(data.paypal_account_id || '');
        setConnectStatus(data.stripe_connect_status || (data.stripe_account_id ? 'linked' : 'none'));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [vendorId]);

  const saveStripe = async () => {
    if (!vendorId) return;
    const id = stripeId.trim();
    if (!id) {
      setError('Enter a Stripe Connect account id (acct_…) or use Connect with Stripe.');
      return;
    }
    if (!/^acct_[a-zA-Z0-9]+$/.test(id)) {
      setError('Stripe account ids look like acct_1AbCdEf… — not a placeholder.');
      return;
    }
    setSaving('stripe');
    setError('');
    setMessage('');
    try {
      await saveVendorPayoutFields(vendorId, {
        stripe_account_id: id,
        stripe_connect_status: 'linked',
      });
      setConnectStatus('linked');
      setMessage('Stripe account saved on your storefront. Shoppers can be directed to this account at checkout when Connect is fully enabled.');
    } catch (e) {
      setError(e.message || 'Could not save Stripe account');
    }
    setSaving('');
  };

  const savePaypal = async () => {
    if (!vendorId) return;
    const id = paypalId.trim();
    if (!id) {
      setError('Enter your PayPal email or merchant id.');
      return;
    }
    if (/^paypal_placeholder_/i.test(id)) {
      setError('Placeholder ids are not allowed. Use your real PayPal business email or merchant id.');
      return;
    }
    setSaving('paypal');
    setError('');
    setMessage('');
    try {
      await saveVendorPayoutFields(vendorId, { paypal_account_id: id });
      setMessage('PayPal payout contact saved. Buyers may use this for PayPal checkout when you enable it on an order.');
    } catch (e) {
      setError(e.message || 'Could not save PayPal');
    }
    setSaving('');
  };

  const connectStripe = async () => {
    if (!vendorId || !user?.email) {
      setError('Sign in with a linked vendor profile first.');
      return;
    }
    setSaving('connect');
    setError('');
    setMessage('');
    try {
      const { url, account_id } = await createStripeConnectLink({
        vendorId,
        email: user.email,
        name: user.name,
      });
      if (account_id) setStripeId(account_id);
      if (url) {
        setMessage('Redirecting to Stripe to finish onboarding…');
        window.location.href = url;
        return;
      }
      setError('Stripe did not return an onboarding link. Check Admin Stripe secret + redeploy create-stripe-connect.');
    } catch (e) {
      setError(e.message || 'Stripe Connect failed');
    }
    setSaving('');
  };

  if (!vendorId) {
    return (
      <div className="mb-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        Link a vendor profile before connecting payouts.
      </div>
    );
  }

  return (
    <div className="mb-8 bg-white border border-blue-200 rounded-3xl p-6 sm:p-8">
      <h3 className="font-bold text-xl sm:text-2xl mb-2 text-blue-900">Payment &amp; payout accounts</h3>
      <p className="text-sm text-gray-600 mb-4">
        Save your real Stripe Connect account or PayPal business email on this storefront. Values are stored on your
        vendor record in the database — not placeholders.
      </p>

      {loading && <p className="text-sm text-gray-500 mb-3">Loading saved payout settings…</p>}
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">{error}</p>
      )}
      {message && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mb-3">
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-800">Stripe Connect account</label>
          <p className="text-[11px] text-gray-500 mt-0.5 mb-1">
            Status: <span className="font-semibold">{connectStatus || 'none'}</span>
          </p>
          <input
            value={stripeId}
            onChange={(e) => setStripeId(e.target.value)}
            placeholder="acct_…"
            className="w-full border p-3 rounded-2xl mt-1"
            autoComplete="off"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!saving}
              onClick={saveStripe}
              className="px-4 py-2 bg-[#635bff] text-white rounded-2xl text-sm font-medium disabled:opacity-50"
            >
              {saving === 'stripe' ? 'Saving…' : 'Save Stripe id'}
            </button>
            <button
              type="button"
              disabled={!!saving}
              onClick={connectStripe}
              className="px-4 py-2 border border-[#635bff] text-[#635bff] rounded-2xl text-sm font-medium disabled:opacity-50"
            >
              {saving === 'connect' ? 'Opening Stripe…' : 'Connect with Stripe'}
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Connect with Stripe creates/opens an Express account and sends you to Stripe-hosted onboarding. Requires
            platform Stripe secret + edge function <code className="text-[10px]">create-stripe-connect</code>.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-800">PayPal business email / merchant id</label>
          <input
            value={paypalId}
            onChange={(e) => setPaypalId(e.target.value)}
            placeholder="business@example.com"
            className="w-full border p-3 rounded-2xl mt-1"
            autoComplete="email"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!saving}
              onClick={savePaypal}
              className="px-4 py-2 bg-[#00457C] text-white rounded-2xl text-sm font-medium disabled:opacity-50"
            >
              {saving === 'paypal' ? 'Saving…' : 'Save PayPal'}
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            We store your PayPal contact on the vendor row for checkout display and invoices. Full PayPal Partner
            OAuth can be added when you have Partner API credentials; until then this is the live linkage used by the
            platform (no simulated ids).
          </p>
        </div>
      </div>
    </div>
  );
}
