/** Vercel serverless — dynamic OG share card for spirit familiars (SVG) */

const FAMILIAR_NAMES = {
  owl: 'Moonlit Owl',
  cat: 'Velvet Cat',
  moth: 'Silver Moth',
  raven: 'Ink Raven',
  fox: 'Ember Fox',
  snake: 'Jade Serpent',
  toad: 'Cauldron Toad',
  hare: 'Swift Hare',
  stag: 'Forest Stag',
  wolf: 'Grey Wolf',
  crow: 'Storm Crow',
  spider: 'Loom Spider',
  bat: 'Velvet Bat',
  heron: 'Still Heron',
  salamander: 'Flame Salamander',
  beetle: 'Obsidian Beetle',
};

const FAMILIAR_EMOJI = {
  owl: '🦉',
  cat: '🐈‍⬛',
  moth: '🦋',
  raven: '🐦‍⬛',
  fox: '🦊',
  snake: '🐍',
  toad: '🐸',
  hare: '🐇',
  stag: '🦌',
  wolf: '🐺',
  crow: '🪶',
  spider: '🕷️',
  bat: '🦇',
  heron: '🪿',
  salamander: '🦎',
  beetle: '🪲',
};

/** Minimal palette map — duplicated from familiarArt.js to avoid React imports */
const FAMILIAR_PALETTES = {
  owl: { sky: ['#0c0a1a', '#1e1b4b'], moon: '#fef9c3', ring: '#c9a227', accent: '#a78bfa' },
  cat: { sky: ['#0f0610', '#4a1942'], moon: '#e9d5ff', ring: '#6b3a62', accent: '#a855f7' },
  moth: { sky: ['#1a0a18', '#581c87'], moon: '#fde68a', ring: '#c4b5fd', accent: '#fbbf24' },
  raven: { sky: ['#020617', '#1e293b'], moon: '#cbd5e1', ring: '#64748b', accent: '#94a3b8' },
  fox: { sky: ['#1c0a05', '#7c2d12'], moon: '#fed7aa', ring: '#ea580c', accent: '#fbbf24' },
  snake: { sky: ['#022c22', '#065f46'], moon: '#a7f3d0', ring: '#10b981', accent: '#fcd34d' },
  toad: { sky: ['#14532d', '#15803d'], moon: '#bef264', ring: '#84cc16', accent: '#d9f99d' },
  hare: { sky: ['#1e1b4b', '#4338ca'], moon: '#e0e7ff', ring: '#a78bfa', accent: '#fbcfe8' },
  stag: { sky: ['#1a1208', '#44403c'], moon: '#fde68a', ring: '#a8a29e', accent: '#fcd34d' },
  wolf: { sky: ['#0f172a', '#334155'], moon: '#e2e8f0', ring: '#94a3b8', accent: '#cbd5e1' },
  crow: { sky: ['#0c0a09', '#292524'], moon: '#a8a29e', ring: '#78716c', accent: '#f59e0b' },
  spider: { sky: ['#1a0a18', '#4a1942'], moon: '#e9d5ff', ring: '#6b3a62', accent: '#f87171' },
  bat: { sky: ['#0f0610', '#312e81'], moon: '#c4b5fd', ring: '#7c3aed', accent: '#ddd6fe' },
  heron: { sky: ['#0c4a6e', '#0369a1'], moon: '#e0f2fe', ring: '#38bdf8', accent: '#7dd3fc' },
  salamander: { sky: ['#450a0a', '#991b1b'], moon: '#fecaca', ring: '#f87171', accent: '#fde047' },
  beetle: { sky: ['#0f0610', '#2d1230'], moon: '#a78bfa', ring: '#7c3aed', accent: '#c4b5fd' },
};

const MOON_PHASES = [
  { name: 'New Moon', emoji: '🌑' },
  { name: 'Waxing Crescent', emoji: '🌒' },
  { name: 'First Quarter', emoji: '🌓' },
  { name: 'Waxing Gibbous', emoji: '🌔' },
  { name: 'Full Moon', emoji: '🌕' },
  { name: 'Waning Gibbous', emoji: '🌖' },
  { name: 'Last Quarter', emoji: '🌗' },
  { name: 'Waning Crescent', emoji: '🌘' },
];

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getMoonPhase(date = new Date()) {
  const synodic = 29.53058867;
  const ref = new Date('2000-01-06T18:14:00Z');
  const days = (date - ref) / 86400000;
  const phase = ((days % synodic) + synodic) % synodic;
  const idx = Math.floor((phase / synodic) * 8) % 8;
  return MOON_PHASES[idx];
}

