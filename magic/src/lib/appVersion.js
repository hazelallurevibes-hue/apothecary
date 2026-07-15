/**
 * Bump APP_VERSION (and package.json version) on every user-facing release.
 */
export const APP_VERSION = '1.9.7';

export const UPDATE_SPLASH = {
  title: 'Auth bridge fix — no more stuck screen',
  message:
    'Magic auth bridge always continues within a few seconds, recovers shared cookies, and offers Continue / Sign in if needed.',
  highlights: [
    'Bridge hard-timeout + hard redirect',
    'Recover session from shared cookies',
    'Manual Continue button if auto-nav fails',
  ],
};

export const SEEN_VERSION_KEY = 'magic_seen_app_version';
