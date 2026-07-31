/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.8.0';

export const UPDATE_SPLASH = {
  title: 'Product home · daily tarot · Hearth voice',
  message: 'Home is now the apothecary marketplace. Daily tarot shows on login. Hearth proposals get a Hazel reply. Verify email sends from Hazel Allure.',
  highlights: [
    'Amazon-style product-first home with sticky search',
    'Reliable daily tarot card on each login session',
    'Student voice proposals confirm with Hazel Allure personality',
    'Resend verification via branded Hazel Allure email',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