function resolveMood(moodParam) {
  if (!moodParam) return getMoonPhase();
  const found = MOON_PHASES.find((p) => p.name.toLowerCase() === moodParam.toLowerCase());
  if (found) return found;
  if (moodParam.toLowerCase() === 'tarot') {
    return { name: 'Tarot Collection', emoji: '🃏' };
  }
  return { name: moodParam, emoji: '✨' };
}

function tierFrame(tier, palette) {
  const t = Math.min(3, Math.max(0, Number(tier) || 0));
  let frame = '';
  frame += `<rect x="12" y="12" width="1176" height="624" rx="28" fill="none" stroke="${palette.ring}" stroke-width="3" opacity="0.9"/>`;
  if (t >= 1) {
    frame += `<rect x="20" y="20" width="1160" height="608" rx="24" fill="none" stroke="${palette.accent}" stroke-width="1.5" opacity="0.55"/>`;
  }
  if (t >= 2) {
    const stars = [
      [48, 48], [1152, 48], [48, 600], [1152, 600],
    ];
    frame += stars.map(([x, y]) =>
      `<text x="${x}" y="${y}" text-anchor="middle" font-size="22" fill="${palette.accent}" opacity="0.8">✦</text>`
    ).join('');
  }
  if (t >= 3) {
    frame += `<rect x="8" y="8" width="1184" height="632" rx="32" fill="none" stroke="${palette.moon}" stroke-width="1" opacity="0.35"/>`;
    frame += `<circle cx="600" cy="324" r="280" fill="none" stroke="${palette.accent}" stroke-width="0.75" opacity="0.2" stroke-dasharray="8 12"/>`;
  }
  return frame;
}

function buildSvg({ id, tier, moodParam, isTarot }) {
  const palette = FAMILIAR_PALETTES[id] || FAMILIAR_PALETTES.owl;
  const name = FAMILIAR_NAMES[id] || 'Spirit Familiar';
  const emoji = FAMILIAR_EMOJI[id] || '✨';
  const moon = resolveMood(moodParam);
  const title = isTarot ? 'Tarot Collection' : name;
  const subtitle = isTarot
    ? 'Daily draws & mystical keepsakes'
    : `${moon.emoji} ${moon.name}`;

  const gradId = `sky-${id}`;
  const skyStops = palette.sky.map((color, i) => {
    const offset = palette.sky.length === 1 ? 0 : i / (palette.sky.length - 1);
    return `<stop offset="${(offset * 100).toFixed(0)}%" stop-color="${color}"/>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      ${skyStops}
    </linearGradient>
    <radialGradient id="moon-glow" cx="78%" cy="22%" r="35%">
      <stop offset="0%" stop-color="${palette.moon}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${palette.moon}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#${gradId})"/>
  <rect width="1200" height="630" fill="url(#moon-glow)"/>
  ${tierFrame(tier, palette)}
  <text x="600" y="200" text-anchor="middle" font-size="120" font-family="Georgia, serif">${isTarot ? '🃏' : emoji}</text>
  <text x="600" y="310" text-anchor="middle" font-size="52" font-weight="700" fill="${palette.moon}" font-family="Georgia, serif">${escapeXml(title)}</text>
  <text x="600" y="370" text-anchor="middle" font-size="28" fill="${palette.accent}" font-family="system-ui, sans-serif">${escapeXml(subtitle)}</text>
  <text x="600" y="540" text-anchor="middle" font-size="22" fill="${palette.moon}" opacity="0.7" font-family="system-ui, sans-serif">Hazel Allure · Spirit companion · Entertainment only</text>
  ${isTarot ? '<text x="600" y="420" text-anchor="middle" font-size="20" fill="#e9d5ff" opacity="0.65" font-family="system-ui, sans-serif">Your personal tarot collection</text>' : ''}
</svg>`;
}

export default function handler(req, res) {
  const id = String(req.query?.id || 'owl').toLowerCase();
  const tier = req.query?.tier ?? '0';
  const mood = req.query?.mood || '';
  const isTarot = mood.toLowerCase() === 'tarot';
  const familiarId = FAMILIAR_NAMES[id] ? id : 'owl';

  const svg = buildSvg({ id: familiarId, tier, moodParam: mood, isTarot });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.status(200).send(svg);
}