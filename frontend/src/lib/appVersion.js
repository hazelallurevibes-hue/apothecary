/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.8.8';

export const UPDATE_SPLASH = {
  title: 'PayPal connect + checkout that places orders',
  message: 'Vendors must confirm PayPal with a checkbox. Buyers can always place cash orders; PayPal opens pay link when connected.',
  highlights: [
    'Vendor: Open PayPal → confirm email → Connect & confirm',
    'Checkout shows only payment methods the maker supports',
    'Orders save even without PayPal — cash always works',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
