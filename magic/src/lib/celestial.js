/** Precise-enough celestial + calendar systems for DOB profiles (entertainment + culture). */

const WESTERN = [
  { name: 'Capricorn', symbol: '♑', element: 'Earth', from: [12, 22], to: [1, 19] },
  { name: 'Aquarius', symbol: '♒', element: 'Air', from: [1, 20], to: [2, 18] },
  { name: 'Pisces', symbol: '♓', element: 'Water', from: [2, 19], to: [3, 20] },
  { name: 'Aries', symbol: '♈', element: 'Fire', from: [3, 21], to: [4, 19] },
  { name: 'Taurus', symbol: '♉', element: 'Earth', from: [4, 20], to: [5, 20] },
  { name: 'Gemini', symbol: '♊', element: 'Air', from: [5, 21], to: [6, 20] },
  { name: 'Cancer', symbol: '♋', element: 'Water', from: [6, 21], to: [7, 22] },
  { name: 'Leo', symbol: '♌', element: 'Fire', from: [7, 23], to: [8, 22] },
  { name: 'Virgo', symbol: '♍', element: 'Earth', from: [8, 23], to: [9, 22] },
  { name: 'Libra', symbol: '♎', element: 'Air', from: [9, 23], to: [10, 22] },
  { name: 'Scorpio', symbol: '♏', element: 'Water', from: [10, 23], to: [11, 21] },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', from: [11, 22], to: [12, 21] },
];

const CHINESE = [
  { animal: 'Rat', emoji: '🐀', trait: 'clever & resourceful' },
  { animal: 'Ox', emoji: '🐂', trait: 'steady & strong' },
  { animal: 'Tiger', emoji: '🐅', trait: 'brave & magnetic' },
  { animal: 'Rabbit', emoji: '🐇', trait: 'gentle & lucky' },
  { animal: 'Dragon', emoji: '🐉', trait: 'bold & visionary' },
  { animal: 'Snake', emoji: '🐍', trait: 'wise & strategic' },
  { animal: 'Horse', emoji: '🐎', trait: 'free & energetic' },
  { animal: 'Goat', emoji: '🐐', trait: 'creative & kind' },
  { animal: 'Monkey', emoji: '🐒', trait: 'witty & adaptable' },
  { animal: 'Rooster', emoji: '🐓', trait: 'precise & proud' },
  { animal: 'Dog', emoji: '🐕', trait: 'loyal & just' },
  { animal: 'Pig', emoji: '🐖', trait: 'generous & sincere' },
];

const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

/** Chinese New Year approximate start (Gregorian) 1900–2100 table subset via formula */
function chineseNewYearApprox(year) {
  // Sufficient for animal year boundary — uses known offsets for 1924–2043
  const map = {
    2020: [1, 25], 2021: [2, 12], 2022: [2, 1], 2023: [1, 22], 2024: [2, 10],
    2025: [1, 29], 2026: [2, 17], 2027: [2, 6], 2028: [1, 26], 2029: [2, 13],
    2030: [2, 3], 2019: [2, 5], 2018: [2, 16], 2017: [1, 28], 2016: [2, 8],
    2015: [2, 19], 2014: [1, 31], 2013: [2, 10], 2012: [1, 23], 2011: [2, 3],
    2010: [2, 14], 2009: [1, 26], 2008: [2, 7], 2007: [2, 18], 2006: [1, 29],
    2005: [2, 9], 2004: [1, 22], 2003: [2, 1], 2002: [2, 12], 2001: [1, 24],
    2000: [2, 5], 1999: [2, 16], 1998: [1, 28], 1997: [2, 7], 1996: [2, 19],
    1995: [1, 31], 1994: [2, 10], 1993: [1, 23], 1992: [2, 4], 1991: [2, 15],
    1990: [1, 27], 1989: [2, 6], 1988: [2, 17], 1987: [1, 29], 1986: [2, 9],
    1985: [2, 20], 1984: [2, 2], 1983: [2, 13], 1982: [1, 25], 1981: [2, 5],
    1980: [2, 16], 1979: [1, 28], 1978: [2, 7], 1977: [2, 18], 1976: [1, 31],
    1975: [2, 11], 1974: [1, 23], 1973: [2, 3], 1972: [2, 15], 1971: [1, 27],
    1970: [2, 6], 1969: [2, 17], 1968: [1, 30], 1967: [2, 9], 1966: [1, 21],
    1965: [2, 2], 1964: [2, 13], 1963: [1, 25], 1962: [2, 5], 1961: [2, 15],
    1960: [1, 28], 1959: [2, 8], 1958: [2, 18], 1957: [1, 31], 1956: [2, 12],
    1955: [1, 24], 1954: [2, 3], 1953: [2, 14], 1952: [1, 27], 1951: [2, 6],
    1950: [2, 17],
  };
  if (map[year]) return map[year];
  // fallback ~ late Jan / early Feb
  return [2, 4];
}

