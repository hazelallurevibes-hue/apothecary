/** Natural remedies research library — educational only, not medical advice. */
import catalog from './catalog.json';

export const REMEDY_DISCLAIMER_SHORT =
  catalog.disclaimer ||
  'Educational research only — not medical advice. Seek licensed care for health concerns.';

export const REMEDY_DISCLAIMER_LONG = [
  'This library is for research and educational purposes only. It is not medical advice, diagnosis, treatment, or a substitute for care from a licensed physician, nurse practitioner, physician assistant, pharmacist, or emergency services.',
  'If you are experiencing a medical emergency (chest pain, trouble breathing, stroke signs, severe bleeding, thoughts of self-harm, severe allergic reaction), stop reading and call emergency services immediately.',
  'Traditional remedies, herbs, essential oils, and supplements can cause side effects, allergies, and dangerous interactions with medications. Pregnant people, nursing parents, children, and people with chronic illness need clinician guidance before trying any remedy.',
  'Hospital and clinical care descriptions are general educational summaries of common pathways — not instructions for self-treatment. Success stories and historical notes are anecdotal and cultural, not clinical evidence of cure.',
  'Hazel Allure LLC and independent marketplace practitioners are not responsible for outcomes from information on these pages. Use at your own risk.',
];

const bySlug = new Map((catalog.entries || []).map((e) => [e.slug, e]));

export function getAllRemedies() {
  return catalog.entries || [];
}

export function getRemedyCount() {
  return catalog.count || getAllRemedies().length;
}

export function getHotRemedies() {
  return getAllRemedies().filter((e) => e.hot);
}

export function getFreeRemedies() {
  return getAllRemedies().filter((e) => !e.hot);
}

export function getRemedyBySlug(slug) {
  if (!slug) return null;
  return bySlug.get(slug) || null;
}

export function getRemedyCategories() {
  const set = new Set(getAllRemedies().map((e) => e.category));
  return [...set].sort();
}

export function searchRemedies(query = '', { category = '', hotOnly = false } = {}) {
  const q = query.trim().toLowerCase();
  return getAllRemedies().filter((e) => {
    if (hotOnly && !e.hot) return false;
    if (category && e.category !== category) return false;
    if (!q) return true;
    const hay = `${e.name} ${e.description} ${e.keywords} ${e.category}`.toLowerCase();
    return hay.includes(q);
  });
}

export function remedySeoFor(entry) {
  if (!entry) return null;
  return {
    title: `${entry.name}: Conventional Care & Traditional Remedies | Hazel Allure`,
    description: entry.description,
    keywords: entry.keywords,
  };
}

/** Sitemap slugs — free topics prioritized for indexing; hot still listed (page shows Pro gate). */
export function getRemedySitemapSlugs() {
  return getAllRemedies().map((e) => e.slug);
}

export const CATEGORY_LABELS = {
  respiratory: 'Respiratory',
  digestive: 'Digestive',
  skin: 'Skin',
  musculoskeletal: 'Muscles & joints',
  'sleep-mood': 'Sleep & mood',
  womens: "Women's wellness",
  mens: "Men's wellness",
  urinary: 'Urinary',
  circulatory: 'Heart & circulation',
  metabolic: 'Metabolic',
  immune: 'Immune & infection education',
  neuro: 'Head & nerves',
  oral: 'Mouth & dental comfort',
  'eye-ear': 'Eyes & ears',
  'ear-nose': 'Ears, nose & throat',
  general: 'General wellness',
};

export function categoryLabel(cat) {
  return CATEGORY_LABELS[cat] || cat;
}
