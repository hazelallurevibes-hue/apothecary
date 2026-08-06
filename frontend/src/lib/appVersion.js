/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.13.0';

export const UPDATE_SPLASH = {
  title: 'Instant dashboard + Little Shippie + PayPal',
  message:
    'Vendor data seeds from cache so listings appear without refresh. Duplicate test orders cleaned. PayPal is one connect button with return. Shipping uses Little Shippie rate shop, package dims, and printable labels.',
  highlights: [
    'Dashboard first paint uses cached storefront id (no empty until refresh)',
    'Smoke orders removed — only real buyer orders remain',
    'PayPal: single Connect flow that returns to your dashboard',
    'Little Shippie: measure package → USPS/UPS/FedEx quotes → print label',
    'Shipping zone policies (domestic, military, international rules)',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
