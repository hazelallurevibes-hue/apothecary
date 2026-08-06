/**
 * Instant vendor storefront id for first paint (no empty dashboard until refresh).
 * Mirrors users.vendor_id after resolveVendorIdForUser heals it.
 */
const PREFIX = 'ha_vendor_storefront_v1:';

function keyForEmail(email) {
  return `${PREFIX}${String(email || '')
    .trim()
    .toLowerCase()}`;
}

export function readCachedVendorId(email) {
  if (!email || typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(keyForEmail(email));
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function writeCachedVendorId(email, vendorId) {
  if (!email || !vendorId || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(keyForEmail(email), String(Number(vendorId)));
  } catch {
    /* quota / private mode */
  }
}

export function clearCachedVendorId(email) {
  if (!email || typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(keyForEmail(email));
  } catch {
    /* ignore */
  }
}
