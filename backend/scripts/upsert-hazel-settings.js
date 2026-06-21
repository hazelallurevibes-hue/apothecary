const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rows = [
  ['site_url', 'https://apothecary.hazelallure.com'],
  ['site_name', 'Hazel Allure Apothecary'],
  ['legal_entity', 'Hazel Allure LLC'],
  ['owner_email', 'abeytamonico@yahoo.com'],
  ['infra_owner', 'garrettpistool-lab'],
  ['vertical_id', 'hazelallure'],
  ['email_contact', 'hazelallurevibes@gmail.com'],
  ['email_support', 'hazelallurevibes@gmail.com'],
  ['blog_url', 'https://www.hazelallure.com'],
  ['platform_fee_percent', '8'],
  ['teaching_platform_enabled', 'true'],
  ['vendor_discounts_enabled', 'true'],
];

(async () => {
  for (const [key, value] of rows) {
    const { error } = await admin.from('platform_settings').upsert({ key, value }, { onConflict: 'key' });
    console.log(error ? `ERR ${key}: ${error.message}` : `OK ${key}`);
  }
})();