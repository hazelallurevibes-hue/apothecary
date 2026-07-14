const KEY = 'magic_history_v1';
const MAX = 300;

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  return list;
}

export function recordHistory(entry) {
  const list = loadHistory();
  const row = {
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    type: entry.type || 'activity',
    title: entry.title || 'Activity',
    summary: entry.summary || '',
    payload: entry.payload || {},
    anonymous: !!entry.anonymous,
  };
  list.unshift(row);
  saveAll(list);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('magic-history', { detail: row }));
  }
  return row;
}

export function deleteHistory(id) {
  const list = loadHistory().filter((h) => h.id !== id);
  return saveAll(list);
}

export function clearHistory() {
  localStorage.removeItem(KEY);
  return [];
}

export function historyByType(type) {
  return loadHistory().filter((h) => h.type === type);
}

export function resultsOnly() {
  return loadHistory().filter((h) =>
    ['court', 'poll', 'compat', 'anon_court', 'fortune'].includes(h.type),
  );
}

export function formatHistoryLine(h) {
  const t = new Date(h.createdAt).toLocaleString();
  return `${t} · ${h.title}${h.summary ? ` — ${h.summary}` : ''}`;
}
