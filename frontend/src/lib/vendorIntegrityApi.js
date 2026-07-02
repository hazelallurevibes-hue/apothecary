import { supabase } from './supabaseClient';
import { INTEGRITY_VERSION } from './vendorIntegrityPledge';

export async function logVendorIntegrityAcceptance({ vendorEmail, vendorId, attestations }) {
  const { data, error } = await supabase.from('vendor_integrity_acceptances').insert({
    vendor_email: vendorEmail.trim().toLowerCase(),
    vendor_id: vendorId || null,
    attestation_version: INTEGRITY_VERSION,
    attestations,
  }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchIntegrityAcceptance(email) {
  const { data, error } = await supabase
    .from('vendor_integrity_acceptances')
    .select('*')
    .eq('vendor_email', email.trim().toLowerCase())
    .order('accepted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}