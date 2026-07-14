/**
 * Bump APP_VERSION (and package.json version) on every user-facing release.
 * Splash copy is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.7.0';

export const UPDATE_SPLASH = {
  title: 'Free Court + install-worthy tools',
  message:
    'Enter arguments, vote, and get a computer ruling for free. New Dice, This-or-That, and Mood Meter make the app worth downloading — Pro still converts hard.',
  highlights: [
    'Hearth Court free: 2 sides, votes, basic computer decision',
    'New free: Sanctum Dice, This or That, Mood Meter + moon',
    'Pro: live multi-device polls, 4 sides, 2,800+ cliffs, full libraries',
    'Clear free vs Pro value map on Free playground',
  ],
};

export const SEEN_VERSION_KEY = 'magic_seen_app_version';
