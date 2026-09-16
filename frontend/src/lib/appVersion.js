/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.15.8';

export const UPDATE_SPLASH = {
  title: 'Google can index each page',
  message:
    'Shop, practitioner, and listing URLs no longer tell Google they are copies of the homepage.',
  highlights: [
    'Each public URL has its own canonical',
    'Search Console inspection crawler is included',
    'Duplicate legal/alias routes point at one page',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
