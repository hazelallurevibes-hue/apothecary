/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.6.1';

export const UPDATE_SPLASH = {
  title: 'One automatic update',
  message: 'New versions apply once automatically — no repeated upgrade clicks.',
  highlights: [
    'Auto-update when version.json is newer',
    'Reload guard prevents update loops',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
