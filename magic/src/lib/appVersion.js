/**
 * Bump APP_VERSION (and package.json version) on every user-facing release.
 * Splash copy is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.7.1';

export const UPDATE_SPLASH = {
  title: 'Desk Orb fixed + clearer sphere answers',
  message:
    'The widget 8-ball now shows YES / NO / MAYBE. Install uses proper app icons. Free daily ink sits under Ask a question.',
  highlights: [
    'Desk Orb: tap 8-ball always shows a big answer',
    'Install Desk Orb / app with PNG icons + on-page Install button',
    'Classic sphere answers: YES, NO, MAYBE with flavor lines',
    'Free daily ink moved under the question box',
  ],
};

export const SEEN_VERSION_KEY = 'magic_seen_app_version';
