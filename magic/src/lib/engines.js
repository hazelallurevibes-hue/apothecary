import packs from '../data/generated/packs.js';

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

export const ORACLE_ANSWERS = [
  { text: 'YES', tone: 'yes' },
  { text: 'NO', tone: 'no' },
  { text: 'MAYBE', tone: 'maybe' },
  { text: 'ASK AGAIN LATER', tone: 'maybe' },
  { text: 'THE MOON SAYS YES', tone: 'yes' },
  { text: 'NOT THIS PATH', tone: 'no' },
  { text: 'SIP WATER FIRST', tone: 'maybe' },
  { text: 'THE FAMILIAR APPROVES', tone: 'yes' },
];

export function askOracle(question, mode = 'classic') {
  const seed = `${question}|${Date.now()}`;
  if (mode === 'reverse') {
    const proverbs = [
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
    ];
    return { text: pick(proverbs, seed), kind: 'proverb' };
  }
  return { ...pick(ORACLE_ANSWERS, seed), kind: 'classic' };
}

export function flipCoin() {
  return Math.random() < 0.5 ? 'yes' : 'no';
}

export function freeDailyLine() {
  return pick(packs.freeSphereLines, String(Math.floor(Date.now() / 86400000)));
}

/**
 * Hearth Court — offline heuristic (entertainment).
 */
export function settleArgument(sides, { freePeek = false } = {}) {
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

  const notes = ranked.map((s, i) => {
    const bits = [];
    if (i === 0 && !close) bits.push('Strongest overall on clarity + tone.');
    if (/\b(always|never)\b/i.test(s.text)) bits.push('Absolute words weakened the claim.');
    if (/\b(let's|plan|try|agree)\b/i.test(s.text)) bits.push('Offered a path forward.');
    if (/\bi feel\b/i.test(s.text)) bits.push('Owned feeling language — solid.');
    if (!bits.length) bits.push('Middle of the pack; more specifics would help.');
    return { label: s.label, score: Math.round(s.score), notes: freePeek ? bits.slice(0, 1) : bits };
  });

  return {
    winner: close ? null : top.label,
    shared: close,
    template,
    cliffNote: freePeek ? `${String(cliff).slice(0, 80)}…` : cliff,
    sides: freePeek ? notes.slice(0, 2) : notes,
    librarySize: packs.counts?.settlerCliff || packs.settlerCliff?.length || 0,
    freePeek,
    disclaimer:
      'Entertainment only. Not legal, therapeutic, or professional mediation. Hearth Court is playful theater.',
  };
}

export function translatePet({ hope, fileName, durationHint, freePeek = false } = {}) {
  const seed = `${hope || ''}|${fileName || ''}|${durationHint || ''}|${Date.now()}`;
  const phrase = pick(packs.petPhrases, seed);
  const hopeLine = hope
    ? `You hoped they meant: "${hope}". The Familiar Whisperer hears something adjacent — or delightfully wrong.`
    : 'No hope text — pure chaos translation engaged.';
  return {
    translation: freePeek ? `${String(phrase).slice(0, 90)}…` : phrase,
    hopeLine: freePeek ? 'Pro unlocks the full translation vault + confidence theater.' : hopeLine,
    confidence: freePeek ? 33 + (hashStr(seed) % 12) : 40 + (hashStr(seed) % 45),
    librarySize: packs.counts?.petPhrases || packs.petPhrases?.length || 0,
    freePeek,
    disclaimer:
      'Familiar Whisperer is pure whimsy. Your pet has not been scientifically decoded.',
  };
}

export function coachArgument({ situation, stage, detail, freePeek = false } = {}) {
  const pool = packs.coachEntries || [];
  const sit = (situation || '').toLowerCase();
  const stageKey = (stage || '').toLowerCase();
  let filtered = pool.filter(
    (e) =>
      (!sit || e.situation.includes(sit) || sit.includes(e.situation)) &&
      (!stageKey || e.filter.includes(stageKey) || stageKey.includes(e.filter.split(' ')[0])),
  );
  if (filtered.length < 5) filtered = pool;
  const seed = `${situation}|${stage}|${detail}|${Date.now()}`;
  const primary = pick(filtered, seed);
  const alts = freePeek
    ? []
    : [1, 2, 3].map((n) => pick(filtered, seed + n)).filter(Boolean);
  return {
    primary: freePeek
      ? {
          ...primary,
          shouldHaveSaid: 'Pro unlocks “what might have helped” lines + more cards.',
          insight: primary?.insight,
        }
      : primary,
    alternatives: alts,
    librarySize: pool.length,
    freePeek,
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
