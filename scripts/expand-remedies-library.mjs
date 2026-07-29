/**
 * Rebalance free vs Pro remedies, expand monographs, add many new free + hot topics.
 * Run: node scripts/expand-remedies-library.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.join(__dirname, '../frontend/src/lib/remedies/catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
let entries = catalog.entries || [];
const bySlug = new Map(entries.map((e) => [e.slug, e]));

const FORCE_FREE = new Set([
  'common-cold',
  'seasonal-allergies',
  'sore-throat',
  'cough',
  'nausea',
  'constipation',
  'acid-reflux',
  'sinus-congestion',
  'post-nasal-drip',
  'hay-fever',
  'laryngitis',
  'ear-congestion',
  'headache-tension',
  'minor-cuts',
  'dry-skin',
  'stress-education',
  'insomnia',
  'anxiety-stress',
  'heartburn',
  'indigestion',
  'muscle-soreness',
  'menstrual-cramps',
  'urinary-comfort',
  'eye-strain',
  'motion-sickness',
  'bronchitis-symptoms',
  'swimmers-ear-discomfort',
]);

const FORCE_HOT = new Set([
  'influenza-like-illness',
  'migraine',
  'ibs-education',
  'eczema-dry-skin',
  'psoriasis-awareness',
  'autoimmune-awareness',
  'long-covid-awareness',
  'sleep-apnea-awareness',
  'depression-awareness',
  'pcos-education',
  'endometriosis-awareness',
  'thyroid-awareness',
  'blood-pressure-education',
  'diabetes-education',
  'asthma-awareness',
  'gerd-education',
  'ulcer-awareness',
  'candida-overgrowth-myths',
  'adrenal-fatigue-myths',
  'chronic-fatigue-awareness',
  'fibromyalgia-awareness',
  'perimenopause',
  'fertility-education',
  'prostate-education',
  'kidney-stone-awareness',
  'gallbladder-awareness',
  'gout-education',
  'anemia-awareness',
  'vertigo-education',
  'tinnitus-education',
  'shingles-awareness',
  'lyme-awareness',
  'mold-illness-awareness',
  'histamine-intolerance',
  'sibo-education',
  'leaky-gut-myths',
  'heavy-metal-detox-myths',
  'intermittent-fasting-education',
]);

function expandEntry(e) {
  const name = e.name;
  const extraRemedies = [
    {
      name: 'Hydration & simple broths',
      note: `For ${name}, many traditions start with warm fluids and easy-to-digest broths rather than complex formulas. Clinicians still want you evaluated if symptoms escalate — fluids support comfort, not diagnosis.`,
    },
    {
      name: 'Rest windows & screen hygiene',
      note: `Scheduling short rest blocks, dimming screens, and reducing late caffeine are low-risk supports people often try for ${name}. Track what actually changes for you over 3–7 days.`,
    },
    {
      name: 'Gentle topical comfort (when relevant)',
      note: `Warm or cool compresses, fragrance-free moisturizers, or carefully diluted aromatics appear in folk notes for related symptoms. Patch-test and stop if irritation appears. Never put undiluted essential oils on skin or near eyes.`,
    },
    {
      name: 'Breathing or grounding practices',
      note: `Slow nasal breathing, brief outdoor walks, or prayer/meditation appear across cultures as adjuncts while seeking care for ${name}. These are complementary — not substitutes for emergency care.`,
    },
  ];
  const tr = Array.isArray(e.traditionalRemedies) ? [...e.traditionalRemedies] : [];
  for (const r of extraRemedies) {
    if (!tr.some((t) => t.name === r.name)) tr.push(r);
  }
  const bullets = [...(e.conventionalCare?.bullets || [])];
  for (const b of [
    'Clarify red-flag symptoms and urgency triage',
    'Review medications and allergy history',
    'Shared decision-making on testing vs watchful waiting',
    'Follow-up plan if symptoms do not improve as expected',
  ]) {
    if (!bullets.includes(b)) bullets.push(b);
  }
  const when = [...(e.whenSeekCare || [])];
  for (const w of [
    'symptoms rapidly worsen',
    'you feel unsafe or confused',
    'child, pregnancy, or chronic illness with new severe symptoms',
  ]) {
    if (!when.includes(w)) when.push(w);
  }
  const warnings = [...(e.warnings || [])];
  for (const w of [
    'Natural is not a synonym for safe for everyone — herb-drug interactions are real.',
    'This page is educational research, not a treatment plan.',
    'Do not delay emergency care to try a home approach.',
  ]) {
    if (!warnings.includes(w)) warnings.push(w);
  }
  const stories = Array.isArray(e.successStories) ? [...e.successStories] : [];
  if (stories.length < 3) {
    stories.push({
      title: 'What people often report after combining rest + clinician advice',
      body: `Anecdotally, people researching ${name} say the most helpful path was pairing basic comfort measures with a clear plan from a licensed clinician — not exclusive self-treatment. Stories are not proof of cure.`,
    });
  }
  const overview =
    (e.overview || '') +
    ` Free monographs open completely so you can evaluate research quality; Pro hot topics add the densest clinical-tradition comparison libraries for frequent researchers. Always prefer licensed care for red-flag symptoms related to ${name}.`;
  const historical =
    (e.historicalNotes || '') +
    ` Across regions, household healers, midwives, and apothecaries recorded practical notes on ${name} long before modern hospitals. Those notes inform culture and curiosity; they do not replace diagnostics, vaccines, antibiotics, or emergency pathways when indicated.`;
  const text = [
    overview,
    historical,
    ...when,
    ...warnings,
    e.conventionalCare?.summary || '',
    ...bullets,
    ...tr.map((t) => t.note),
    ...stories.map((s) => s.body),
  ].join(' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(8, Math.min(18, Math.round(words / 200)));
  return {
    ...e,
    overview,
    historicalNotes: historical,
    traditionalRemedies: tr,
    conventionalCare: {
      summary:
        e.conventionalCare?.summary ||
        `Clinical evaluation for ${name} prioritizes safety, differential diagnosis, and evidence-aligned care.`,
      bullets,
    },
    whenSeekCare: when,
    warnings,
    successStories: stories,
    readMinutes,
  };
}

function makeEntry({ slug, name, category, hot, keywords, remedies }) {
  const description = `Educational overview of ${name}: conventional care pathways, traditional natural approaches, safety warnings, and when to seek medical attention. Not medical advice.`;
  const overview = `${name} is a common search topic for people comparing clinical care with traditional comfort measures. This monograph summarizes how healthcare systems often evaluate the concern, and how herbalists and household traditions have framed supportive practices. Educational only — not diagnosis or treatment.`;
  const conventionalCare = {
    summary: `In clinical settings, evaluation related to ${name} focuses on ruling out dangerous causes, clarifying urgency, and offering evidence-based options when a diagnosis is confirmed.`,
    bullets: [
      'History, exam, and red-flag screening',
      'Targeted tests when indicated by guidelines',
      'Symptom relief appropriate to severity',
      'Referral to specialists when red flags or chronicity appear',
      'Medication review for interactions and contraindications',
    ],
  };
  const traditionalRemedies = (remedies || [
    'warm fluids',
    'rest',
    'gentle herbs with clinician guidance',
    'steam or humidity',
    'dietary simplification',
  ]).map((r) => ({
    name: typeof r === 'string' ? r : r.name,
    note:
      typeof r === 'string'
        ? `Traditionally or popularly discussed for comfort around ${name}. Discuss with a licensed clinician before use if you take medications, are pregnant, or have chronic illness.`
        : r.note,
  }));
  return expandEntry({
    slug,
    name,
    category,
    hot: !!hot,
    readMinutes: 10,
    keywords: keywords || `${name}, natural remedies, traditional remedies, holistic education, ${category}`,
    description,
    overview,
    whenSeekCare: [
      'severe or sudden symptoms',
      'high fever with confusion',
      'chest pain or trouble breathing',
      'symptoms lasting longer than expected',
    ],
    conventionalCare,
    traditionalRemedies,
    historicalNotes: `Historical notes on ${name} appear in folk medicine, midwifery manuals, and early pharmacopeias. Use them as cultural research, not modern dosing instructions.`,
    successStories: [
      {
        title: 'Comfort first, then clinical clarity',
        body: `People often share that pairing simple comfort measures with timely clinician contact reduced anxiety around ${name}. Anecdote only.`,
      },
      {
        title: 'Label literacy',
        body: `Shoppers researching ${name} report preferring products with clear botanicals and structure/function language over cure claims.`,
      },
    ],
    shopHints: ['Look for clear ingredient lists', 'Prefer structure/function language'],
    serviceHints: ['Ask practitioners about scope of practice', 'Keep medical care for red flags'],
    warnings: [
      'Not medical advice',
      'Herb-drug interactions possible',
      'Seek emergency care for life-threatening symptoms',
    ],
  });
}

const NEW_FREE = [
  ['dry-winter-skin-comfort', 'Dry winter skin comfort', 'skin', ['oatmeal baths', 'fragrance-free cream', 'humidifier']],
  ['chapped-lips-care', 'Chapped lips care', 'skin', ['plain balm', 'hydration', 'avoid licking lips']],
  ['morning-stiffness-education', 'Morning stiffness education', 'musculoskeletal', ['gentle stretch', 'warm shower', 'movement breaks']],
  ['screen-eye-fatigue', 'Screen eye fatigue', 'eye-ear', ['20-20-20 rule', 'blink breaks', 'room lighting']],
  ['travel-jet-lag-basics', 'Travel jet lag basics', 'sleep-mood', ['light exposure', 'hydration', 'consistent wake time']],
  ['hangover-myths-education', 'Hangover myths education', 'general', ['water', 'food', 'rest']],
  ['hand-washing-habit', 'Hand hygiene habit education', 'immune', ['soap and water', 'nail care', 'hand cream']],
  ['office-neck-tension', 'Office neck tension', 'musculoskeletal', ['posture resets', 'heat pack', 'walk breaks']],
  ['seasonal-affective-light-education', 'Seasonal light and mood education', 'sleep-mood', ['morning light', 'outdoor walks', 'sleep schedule']],
  ['bloating-after-meals', 'Bloating after meals education', 'digestive', ['slow eating', 'ginger tea', 'food journaling']],
  ['gas-discomfort-education', 'Gas discomfort education', 'digestive', ['fennel tea folklore', 'walk after meals', 'portion awareness']],
  ['mild-sunburn-comfort', 'Mild sunburn comfort education', 'skin', ['cool compress', 'aloe folklore', 'hydration']],
  ['insect-bite-itch-education', 'Insect bite itch education', 'skin', ['cool compress', 'avoid scratching', 'watch infection signs']],
  ['nosebleed-first-aid-education', 'Nosebleed first-aid education', 'ear-nose', ['lean forward', 'pinch soft nose', 'seek care if heavy']],
  ['hiccups-education', 'Hiccups education', 'digestive', ['sip water', 'breath hold folklore', 'see care if prolonged']],
  ['bad-breath-education', 'Bad breath education', 'oral', ['tongue cleaning', 'hydration', 'dental visit']],
  ['tooth-sensitivity-education', 'Tooth sensitivity education', 'oral', ['soft brush', 'desensitizing paste', 'dentist eval']],
  ['jaw-clench-daytime', 'Daytime jaw clenching education', 'musculoskeletal', ['stress breaks', 'dentist if grinding', 'soft diet days']],
  ['foot-arch-fatigue', 'Foot arch fatigue education', 'musculoskeletal', ['supportive shoes', 'calf stretch', 'rest elevation']],
  ['cold-hands-feet-education', 'Cold hands and feet education', 'circulatory', ['layered clothing', 'movement', 'clinician if sudden change']],
  ['premenstrual-comfort-basics', 'Premenstrual comfort basics', 'womens', ['heat pack', 'gentle movement', 'track cycles']],
  ['breastfeeding-comfort-education', 'Breastfeeding comfort education', 'womens', ['lactation consult', 'hydration', 'positioning help']],
  ['new-parent-sleep-debt', 'New parent sleep debt education', 'sleep-mood', ['nap opportunism', 'partner shifts', 'ask for help']],
  ['caregiver-burnout-education', 'Caregiver burnout education', 'sleep-mood', ['respite planning', 'support groups', 'clinician for mood']],
  ['exam-stress-study-breaks', 'Exam stress study breaks', 'sleep-mood', ['pomodoro breaks', 'walks', 'sleep priority']],
  ['public-speaking-nerves', 'Public speaking nerves education', 'sleep-mood', ['breath pacing', 'practice runs', 'hydration']],
  ['mild-altitude-adjustment', 'Mild altitude adjustment education', 'general', ['slow ascent folklore', 'hydration', 'seek care for severe symptoms']],
  ['swimmers-ear-prevention', 'Swimmer ear prevention education', 'eye-ear', ['dry ears gently', 'avoid Q-tip trauma', 'clinician for pain']],
  ['contact-lens-hygiene-basics', 'Contact lens hygiene basics', 'eye-ear', ['solution not water', 'replace on schedule', 'eye doc for pain']],
  ['hearing-protection-concerts', 'Hearing protection at concerts', 'eye-ear', ['earplugs', 'distance from speakers', 'rest ears after']],
  ['garden-muscle-warmups', 'Garden muscle warm-ups', 'musculoskeletal', ['stretch hips', 'lift with legs', 'hydration']],
  ['kitchen-burn-minor-education', 'Minor kitchen burn education', 'skin', ['cool water', 'clean dressing', 'ER for large burns']],
  ['food-poisoning-when-to-worry', 'Food poisoning when to worry', 'digestive', ['oral rehydration', 'bland foods later', 'ER for blood or dehydration']],
  ['antibiotic-gut-support-education', 'Antibiotic gut support education', 'digestive', ['clinician-guided probiotics folklore', 'food variety', 'finish prescribed course']],
  ['iron-rich-food-education', 'Iron-rich food education', 'metabolic', ['leafy greens folklore', 'pair with vitamin C foods', 'test before mega-dosing']],
  ['vitamin-d-sun-balance', 'Vitamin D and sun balance education', 'metabolic', ['sensible sun', 'food sources', 'test with clinician']],
  ['hydration-electrolyte-basics', 'Hydration and electrolyte basics', 'general', ['water', 'salty foods when sweating', 'medical care for severe loss']],
  ['sleep-hygiene-checklist', 'Sleep hygiene checklist', 'sleep-mood', ['dark cool room', 'consistent schedule', 'caffeine cutoff']],
  ['gratitude-journaling-basics', 'Gratitude journaling basics', 'sleep-mood', ['3 lines nightly', 'no perfectionism', 'therapy if needed']],
  ['digital-sunset-habit', 'Digital sunset habit', 'sleep-mood', ['phone outside bedroom', 'dim lights', 'paper book']],
  ['walking-snacks-movement', 'Walking snacks for movement', 'general', ['5-minute walks', 'stairs when able', 'joint-friendly pace']],
  ['posture-desk-setup', 'Desk posture setup education', 'musculoskeletal', ['screen at eye level', 'feet flat', 'microbreaks']],
  ['voice-rest-after-cheering', 'Voice rest after cheering', 'ear-nose', ['hydration', 'avoid whispering strain', 'ENT if hoarse long']],
  ['allergy-pillow-cover-basics', 'Allergy pillow cover basics', 'respiratory', ['encasements', 'wash bedding hot', 'HEPA if helpful']],
  ['pet-dander-home-tips', 'Pet dander home tips', 'respiratory', ['groom outdoors', 'HEPA vacuum', 'allergy clinician']],
  ['mold-smell-when-to-act', 'Mold smell when to act education', 'respiratory', ['fix leaks', 'professional remediation', 'medical care for symptoms']],
  ['smoke-air-quality-days', 'Smoke air quality days', 'respiratory', ['stay indoors', 'N95 if needed', 'medications per clinician']],
  ['winter-immune-habits', 'Winter immune habit education', 'immune', ['sleep', 'hand hygiene', 'vaccines per clinician']],
  ['summer-heat-exhaustion-education', 'Heat exhaustion education', 'general', ['shade', 'fluids', 'emergency care for confusion']],
  ['tick-check-after-hikes', 'Tick check after hikes', 'immune', ['full body check', 'prompt removal', 'watch bullseye rash']],
  ['poison-ivy-recognition', 'Poison ivy recognition education', 'skin', ['wash promptly', 'avoid scratching', 'clinician for severe rash']],
  ['menopause-hot-flash-basics', 'Menopause hot flash basics', 'womens', ['layered clothing', 'cool bedroom', 'clinician options']],
  ['andropause-education-myths', 'Andropause education myths', 'mens', ['evidence-based labs', 'avoid unregulated boosters', 'clinician discussion']],
  ['libido-stress-connection', 'Libido and stress connection education', 'general', ['sleep', 'relationship communication', 'medical eval for sudden change']],
  ['uti-prevention-habits', 'UTI prevention habit education', 'urinary', ['hydration', 'void after sex folklore', 'urgent care for fever flank pain']],
  ['kidney-health-hydration', 'Kidney health hydration education', 'urinary', ['steady fluids', 'medication review', 'labs when indicated']],
  ['heart-healthy-walks', 'Heart-healthy walking education', 'circulatory', ['brisk walks', 'smoke-free living', 'BP checks']],
  ['salt-awareness-cooking', 'Salt awareness in cooking', 'metabolic', ['taste before salting', 'herbs for flavor', 'clinician for restriction needs']],
  ['sugar-label-literacy', 'Sugar label literacy', 'metabolic', ['read added sugars', 'swap gradual', 'no shame spiral']],
  ['protein-at-breakfast', 'Protein at breakfast education', 'metabolic', ['eggs beans yogurt folklore', 'pair with fiber', 'personalize with clinician']],
  ['fiber-increase-slowly', 'Increasing fiber slowly', 'digestive', ['oats beans produce', 'extra water', 'GI clinician if pain']],
  ['mindful-eating-basics', 'Mindful eating basics', 'digestive', ['phone-free meals', 'chew thoroughly', 'stop at comfort']],
  ['caffeine-cutoff-education', 'Caffeine cutoff education', 'sleep-mood', ['afternoon cutoff', 'watch hidden sources', 'taper if withdrawal']],
  ['alcohol-sleep-disruption', 'Alcohol and sleep disruption', 'sleep-mood', ['earlier last drink', 'hydrate', 'support for dependence']],
  ['nicotine-quit-supports', 'Nicotine quit supports education', 'respiratory', ['clinician-approved NRT', 'quitlines', 'avoid unproven detoxes']],
  ['posture-phone-neck', 'Phone neck posture education', 'musculoskeletal', ['raise phone', 'chin tucks gentle', 'PT if chronic']],
  ['wrist-desk-strain', 'Wrist desk strain education', 'musculoskeletal', ['neutral wrists', 'shortcuts to type less', 'eval for numbness']],
  ['back-pack-ergonomics', 'Backpack ergonomics', 'musculoskeletal', ['two straps', 'lighter load', 'hip belt when needed']],
  ['first-aid-kit-home', 'Home first-aid kit basics', 'general', ['bandages', 'antiseptic', 'emergency contacts list']],
  ['medication-list-habit', 'Medication list habit', 'general', ['phone note of meds', 'bring to appointments', 'pharmacist questions']],
  ['second-opinion-when', 'When to seek a second opinion', 'general', ['complex diagnosis', 'major surgery decisions', 'communication breakdown']],
  ['telehealth-visit-prep', 'Telehealth visit prep', 'general', ['symptom timeline', 'med list', 'good lighting camera']],
  ['pharmacy-question-scripts', 'Pharmacy question scripts', 'general', ['ask interactions', 'timing with food', 'storage rules']],
  ['herbal-tea-label-reading', 'Herbal tea label reading', 'general', ['botanical names', 'caffeine notes', 'pregnancy cautions']],
  ['essential-oil-diffusion-basics', 'Essential oil diffusion basics', 'general', ['ventilate rooms', 'pet caution', 'never ingest casually']],
  ['crystal-placebo-education', 'Crystals and meaning education', 'general', ['personal ritual only', 'not medical devices', 'pair with real care']],
  ['ritual-burnout-rest', 'Ritual burnout and rest', 'sleep-mood', ['simplify altar', 'permission to pause', 'community support']],
  ['boundary-scripts-family-health', 'Boundary scripts for family health talk', 'general', ['prefer clinician advice', 'no unsolicited remedies', 'thank and redirect']],
  ['kids-fever-when-to-call', 'Kids fever when to call education', 'immune', ['age-based urgency', 'hydration', 'pediatric guidance']],
  ['teen-sleep-needs', 'Teen sleep needs education', 'sleep-mood', ['later start realism', 'device curfew', 'mood watch']],
  ['elder-fall-prevention-home', 'Elder fall prevention at home', 'musculoskeletal', ['clear walkways', 'night lights', 'vision med review']],
  ['grief-appetite-changes', 'Grief and appetite changes', 'sleep-mood', ['small frequent meals', 'community meals', 'grief counseling']],
  ['loneliness-walk-club', 'Loneliness and walk-club ideas', 'sleep-mood', ['regular outdoor meet', 'library groups', 'ask for help']],
  ['volunteering-mood-boost', 'Volunteering and mood education', 'sleep-mood', ['short shifts', 'skills-based help', 'not a depression cure alone']],
  ['meal-prep-stress-reduction', 'Meal prep for stress reduction', 'digestive', ['batch cook basics', 'freezer portions', 'simple proteins']],
  ['lunchbox-allergy-awareness', 'Lunchbox allergy awareness', 'immune', ['label sharing foods', 'read packages', 'emergency plan']],
  ['picnic-food-safety', 'Picnic food safety education', 'digestive', ['coolers', 'two-hour rule', 'hand wash stations']],
  ['hydration-for-hikers', 'Hydration for hikers', 'general', ['plan water stops', 'electrolytes when long', 'turn back if dizzy']],
  ['blister-prevention-boots', 'Blister prevention in boots', 'skin', ['break-in period', 'moisture control', 'stop if infection signs']],
  ['seasonal-produce-rotation', 'Seasonal produce rotation education', 'metabolic', ['local peaks', 'variety colors', 'store properly']],
  ['herb-garden-beginner-safety', 'Herb garden beginner safety', 'general', ['label plants', 'know toxic lookalikes', 'wash before use']],
  ['fermented-foods-intro', 'Fermented foods introduction', 'digestive', ['start small amounts', 'store safely', 'clinician if immuno compromised']],
  ['honey-safety-infants', 'Honey safety and infants', 'general', ['no honey under 1 year', 'botulism risk education', 'alternatives for soothing']],
  ['salt-gargle-education', 'Salt gargle education', 'ear-nose', ['warm saline folklore', 'not for children who cannot gargle', 'see care for high fever']],
  ['neti-pot-safety-education', 'Neti pot safety education', 'respiratory', ['distilled or boiled cooled water only', 'clean device', 'stop if pain worsens']],
  ['humidifier-cleaning-habit', 'Humidifier cleaning habit', 'respiratory', ['empty daily', 'prevent mold', 'use as directed']],
];

const NEW_HOT = [
  ['long-covid-fatigue-deep-dive', 'Long COVID fatigue deep dive', 'immune'],
  ['histamine-intolerance-deep', 'Histamine intolerance deep dive', 'digestive'],
  ['sibo-symptom-education-pro', 'SIBO symptom education (Pro)', 'digestive'],
  ['perimenopause-brain-fog-pro', 'Perimenopause brain fog (Pro)', 'womens'],
  ['pcos-lifestyle-evidence-pro', 'PCOS lifestyle evidence map (Pro)', 'womens'],
  ['male-hypogonadism-education-pro', 'Male hypogonadism education (Pro)', 'mens'],
  ['autoimmune-flare-planning-pro', 'Autoimmune flare planning (Pro)', 'immune'],
  ['chronic-migraine-map-pro', 'Chronic migraine care map (Pro)', 'neuro'],
  ['insomnia-cbt-i-overview-pro', 'Insomnia CBT-I overview (Pro)', 'sleep-mood'],
  ['anxiety-body-symptoms-pro', 'Anxiety body symptoms map (Pro)', 'sleep-mood'],
  ['eczema-trigger-detective-pro', 'Eczema trigger detective (Pro)', 'skin'],
  ['gerd-nighttime-protocol-edu-pro', 'Nighttime GERD education (Pro)', 'digestive'],
  ['metabolic-syndrome-primer-pro', 'Metabolic syndrome primer (Pro)', 'metabolic'],
  ['chronic-kidney-awareness-pro', 'Chronic kidney awareness (Pro)', 'urinary'],
  ['atrial-fibrillation-awareness-pro', 'Atrial fibrillation awareness (Pro)', 'circulatory'],
  ['osteoarthritis-movement-pro', 'Osteoarthritis movement education (Pro)', 'musculoskeletal'],
  ['endometriosis-pain-map-pro', 'Endometriosis pain map (Pro)', 'womens'],
  ['thyroid-lab-literacy-pro', 'Thyroid lab literacy (Pro)', 'metabolic'],
  ['sleep-apnea-screening-pro', 'Sleep apnea screening education (Pro)', 'sleep-mood'],
  ['mold-exposure-myth-vs-clinic-pro', 'Mold exposure myth vs clinic (Pro)', 'respiratory'],
  ['postpartum-mood-education-pro', 'Postpartum mood education (Pro)', 'womens'],
  ['chronic-pain-pacing-pro', 'Chronic pain pacing education (Pro)', 'musculoskeletal'],
  ['mast-cell-awareness-pro', 'Mast cell activation awareness (Pro)', 'immune'],
  ['fatty-liver-education-pro', 'Fatty liver education (Pro)', 'metabolic'],
  ['pelvic-floor-basics-pro', 'Pelvic floor basics education (Pro)', 'womens'],
];

// Expand + reflag existing
entries = entries.map((e) => {
  let hot = !!e.hot;
  if (FORCE_FREE.has(e.slug)) hot = false;
  if (FORCE_HOT.has(e.slug)) hot = true;
  // Prefer free for non-forced if we want more free visibility: leave others as-is
  return expandEntry({ ...e, hot });
});

let added = 0;
for (const [slug, name, category, remedies] of NEW_FREE) {
  if (bySlug.has(slug)) continue;
  const entry = makeEntry({ slug, name, category, hot: false, remedies });
  entries.push(entry);
  bySlug.set(slug, entry);
  added += 1;
}
for (const [slug, name, category] of NEW_HOT) {
  if (bySlug.has(slug)) continue;
  const entry = makeEntry({ slug, name, category, hot: true });
  entries.push(entry);
  bySlug.set(slug, entry);
  added += 1;
}

entries.sort((a, b) => {
  if (!!a.hot !== !!b.hot) return a.hot ? 1 : -1;
  return a.name.localeCompare(b.name);
});

catalog.entries = entries;
catalog.count = entries.length;
catalog.updatedAt = new Date().toISOString();
fs.writeFileSync(catalogPath, JSON.stringify(catalog));

const free = entries.filter((e) => !e.hot).length;
const hot = entries.filter((e) => e.hot).length;
console.log(
  JSON.stringify(
    {
      total: entries.length,
      free,
      hot,
      added,
      first10: entries.slice(0, 10).map((e) => ({ slug: e.slug, hot: e.hot })),
    },
    null,
    2,
  ),
);
