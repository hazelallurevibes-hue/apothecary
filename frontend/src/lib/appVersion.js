/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.15.6';

export const UPDATE_SPLASH = {
  title: 'Favorites and invoices work',
  message:
    'Seekers can heart practitioners and listings. Practitioners see real sales invoices from orders.',
  highlights: [
    'Save hearts on shop and product pages',
    'Invoices list actual shop orders',
    'Free and Pro both get these tools',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
