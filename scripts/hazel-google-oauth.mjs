/**
 * Google sign-in setup checklist for Hazel Allure (Supabase Auth — "Continue with Google").
 *
 * Usage:
 *   node scripts/hazel-google-oauth.mjs
 *
 * After creating OAuth credentials in Google Cloud, paste into Supabase Dashboard
 * or set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET and run with --print-only (default).
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SUPABASE_REF = 'jihinbkeqlkgywfsxizj';
const SUPABASE_URL = `https://${SUPABASE_REF}.supabase.co`;
const APP_URL = 'https://apothecary.hazelallure.com';

console.log('═'.repeat(60));
console.log('Hazel Allure — Google OAuth (Supabase Auth)');
console.log('═'.repeat(60));

console.log(`
1. Google Cloud Console → APIs & Services → Credentials
   Create OAuth client ID → Web application
   Name: Hazel Allure Apothecary

2. Authorized JavaScript origins:
   ${APP_URL}
   http://localhost:5173

3. Authorized redirect URIs (exactly one for Supabase):
   ${SUPABASE_URL}/auth/v1/callback

4. Supabase Dashboard → Authentication → Providers → Google
   Enable Google provider
   Paste Client ID + Client Secret

5. Supabase → Authentication → URL Configuration
   Site URL: ${APP_URL}
   Redirect URLs (add each):
   ${APP_URL}/**
   ${APP_URL}/login
   http://localhost:5173/**
   http://localhost:5173/login

6. Test: open ${APP_URL}/login → "Continue with Google"
   First sign-in auto-creates a customer profile via submit_customer_signup RPC.

Note: This is separate from Auth0. Login page offers both when VITE_AUTH0_ENABLED=true.
`);

const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
if (clientId && clientSecret) {
  console.log('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.');
  console.log('Paste them in Supabase Dashboard → Authentication → Providers → Google');
  console.log(`  Client ID: ${clientId.slice(0, 12)}…`);
} else {
  console.log('Optional: set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in shell to confirm they are loaded.');
}

console.log('═'.repeat(60));