import { supabase } from './supabaseClient';

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

/** Persist payout fields on vendors via Supabase (service path preferred via edge later). */
export async function saveVendorPayoutFields(vendorId, fields) {
  const vid = Number(vendorId);
  if (!vid) throw new Error('Missing vendor id');

  const payload = {};
  if (fields.stripe_account_id !== undefined) payload.stripe_account_id = fields.stripe_account_id || null;
  if (fields.paypal_account_id !== undefined) payload.paypal_account_id = fields.paypal_account_id || null;
  if (fields.stripe_connect_status !== undefined) {
    payload.stripe_connect_status = fields.stripe_connect_status || 'none';
  }
  if (fields.paypal_connected_at !== undefined) {
    payload.paypal_connected_at = fields.paypal_connected_at;
  }

  const { error } = await supabase.from('vendors').update(payload).eq('id', vid);
  if (error) {
    // Retry dropping optional columns if missing on older DBs
    let rest = { ...payload };
    if (/stripe_connect_status/i.test(error.message)) delete rest.stripe_connect_status;
    if (/paypal_connected_at/i.test(error.message)) delete rest.paypal_connected_at;
    if (Object.keys(rest).length !== Object.keys(payload).length) {
      const retry = await supabase.from('vendors').update(rest).eq('id', vid);
      if (retry.error) throw new Error(retry.error.message);
      return true;
    }
    throw new Error(error.message);
  }
  return true;
}

/** Load vendor payout methods for checkout. */
export async function fetchVendorPaymentMethods(vendorId) {
  const vid = Number(vendorId);
  if (!vid) return null;
  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, stripe_account_id, paypal_account_id, stripe_connect_status, paypal_connected_at')
    .eq('id', vid)
    .maybeSingle();
  if (error && /paypal_connected_at|stripe_connect_status/i.test(error.message || '')) {
    const min = await supabase
      .from('vendors')
      .select('id, name, stripe_account_id, paypal_account_id')
      .eq('id', vid)
      .maybeSingle();
    return min.data || null;
  }
  if (error) throw new Error(error.message);
  return data;
}

export async function createStripeConnectLink({ vendorId, email, name }) {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL not configured');
  }
  const res = await fetch(`${FN_BASE}/create-stripe-connect`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      vendor_id: vendorId,
      email: email?.trim().toLowerCase(),
      name: name || undefined,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || json.message || 'create-stripe-connect failed');
  }
  return json;
}
