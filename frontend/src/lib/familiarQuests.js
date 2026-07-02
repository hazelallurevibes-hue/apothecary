/** Daily familiar micro-quests — entertainment only */

export const DAILY_QUEST_POOL = [
  { key: 'visit_apothecary', label: 'Browse the apothecary shelf', path: '/apothecary' },
  { key: 'visit_gathering', label: 'Warm your hands at The Hearth', path: '/gathering' },
  { key: 'ask_oracle', label: 'Ask the Sanctum sphere one question', event: 'hazel-oracle-asked' },
  { key: 'visit_tarot', label: 'Visit your tarot collection', path: '/tarot-collection' },
  { key: 'gratitude_blessing', label: 'Leave a gratitude blessing on the wall', path: '/gathering', hash: '#gratitude' },
  { key: 'visit_sanctum', label: 'Peek at the Teaching Sanctum catalog', path: '/courses' },
];

function daySeed(email, dateKey) {
  const s = `${email}:${dateKey}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function pickDailyQuest(email, dateKey) {
  const pool = DAILY_QUEST_POOL;
  const idx = daySeed(email || 'guest', dateKey) % pool.length;
  return pool[idx];
}

export function questMatchesLocation(quest, pathname, hash = '') {
  if (!quest?.path) return false;
  if (!pathname.startsWith(quest.path)) return false;
  if (quest.hash) return hash === quest.hash || hash.includes(quest.hash.replace('#', ''));
  return true;
}