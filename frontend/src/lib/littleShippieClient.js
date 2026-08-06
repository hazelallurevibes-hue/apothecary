/**
 * Browser client for Little Shippie (local engine + edge purchase).
 * Mirrors eBay/ShipStation: rate shop → pick service → buy → print.
 */
import { supabase } from './supabaseClient';
// Engine bundled into frontend via relative import (no package install required)
import {
  shopRates,
  buildLabelHtml,
  openLabelPrintWindow,
  parseAddressLine,
  normalizeParcel,
  evaluateShipPolicy,
  DEFAULT_POLICY,
  SERVICES,
} from '@little-shippie/index.js';

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

export {
  shopRates,
  buildLabelHtml,
  openLabelPrintWindow,
  parseAddressLine,
  normalizeParcel,
  evaluateShipPolicy,
  DEFAULT_POLICY,
  SERVICES,
};

export async function quoteAllServices({
  orderId,
  vendorId,
  weightOz,
  lengthIn,
  widthIn,
  heightIn,
  from,
  to,
}) {
  // Client-side shop for instant UI; edge records quote when purchasing
  return shopRates({
    weightOz,
    lengthIn,
    widthIn,
    heightIn,
    from,
    to,
  });
}

export async function purchaseLabelViaEdge({
  orderId,
  vendorId,
  carrier,
  service,
  weightOz,
  lengthIn,
  widthIn,
  heightIn,
}) {
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
      length_in: lengthIn,
      width_in: widthIn,
      height_in: heightIn,
      provider: 'little_shippie',
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Label purchase failed');
  return json;
}

export function printOrderLabel({ order, vendor, rate, trackingNumber }) {
  const from = {
    name: vendor?.name || 'Maker',
    street: vendor?.address || vendor?.street || '',
    city: vendor?.city || '',
    region: vendor?.state || vendor?.region || '',
    postal: vendor?.zip || vendor?.postal || '',
    country: vendor?.country || 'US',
  };
  const toParsed = parseAddressLine(order?.address || '');
  const to = {
    name: order?.buyer_name || order?.buyer_email || 'Buyer',
    street: toParsed.street,
    city: toParsed.city,
    region: toParsed.region,
    postal: toParsed.postal,
    country: toParsed.country || 'US',
  };
  const dims = rate?.parcel
    ? `${rate.parcel.lengthIn}×${rate.parcel.widthIn}×${rate.parcel.heightIn} in`
    : '';
  const html = buildLabelHtml({
    from,
    to,
    carrier: (rate?.carrier || 'usps').toUpperCase(),
    service: rate?.label || rate?.service || 'Priority',
    trackingNumber: trackingNumber || order?.tracking_number,
    orderId: order?.id,
    weightOz: rate?.parcel?.weightOz || 16,
    dimensions: dims,
  });
  return openLabelPrintWindow(html);
}
