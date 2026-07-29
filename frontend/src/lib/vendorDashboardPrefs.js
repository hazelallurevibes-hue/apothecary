/** Pro vendor dashboard personalization (local + optional server sync via onboarding JSON). */

export const DASHBOARD_WIDGETS = [
  { id: 'worth', label: 'Why Pro is worth it', free: true },
  { id: 'boost', label: 'Revenue boost tips', free: true },
  { id: 'shelf', label: 'Shelf score', free: true },
  { id: 'pos', label: 'POS inventory & subscriptions', free: true },
  { id: 'growth', label: 'Seller growth tips', free: true },
  { id: 'snapshot', label: 'Weekly snapshot (Pro)', free: false },
  { id: 'subscribers', label: 'Subscribe & Save pulse (Pro)', free: false },
  { id: 'featured', label: 'Featured product pin (Pro)', free: false },
  { id: 'welcome', label: 'Custom welcome banner (Pro)', free: false },
  { id: 'saas', label: 'Pro SaaS toolkit (Pro)', free: false },
];

export const DEFAULT_PREFS = {
  welcomeName: '',
  focusMode: false,
  accent: '',
  widgets: {
    worth: true,
    boost: true,
    shelf: true,
    pos: true,
    growth: true,
    snapshot: true,
    subscribers: true,
    featured: true,
    welcome: true,
  },
};

const LS_KEY = 'ha_vendor_dashboard_prefs_v1';

export function loadLocalDashboardPrefs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULT_PREFS, widgets: { ...DEFAULT_PREFS.widgets } };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFS,
      ...parsed,
      widgets: { ...DEFAULT_PREFS.widgets, ...(parsed.widgets || {}) },
    };
  } catch {
    return { ...DEFAULT_PREFS, widgets: { ...DEFAULT_PREFS.widgets } };
  }
}

export function saveLocalDashboardPrefs(prefs) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
  return prefs;
}

export function widgetVisible(prefs, id, isPro) {
  const def = DASHBOARD_WIDGETS.find((w) => w.id === id);
  if (!def) return true;
  if (!def.free && !isPro) return false;
  if (prefs?.focusMode && ['worth', 'boost', 'growth'].includes(id)) return false;
  return prefs?.widgets?.[id] !== false;
}
