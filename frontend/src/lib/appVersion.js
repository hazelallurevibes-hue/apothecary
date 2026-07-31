/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.8.6';

export const UPDATE_SPLASH = {
  title: 'Listing ownership locked down',
  message: 'Only the practice that owns a listing can edit, hide, or delete it — enforced in the app and the database.',
  highlights: [
    'Manage bar hidden for seekers on product pages',
    'Database blocks non-owner updates and deletes',
    'Stale vendor_id on customer accounts no longer grants write access',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
