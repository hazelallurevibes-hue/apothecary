/**
 * Add Magic Sanctum redirect URLs to Hazel Supabase Auth allow-list.
 *
 * Uses SUPABASE_ACCESS_TOKEN env, or Windows "Supabase CLI:supabase" credential.
 *
 *   node scripts/hazel-magic-supabase-setup.mjs
 */
import { execSync } from 'child_process';

const REF = 'jihinbkeqlkgywfsxizj';
const MAGIC_URLS = [
  'https://magic.hazelallure.com',
  'https://magic.hazelallure.com/',
  'https://magic.hazelallure.com/**',
  'https://magic-sanctum.vercel.app',
  'https://magic-sanctum.vercel.app/',
  'https://magic-sanctum.vercel.app/**',
  'https://magic-sanctum-*-hazel-allure.vercel.app/**',
  'http://localhost:5174/',
  'http://localhost:5174/**',
];

function loadToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
    return process.env.SUPABASE_ACCESS_TOKEN.trim();
  }
  // PowerShell helper — read UTF-8 blob from Credential Manager
  try {
    const ps = `
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices; using System.Text;
public class CH {
  [DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)]
  public static extern bool CredRead(string t, int ty, int r, out IntPtr p);
  [DllImport("advapi32.dll", SetLastError=true)] public static extern bool CredFree(IntPtr c);
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
  public struct C { public int F; public int T; public IntPtr N; public IntPtr Co;
    public System.Runtime.InteropServices.ComTypes.FILETIME L; public int S; public IntPtr B;
    public int P; public int A; public IntPtr At; public IntPtr Ta; public IntPtr U; }
  public static string R(string t) {
    IntPtr p; if (!CredRead(t,1,0,out p)) return "";
    var c=(C)Marshal.PtrToStructure(p,typeof(C));
    byte[] b=new byte[c.S]; Marshal.Copy(c.B,b,0,c.S); CredFree(p);
    return Encoding.UTF8.GetString(b).TrimEnd((char)0);
  }
}
'@
[CH]::R('Supabase CLI:supabase')
`;
    return execSync(`powershell -NoProfile -Command "${ps.replace(/"/g, '\\"')}"`, {
      encoding: 'utf8',
    }).trim();
  } catch {
    return '';
  }
}

const token = loadToken();
if (!token || !token.startsWith('sbp_')) {
  console.error('Need SUPABASE_ACCESS_TOKEN (sbp_...) or logged-in Supabase CLI.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

const getRes = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, { headers });
if (!getRes.ok) {
  console.error('GET failed', getRes.status, await getRes.text());
  process.exit(1);
}
const current = await getRes.json();
const existing = String(current.uri_allow_list || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const set = new Set([...existing, ...MAGIC_URLS]);
const uri_allow_list = [...set].sort().join(',');

const patchRes = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({ uri_allow_list }),
});
if (!patchRes.ok) {
  console.error('PATCH failed', patchRes.status, await patchRes.text());
  process.exit(1);
}

console.log('═'.repeat(56));
console.log('Hazel Supabase Auth — Magic Sanctum redirects OK');
console.log('═'.repeat(56));
console.log('Project:', REF);
console.log('Site URL (unchanged):', current.site_url);
console.log('Allow-list entries:', set.size);
for (const u of [...set].sort()) {
  if (u.includes('magic')) console.log('  +', u);
}
console.log('═'.repeat(56));
