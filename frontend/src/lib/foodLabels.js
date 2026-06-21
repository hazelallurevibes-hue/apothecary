export function buildFoodLabelPayload(fields) {
  const f = fields || {};
  return {
    label_ingredients: (f.label_ingredients || '').trim() || null,
    label_serving_size: (f.label_serving_size || '').trim() || null,
    label_calories: (f.label_calories || '').trim() || null,
    label_allergen_statement: (f.label_allergen_statement || '').trim() || null,
    label_notes: (f.label_notes || '').trim() || null,
  };
}

export function parseFoodLabelFromItem(item) {
  if (!item) return {};
  return {
    label_ingredients: item.label_ingredients || '',
    label_serving_size: item.label_serving_size || '',
    label_calories: item.label_calories || '',
    label_allergen_statement: item.label_allergen_statement || '',
    label_notes: item.label_notes || '',
  };
}

export function hasFoodLabel(item) {
  return !!(
    item?.label_ingredients ||
    item?.label_serving_size ||
    item?.label_calories ||
    item?.label_allergen_statement
  );
}