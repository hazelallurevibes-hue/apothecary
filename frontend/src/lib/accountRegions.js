/** Region of the signed-up person — not a worldwide blanket ban list. */

export const ACCOUNT_REGIONS = [
  { id: 'US', label: 'United States', consent: 'choice' },
  { id: 'CA', label: 'Canada', consent: 'opt_in' },
  { id: 'MX', label: 'Mexico', consent: 'choice' },
  { id: 'EU', label: 'European Union / EEA', consent: 'opt_in' },
  { id: 'UK', label: 'United Kingdom', consent: 'opt_in' },
  { id: 'AU', label: 'Australia', consent: 'choice' },
  { id: 'NZ', label: 'New Zealand', consent: 'choice' },
  { id: 'OTHER', label: 'Another country / region', consent: 'opt_in' },
];

export function normalizeRegion(id) {
  const hit = ACCOUNT_REGIONS.find((r) => r.id === String(id || '').toUpperCase());
  return hit?.id || 'US';
}

export function regionMeta(id) {
  const code = normalizeRegion(id);
  return ACCOUNT_REGIONS.find((r) => r.id === code) || ACCOUNT_REGIONS[0];
}

/**
 * What this platform allows *this account* to do.
 * Platform-wide: no disease-treatment claims, not medical care.
 * Region extras differ (withdrawal rights, VAT, CBD, cookies).
 */
export function regionPolicy(id) {
  const code = normalizeRegion(id);
  const euLike = code === 'EU' || code === 'UK';
  return {
    code,
    label: regionMeta(code).label,
    consent: regionMeta(code).consent,
    analyticsRequiresOptIn: regionMeta(code).consent === 'opt_in',
    platformIsUsCompany: true,
    euVatRegistered: false,
    iossReady: false,
    formationComplete: false,
    distanceSellingWithdrawalDays: euLike ? 14 : 0,
    vendorResponsibleForLocalTax: true,
    diseaseTreatmentClaims: false,
    stopPrescribedMedsClaims: false,
    cbdHemp: code === 'EU' ? 'restricted' : code === 'UK' ? 'restricted' : 'vendor_attestation',
    cosmeticsHealthClaims: euLike ? 'restricted' : 'vendor_attestation',
    psychicAsEntertainment: true,
    cookieNoticeRequired: true,
    doNotSellOffered: code === 'US' || code === 'CA',
    dsaNotice: code === 'EU',
    notes: notesFor(code, euLike),
  };
}

function notesFor(code, euLike) {
  const notes = [
    'Hazel Allure LLC is a New Mexico, USA company. Formation papers and a business checking account are still in progress — we do not yet collect EU VAT as a marketplace, issue EORI, or run IOSS.',
    'You are responsible for licenses, labeling, and tax in the place you sell from and sell into.',
    'The platform is not medical care. Do not claim to diagnose, treat, or cure disease.',
  ];
  if (euLike) {
    notes.push(
      'EU/UK: consumer goods usually have a 14-day withdrawal right except custom-made or sealed hygiene/cosmetic goods once opened. Digital content can lose withdrawal if the buyer consents to immediate supply.',
      'EU/UK: health claims on cosmetics/food supplements are tightly limited. CBD/hemp may be novel-food or otherwise restricted — do not list those SKUs unless you can legally place them on the EU/UK market.',
      'EU: Digital Services Act — illegal content can be reported; we act on valid notices.',
    );
  }
  if (code === 'US') {
    notes.push(
      'US: cosmetics and dietary-supplement claims follow FDA rules (no unapproved drug claims). You may request that we not sell or share personal information for ads — we do not sell it.',
    );
  }
  if (code === 'CA') {
    notes.push('Canada: CASL applies to email/SMS. PIPEDA/provincial privacy laws apply to personal information.');
  }
  return notes;
}

export function listingFlagsForRegion(id) {
  const p = regionPolicy(id);
  return [
    { id: 'no_disease', ok: !p.diseaseTreatmentClaims, label: 'No diagnose / treat / cure disease claims' },
    { id: 'cbd', ok: p.cbdHemp !== 'restricted', label: p.cbdHemp === 'restricted' ? 'CBD/hemp listings blocked in your region' : 'CBD/hemp only with your own legal basis' },
    { id: 'cosmetics', ok: p.cosmeticsHealthClaims !== 'restricted', label: p.cosmeticsHealthClaims === 'restricted' ? 'No medicinal claims on cosmetics' : 'Cosmetic claims must match your local rules' },
    { id: 'sessions', ok: p.psychicAsEntertainment, label: 'Sessions are spiritual/educational, not licensed healthcare' },
  ];
}
