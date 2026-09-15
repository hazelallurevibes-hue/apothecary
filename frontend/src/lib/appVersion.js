/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.15.4';

export const UPDATE_SPLASH = {
  title: 'Storefront storm and login speed',
  message:
    'Public shop pages no longer hammer the database. Sign-in should complete in seconds, and missing review/rating columns are in place.',
  highlights: [
    'Storefront request loop stopped',
    'Employee lookup no longer recurses in RLS',
    'Forgot-password and reset-password actually work',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
