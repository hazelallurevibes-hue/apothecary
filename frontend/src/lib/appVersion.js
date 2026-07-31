/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.8.2';

export const UPDATE_SPLASH = {
  title: 'Email verify actually sticks',
  message: '“I verified — refresh status” now confirms with the server so Hazel Allure recognizes your email.',
  highlights: [
    'Server-side email confirmation (Auth + account flag)',
    'Refresh status works after opening the email link',
    'Clear message if you still need to open the email first',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