function chineseYearAnimal(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const [cnyM, cnyD] = chineseNewYearApprox(y);
  let animalYear = y;
  if (m < cnyM || (m === cnyM && d < cnyD)) animalYear = y - 1;
  // 1924 = Rat
  const idx = ((animalYear - 1924) % 12 + 12) % 12;
  const animal = CHINESE[idx];
  const element = ELEMENTS[Math.floor(((animalYear - 1924) % 10) / 2)];
  return { year: animalYear, ...animal, element };
}

function westernSign(month, day) {
  // Inclusive ranges; Capricorn wraps the year
  const md = month * 100 + day;
  if (md >= 1222 || md <= 119) return WESTERN.find((s) => s.name === 'Capricorn');
  if (md <= 218) return WESTERN.find((s) => s.name === 'Aquarius');
  if (md <= 320) return WESTERN.find((s) => s.name === 'Pisces');
  if (md <= 419) return WESTERN.find((s) => s.name === 'Aries');
  if (md <= 520) return WESTERN.find((s) => s.name === 'Taurus');
  if (md <= 620) return WESTERN.find((s) => s.name === 'Gemini');
  if (md <= 722) return WESTERN.find((s) => s.name === 'Cancer');
  if (md <= 822) return WESTERN.find((s) => s.name === 'Leo');
  if (md <= 922) return WESTERN.find((s) => s.name === 'Virgo');
  if (md <= 1022) return WESTERN.find((s) => s.name === 'Libra');
  if (md <= 1121) return WESTERN.find((s) => s.name === 'Scorpio');
  return WESTERN.find((s) => s.name === 'Sagittarius');
}

/** Celtic tree approx by day-of-year blocks (cultural entertainment) */
const CELTIC = [
  'Birch', 'Rowan', 'Ash', 'Alder', 'Willow', 'Hawthorn', 'Oak',
  'Holly', 'Hazel', 'Vine', 'Ivy', 'Reed', 'Elder',
];

function celticTree(month, day) {
  const doy = Math.floor((month - 1) * 30.4 + day);
  return CELTIC[Math.min(12, Math.floor(doy / 28))];
}

/** Mayan-ish tone day 1–13 + seal 1–20 simplified */
function mayanToneSeal(date) {
  const epoch = new Date(Date.UTC(2012, 11, 21));
  const days = Math.floor((date - epoch) / 86400000);
  const tone = ((days % 13) + 13) % 13 + 1;
  const seal = ((days % 20) + 20) % 20 + 1;
  const seals = [
    'Dragon', 'Wind', 'Night', 'Seed', 'Serpent', 'Worldbridger', 'Hand', 'Star',
    'Moon', 'Dog', 'Monkey', 'Human', 'Skywalker', 'Wizard', 'Eagle', 'Warrior',
    'Earth', 'Mirror', 'Storm', 'Sun',
  ];
  return { tone, seal: seals[seal - 1], sealIndex: seal };
}

