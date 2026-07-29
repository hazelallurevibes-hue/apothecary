/**
 * Multimodal Learn Library metadata: learning styles, categories, cultural care.
 * Overlay for SEO literature + free-standing path cards. Designed for i18n-friendly keys.
 */

export const LEARN_STYLES = [
  {
    id: 'visual',
    label: 'Visual',
    icon: '👁️',
    short: 'See it',
    description: 'Diagrams, photo checklists, color-coded steps, short video outlines.',
  },
  {
    id: 'auditory',
    label: 'Auditory',
    icon: '🔊',
    short: 'Hear it',
    description: 'Read-aloud scripts, discussion prompts, spoken boundary phrases.',
  },
  {
    id: 'kinesthetic',
    label: 'Kinesthetic',
    icon: '🌿',
    short: 'Do it',
    description: 'Hands-on drills, packing lists, 14-day practice logs, body-based resets.',
  },
  {
    id: 'reading_writing',
    label: 'Read / write',
    icon: '📝',
    short: 'Write it',
    description: 'Journal prompts, checklists, note templates you can translate offline.',
  },
];

export const LEARN_CATEGORIES = [
  { id: 'safety', label: 'Safety & trust', icon: '🛡️' },
  { id: 'shopping', label: 'Shopping wisely', icon: '🛒' },
  { id: 'traditions', label: 'World traditions', icon: '🌍' },
  { id: 'practice', label: 'Daily practice', icon: '✨' },
  { id: 'seller', label: 'For sellers', icon: '🏪' },
  { id: 'sanctum', label: 'Teaching Sanctum', icon: '🎓' },
  { id: 'community', label: 'Community', icon: '🤝' },
];

/** Shared cultural & religious care — shown on every guide + hub */
export const CULTURAL_CARE_PRINCIPLES = [
  {
    id: 'plural',
    title: 'Many paths, equal respect',
    body:
      'No single faith, lineage, or medicine system is treated as universal. Guides use educational language so Christian, Muslim, Jewish, Hindu, Buddhist, Indigenous, secular, and interfaith readers can adapt practices to their own ethics.',
  },
  {
    id: 'consent',
    title: 'Consent over spectacle',
    body:
      'Ritual, plant, and energy practices are invitations — never obligations. Skip any step that conflicts with your religion, culture, family, or local law.',
  },
  {
    id: 'medical',
    title: 'Not medical or legal advice',
    body:
      'Articles support complementary education. Licensed clinicians and local authorities remain primary for health, pregnancy, medication, immigration, and food-safety compliance.',
  },
  {
    id: 'language',
    title: 'Translate the meaning, keep the care',
    body:
      'When you read in another language, keep the safety and consent lines intact. Do not soft-sell health claims. Prefer plain words over jargon that may not travel across cultures.',
  },
  {
    id: 'images',
    title: 'Modesty & imagery choices',
    body:
      'Sellers and seekers may prefer modest photos, non-figurative art, or text-first listings. Use the photo adjust tools (crop, solid backgrounds including white and black) so storefronts fit your community norms.',
  },
];

/**
 * Per-slug enrichment. Missing slugs still get defaults via enrichArticle.
 */
