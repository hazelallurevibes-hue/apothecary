/**
 * Deploy Hazel Stripe checkout edge function.
 * Token: SUPABASE_ACCESS_TOKEN or Windows Credential Manager "Supabase CLI:supabase"
 */
import { execSync, spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REF = 'jihinbkeqlkgywfsxizj';

function loadToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN?.trim()) return process.env.SUPABASE_ACCESS_TOKEN.trim();
  try {
    const ps = `
Add-Type -TypeDefinition @'
using System; using System.Runtime.InteropServices; using System.Text;
public class CH {
  [DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)]
  public static extern bool CredRead(string t, int ty, int r, out IntPtr p);
  [DllImport("advapi32.dll", SetLastError=true)] public static extern bool CredFree(IntPtr p);
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
    return execSync(`powershell -NoProfile -Command "${ps.replace(/"/g, '\\"')}"`, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const token = loadToken();
if (!token || !token.startsWith('sbp_')) {
  console.error('No SUPABASE_ACCESS_TOKEN. Create one at https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

const env = { ...process.env, SUPABASE_ACCESS_TOKEN: token };
const r = spawnSync(
  'npx',
  ['supabase', 'functions', 'deploy', 'create-pro-checkout', '--project-ref', REF],
  { cwd: ROOT, env, encoding: 'utf8', shell: true },
);
process.stdout.write(r.stdout || '');
process.stderr.write(r.stderr || '');
process.exit(r.status ?? 1);
