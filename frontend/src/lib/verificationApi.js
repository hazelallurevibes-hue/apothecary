import { supabase } from './supabaseClient';

export async function fetchIdentityVerification(vendorId) {
  const { data, error } = await supabase
    .from('vendor_identity_verifications')
    .select('*')
    .eq('vendor_id', vendorId)
    .maybeSingle();
  if (error && error.code !== '42P01') throw new Error(error.message);
  return data;
}

export async function submitIdentityVerification(vendorId, { idFrontUrl, idBackUrl, selfieUrl }) {
  const { data, error } = await supabase
    .from('vendor_identity_verifications')
    .upsert({
      vendor_id: vendorId,
      id_front_url: idFrontUrl,
      id_back_url: idBackUrl,
      selfie_url: selfieUrl,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'vendor_id' })
    .select()
    .single();
  if (error) throw new Error(error.message || 'Run PLATFORM_LAUNCH_READY.sql');
  return data;
}

export async function fetchPermitVerifications(vendorId) {
  const { data, error } = await supabase
    .from('vendor_permit_verifications')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('submitted_at', { ascending: false })
    .limit(10);
  if (error && error.code !== '42P01') return [];
  return data || [];
}

export async function submitPermitVerification(vendorId, { permitType, documentUrl }) {
  const { data, error } = await supabase
    .from('vendor_permit_verifications')
    .insert({
      vendor_id: vendorId,
      permit_type: permitType || 'cottage_food',
      document_url: documentUrl,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchPendingVerifications() {
  const [idRes, permitRes] = await Promise.all([
    supabase.from('vendor_identity_verifications').select('*, vendors(name, email)').eq('status', 'pending'),
    supabase.from('vendor_permit_verifications').select('*, vendors(name, email)').eq('status', 'pending'),
  ]);
  return {
    identity: idRes.data || [],
    permits: permitRes.data || [],
  };
}

export async function reviewIdentity(vendorId, { status, adminNotes }) {
  const { error } = await supabase
    .from('vendor_identity_verifications')
    .update({ status, admin_notes: adminNotes, reviewed_at: new Date().toISOString() })
    .eq('vendor_id', vendorId);
  if (error) throw new Error(error.message);
}

export async function reviewPermit(id, { status, adminNotes }) {
  const { error } = await supabase
    .from('vendor_permit_verifications')
    .update({ status, admin_notes: adminNotes, reviewed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}