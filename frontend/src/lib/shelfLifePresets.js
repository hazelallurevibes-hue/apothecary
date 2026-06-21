/** Shelf-life guidance — vendor picks a preset; good-by auto-calculates from harvest date. */

export const STORAGE_METHODS = [
  { id: 'refrigerator', label: 'Refrigerator (35–40°F)' },
  { id: 'counter', label: 'Room temperature / counter' },
  { id: 'root_cellar', label: 'Root cellar / cool dark storage' },
  { id: 'freezer', label: 'Freezer' },
  { id: 'pantry', label: 'Pantry / dry storage' },
  { id: 'outdoor_shade', label: 'Outdoor shade (plants)' },
  { id: 'custom', label: 'Custom — describe below' },
];

export const SHELF_LIFE_PRESETS = [
  { id: 'eggs_fridge', label: 'Eggs — refrigerator', days: 14, storage: 'refrigerator', hint: 'Typically ~2 weeks refrigerated. Room temp shortens shelf life.' },
  { id: 'eggs_counter', label: 'Eggs — room temperature', days: 7, storage: 'counter', hint: 'Best within ~1 week unrefrigerated. Disclose if unwashed/farm-fresh.' },
  { id: 'milk_fridge', label: 'Dairy / milk', days: 7, storage: 'refrigerator', hint: '~5–7 days after opening or per package date.' },
  { id: 'berries_fridge', label: 'Berries & soft fruit', days: 5, storage: 'refrigerator', hint: 'Very perishable — 3–5 days refrigerated.' },
  { id: 'leafy_greens', label: 'Leafy greens', days: 5, storage: 'refrigerator', hint: '3–7 days; wash just before use.' },
  { id: 'tomatoes_counter', label: 'Tomatoes — counter ripening', days: 7, storage: 'counter', hint: 'Ripen on counter; refrigerate only if fully ripe.' },
  { id: 'root_veg_cellar', label: 'Root vegetables', days: 21, storage: 'root_cellar', hint: 'Carrots, potatoes, beets — weeks in cool storage.' },
  { id: 'honey_pantry', label: 'Honey & preserves', days: 365, storage: 'pantry', hint: 'Honey keeps indefinitely; jams vary by recipe.' },
  { id: 'meat_fridge', label: 'Fresh meat / poultry', days: 3, storage: 'refrigerator', hint: '1–3 days raw in fridge; freeze if not sold quickly.' },
  { id: 'baked_goods', label: 'Baked goods', days: 5, storage: 'counter', hint: '2–5 days; freeze for longer.' },
  { id: 'plants_live', label: 'Live plants / seedlings', days: null, storage: 'outdoor_shade', hint: 'No fixed expiry — note care instructions.' },
  { id: 'trees_bare_root', label: 'Trees — bare root / dormant', days: 14, storage: 'outdoor_shade', hint: 'Plant within ~2 weeks; keep roots moist.' },
  { id: 'microgreens', label: 'Microgreens', days: 5, storage: 'refrigerator', hint: 'Best within ~5 days refrigerated; disclose growing medium.' },
  { id: 'fungi_fridge', label: 'Fungi & mushrooms', days: 7, storage: 'refrigerator', hint: 'Typically 5–10 days refrigerated; identify species clearly.' },
  { id: 'clones_live', label: 'Plant clones / cuttings', days: null, storage: 'outdoor_shade', hint: 'Keep moist; plant or root promptly. Note variety and care.' },
  { id: 'spores_dry', label: 'Spores & spawn (dry)', days: 90, storage: 'pantry', hint: 'Store cool and dry; disclose species and intended use.' },
  { id: 'custom', label: 'Custom — set good-by manually', days: null, storage: 'custom', hint: 'Enter harvest, good-by, and storage notes yourself.' },
];

const presetById = Object.fromEntries(SHELF_LIFE_PRESETS.map((p) => [p.id, p]));

export function getShelfLifePreset(id) {
  return presetById[id] || null;
}

export function addDaysToDate(isoDate, days) {
  if (!isoDate || days == null) return '';
  const d = new Date(isoDate + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function suggestGoodByDate(harvestDate, presetId) {
  const preset = getShelfLifePreset(presetId);
  if (!preset || preset.days == null || !harvestDate) return '';
  return addDaysToDate(harvestDate, preset.days);
}

export function buildFreshnessPayload({
  harvest_date,
  good_by_date,
  storage_method,
  storage_notes,
  shelf_life_preset,
  listing_section,
}) {
  return {
    harvest_date: harvest_date || null,
    good_by_date: good_by_date || null,
    storage_method: storage_method || 'refrigerator',
    storage_notes: storage_notes || null,
    shelf_life_preset: shelf_life_preset || null,
    listing_section: listing_section || 'produce',
  };
}

export function buildPreorderPayload({ is_preorder, preorder_available_date, preorder_max_qty }) {
  return {
    is_preorder: !!is_preorder,
    preorder_available_date: is_preorder && preorder_available_date ? preorder_available_date : null,
    preorder_max_qty: is_preorder && preorder_max_qty ? Number(preorder_max_qty) : null,
  };
}