const SLUG_META = {
  'holistic-wellness-basics': {
    category: 'safety',
    styles: ['reading_writing', 'visual', 'kinesthetic'],
    level: 'beginner',
    audience: 'seeker',
    modalities: {
      visual: 'Sketch a one-page “intent + boundary + clinician” card before you book.',
      auditory: 'Practice saying your cancellation and privacy questions out loud once.',
      kinesthetic: 'Complete the 14-day practice log with one change only in week one.',
    },
    culturalNote:
      'Healing words mean different things worldwide. Prefer “support” and “education” over cure claims in every language.',
  },
  'natural-apothecary-guide': {
    category: 'shopping',
    styles: ['visual', 'reading_writing', 'kinesthetic'],
    level: 'beginner',
    audience: 'both',
    modalities: {
      visual: 'Photograph labels in natural light; compare ingredient lists side by side.',
      auditory: 'Ask makers three spoken questions: intended use, allergens, restock time.',
      kinesthetic: 'Open one product fully — smell, texture, packaging — before bulk buying.',
    },
    culturalNote:
      'Plant traditions are not interchangeable. Honor local harvest ethics and never treat sacred plants as trends.',
  },
  'worldwide-wellness-traditions': {
    category: 'traditions',
    styles: ['reading_writing', 'auditory', 'visual'],
    level: 'intermediate',
    audience: 'both',
    modalities: {
      visual: 'Map traditions on a simple “origin / practice / not medical” table.',
      auditory: 'Listen for lineage language — who taught the practitioner, and what is out of scope.',
      kinesthetic: 'If invited to a cultural practice, follow host etiquette first; never record without consent.',
    },
    culturalNote:
      'Diaspora and Indigenous knowledge are living. Credit sources; avoid costume, appropriation, or forced conversion narratives.',
  },
  'essential-oils-safety': {
    category: 'safety',
    styles: ['visual', 'kinesthetic', 'reading_writing'],
    level: 'beginner',
    audience: 'both',
    modalities: {
      visual: 'Label bottles with dilution ratios using colored stickers.',
      auditory: 'Read patch-test steps aloud before first use.',
      kinesthetic: 'Do a single-oil patch test on inner arm; wait the full window.',
    },
    culturalNote:
      'Scent preferences and religious fragrance rules vary (including prayer spaces). Always offer fragrance-free options when serving mixed communities.',
  },
  'crystal-care-ethics': {
    category: 'traditions',
    styles: ['visual', 'reading_writing'],
    level: 'beginner',
    audience: 'seeker',
    modalities: {
      visual: 'Photograph sourcing notes and care cards with your stones.',
      auditory: 'Discuss ethical mining questions with the seller before buying.',
      kinesthetic: 'Clean storage trays gently; skip salt methods that damage stones.',
    },
    culturalNote:
      'Stones used in ceremony by living cultures deserve extra care. Prefer educational display language over “magical cure” marketing.',
  },
  'first-ritual-kit': {
    category: 'practice',
    styles: ['kinesthetic', 'visual', 'reading_writing'],
    level: 'beginner',
    audience: 'seeker',
    modalities: {
      visual: 'Lay out kit items on a white or black cloth photo for inventory.',
      auditory: 'Record a 60-second intention in your own language, private only.',
      kinesthetic: 'Assemble, use once, then re-pack — learn by handling, not hoarding.',
    },
    culturalNote:
      'Ritual can be prayer, meditation, or secular mindfulness. Adapt tools to your faith; empty space is valid practice.',
  },
  'booking-online-sessions': {
    category: 'shopping',
    styles: ['reading_writing', 'auditory', 'visual'],
    level: 'beginner',
    audience: 'seeker',
    modalities: {
      visual: 'Screenshot booking terms and session length before you pay.',
      auditory: 'Rehearse your “scope of session” question in a calm voice.',
      kinesthetic: 'Test camera, headset, and quiet room 10 minutes early.',
    },
    culturalNote:
      'Time zones, gendered greeting norms, and modest video backgrounds matter. Ask practitioners what they prefer.',
  },
  'herbal-tea-rituals': {
    category: 'practice',
    styles: ['kinesthetic', 'visual', 'auditory'],
    level: 'beginner',
    audience: 'seeker',
    modalities: {
      visual: 'Note color and steam of each brew in a simple photo log.',
      auditory: 'Use a 3-minute timer with a soft chime for steeping silence.',
      kinesthetic: 'Measure leaves by hand scoop once, then refine to taste.',
    },
    culturalNote:
      'Tea ceremonies exist in many cultures with different etiquette. Never claim medicinal cures; check interactions with a clinician if you take medication.',
  },
  'moon-aware-self-care': {
    category: 'practice',
    styles: ['visual', 'reading_writing', 'kinesthetic'],
    level: 'beginner',
    audience: 'seeker',
    modalities: {
      visual: 'Track sleep and mood with simple moon-phase icons (optional).',
      auditory: 'Optional guided breath only — skip if it conflicts with your practice.',
      kinesthetic: 'Pick one body care act (stretch, walk, rest) per phase — not a full ritual stack.',
    },
    culturalNote:
      'Lunar calendars appear in many religions. Use as optional rhythm, not required belief. Islamic, Jewish, and other lunar observances take priority for adherents.',
  },
  'seeker-safety-checklist': {
    category: 'safety',
    styles: ['reading_writing', 'kinesthetic', 'visual'],
    level: 'beginner',
    audience: 'seeker',
    modalities: {
      visual: 'Print or screenshot the red-flag list and pin it near your desk.',
      auditory: 'Share your booking plan with a trusted person when you feel safer doing so.',
      kinesthetic: 'Role-play leaving a session that feels wrong — stand up and exit the chat/call.',
    },
    culturalNote:
      'Safety includes spiritual abuse awareness across all religions. Autonomy beats “loyalty tests” in every tradition.',
  },
  'pro-member-value': {
    category: 'shopping',
    styles: ['visual', 'reading_writing'],
    level: 'beginner',
    audience: 'seeker',
    modalities: {
      visual: 'Compare Free vs Pro rows before checkout.',
      auditory: 'Ask support one clarifying question if pricing is unclear.',
      kinesthetic: 'Try free tools for a week, then reassess with notes.',
    },
    culturalNote:
      'Paid tools are optional. Free accounts can still shop, message, and learn. Cancel anytime in Stripe — no spiritual pressure to upgrade.',
  },
  'practitioner-first-listing': {
    category: 'seller',
    styles: ['kinesthetic', 'visual', 'reading_writing'],
    level: 'beginner',
    audience: 'seller',
    modalities: {
      visual: 'Use photo adjust (white/black backgrounds) for clean, respectful product shots.',
      auditory: 'Record a 20-second listing voice draft, then type the best lines.',
      kinesthetic: 'Post one product end-to-end today — photo, price, ship window, publish.',
    },
    culturalNote:
      'Structure/function language only unless you hold independent clinical credentials. Respect export, alcohol, and religious product rules for your markets.',
  },
  'teaching-sanctum-start': {
    category: 'sanctum',
    styles: ['auditory', 'visual', 'kinesthetic', 'reading_writing'],
    level: 'intermediate',
    audience: 'seller',
    modalities: {
      visual: 'Storyboard lessons with icons for watch / listen / do / write.',
      auditory: 'Offer an audio-only path for learners who prefer no video.',
      kinesthetic: 'Include one homework that uses the hands (blend, stretch, arrange altar space).',
    },
    culturalNote:
      'Courses may include faith-specific content only with clear labeling. Dual pricing and scholarships should not shame free learners.',
  },
  'hearth-community-etiquette': {
    category: 'community',
    styles: ['reading_writing', 'auditory'],
    level: 'beginner',
    audience: 'both',
    modalities: {
      visual: 'Screenshot community guidelines before posting.',
      auditory: 'If debating, restate the other person’s point before replying.',
      kinesthetic: 'Take a five-minute walk before posting when emotions run high.',
    },
    culturalNote:
      'Interfaith dialogue requires curiosity, not conversion. No hate speech; no mocking sacred practices.',
  },
  'allergy-apothecary': {
    category: 'safety',
    styles: ['visual', 'reading_writing', 'kinesthetic'],
    level: 'beginner',
    audience: 'both',
    modalities: {
      visual: 'Highlight allergen lines on labels with a marker in photos for your own notes.',
      auditory: 'Call out allergens aloud when gifting or sharing products.',
      kinesthetic: 'Keep fragrance-free and known-allergen products in separate storage bins.',
    },
    culturalNote:
      'Food and fragrance allergies are medical realities. Never pressure someone to “just try a little” for spiritual reasons.',
  },
  'seasonal-sabbat-shopping': {
    category: 'shopping',
    styles: ['visual', 'kinesthetic'],
    level: 'beginner',
    audience: 'seeker',
    modalities: {
      visual: 'Build a seasonal wishlist board with 3 items max.',
      auditory: 'Talk budget with a partner before holiday buying.',
      kinesthetic: 'Shop one category per week to avoid overwhelm.',
    },
    culturalNote:
      'Sabbats and seasonal festivals are optional. Parallel holidays worldwide are equally valid — shop for your calendar, not someone else’s pressure.',
  },
  'grief-and-ritual': {
    category: 'practice',
    styles: ['auditory', 'reading_writing', 'kinesthetic'],
    level: 'intermediate',
    audience: 'seeker',
    modalities: {
      visual: 'Create a private photo altar or memory page if that helps you.',
      auditory: 'Speak a name or prayer only if it comforts you.',
      kinesthetic: 'Light a candle, walk, or make tea — small body actions over performance.',
    },
    culturalNote:
      'Grief rituals differ by faith and family. Never force open-casket, incense, alcohol, or public sharing. Clinical grief support remains available where needed.',
  },
  'boundaries-with-practitioners': {
    category: 'safety',
    styles: ['auditory', 'reading_writing', 'kinesthetic'],
    level: 'beginner',
    audience: 'seeker',
    modalities: {
      visual: 'Write boundary scripts on a card you can read on-camera.',
      auditory: 'Practice “I am not available for that” three times.',
      kinesthetic: 'Mute, leave, or close the tab when pressure rises — then document in platform messages.',
    },
    culturalNote:
      'Respectful titles and hierarchy differ by culture; consent does not. You may leave any session that violates your dignity or faith.',
  },
  'checkout-blessings-guide': {
    category: 'seller',
    styles: ['visual', 'reading_writing'],
    level: 'intermediate',
    audience: 'seller',
    modalities: {
      visual: 'Show blessing add-ons with clear optional badges.',
      auditory: 'Describe the blessing neutrally — no guaranteed outcomes.',
      kinesthetic: 'Test checkout once as a customer to feel the flow.',
    },
    culturalNote:
      'Blessings, duas, prayers, and secular notes must stay optional and non-deceptive. Never imply medical results from a checkout add-on.',
  },
  'pro-seller-control-panel': {
    category: 'seller',
    styles: ['visual', 'kinesthetic', 'reading_writing'],
    level: 'intermediate',
    audience: 'seller',
    modalities: {
      visual: 'Tour dashboard cards left-to-right once per week.',
      auditory: 'Name each Pro tool out loud as you open it the first time.',
      kinesthetic: 'Enable one Pro feature this week only — then measure restock reliability.',
    },
    culturalNote:
      'Pro tools are business utilities, not spiritual rank. Free sellers remain full community members.',
  },
};

