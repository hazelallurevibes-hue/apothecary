import { supabase } from './supabaseClient';
import { EMAIL_SETTING_DEFAULTS } from './siteEmail';

const DEFAULTS = {
  stale_listing_days: '90',
  email_order_alerts: 'true',
  email_expiry_alerts: 'true',
  campaign_requires_approval: 'true',
  free_vendor_campaigns_per_month: '0',
  paid_vendor_campaigns_per_month: '20',
  report_escalation_threshold: '3',
  email_allergen_alerts: 'true',
  email_onboarding_series: 'true',
  campaign_double_opt_in: 'true',
  require_id_before_listing: 'false',
  smart_id_review: 'true',
  pro_billing_enabled: 'true',
  stripe_vendor_pro_price_id: '',
  stripe_customer_pro_price_id: '',
  stripe_vendor_pro_monthly_display: '29.99',
  stripe_customer_pro_monthly_display: '9.99',
  stripe_mode: 'test',
  stripe_vendor_pro_annual_price_id: '',
  stripe_customer_pro_annual_price_id: '',
  stripe_vendor_pro_annual_display: '299.99',
  stripe_customer_pro_annual_display: '99.99',
  stripe_live_mode_enabled: 'false',
  hearth_auto_block_enabled: 'true',
  hearth_auto_flag_enabled: 'true',
  hearth_strike_post_ban: '3',
  hearth_warning_days: '30',
  hearth_show_community_banner: 'true',
  auto_approve_vendor_signup: 'false',
  auto_approve_id_verification: 'false',
  auto_approve_permit_verification: 'false',
  require_legal_name_on_id: 'true',
  require_id_back_with_legal_name: 'true',
  tie_vendor_approval_to_id: 'false',
  auto_hide_listing_on_escalation: 'true',
  ...EMAIL_SETTING_DEFAULTS,
};

export async function fetchPlatformSettings() {
  const { data, error } = await supabase.from('platform_settings').select('key, value');
  if (error) {
    if (error.code === '42P01') return { ...DEFAULTS };
    return { ...DEFAULTS };
  }
  const map = { ...DEFAULTS };
  (data || []).forEach((row) => {
    map[row.key] = row.value;
  });
  return map;
}

export async function updatePlatformSetting(key, value) {
  const { error } = await supabase
    .from('platform_settings')
    .upsert({ key, value: String(value), updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}

export async function updatePlatformSettings(patch) {
  for (const [key, value] of Object.entries(patch)) {
    await updatePlatformSetting(key, value);
  }
}