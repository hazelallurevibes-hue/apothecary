const fs = require('fs');
const path = 'src/lib/engines.js';
let s = fs.readFileSync(path, 'utf8');
const start = s.indexOf('/**\n * Hearth Court');
const end = s.indexOf('export function translatePet');
if (start < 0 || end < 0) {
  console.error('markers', start, end);
  process.exit(1);
}
const next = `/**
 * Hearth Court — offline heuristic (entertainment).
 * freePeek: curated showcase (no user sides needed)
 * freeBasic: free users score REAL arguments + votes (basic notes, 2 sides)
 * full Pro: multi notes, full library cliffs, secondary seal, ritual score
 */
const FREE_BASIC_CLIFFS = [
  'Hearth Court (free): clarity and kindness scored highest. Pick one next step tonight — entertainment only.',
  'Basic sanctum ruling: the side with specifics and a plan edges ahead. Softness still wins the room.',
  'Computer decision: less always/never, more here is what we try next. Walk kindly.',
  'Free tribunal note: both can be partly right. Name one feeling and one fix before dessert.',
  'Playful edge awarded. Rest before rehash if voices are loud. Not legal advice — just the moon winking.',
];

const FREE_COURT_PRO_UNLOCKS = [
  '2,800+ rotating cliff notes (never the same seal twice)',
  '3–4 sides, multi-device live polls friends join on their phones',
  'Anonymous public court feed + secondary Pro seals',
  'Full ritual score + richer per-side notes for share cards',
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
      label: s.label || \`Side \${i + 1}\`,
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
    score += (t.match(/\\b(because|when|on|after|before|exactly|specifically|\\d+)\\b/g) || []).length * 6;
    score += (t.match(/\\b(let's|we can|next|plan|try|agree|compromise|schedule)\\b/g) || []).length * 8;
    score -= (t.match(/\\b(always|never|everyone|nobody|hate|stupid)\\b/g) || []).length * 7;
    score -= (t.match(/\\b(you always|you never|your fault|idiot|liar)\\b/g) || []).length * 10;
    score += (t.match(/\\b(i feel|i hear|we both|together|sorry|understand)\\b/g) || []).length * 7;
    score += (t.match(/\\b(appreciate|thank|grateful|love|care)\\b/g) || []).length * 5;
    score += Math.min(12, (s.votes || 0) * 3);
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
      let bit = 'Heard by the court — more specifics would help.';
      if (i === 0 && !close) bit = 'Strongest overall on clarity + tone.';
      else if (i === 0 && close) bit = 'Near tie — soft edge / shared moon energy.';
      else if (/\\b(always|never)\\b/i.test(s.text)) bit = 'Absolute words weakened the claim.';
      else if (/\\b(let's|plan|try|agree)\\b/i.test(s.text)) bit = 'Offered a path forward.';
      else if (/\\bi feel\\b/i.test(s.text)) bit = 'Owned feeling language — solid.';
      if ((s.votes || 0) > 0) bit += \` Crowd: \${s.votes} vote(s).\`;
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
      seal: close ? 'Shared moon · free basic' : \`Edge to \${top.label} · free basic\`,
      depth: 'free_basic',
      freeBasic: true,
      freePeek: false,
      librarySize: packs.counts?.settlerCliff || packs.settlerCliff?.length || 0,
      proUnlocks: FREE_COURT_PRO_UNLOCKS,
      disclaimer:
        'Entertainment only. Not legal, therapeutic, or professional mediation. Free basic decision — Pro unlocks the full cliff library & live court.',
    };
  }

  const cliff = pick(packs.settlerCliff, top.text + Date.now());
  const cliffAlt = pick(packs.settlerCliff, top.text + 'alt' + Date.now());

  const notes = ranked.map((s, i) => {
    const bits = [];
    if (i === 0 && !close) bits.push('Strongest overall on clarity + tone.');
    if (i === 0 && close) bits.push('Near tie — edge is soft; shared moon energy.');
    if (/\\b(always|never)\\b/i.test(s.text)) bits.push('Absolute words weakened the claim.');
    if (/\\b(let's|plan|try|agree)\\b/i.test(s.text)) bits.push('Offered a path forward.');
    if (/\\bi feel\\b/i.test(s.text)) bits.push('Owned feeling language — solid.');
    if (/\\b(sorry|understand|hear you)\\b/i.test(s.text)) bits.push('Repair language detected — court smiles.');
    if (s.text.length > 180) bits.push('Rich detail helped the case.');
    if ((s.votes || 0) > 0) bits.push(\`Crowd energy: \${s.votes} vote(s).\`);
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
    seal: close ? 'Shared moon · Pro seal' : \`Edge to \${top.label} · Pro seal\`,
    depth: 'full',
    librarySize: packs.counts?.settlerCliff || packs.settlerCliff?.length || 0,
    freePeek: false,
    freeBasic: false,
    proUnlocks: [],
    disclaimer:
      'Entertainment only. Not legal, therapeutic, or professional mediation. Hearth Court is playful theater.',
  };
}

`;
s = s.slice(0, start) + next + s.slice(end);
fs.writeFileSync(path, s);
console.log('patched settleArgument ok', s.includes('freeBasic'));
