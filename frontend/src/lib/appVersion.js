/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.9.1';

export const UPDATE_SPLASH = {
  title: 'Teaching + practitioner checkout secured',
  message:
    'Courses and 1:1 sessions use Stripe Connect (with platform fee). Only the owning practitioner can edit courses/slots. Mini-cart routes to full checkout — no free place-order shortcut.',
  highlights: [
    'Teaching Sanctum: Stripe enroll + owner-only course edits',
    'Session booking: Connect payout + cancel/return toasts',
    'Marketplace fee: Stripe estimate + Hazel admin %',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
