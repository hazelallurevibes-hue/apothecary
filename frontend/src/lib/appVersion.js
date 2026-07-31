/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.8.9';

export const UPDATE_SPLASH = {
  title: 'Orders show in My Orders + clear payment status',
  message: 'Buyer orders are saved with your email so they appear under My Orders. Cash is pay-on-delivery; PayPal/card start as awaiting payment.',
  highlights: [
    'My Orders finds purchases by account email + user id',
    'Cash = COD (pay maker on delivery)',
    'PayPal/card = awaiting payment until you finish paying',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
