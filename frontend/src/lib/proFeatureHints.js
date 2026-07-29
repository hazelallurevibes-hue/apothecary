/**
 * Gentle Pro feature hints — shown once per feature, dismissible, never naggy.
 */
const DISMISS_PREFIX = 'hazel_pro_hint_';

export const PRO_HINTS = {
  remedies_hot: {
    plan: 'customer',
    title: 'Pro remedy monographs',
    body: 'High-demand natural-remedy research topics unlock with Pro Membership — full conventional-care notes and traditional detail.',
    cta: 'Unlock Pro research',
  },
  community_post: {
    title: 'Join the conversation with Pro',
    body: 'Pro Members can start new threads in the Gathering. You can still read and reply to open discussions.',
    cta: 'Explore Pro Member',
    plan: 'customer',
  },
  profile_frame: {
    title: 'Frame your portrait',
    body: 'Pro Members can add accent colors, banners, and elegant frames around their profile.',
    cta: 'Customize with Pro',
    plan: 'customer',
  },
  profile_banner: {
    title: 'A banner for your journey',
    body: 'Pro Members may upload a profile banner — a quiet backdrop for your story.',
    cta: 'Upgrade gently',
    plan: 'customer',
  },
  student_badge_pin: {
    title: 'Wear your class honors',
    body: 'Pin a practitioner-issued badge beside your portrait when you are a Pro Member.',
    cta: 'See Pro benefits',
    plan: 'customer',
  },
  certificate_upload: {
    title: 'Show your credentials',
    body: 'Pro Practitioners can upload certificates and issue digital honors to dedicated students.',
    cta: 'Upgrade to Pro Practitioner',
    plan: 'vendor',
  },
  digital_cert: {
    title: 'Issue digital certifications',
    body: 'Create branded completion certificates and class-favorite badges for your Sanctum students.',
    cta: 'Unlock Teaching tools',
    plan: 'vendor',
  },
  vendor_gathering: {
    title: 'Practitioner lounge',
    body: 'Pro Practitioners access the private vendor gathering for peer support and Sanctum craft.',
    cta: 'Go Pro Practitioner',
    plan: 'vendor',
  },
  lesson_progress: {
    title: 'Track your Sanctum path',
    body: 'Pro Members see lesson progress and completion milestones across enrolled courses.',
    cta: 'Pro Member perks',
    plan: 'customer',
  },
  showcase_achievements: {
    title: 'Curate your trophy shelf',
    body: 'Pro Members choose which discovered achievements appear on their public profile.',
    cta: 'Pro Member',
    plan: 'customer',
  },
};

export function isHintDismissed(key) {
  try {
    return localStorage.getItem(`${DISMISS_PREFIX}${key}`) === '1';
  } catch {
    return false;
  }
}

export function dismissHint(key) {
  try {
    localStorage.setItem(`${DISMISS_PREFIX}${key}`, '1');
  } catch {
    /* ignore */
  }
}

export function proUpgradePath(plan = 'customer') {
  return plan === 'vendor' ? '/pro-upgrade?type=vendor' : '/pro-upgrade?type=customer';
}