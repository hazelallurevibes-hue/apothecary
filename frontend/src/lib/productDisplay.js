import { fulfillmentShortLabel } from './internationalStorefront';
import { isProPlan } from './plans';

/** Human ship / delivery ETA for Amazon-style tiles */
export function estimateShipLabel(item, { deliveryPref } = {}) {
  const mode = String(item?.fulfillment_mode || 'pickup_and_shipping').toLowerCase();
  if (item?.is_preorder) {
    const d = item.preorder_available_date;
    return d ? `Pre-order · ready ~${d}` : 'Pre-order · ships when ready';
  }
  if (mode.includes('digital') || mode === 'download') return 'Digital · usually instant';
  if (mode === 'pickup_only' || mode === 'pickup') {
    return 'Local pickup · often 1–2 days';
  }
  if (mode === 'shipping' || mode === 'ship_only') {
    return 'Ships in 3–7 business days';
  }
  if (deliveryPref === 'pickup') return 'Pickup available · often 1–2 days';
  if (deliveryPref === 'shipping') return 'Ships in 3–7 business days';
  if (deliveryPref === 'digital') return 'Digital option when offered';
  return `${fulfillmentShortLabel(mode)} · typically 2–7 days`;
}

export function listPrice(item) {
  const base = Number(item?.price) || 0;
  if (item?.sale_price != null && item.sale_price !== '' && Number(item.sale_price) < base) {
    return Number(item.sale_price);
  }
  const pct = Number(item?.discount_percent) || 0;
  if (pct > 0) return Math.round(base * (1 - pct / 100) * 100) / 100;
  return base;
}

/** Pro member price when vendor set shop-wide Pro discount */
export function proMemberPrice(list, vendorProDiscountPct) {
  const p = Number(vendorProDiscountPct) || 0;
  if (p <= 0) return null;
  const base = Number(list) || 0;
  return Math.round(base * (1 - p / 100) * 100) / 100;
}

export function formatStars(avg) {
  const n = Math.round(Number(avg) || 0);
  if (!n) return '☆☆☆☆☆';
  return '★'.repeat(Math.min(5, n)) + '☆'.repeat(Math.max(0, 5 - n));
}

export function showProPriceForUser(user, vendorProDiscountPct) {
  if (!vendorProDiscountPct || vendorProDiscountPct <= 0) return false;
  return isProPlan(user?.customer_plan) || !!user?.customer_pro_active;
}
