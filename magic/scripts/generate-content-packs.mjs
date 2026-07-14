/**
 * Generate large offline content packs (no AI API).
 * Targets 1000+ pet phrases, 1000+ coach insights, argument cliff-notes banks.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'src', 'data', 'generated');

fs.mkdirSync(OUT, { recursive: true });

function cartesian(a, b, c = ['']) {
  const out = [];
  for (const x of a) for (const y of b) for (const z of c) out.push([x, y, z].filter(Boolean).join(' '));
  return out;
}

// —— Pet translator (1000+) ——
const petSubjects = [
  'I', 'We cats', 'This dog', 'My paws', 'My belly', 'The treat jar', 'That squirrel',
  'Your shoes', 'The vacuum', 'The mailman', 'Sunbeam', 'Cardboard box', 'My tail',
  'Dinner o\'clock', 'Bed time', 'The doorbell', 'Your laptop', 'The laser dot',
];
const petVerbs = [
  'demand', 'request', 'require', 'beg for', 'deserve', 'negotiate', 'manifest',
  'summon', 'bless', 'forgive', 'judge', 'forgive only if', 'plot', 'celebrate',
];
const petObjects = [
  'more snacks', 'chin scratches', 'open the door', 'a walk', 'less zoom meetings',
  'fresh water', 'the good cheese', 'belly rubs (maybe)', 'you stay home',
  'no baths', 'window time', 'a second dinner', 'the yellow ball', 'quiet humans',
  'shared blanket rights', 'treat diplomacy', 'an apology for the crate',
];
const petTones = [
  '…obviously.', '…and hurry.', '…please and thank you (sort of).',
  '…or I will stare forever.', '…the spirits agree.', '…paws crossed.',
  '…signed, your familiar.', '…this is non-negotiable lore.',
  '…moonlight endorses this.', '…meow is law.',
];

const petPhrases = [];
for (const s of petSubjects) {
  for (const v of petVerbs) {
    for (const o of petObjects) {
      for (const t of petTones) {
        petPhrases.push(`${s} ${v} ${o}${t}`);
        if (petPhrases.length >= 1200) break;
      }
      if (petPhrases.length >= 1200) break;
    }
    if (petPhrases.length >= 1200) break;
  }
  if (petPhrases.length >= 1200) break;
}

// —— Pre-argument coach (1000+) ——
const situations = [
  'chores', 'money', 'in-laws', 'plans', 'tone of voice', 'lateness', 'phones at dinner',
  'household mess', 'weekend plans', 'exes', 'parenting style', 'work stress',
  'friend drama', 'boundaries', 'holidays', 'driving', 'food choices', 'social media',
  'sleep schedules', 'pets', 'space needs', 'jealousy', 'broken promises', 'silence',
];
const stances = [
  'you feel unheard', 'they feel attacked', 'both are tired', 'timing is wrong',
  'facts are fuzzy', 'feelings are loud', 'pride is in the room', 'history is loaded',
  'someone needs a pause', 'someone needs clarity',
];
const openers = [
  'Start with: "When X happens, I feel Y."',
  'Lead with curiosity: "Help me understand what you needed."',
  'Name the shared goal: "I want us both to feel respected."',
  'Offer a pause: "Can we take 20 minutes and come back?"',
  'Own one piece: "I could have said that softer."',
  'Ask permission: "Is now a good time for a hard chat?"',
  'Mirror first: "What I hear is…" then your point.',
  'Swap blame for need: "I need more predictability."',
];
const insights = [
  'Cliff note: volume rarely equals truth.',
  'Cliff note: winning the room can lose the bond.',
  'Cliff note: specificity beats vague accusations.',
  'Cliff note: rest before repair when possible.',
  'Cliff note: humor only after safety is restored.',
  'Cliff note: timelines matter more than speeches.',
  'Cliff note: one issue at a time — no kitchen-sinking.',
  'Cliff note: thank them for staying in the conversation.',
];
const shouldHaveSaid = [
  'What might have helped: "I care about this and about you."',
  'What might have helped: "I\'m not leaving the table — I need a breath."',
  'What might have helped: "Can we solve one concrete next step?"',
  'What might have helped: "I misunderstood — try me again."',
  'What might have helped: "Your feeling makes sense even if I disagree."',
];

const coachEntries = [];
let ci = 0;
for (const sit of situations) {
  for (const st of stances) {
    for (const op of openers) {
      const ins = insights[ci % insights.length];
      const shs = shouldHaveSaid[ci % shouldHaveSaid.length];
      coachEntries.push({
        id: `c${ci + 1}`,
        situation: sit,
        filter: st,
        opener: op,
        insight: ins,
        shouldHaveSaid: shs,
        blurb: `On ${sit}: when ${st}, ${op} ${ins}`,
      });
      ci += 1;
      if (coachEntries.length >= 1100) break;
    }
    if (coachEntries.length >= 1100) break;
  }
  if (coachEntries.length >= 1100) break;
}

// —— Argument settler banks ——
const verdictTemplates = [
  {
    winnerBias: 'clarity',
    note: 'Side with clearer specifics and fewer absolute words ("always/never") earns the edge.',
  },
  {
    winnerBias: 'empathy',
    note: 'Side that names impact on the other person without character attacks wins the tone score.',
  },
  {
    winnerBias: 'solution',
    note: 'Side offering a testable next step outranks pure complaint.',
  },
  {
    winnerBias: 'evidence',
    note: 'Concrete examples beat vibes-only claims — still: entertainment, not court.',
  },
  {
    winnerBias: 'shared',
    note: 'Both hold pieces of truth; neither "owns" the whole moon.',
  },
];

const settlerCliff = cartesian(
  [
    'The sanctum notes:',
    'Hearth judgment:',
    'Sphere minutes:',
    'Moon ledger:',
    'Gentle ruling:',
  ],
  [
    'names matter less than needs.',
    'volume is not evidence.',
    'repair beats revenge.',
    'one apology can reopen a door.',
    'boundaries are not punishments.',
    'timing can be the real villain.',
    'shared calendars prevent half of this.',
    'rest before rehash when possible.',
  ],
  [
    'Walk kindly.',
    'Tea optional.',
    'Breathe twice.',
    'No scoreboard at home.',
    'Return to the table.',
  ],
);

// —— Frustration prompts ——
const ventPrompts = cartesian(
  ['Today I need to say', 'Nobody else needs to know that', 'If the hearth could hear', 'Between us'],
  [
    'I am exhausted by',
    'I am proud of',
    'I am furious about',
    'I am scared of',
    'I am done with',
    'I still love',
  ],
  [
    'the unfinished mess.',
    'how small I felt.',
    'how loud my mind is.',
    'the thing I cannot fix yet.',
    'the person who will not listen.',
    'the version of me that people expect.',
  ],
);

const out = {
  petPhrases: petPhrases.slice(0, 1200),
  coachEntries: coachEntries.slice(0, 1100),
  verdictTemplates,
  settlerCliff: settlerCliff.slice(0, 400),
  ventPrompts: ventPrompts.slice(0, 300),
  generatedAt: new Date().toISOString(),
  counts: {
    petPhrases: Math.min(1200, petPhrases.length),
    coachEntries: Math.min(1100, coachEntries.length),
    settlerCliff: Math.min(400, settlerCliff.length),
    ventPrompts: Math.min(300, ventPrompts.length),
  },
};

fs.writeFileSync(path.join(OUT, 'packs.json'), JSON.stringify(out));
// Also ES module for tree-friendly import
fs.writeFileSync(
  path.join(OUT, 'packs.js'),
  `/** Auto-generated — do not edit */\nexport default ${JSON.stringify(out)};\n`,
);
console.log('Generated packs:', out.counts);
