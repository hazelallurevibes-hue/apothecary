import { supabase } from './supabaseClient';

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function quoteShippingLabel({ orderId, vendorId, carrier, service, weightOz }) {
  const res = await fetch(`${FN_BASE}/create-shipping-label`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      order_id: orderId,
      vendor_id: vendorId,
      action: 'quote',
      carrier,
      service,
      weight_oz: weightOz,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Shipping quote failed');
  return json;
}

export async function purchaseShippingLabel({ orderId, vendorId, carrier, service, weightOz }) {
  const res = await fetch(`${FN_BASE}/create-shipping-label`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      order_id: orderId,
      vendor_id: vendorId,
      action: 'purchase',
      carrier,
      service,
      weight_oz: weightOz,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Label purchase failed');
  return json;
}

export async function markOrderShipped(orderId, { trackingNumber, carrier } = {}) {
  const patch = {
    shipped_at: new Date().toISOString(),
    status: 'shipped',
    payout_status: 'release_ready',
  };
  if (trackingNumber) patch.tracking_number = trackingNumber;
  if (carrier) patch.shipping_carrier = carrier;
  const { data, error } = await supabase.from('orders').update(patch).eq('id', orderId).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function releaseVendorPayout(orderId) {
  const res = await fetch(`${FN_BASE}/release-vendor-payout`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ order_id: orderId }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Payout release failed');
  return json;
}

export const SHIPPING_SERVICES = [
  { carrier: 'usps', service: 'ground', label: 'USPS Ground Advantage' },
  { carrier: 'usps', service: 'priority', label: 'USPS Priority' },
  { carrier: 'usps', service: 'express', label: 'USPS Express' },
  { carrier: 'ups', service: 'ground', label: 'UPS Ground' },
  { carrier: 'fedex', service: 'home', label: 'FedEx Home' },
];
