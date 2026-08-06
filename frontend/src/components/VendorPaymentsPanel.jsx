import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { createStripeConnectLink, saveVendorPayoutFields } from '../lib/vendorPayoutsApi';
import { isValidPaypalEmail, isValidStripeAccountId } from '../lib/vendorPayments';
import { getAppUrl } from '../lib/appUrl';

/**
 * One-button payout linking.
 * Stripe: real Connect onboarding with return to this page.
 * PayPal: single connect action (email/me handle) + return deep-link when vendor comes back from PayPal.
 */
export default function VendorPaymentsPanel({ vendorId, user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stripeId, setStripeId] = useState('');
  const [paypalId, setPaypalId] = useState('');
  const [connectStatus, setConnectStatus] = useState('none');
  const [paypalStatus, setPaypalStatus] = useState('none');
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
      setPaypalStatus(data.paypal_account_id ? 'connected' : 'none');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  // Return from PayPal / Stripe: land here and finish confirm
  useEffect(() => {
    const paypalReturn = searchParams.get('paypal_return');
    const stripeReturn = searchParams.get('stripe_return') || searchParams.get('connect');
    if (paypalReturn === '1' || paypalReturn === 'true') {
      setMessage(
        'Welcome back from PayPal. Enter the same business email or paypal.me handle you use for receiving money, then tap Connect PayPal.',
      );
      const next = new URLSearchParams(searchParams);
      next.delete('paypal_return');
      setSearchParams(next, { replace: true });
    }
    if (stripeReturn) {
      setMessage('Welcome back from Stripe. Refreshing Connect status…');
      load().then(() => setMessage('Stripe Connect status updated.'));
      const next = new URLSearchParams(searchParams);
      next.delete('stripe_return');
      next.delete('connect');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectPaypal = async () => {
    if (!vendorId) return;
    const id = paypalId.trim();
    if (!isValidPaypalEmail(id)) {
      setError('Enter your PayPal business email (you@business.com) or paypal.me handle.');
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
        `PayPal connected as ${id}. Buyers will pay you there, then confirm on My Orders.`,
      );
    } catch (e) {
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
        returnUrl: `${getAppUrl()}/vendor-dashboard?stripe_return=1#payments`,
        refreshUrl: `${getAppUrl()}/vendor-dashboard?stripe_return=1#payments`,
      });
      if (account_id) setStripeId(account_id);
      if (url) {
        setMessage('Redirecting to Stripe… you will return here when finished.');
        window.location.href = url;
        return;
      }
      setError('Stripe did not return an onboarding link.');
    } catch (e) {
      setError(e.message || 'Stripe Connect failed');
    }
    setSaving('');
  };

  /**
   * Single PayPal path: if no email yet, open PayPal with return URL hint, then user finishes here.
   * If email entered, save immediately (no second “confirm” button).
   */
  const startPaypalConnect = async () => {
    const id = paypalId.trim();
    if (isValidPaypalEmail(id)) {
      await connectPaypal();
      return;
    }
    // Send vendor to PayPal, then back to us (return_url is app-side — PayPal business pages don't always honor it,
    // so we also store a session flag and show return banner).
    try {
      sessionStorage.setItem('ha_paypal_connect_pending', '1');
      sessionStorage.setItem('ha_paypal_return', `${getAppUrl()}/vendor-dashboard?paypal_return=1#payments`);
    } catch {
      /* ignore */
    }
    setMessage(
      'Opening PayPal. After you sign in, use Back to Hazel Allure (or the return link), then enter your receiving email or paypal.me and tap Connect PayPal once.',
    );
    const returnTo = encodeURIComponent(`${getAppUrl()}/vendor-dashboard?paypal_return=1#payments`);
    // Identity login with app return where supported; falls back to business home
    window.location.href = `https://www.paypal.com/signin?returnUri=${returnTo}`;
  };

  useEffect(() => {
    try {
      if (sessionStorage.getItem('ha_paypal_connect_pending') === '1') {
        sessionStorage.removeItem('ha_paypal_connect_pending');
        setMessage('Back from PayPal — enter your receiving email or paypal.me handle, then Connect PayPal.');
      }
    } catch {
      /* ignore */
    }
  }, []);

  if (!vendorId) {
    return (
      <div className="mb-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        Link a vendor profile before connecting payouts.
      </div>
    );
  }

  return (
    <div id="payments" className="mb-8 scroll-mt-24 bg-white border border-blue-200 rounded-3xl p-6 sm:p-8">
      <h3 className="font-bold text-xl sm:text-2xl mb-2 text-blue-900">Payment &amp; payout accounts</h3>
      <p className="text-sm text-gray-600 mb-4">
        One action per method. Stripe opens and returns here. PayPal: enter receiving email (or open PayPal then come
        back) and connect once.
      </p>

      {loading && <p className="text-sm text-gray-500">Loading payout settings…</p>}
      {error && (
        <p className="mb-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
      )}
      {message && (
        <p className="mb-3 text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
          {message}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-[#4a1942]">Card payouts (Stripe)</h4>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                connectStatus === 'linked' || stripeId
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {connectStatus === 'linked' || stripeId ? 'Connected' : 'Not connected'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Physical orders: funds held until you ship, then transfer. You will be redirected back to this page.
          </p>
          {stripeId && <p className="text-xs font-mono text-gray-600 mb-2 break-all">{stripeId}</p>}
          <button
            type="button"
            disabled={!!saving}
            onClick={connectStripe}
            className="w-full px-4 py-2.5 bg-[#4a1942] text-white rounded-2xl text-sm font-semibold disabled:opacity-50"
          >
            {saving === 'connect' ? 'Opening Stripe…' : stripeId ? 'Update Stripe Connect' : 'Connect Stripe'}
          </button>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-[#4a1942]">PayPal</h4>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                paypalStatus === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {paypalStatus === 'connected' ? 'Connected' : 'Not connected'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Receiving email or paypal.me handle only. Buyers pay you on PayPal, then confirm on My Orders.
          </p>
          <label className="block text-xs font-medium text-gray-600 mb-1">PayPal email or paypal.me</label>
          <input
            type="text"
            value={paypalId}
            onChange={(e) => setPaypalId(e.target.value)}
            placeholder="you@business.com or YourName"
            className="w-full border rounded-xl px-3 py-2 text-sm mb-3"
            autoComplete="email"
          />
          <button
            type="button"
            disabled={!!saving}
            onClick={startPaypalConnect}
            className="w-full px-4 py-2.5 bg-[#0070ba] text-white rounded-2xl text-sm font-semibold disabled:opacity-50"
          >
            {saving === 'paypal'
              ? 'Saving…'
              : paypalStatus === 'connected'
                ? 'Update PayPal'
                : isValidPaypalEmail(paypalId.trim())
                  ? 'Connect PayPal'
                  : 'Sign in to PayPal & connect'}
          </button>
          {paypalStatus === 'connected' && (
            <button
              type="button"
              disabled={!!saving}
              onClick={disconnectPaypal}
              className="w-full mt-2 px-4 py-2 border rounded-2xl text-sm text-gray-600"
            >
              Disconnect PayPal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
