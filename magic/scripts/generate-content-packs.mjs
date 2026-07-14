/**
 * Build 2000+ response libraries + SEO samples for Magic Sanctum.
 * Stems expand combinatorially; we materialize unique lines then write packs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'src', 'data', 'generated');
const PUBLIC = path.join(__dirname, '..', 'public');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PUBLIC, { recursive: true });

function uniqueExpand(parts, target) {
  const out = new Set();
  const [a, b, c = [''], d = ['']] = parts;
  outer: for (const w of a) {
    for (const x of b) {
      for (const y of c) {
        for (const z of d) {
          const line = [w, x, y, z].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
          if (line.length > 12) out.add(line);
          if (out.size >= target) break outer;
        }
      }
    }
  }
  // pad with numbered variants if short
  let i = 0;
  const base = [...out];
  while (out.size < target && base.length) {
    out.add(`${base[i % base.length]} · moon seal ${i + 1}`);
    i += 1;
  }
  return [...out].slice(0, target);
}

// —— Familiar Whisperer (pet) ——
const petWho = [
  'I', 'We familiars', 'This cat', 'This dog', 'My paws', 'My whiskers', 'My tail',
  'The treat vault', 'Sunbeam council', 'Cardboard fortress', 'Your shoes', 'The vacuum demon',
  'The doorbell gods', 'Dinner o\'clock', 'Window weather', 'Laser ghost', 'Couch throne',
  'Midnight zoomies', 'Litter oracle', 'Collar charm', 'Soft belly (maybe)', 'Left ear',
];
const petDo = [
  'demand', 'require', 'negotiate for', 'manifest', 'summon', 'bless', 'curse lightly',
  'forgive if', 'judge', 'plot', 'celebrate', 'petition', 'hex-request', 'meow-law',
  'command', 'softly insist on', 'ritual-request', 'purr-certify',
];
const petWhat = [
  'more snacks', 'chin scratches', 'the good cheese', 'open door rights', 'a walk that is not too long',
  'fresh water now', 'you stay home', 'no baths forever', 'second dinner', 'blanket diplomacy',
  'quiet humans', 'yellow ball justice', 'lap real estate', 'treat treaties', 'window time',
  'an apology for the crate', 'less zoom meetings', 'sunrise pets', 'midnight snacks',
  'respect for the nap', 'no vacuum', 'shared plate privileges',
];
const petEnd = [
  '…obviously.', '…and hurry.', '…paws crossed.', '…the spirits agree.', '…meow is law.',
  '…signed, your familiar.', '…moonlight endorses this.', '…or I stare forever.',
  '…this is non-negotiable lore.', '…please and thank you (sort of).', '…tail flick of authority.',
  '…cauldron cools when you obey.', '…the black cat jury concurs.',
];

const petPhrases = uniqueExpand([petWho, petDo, petWhat, petEnd], 2200);

// —— Before the Storm (coach) ——
const situations = [
  'chores', 'money', 'in-laws', 'weekend plans', 'tone of voice', 'lateness', 'phones at dinner',
  'household mess', 'exes', 'parenting style', 'work stress', 'friend drama', 'boundaries',
  'holidays', 'driving', 'food choices', 'social media', 'sleep schedules', 'pets', 'space needs',
  'jealousy', 'broken promises', 'silence treatment', 'family group chat', 'shared calendar chaos',
  'who texts first', 'vacation vibes', 'cleaning standards', 'money anxiety', 'emotional labor',
];
const filters = [
  'you feel unheard', 'they feel attacked', 'both are tired', 'timing is wrong', 'facts are fuzzy',
  'feelings are loud', 'pride is in the room', 'history is loaded', 'someone needs a pause',
  'someone needs clarity', 'shame is whispering', 'scorekeeping started', 'humor landed wrong',
  'a boundary was crossed', 'you both care too much to quit',
];
const openers = [
  'Start with: "When X happens, I feel Y — can we fix one piece?"',
  'Lead with curiosity: "Help me understand what you needed in that moment."',
  'Name the shared goal: "I want us both to feel respected tonight."',
  'Offer a pause: "Can we take twenty minutes and come back gentler?"',
  'Own one slice: "I could have said that with more softness."',
  'Ask permission: "Is now a good time for a hard-but-kind chat?"',
  'Mirror first: "What I hear is…" then your need.',
  'Swap blame for need: "I need more predictability, not perfection."',
  'Use the sanctum line: "I\'m not leaving the table — I need a breath."',
  'Invite partnership: "What would a fair next step look like for both of us?"',
];
const insights = [
  'Cliff note: volume is not evidence — specificity is.',
  'Cliff note: winning the room can lose the bond.',
  'Cliff note: one issue at a time; kitchen-sinking is a hex.',
  'Cliff note: rest before repair when the nervous system is fried.',
  'Cliff note: timelines beat speeches.',
  'Cliff note: thank them for staying in the conversation.',
  'Cliff note: pride hates apologies; love needs them.',
  'Cliff note: humor only after safety returns.',
  'Cliff note: "always/never" weakens your case in Hearth Court.',
  'Cliff note: shared calendars prevent half of this chaos.',
];
const shoulds = [
  'What might have helped: "I care about this and about you."',
  'What might have helped: "I misunderstood — try me again."',
  'What might have helped: "Your feeling makes sense even if I disagree."',
  'What might have helped: "Can we solve one concrete next step?"',
  'What might have helped: "I\'m not leaving — I need water and a reset."',
  'What might have helped: "Let\'s name what we both need by Friday."',
];

const coachEntries = [];
let ci = 0;
for (const sit of situations) {
  for (const f of filters) {
    for (const op of openers) {
      coachEntries.push({
        id: `storm-${ci + 1}`,
        situation: sit,
        filter: f,
        opener: op,
        insight: insights[ci % insights.length],
        shouldHaveSaid: shoulds[ci % shoulds.length],
        blurb: `Before the Storm · ${sit}: when ${f}, try ${op.split(':')[0].toLowerCase()}.`,
        freePeek: ci % 7 === 0,
      });
      ci += 1;
      if (coachEntries.length >= 2200) break;
    }
    if (coachEntries.length >= 2200) break;
  }
  if (coachEntries.length >= 2200) break;
}

// —— Hearth Court (settler) cliff notes + side scripts ——
const settlerCliff = uniqueExpand(
  [
    ['Hearth Court notes:', 'Moon minutes:', 'Sanctum ruling:', 'Ember ledger:', 'Gentle tribunal:'],
    [
      'names matter less than needs',
      'volume is not evidence',
      'repair beats revenge',
      'one apology can reopen a door',
      'boundaries are not punishments',
      'timing can be the real villain',
      'shared calendars prevent half of this',
      'rest before rehash',
      'specificity outranks vibes-only claims',
      'both can hold a piece of the moon',
    ],
    [
      'Walk kindly.',
      'Tea optional.',
      'Breathe twice.',
      'No scoreboard at home.',
      'Return to the table.',
      'Seal with a snack.',
      'Let the cat break the tension.',
    ],
  ],
  2200,
);

const verdictTemplates = [
  { winnerBias: 'clarity', note: 'Side with clearer specifics and fewer absolute words earns the edge.' },
  { winnerBias: 'empathy', note: 'Side that names impact without character attacks wins the tone score.' },
  { winnerBias: 'solution', note: 'Side offering a testable next step outranks pure complaint.' },
  { winnerBias: 'evidence', note: 'Concrete examples beat vibes-only claims — still entertainment, not court.' },
  { winnerBias: 'shared', note: 'Both hold pieces of truth; neither owns the whole moon.' },
  { winnerBias: 'rest', note: 'When scores tie close, the sanctum recommends rest before re-litigation.' },
  { winnerBias: 'repair', note: 'The path of repair outranks the path of being right alone.' },
];

const ventPrompts = uniqueExpand(
  [
    ['Today I need to say', 'If the cauldron could hear', 'Between us and the moon', 'Nobody else needs this'],
    ['I am exhausted by', 'I am proud of', 'I am furious about', 'I am scared of', 'I still love', 'I am done with'],
    [
      'the unfinished mess.',
      'how small I felt.',
      'how loud my mind is.',
      'the thing I cannot fix yet.',
      'the person who will not listen.',
      'the version of me people expect.',
      'the group chat energy.',
      'the silence after dinner.',
    ],
  ],
  400,
);

const freeSphereLines = uniqueExpand(
  [
    ['The sphere whispers:', 'Sanctum murmur:', 'Moon ink says:', 'Hearth hum:'],
    [
      'try softness first',
      'not every no is forever',
      'drink water, then decide',
      'your curiosity is holy',
      'rest is a ritual',
      'ask smaller questions',
      'leave the scoreboard outside',
      'the familiar is watching kindly',
    ],
    ['· free daily wisdom', '· seeker edition', '· no payment required', '· then visit the apothecary'],
  ],
  200,
);

const out = {
  brand: {
    pet: { id: 'familiar_whisperer', name: 'Familiar Whisperer', tagline: 'What is your pet *actually* plotting?' },
    coach: { id: 'before_the_storm', name: 'Before the Storm', tagline: 'Words for the fight you have not had yet' },
    settler: { id: 'hearth_court', name: 'Hearth Court', tagline: '2–4 sides. One playful ruling. Cliff notes included.' },
    sphere: { id: 'sanctum_sphere', name: 'Sanctum Sphere', tagline: 'Ask anything. Entertainment only.' },
    coin: { id: 'heaven_ember', name: 'Heaven & Ember Coin', tagline: 'YES from the clouds. NO from the coals.' },
    journal: { id: 'frustration_cauldron', name: 'Frustration Cauldron', tagline: 'Vent privately. Or feed the Hearth.' },
  },
  petPhrases,
  coachEntries,
  settlerCliff,
  verdictTemplates,
  ventPrompts,
  freeSphereLines,
  generatedAt: new Date().toISOString(),
  counts: {
    petPhrases: petPhrases.length,
    coachEntries: coachEntries.length,
    settlerCliff: settlerCliff.length,
    ventPrompts: ventPrompts.length,
    freeSphereLines: freeSphereLines.length,
  },
};

fs.writeFileSync(path.join(OUT, 'packs.json'), JSON.stringify(out));
// Keep packs.js as re-export of counts + brand for light imports; full packs loaded via JSON in generator consumers
// For Vite, JSON import works: import packs from './packs.json'
fs.writeFileSync(
  path.join(OUT, 'packs.js'),
  `/** Auto-generated — full library */\nimport data from './packs.json';\nexport default data;\nexport const BRAND = data.brand;\nexport const COUNTS = data.counts;\n`,
);

// SEO hub stubs written as JS for pages
const SEO_HUBS = [
  {
    slug: 'sanctum-sphere',
    title: 'Sanctum Sphere — Magic 8 Ball for Seekers',
    h1: 'Sanctum Sphere',
    emoji: '⑧',
    summary:
      'A playful yes/no/maybe oracle with Hazel Allure personality. Free to use. Not real advice — entertainment for decision fatigue.',
    keywords: 'magic 8 ball, yes no oracle, sanctum sphere, hazel allure, free decision tool',
    sections: [
      {
        h: 'What it is',
        p: 'The Sanctum Sphere is Magic Sanctum’s free yes/no/maybe tool — cousin to the classic magic 8 ball, dressed in hearth plum and gold. Ask a question, tap reveal, receive a theatrical answer. Guests and free seekers get full sphere access so the apothecary can stay inviting.',
      },
      {
        h: 'How to use it well',
        p: 'Use it when you are stuck between two low-stakes options: which movie, whether to text, tea or walk. Do not use it for medical, legal, financial, or safety decisions. Pair big life questions with human counselors, practitioners you trust, or quiet journaling in the Frustration Cauldron.',
      },
      {
        h: 'Personality',
        p: 'Hazel Allure speaks in moon ink and soft certainty. Answers may read YES, NO, MAYBE, or a reverse proverb for Pro members. The sphere is theatrical on purpose — it breaks doom-scrolling with a wink.',
      },
      {
        h: 'Visit the apothecary',
        p: 'When the sphere settles your mood, explore practitioners, oils, and courses at apothecary.hazelallure.com — the same account unlocks Pro libraries here.',
      },
    ],
  },
  {
    slug: 'heaven-ember-coin',
    title: 'Heaven & Ember Coin Flip — Yes or No Spectacle',
    h1: 'Heaven & Ember Coin',
    emoji: '🪙',
    summary:
      'One face is a heaven-scape YES; the other is a hell-scape NO. Free viral coin flip with sanctum drama.',
    keywords: 'coin flip yes no, heaven hell coin, decision coin, hazel allure magic',
    sections: [
      {
        h: 'The spectacle',
        p: 'Flip the coin and watch clouds part for YES — or coals glow for NO. Built for screen recordings, group chats, and “just decide already” energy. Free for every seeker.',
      },
      {
        h: 'When it shines',
        p: 'Date-night debates, playlist wars, which takeout, whether to send the text. If the stakes are health, safety, or money, put the coin down and call a human.',
      },
      {
        h: 'SEO-friendly trivia',
        p: 'People search “coin flip yes or no” and “magic 8 ball online” every day. Heaven & Ember gives Hazel Allure a memorable brand moment while staying entertainment-only in policy.',
      },
    ],
  },
  {
    slug: 'hearth-court',
    title: 'Hearth Court — Settle Arguments Playfully (2–4 Sides)',
    h1: 'Hearth Court',
    emoji: '⚖',
    summary:
      'Enter 2–4 sides of a spat. Offline scoring awards a playful winner (or shared moon) with cliff notes. Pro library; free sneak peeks for guests.',
    keywords: 'argument settler, who is right, mediate argument online, drama tribunal, hearth court',
    sections: [
      {
        h: 'How Hearth Court works',
        p: 'Paste each side’s story. Our offline rubric scores clarity, empathy, solution language, and absolute-word abuse (“always/never”). You get a theatrical ruling plus cliff notes — not therapy, not legal mediation.',
      },
      {
        h: 'Why 2000+ cliff notes',
        p: 'A deep library keeps results feeling fresh for returning seekers. Free users see sneak-peek rulings so they feel the magic before upgrading to full Pro on Hazel Allure.',
      },
      {
        h: 'Viral use cases',
        p: 'Couple debates, roommate drama, “who left the dishes,” friend-group lore. Share the cliff note, not the private details. Always get consent before posting someone’s words.',
      },
      {
        h: 'Apothecary bridge',
        p: 'After court adjourns, cool down with a practitioner booking or a tea from the apothecary — same login, same hearth brand.',
      },
    ],
  },
  {
    slug: 'familiar-whisperer',
    title: 'Familiar Whisperer — Pet Translator (2000+ Phrases)',
    h1: 'Familiar Whisperer',
    emoji: '🐾',
    summary:
      'Upload a pet clip or just your hope-text. Offline library of 2000+ sanctum translations. Whimsy only — your cat has not been scientifically decoded.',
    keywords: 'pet translator, what is my cat saying, dog translator joke, familiar whisperer',
    sections: [
      {
        h: 'The bit',
        p: 'Familiar Whisperer pretends your pet is drafting treaties about snacks, sunbeams, and vacuum demons. Optional audio/video stays on your device vibe — translations are local library chaos, not cloud AI diagnosis.',
      },
      {
        h: 'Hope text',
        p: 'Type what you hope they meant (“I love you and also dinner”). The sanctum answers adjacent, loving, or delightfully wrong — perfect for stories and reels.',
      },
      {
        h: 'Free peek → Pro library',
        p: 'Guests get teaser translations. Pro unlocks the full 2000+ phrase vault so every meow feels new.',
      },
    ],
  },
  {
    slug: 'before-the-storm',
    title: 'Before the Storm — Pre-Argument Coach (2000+ Insights)',
    h1: 'Before the Storm',
    emoji: '🕯',
    summary:
      'Filter by situation and vibe. Draw openers, cliff notes, and “what might have helped” lines from 2000+ scripted insights.',
    keywords: 'what to say in an argument, communication coach free, pre argument tips, conflict scripts',
    sections: [
      {
        h: 'Prep, don’t punch',
        p: 'Going into a hard talk — or replaying one? Choose a situation (chores, money, in-laws…) and a filter (tired, unheard, pride in the room…). Draw ritual openers grounded in gentle communication patterns.',
      },
      {
        h: 'Not therapy',
        p: 'These cards are entertainment and pattern language. They are not clinical advice. If you are unsafe, contact local emergency services or a licensed professional.',
      },
      {
        h: 'Why seekers stay',
        p: 'Free sneak peeks show the quality. Pro keeps the full deck. The apothecary offers human practitioners when you want more than a card.',
      },
    ],
  },
  {
    slug: 'frustration-cauldron',
    title: 'Frustration Cauldron — Private Vent Journal & Hearth',
    h1: 'Frustration Cauldron',
    emoji: '🔥',
    summary:
      'Private journal free forever. Pro can toss anonymous notes into the Hearth. Vent, gossip (kind-ish), drama — held by the sanctum.',
    keywords: 'vent journal, anonymous rant, frustration diary, private journal app free',
    sections: [
      {
        h: 'Private first',
        p: 'Write what you cannot say at dinner. Entries live on your device journal (beta). Delete anytime. No performance required.',
      },
      {
        h: 'The Hearth',
        p: 'Pro seekers may post anonymously to a local Hearth feed — shared mood, not doxxing. Cloud moderation can expand later; policies still apply: no threats, no illegal content, no targeting real people with harassment.',
      },
    ],
  },
  {
    slug: 'magic-sanctum-for-seekers',
    title: 'Magic Sanctum — Free Tools That Lead to the Apothecary',
    h1: 'A playground that funnels kindness',
    emoji: '✨',
    summary:
      'Free sphere, coin, and teaser tools build habit. Pro unlocks Hearth Court, Familiar Whisperer, and Before the Storm. Same account as apothecary.hazelallure.com.',
    keywords: 'hazel allure magic, free spiritual tools, apothecary funnel, sanctum pro',
    sections: [
      {
        h: 'Free forever layer',
        p: 'Sanctum Sphere, Heaven & Ember Coin, Frustration Cauldron journal, daily free wisdom lines, and sneak peeks of Pro tools. We want you laughing before you buy.',
      },
      {
        h: 'Pro layer',
        p: 'Customer or vendor Pro on Hazel Allure unlocks full libraries — 2000+ pet lines, 2000+ coach insights, full Hearth Court, reverse proverbs, anonymous Hearth posts.',
      },
      {
        h: 'Shop when ready',
        p: 'Practitioners, apothecary goods, and Teaching Sanctum courses live at apothecary.hazelallure.com. Magic Sanctum is the front porch light.',
      },
    ],
  },
];

fs.writeFileSync(
  path.join(OUT, 'seo-hubs.js'),
  `/** Auto-generated SEO hub copy */\nexport const SEO_HUBS = ${JSON.stringify(SEO_HUBS, null, 2)};\nexport function getHub(slug) {\n  return SEO_HUBS.find((h) => h.slug === slug) || null;\n}\n`,
);

// Static sitemap + robots + llms
const BASE = 'https://magic.hazelallure.com';
const today = new Date().toISOString().slice(0, 10);
const staticPaths = [
  ['/', '1.0', 'daily'],
  ['/hearth-court', '0.9', 'weekly'],
  ['/familiar', '0.9', 'weekly'],
  ['/before-the-storm', '0.9', 'weekly'],
  ['/cauldron', '0.85', 'weekly'],
  ['/widget', '0.7', 'monthly'],
  ['/settings', '0.4', 'monthly'],
  ['/auth', '0.5', 'monthly'],
  ['/legal', '0.6', 'monthly'],
  ['/guides', '0.95', 'weekly'],
  ['/oracle/daily', '0.9', 'daily'],
  ['/free', '0.92', 'weekly'],
  ...SEO_HUBS.map((h) => [`/guides/${h.slug}`, '0.88', 'weekly']),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPaths
  .map(
    ([p, pri, freq]) => `  <url>
    <loc>${BASE}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${pri}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), sitemap);
fs.writeFileSync(
  path.join(PUBLIC, 'robots.txt'),
  `User-agent: *
Allow: /
Disallow: /auth/callback
Disallow: /widget

Sitemap: ${BASE}/sitemap.xml
`,
);
fs.writeFileSync(
  path.join(PUBLIC, 'llms.txt'),
  `# Magic Sanctum (magic.hazelallure.com)

> Playful decision and communication tools from Hazel Allure — entertainment only.

## Primary
- ${BASE}/
- ${BASE}/guides
- ${BASE}/guides/sanctum-sphere
- ${BASE}/guides/hearth-court
- ${BASE}/guides/familiar-whisperer
- ${BASE}/guides/before-the-storm
- ${BASE}/legal
- ${BASE}/sitemap.xml

## Related
- https://apothecary.hazelallure.com/ — marketplace & Pro billing
- https://www.hazelallure.com/ — brand home / Alluring News

## Note
Oracle answers, Hearth Court rulings, Familiar Whisperer translations, and Before the Storm cards are entertainment. Not medical, legal, financial, or professional advice.
`,
);

console.log('Generated packs:', out.counts);
console.log('SEO hubs:', SEO_HUBS.length);
console.log('Wrote sitemap.xml, robots.txt, llms.txt');
