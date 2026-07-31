/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.7.9';

export const UPDATE_SPLASH = {
  title: 'Teaching Sanctum college hub',
  message: 'Student hub, Hearth class search, mentorship for Pro teachers, and Pro ads removed for members.',
  highlights: [
    'Student hub: open / upcoming / closed / history + Pro tools greyed',
    'The Hearth: class search and nearby open classes',
    'Pro Teaching: mentorship inbox & seeker insights',
    'No upgrade ads for active Pro members',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
