/** Hazel Allure — healing services (bookable practitioners) */

export const WELLNESS_SERVICE_CATEGORIES = [
  { id: 'psychic', label: 'Psychic & intuitive' },
  { id: 'tarot', label: 'Tarot & oracle' },
  { id: 'mediumship', label: 'Mediumship' },
  { id: 'astrology', label: 'Astrology & numerology' },
  { id: 'reiki', label: 'Reiki & energy healing' },
  { id: 'crystal_healing', label: 'Crystal healing' },
  { id: 'sound_healing', label: 'Sound & drum healing' },
  { id: 'shamanic', label: 'Shamanic practitioner' },
  { id: 'curandera', label: 'Curandera / traditional healer' },
  { id: 'spiritual_healer', label: 'Spiritual healer' },
  { id: 'herbalist', label: 'Herbalist consultation' },
  { id: 'holistic', label: 'Holistic therapy' },
  { id: 'massage', label: 'Massage & bodywork' },
  { id: 'acupuncture', label: 'Acupuncture & acupressure' },
  { id: 'ayurveda', label: 'Ayurveda' },
  { id: 'yoga', label: 'Yoga & meditation' },
  { id: 'breathwork', label: 'Breathwork' },
  { id: 'qigong', label: 'Tai chi & qigong' },
  { id: 'reflexology', label: 'Reflexology' },
  { id: 'esthetician', label: 'Holistic esthetician' },
  { id: 'therapist', label: 'Wellness therapist' },
  { id: 'counselor', label: 'Spiritual counselor' },
  { id: 'chakra', label: 'Chakra balancing' },
  { id: 'other_service', label: 'Other healing service' },
];

/** Hazel Allure — physical & ritual products */

export const WELLNESS_PRODUCT_CATEGORIES = [
  { id: 'essential_oils', label: 'Essential oils' },
  { id: 'perfumes_oils', label: 'Perfumes & anointing oils' },
  { id: 'incense', label: 'Incense & smudge' },
  { id: 'candles', label: 'Candles & ritual lights' },
  { id: 'potions', label: 'Potions, elixirs & tinctures' },
  { id: 'apothecary', label: 'Apothecary & herbs' },
  { id: 'teas', label: 'Teas & tonics' },
  { id: 'crystals', label: 'Crystals & stones' },
  { id: 'jewelry', label: 'Ritual jewelry' },
  { id: 'skincare', label: 'Natural skincare' },
  { id: 'bath', label: 'Bath & body' },
  { id: 'oracle_decks', label: 'Oracle & tarot decks' },
  { id: 'books', label: 'Books & guides' },
  { id: 'ritual_kits', label: 'Ritual kits' },
  { id: 'other_product', label: 'Other goods' },
];

/** Worldwide practitioner titles — for vendor signup & search hints */
export const CULTURAL_PRACTITIONER_HINTS = [
  'Curandera / Curandero',
  'Sangoma',
  'Babalawo',
  'Kahuna',
  'Nganga',
  'Hijama practitioner',
  'Unani healer',
  'Traditional Chinese Medicine',
  'Ayurvedic vaidya',
  'Reiki master',
  'Energy worker',
];

export function getServiceCategoryLabel(id) {
  return WELLNESS_SERVICE_CATEGORIES.find((c) => c.id === id)?.label || id || 'Other';
}

export function getProductCategoryLabel(id) {
  return WELLNESS_PRODUCT_CATEGORIES.find((c) => c.id === id)?.label || id || 'Other';
}

// Drop-in replacements for Hazel Allure category imports in this fork
export const MARKETPLACE_MENU_CATEGORIES = WELLNESS_SERVICE_CATEGORIES.map((c) => ({
  id: c.id,
  label: c.label,
}));

export function getMarketplaceCategoryLabel(id) {
  return getServiceCategoryLabel(id);
}