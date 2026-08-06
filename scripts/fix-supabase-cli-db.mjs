/**
 * Diagnose / document Supabase CLI linked DB access.
 *
 * CLI `db query --linked` needs the database password as SUPABASE_DB_PASSWORD.
 * Our .env.migrate currently has POSTGRES_PASSWORD empty — that is why CLI fails
 * with: password authentication failed for user "cli_login_postgres".
 *
 * Service-role REST (scripts/db-via-service-role.mjs) still works without DB password.
 *
 * To fix CLI permanently:
 * 1. Supabase Dashboard → Project Settings → Database → Database password
 *    (reset if unknown)
 * 2. Put it in backend/.env.local (gitignored):
 *      SUPABASE_DB_PASSWORD=your-password
 *      POSTGRES_PASSWORD=your-password
 * 3. Re-link: npx supabase link --project-ref jihinbkeqlkgywfsxizj -p YOUR_PASSWORD
 * 4. Test: npx supabase db query --linked "select 1 as ok"
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
function load(p) {
  if (!fs.existsSync(p)) return {};
  const o = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (v) o[k] = v;
  }
  return o;
}
const env = {
  ...load(path.join(root, '.env.local')),
  ...load(path.join(root, 'backend', '.env.local')),
  ...load(path.join(root, '.env.migrate')),
};
const dbPw = process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD || env.SUPABASE_DB_PASSWORD || env.POSTGRES_PASSWORD;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;

console.log(
  JSON.stringify(
    {
      cliLoggedInLikely: true,
      projectRef: 'jihinbkeqlkgywfsxizj',
      hasDatabasePassword: !!dbPw && dbPw.length > 0,
      databasePasswordLength: dbPw ? dbPw.length : 0,
      hasServiceRole: !!service,
      recommendation: dbPw
        ? 'SUPABASE_DB_PASSWORD is set — try: npx supabase db query --linked "select 1 as ok"'
        : 'CLI db query will fail until you set SUPABASE_DB_PASSWORD (Dashboard → Database password). Use node scripts/db-via-service-role.mjs status for heals.',
    },
    null,
    2,
  ),
);
