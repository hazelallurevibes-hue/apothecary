/**
 * Route-aware coaching tips for Hazel Allure — proactive help when users pause.
 */

const STORAGE_PREFIX = 'hazel_tip_dismissed_';

export function tipDismissKey(tipId) {
  return `${STORAGE_PREFIX}${tipId}`;
}

export function isTipDismissed(tipId) {
  try {
    return localStorage.getItem(tipDismissKey(tipId)) === '1';
  } catch {
    return false;
  }
}

export function dismissTip(tipId, permanent = true) {
  if (!permanent) return;
  try {
    localStorage.setItem(tipDismissKey(tipId), '1');
  } catch {
    /* ignore */
  }
}

export function guidanceForPath(pathname = '/', role = 'guest') {
  const path = pathname.split('?')[0];
  const isVendor = role === 'vendor' || role === 'admin';

  const catalog = [
    {
      match: (p) => p === '/' || p === '/home',
      id: 'home',
      titleKey: 'guidance.home.title',
      bodyKey: 'guidance.home.body',
      stepsKey: 'guidance.home.steps',
      idleMs: 40000,
      audience: 'all',
    },
    {
      match: (p) => p === '/marketplace',
      id: 'marketplace',
      titleKey: 'guidance.marketplace.title',
      bodyKey: 'guidance.marketplace.body',
      stepsKey: 'guidance.marketplace.steps',
      idleMs: 45000,
      audience: 'all',
    },
    {
      match: (p) => p === '/apothecary-market',
      id: 'apothecary',
      titleKey: 'guidance.apothecary.title',
      bodyKey: 'guidance.apothecary.body',
      stepsKey: 'guidance.apothecary.steps',
      idleMs: 45000,
      audience: 'all',
    },
    {
      match: (p) => p === '/courses' || p.startsWith('/courses/'),
      id: 'courses',
      titleKey: 'guidance.courses.title',
      bodyKey: 'guidance.courses.body',
      stepsKey: 'guidance.courses.steps',
      idleMs: 45000,
      audience: 'all',
    },
    {
      match: (p) => p.startsWith('/vendor-dashboard'),
      id: 'vendor-dashboard',
      titleKey: 'guidance.vendorDashboard.title',
      bodyKey: 'guidance.vendorDashboard.body',
      stepsKey: 'guidance.vendorDashboard.steps',
      idleMs: 50000,
      audience: 'vendor',
    },
    {
      match: (p) => p === '/vendor-teaching',
      id: 'vendor-teaching',
      titleKey: 'guidance.teaching.title',
      bodyKey: 'guidance.teaching.body',
      stepsKey: 'guidance.teaching.steps',
      idleMs: 50000,
      audience: 'vendor',
    },
    {
      match: (p) => p === '/onboarding',
      id: 'onboarding',
      titleKey: 'guidance.onboarding.title',
      bodyKey: 'guidance.onboarding.body',
      stepsKey: 'guidance.onboarding.steps',
      idleMs: 35000,
      audience: 'all',
    },
  ];

  for (const entry of catalog) {
    if (!entry.match(path)) continue;
    if (entry.audience === 'vendor' && !isVendor) continue;
    return entry;
  }
  return null;
}

export function parseGuidanceSteps(t, stepsKey) {
  const raw = t(stepsKey, '');
  if (!raw) return [];
  return raw.split('|').map((s) => s.trim()).filter(Boolean);
}