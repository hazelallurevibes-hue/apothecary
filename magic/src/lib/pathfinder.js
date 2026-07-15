/** Free Pathfinder — career / money / aptitude sparks (combinatorial offline pack) */

function expand(parts, target) {
  const out = new Set();
  const [a, b, c = [''], d = ['']] = parts;
  outer: for (const w of a) {
    for (const x of b) {
      for (const y of c) {
        for (const z of d) {
          const line = [w, x, y, z].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
          if (line.length > 20) out.add(line);
          if (out.size >= target) break outer;
        }
      }
    }
  }
  let i = 0;
  const base = [...out];
  while (out.size < target && base.length) {
    out.add(`${base[i % base.length]} · path seal ${i + 1}`);
    i += 1;
  }
  return [...out].slice(0, target);
}

const openers = [
  'Your path favors',
  'Career ink says',
  'Money rhythm leans toward',
  'Aptitude spark:',
  'The road ahead rewards',
  'Sanctum pathfinder notes',
  'For your next chapter',
  'When you choose work that',
];
const middles = [
  'steady craft over loud titles',
  'service that still pays rent',
  'creative problem-solving under gentle pressure',
  'teaching what you just learned',
  'organizing chaos into calendars',
  'hands-on making or fixing',
  'listening before leading',
  'numbers with a human story',
  'design that feels like hospitality',
  'healing-adjacent support (not clinical advice)',
  'sales with honesty, not pressure',
  'research, pattern-finding, quiet wins',
];
const closers = [
  '— start with one small paid experiment this month.',
  '— protect two deep-work hours before inbox.',
  '— ask a mentor one clear question, not permission.',
  '— track money weekly so fear gets less airtime.',
  '— entertainment insight only; hire humans for taxes and contracts.',
  '— pair this with a practitioner chat when the stakes feel high.',
  '— write three skills you already have; price one of them.',
  '— rest is part of the path, not a detour.',
];

export const PATH_LINES = expand([openers, middles, closers], 3200);

export const APTITUDE_QUESTIONS = [
  {
    id: 'energy',
    q: 'Where does your energy return fastest?',
    options: [
      { id: 'people', label: 'Helping people face-to-face', tracks: { people: 2, service: 1 } },
      { id: 'make', label: 'Making or fixing things', tracks: { craft: 2, build: 1 } },
      { id: 'ideas', label: 'Ideas, writing, design', tracks: { creative: 2, mind: 1 } },
      { id: 'order', label: 'Systems, numbers, plans', tracks: { order: 2, money: 1 } },
    ],
  },
  {
    id: 'money',
    q: 'What feels true about money right now?',
    options: [
      { id: 'stability', label: 'I want steady, predictable income', tracks: { order: 2, money: 2 } },
      { id: 'upside', label: 'I want upside even with risk', tracks: { creative: 1, build: 2 } },
      { id: 'enough', label: 'Enough + meaning beats maximum', tracks: { service: 2, people: 1 } },
      { id: 'learn', label: 'I need literacy before leaps', tracks: { mind: 2, money: 1 } },
    ],
  },
  {
    id: 'conflict',
    q: 'In hard talks at work, you usually…',
    options: [
      { id: 'mediate', label: 'Mediate and find middle ground', tracks: { people: 2, service: 1 } },
      { id: 'clarify', label: 'Clarify facts and next steps', tracks: { order: 2, mind: 1 } },
      { id: 'create', label: 'Reframe with a new idea', tracks: { creative: 2 } },
      { id: 'build', label: 'Fix the underlying process', tracks: { craft: 1, build: 2 } },
    ],
  },
  {
    id: 'day',
    q: 'Ideal workday shape?',
    options: [
      { id: 'solo', label: 'Long solo focus blocks', tracks: { mind: 2, craft: 1 } },
      { id: 'collab', label: 'Meetings + collaboration', tracks: { people: 2 } },
      { id: 'mix', label: 'Mix of deep work and people', tracks: { service: 1, creative: 1, people: 1 } },
      { id: 'field', label: 'On the move / hands-on', tracks: { build: 2, craft: 1 } },
    ],
  },
  {
    id: 'gift',
    q: 'Friends say you are gifted at…',
    options: [
      { id: 'listen', label: 'Listening without fixing too fast', tracks: { people: 2, service: 1 } },
      { id: 'beauty', label: 'Making things beautiful or clear', tracks: { creative: 2 } },
      { id: 'reliable', label: 'Being reliable with details', tracks: { order: 2, money: 1 } },
      { id: 'courage', label: 'Starting what others postpone', tracks: { build: 2 } },
    ],
  },
];

const TRACK_LABELS = {
  people: { name: 'People path', color: 'rose', tip: 'Roles with care, hospitality, coaching vibe (not clinical advice).' },
  service: { name: 'Service path', color: 'amber', tip: 'Support, operations that help humans feel held.' },
  craft: { name: 'Craft path', color: 'orange', tip: 'Making, repairing, tactile skill, artisanal work.' },
  build: { name: 'Builder path', color: 'teal', tip: 'Projects, startups-of-one, shipping tangible outcomes.' },
  creative: { name: 'Creative path', color: 'violet', tip: 'Writing, design, content, symbolic work.' },
  mind: { name: 'Mind path', color: 'indigo', tip: 'Research, analysis, teaching ideas.' },
  order: { name: 'Order path', color: 'stone', tip: 'Systems, admin, logistics, quality control.' },
  money: { name: 'Money literacy', color: 'emerald', tip: 'Budgets, pricing, sales integrity — still not financial advice.' },
};

function hashStr(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function scoreAptitude(answers = {}) {
  const scores = {};
  for (const q of APTITUDE_QUESTIONS) {
    const choiceId = answers[q.id];
    const opt = q.options.find((o) => o.id === choiceId);
    if (!opt) continue;
    for (const [k, v] of Object.entries(opt.tracks || {})) {
      scores[k] = (scores[k] || 0) + v;
    }
  }
  const ranked = Object.entries(scores)
    .map(([id, n]) => ({ id, n, ...TRACK_LABELS[id] }))
    .sort((a, b) => b.n - a.n);
  const top = ranked[0] || { id: 'mind', name: 'Mind path', tip: 'Curiosity is a career.', n: 1 };
  const line = PATH_LINES[hashStr(JSON.stringify(answers) + top.id) % PATH_LINES.length];
  const moneyLine = PATH_LINES[hashStr(`money|${JSON.stringify(answers)}`) % PATH_LINES.length];
  return {
    top,
    ranked: ranked.slice(0, 4),
    pathLine: line,
    moneyLine,
    librarySize: PATH_LINES.length,
    tips: [
      'Write one skill you can trade for money this month (even small).',
      'Protect two deep-work hours before inbox three days a week.',
      'For contracts, taxes, or licensed advice — hire a human professional.',
      'Apothecary practitioners can support nervous-system rest; they are not career counselors unless they state that clearly.',
    ],
    disclaimer:
      'Entertainment and reflection only — not career counseling, financial, medical, or professional advice.',
  };
}

export function drawPathSpark(seed = Date.now()) {
  return PATH_LINES[hashStr(String(seed)) % PATH_LINES.length];
}
