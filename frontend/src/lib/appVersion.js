/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.8.7';

export const UPDATE_SPLASH = {
  title: 'Separate cart for buyers vs vendor orders',
  message: 'The cart icon opens seeker checkout. Vendor fulfillment is on its own Incoming Orders page.',
  highlights: [
    '🛒 Cart → /cart (buy products)',
    'My Orders → your purchase history',
    'Incoming orders → vendor fulfillment only',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