const DEFAULT_MODALITIES = {
  visual: 'Skim headings and bold safety lines first; screenshot the checklist sections.',
  auditory: 'Read key paragraphs aloud or use your device’s text-to-speech.',
  kinesthetic: 'Complete one small action from the article within 24 hours.',
};

export function enrichArticle(article) {
  if (!article) return null;
  const meta = SLUG_META[article.slug] || {};
  return {
    ...article,
    category: meta.category || 'practice',
    styles: meta.styles || ['reading_writing', 'visual'],
    level: meta.level || 'beginner',
    audience: meta.audience || 'both',
    modalities: { ...DEFAULT_MODALITIES, ...(meta.modalities || {}) },
    culturalNote:
      meta.culturalNote ||
      'Adapt every step to your faith, culture, and local law. Educational only — not medical advice.',
    searchBlob: [
      article.title,
      article.description,
      article.keywords,
      meta.category,
      ...(meta.styles || []),
      meta.culturalNote,
      ...(article.sections || []).map((s) => `${s.heading} ${s.body}`),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  };
}

export function filterLearnArticles(articles, { q = '', style = '', category = '', audience = '' } = {}) {
  const query = q.trim().toLowerCase();
  return articles.filter((a) => {
    if (style && !(a.styles || []).includes(style)) return false;
    if (category && a.category !== category) return false;
    if (audience && a.audience !== 'both' && a.audience !== audience) return false;
    if (query && !(a.searchBlob || '').includes(query)) return false;
    return true;
  });
}
