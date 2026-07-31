/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.9.0';

export const UPDATE_SPLASH = {
  title: 'Real card checkout + full order lifecycle',
  message:
    'Card orders open Stripe Checkout and mark paid automatically. Cash is COD; PayPal opens pay links with confirm on My Orders. Makers see payment status on Incoming orders.',
  highlights: [
    'Card → Stripe Checkout (Connect) → webhook marks paid',
    'My Orders: retry card, open PayPal, or mark paid',
    'Vendor inbox shows paid vs awaiting payment',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
