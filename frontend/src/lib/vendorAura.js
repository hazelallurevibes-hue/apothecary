import { getPractitionerMoonMood } from './seasonalSanctum';

const MOON_AURA = {
  'New Moon': '#6366f1',
  'Waxing Crescent': '#a78bfa',
  'First Quarter': '#818cf8',
  'Waxing Gibbous': '#c4b5fd',
  'Full Moon': '#fbbf24',
  'Waning Gibbous': '#f472b6',
  'Last Quarter': '#94a3b8',
  'Waning Crescent': '#818cf8',
};

export function resolveVendorAura(vendor, date = new Date()) {
  const theme = vendor?.theme_color || '#4a1942';
  const followMoon = vendor?.aura_follow_moon !== false;
  const custom = vendor?.aura_color?.trim();

  if (custom) {
    return { color: custom, source: 'custom', label: 'Practitioner aura' };
  }

  if (followMoon) {
    const moon = getPractitionerMoonMood(date);
    const color = MOON_AURA[moon.name] || theme;
    return { color, source: 'moon', label: `${moon.name} — ${moon.mood}` };
  }

  return { color: theme, source: 'theme', label: 'Storefront theme' };
}