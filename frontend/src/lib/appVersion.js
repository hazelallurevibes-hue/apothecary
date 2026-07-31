/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.8.3';

export const UPDATE_SPLASH = {
  title: 'Email verify fixed for real',
  message: 'Verification emails now use a SPA-safe link so tapping Verify confirms your account immediately.',
  highlights: [
    'New verify links use token_hash (works with our login system)',
    'Opening the email link should show green “Email verified”',
    'Resend for a fresh link — old emails will not work',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
