/** Moon-phase and seasonal banners for Teaching Sanctum */

const MOON_PHASES = [
  { name: 'New Moon', emoji: '🌑', tone: 'Plant intentions — ideal week to enroll in a foundational course.' },
  { name: 'Waxing Crescent', emoji: '🌒', tone: 'Build momentum — revisit your study hall threads.' },
  { name: 'First Quarter', emoji: '🌓', tone: 'Take action — mark a lesson complete today.' },
  { name: 'Waxing Gibbous', emoji: '🌔', tone: 'Refine your practice — join a study group.' },
  { name: 'Full Moon', emoji: '🌕', tone: 'Illuminate — share a win in The Hearth study hall.' },
  { name: 'Waning Gibbous', emoji: '🌖', tone: 'Gratitude — thank a practitioner who guided you.' },
  { name: 'Last Quarter', emoji: '🌗', tone: 'Release — complete your course evaluation.' },
  { name: 'Waning Crescent', emoji: '🌘', tone: 'Rest — gentle review, no pressure.' },
];

const STUDY_HALL_PROMPTS = [
  'What herb or ritual are you exploring this week?',
  'Share one lesson that changed your perspective.',
  'Who in the Sanctum inspired you lately?',
  'Describe your learning nook — candle, tea, journal?',
  'What would you tell someone starting your course?',
];

export function getMoonPhase(date = new Date()) {
  const synodic = 29.53058867;
  const ref = new Date('2000-01-06T18:14:00Z');
  const days = (date - ref) / 86400000;
  const phase = ((days % synodic) + synodic) % synodic;
  const idx = Math.floor((phase / synodic) * 8) % 8;
  return MOON_PHASES[idx];
}

export function getStudyHallPrompt(date = new Date()) {
  const day = Math.floor(date.getTime() / 86400000);
  return STUDY_HALL_PROMPTS[day % STUDY_HALL_PROMPTS.length];
}

export function getSeasonalAccent(date = new Date()) {
  const m = date.getMonth();
  if (m >= 2 && m <= 4) return { label: 'Spring awakening', gradient: 'from-emerald-50 to-[#faf7f9]' };
  if (m >= 5 && m <= 7) return { label: 'Summer radiance', gradient: 'from-amber-50 to-[#faf7f9]' };
  if (m >= 8 && m <= 10) return { label: 'Autumn harvest', gradient: 'from-orange-50 to-[#f5f0e8]' };
  return { label: 'Winter sanctum', gradient: 'from-indigo-50 to-[#faf7f9]' };
}

const DAILY_ORACLE = [
  'The shelf remembers every hand that tended it gently.',
  'Patience is a herb that ripens in its own season.',
  'Your question already holds the seed of its answer.',
  'Still water reflects more than rushing streams.',
  'A single candle can warm an entire study nook.',
  'Kindred spirits find each other by quiet resonance.',
  'Rest is not absence — it is preparation.',
  'What you nurture inwardly will bloom outwardly.',
];

const MOON_MOODS = {
  'New Moon': { mood: 'Reflective', vibe: 'Ideal for intention-setting sessions' },
  'Waxing Crescent': { mood: 'Curious', vibe: 'Open to new seekers and questions' },
  'First Quarter': { mood: 'Focused', vibe: 'Deep work and structured offerings shine' },
  'Waxing Gibbous': { mood: 'Refining', vibe: 'Polishing rituals and apothecary blends' },
  'Full Moon': { mood: 'Radiant', vibe: 'Celebration readings and community energy' },
  'Waning Gibbous': { mood: 'Grateful', vibe: 'Thank-you blessings and reflection' },
  'Last Quarter': { mood: 'Releasing', vibe: 'Gentle closure and integration work' },
  'Waning Crescent': { mood: 'Restful', vibe: 'Soft consultations and quiet goods' },
};

export function getDailyOracle(date = new Date()) {
  const day = Math.floor(date.getTime() / 86400000);
  return DAILY_ORACLE[day % DAILY_ORACLE.length];
}

export function getPractitionerMoonMood(date = new Date()) {
  const phase = getMoonPhase(date);
  const extra = MOON_MOODS[phase.name] || { mood: 'Present', vibe: 'Welcoming seekers today' };
  return { ...phase, ...extra };
}