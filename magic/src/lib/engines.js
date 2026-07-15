import packs from '../data/generated/packs.js';
import {
  SHOWCASE_PET,
  SHOWCASE_COACH,
  SHOWCASE_COURT,
  SHOWCASE_MOON_MIRROR,
  pickShowcase,
} from './showcaseSamples.js';

function hashStr(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(list, seed) {
  if (!list?.length) return null;
  return list[hashStr(seed) % list.length];
}

function pickN(list, seed, n) {
  if (!list?.length) return [];
  const out = [];
  const used = new Set();
  for (let i = 0; i < n * 3 && out.length < n; i++) {
    const item = pick(list, `${seed}|${i}`);
    const key = typeof item === 'string' ? item : item?.id || JSON.stringify(item);
    if (used.has(key)) continue;
    used.add(key);
    out.push(item);
  }
  return out;
}

/** Classic 8-ball style — short YES / NO / MAYBE with flavor */
export const ORACLE_ANSWERS = [
  { text: 'YES', tone: 'yes', flavor: 'Clear as gold. Move with it.' },
  { text: 'YES', tone: 'yes', flavor: 'The sphere leans toward you.' },
  { text: 'YES — GO', tone: 'yes', flavor: 'Soft green light. Take the step.' },
  { text: 'THE MOON SAYS YES', tone: 'yes', flavor: 'Night air agrees with you.' },
  { text: 'SIGNS POINT TO YES', tone: 'yes', flavor: 'Classic 8-ball certainty.' },
  { text: 'IT IS CERTAIN', tone: 'yes', flavor: 'No wobble in the window.' },
  { text: 'YOU MAY RELY ON IT', tone: 'yes', flavor: 'Steady. Kind. Forward.' },
  { text: 'YES · GENTLY', tone: 'yes', flavor: 'Not a sprint — a soft green light.' },
  { text: 'HEARTH SAYS YES', tone: 'yes', flavor: 'Warm coal, open door.' },
  { text: 'ALIGNED · YES', tone: 'yes', flavor: 'Your question and path agree.' },
  { text: 'PROCEED WITH CARE', tone: 'yes', flavor: 'Yes, with a boundary in your pocket.' },
  { text: 'THE FAMILIAR NODS', tone: 'yes', flavor: 'Snack diplomacy approved.' },
  { text: 'GOLD LIGHT · YES', tone: 'yes', flavor: 'Rim of the sphere catches firelight.' },
  { text: 'YES IF YOU REST FIRST', tone: 'yes', flavor: 'Permission after one glass of water.' },
  { text: 'NO', tone: 'no', flavor: 'Not this path — not tonight.' },
  { text: 'NO', tone: 'no', flavor: 'The coal side of the coin.' },
  { text: 'NOT THIS PATH', tone: 'no', flavor: 'A closed door can be mercy.' },
  { text: 'DON\'T COUNT ON IT', tone: 'no', flavor: 'Protect your energy.' },
  { text: 'MY SOURCES SAY NO', tone: 'no', flavor: 'The familiar shakes its head.' },
  { text: 'OUTLOOK NOT SO GOOD', tone: 'no', flavor: 'Wait for softer weather.' },
  { text: 'THE HEARTH SAYS NO', tone: 'no', flavor: 'Stay by the fire a while.' },
  { text: 'NOT YET', tone: 'no', flavor: 'Timing is the medicine.' },
  { text: 'REDIRECT', tone: 'no', flavor: 'This no is a map to another door.' },
  { text: 'PROTECT YOUR PEACE', tone: 'no', flavor: 'Decline is a form of self-love.' },
  { text: 'LEAVE IT ON THE PORCH', tone: 'no', flavor: 'Not every package is for you.' },
  { text: 'THE SCALES SAY NO', tone: 'no', flavor: 'Weight of the choice tips away.' },
  { text: 'MAYBE', tone: 'maybe', flavor: 'Neither yes nor no — breathe first.' },
  { text: 'ASK AGAIN LATER', tone: 'maybe', flavor: 'The answer is still steeping.' },
  { text: 'CANNOT PREDICT NOW', tone: 'maybe', flavor: 'Fog on the glass. Try again.' },
  { text: 'SIP WATER FIRST', tone: 'maybe', flavor: 'Body first, then the question.' },
  { text: 'STIR, THEN DECIDE', tone: 'maybe', flavor: 'One more stir of the cauldron.' },
  { text: 'REPLY HAZY', tone: 'maybe', flavor: 'Come back with a clearer ask.' },
  { text: 'BETTER NOT TELL YOU NOW', tone: 'maybe', flavor: 'Mystery for a reason.' },
  { text: 'CONCENTRATE AND ASK AGAIN', tone: 'maybe', flavor: 'The sphere wants your full heart.' },
  { text: 'SLEEP ON IT', tone: 'maybe', flavor: 'Dawn answers differently sometimes.' },
  { text: 'BOTH PATHS HOLD TRUTH', tone: 'maybe', flavor: 'Shared moon energy — not a trap.' },
  { text: 'NAME THE NEED FIRST', tone: 'maybe', flavor: 'Clarity before commitment.' },
  { text: 'CHECK YOUR BODY', tone: 'maybe', flavor: 'Gut, shoulders, jaw — then ask.' },
  { text: 'ORACLE IS STEEPING', tone: 'maybe', flavor: 'Tea first. Verdict later.' },
  { text: 'YES · WITH BOUNDARIES', tone: 'yes', flavor: 'Green light — and a fence that loves you.' },
  { text: 'THE PORCH SAYS YES', tone: 'yes', flavor: 'Come in. Shoes optional. Honesty required.' },
  { text: 'INK SAYS GO', tone: 'yes', flavor: 'Write the first line before doubt edits it.' },
  { text: 'TRUST THE SOFT YES', tone: 'yes', flavor: 'Not loud — but real.' },
  { text: 'NO · FOR YOUR FUTURE', tone: 'no', flavor: 'This no is a gift to tomorrow-you.' },
  { text: 'STEP BACK', tone: 'no', flavor: 'Distance is a spell of clarity.' },
  { text: 'NOT YOUR LOAD', tone: 'no', flavor: 'Put the bag down. It was never yours alone.' },
  { text: 'HOLD THE LINE', tone: 'no', flavor: 'Boundary stands. Kindly. Firmly.' },
  { text: 'ASK YOUR BODY AGAIN', tone: 'maybe', flavor: 'Shoulders up? Jaw tight? That’s data.' },
  { text: 'TWO TEAS, THEN TALK', tone: 'maybe', flavor: 'Ritual before reaction.' },
  { text: 'DRAW ANOTHER CARD', tone: 'maybe', flavor: 'Not stalling — gathering light.' },
  { text: 'MOON IS HALF', tone: 'maybe', flavor: 'Neither full yes nor empty no.' },
  { text: 'YES · SEAL IT', tone: 'yes', flavor: 'Decide once. Then protect the decision.' },
  { text: 'THE CAULDRON AGREES', tone: 'yes', flavor: 'Something good is already brewing.' },
  { text: 'WALK TOWARD WARMTH', tone: 'yes', flavor: 'Choose the room that softens your shoulders.' },
  { text: 'NO · NOT TONIGHT', tone: 'no', flavor: 'Tomorrow’s moon may answer differently.' },
  { text: 'CLOSE THE TAB', tone: 'no', flavor: 'This is doom-scroll, not destiny.' },
  { text: 'ASK A HUMAN', tone: 'maybe', flavor: 'The sphere bows to real counsel.' },
  { text: 'COUNT TO THREE', tone: 'maybe', flavor: 'Impulse is loud. Wisdom is quieter.' },
];

/** Pro-only reverse proverb vault (free gets showcase samples via freePeek path) */
const PRO_PROVERBS = [
  'The answer you fear may be the door you need.',
  'Silence sometimes speaks louder than certainty.',
  'What you chase might already be chasing you.',
  'Not every no is a closed path — some are redirects.',
  'The mirror shows what you bring to it.',
  'Doubt is the shadow of a question worth asking.',
  'Let the unknown be a guest, not an enemy.',
  'Reverse the question — what do you already know?',
  'The hearth warms what you feed it.',
  'Even the sphere shrugs sometimes — that is wisdom too.',
  'Softness is not weakness; it is strategy.',
  'Leave the scoreboard outside the sanctum.',
  'A quiet yes is still a yes — listen for the velvet edge.',
  'The gold rim holds more than answers; it holds your breath.',
  'If the familiar blinks twice, wait one more moonbeat.',
  'What you refuse to name will keep knocking gently.',
  'The cauldron remembers kindness longer than cleverness.',
  'Turn the question upside down; the root may be mercy.',
  'Not all locked doors are locked against you.',
  'Your next honest sentence is already a spell.',
  'The porch light stays on for those who return softer.',
  'Sometimes the sanctum answers with a question that frees you.',
  'Proverb of the gold rim: hurry is not destiny.',
  'What you water with attention becomes the garden.',
  'A boundary spoken kindly is still a boundary.',
  'The storm is information; the shelter is choice.',
  'You are allowed to outgrow a path you once needed.',
  'Rest is a strategy, not a moral failure.',
  'Ask what the youngest part of you is afraid of — then answer that.',
  'The familiar of envy points to a neglected wish.',
  'If the yes needs a costume of perfection, it is still a no.',
  'Moon Mirror: reverse the blame; keep the lesson.',
  'Trade certainty for curiosity for one evening.',
  'The answer under the answer is often “I want to feel safe.”',
  'Pro seal: name three options, then burn the fourth imaginary one.',
  'What would you choose if no one were watching the score?',
  'The hearth does not grade your feelings — only how you carry them.',
  'A delayed decision is still a decision: protect the pause.',
  'If both paths hurt a little, pick the pain that grows you.',
  'The sphere prefers honest fog to a pretty lie.',
  'Sanctum counsel: put the phone down; put the question in the body.',
  'Your reputation is not the same as your soul’s work.',
  'Pro depth: the third option is often “ask for help.”',
  'When the mirror fogs, wipe with kindness, not force.',
  'The coin of Heaven & Ember has two faces; so does most loyalty.',
  'What you call procrastination may be unfinished grief.',
  'Let one small ritual mark the choice so your nervous system can rest.',
  'Pro depth: the answer is rarely more speed — it is cleaner consent.',
  'If the familiar hides, the room is too loud; lower the lights first.',
  'Moon Mirror seal: reverse the story until the villain becomes a need.',
  'What you call laziness may be grief wearing soft clothes.',
  'A yes without a date is a maybe wearing perfume.',
  'Sanctum counsel: schedule the hard talk like a guest you respect.',
  'The gold rim does not grade your feelings — only whether you named them.',
  'If both options hurt, choose the pain that includes rest afterward.',
  'Proverb of the quiet hearth: reputation is weather; character is climate.',
  'Leave one door open for grace — including your own.',
  'The sphere prefers a specific question to a beautiful panic.',
  'When pride and love argue, let curiosity hold the gavel.',
  'Your next kind boundary is a Pro-level spell, free of charge.',
  'What would the wisest version of you do after one glass of water?',
  'The coin of Heaven & Ember has two faces; so does most loyalty — choose which one you feed.',
  'Pro seal: if you need three people to approve a yes, it is already a maybe.',
  'The sanctum does not reward self-erasure — only honest trade-offs.',
  'When the familiar sits on the laptop, the work can wait five minutes.',
  'A soft no today can be a loud yes after rest.',
  'Mirror note: reverse the audience — would you still choose this alone?',
  'If the path needs a costume, it may not fit your bones.',
  'Cliff of the week: schedule repair before you schedule revenge.',
];

/**
 * Weighted 8-ball: question language leans the pool, then hash picks within lean.
 * Entertainment algorithm — not prediction science.
 */
function leanOraclePool(question = '') {
  const q = String(question || '').toLowerCase();
  let bias = 0; // negative → no, positive → yes, near 0 → maybe
  if (/\b(should i|is it (ok|okay|safe|wise)|can i|will it work|go for it|take the leap)\b/.test(q)) bias += 1;
  if (/\b(love|trust|heal|grow|rest|gentle|kind|help)\b/.test(q)) bias += 1;
  if (/\b(afraid|anxious|panic|force|rush|prove|revenge|punish)\b/.test(q)) bias -= 1;
  if (/\b(quit|leave|end it|break up|ghost|steal|lie)\b/.test(q)) bias -= 1;
  if (/\b(maybe|unsure|confused|either|both|wait|later)\b/.test(q)) bias = 0;
  if (q.length < 8) bias = 0; // short asks stay balanced
  const yes = ORACLE_ANSWERS.filter((a) => a.tone === 'yes');
  const no = ORACLE_ANSWERS.filter((a) => a.tone === 'no');
  const maybe = ORACLE_ANSWERS.filter((a) => a.tone === 'maybe');
  if (bias >= 2) return [...yes, ...yes, ...maybe, ...ORACLE_ANSWERS];
  if (bias <= -2) return [...no, ...no, ...maybe, ...ORACLE_ANSWERS];
  if (bias === 1) return [...yes, ...maybe, ...ORACLE_ANSWERS];
  if (bias === -1) return [...no, ...maybe, ...ORACLE_ANSWERS];
  return ORACLE_ANSWERS;
}

export function askOracle(question, mode = 'classic') {
  const seed = `${question}|${Date.now()}`;
  if (mode === 'reverse') {
    // Full proverb vault for Pro; classic path also used by free peek via showcase in UI
    const pool = PRO_PROVERBS;
    const text = pick(pool, seed);
    // Prefer proverbs that echo question keywords when possible
    const words = String(question || '')
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 4)
      .slice(0, 6);
    let preferred = pool;
    if (words.length) {
      const hit = pool.filter((p) => words.some((w) => p.toLowerCase().includes(w)));
      if (hit.length >= 3) preferred = hit;
    }
    return {
      text: pick(preferred, seed),
      kind: 'proverb',
      depth: 'full',
      seal: 'Moon Mirror · full vault',
      alternatives: pickN(pool, seed + 'alts', 4).filter((t) => t && t !== text),
      algorithm: 'keyword-echo · proverb vault',
    };
  }
  const pool = leanOraclePool(question);
  const ans = pick(pool, seed);
  return {
    text: ans.text,
    tone: ans.tone,
    flavor: ans.flavor || '',
    kind: 'classic',
    algorithm: 'weighted lean · combinatorial flavor',
    whisper: ans.flavor
      || pick(
        [
          'The sphere glows warm.',
          'Gold dust settles on the answer.',
          'A familiar tail flicks once.',
          'The hearth hums agreement.',
          'Ink settles on the window like dew.',
          'The gold rim catches your breath — then answers.',
        ],
        seed,
      ),
  };
}

