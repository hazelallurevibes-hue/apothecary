import { supabase } from './supabaseClient';
import { parseRecipientList } from './campaignsApi';

function randomToken() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function fetchVendorRecipients(vendorId) {
  const { data, error } = await supabase
    .from('vendor_campaign_recipients')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export async function addRecipientsPending(vendorId, rawEmails) {
  const emails = parseRecipientList(rawEmails);
  if (!emails.length) throw new Error('No valid emails.');
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const rows = emails.map((email) => ({
    vendor_id: vendorId,
    email,
    status: 'pending',
    confirm_token: randomToken(),
    confirm_token_expires: expires,
  }));
  const { data, error } = await supabase
    .from('vendor_campaign_recipients')
    .upsert(rows, { onConflict: 'vendor_id,email', ignoreDuplicates: true })
    .select();
  if (error) throw new Error(error.message || 'Run PLATFORM_OPTIONAL_SUGGESTIONS.sql');
  return data || [];
}

async function callEdgeFunction(name, body) {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) throw new Error('VITE_SUPABASE_URL not configured');
  const res = await fetch(`${base}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `${name} failed`);
  return json;
}

export async function confirmRecipientByToken(token) {
  return callEdgeFunction('confirm-campaign-opt-in', { token });
}

export async function unsubscribeByToken(token) {
  return callEdgeFunction('process-email-unsubscribe', { token });
}

export async function invokeSendOptIn({ vendorId, recipientId }) {
  return callEdgeFunction('send-campaign-opt-in', { vendor_id: vendorId, recipient_id: recipientId });
}

export function confirmedEmails(recipients) {
  return (recipients || []).filter((r) => r.status === 'confirmed').map((r) => r.email);
}