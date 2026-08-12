/**
 * Platform shipping kill-switch.
 * Flip SHIPPING_ENABLED to true when Little Shippie / carrier labels go live again.
 * While false: seekers can only choose local pickup; shipping UIs are hidden.
 */
export const SHIPPING_ENABLED = false;

export const DEFAULT_DELIVERY_METHOD = SHIPPING_ENABLED ? 'shipping' : 'pickup';
export const DEFAULT_FULFILLMENT_MODE = SHIPPING_ENABLED ? 'pickup_and_shipping' : 'pickup_only';

export function isShippingEnabled() {
  return SHIPPING_ENABLED === true;
}

/** Force checkout delivery method to pickup when shipping is paused. */
export function resolveDeliveryMethod(method) {
  if (!SHIPPING_ENABLED) return 'pickup';
  const m = String(method || '').toLowerCase();
  if (m === 'shipping' || m === 'pickup' || m === 'digital') return m;
  return 'pickup';
}

/** Map listing fulfillment modes while shipping is paused. */
export function resolveFulfillmentMode(mode) {
  if (!SHIPPING_ENABLED) {
    const m = String(mode || '').toLowerCase();
    // Keep external storefront option for Pro vendors
    if (m === 'external_only') return 'external_only';
    return 'pickup_only';
  }
  return mode || 'pickup_and_shipping';
}

export function shippingPausedNotice() {
  return 'Shipping is paused for now — local pickup only. Carrier labels will return later.';
}
