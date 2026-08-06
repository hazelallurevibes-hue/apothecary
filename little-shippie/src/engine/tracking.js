/**
 * Tracking field model + provider-agnostic status normalize.
 */

export const TRACKING_STATUSES = [
  'label_created',
  'accepted',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'exception',
  'returned',
  'unknown',
];

export function normalizeTrackingStatus(raw = '') {
  const s = String(raw).toLowerCase();
  if (/deliver/.test(s) && !/out for|attempt/.test(s)) return 'delivered';
  if (/out for delivery/.test(s)) return 'out_for_delivery';
  if (/transit|departed|arrived|enroute|in_transit/.test(s)) return 'in_transit';
  if (/accept|origin|picked|manifest/.test(s)) return 'accepted';
  if (/return|RTS/.test(s)) return 'returned';
  if (/exception|delay|hold|fail|undeliver/.test(s)) return 'exception';
  if (/creat|pre-ship|label/.test(s)) return 'label_created';
  return 'unknown';
}

/**
 * Build tracking payload stored on orders / shipping_labels.
 */
export function buildTrackingRecord({
  trackingNumber,
  carrier,
  status = 'label_created',
  events = [],
  estimatedDelivery = null,
  labelUrl = null,
} = {}) {
  return {
    tracking_number: trackingNumber || null,
    carrier: (carrier || 'usps').toLowerCase(),
    status: normalizeTrackingStatus(status),
    estimated_delivery: estimatedDelivery,
    label_url: labelUrl,
    events: events.map((e) => ({
      at: e.at || e.timestamp || new Date().toISOString(),
      status: normalizeTrackingStatus(e.status || e.description || ''),
      description: e.description || e.status || '',
      location: e.location || null,
    })),
    updated_at: new Date().toISOString(),
  };
}

/** Public carrier tracking URL helpers (deep-link only — no scrape). */
export function trackingPortalUrl(carrier, trackingNumber) {
  const t = encodeURIComponent(trackingNumber || '');
  const c = String(carrier || '').toLowerCase();
  if (c === 'usps') return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`;
  if (c === 'fedex') return `https://www.fedex.com/fedextrack/?trknbr=${t}`;
  if (c === 'ups') return `https://www.ups.com/track?tracknum=${t}`;
  return null;
}
