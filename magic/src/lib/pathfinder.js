/** Pathfinder — career, money literacy, aptitude + MBTI-style path weave (entertainment) */

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
  'Your temperament map points to',
  'Path & personality weave:',
  'Vocational seal:',
  'The hearth of your work wants',
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
  'strategy rooms that still leave room for rest',
  'building systems others can trust',
  'storytelling that moves decisions, not just moods',
  'mentoring without martyrdom',
  'pricing your skill before you undercut it',
  'partnerships where roles are named out loud',
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
  '— name your non-negotiables before the next offer.',
  '— schedule a money date with yourself every Sunday.',
  '— document one win so your confidence has evidence.',
  '— leave one door open for a path you have not tried.',
];

export const PATH_LINES = expand([openers, middles, closers], 4200);

/** Free aptitude (5 questions) — robust career + money tracks */
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

/**
 * Free teaser: 4 dichotomies, 1 item each (quick MBTI-style spark)
 * Pro: full 12-item battery (3 per dichotomy) + career weave
 */
export const MBTI_TEASER_QUESTIONS = [
  {
    id: 'ei1',
    dim: 'EI',
    q: 'After a long social stretch, you usually…',
    options: [
      { id: 'e', label: 'Feel charged — ready for one more conversation', pole: 'E' },
      { id: 'i', label: 'Need quiet to refill before more people', pole: 'I' },
    ],
  },
  {
    id: 'sn1',
    dim: 'SN',
    q: 'When learning something new, you prefer…',
    options: [
      { id: 's', label: 'Concrete steps, examples, what works now', pole: 'S' },
      { id: 'n', label: 'The big picture, patterns, future possibilities', pole: 'N' },
    ],
  },
  {
    id: 'tf1',
    dim: 'TF',
    q: 'A tough team decision should weight…',
    options: [
      { id: 't', label: 'Logic, fairness rules, and clear criteria first', pole: 'T' },
      { id: 'f', label: 'Impact on people and harmony first', pole: 'F' },
    ],
  },
  {
    id: 'jp1',
    dim: 'JP',
    q: 'Your natural work style leans…',
    options: [
      { id: 'j', label: 'Plan, decide, close loops', pole: 'J' },
      { id: 'p', label: 'Keep options open; adapt as you go', pole: 'P' },
    ],
  },
];

export const MBTI_PRO_QUESTIONS = [
  ...MBTI_TEASER_QUESTIONS,
  {
    id: 'ei2',
    dim: 'EI',
    q: 'In a brainstorm, you tend to…',
    options: [
      { id: 'e', label: 'Think out loud and build on the room', pole: 'E' },
      { id: 'i', label: 'Form ideas privately, then share polished thoughts', pole: 'I' },
    ],
  },
  {
    id: 'ei3',
    dim: 'EI',
    q: 'Your ideal recovery after a deadline is…',
    options: [
      { id: 'e', label: 'Celebrate with people', pole: 'E' },
      { id: 'i', label: 'Disappear into a book, walk, or solo hobby', pole: 'I' },
    ],
  },
  {
    id: 'sn2',
    dim: 'SN',
    q: 'When someone describes a problem, you first ask…',
    options: [
      { id: 's', label: 'What exactly happened? What are the facts?', pole: 'S' },
      { id: 'n', label: 'What might this mean? Where could it lead?', pole: 'N' },
    ],
  },
  {
    id: 'sn3',
    dim: 'SN',
    q: 'You trust a plan more when it has…',
    options: [
      { id: 's', label: 'Proven tactics and measurable milestones', pole: 'S' },
      { id: 'n', label: 'A compelling vision and room to invent', pole: 'N' },
    ],
  },
  {
    id: 'tf2',
    dim: 'TF',
    q: 'Feedback you give usually starts with…',
    options: [
      { id: 't', label: 'What is true / incorrect / incomplete', pole: 'T' },
      { id: 'f', label: 'How it may land and how to keep dignity', pole: 'F' },
    ],
  },
  {
    id: 'tf3',
    dim: 'TF',
    q: 'You feel more respected when others…',
    options: [
      { id: 't', label: 'Argue ideas with you honestly', pole: 'T' },
      { id: 'f', label: 'Check in on how you are holding up', pole: 'F' },
    ],
  },
  {
    id: 'jp2',
    dim: 'JP',
    q: 'Facing a messy project, you prefer to…',
    options: [
      { id: 'j', label: 'Make a structure and stick to checkpoints', pole: 'J' },
      { id: 'p', label: 'Explore until the right approach appears', pole: 'P' },
    ],
  },
  {
    id: 'jp3',
    dim: 'JP',
    q: 'Deadlines make you…',
    options: [
      { id: 'j', label: 'Calm once a plan exists — stress without one', pole: 'J' },
      { id: 'p', label: 'Alive under pressure — stress from rigid plans', pole: 'P' },
    ],
  },
];

