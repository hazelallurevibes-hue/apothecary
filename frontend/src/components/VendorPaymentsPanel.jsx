import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { createStripeConnectLink, saveVendorPayoutFields } from '../lib/vendorPayoutsApi';
import { isValidPaypalEmail, isValidStripeAccountId } from '../lib/vendorPayments';

/**
 * Vendor payout linking with explicit confirm for PayPal.
 * Stripe uses real Connect onboarding when edge function is configured.
 */
export default function VendorPaymentsPanel({ vendorId, user }) {
  const [stripeId, setStripeId] = useState('');
  const [paypalId, setPaypalId] = useState('');
  const [paypalConfirm, setPaypalConfirm] = useState(false);
  const [connectStatus, setConnectStatus] = useState('none');
  const [paypalStatus, setPaypalStatus] = useState('none'); // none | connected
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase
      .from('vendors')
      .select('stripe_account_id, paypal_account_id, stripe_connect_status, paypal_connected_at')
      .eq('id', Number(vendorId))
      .maybeSingle();

    if (err && /paypal_connected_at|stripe_connect_status/i.test(err.message || '')) {
      const min = await supabase
        .from('vendors')
        .select('stripe_account_id, paypal_account_id')
        .eq('id', Number(vendorId))
        .maybeSingle();
      if (min.data) {
        setStripeId(min.data.stripe_account_id || '');
        setPaypalId(min.data.paypal_account_id || '');
        setPaypalStatus(min.data.paypal_account_id ? 'connected' : 'none');
        setConnectStatus(min.data.stripe_account_id ? 'linked' : 'none');
      }
      if (min.error) setError(min.error.message);
    } else if (err) {
      setError(err.message);
    } else if (data) {
      setStripeId(data.stripe_account_id || '');
      setPaypalId(data.paypal_account_id || '');
      setConnectStatus(data.stripe_connect_status || (data.stripe_account_id ? 'linked' : 'none'));
      setPaypalStatus(
        data.paypal_account_id && (data.paypal_connected_at || data.paypal_account_id)
          ? 'connected'
          : 'none',
      );
      setPaypalConfirm(!!data.paypal_account_id);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const saveStripe = async () => {
    if (!vendorId) return;
    const id = stripeId.trim();
    if (!isValidStripeAccountId(id)) {
      setError('Stripe account ids look like acct_1AbCdEf… — or use Connect with Stripe.');
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
      setMessage('Stripe account saved on your storefront.');
    } catch (e) {
      setError(e.message || 'Could not save Stripe account');
    }
    setSaving('');
  };

  const connectAndConfirmPaypal = async () => {
    if (!vendorId) return;
    const id = paypalId.trim();
    if (!isValidPaypalEmail(id)) {
      setError('Enter a real PayPal business email (you@business.com) or paypal.me handle.');
      return;
    }
    if (!paypalConfirm) {
      setError('Check the confirmation box — you must confirm this is your PayPal account.');
      return;
    }
    setSaving('paypal');
    setError('');
    setMessage('');
    try {
      await saveVendorPayoutFields(vendorId, {
        paypal_account_id: id,
        paypal_connected_at: new Date().toISOString(),
      });
      setPaypalStatus('connected');
      setMessage(
        `PayPal connected as ${id}. Seekers can choose PayPal at checkout and will be sent to pay you there.`,
      );
    } catch (e) {
      // retry without timestamp column
      try {
        await saveVendorPayoutFields(vendorId, { paypal_account_id: id });
        setPaypalStatus('connected');
        setMessage(`PayPal connected as ${id}.`);
      } catch (e2) {
        setError(e2.message || e.message || 'Could not save PayPal');
      }
    }
    setSaving('');
  };

  const disconnectPaypal = async () => {
    if (!vendorId) return;
    if (!window.confirm('Remove PayPal from this storefront?')) return;
    setSaving('paypal');
    setError('');
    try {
      await saveVendorPayoutFields(vendorId, {
        paypal_account_id: null,
        paypal_connected_at: null,
      });
      setPaypalId('');
      setPaypalConfirm(false);
      setPaypalStatus('none');
      setMessage('PayPal disconnected.');
    } catch (e) {
      try {
        await saveVendorPayoutFields(vendorId, { paypal_account_id: null });
        setPaypalId('');
        setPaypalStatus('none');
        setMessage('PayPal disconnected.');
      } catch (e2) {
        setError(e2.message || e.message);
      }
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
        setMessage('Redirecting to Stripe to finish onboarding and confirm your account…');
        window.location.href = url;
        return;
      }
      setError('Stripe did not return an onboarding link. Check platform Stripe keys + create-stripe-connect.');
    } catch (e) {
      setError(e.message || 'Stripe Connect failed');
    }
    setSaving('');
  };

  const openPaypalLogin = () => {
    // Opens PayPal so vendor can confirm their business identity, then return and paste email
    window.open('https://www.paypal.com/businessmanage/account/aboutBusiness', '_blank', 'noopener,noreferrer');
    setMessage(
      'PayPal opened in a new tab. Sign in to your business account, then return here, enter that email, check the box, and tap Connect & confirm PayPal.',
    );
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
        Connect Stripe (full sign-in with Stripe) or confirm your PayPal business email so seekers can pay you at
        checkout.
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
        {/* Stripe */}
        <div className="rounded-2xl border p-4 bg-slate-50/50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-sm font-medium text-gray-800">Stripe Connect</label>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                connectStatus === 'linked' || stripeId
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {connectStatus === 'linked' || stripeId ? 'Connected' : 'Not connected'}
            </span>
          </div>
          <input
            value={stripeId}
            onChange={(e) => setStripeId(e.target.value)}
            placeholder="acct_… (or use Connect button)"
            className="w-full border p-3 rounded-2xl mt-1 bg-white"
            autoComplete="off"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!saving}
              onClick={connectStripe}
              className="px-4 py-2 bg-[#635bff] text-white rounded-2xl text-sm font-medium disabled:opacity-50"
            >
              {saving === 'connect' ? 'Opening Stripe…' : 'Connect with Stripe (sign in)'}
            </button>
            <button
              type="button"
              disabled={!!saving}
              onClick={saveStripe}
              className="px-4 py-2 border border-[#635bff] text-[#635bff] rounded-2xl text-sm font-medium disabled:opacity-50"
            >
              {saving === 'stripe' ? 'Saving…' : 'Save Stripe id'}
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            <strong>Connect with Stripe</strong> opens Stripe&apos;s site so you sign in / create an Express account and
            confirm details. That is the real connection flow.
          </p>
        </div>

        {/* PayPal */}
        <div className="rounded-2xl border p-4 bg-slate-50/50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-sm font-medium text-gray-800">PayPal</label>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                paypalStatus === 'connected'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {paypalStatus === 'connected' ? 'Connected' : 'Not connected'}
            </span>
          </div>
          <input
            value={paypalId}
            onChange={(e) => {
              setPaypalId(e.target.value);
              setPaypalStatus('none');
            }}
            placeholder="business@example.com or paypal.me/YourShop"
            className="w-full border p-3 rounded-2xl mt-1 bg-white"
            autoComplete="email"
          />
          <label className="mt-3 flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={paypalConfirm}
              onChange={(e) => setPaypalConfirm(e.target.checked)}
            />
            <span>
              I confirm this is <strong>my</strong> PayPal business account and I authorize seekers to pay this address
              for Hazel Allure orders.
            </span>
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!saving}
              onClick={openPaypalLogin}
              className="px-4 py-2 border border-[#00457C] text-[#00457C] rounded-2xl text-sm font-medium disabled:opacity-50"
            >
              Open PayPal (sign in)
            </button>
            <button
              type="button"
              disabled={!!saving || !paypalConfirm}
              onClick={connectAndConfirmPaypal}
              className="px-4 py-2 bg-[#00457C] text-white rounded-2xl text-sm font-medium disabled:opacity-50"
            >
              {saving === 'paypal' ? 'Connecting…' : 'Connect & confirm PayPal'}
            </button>
            {paypalStatus === 'connected' && (
              <button
                type="button"
                disabled={!!saving}
                onClick={disconnectPaypal}
                className="px-3 py-2 text-xs text-red-700 underline"
              >
                Disconnect
              </button>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            <strong>How it works:</strong> 1) Open PayPal and sign in to your business account. 2) Paste that email or
            paypal.me handle here. 3) Check the box. 4) Tap <em>Connect &amp; confirm</em>. Without step 3–4 it is{' '}
            <em>not</em> connected.
          </p>
        </div>
      </div>
    </div>
  );
}
