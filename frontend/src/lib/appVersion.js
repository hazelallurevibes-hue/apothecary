/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.8.5';

export const UPDATE_SPLASH = {
  title: 'Listing manage tools for sellers only',
  message: 'Edit / hide / remove listing controls only show to the practitioner who owns the listing — not to shoppers.',
  highlights: [
    'Seekers no longer see vendor manage panel on product pages',
    'Owners still get Edit, Hide from public, and Remove',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
