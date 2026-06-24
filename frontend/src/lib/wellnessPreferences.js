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

/**
 * Practitioner specialty options for signup — stored in p_cuisine (DB field).
 * Grouped for optgroup selects; flat list kept for backward compatibility.
 */
export const PRACTITIONER_SPECIALTY_GROUPS = [
  {
    label: 'Energy & bodywork',
    options: [
      'Reiki',
      'Energy healing',
      'Sound healing',
      'Crystal healing',
      'Chakra balancing',
      'Massage therapy',
      'Reflexology',
      'Acupuncture',
    ],
  },
  {
    label: 'Traditional & ancestral healing',
    options: [
      'Curandera',
      'Curandero',
      'Sobadora',
      'Yerbera',
      'Bruja',
      'Curanderismo',
      'Shamanic practitioner',
      'Indigenous healer',
      'Folk healer',
    ],
  },
  {
    label: 'Divination & intuitive arts',
    options: [
      'Psychic medium',
      'Tarot reader',
      'Astrologer',
      'Numerologist',
      'Palm reader',
      'Channeler',
      'Intuitive coach',
    ],
  },
  {
    label: 'Herbal & apothecary',
    options: [
      'Herbalism',
      'Herbalist',
      'Apothecary goods',
      'Aromatherapy',
      'Homeopathy',
      'Naturopathy',
      'Flower essences',
    ],
  },
  {
    label: 'Holistic & Eastern traditions',
    options: [
      'Ayurveda',
      'Traditional Chinese Medicine',
      'Yoga therapy',
      'Meditation guide',
      'Breathwork facilitator',
    ],
  },
  {
    label: 'Spiritual & ritual',
    options: [
      'Ritual facilitator',
      'Ceremony guide',
      'Spiritual coach',
      'Past-life regression',
      'Hypnotherapy (wellness)',
    ],
  },
];

/** Flat list for legacy consumers — includes "Other" for free-text entry. */
export const PRACTITIONER_SPECIALTY_OPTIONS = [
  ...PRACTITIONER_SPECIALTY_GROUPS.flatMap((g) => g.options),
  'Other',
];