const TRACK_LABELS = {
  people: {
    name: 'People path',
    color: 'rose',
    tip: 'Roles with care, hospitality, coaching presence (not clinical advice).',
    careers: ['Community host', 'Client success', 'Teaching aide', 'Hospitality lead', 'Peer mentor'],
  },
  service: {
    name: 'Service path',
    color: 'amber',
    tip: 'Support and operations that help humans feel held.',
    careers: ['Operations support', 'Care coordinator', 'Nonprofit ops', 'Guest experience', 'Onboarding guide'],
  },
  craft: {
    name: 'Craft path',
    color: 'orange',
    tip: 'Making, repairing, tactile skill, artisanal work.',
    careers: ['Maker / artisan', 'Technician', 'Restoration', 'Studio craft', 'Quality craftsmanship'],
  },
  build: {
    name: 'Builder path',
    color: 'teal',
    tip: 'Projects, startups-of-one, shipping tangible outcomes.',
    careers: ['Founder-of-one', 'Project shipper', 'Product builder', 'Field lead', 'Launch coordinator'],
  },
  creative: {
    name: 'Creative path',
    color: 'violet',
    tip: 'Writing, design, content, symbolic work.',
    careers: ['Writer / editor', 'Designer', 'Content strategist', 'Brand storyteller', 'Creative producer'],
  },
  mind: {
    name: 'Mind path',
    color: 'indigo',
    tip: 'Research, analysis, teaching ideas.',
    careers: ['Analyst', 'Researcher', 'Curriculum builder', 'Knowledge curator', 'Strategy assistant'],
  },
  order: {
    name: 'Order path',
    color: 'stone',
    tip: 'Systems, admin, logistics, quality control.',
    careers: ['Ops systems', 'Admin architect', 'Logistics planner', 'Compliance helper', 'Process designer'],
  },
  money: {
    name: 'Money literacy path',
    color: 'emerald',
    tip: 'Budgets, pricing, sales integrity — reflection only, not financial advice.',
    careers: ['Pricing thinker', 'Budget steward', 'Ethical sales', 'Bookkeeping-curious', 'Resource planner'],
  },
};

