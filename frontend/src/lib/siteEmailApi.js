import { supabase } from './supabaseClient';

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export async function sendTestSiteEmail(toEmail) {
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;

  const res = await fetch(`${FN_BASE}/send-test-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ to: toEmail }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Test email failed (${res.status})`);
  return body;
}