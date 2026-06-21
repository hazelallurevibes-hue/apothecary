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
  require_id_before_listing: 'true',
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