/**
 * Enable Supabase Auth custom SMTP via Resend (signup / password-reset emails).
 *
 * Usage:
 *   $env:RESEND_API_KEY="re_..."
 *   $env:SUPABASE_ACCESS_TOKEN="sbp_..."   # org owner token from supabase.com/dashboard/account/tokens
 *   node scripts/hazel-auth-smtp-apply.mjs
 */
const REF = 'jihinbkeqlkgywfsxizj';
const APP_URL = 'https://apothecary.hazelallure.com';
const FROM_EMAIL = 'noreply@hazelallure.com';
const FROM_NAME = 'Hazel Allure';

const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const resendKey = process.env.RESEND_API_KEY?.trim();

if (!token) {
  console.error(`
Set SUPABASE_ACCESS_TOKEN (must be org-owner / full-access token):
  https://supabase.com/dashboard/account/tokens

  $env:SUPABASE_ACCESS_TOKEN="sbp_..."
  $env:RESEND_API_KEY="re_..."
  node scripts/hazel-auth-smtp-apply.mjs
`);
  process.exit(1);
}

if (!resendKey) {
  console.error('Set RESEND_API_KEY');
  process.exit(1);
}

const redirectUrls = [
  `${APP_URL}/**`,
  `${APP_URL}/login`,
  `${APP_URL}/email-verify`,
  `${APP_URL}/vendor-email-verify`,
  'http://localhost:5173/**',
  'http://localhost:5173/email-verify',
  'http://localhost:5173/vendor-email-verify',
];

const body = {
  site_url: APP_URL,
  uri_allow_list: redirectUrls.join(','),
  external_email_enabled: true,
  smtp_admin_email: FROM_EMAIL,
  smtp_sender_name: FROM_NAME,
  smtp_host: 'smtp.resend.com',
  smtp_port: 465,
  smtp_user: 'resend',
  smtp_pass: resendKey,
  mailer_autoconfirm: false,
};

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

console.log('Fetching current Auth config…');
const getRes = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, { headers });
if (!getRes.ok) {
  console.error('GET auth config failed:', getRes.status, await getRes.text());
  console.error('\nIf 403: generate a new access token while logged in as the project org owner.');
  process.exit(1);
}

const current = await getRes.json();
console.log('Current SMTP:', current.external_email_enabled ? 'custom' : 'default');
console.log('Site URL:', current.site_url);

const patchRes = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify(body),
});

const text = await patchRes.text();
if (!patchRes.ok) {
  console.error('PATCH failed:', patchRes.status, text);
  process.exit(1);
}

console.log('═'.repeat(60));
console.log('Supabase Auth SMTP configured via Resend');
console.log('═'.repeat(60));
console.log(`Sender:     ${FROM_NAME} <${FROM_EMAIL}>`);
console.log(`Site URL:   ${APP_URL}`);
console.log('Redirects:  /email-verify, /vendor-email-verify');
console.log('\nTest: sign up at /customer-signup — confirmation should arrive from noreply@hazelallure.com');
console.log('═'.repeat(60));