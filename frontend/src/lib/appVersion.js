/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.15.9';

export const UPDATE_SPLASH = {
  title: 'Billing and your data',
  message:
    'Pro and Atelier shops have a Billing menu with Stripe invoice history, plus download-my-data and deletion requests.',
  highlights: [
    'Billing history from Stripe receipts',
    'Request deletion within 30 days (legal holds kept)',
    'Essential cookie notice',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
