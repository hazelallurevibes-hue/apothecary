/**
 * Shipping policy / zone engine — restricted destinations, domestic rules.
 * Expandable for international + sanctions lists later.
 */

/** US territories / APO treated as restricted or special. */
export const SPECIAL_US_REGIONS = new Set([
  'AA', 'AE', 'AP', // military
  'AS', 'GU', 'MP', 'PR', 'VI', 'FM', 'MH', 'PW',
]);

export const DEFAULT_POLICY = {
  allowDomesticUs: true,
  allowMilitary: true,
  allowTerritories: true,
  allowInternational: false,
  maxWeightOz: 1120,
  maxLengthIn: 108,
  bannedCountries: ['KP', 'IR', 'SY', 'CU'],
  bannedPostalPrefixes: [], // e.g. high-risk if needed
  notes: {
    domestic: 'Ships within the contiguous US via USPS / UPS / FedEx through Little Shippie.',
    military: 'APO/FPO/DPO allowed with USPS Priority Mail. No PO-box restrictions for USPS.',
    international: 'International not enabled on this storefront — contact maker for quotes.',
    oversized: 'Oversized parcels may require freight or counter drop-off.',
  },
};

/**
 * @returns {{ ok: boolean, code?: string, message?: string, policyNotes: string[] }}
 */
export function evaluateShipPolicy(
  { from = {}, to = {}, parcel = {} } = {},
  policy = DEFAULT_POLICY,
) {
  const notes = [];
  const toCountry = String(to.country || 'US').toUpperCase();
  const fromCountry = String(from.country || 'US').toUpperCase();
  const region = String(to.region || '').toUpperCase();

  if (policy.bannedCountries?.includes(toCountry)) {
    return {
      ok: false,
      code: 'banned_country',
      message: `Shipping to ${toCountry} is not available under platform policy.`,
      policyNotes: notes,
    };
  }

  if (toCountry !== 'US' && toCountry !== 'USA') {
    if (!policy.allowInternational) {
      return {
        ok: false,
        code: 'international_disabled',
        message: policy.notes.international,
        policyNotes: [policy.notes.international],
      };
    }
    notes.push(policy.notes.international);
  } else {
    notes.push(policy.notes.domestic);
    if (SPECIAL_US_REGIONS.has(region)) {
      if (['AA', 'AE', 'AP'].includes(region) && !policy.allowMilitary) {
        return {
          ok: false,
          code: 'military_disabled',
          message: 'Military addresses (APO/FPO) are not enabled for this shop.',
          policyNotes: notes,
        };
      }
      if (!['AA', 'AE', 'AP'].includes(region) && !policy.allowTerritories) {
        return {
          ok: false,
          code: 'territory_disabled',
          message: 'US territories are not enabled for this shop.',
          policyNotes: notes,
        };
      }
      if (['AA', 'AE', 'AP'].includes(region)) notes.push(policy.notes.military);
    }
  }

  if (parcel.weightOz > (policy.maxWeightOz || 1120)) {
    return {
      ok: false,
      code: 'over_weight',
      message: `Package exceeds max weight (${policy.maxWeightOz} oz).`,
      policyNotes: notes,
    };
  }
  if (parcel.oversized) notes.push(policy.notes.oversized);
  if (fromCountry !== toCountry && fromCountry === 'US') {
    notes.push('Cross-border: duties/taxes may apply at destination.');
  }

  return { ok: true, policyNotes: notes };
}
