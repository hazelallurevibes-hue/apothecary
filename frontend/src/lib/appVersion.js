/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.8.4';

export const UPDATE_SPLASH = {
  title: 'Cart works again',
  message: 'Add to cart no longer requires email verification first. Verify is only needed at checkout.',
  highlights: [
    'Add products to cart freely while browsing',
    'Email verification still required to place an order',
    'Faster verification status checks',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
