/** Pro vendor dashboard personalization (local + optional server sync via onboarding JSON). */

export const DASHBOARD_WIDGETS = [
  { id: 'pos', label: 'POS inventory & subscriptions', free: true },
  { id: 'shelf', label: 'Shelf score', free: true },
  { id: 'worth', label: 'Why Pro is worth it (optional)', free: true },
  { id: 'boost', label: 'Revenue boost tips (optional)', free: true },
  { id: 'growth', label: 'Seller growth tips (optional)', free: true },
  { id: 'snapshot', label: 'Weekly snapshot (Pro)', free: false },
  { id: 'subscribers', label: 'Subscribe & Save pulse (Pro)', free: false },
  { id: 'featured', label: 'Featured product pin (Pro)', free: false },
  { id: 'welcome', label: 'Custom welcome banner', free: true },
  { id: 'saas', label: 'Pro SaaS toolkit (Pro)', free: false },
];

/** Keep dashboard calm: POS + shelf on; marketing panels off by default (one Pro CTA lives at bottom). */
export const DEFAULT_PREFS = {
  welcomeName: '',
  focusMode: true,
  accent: '',
  widgets: {
    worth: false,
    boost: false,
    shelf: true,
    pos: true,
    growth: false,
    snapshot: true,
    subscribers: true,
    featured: true,
    welcome: true,
  },
};

const LS_KEY = 'ha_vendor_dashboard_prefs_v2';

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