export function parseDob(iso) {
  if (!iso) return null;
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (y < 1900 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, mo - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/** Approximate rising sign from local birth time (entertainment — not full chart). */
function risingSignApprox(month, day, birthTime) {
  if (!birthTime || !/^\d{1,2}:\d{2}/.test(birthTime)) return null;
  const [hh, mm] = birthTime.split(':').map(Number);
  const minutes = (hh % 24) * 60 + (mm || 0);
  // Rough: sun sign offset by ~one sign per 2 hours from 6am
  const sun = westernSign(month, day);
  const sunIdx = WESTERN.findIndex((s) => s.name === sun.name);
  const offset = Math.floor(((minutes - 360 + 1440) % 1440) / 120); // from 6:00
  const rise = WESTERN[(sunIdx + offset + WESTERN.length) % WESTERN.length];
  return { sign: rise.name, symbol: rise.symbol, element: rise.element, approx: true };
}

/** Simple moon phase 0–7 for a UTC date */
export function moonPhaseForDate(date = new Date()) {
  const lp = 2551443; // synodic month seconds approx
  const newMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
  const phase = ((date.getTime() - newMoon) / 1000) % lp;
  const idx = Math.floor((phase / lp) * 8) % 8;
  const names = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
  ];
  const emojis = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  return { name: names[idx], emoji: emojis[idx], index: idx };
}

export function buildCelestialProfile(dobIso, birthName = '', birthTime = '') {
  const date = parseDob(dobIso);
  if (!date) return null;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const western = westernSign(month, day);
  const chinese = chineseYearAnimal(date);
  const celtic = celticTree(month, day);
  const mayan = mayanToneSeal(date);
  const lifePath = lifePathNumber(date);
  const rising = risingSignApprox(month, day, birthTime);
  return {
    dob: dobIso.slice(0, 10),
    birthTime: birthTime || null,
    western: {
      sign: western.name,
      symbol: western.symbol,
      element: western.element,
    },
    rising,
    chinese: {
      animal: chinese.animal,
      emoji: chinese.emoji,
      year: chinese.year,
      element: chinese.element,
      trait: chinese.trait,
    },
    celticTree: celtic,
    mayan,
    lifePath,
    birthName: (birthName || '').slice(0, 40),
    computedAt: new Date().toISOString(),
  };
}

/** Weekly lunar report for Pro seekers (client-side, no email infra required yet) */
export function weeklyLunarReport(celestial, now = new Date()) {
  const moon = moonPhaseForDate(now);
  const week = Math.floor(now.getTime() / (7 * 86400000));
  const themes = [
    'rest and soft boundaries',
    'honest conversations',
    'creative experiments',
    'body-first care',
    'clearing clutter',
    'gentle ambition',
    'gratitude practice',
    'quiet courage',
  ];
  const theme = themes[week % themes.length];
  const sign = celestial?.western?.sign || 'seeker';
  const animal = celestial?.chinese?.animal || 'familiar';
  return {
    weekId: week,
    moon,
    title: `${moon.emoji} Weekly lunar note`,
    body: `This week’s sky leans ${moon.name.toLowerCase()}. As a ${sign} with ${animal} year energy, favor ${theme}. One clear request beats three half-finished plans.`,
    focus: theme,
    risingNote: celestial?.rising
      ? `Rising ~${celestial.rising.symbol} ${celestial.rising.sign} (approx from birth time) — lead with that room’s vibe.`
      : 'Add birth time on your chart for an approximate rising note.',
    disclaimer: 'Entertainment only — not astrology consulting or medical advice.',
  };
}

function lifePathNumber(date) {
  const digits = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`.replace(/\D/g, '');
  let n = digits.split('').reduce((a, b) => a + Number(b), 0);
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n)
      .split('')
      .reduce((a, b) => a + Number(b), 0);
  }
  return n;
}

export function profileBlurb(profile) {
  if (!profile) return '';
  const rise = profile.rising ? ` · Rising ~${profile.rising.symbol} ${profile.rising.sign}` : '';
  return `${profile.western.symbol} ${profile.western.sign}${rise} · ${profile.chinese.emoji} ${profile.chinese.animal} (${profile.chinese.element}) · Life path ${profile.lifePath}`;
}
