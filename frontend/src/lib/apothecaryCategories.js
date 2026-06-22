/** Hazel Allure — apothecary & ritual product categories. */

import { WELLNESS_PRODUCT_CATEGORIES, getProductCategoryLabel } from './wellnessCategories';

const CATEGORY_EMOJI = {
  essential_oils: '🌸',
  perfumes_oils: '✨',
  incense: '🪔',
  candles: '🕯️',
  potions: '🧪',
  apothecary: '🌿',
  teas: '🍵',
  crystals: '💎',
  jewelry: '📿',
  skincare: '🧴',
  bath: '🛁',
  oracle_decks: '🃏',
  books: '📖',
  ritual_kits: '🔮',
  other_product: '🏷️',
};

const LEGAL_ACK_IDS = new Set(['potions', 'apothecary']);

export const APOTHECARY_LISTING_CATEGORIES = WELLNESS_PRODUCT_CATEGORIES.map((c) => ({
  ...c,
  requiresLegalAck: LEGAL_ACK_IDS.has(c.id),
}));

/** @deprecated internal DB name — use APOTHECARY_LISTING_CATEGORIES */
export const PRODUCE_LISTING_CATEGORIES = APOTHECARY_LISTING_CATEGORIES;

export const PLANT_LISTING_CATEGORIES = [];

export function allApothecaryCategories() {
  return [...WELLNESS_PRODUCT_CATEGORIES].sort((a, b) => a.label.localeCompare(b.label));
}

export function isMedicinalCategory(categoryId) {
  return LEGAL_ACK_IDS.has(categoryId);
}

export function categoryRequiresLegalAck(categoryId) {
  return isMedicinalCategory(categoryId);
}

export function getApothecaryCategoryLabel(id) {
  return getProductCategoryLabel(id);
}

export function getPlantCategoryLabel(id) {
  return getProductCategoryLabel(id);
}

export function getProduceCategoryLabel(id) {
  return getProductCategoryLabel(id);
}

export function getCategoryEmoji(categoryId) {
  return CATEGORY_EMOJI[categoryId] || null;
}

export function getCategoryDisplay(categoryId) {
  const label = getApothecaryCategoryLabel(categoryId);
  const emoji = getCategoryEmoji(categoryId) || '🏷️';
  return { label, emoji };
}

export function isPlantOrSpecialtyListing() {
  return false;
}