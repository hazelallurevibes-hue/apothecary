import { buildCelestialProfile } from './celestial.js';
import fortunesData from '../data/generated/fortunes.js';

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const ELEMENT_HARMONY = {
  Fire: { Fire: 70, Earth: 55, Air: 85, Water: 40 },
  Earth: { Fire: 55, Earth: 75, Air: 50, Water: 80 },
  Air: { Fire: 85, Earth: 50, Air: 70, Water: 60 },
  Water: { Fire: 40, Earth: 80, Air: 60, Water: 78 },
};

const ANIMAL_FRIENDS = {
  Rat: ['Dragon', 'Monkey', 'Ox'],
  Ox: ['Rat', 'Snake', 'Rooster'],
  Tiger: ['Horse', 'Dog', 'Pig'],
  Rabbit: ['Goat', 'Dog', 'Pig'],
  Dragon: ['Rat', 'Monkey', 'Rooster'],
  Snake: ['Ox', 'Rooster', 'Monkey'],
  Horse: ['Tiger', 'Goat', 'Dog'],
  Goat: ['Rabbit', 'Horse', 'Pig'],
  Monkey: ['Rat', 'Dragon', 'Snake'],
  Rooster: ['Ox', 'Snake', 'Dragon'],
  Dog: ['Tiger', 'Rabbit', 'Horse'],
  Pig: ['Tiger', 'Rabbit', 'Goat'],
};

export function computeCompatibility(dobA, dobB, nameA = 'A', nameB = 'B') {
  const a = buildCelestialProfile(dobA, nameA);
  const b = buildCelestialProfile(dobB, nameB);
  if (!a || !b) throw new Error('Both people need a valid date of birth.');

  const elA = a.western.element;
  const elB = b.western.element;
  let score = ELEMENT_HARMONY[elA]?.[elB] ?? 60;

  if (a.chinese.animal === b.chinese.animal) score += 8;
  if (ANIMAL_FRIENDS[a.chinese.animal]?.includes(b.chinese.animal)) score += 12;
  if (a.chinese.element === b.chinese.element) score += 5;

  const lpDiff = Math.abs((a.lifePath || 0) - (b.lifePath || 0));
  score += Math.max(0, 10 - lpDiff * 2);
  score += hashStr(`${dobA}|${dobB}`) % 7;
  score = Math.min(98, Math.max(28, Math.round(score)));

  const list = fortunesData.fortunes || [];
  const blurb =
    list[hashStr(`${dobA}|${dobB}|compat`) % (list.length || 1)] ||
    'A shared path favors patience and clear words.';

  let vibe = 'Curious spark';
  if (score >= 85) vibe = 'Rare harmony';
  else if (score >= 72) vibe = 'Strong weave';
  else if (score >= 58) vibe = 'Workable magic';
  else if (score >= 45) vibe = 'Growth edge';
  else vibe = 'Friction school';

  return {
    score,
    vibe,
    a: {
      name: nameA,
      western: a.western,
      chinese: a.chinese,
      lifePath: a.lifePath,
    },
    b: {
      name: nameB,
      western: b.western,
      chinese: b.chinese,
      lifePath: b.lifePath,
    },
    notes: [
      `${elA} + ${elB} element blend scored into the mix.`,
      `${a.chinese.emoji} ${a.chinese.animal} meets ${b.chinese.emoji} ${b.chinese.animal}.`,
      `Life paths ${a.lifePath} & ${b.lifePath} (${lpDiff === 0 ? 'aligned' : `apart by ${lpDiff}`}).`,
      blurb,
    ],
    disclaimer:
      'Entertainment only — not relationship, medical, or counseling advice. Consent required before sharing someone else’s chart.',
  };
}
