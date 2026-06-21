/**
 * One-off: create/update Supabase Auth admin user.
 * Usage: node scripts/setup-admin-auth.js
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

const EMAIL = 'abeytamonico@yahoo.com';
const PASSWORD = process.argv[2] || process.env.ADMIN_PASSWORD;
const REMOVE = ['mkjr21@bpicius.com', 'MKJR21@bpicius.com'];

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in backend/.env.local');
  if (!PASSWORD) throw new Error('Pass password as argv[2] or set ADMIN_PASSWORD');

  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (listErr) throw listErr;

  for (const oldEmail of REMOVE) {
    const old = list.users.find((u) => (u.email || '').toLowerCase() === oldEmail.toLowerCase());
    if (old) {
      const { error } = await admin.auth.admin.deleteUser(old.id);
      if (error) console.warn('Delete', oldEmail, error.message);
      else console.log('Removed auth user:', oldEmail);
    }
  }

  const existing = list.users.find((u) => (u.email || '').toLowerCase() === EMAIL.toLowerCase());

  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { name: 'Admin', role: 'admin' },
    });
    if (error) throw error;
    console.log('Updated auth user:', data.user.id, EMAIL);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { name: 'Admin', role: 'admin' },
    });
    if (error) throw error;
    console.log('Created auth user:', data.user.id, EMAIL);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});