/** Required vendor attestations before each listing is published. */

export const VENDOR_LISTING_ATTESTATIONS = [
  {
    id: 'practices',
    label: 'I certify this item was prepared, stored, and offered following all applicable food and beverage safety standards described in the Policies & Procedures, including proper hygiene, cross-contamination prevention, allergen disclosure, and safe holding temperatures where applicable.',
  },
  {
    id: 'operating',
    label: 'I accept the Hazel Allure Vendor Operating Agreement. I assume full legal and financial liability for every product I sell, including illness, injury, property damage, or regulatory violations arising from my goods or services.',
  },
  {
    id: 'prohibited',
    label: 'I confirm this listing does not offer prohibited items: illegal drugs or controlled substances, alcohol (unless I hold all required licenses and local law permits sale), tobacco or nicotine products where restricted, weapons, stolen goods, or any other illicit or unlawful merchandise.',
  },
  {
    id: 'ban',
    label: 'I understand Hazel Allure does not inspect, test, or verify my products. Failure to maintain the highest standards of food safety, honesty in labeling, or compliance with law may result in immediate removal of listings and permanent account ban.',
  },
  {
    id: 'policies',
    label: 'I have read and agree to the Terms of Service, FAQ, Policies & Procedures, and all posted agreements. I will perform my own due diligence and maintain all required permits, licenses, and insurance.',
  },
];

export function emptyAttestationState() {
  return Object.fromEntries(VENDOR_LISTING_ATTESTATIONS.map((a) => [a.id, false]));
}

export function allAttestationsChecked(state) {
  return VENDOR_LISTING_ATTESTATIONS.every((a) => state[a.id]);
}