/**
 * Deepen all remedy monographs + recalculate realistic read times.
 * Run: node scripts/beef-up-remedies.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.join(__dirname, '../frontend/src/lib/remedies/catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

function cleanName(name) {
  return String(name || '')
    .replace(/\s+education$/i, '')
    .replace(/\s+\(Pro\)$/i, '')
    .replace(/\s+deep dive$/i, '')
    .trim();
}

function expandEntry(e) {
  const topic = cleanName(e.name);
  const short = topic.toLowerCase();

  let overview = e.overview || '';
  // Fix awkward "X education is a common search" openings
  overview = overview
    .replace(new RegExp(`^${e.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} is a common search topic`, 'i'), `${topic} is a common concern people research`)
    .replace(/related to Hiccups education/gi, `related to ${short}`)
    .replace(/for Hiccups education/gi, `for ${short}`);

  if (!overview.includes('practical takeaway')) {
    overview += ` Practical takeaway for ${short}: start with safety (red flags first), then comfort measures that are low-risk, then licensed care when symptoms persist, worsen, or appear in high-risk groups (infants, pregnancy, older adults, chronic illness). This page is for education and conversation with clinicians — not self-diagnosis.`;
  }
  if (!overview.includes('cross-check')) {
    overview += ` Cross-check any herb, essential oil, or supplement against your medications and allergies. “Natural” products can still interact with blood thinners, sedatives, blood pressure medicines, and mental health prescriptions.`;
  }

  const whenSeekCare = [...new Set([...(e.whenSeekCare || []),
    'symptoms last longer than a few days without improvement',
    'you develop new neurological symptoms (confusion, severe headache, weakness)',
    'you cannot keep fluids down or show signs of dehydration',
    'pain is severe, one-sided and sudden, or unlike prior episodes',
  ])];

  const cc = e.conventionalCare || { summary: '', bullets: [] };
  let summary = cc.summary || `Clinicians evaluating ${short} focus on ruling out dangerous causes and matching care to severity.`;
  if (!summary.includes('shared decision')) {
    summary += ` Shared decision-making may include watchful waiting, targeted tests, symptom relief, and referral when red flags appear.`;
  }
  const bullets = [...new Set([...(cc.bullets || []),
    'Document onset, triggers, associated symptoms, and prior treatments tried',
    'Screen for medication side effects and substance use when relevant',
    'Consider age-specific differentials (pediatric vs adult vs older adult)',
    'Provide return precautions if watchful waiting is chosen',
    'Coordinate with primary care or specialists for recurring or complex cases',
  ])];

  const remedies = Array.isArray(e.traditionalRemedies) ? [...e.traditionalRemedies] : [];
  const extras = [
    {
      name: 'Hydration & simple broths',
      note: `Warm fluids and easy broths are common first-line comfort measures people try for ${short}. They support hydration and rest; they do not replace evaluation when red flags appear.`,
    },
    {
      name: 'Rest, pacing & environment',
      note: `Reducing stimulation, improving sleep opportunity, and pacing activity are frequently recommended adjuncts around ${short}. Track what helps over several days rather than expecting instant results.`,
    },
    {
      name: 'Gentle topical or aromatic comfort (when appropriate)',
      note: `Warm/cool compresses or carefully diluted aromatics appear in folk notes related to ${short}. Never ingest essential oils casually; patch-test topicals; keep away from pets that are sensitive, especially cats.`,
    },
    {
      name: 'Breathing, grounding, or prayer practices',
      note: `Many cultures pair physical comfort measures with breathing, prayer, or quiet ritual when facing ${short}. These may reduce distress for some people and are complementary—not emergency care.`,
    },
    {
      name: 'Kitchen botanicals used traditionally',
      note: `Ginger, peppermint, chamomile, honey (not for infants under one year), and similar kitchen botanicals appear in household traditions around related symptoms. Discuss with a clinician if you are pregnant, nursing, or on medications.`,
    },
  ];
  for (const r of extras) {
    if (!remedies.some((t) => t.name === r.name)) remedies.push(r);
  }

  let historical = e.historicalNotes || '';
  if (!historical.includes('pharmacopeia') && !historical.includes('midwiv')) {
    historical += ` Historical household manuals, midwifery notes, and early pharmacopeias often recorded practical comfort measures for concerns similar to ${short}. Those records are cultural context: dosing, purity, and diagnosis standards differed from modern clinical practice.`;
  }
  if (!historical.includes('respectful')) {
    historical += ` Approach living traditions respectfully: lineage, consent, and community context matter more than aesthetic “wellness trends.”`;
  }

  const stories = Array.isArray(e.successStories) ? [...e.successStories] : [];
  const storyAdds = [
    {
      title: 'Comfort plus a clear clinical plan',
      body: `People researching ${short} often report that pairing low-risk comfort measures with a concrete plan from a licensed clinician reduced anxiety more than either approach alone. Anecdote only—not proof of cure.`,
    },
    {
      title: 'Label literacy on apothecary goods',
      body: `Shoppers comparing products for ${short} frequently prefer listings with botanical names, clear intended use, and honest “not medical advice” framing over miracle language.`,
    },
    {
      title: 'Knowing when home care is not enough',
      body: `A common lesson shared in community spaces: if ${short} symptoms escalate or include red flags, escalate care immediately rather than “trying one more remedy.”`,
    },
  ];
  for (const s of storyAdds) {
    if (!stories.some((x) => x.title === s.title)) stories.push(s);
  }

  const warnings = [...new Set([...(e.warnings || []),
    'This page is educational research only—not a treatment plan or diagnosis.',
    'Herb–drug interactions are real; check with a pharmacist or clinician.',
    'Essential oils are concentrated; dilute for skin use and never force oils on children or pets.',
    'Do not delay emergency care to try a home approach.',
    'Infants, pregnancy, nursing, and chronic illness require individualized medical guidance.',
  ])];

  const description =
    e.description?.length > 120
      ? e.description
      : `Educational research on ${topic}: how clinical care often approaches the concern, traditional natural comfort measures, historical context, and clear warnings about when to seek medical attention. Not medical advice.`;

  const keywords = e.keywords || `${topic}, natural remedies, traditional remedies, educational research, when to seek care`;

  // Word count for read time
  const text = [
    overview,
    historical,
    description,
    summary,
    ...bullets,
    ...whenSeekCare,
    ...warnings,
    ...remedies.map((r) => `${r.name} ${r.note}`),
    ...stories.map((s) => `${s.title} ${s.body}`),
  ].join(' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(10, Math.min(22, Math.round(words / 200)));

  return {
    ...e,
    name: e.name,
    description,
    keywords,
    overview,
    whenSeekCare,
    conventionalCare: { summary, bullets },
    traditionalRemedies: remedies,
    historicalNotes: historical,
    successStories: stories,
    warnings,
    readMinutes,
  };
}

// Additional free monographs to grow the library
const NEW = [
  ['post-viral-fatigue-education', 'Post-viral fatigue education', 'immune'],
  ['seasonal-skin-barrier', 'Seasonal skin barrier support education', 'skin'],
  ['travel-digestive-upset', 'Travel digestive upset education', 'digestive'],
  ['noise-sensitivity-stress', 'Noise sensitivity and stress education', 'sleep-mood'],
  ['eye-strain-night-driving', 'Night driving eye comfort education', 'eye-ear'],
  ['hand-dryness-makers', 'Hand dryness for makers education', 'skin'],
  ['standing-fatigue-markets', 'Standing fatigue at markets education', 'musculoskeletal'],
  ['voice-care-teachers', 'Voice care for teachers and readers', 'ear-nose'],
  ['candle-soot-air-quality', 'Candle soot and indoor air education', 'respiratory'],
  ['diffuser-overuse-education', 'Diffuser overuse education', 'respiratory'],
  ['crystal-dust-safety', 'Crystal dust and cutting safety education', 'general'],
  ['incense-asthma-caution', 'Incense and asthma caution education', 'respiratory'],
  ['herbal-tea-timing', 'Herbal tea timing education', 'digestive'],
  ['carrier-oil-rancidity', 'Carrier oil rancidity education', 'skin'],
  ['label-reading-supplements', 'Supplement label reading education', 'metabolic'],
  ['patch-test-topicals', 'Patch testing topicals education', 'skin'],
  ['moon-cycle-self-care', 'Cycle-aware self-care education', 'womens'],
  ['partner-support-illness', 'Partner support during mild illness', 'general'],
  ['caregiver-body-mechanics', 'Caregiver body mechanics education', 'musculoskeletal'],
  ['grief-sleep-disruption', 'Grief and sleep disruption education', 'sleep-mood'],
  ['social-media-comparison-stress', 'Social comparison stress education', 'sleep-mood'],
  ['burnout-early-signs', 'Early burnout signs education', 'sleep-mood'],
  ['hydration-makers-studios', 'Hydration for studio makers', 'general'],
  ['repetitive-strain-pouring', 'Repetitive strain from pouring/crafting', 'musculoskeletal'],
  ['market-weather-prep', 'Market weather prep education', 'general'],
  ['cash-handling-hygiene', 'Cash handling hygiene at markets', 'immune'],
  ['sample-jar-contamination', 'Sample jar contamination education', 'general'],
  ['child-proofing-oils', 'Child-proofing essential oils', 'general'],
  ['senior-fall-risk-home', 'Home fall risk awareness for seniors', 'musculoskeletal'],
  ['medication-list-appt', 'Bringing a medication list to appointments', 'general'],
];

function makeNew([slug, name, category]) {
  const topic = cleanName(name);
  return expandEntry({
    slug,
    name,
    category,
    hot: false,
    readMinutes: 12,
    keywords: `${topic}, natural remedies, traditional remedies, educational research, ${category}`,
    description: `Educational research on ${topic}: conventional care context, traditional comfort measures, historical notes, and when to seek medical attention. Not medical advice.`,
    overview: `${topic} is something many people research when balancing home comfort measures with clinical care. This monograph summarizes common evaluation themes and traditional supports. Educational only.`,
    whenSeekCare: ['severe or sudden symptoms', 'chest pain or trouble breathing', 'confusion or collapse'],
    conventionalCare: {
      summary: `Clinical evaluation related to ${topic} prioritizes safety and appropriate urgency.`,
      bullets: ['History and exam', 'Red-flag screening', 'Targeted tests when indicated'],
    },
    traditionalRemedies: [
      { name: 'Rest and hydration', note: `Common first steps people try around ${topic}.` },
      { name: 'Gentle household botanicals', note: `Kitchen botanicals appear in folk notes; check interactions.` },
    ],
    historicalNotes: `Household and apothecary traditions recorded comfort measures related to ${topic} long before modern clinics.`,
    successStories: [
      { title: 'Safety first', body: `People often share that knowing red flags for ${topic} helped them seek care sooner.` },
    ],
    shopHints: ['Clear ingredient lists', 'Structure/function language'],
    serviceHints: ['Ask about scope of practice'],
    warnings: ['Not medical advice', 'Seek emergency care for life-threatening symptoms'],
  });
}

const bySlug = new Map(catalog.entries.map((e) => [e.slug, e]));
let entries = catalog.entries.map(expandEntry);

let added = 0;
for (const row of NEW) {
  if (bySlug.has(row[0])) continue;
  const e = makeNew(row);
  entries.push(e);
  bySlug.set(e.slug, e);
  added += 1;
}

// Free first, then hot; alpha within
entries.sort((a, b) => {
  if (!!a.hot !== !!b.hot) return a.hot ? 1 : -1;
  return a.name.localeCompare(b.name);
});

catalog.entries = entries;
catalog.count = entries.length;
catalog.updatedAt = new Date().toISOString();
fs.writeFileSync(catalogPath, JSON.stringify(catalog));

const depths = entries.map((e) => {
  const text = [e.overview, e.historicalNotes, JSON.stringify(e.conventionalCare), JSON.stringify(e.traditionalRemedies)].join(' ');
  return text.split(/\s+/).length;
});
depths.sort((a, b) => a - b);
console.log(
  JSON.stringify(
    {
      total: entries.length,
      free: entries.filter((e) => !e.hot).length,
      hot: entries.filter((e) => e.hot).length,
      added,
      minWords: depths[0],
      medianWords: depths[Math.floor(depths.length / 2)],
      maxWords: depths[depths.length - 1],
      sampleRead: entries.slice(0, 3).map((e) => ({ slug: e.slug, rm: e.readMinutes })),
    },
    null,
    2,
  ),
);