/** Entertainment MBTI-style type blurbs + career overlays */
const TYPE_PROFILES = {
  INTJ: {
    title: 'Architect of quiet strategy',
    blurb: 'You map the long game, protect deep work, and dislike chaos without a thesis.',
    workStyle: 'Independent strategy · few meetings · high standards',
    growth: 'Share drafts earlier; invite feedback before perfection freezes you.',
    moneySeal: 'Systems for savings + one bold skill investment beat random hustle.',
    fitTracks: ['mind', 'order', 'build'],
  },
  INTP: {
    title: 'Pattern weaver',
    blurb: 'You live for models, questions, and elegant explanations — rigid bureaucracy drains you.',
    workStyle: 'Research · prototypes · flexible problem spaces',
    growth: 'Ship a “good enough” version; truth-seeking needs deadlines sometimes.',
    moneySeal: 'Price expertise as packaged insights, not endless free thinking.',
    fitTracks: ['mind', 'creative', 'craft'],
  },
  ENTJ: {
    title: 'Command of the table',
    blurb: 'You organize people toward outcomes and get impatient with unclear ownership.',
    workStyle: 'Leadership · decisions · measurable wins',
    growth: 'Slow for feelings in the room — influence needs more than logic.',
    moneySeal: 'Negotiate with data and a walk-away number written down.',
    fitTracks: ['build', 'order', 'money'],
  },
  ENTP: {
    title: 'Possibility spark',
    blurb: 'You remix ideas fast, debate for sport, and hate dead-end routines.',
    workStyle: 'Innovation · persuasion · multi-thread projects',
    growth: 'Finish one thread before starting three more.',
    moneySeal: 'One offer, one funnel, one metric — charm alone is not cashflow.',
    fitTracks: ['creative', 'build', 'people'],
  },
  INFJ: {
    title: 'Quiet vision keeper',
    blurb: 'You sense undercurrents, hold values tightly, and need meaningful work.',
    workStyle: 'Counseling-adjacent support · writing · mission roles',
    growth: 'Boundaries protect the gift; not every crisis is yours.',
    moneySeal: 'Charge for depth sessions or packages — underpricing bleeds healers.',
    fitTracks: ['people', 'creative', 'service'],
  },
  INFP: {
    title: 'Values-led maker',
    blurb: 'You follow authenticity, story, and cause — empty status work feels like ash.',
    workStyle: 'Creative craft · advocacy · flexible schedules',
    growth: 'Structure is a kindness to your art, not a cage.',
    moneySeal: 'Name a minimum viable rate; your gift is not free labor.',
    fitTracks: ['creative', 'people', 'service'],
  },
  ENFJ: {
    title: 'Hearth leader',
    blurb: 'You lift groups, remember names, and feel responsible for the room’s weather.',
    workStyle: 'Teaching · facilitation · community building',
    growth: 'Rest is leadership; martyrs burn out the hearth.',
    moneySeal: 'Group offerings and retainers stabilize income better than endless one-offs.',
    fitTracks: ['people', 'service', 'creative'],
  },
  ENFP: {
    title: 'Possibility hearth',
    blurb: 'You light people up, chase sparks, and need freedom to improvise.',
    workStyle: 'Story · launch · people-facing creative work',
    growth: 'Pick a lane for 90 days so sparks become a fire.',
    moneySeal: 'Pair enthusiasm with a simple weekly money review.',
    fitTracks: ['creative', 'people', 'build'],
  },
  ISTJ: {
    title: 'Steward of the reliable',
    blurb: 'You keep promises, systems, and standards when others get bored.',
    workStyle: 'Ops · quality · dependable delivery',
    growth: 'Allow a small experiment zone so growth does not only mean more duty.',
    moneySeal: 'Automate bills + emergency fund before any flashy “opportunity.”',
    fitTracks: ['order', 'money', 'craft'],
  },
  ISFJ: {
    title: 'Quiet protector',
    blurb: 'You notice needs, hold details of care, and dislike public conflict.',
    workStyle: 'Support · care ops · hospitality excellence',
    growth: 'Ask for recognition and rest before resentment writes the script.',
    moneySeal: 'Track unpaid emotional labor; price support roles fairly.',
    fitTracks: ['service', 'people', 'order'],
  },
  ESTJ: {
    title: 'Order in motion',
    blurb: 'You run the checklist, hold the standard, and move groups from talk to done.',
    workStyle: 'Management · logistics · enforcement of plan',
    growth: 'Leave room for dissent that is not disobedience.',
    moneySeal: 'Clear budgets and role-based raises beat vague “we’ll see.”',
    fitTracks: ['order', 'build', 'money'],
  },
  ESFJ: {
    title: 'Host of the working hearth',
    blurb: 'You coordinate people, rituals, and belonging — chaos without care feels wrong.',
    workStyle: 'People ops · events · client care',
    growth: 'Not every opinion needs your fixing; protect your nervous system.',
    moneySeal: 'Service businesses thrive on packages + deposits, not free favors.',
    fitTracks: ['people', 'service', 'order'],
  },
  ISTP: {
    title: 'Hands-on strategist',
    blurb: 'You troubleshoot in real time, hate fluff, and learn by doing.',
    workStyle: 'Technical craft · field work · independent fixes',
    growth: 'Name your value out loud before others underpay “quiet competence.”',
    moneySeal: 'Skill certificates + day rates beat hoping someone notices.',
    fitTracks: ['craft', 'build', 'mind'],
  },
  ISFP: {
    title: 'Aesthetic steward',
    blurb: 'You sense beauty, mood, and authenticity — soulless grind is poison.',
    workStyle: 'Craft · design · sensory or nature-adjacent work',
    growth: 'Deadlines can be sacred containers, not enemies.',
    moneySeal: 'Productize art into tiers so cashflow is not feast-or-famine only.',
    fitTracks: ['craft', 'creative', 'service'],
  },
  ESTP: {
    title: 'Field spark',
    blurb: 'You act fast, read rooms, and get bored by theory without a live problem.',
    workStyle: 'Sales field · crisis response · kinetic leadership',
    growth: 'Pause before impulse contracts; charisma needs a paper trail.',
    moneySeal: 'Escrow, deposits, and written scopes protect your hustle energy.',
    fitTracks: ['build', 'people', 'money'],
  },
  ESFP: {
    title: 'Presence on stage',
    blurb: 'You bring life to rooms, learn by experience, and need joy in the work.',
    workStyle: 'Performance · hospitality · experiential brands',
    growth: 'Book quiet admin blocks so the show can keep running.',
    moneySeal: 'Seasonal income needs a winter fund — joy still needs a buffer.',
    fitTracks: ['people', 'creative', 'service'],
  },
};

