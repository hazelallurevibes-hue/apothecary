const KEY = 'magic_achievements_v1';
const XP_KEY = 'magic_xp_v1';

export const ACHIEVEMENTS = [
  { id: 'first_sphere', name: 'Sphere Touched', desc: 'Asked the Sanctum Sphere', emoji: '⑧', xp: 10 },
  { id: 'first_coin', name: 'Heaven or Ember', desc: 'Flipped Heaven & Ember', emoji: '🪙', xp: 10 },
  { id: 'first_court', name: 'Court Clerk', desc: 'Convened Hearth Court', emoji: '⚖', xp: 25 },
  { id: 'first_poll', name: 'Poll Whisperer', desc: 'Ran a Hearth Court poll', emoji: '📊', xp: 30 },
  { id: 'first_familiar', name: 'Familiar Friend', desc: 'Used Familiar Whisperer', emoji: '🐾', xp: 20 },
  { id: 'first_storm', name: 'Storm Prepper', desc: 'Drew Before the Storm', emoji: '🕯', xp: 20 },
  { id: 'first_fortune', name: 'Cookie Breaker', desc: 'Opened a daily fortune', emoji: '🥠', xp: 15 },
  { id: 'dob_set', name: 'Chart Sealed', desc: 'Saved date of birth', emoji: '✨', xp: 40 },
  { id: 'first_share', name: 'Town Crier', desc: 'Shared a result', emoji: '📣', xp: 25 },
  { id: 'streak_3', name: 'Three Moons', desc: '3-day fortune streak', emoji: '🌙', xp: 50 },
  { id: 'streak_7', name: 'Week of Ink', desc: '7-day fortune streak', emoji: '📜', xp: 100 },
  { id: 'journal_3', name: 'Cauldron Keeper', desc: '3 private journal entries', emoji: '🔥', xp: 20 },
];

export function loadAchievements() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function loadXp() {
  try {
    return JSON.parse(localStorage.getItem(XP_KEY) || '{"xp":0,"streak":0,"lastDay":null}');
  } catch {
    return { xp: 0, streak: 0, lastDay: null };
  }
}

function saveXp(x) {
  localStorage.setItem(XP_KEY, JSON.stringify(x));
}

export function unlockAchievement(id) {
  const map = loadAchievements();
  if (map[id]) return { already: true, achievement: ACHIEVEMENTS.find((a) => a.id === id) };
  const achievement = ACHIEVEMENTS.find((a) => a.id === id);
  if (!achievement) return { already: true };
  map[id] = { at: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(map));
  const xpState = loadXp();
  xpState.xp = (xpState.xp || 0) + (achievement.xp || 0);
  saveXp(xpState);
  window.dispatchEvent(new CustomEvent('magic-achievement', { detail: achievement }));
  return { already: false, achievement, xp: xpState.xp };
}

export function noteFortuneStreak() {
  const day = new Date().toISOString().slice(0, 10);
  const xp = loadXp();
  if (xp.lastDay === day) return xp;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.toISOString().slice(0, 10);
  xp.streak = xp.lastDay === y ? (xp.streak || 0) + 1 : 1;
  xp.lastDay = day;
  xp.xp = (xp.xp || 0) + 5;
  saveXp(xp);
  if (xp.streak >= 3) unlockAchievement('streak_3');
  if (xp.streak >= 7) unlockAchievement('streak_7');
  return xp;
}

export function levelFromXp(xp) {
  return Math.floor(Math.sqrt((xp || 0) / 20)) + 1;
}

export function unlockedList() {
  const map = loadAchievements();
  return ACHIEVEMENTS.filter((a) => map[a.id]).map((a) => ({ ...a, ...map[a.id] }));
}
