import { DEFAULT_APP_URL } from './appUrl';

/** Default platform email addresses — admin overrides via platform_settings. */
export const EMAIL_SETTING_KEYS = [
  { key: 'site_url', label: 'Site URL', placeholder: 'https://www.Hazel Allure.com', type: 'url', hint: 'Used in all email links and Auth0 fallbacks.' },
  { key: 'email_from_name', label: 'From display name', placeholder: 'Hazel Allure', type: 'text', hint: 'Name shown on outgoing system emails.' },
  { key: 'email_from_address', label: 'From address (sender)', placeholder: 'noreply@Hazel Allure.com', type: 'email', hint: 'Must be verified in Resend for your domain.' },
  { key: 'email_reply_to', label: 'Reply-to address', placeholder: 'support@Hazel Allure.com', type: 'email', hint: 'Where customer replies to transactional mail go.' },
  { key: 'email_contact', label: 'Public contact email', placeholder: 'hello@Hazel Allure.com', type: 'email', hint: 'Main contact shown in site footer and Contact page.' },
  { key: 'email_support', label: 'Support email', placeholder: 'support@Hazel Allure.com', type: 'email', hint: 'Help & account issues.' },
  { key: 'email_orders', label: 'Orders email', placeholder: 'orders@Hazel Allure.com', type: 'email', hint: 'Order-related inquiries.' },
  { key: 'email_admin', label: 'Admin notifications', placeholder: 'admin@Hazel Allure.com', type: 'email', hint: 'Platform alerts to your team.' },
  { key: 'email_vendors', label: 'Vendor relations', placeholder: 'vendors@Hazel Allure.com', type: 'email', hint: 'Vendor onboarding & partnership mail.' },
  { key: 'email_info', label: 'General info', placeholder: 'info@Hazel Allure.com', type: 'email', hint: 'General inquiries mailbox.' },
];

export const EMAIL_SETTING_DEFAULTS = {
  site_url: DEFAULT_APP_URL,
  email_from_name: 'Hazel Allure',
  email_from_address: 'noreply@Hazel Allure.com',
  email_reply_to: 'support@Hazel Allure.com',
  email_contact: 'hello@Hazel Allure.com',
  email_support: 'support@Hazel Allure.com',
  email_orders: 'orders@Hazel Allure.com',
  email_admin: 'admin@Hazel Allure.com',
  email_vendors: 'vendors@Hazel Allure.com',
  email_info: 'info@Hazel Allure.com',
};

export function formatFromHeader(settings) {
  const name = settings?.email_from_name || EMAIL_SETTING_DEFAULTS.email_from_name;
  const addr = settings?.email_from_address || EMAIL_SETTING_DEFAULTS.email_from_address;
  return `${name} <${addr}>`;
}

export function pickPublicContact(settings) {
  return (
    settings?.email_contact
    || settings?.email_support
    || settings?.email_info
    || EMAIL_SETTING_DEFAULTS.email_contact
  );
}

export function emailSettingsFromPlatform(map) {
  const out = { ...EMAIL_SETTING_DEFAULTS };
  for (const { key } of EMAIL_SETTING_KEYS) {
    if (map?.[key] != null && map[key] !== '') out[key] = map[key];
  }
  return out;
}