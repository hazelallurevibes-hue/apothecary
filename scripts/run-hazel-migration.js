/**
 * Run Hazel Allure apothecary platform migration against linked Supabase.
 * Usage: node scripts/run-hazel-migration.js
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const root = path.join(__dirname, '..');
const envPath = path.join(root, 'backend', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env.local');
  process.exit(1);
}

const sqlPath = path.join(root, 'supabase', 'migrations', '20260622100000_hazelallure_apothecary_platform.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

// Strip psql-only commands; run via REST rpc if available, else statement batches
const statements = sql
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith('--') && !s.startsWith('\\'));

async function main() {
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const settings = [
    ['site_url', 'https://apothecary.hazelallure.com'],
    ['site_name', 'Hazel Allure Apothecary'],
    ['legal_entity', 'Hazel Allure LLC'],
    ['owner_email', 'abeytamonico@yahoo.com'],
    ['infra_owner', 'garrettpistool-lab'],
    ['email_contact', 'hazelallurevibes@gmail.com'],
    ['email_support', 'hazelallurevibes@gmail.com'],
    ['email_vendors', 'hazelallurevibes@gmail.com'],
    ['email_orders', 'hazelallurevibes@gmail.com'],
    ['blog_url', 'https://www.hazelallure.com'],
    ['platform_fee_percent', '8'],
    ['teaching_platform_enabled', 'true'],
    ['vendor_discounts_enabled', 'true'],
    ['vertical_id', 'hazelallure'],
  ];

  for (const [k, v] of settings) {
    const { error } = await admin.from('platform_settings').upsert({ key: k, value: v }, { onConflict: 'key' });
    if (error) console.warn('platform_settings', k, error.message);
    else console.log('OK platform_settings:', k);
  }

  console.log('\nMigration SQL must be run in Supabase SQL Editor for DDL (tables/columns).');
  console.log('File:', sqlPath);
  console.log('Platform settings upserted. Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});