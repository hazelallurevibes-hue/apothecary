import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(ROOT, 'backend', 'package.json'));
const { createClient } = require('@supabase/supabase-js');

const env = {};
const p = join(ROOT, 'backend', '.env.local');
if (existsSync(p)) {
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
for (const col of ['business_badges', 'admin_badges', 'featured_rank', 'spotlight_note']) {
  const { error } = await admin.from('vendors').select(col).limit(1);
  console.log(`${col}: ${error ? error.message : 'OK'}`);
}