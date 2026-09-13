/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.15.3';

export const UPDATE_SPLASH = {
  title: 'Login and dashboard cleanup',
  message:
    'Valid sign-in no longer shows a fake error. Missing notification tables are in place, and the login page allows blob workers.',
  highlights: [
    'Correct login errors vs profile-load failures',
    'Signed-in users leave /login automatically',
    'Vendor analytics scrolls to your shop stats',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
