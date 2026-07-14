/**
 * Bump APP_VERSION (and package.json version) on every user-facing release.
 * Splash copy is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.7.2';

export const UPDATE_SPLASH = {
  title: 'One-tap auto update',
  message:
    'New versions apply automatically once — no more clicking upgrade over and over after deploys.',
  highlights: [
    'Auto-update when a new version is live',
    'Reload guard stops update loops',
    'Brief “Updating…” screen, then you are in',
  ],
};

export const SEEN_VERSION_KEY = 'magic_seen_app_version';