const MONEY_DEPTH = {
  stability: {
    title: 'Steward rhythm',
    lines: [
      'Build a boring backbone: fixed costs written, emergency weeks counted, then play money last.',
      'Predictable income loves recurring clients, retainers, and skills that age well.',
      'Fear shrinks when you open the numbers weekly — 20 minutes, same day, no drama.',
    ],
  },
  upside: {
    title: 'Upside with rails',
    lines: [
      'Risk needs a floor: never bet rent on a maybe. Bet surplus and skill hours.',
      'Upside paths favor shipping experiments with a kill-date, not endless “someday.”',
      'Track conversion, not vibes — one offer, one audience, one number that tells truth.',
    ],
  },
  enough: {
    title: 'Enough + meaning',
    lines: [
      'Define enough in dollars and hours so meaning does not become self-erasure.',
      'Meaning-rich work still needs invoices. Sacred and paid can share a table.',
      'Say no to underpaid “exposure” that starves the path you care about.',
    ],
  },
  learn: {
    title: 'Literacy before leaps',
    lines: [
      'Learn cashflow, taxes-at-a-glance, and basic pricing before complex products.',
      'A mentor or course on money language is cheaper than a panicked leap.',
      'Write questions for a human professional — this app is not that human.',
    ],
  },
};

const CAREER_RITUALS = [
  'Write a one-sentence job story: problem you solve + for whom + proof.',
  'Block two deep-work hours three days this week before email.',
  'Ask one person in a role you admire a single clear question.',
  'List three skills you already sell informally; price the strongest.',
  'Do a Sunday money date: income in, bills out, one goal for the week.',
  'Remove one unpaid obligation that pretends to be career development.',
  'Update one artifact: portfolio piece, résumé bullet, or sample of work.',
  'Practice a 30-second boundary for scope creep.',
];

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
  const top = ranked[0] || { id: 'mind', name: 'Mind path', tip: 'Curiosity is a career.', n: 1, careers: [] };
  const line = PATH_LINES[hashStr(JSON.stringify(answers) + top.id) % PATH_LINES.length];
  const moneyLine = PATH_LINES[hashStr(`money|${JSON.stringify(answers)}`) % PATH_LINES.length];
  const moneyChoice = answers.money || 'learn';
  const moneyDepth = MONEY_DEPTH[moneyChoice] || MONEY_DEPTH.learn;
  const moneyExtra =
    moneyDepth.lines[hashStr(`md|${JSON.stringify(answers)}`) % moneyDepth.lines.length];
  const careerIdeas = (top.careers || []).slice(0, 4);
  const secondary = ranked[1];
  const ritual =
    CAREER_RITUALS[hashStr(`ritual|${JSON.stringify(answers)}`) % CAREER_RITUALS.length];

  return {
    top,
    ranked: ranked.slice(0, 5),
    pathLine: line,
    moneyLine,
    moneyDepth: {
      title: moneyDepth.title,
      line: moneyExtra,
      allLines: moneyDepth.lines,
    },
    careerIdeas,
    secondaryTrack: secondary
      ? { name: secondary.name, tip: secondary.tip, careers: (secondary.careers || []).slice(0, 3) }
      : null,
    ritual,
    librarySize: PATH_LINES.length,
    tips: [
      'Write one skill you can trade for money this month (even small).',
      'Protect two deep-work hours before inbox three days a week.',
      'For contracts, taxes, or licensed advice — hire a human professional.',
      'Apothecary practitioners can support nervous-system rest; they are not career counselors unless they state that clearly.',
      ritual,
    ],
    categories: [
      { id: 'primary', label: 'Primary vocation track', text: `${top.name} — ${top.tip}` },
      { id: 'money', label: 'Money literacy seal', text: `${moneyDepth.title}: ${moneyExtra}` },
      { id: 'ideas', label: 'Career idea sparks', text: careerIdeas.join(' · ') || 'Explore with curiosity' },
      { id: 'path', label: 'Path line', text: line },
    ],
    disclaimer:
      'Entertainment and reflection only — not career counseling, financial, medical, psychological testing, or professional advice. MBTI-style results are informal entertainment, not a clinical or hiring assessment.',
  };
}