/** Free users: polished Moon Mirror showcase (complete, beautiful). Pro: full vault. */
export function askMoonMirror(question, { freePeek = false } = {}) {
  const seed = `${question}|mirror|${Date.now()}`;
  if (freePeek) {
    const text = pickShowcase(SHOWCASE_MOON_MIRROR, seed);
    return {
      text,
      kind: 'proverb',
      freePeek: true,
      depth: 'showcase',
      seal: 'Free showcase proverb — Pro unlocks 20+ rotating Moon Mirror lines + alts',
      alternatives: [],
    };
  }
  return askOracle(question, 'reverse');
}

export function flipCoin() {
  return Math.random() < 0.5 ? 'yes' : 'no';
}

export function freeDailyLine() {
  return pick(packs.freeSphereLines, String(Math.floor(Date.now() / 86400000)));
}

/**
 * Hearth Court — offline heuristic (entertainment).
 * freePeek: curated showcase (no user sides needed)
 * freeBasic: free users score REAL arguments + votes (basic notes, 2 sides)
 * full Pro: multi notes, full library cliffs, secondary seal, ritual score
 */
const FREE_BASIC_CLIFFS = [
  'The hearth hears both paths. Choose the next kind step before the next hard word.',
  'Shared moon energy: neither path is trash — name one need and one boundary, then rest.',
  'Clarity and repair language lit the stronger path. Absolute words dimmed the other.',
  'Free circle seal: both can hold medicine. Name one feeling and one fix before the night ends.',
  'The scales lean gently. Rest before rehash if voices are loud. Not legal advice — the moon only winks.',
  'Offer a plan, not a verdict on anyone’s soul. Entertainment seal only.',
];

