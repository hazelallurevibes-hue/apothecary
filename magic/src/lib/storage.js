const JOURNAL_KEY = 'magic_journal_v1';
const HEARTH_KEY = 'magic_hearth_local_v1';
const SETTINGS_KEY = 'magic_settings_v1';

export function loadJournal() {
  try {
    return JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveJournalEntry(entry) {
  const list = loadJournal();
  list.unshift({
    id: `j-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...entry,
  });
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(list.slice(0, 200)));
  return list;
}

export function deleteJournalEntry(id) {
  const list = loadJournal().filter((e) => e.id !== id);
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(list));
  return list;
}

/** Local "hearth" mirror until Supabase table is wired */
export function loadHearthPosts() {
  try {
    return JSON.parse(localStorage.getItem(HEARTH_KEY) || '[]');
  } catch {
    return [];
  }
}

export function postToHearth({ text, mood }) {
  const list = loadHearthPosts();
  list.unshift({
    id: `h-${Date.now()}`,
    text: String(text || '').slice(0, 500),
    mood: mood || 'vent',
    createdAt: new Date().toISOString(),
    anonymous: true,
  });
  localStorage.setItem(HEARTH_KEY, JSON.stringify(list.slice(0, 100)));
  return list;
}

export function loadSettings() {
  try {
    return (
      JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null') || {
        compactWidget: false,
        sound: false,
        name: '',
      }
    );
  } catch {
    return { compactWidget: false, sound: false, name: '' };
  }
}

export function saveSettings(patch) {
  const next = { ...loadSettings(), ...patch };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}
