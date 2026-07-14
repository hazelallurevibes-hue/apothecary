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

export const ORACLE_ANSWERS = [
  { text: 'YES', tone: 'yes' },
  { text: 'NO', tone: 'no' },
  { text: 'MAYBE', tone: 'maybe' },
  { text: 'ASK AGAIN LATER', tone: 'maybe' },
  { text: 'THE MOON SAYS YES', tone: 'yes' },
  { text: 'NOT THIS PATH', tone: 'no' },
  { text: 'SIP WATER FIRST', tone: 'maybe' },
  { text: 'THE FAMILIAR APPROVES', tone: 'yes' },
  { text: 'STIR, THEN DECIDE', tone: 'maybe' },
  { text: 'GOLD DOOR OPENS', tone: 'yes' },
  { text: 'WAIT FOR SOFTNESS', tone: 'maybe' },
  { text: 'THE HEARTH SAYS NO', tone: 'no' },
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
];

export function askOracle(question, mode = 'classic') {
  const seed = `${question}|${Date.now()}`;
  if (mode === 'reverse') {
    // Full proverb vault for Pro; classic path also used by free peek via showcase in UI
    return {
      text: pick(PRO_PROVERBS, seed),
      kind: 'proverb',
      depth: 'full',
      seal: 'Moon Mirror · full vault',
      alternatives: pickN(PRO_PROVERBS, seed + 'alts', 3).filter((t) => t),
    };
  }
  const ans = pick(ORACLE_ANSWERS, seed);
  return {
    ...ans,
    kind: 'classic',
    whisper: pick(
      [
        'The sphere glows warm.',
        'Gold dust settles on the answer.',
        'A familiar tail flicks once.',
        'The hearth hums agreement.',
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
 * freePeek: full showcase ruling (awesome sample).
 * Pro: live scoring + multi notes + ritual score + library cliff notes.
 */
export function settleArgument(sides, { freePeek = false } = {}) {
  if (freePeek) {
    const sample = pickShowcase(SHOWCASE_COURT, Date.now());
    return {
      ...sample,
      librarySize: packs.counts?.settlerCliff || packs.settlerCliff?.length || 0,
      freePeek: true,
      proUnlocks: [
        'Endless cliff-note library (2,800+)',
        'Live scoring of your real sides (up to 4)',
        'Multi-device polls + anonymous Hearth court',
        'Ritual score + share seals for every ruling',
      ],
      disclaimer:
        'Entertainment only. Not legal, therapeutic, or professional mediation. Showcase ruling is a sample of Pro theater.',
    };
  }

  const cleaned = (sides || [])
    .map((s, i) => ({
      index: i,
      label: s.label || `Side ${i + 1}`,
      text: String(s.text || '').trim(),
    }))
    .filter((s) => s.text.length > 0)
    .slice(0, 4);

  if (cleaned.length < 2) {
    return { error: 'Hearth Court needs at least 2 sides with text.' };
  }

  const scoreSide = (s) => {
    const t = s.text.toLowerCase();
    let score = Math.min(40, t.length / 8);
    score += (t.match(/\b(because|when|on|after|before|exactly|specifically|\d+)\b/g) || []).length * 6;
    score += (t.match(/\b(let's|we can|next|plan|try|agree|compromise|schedule)\b/g) || []).length * 8;
    score -= (t.match(/\b(always|never|everyone|nobody|hate|stupid)\b/g) || []).length * 7;
    score -= (t.match(/\b(you always|you never|your fault|idiot|liar)\b/g) || []).length * 10;
    score += (t.match(/\b(i feel|i hear|we both|together|sorry|understand)\b/g) || []).length * 7;
    score += (t.match(/\b(appreciate|thank|grateful|love|care)\b/g) || []).length * 5;
    return score;
  };

  const ranked = cleaned
    .map((s) => ({ ...s, score: scoreSide(s) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const second = ranked[1];
  const close = Math.abs(top.score - second.score) < 8;
  const template = pick(packs.verdictTemplates, top.text + second.text);
  const cliff = pick(packs.settlerCliff, top.text + Date.now());
  const cliffAlt = pick(packs.settlerCliff, top.text + 'alt' + Date.now());

  const notes = ranked.map((s, i) => {
    const bits = [];
    if (i === 0 && !close) bits.push('Strongest overall on clarity + tone.');
    if (i === 0 && close) bits.push('Near tie — edge is soft; shared moon energy.');
    if (/\b(always|never)\b/i.test(s.text)) bits.push('Absolute words weakened the claim.');
    if (/\b(let's|plan|try|agree)\b/i.test(s.text)) bits.push('Offered a path forward.');
    if (/\bi feel\b/i.test(s.text)) bits.push('Owned feeling language — solid.');
    if (/\b(sorry|understand|hear you)\b/i.test(s.text)) bits.push('Repair language detected — court smiles.');
    if (s.text.length > 180) bits.push('Rich detail helped the case.');
    if (!bits.length) bits.push('Middle of the pack; more specifics would help.');
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
    seal: close ? 'Shared moon · Pro seal' : `Edge to ${top.label} · Pro seal`,
    depth: 'full',
    librarySize: packs.counts?.settlerCliff || packs.settlerCliff?.length || 0,
    freePeek: false,
    proUnlocks: [],
    disclaimer:
      'Entertainment only. Not legal, therapeutic, or professional mediation. Hearth Court is playful theater.',
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
  return {
    translation: phrase,
    hopeLine,
    confidence: 55 + (hashStr(seed) % 40),
    mood: pick(moods, seed),
    aura: pick(['gold', 'violet', 'rose', 'amber', 'moon'], seed),
    alternatives: alt,
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
  return {
    primary: {
      ...primary,
      ritual: pick(
        [
          'Sip water · name one feeling · ask permission to talk',
          'Hands soft · shoulders down · one genuine question',
          'Set a timer · no scorekeeping · reconvene with tea',
          'One issue only · one next step · one kind close',
        ],
        seed,
      ),
      aura: pick(['plum', 'gold', 'moon', 'rose'], seed),
    },
    alternatives: alts,
    librarySize: pool.length,
    freePeek: false,
    depth: 'full',
    seal: 'Storm deck · Pro full draw',
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
