import { supabase } from './supabaseClient';
import { fetchPlatformSettings } from './platformSettingsApi';
import { evaluateIdentitySubmission } from './idQualityCheck';

async function patchOnboarding(vendorId, patch) {
  const { data: current } = await supabase
    .from('vendors')
    .select('onboarding_completed')
    .eq('id', vendorId)
    .maybeSingle();
  let steps = {};
  try {
    const raw = current?.onboarding_completed;
    steps = typeof raw === 'object' && raw ? { ...raw } : JSON.parse(raw || '{}') || {};
  } catch {
    steps = {};
  }
  Object.assign(steps, patch);
  await supabase.from('vendors').update({ onboarding_completed: steps }).eq('id', vendorId);
}

/**
 * Smart ID review:
 * - Completeness checks run always
 * - Clean packages auto-approve (default smart review) unless disabled
 * - Soft issues → status "flagged" for admin (seller progress still saved)
 */
async function runSmartIdentityReview(vendorId, payload, settings) {
  const smartOn = settings.smart_id_review !== 'false';
  const legacyAuto = settings.auto_approve_id_verification === 'true';
  const manualOnly = settings.auto_approve_id_verification === 'false' && settings.smart_id_review === 'false';
  const autoOn = !manualOnly && (legacyAuto || smartOn);

  const evaluation = evaluateIdentitySubmission({
    idFrontUrl: payload.idFrontUrl,
    idBackUrl: payload.idBackUrl,
    selfieUrl: payload.selfieUrl,
    legalName: payload.legalName,
    requireLegal: settings.require_legal_name_on_id !== 'false',
    requireBack: settings.require_id_back_with_legal_name === 'true',
  });

  const now = new Date().toISOString();
  let status = 'pending';
  let adminNotes = evaluation.summary;
  let identityVerified = false;

  if (!autoOn) {
    status = evaluation.ok ? 'pending' : 'flagged';
    adminNotes = `${evaluation.summary} (manual review mode)`;
  } else if (evaluation.recommendedStatus === 'approved') {
    status = 'approved';
    identityVerified = true;
    adminNotes = `Auto-approved · score ${evaluation.qualityScore}/100 · ${evaluation.summary}`;
  } else {
    status = 'flagged';
    adminNotes = `Flagged for admin · score ${evaluation.qualityScore}/100 · ${evaluation.summary}`;
  }

  await supabase
    .from('vendor_identity_verifications')
    .update({
      status,
      reviewed_at: status === 'approved' ? now : null,
      admin_notes: adminNotes,
      quality_score: evaluation.qualityScore,
      auto_flags: [...evaluation.issues, ...evaluation.flags],
    })
    .eq('vendor_id', vendorId);

  if (identityVerified) {
    await supabase.from('vendors').update({ identity_verified: true }).eq('id', vendorId);
    if (settings.tie_vendor_approval_to_id === 'true') {
      await supabase.from('vendors').update({ status: 'approved' }).eq('id', vendorId).eq('status', 'pending');
    }
  }

  await patchOnboarding(vendorId, {
    id_verification: true,
    id_verification_status: status === 'approved' ? 'approved' : status === 'flagged' ? 'flagged' : 'pending',
    id_quality_score: evaluation.qualityScore,
  }).catch(() => {});

  return status;
}

async function maybeAutoApprovePermit(permitId) {
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
    .upsert(
      {
        vendor_id: vendorId,
        id_front_url: idFrontUrl,
        id_back_url: idBackUrl,
        selfie_url: selfieUrl,
        legal_name: legalName?.trim() || null,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'vendor_id' },
    )
    .select()
    .single();
  if (error) throw new Error(error.message || 'Run PLATFORM_LAUNCH_READY.sql');

  const finalStatus = await runSmartIdentityReview(
    vendorId,
    { idFrontUrl, idBackUrl, selfieUrl, legalName },
    settings,
  );

  const { data: refreshed } = await supabase
    .from('vendor_identity_verifications')
    .select('*')
    .eq('vendor_id', vendorId)
    .maybeSingle();

  return refreshed || { ...data, status: finalStatus };
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

  const finalStatus = await maybeAutoApprovePermit(data.id);
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
  const [idRes, permitRes, flaggedRes] = await Promise.all([
    supabase
      .from('vendor_identity_verifications')
      .select('*, vendors(name, email, status, identity_verified)')
      .eq('status', 'pending'),
    supabase.from('vendor_permit_verifications').select('*, vendors(name, email)').eq('status', 'pending'),
    supabase
      .from('vendor_identity_verifications')
      .select('*, vendors(name, email, status, identity_verified)')
      .eq('status', 'flagged'),
  ]);
  return {
    identity: idRes.data || [],
    permits: permitRes.data || [],
    flagged: flaggedRes.data || [],
  };
}

export async function reviewIdentity(vendorId, { status, adminNotes }) {
  const { error } = await supabase
    .from('vendor_identity_verifications')
    .update({ status, admin_notes: adminNotes, reviewed_at: new Date().toISOString() })
    .eq('vendor_id', vendorId);
  if (error) throw new Error(error.message);

  if (status === 'approved') {
    await supabase.from('vendors').update({ identity_verified: true }).eq('id', vendorId);
    await patchOnboarding(vendorId, {
      id_verification: true,
      id_verification_status: 'approved',
    }).catch(() => {});
  } else if (status === 'rejected') {
    await supabase.from('vendors').update({ identity_verified: false }).eq('id', vendorId);
    await patchOnboarding(vendorId, {
      id_verification: false,
      id_verification_status: 'rejected',
    }).catch(() => {});
  }
}

export async function reviewPermit(id, { status, adminNotes }) {
  const { error } = await supabase
    .from('vendor_permit_verifications')
    .update({ status, admin_notes: adminNotes, reviewed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
