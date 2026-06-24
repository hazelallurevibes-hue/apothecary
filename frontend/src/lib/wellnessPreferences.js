/** Wellness lifestyle & avoidance options — DB fields remain diet_type, disliked_foods, etc. */

export const WELLNESS_LIFESTYLE_OPTIONS = [
  { id: 'none', label: 'No specific lifestyle' },
  { id: 'vegan', label: 'Vegan', filterTag: 'vegan' },
  { id: 'plant_based', label: 'Plant-based', filterTag: 'plant-based' },
  { id: 'organic_only', label: 'Organic-only', filterTag: 'organic' },
  { id: 'fragrance_free', label: 'Fragrance-free', filterTag: 'fragrance-free' },
  { id: 'alcohol_free_remedies', label: 'Alcohol-free remedies', filterTag: 'alcohol-free' },
  { id: 'gluten_free', label: 'Gluten-free', filterTag: 'gluten-free' },
  { id: 'cruelty_free', label: 'Cruelty-free', filterTag: 'cruelty-free' },
  { id: 'synthetic_free', label: 'Synthetic-free / minimal additives', filterTag: 'synthetic-free' },
  { id: 'other', label: 'Other (describe in notes)' },
];

/** Marketplace filter options derived from lifestyle choices (excludes none/other). */
export const WELLNESS_MARKET_FILTERS = WELLNESS_LIFESTYLE_OPTIONS.filter(
  (o) => o.id !== 'none' && o.id !== 'other',
).map((o) => ({
  id: o.filterTag || o.id,
  label: o.label,
}));

/** Common botanicals & ingredients seekers may wish to avoid — suggestions only. */
export const WELLNESS_AVOID_OPTIONS = [
  'Lavender',
  'Peppermint',
  'Eucalyptus',
  'Tea tree',
  'Sage',
  'Cedar',
  'Frankincense',
  'Myrrh',
  'Rose',
  'Citrus oils',
  'Menthol',
  'Camphor',
  'Witch hazel',
  'Alcohol tinctures',
  'Beeswax',
  'Lanolin',
  'Synthetic fragrance',
  'Parabens',
  'Sulfates',
  'Essential oil blends',
];

/** Practitioner specialty options for signup — stored in p_cuisine (DB field). */
export const PRACTITIONER_SPECIALTY_OPTIONS = [
  'Reiki',
  'Herbalism',
  'Curanderismo',
  'Homeopathy',
  'Apothecary goods',
  'Energy healing',
  'Ayurveda',
  'Traditional Chinese Medicine',
  'Naturopathy',
  'Crystal healing',
  'Sound healing',
  'Aromatherapy',
  'Other',
];