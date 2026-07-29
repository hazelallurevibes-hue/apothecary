/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.6.5';

export const UPDATE_SPLASH = {
  title: 'What\'s new in this update',
  message: 'Full Pro SaaS toolkit for independent makers.',
  highlights: [
    'Tax pack, market-day mode, review QR',
    'Abandoned-cart templates & shift notes',
    'Shop story video + branded email footer',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
