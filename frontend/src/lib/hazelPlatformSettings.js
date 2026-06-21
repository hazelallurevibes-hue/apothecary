import { supabase } from './supabaseClient';
import { VERTICAL } from './vertical';

const PREFIX = 'hazelallure_';

/** Load Hazel-specific platform_settings (prefixed — shared Supabase with Bpicius). */
export async function fetchHazelPlatformSettings() {
  const { data, error } = await supabase.from('platform_settings').select('key, value').like('key', `${PREFIX}%`);
  if (error) throw error;
  const map = {};
  for (const row of data || []) {
    map[row.key.replace(PREFIX, '')] = row.value;
  }
  return {
    siteUrl: map.site_url || VERTICAL.appUrl,
    siteName: map.site_name || VERTICAL.name,
    businessEmail: map.business_email || VERTICAL.businessEmail,
    blogUrl: map.blog_url || VERTICAL.blogBaseUrl,
    teachingEnabled: map.teaching_enabled === 'true',
    discountsEnabled: map.discounts_enabled === 'true',
    raw: map,
  };
}