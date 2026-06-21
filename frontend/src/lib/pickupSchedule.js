export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function parsePickupHours(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

export function parseInPersonEvents(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

export function formatPickupHoursSummary(hours) {
  const list = parsePickupHours(hours);
  if (!list.length) return null;
  return list
    .filter((h) => h.open && h.close)
    .map((h) => `${h.day || '?'} ${h.open}–${h.close}`)
    .join(', ');
}

export function upcomingEvents(events) {
  const list = parseInPersonEvents(events);
  const today = new Date().toISOString().slice(0, 10);
  return list
    .filter((e) => e.date && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export const EMPTY_PICKUP_SLOT = { day: 'Sat', open: '10:00', close: '14:00' };
export const EMPTY_IN_PERSON_EVENT = { title: '', location: '', date: '', notes: '' };