export function scoreMbti(answers = {}, { pro = false } = {}) {
  const questions = pro ? MBTI_PRO_QUESTIONS : MBTI_TEASER_QUESTIONS;
  const tallies = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  let answered = 0;
  for (const q of questions) {
    const choiceId = answers[q.id];
    const opt = q.options.find((o) => o.id === choiceId);
    if (!opt) continue;
    answered += 1;
    tallies[opt.pole] = (tallies[opt.pole] || 0) + 1;
  }
  const minNeeded = pro ? 8 : 4;
  if (answered < minNeeded) {
    return { error: pro ? 'Answer more Path & Personality questions.' : 'Answer all four spark questions.' };
  }

  const pickPole = (a, b) => (tallies[a] >= tallies[b] ? a : b);
  const type = `${pickPole('E', 'I')}${pickPole('S', 'N')}${pickPole('T', 'F')}${pickPole('J', 'P')}`;
  const profile = TYPE_PROFILES[type] || TYPE_PROFILES.INFP;
  const strength = {
    EI: Math.abs(tallies.E - tallies.I),
    SN: Math.abs(tallies.S - tallies.N),
    TF: Math.abs(tallies.T - tallies.F),
    JP: Math.abs(tallies.J - tallies.P),
  };
  const clarity =
    strength.EI + strength.SN + strength.TF + strength.JP >= (pro ? 6 : 3)
      ? 'Clear lean'
      : 'Soft lean — both poles live in you';

  const fitTracks = (profile.fitTracks || [])
    .map((id) => ({ id, ...TRACK_LABELS[id] }))
    .filter((t) => t.name);

  const pathLine = PATH_LINES[hashStr(`mbti|${type}|${JSON.stringify(answers)}`) % PATH_LINES.length];
  const moneyLine = PATH_LINES[hashStr(`mbti-money|${type}`) % PATH_LINES.length];

  return {
    type,
    title: profile.title,
    blurb: profile.blurb,
    workStyle: profile.workStyle,
    growth: profile.growth,
    moneySeal: profile.moneySeal,
    clarity,
    tallies,
    strength,
    fitTracks,
    pathLine,
    moneyLine,
    depth: pro ? 'full' : 'teaser',
    pro,
    dimensions: [
      { id: 'EI', label: 'Energy', left: 'Introvert (I)', right: 'Extravert (E)', lean: pickPole('E', 'I') },
      { id: 'SN', label: 'Information', left: 'Sensing (S)', right: 'Intuition (N)', lean: pickPole('S', 'N') },
      { id: 'TF', label: 'Decisions', left: 'Feeling (F)', right: 'Thinking (T)', lean: pickPole('T', 'F') },
      { id: 'JP', label: 'Lifestyle', left: 'Perceiving (P)', right: 'Judging (J)', lean: pickPole('J', 'P') },
    ],
    proUnlocks: pro
      ? []
      : [
          'Full 12-question Path & Personality battery',
          'Linked career-track weave with aptitude scores',
          'Money seal + growth edge per type',
          'Work-style map and ritual stack',
        ],
    disclaimer:
      'Informal entertainment personality spark inspired by popular type language (e.g. Myers-Briggs–style dichotomies). Not a clinical instrument, not for hiring or diagnosis.',
  };
}

/** Merge aptitude + MBTI when both completed (Pro depth) */
export function weavePathAndType(aptitudeResult, mbtiResult) {
  if (!aptitudeResult || !mbtiResult || mbtiResult.error) return null;
  const typeTracks = new Set((mbtiResult.fitTracks || []).map((t) => t.id));
  const aptTop = aptitudeResult.top?.id;
  const aligned = typeTracks.has(aptTop);
  const bridge = aligned
    ? `Your aptitude top track (${aptitudeResult.top.name}) and type ${mbtiResult.type} sing the same chorus — lean into that without ignoring secondary gifts.`
    : `Aptitude leans ${aptitudeResult.top?.name || 'mixed'} while type ${mbtiResult.type} favors ${(mbtiResult.fitTracks || []).map((t) => t.name).join(', ') || 'several lanes'}. That tension is useful: schedule both, do not force one identity.`;

  const rituals = [
    aptitudeResult.ritual,
    mbtiResult.growth,
    mbtiResult.moneySeal,
    aptitudeResult.moneyDepth?.line,
  ].filter(Boolean);

  return {
    aligned,
    bridge,
    type: mbtiResult.type,
    track: aptitudeResult.top?.name,
    rituals: rituals.slice(0, 5),
    summary: `${mbtiResult.type} · ${aptitudeResult.top?.name || 'Path'} · ${aligned ? 'aligned weave' : 'creative tension'}`,
    seal: PATH_LINES[hashStr(`weave|${mbtiResult.type}|${aptTop}`) % PATH_LINES.length],
  };
}

export function drawPathSpark(seed = Date.now()) {
  return PATH_LINES[hashStr(String(seed)) % PATH_LINES.length];
}

export { TRACK_LABELS, TYPE_PROFILES, MONEY_DEPTH, CAREER_RITUALS };
