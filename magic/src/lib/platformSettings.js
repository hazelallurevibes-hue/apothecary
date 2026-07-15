/** Read shared Hazel platform_settings (same Supabase as Apothecary admin Magic tab) */

import { supabaseAuth, isAuthConfigured } from './supabaseAuth.js';

const DEFAULTS = {
  magic_enabled: 'true',
  magic_show_nav_link: 'true',
  magic_home_announcement: '',
  magic_maintenance_message: '',
  magic_free_tools_enabled: 'true',
  magic_pro_tools_enabled: 'true',
  magic_court_enabled: 'true',
  magic_pathfinder_enabled: 'true',
  magic_storm_enabled: 'true',
  magic_familiar_enabled: 'true',
  magic_featured_tool: 'pathfinder',
  magic_pro_upsell_blurb:
    'Pro unlocks full Storm, Familiar, live Court, Path & Personality, and Moon Mirror vaults — same Hazel plan as the apothecary.',
};

let cache = null;
let cacheAt = 0;
const TTL_MS = 60_000;

export async function fetchMagicPlatformSettings({ force = false } = {}) {
  if (!force && cache && Date.now() - cacheAt < TTL_MS) return cache;
  if (!isAuthConfigured()) {
    cache = { ...DEFAULTS };
    cacheAt = Date.now();
    return cache;
  }
  try {
    const { data, error } = await supabaseAuth.from('platform_settings').select('key, value');
    if (error) {
      cache = { ...DEFAULTS };
      cacheAt = Date.now();
      return cache;
    }
    const map = { ...DEFAULTS };
    (data || []).forEach((row) => {
      if (row.key && String(row.key).startsWith('magic_')) {
        map[row.key] = row.value;
      }
    });
    cache = map;
    cacheAt = Date.now();
    return map;
  } catch {
    cache = { ...DEFAULTS };
    cacheAt = Date.now();
    return cache;
  }
}

export function magicSettingOn(settings, key) {
  if (!settings) return DEFAULTS[key] !== 'false';
  return settings[key] !== 'false';
}

export { DEFAULTS as MAGIC_SETTING_DEFAULTS };
