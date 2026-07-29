/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.6.4';

export const UPDATE_SPLASH = {
  title: 'What\'s new in this update',
  message: 'Launch checklist, smarter ID review, and Pro dashboard personalization.',
  highlights: [
    'Product sellers can launch without photo ID',
    'Pending ID counts as progress while you wait',
    'Pro dashboard widgets you can turn on/off',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