const FREE_COURT_PRO_UNLOCKS = [
  '2,800+ rotating cliff seals (never the same oracle twice)',
  '3–4 paths, living multi-device circle friends join on their phones',
  'Anonymous veil feed + secondary Pro seals',
  'Full ritual score + richer per-path notes for share cards',
];

export function settleArgument(sides, { freePeek = false, freeBasic = false } = {}) {
  if (freePeek) {
    const sample = pickShowcase(SHOWCASE_COURT, Date.now());
    return {
      ...sample,
      librarySize: packs.counts?.settlerCliff || packs.settlerCliff?.length || 0,
      freePeek: true,
      freeBasic: false,
      proUnlocks: FREE_COURT_PRO_UNLOCKS,
      disclaimer:
        'Entertainment only. Not legal, therapeutic, or professional mediation. Showcase ruling is a sample of Pro theater.',
    };
  }

  const maxSides = freeBasic ? 2 : 4;
  const cleaned = (sides || [])
    .map((s, i) => ({
      index: i,
      label: s.label || `Side ${i + 1}`,
      text: String(s.text || '').trim(),
      votes: Number(s.votes) || 0,
    }))
    .filter((s) => s.text.length > 0)
    .slice(0, maxSides);

  if (cleaned.length < 2) {
    return { error: 'Hearth Court needs at least 2 sides with text.' };
  }

  const scoreSide = (s) => {
    const t = s.text.toLowerCase();
    let score = Math.min(40, t.length / 8);
    // Specificity & timeline
    score += (t.match(/\b(because|when|on|after|before|exactly|specifically|\d+|today|tonight|friday|week)\b/g) || []).length * 6;
    // Forward motion / plan language
    score += (t.match(/\b(let's|we can|next|plan|try|agree|compromise|schedule|propose|offer)\b/g) || []).length * 8;
    // Absolute / character attacks
    score -= (t.match(/\b(always|never|everyone|nobody|hate|stupid)\b/g) || []).length * 7;
    score -= (t.match(/\b(you always|you never|your fault|idiot|liar|useless|crazy)\b/g) || []).length * 10;
    // Ownership & repair
    score += (t.match(/\b(i feel|i hear|we both|together|sorry|understand|my part|i own)\b/g) || []).length * 7;
    score += (t.match(/\b(appreciate|thank|grateful|love|care|respect)\b/g) || []).length * 5;
    // Boundary without cruelty
    score += (t.match(/\b(boundary|need|limit|space|consent)\b/g) || []).length * 4;
    // Length bonus caps — walls of text without structure plateau
    if (t.length > 120 && !/\b(i feel|because|plan|next)\b/.test(t)) score -= 4;
    // Stone / vote energy
    score += Math.min(12, (s.votes || 0) * 3);
    // Tiny novelty so equal arguments don't always freeze the same way
    score += (hashStr(s.label + t.slice(0, 40)) % 5);
    return score;
  };

  const ranked = cleaned
    .map((s) => ({ ...s, score: scoreSide(s) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const second = ranked[1];
  const close = Math.abs(top.score - second.score) < 8;
  const template = pick(packs.verdictTemplates, top.text + second.text);

  if (freeBasic) {
    const notes = ranked.map((s, i) => {
      let bit = 'Heard by the circle — more specifics would strengthen the seal.';
      if (i === 0 && !close) bit = 'Strongest path on clarity, tone, and forward motion.';
      else if (i === 0 && close) bit = 'Near balance — soft lean / shared moon energy.';
      else if (/\b(always|never)\b/i.test(s.text)) bit = 'Absolute words thinned the spell of the case.';
      else if (/\b(let's|plan|try|agree)\b/i.test(s.text)) bit = 'Offered a path forward — the hearth favors this.';
      else if (/\bi feel\b/i.test(s.text)) bit = 'Owned feeling language — solid magick of honesty.';
      if ((s.votes || 0) > 0) bit += ` Stones cast: ${s.votes}.`;
      return { label: s.label, score: Math.round(s.score), notes: [bit] };
    });
    const cliff = pick(FREE_BASIC_CLIFFS, top.text + Date.now());
    return {
      winner: close ? null : top.label,
      shared: close,
      template,
      cliffNote: cliff,
      secondaryCliff: null,
      sides: notes,
      ritualScore: null,
      seal: close ? 'Shared moon · free seal' : `Lean to ${top.label} · free seal`,
      depth: 'free_basic',
      freeBasic: true,
      freePeek: false,
      librarySize: packs.counts?.settlerCliff || packs.settlerCliff?.length || 0,
      proUnlocks: FREE_COURT_PRO_UNLOCKS,
      disclaimer:
        'Entertainment only. Not legal, therapeutic, or professional mediation. Free oracle seal — Pro unlocks the full cliff library & living multi-device circle.',
    };
  }

  const cliff = pick(packs.settlerCliff, top.text + Date.now());
  const cliffAlt = pick(packs.settlerCliff, top.text + 'alt' + Date.now());

  const notes = ranked.map((s, i) => {
    const bits = [];
    if (i === 0 && !close) bits.push('Strongest path on clarity, tone, and forward motion.');
    if (i === 0 && close) bits.push('Near balance — soft lean; shared moon energy.');
    if (/\b(always|never)\b/i.test(s.text)) bits.push('Absolute words thinned the spell of the case.');
    if (/\b(let's|plan|try|agree)\b/i.test(s.text)) bits.push('Offered a path forward — the hearth favors this.');
    if (/\bi feel\b/i.test(s.text)) bits.push('Owned feeling language — solid magick of honesty.');
    if (/\b(sorry|understand|hear you)\b/i.test(s.text)) bits.push('Repair language detected — the circle softens.');
    if (s.text.length > 180) bits.push('Rich detail fed the oracle.');
    if ((s.votes || 0) > 0) bits.push(`Stone energy: ${s.votes} cast.`);
    if (!bits.length) bits.push('Middle of the weave; more specifics would help.');
    return { label: s.label, score: Math.round(s.score), notes: bits };
  });

  const ritualScore = Math.min(
    99,
    Math.round(55 + Math.abs(top.score - second.score) + (close ? 20 : 10) + (hashStr(top.text) % 15)),
  );

  return {
    winner: close ? null : top.label,
    shared: close,
    template,
    cliffNote: cliff,
    secondaryCliff: cliffAlt,
    sides: notes,
    ritualScore,
    seal: close ? 'Shared moon · Pro circle seal' : `Lean to ${top.label} · Pro circle seal`,
    depth: 'full',
    librarySize: packs.counts?.settlerCliff || packs.settlerCliff?.length || 0,
    freePeek: false,
    freeBasic: false,
    proUnlocks: [],
    disclaimer:
      'Entertainment only. Not legal, therapeutic, or professional mediation. Hearth Court is a metaphysical decision ritual — not a verdict on anyone’s worth.',
  };
}

export function translatePet({ hope, fileName, durationHint, freePeek = false } = {}) {
  const seed = `${hope || ''}|${fileName || ''}|${durationHint || ''}|${Date.now()}`;

  if (freePeek) {
    const sample = pickShowcase(SHOWCASE_PET, seed);
    return {
      ...sample,
      librarySize: packs.counts?.petPhrases || packs.petPhrases?.length || 0,
      freePeek: true,
      proUnlocks: [
        '2,800+ phrase vault that remixes your hope text',
        'Higher confidence theater + aura moods',
        'Media-name easter eggs',
        'Unlimited fresh whispers (no showcase rotation limit)',
      ],
      disclaimer: 'Familiar Whisperer is pure whimsy. Your pet has not been scientifically decoded.',
    };
  }

  const phrase = pick(packs.petPhrases, seed);
  const hopeLine = hope
    ? `You hoped they meant: "${hope}". The Familiar Whisperer hears something adjacent — or delightfully wrong.`
    : 'No hope text — pure chaos translation engaged.';
  const alt = pickN(packs.petPhrases, seed + 'alt', 2);
  const moods = [
    'sovereign · snack diplomacy',
    'sunbeam politics',
    'treaty mode',
    'night rites',
    'lap real estate claims',
    'vacuum tribunal',
  ];
  const proCategories = [
    {
      label: 'Bond seal',
      text: pick(
        [
          'Tonight: one uninterrupted presence block (no phone) for five minutes.',
          'Name one need of theirs without solving it first.',
          'Offer a treat treaty — negotiated, not demanded.',
        ],
        seed + 'bond',
      ),
    },
    {
      label: 'Territory note',
      text: pick(
        [
          'They claim a window, a lap, or a sock. Respect the claim; share the rest.',
          'Zoomies after dark are ritual, not rebellion.',
          'Shoes on the floor are fair game under ancient familiar law.',
        ],
        seed + 'terr',
      ),
    },
    {
      label: 'Care reminder',
      text: pick(
        [
          'Water, rest, and a soft voice beat one more toy.',
          'If behavior changed suddenly, check health with a real vet — this is whimsy only.',
          'Play is medicine when schedules get loud.',
        ],
        seed + 'care',
      ),
    },
  ];

  return {
    translation: phrase,
    hopeLine,
    confidence: 55 + (hashStr(seed) % 40),
    mood: pick(moods, seed),
    aura: pick(['gold', 'violet', 'rose', 'amber', 'moon'], seed),
    alternatives: alt,
    proCategories,
    secondaryWhisper: pick(packs.petPhrases, seed + 'sec'),
    ritualScore: 60 + (hashStr(seed) % 35),
    seal: 'Full vault whisper · Pro',
    librarySize: packs.counts?.petPhrases || packs.petPhrases?.length || 0,
    freePeek: false,
    proUnlocks: [],
    disclaimer: 'Familiar Whisperer is pure whimsy. Your pet has not been scientifically decoded.',
  };
}

export function coachArgument({ situation, stage, detail, freePeek = false } = {}) {
  const pool = packs.coachEntries || [];
  const seed = `${situation}|${stage}|${detail}|${Date.now()}`;

  if (freePeek) {
    const sample = pickShowcase(SHOWCASE_COACH, seed);
    return {
      primary: sample,
      alternatives: [],
      librarySize: pool.length,
      freePeek: true,
      depth: 'showcase',
      proUnlocks: [
        '2,800+ filtered insight cards',
        '3 alternate cards per draw',
        'Ritual openers matched to your situation',
        '“What might have helped” lines every time',
      ],
      disclaimer:
        'Insight cards are scripted entertainment and pattern language — not therapy or legal counsel.',
    };
  }

  const sit = (situation || '').toLowerCase();
  const stageKey = (stage || '').toLowerCase();
  let filtered = pool.filter(
    (e) =>
      (!sit || e.situation.includes(sit) || sit.includes(e.situation)) &&
      (!stageKey || e.filter.includes(stageKey) || stageKey.includes(e.filter.split(' ')[0])),
  );
  if (filtered.length < 5) filtered = pool;
  const primary = pick(filtered, seed);
  const alts = [1, 2, 3, 4].map((n) => pick(filtered, seed + n)).filter(Boolean);
  const proLayers = [
    {
      label: 'Body check',
      text: pick(
        [
          'Before the talk: jaw soft, feet on floor, one full exhale.',
          'If your voice shakes, slow the pace — not the honesty.',
          'Hands unclenched. Heart still allowed to care.',
        ],
        seed + 'body',
      ),
    },
    {
      label: 'One-issue frame',
      text: pick(
        [
          `Situation filter: ${situation || 'general'} — keep the talk inside this room only.`,
          'Name the topic in one sentence before any history tour.',
          'If scorekeeping starts, pause and return to the single issue.',
        ],
        seed + 'frame',
      ),
    },
    {
      label: 'Repair seed',
      text: pick(
        [
          'End with one shared next step and a time — vague peace rarely holds.',
          'Thank them for staying in the hard talk, even if unfinished.',
          'If unsafe, stop. Entertainment tips are not crisis care.',
        ],
        seed + 'repair',
      ),
    },
    {
      label: 'Detail echo',
      text: detail?.trim()
        ? `You named: “${String(detail).trim().slice(0, 120)}” — let that be the map, not the whole war.`
        : 'No detail given — Pro still filters by situation and stage; add a sentence next draw for sharper cards.',
    },
  ];
  return {
    primary: {
      ...primary,
      ritual: pick(
        [
          'Sip water · name one feeling · ask permission to talk',
          'Hands soft · shoulders down · one genuine question',
          'Set a timer · no scorekeeping · reconvene with tea',
          'One issue only · one next step · one kind close',
          'Stand · stretch · then sit for the first sentence',
          'Phone face-down · timer on · kindness on purpose',
        ],
        seed,
      ),
      aura: pick(['plum', 'gold', 'moon', 'rose', 'violet', 'amber'], seed),
    },
    alternatives: alts,
    proLayers,
    librarySize: pool.length,
    freePeek: false,
    depth: 'full',
    seal: 'Storm deck · Pro full draw',
    ritualScore: 55 + (hashStr(seed) % 40),
    proUnlocks: [],
    disclaimer:
      'Insight cards are scripted entertainment and pattern language — not therapy or legal counsel.',
  };
}

export function randomVentPrompt() {
  return pick(packs.ventPrompts, String(Date.now())) || 'Write what the cauldron can hold.';
}

export function packStats() {
  return packs.counts || {};
}

export function brandFromPacks() {
  return packs.brand || {};
}
