import { supabase } from './supabaseClient';
import { buildPaypalPayLink } from './vendorPayments';

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Start Stripe Checkout for an existing marketplace order (card / Connect).
 * Redirects the browser when `url` is returned.
 */
export async function startOrderCardCheckout({ orderId, email, redirect = true }) {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL not configured');
  }
  const res = await fetch(`${FN_BASE}/create-order-checkout`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      order_id: orderId,
      email: email?.trim().toLowerCase(),
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || json.message || 'Card checkout failed');
  }
  if (json.already_paid || json.free) {
    return json;
  }
  if (json.url && redirect) {
    window.location.href = json.url;
  }
  return json;
}

/** Open PayPal pay link for an unpaid order. */
export function openPaypalForOrder({ paypalId, amount, orderId }) {
  const url = buildPaypalPayLink({
    paypalId,
    amount,
    note: `Hazel Allure order #${orderId || ''}`,
  });
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return url;
}
