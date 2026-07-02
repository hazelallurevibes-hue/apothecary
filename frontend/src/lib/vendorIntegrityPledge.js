/** Practitioner integrity & honor pledge — signup and onboarding. */

export const INTEGRITY_VERSION = '2026-07';

export const VENDOR_INTEGRITY_ATTESTATIONS = [
  { id: 'honest', label: 'I will be honest in every listing, message, price, ingredient disclosure, and representation of my services and goods.' },
  { id: 'no_fraud', label: 'I will not commit fraud, deception, bait-and-switch, or any scheme to mislead seekers for financial gain.' },
  { id: 'no_snake_oil', label: 'I will not sell "snake oil" — false cures, fabricated miracles, or unsubstantiated claims I know to be misleading.' },
  { id: 'no_ill_intent', label: 'I will not act with ill intent or knowingly harm seekers emotionally, physically, spiritually, or financially.' },
  { id: 'no_poison', label: 'I will not offer poison, toxins, adulterated goods, or dangerous substances misrepresented as safe wellness products.' },
  { id: 'no_lies', label: 'I will not lie about my credentials, experience, results, sourcing, or what a seeker will receive.' },
  { id: 'no_cheat_steal', label: 'I will not cheat, steal, skim payments, or take property that is not mine.' },
  { id: 'no_infringement', label: 'I will not infringe copyrights, trademarks, trade secrets, or other intellectual property.' },
  { id: 'highest_standard', label: 'I hold myself to the highest standards of quality, safety, and integrity — on and off this platform.' },
  { id: 'honor_conduct', label: 'I will carry myself with honor in how I treat seekers, peers, and the Hazel Allure community.' },
  { id: 'lawful', label: 'I will comply with all applicable local, state, federal, and international laws where I operate.' },
  { id: 'no_impersonation', label: 'I will not impersonate another person, practitioner, or brand.' },
  { id: 'no_review_fraud', label: 'I will not manipulate reviews, ratings, referrals, or platform metrics through fake accounts or coercion.' },
  { id: 'authorities', label: 'I understand that credible violations may be reported to local law enforcement, regulatory agencies, and consumer or business bureaus (e.g., BBB, FTC, state attorney general), and that Hazel Allure may cooperate with investigations.' },
  { id: 'enforcement', label: 'I understand violations may result in immediate removal, permanent ban, forfeiture of platform access, and referral to authorities without refund of fees paid to the platform.' },
];

export function emptyIntegrityState() {
  return Object.fromEntries(VENDOR_INTEGRITY_ATTESTATIONS.map((a) => [a.id, false]));
}

export function allIntegrityChecked(state) {
  return VENDOR_INTEGRITY_ATTESTATIONS.every((a) => state[a.id]);
}