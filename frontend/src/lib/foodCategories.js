/** Food types for marketplace menu & farmers market safety attestation. */

export const MIN_SAFE_TEMP_GENERAL_F = 135;
export const MIN_SAFE_TEMP_POULTRY_F = 165;

export const FOOD_CATEGORY_GROUPS = {
  cooked: 'Cooked — finish temperature required',
  uncooked: 'Not cooked / no finish temperature',
};

export const FOOD_CATEGORIES = [
  { id: 'general', label: `General cooked food (${MIN_SAFE_TEMP_GENERAL_F}°F+)`, group: 'cooked', minTemp: MIN_SAFE_TEMP_GENERAL_F },
  { id: 'poultry', label: `Poultry cooked (${MIN_SAFE_TEMP_POULTRY_F}°F+)`, group: 'cooked', minTemp: MIN_SAFE_TEMP_POULTRY_F },
  { id: 'seafood_cooked', label: `Seafood cooked (${MIN_SAFE_TEMP_GENERAL_F}°F+)`, group: 'cooked', minTemp: MIN_SAFE_TEMP_GENERAL_F },
  { id: 'raw_fresh', label: 'Raw / fresh (uncooked produce, salads)', group: 'uncooked' },
  { id: 'jerky', label: 'Jerky & dried meats', group: 'uncooked' },
  { id: 'sushi', label: 'Sushi & raw fish (where legal)', group: 'uncooked' },
  { id: 'pre_cooked', label: 'Pre-cooked / ready-to-eat meals', group: 'uncooked' },
  { id: 'canned', label: 'Canned & jarred goods', group: 'uncooked' },
  { id: 'salt_preserved', label: 'Salt preserved', group: 'uncooked' },
  { id: 'cured', label: 'Cured meats & charcuterie', group: 'uncooked' },
  { id: 'sundried', label: 'Sun-dried', group: 'uncooked' },
  { id: 'dehydrated', label: 'Dehydrated', group: 'uncooked' },
  { id: 'fermented', label: 'Fermented (kimchi, kombucha, etc.)', group: 'uncooked' },
  { id: 'smoked_ready', label: 'Smoked (ready to eat)', group: 'uncooked' },
  { id: 'baked_shelf_stable', label: 'Baked goods (shelf-stable)', group: 'uncooked' },
  { id: 'frozen_raw', label: 'Frozen raw (not heated for sale)', group: 'uncooked' },
  { id: 'pickled', label: 'Pickled & brined', group: 'uncooked' },
  { id: 'honey_preserves', label: 'Honey, jams & preserves', group: 'uncooked' },
];

const byId = Object.fromEntries(FOOD_CATEGORIES.map((c) => [c.id, c]));

export function getFoodCategory(id) {
  return byId[id] || byId.general;
}

export function requiresCookingTemp(foodCategory) {
  return getFoodCategory(foodCategory).group === 'cooked';
}

export function defaultFoodCategoryForContext(context) {
  return context === 'produce' ? 'raw_fresh' : 'general';
}

export function getFoodCategoryLabel(id) {
  return getFoodCategory(id).label;
}