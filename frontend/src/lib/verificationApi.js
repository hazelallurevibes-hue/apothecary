import { supabase } from './supabaseClient';
import { fetchPlatformSettings } from './platformSettingsApi';

async function maybeAutoApproveIdentity(vendorId) {
  const settings = await fetchPlatformSettings();
  if (settings.auto_approve_id_verification !== 'true') return 'pending';

  const now = new Date().toISOString();
  await supabase
    .from('vendor_identity_verifications')
    .update({
      status: 'approved',
      reviewed_at: now,
      admin_notes: 'Auto-approved by platform setting',
    })
    .eq('vendor_id', vendorId);

  if (settings.tie_vendor_approval_to_id === 'true') {
    await supabase.from('vendors').update({ status: 'approved' }).eq('id', vendorId).eq('status', 'pending');
  }

  return 'approved';
}

async function maybeAutoApprovePermit(permitId, vendorId) {
  const settings = await fetchPlatformSettings();
  if (settings.auto_approve_permit_verification !== 'true') return 'pending';

  await supabase
    .from('vendor_permit_verifications')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      admin_notes: 'Auto-approved by platform setting',
    })
    .eq('id', permitId);

  return 'approved';
}

export async function fetchIdentityVerification(vendorId) {
  const { data, error } = await supabase
    .from('vendor_identity_verifications')
    .select('*')
    .eq('vendor_id', vendorId)
    .maybeSingle();
  if (error && error.code !== '42P01') throw new Error(error.message);
  return data;
}

export async function submitIdentityVerification(vendorId, { idFrontUrl, idBackUrl, selfieUrl, legalName }) {
  const settings = await fetchPlatformSettings();
  const requireLegal = settings.require_legal_name_on_id !== 'false';
  const requireBack = settings.require_id_back_with_legal_name === 'true';

  if (requireLegal && !legalName?.trim()) {
    throw new Error('Enter your full legal name exactly as printed on your government ID.');
  }
  if (requireBack && !idBackUrl) {
    throw new Error('Upload the back of your ID — it must show your legal name.');
  }

  const { data, error } = await supabase
    .from('vendor_identity_verifications')
    .upsert({
      vendor_id: vendorId,
      id_front_url: idFrontUrl,
      id_back_url: idBackUrl,
      selfie_url: selfieUrl,
      legal_name: legalName?.trim() || null,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'vendor_id' })
    .select()
    .single();
  if (error) throw new Error(error.message || 'Run PLATFORM_LAUNCH_READY.sql');

  const finalStatus = await maybeAutoApproveIdentity(vendorId);
  if (finalStatus === 'approved') {
    const { data: approved } = await supabase
      .from('vendor_identity_verifications')
      .select('*')
      .eq('vendor_id', vendorId)
      .maybeSingle();
    return approved || data;
  }
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

  const finalStatus = await maybeAutoApprovePermit(data.id, vendorId);
  if (finalStatus === 'approved') {
    const { data: approved } = await supabase
      .from('vendor_permit_verifications')
      .select('*')
      .eq('id', data.id)
      .maybeSingle();
    return approved || data;
  }
  return data;
}

export async function fetchPendingVerifications() {
  const [idRes, permitRes] = await Promise.all([
    supabase.from('vendor_identity_verifications').select('*, vendors(name, email, status, identity_verified)').eq('status', 'pending'),
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