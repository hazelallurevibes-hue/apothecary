import { supabase } from './supabaseClient';
import { VERTICAL } from './vertical';

/** Platform settings for dedicated Hazel Allure Supabase (not shared with Bpicius). */
export async function fetchHazelPlatformSettings() {
  const { data, error } = await supabase.from('platform_settings').select('key, value');
  if (error) throw error;
  const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  return {
    siteUrl: map.site_url || VERTICAL.appUrl,
    siteName: map.site_name || VERTICAL.name,
    contactEmail: map.email_contact || VERTICAL.contactEmail,
    blogUrl: map.blog_url || VERTICAL.blogBaseUrl,
    teachingEnabled: map.teaching_platform_enabled === 'true',
    discountsEnabled: map.vendor_discounts_enabled === 'true',
    raw: map,
  };
}