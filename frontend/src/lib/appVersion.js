/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.8.1';

export const UPDATE_SPLASH = {
  title: 'Tarot once a day · verify email fix',
  message: 'Daily tarot no longer re-draws every login. Email confirmation lands on the verification page with a clear success message.',
  highlights: [
    'One tarot card per calendar day (not every login)',
    'Verify email links go to /verify-email (no more 404)',
    'Verified success message — system recognizes confirmation',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
