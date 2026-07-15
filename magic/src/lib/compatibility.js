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

const ELEMENT_MEANING = {
  Fire: 'Action, spark, courage — can warm or scorch.',
  Earth: 'Steadiness, body, practical care — can hold or stick.',
  Air: 'Ideas, talk, curiosity — can connect or scatter.',
  Water: 'Feeling, intuition, memory — can soothe or flood.',
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

export const CATEGORY_META = {
  elements: {
    label: 'Element blend',
    origin: 'Western astrology elements (Fire, Earth, Air, Water)',
    meaning: 'How your default styles of action and feeling mix — entertainment pattern language.',
    tip: 'Different elements are not failure; they need translation, not conversion.',
  },
  animals: {
    label: 'Chinese animals',
    origin: 'Chinese zodiac animal years (playful folklore, not destiny)',
    meaning: 'Symbolic “clan” energy — friends, friction, humor.',
    tip: 'Use for icebreakers and stories, never to control someone.',
  },
  lifePath: {
    label: 'Life paths',
    origin: 'Numerology-style life path digits from birth date (modern popular practice)',
    meaning: 'A simple number game for themes like leadership, care, or craft.',
    tip: 'Close numbers can feel “same page”; far numbers can teach patience.',
  },
  spark: {
    label: 'Shared spark line',
    origin: 'Sanctum fortune library seeded by both birthdays',
    meaning: 'A poetic line for sharing — not a prediction.',
    tip: 'If it lands, talk about it; if not, laugh and keep consent first.',
  },
};

export function computeCompatibility(dobA, dobB, nameA = 'A', nameB = 'B') {
  const a = buildCelestialProfile(dobA, nameA);
  const b = buildCelestialProfile(dobB, nameB);
  if (!a || !b) throw new Error('Both people need a valid date of birth (YYYY-MM-DD).');

  const elA = a.western.element;
  const elB = b.western.element;
  let elementScore = ELEMENT_HARMONY[elA]?.[elB] ?? 60;

  let animalScore = 55;
  if (a.chinese.animal === b.chinese.animal) animalScore = 78;
  else if (ANIMAL_FRIENDS[a.chinese.animal]?.includes(b.chinese.animal)) animalScore = 82;
  else animalScore = 48 + (hashStr(a.chinese.animal + b.chinese.animal) % 20);

  const lpDiff = Math.abs((a.lifePath || 0) - (b.lifePath || 0));
  const lifePathScore = Math.min(92, Math.max(35, 88 - lpDiff * 8));

  let score = Math.round(elementScore * 0.4 + animalScore * 0.35 + lifePathScore * 0.25);
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

  const categories = [
    {
      id: 'elements',
      score: Math.round(elementScore),
      detail: `${elA} (${ELEMENT_MEANING[elA] || ''}) meets ${elB} (${ELEMENT_MEANING[elB] || ''})`,
      ...CATEGORY_META.elements,
    },
    {
      id: 'animals',
      score: Math.round(animalScore),
      detail: `${a.chinese.emoji} ${a.chinese.animal} with ${b.chinese.emoji} ${b.chinese.animal}`,
      ...CATEGORY_META.animals,
    },
    {
      id: 'lifePath',
      score: Math.round(lifePathScore),
      detail: `Paths ${a.lifePath} & ${b.lifePath} (${lpDiff === 0 ? 'aligned' : `apart by ${lpDiff}`})`,
      ...CATEGORY_META.lifePath,
    },
    {
      id: 'spark',
      score: 50 + (hashStr(blurb) % 40),
      detail: blurb,
      ...CATEGORY_META.spark,
    },
  ];

  return {
    score,
    vibe,
    a: {
      name: nameA,
      western: a.western,
      chinese: a.chinese,
      lifePath: a.lifePath,
      elementMeaning: ELEMENT_MEANING[elA],
    },
    b: {
      name: nameB,
      western: b.western,
      chinese: b.chinese,
      lifePath: b.lifePath,
      elementMeaning: ELEMENT_MEANING[elB],
    },
    categories,
    notes: [
      `${elA} + ${elB} element blend scored into the mix.`,
      `${a.chinese.emoji} ${a.chinese.animal} meets ${b.chinese.emoji} ${b.chinese.animal}.`,
      `Life paths ${a.lifePath} & ${b.lifePath} (${lpDiff === 0 ? 'aligned' : `apart by ${lpDiff}`}).`,
      blurb,
    ],
    keepTips: [
      'Name one need without blame this week.',
      'Shared calendar beats mind-reading.',
      'Celebrate one small repair, not only big romance.',
      'If conflict is unsafe, stop the game and get real help.',
    ],
    mysticalExtras: [
      { label: 'Money vibe (playful)', text: score % 2 === 0 ? 'Budget talks may feel easier after food and rest.' : 'Price honesty builds trust faster than grand gestures.' },
      { label: 'Career weave (playful)', text: lpDiff <= 2 ? 'Similar work rhythms — protect quiet hours together.' : 'Different work tempos — schedule check-ins, not surveillance.' },
    ],
    disclaimer:
      'Entertainment only — not relationship, medical, financial, or counseling advice. Consent required before sharing someone else’s chart.',
  };
}
