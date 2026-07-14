/** USDA/FDA-style minimum internal temps (°F) for vendor self-certification. */
import {
  getFoodCategory,
  requiresCookingTemp,
  MIN_SAFE_TEMP_GENERAL_F,
  MIN_SAFE_TEMP_POULTRY_F,
} from './foodCategories';

export { MIN_SAFE_TEMP_GENERAL_F, MIN_SAFE_TEMP_POULTRY_F };

export { requiresCookingTemp };

export function minTempForCategory(foodCategory) {
  const cat = getFoodCategory(foodCategory);
  if (cat.group !== 'cooked') return null;
  return cat.minTemp ?? MIN_SAFE_TEMP_GENERAL_F;
}

export function computeSafetyVerified(item) {
  if (!item || item.safety_opt_out) return false;
  const category = item.food_category || 'general';
  if (!requiresCookingTemp(category)) {
    return !!item.safety_practices_certified;
  }
  const temp = Number(item.finish_temp_f);
  if (!temp || Number.isNaN(temp)) return !!item.safety_practices_certified;
  return temp >= minTempForCategory(category);
}

/** Bpicius food-safety columns — not used on Hazel Allure apothecary listings. */
export const BPICIUS_SAFETY_COLUMNS = [
  'finish_temp_f',
  'safety_opt_out',
  'food_category',
  'safety_verified',
  'safety_practices_certified',
  'temp_photo_url',
];

/** Client-only / wrong-schema keys that break PostgREST inserts if sent. */
export const INVALID_LISTING_COLUMNS = [
  'available', // schema uses availability TEXT, not available boolean
  'thumbnail',
  'medicinalLegalAck',
  'quick',
  'file',
  'preview',
];

/** Listing safety is covered by VendorListingConfirmModal attestations — no per-listing food-safety form. */
export function isSafetySubmissionValid() {
  return true;
}

/** Returns {} so inserts/updates never reference optional Bpicius safety columns. */
export function buildSafetyPayload() {
  return {};
}

export function stripBpiciusListingFields(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const next = { ...payload };
  for (const key of BPICIUS_SAFETY_COLUMNS) delete next[key];
  for (const key of INVALID_LISTING_COLUMNS) delete next[key];
  // Map legacy boolean "available" → schema column "availability"
  if (payload.available != null && next.availability == null) {
    next.availability =
      payload.available === 0 || payload.available === false || payload.available === '0'
        ? 'Out of stock'
        : 'In stock';
  }
  if (next.fulfillment_mode === 'bpicius' || next.fulfillment_mode === 'hazelallure') {
    next.fulfillment_mode = 'pickup_and_shipping';
  }
  return next;
}

export function getSafetyDisplay(item) {
  if (!item) return { status: 'unknown', label: 'Safety info unavailable', detail: '' };

  const practices = !!item.safety_practices_certified;
  const category = item.food_category || 'general';
  const needsTemp = requiresCookingTemp(category);
  const tempOk = !item.safety_opt_out && (item.safety_verified || computeSafetyVerified(item));

  if (practices && tempOk && needsTemp && item.finish_temp_f) {
    return {
      status: 'verified',
      label: 'Vendor-certified safe',
      detail: `Vendor attests acceptable safety practices. Finished at ${item.finish_temp_f}°F (meets ${minTempForCategory(category)}°F minimum). Hazel Allure does not independently verify.`,
    };
  }

  if (practices && !needsTemp && !item.safety_opt_out) {
    return {
      status: 'verified',
      label: 'Vendor-certified safe',
      detail: `Vendor self-certifies acceptable practices for ${getFoodCategory(category).label.replace(/\s*\(.*\)$/, '')}. No cook-step temperature applies. Hazel Allure does not independently verify.`,
    };
  }

  if (practices && !item.safety_opt_out) {
    return {
      status: 'verified',
      label: 'Vendor-certified safe',
      detail: 'Vendor self-certifies acceptable food safety practices for this listing. Hazel Allure does not independently verify.',
    };
  }

  if (item.safety_opt_out && !practices) {
    return {
      status: 'unverified',
      label: 'Not verified as safe',
      detail: 'Vendor opted out of safety certification for this listing.',
    };
  }

  if (tempOk && needsTemp && item.finish_temp_f) {
    const photoNote = item.temp_photo_url ? ' Thermometer photo on file.' : '';
    return {
      status: 'verified',
      label: 'Temperature verified',
      detail: `Finished at ${item.finish_temp_f}°F (meets ${minTempForCategory(category)}°F minimum). Vendor practices not separately certified.${photoNote}`,
    };
  }

  return {
    status: 'unverified',
    label: 'Not verified as safe',
    detail: 'No vendor safety certification or qualifying temperature was recorded.',
  };
}