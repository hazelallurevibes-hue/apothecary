const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const EMAIL = process.argv[2] || 'abeytamonico@yahoo.com';
const PASSWORD = process.argv[3];

async function main() {
  const anon = createClient(process.env.SUPABASE_URL, 'sb_publishable_x2rbLAzFGk60hqE0RkOYsQ_6D0kNWll');
  const { data, error } = await anon.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (error) throw error;
  console.log('LOGIN OK:', data.user.email);

  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: profile } = await admin.from('users').select('id, role, email').eq('email', EMAIL).single();
  console.log('PROFILE:', profile);
}

main().catch((e) => {
  console.error('FAIL:', e.message || e);
  process.exit(1);
});