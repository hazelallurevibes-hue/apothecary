/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.12.0';

export const UPDATE_SPLASH = {
  title: 'Vendor dashboard & order fulfillment fixes',
  message:
    'Storefront identity auto-heals so your listings and orders load on first open. Pickup orders no longer fail silently. Vendor dashboard is cleaner, and the remedy library is expanded.',
  highlights: [
    'Vendor dashboard loads products/orders without a manual refresh',
    'Orders always attach to the correct storefront + buyer email',
    'Pickup checkout trigger fixed (orders reach vendors again)',
    'Pro ad clutter reduced on the practitioner dashboard',
    'Remedy library expanded (free + hot Pro topics)',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
