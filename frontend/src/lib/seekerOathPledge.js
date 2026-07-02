/** Seeker oath — customer signup attestation */

export const SEEKER_OATH_VERSION = '2026-07';

export const SEEKER_OATH_ATTESTATIONS = [
  { id: 'entertainment', label: 'I understand readings, tarot, streaks, familiars, and oracle features are entertainment only — not medical, legal, financial, or professional advice.' },
  { id: 'due_diligence', label: 'I will perform my own due diligence on practitioners, goods, and services before booking or purchasing.' },
  { id: 'respect', label: 'I will treat practitioners, artisans, and fellow seekers with respect in messages, reviews, and The Hearth.' },
  { id: 'no_harassment', label: 'I will not harass, bully, threaten, or post hate speech — zero tolerance applies.' },
  { id: 'lawful', label: 'I will use the platform lawfully and not attempt fraud, chargeback abuse, or impersonation.' },
  { id: 'assumption_of_risk', label: 'I assume all risks of bookings and purchases; Hazel Allure is a neutral platform, not a guarantor of outcomes.' },
];

export function emptySeekerOathState() {
  return Object.fromEntries(SEEKER_OATH_ATTESTATIONS.map((a) => [a.id, false]));
}

export function allSeekerOathChecked(state) {
  return SEEKER_OATH_ATTESTATIONS.every((a) => state[a.id]);
}