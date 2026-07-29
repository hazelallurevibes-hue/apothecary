/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.6.6';

export const UPDATE_SPLASH = {
  title: 'What\'s new in this update',
  message: 'Product posting reliability fix after deploys.',
  highlights: [
    'Fixed failed dynamic import when posting products',
    'Hard refresh no longer required after updates',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
