/**
 * Bump APP_VERSION (and package.json version) on every user-facing release.
 */
export const APP_VERSION = '1.9.6';

export const UPDATE_SPLASH = {
  title: 'Stay signed in across Magic & Apothecary',
  message:
    'Secure shared session on hazelallure.com — hop between Magic and Apothecary without signing in again. More oracle answers and Pro depth.',
  highlights: [
    'Cross-site login bridge (no tokens in URLs)',
    'Shared Secure cookies on *.hazelallure.com',
    'Profile auto-loads on both apps',
    'Richer sphere + Moon Mirror content',
  ],
};

export const SEEN_VERSION_KEY = 'magic_seen_app_version';
