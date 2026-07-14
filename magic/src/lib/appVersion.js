/**
 * Bump APP_VERSION (and package.json version) on every user-facing release.
 * Splash copy is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.6.0';

export const UPDATE_SPLASH = {
  title: 'Showcase peeks & living familiars',
  message:
    'Free users get full beautiful Pro samples. Pro goes deeper. Familiars animate, medals gleam, easter eggs hide.',
  highlights: [
    'Awesome free showcases for Hearth Court, Familiar Whisperer, Before the Storm, Moon Mirror',
    'Pro multi-cards, ritual scores, vault depth, and live court modes',
    'Animated sanctum familiar + achievement medals',
    'Easter eggs: 7-tap bond, 13-tap familiar cycle, triple-gild sphere',
  ],
};

export const SEEN_VERSION_KEY = 'magic_seen_app_version';
