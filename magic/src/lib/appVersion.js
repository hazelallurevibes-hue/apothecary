/**
 * Bump APP_VERSION (and package.json version) on every user-facing release.
 * Splash copy is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.4.0';

export const UPDATE_SPLASH = {
  title: 'A fresher Sanctum awaits',
  message:
    'Richer branding, installable app experience, and a one-tap upgrade when we ship something new.',
  highlights: [
    'Polished Magic Sanctum colors, sphere, and app shell',
    'SEO + social meta for sharing the sphere & coin',
    'Upgrade prompt on startup when a new version is live',
    'Install Magic as a home-screen app (PWA)',
  ],
};

export const SEEN_VERSION_KEY = 'magic_seen_app_version';
