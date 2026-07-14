/** Free viral tools — high utility so install feels worth it; Pro still converts */

function hashStr(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickOption(options, seed = Date.now()) {
  const list = (options || []).map((o) => String(o || '').trim()).filter(Boolean);
  if (!list.length) return { error: 'Add at least one option.' };
  const i = hashStr(`${seed}|${list.join('|')}|${Math.random()}`) % list.length;
  return {
    winner: list[i],
    index: i,
    options: list,
    seal: 'Sanctum Dice · free',
    blurb: pickBlurb(seed),
  };
}

function pickBlurb(seed) {
  const lines = [
    'The dice settle. Your feet decide the rest.',
    'Entertainment only — use for low-stakes choices.',
    'Share the winner, keep the kindness.',
    'A small yes is still a yes.',
  ];
  return lines[hashStr(String(seed)) % lines.length];
}

export function thisOrThatPick(a, b, seed = Date.now()) {
  const left = String(a || '').trim() || 'This';
  const right = String(b || '').trim() || 'That';
  const pickLeft = hashStr(`${seed}|${left}|${right}|${Math.random()}`) % 2 === 0;
  return {
    winner: pickLeft ? left : right,
    loser: pickLeft ? right : left,
    sides: [left, right],
    seal: 'This or That · free & viral',
    blurb: 'Pass the phone. Tap again for a rematch. Install Desk Orb for one-tap chaos.',
  };
}

/** Simple free mood reading from 0–10 sliders */
export function moodReading({ energy = 5, peace = 5, connection = 5 } = {}) {
  const e = clamp(energy, 0, 10);
  const p = clamp(peace, 0, 10);
  const c = clamp(connection, 0, 10);
  const avg = (e + p + c) / 3;
  let vibe = 'Soft middle path';
  let color = 'moon';
  if (avg >= 7.5) {
    vibe = 'Golden porch light';
    color = 'gold';
  } else if (avg <= 3.5) {
    vibe = 'Hearth needs rest';
    color = 'plum';
  } else if (e >= 7 && p <= 4) {
    vibe = 'Spark without soft landing';
    color = 'rose';
  } else if (c >= 7 && e <= 4) {
    vibe = 'Heart-forward, body tired';
    color = 'violet';
  }

  const tips = [];
  if (e <= 4) tips.push('One glass of water before the next yes.');
  if (p <= 4) tips.push('Five quiet minutes without the group chat.');
  if (c <= 4) tips.push('Send one kind text — or sit with yourself kindly.');
  if (e >= 7) tips.push('Aim that spark at one concrete next step.');
  if (tips.length === 0) tips.push('You are balanced enough to choose something gentle.');

  return {
    energy: e,
    peace: p,
    connection: c,
    avg: Math.round(avg * 10) / 10,
    vibe,
    color,
    tips,
    seal: 'Mood Meter · free',
    blurb: 'Entertainment snapshot — not therapy. Pro storm cards go deeper when talks get hard.',
  };
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, Number(n) || 0));
}

/** Local moon-ish phase for daily free flavor (approximate, entertainment) */
export function freeMoonPhase(date = new Date()) {
  // synodic month approximation from known new moon reference
  const known = Date.UTC(2000, 0, 6, 18, 14, 0);
  const now = date.getTime();
  const synodic = 29.53058867 * 86400000;
  const phase = ((now - known) % synodic) / synodic;
  const names = [
    { name: 'New Moon', emoji: '🌑', tip: 'Plant a soft intention.' },
    { name: 'Waxing Crescent', emoji: '🌒', tip: 'Start one tiny thing.' },
    { name: 'First Quarter', emoji: '🌓', tip: 'Choose a clear yes or no.' },
    { name: 'Waxing Gibbous', emoji: '🌔', tip: 'Refine, do not over-promise.' },
    { name: 'Full Moon', emoji: '🌕', tip: 'Celebrate or release — both count.' },
    { name: 'Waning Gibbous', emoji: '🌖', tip: 'Share gratitude out loud.' },
    { name: 'Last Quarter', emoji: '🌗', tip: 'Close a loop kindly.' },
    { name: 'Waning Crescent', emoji: '🌘', tip: 'Rest is productive magic.' },
  ];
  const idx = Math.min(7, Math.floor(phase * 8));
  return { ...names[idx], phase: Math.round(phase * 100), seal: 'Sky ink · free' };
}

export const FREE_VALUE_PITCH = {
  free: [
    'Sanctum Sphere + Heaven & Ember coin (unlimited)',
    'Hearth Court free: enter 2 sides, vote, computer basic ruling',
    'Same-device polls, Chart Harmony, Desk Orb widget',
    'Sanctum Dice, This-or-That, Mood Meter, moon phase',
    'Private Frustration Cauldron journal + free playground',
    'Pro tool showcases (Familiar, Storm, Moon Mirror samples)',
  ],
  pro: [
    '2,800+ line libraries that never feel stale',
    'Hearth Court Pro: 3–4 sides, live multi-device polls, anon feed',
    'Full Familiar Whisperer + Before the Storm decks',
    'Moon Mirror vault + ritual scores + secondary seals',
    'Deeper dashboard lunar notes & cloud history sync',
  ],
};
