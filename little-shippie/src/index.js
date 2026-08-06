export { normalizeParcel, parseAddressLine } from './engine/parcel.js';
export { evaluateShipPolicy, DEFAULT_POLICY, SPECIAL_US_REGIONS } from './engine/zones.js';
export { shopRates, SERVICES } from './engine/rates.js';
export { buildLabelHtml, openLabelPrintWindow } from './engine/labelHtml.js';
export {
  TRACKING_STATUSES,
  normalizeTrackingStatus,
  buildTrackingRecord,
  trackingPortalUrl,
} from './engine/tracking.js';
// Node multi-tenant + adapters: import from 'little-shippie/tenants' or service on server only.
// Browser bundles should only use engine exports above (no fs).
