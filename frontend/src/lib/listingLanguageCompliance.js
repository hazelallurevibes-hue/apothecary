/** FDA-aware listing language — structure/function vs disease claims (21 CFR, DSHEA). */

export const BANNED_DISEASE_CLAIM_HINTS = [
  'cure', 'treat', 'heal', 'diagnose', 'prevent disease', 'miracle', 'FDA-approved',
];

export const LISTING_LANGUAGE_DISCLAIMER = {
  title: 'Word nerds from the compliance cottage say…',
  body:
    'The FDA gets grumpy when listings sound like medicine — words like cure, treat, heal (as in fix a disease), diagnose, or prevent [specific illness] can cross the line unless you are licensed and allowed to say that. Hazel Allure is a wellness & spiritual support platform, not your doctor, not your regulator, and definitely not your lawyer.',
  punchline:
    'We call these Wellness Services on purpose. Describe sessions as supportive, educational, spiritual, or structure/function wellness — save the miracle-cure energy for your journal. (We still love you.)',
  productNote:
    'For apothecary goods: structure/function language is fine; disease claims are not. Example OK: "supports calm focus." Example not OK: "cures anxiety disorder."',
};

export function listingCopyLooksRisky(text = '') {
  const lower = text.toLowerCase();
  return BANNED_DISEASE_CLAIM_HINTS.some((w) => lower.includes(w));
}