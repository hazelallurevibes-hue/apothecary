import { supabase } from './supabaseClient';
import { fetchPlatformSettings } from './platformSettingsApi';
import { reviewIdentity, reviewPermit } from './verificationApi';

export async function logAdminAction(adminEmail, actionType, { targetType, targetId, details } = {}) {
  if (!adminEmail) return;
  try {
    await supabase.from('admin_action_log').insert({
      admin_email: adminEmail.trim().toLowerCase(),
      action_type: actionType,
      target_type: targetType || null,
      target_id: targetId != null ? String(targetId) : null,
      details: details || {},
    });
  } catch {
    /* table may not exist yet */
  }
}

export async function fetchAdminActionLog({ limit = 40 } = {}) {
  const { data, error } = await supabase
    .from('admin_action_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    if (error.code === '42P01') return [];
    return [];
  }
  return data || [];
}

export async function bulkApproveVendors(vendorIds, adminEmail) {
  const ids = (vendorIds || []).filter(Boolean);
  if (!ids.length) return { count: 0 };
  const { error } = await supabase
    .from('vendors')
    .update({ status: 'approved' })
    .in('id', ids);
  if (error) throw new Error(error.message);
  await logAdminAction(adminEmail, 'bulk_approve_vendors', {
    targetType: 'vendor',
    details: { ids },
  });
  return { count: ids.length };
}

export async function bulkApproveIdentityVerifications(vendorIds, adminEmail) {
  const ids = (vendorIds || []).filter(Boolean);
  if (!ids.length) return { count: 0 };
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('vendor_identity_verifications')
    .update({ status: 'approved', reviewed_at: now, admin_notes: 'Bulk approved by admin' })
    .in('vendor_id', ids);
  if (error) throw new Error(error.message);

  const settings = await fetchPlatformSettings();
  if (settings.tie_vendor_approval_to_id === 'true') {
    await supabase.from('vendors').update({ status: 'approved' }).in('id', ids).eq('status', 'pending');
  }

  await logAdminAction(adminEmail, 'bulk_approve_identity', {
    targetType: 'vendor_identity',
    details: { ids },
  });
  return { count: ids.length };
}

export async function bulkApprovePermits(permitIds, adminEmail) {
  const ids = (permitIds || []).filter(Boolean);
  if (!ids.length) return { count: 0 };
  const { error } = await supabase
    .from('vendor_permit_verifications')
    .update({ status: 'approved', reviewed_at: new Date().toISOString(), admin_notes: 'Bulk approved by admin' })
    .in('id', ids);
  if (error) throw new Error(error.message);
  await logAdminAction(adminEmail, 'bulk_approve_permits', {
    targetType: 'vendor_permit',
    details: { ids },
  });
  return { count: ids.length };
}

export async function approveVendorWithLog(vendorId, adminEmail) {
  const { error } = await supabase.from('vendors').update({ status: 'approved' }).eq('id', vendorId);
  if (error) throw new Error(error.message);
  await logAdminAction(adminEmail, 'approve_vendor', { targetType: 'vendor', targetId: vendorId });
}

export async function reviewIdentityWithLog(vendorId, payload, adminEmail) {
  await reviewIdentity(vendorId, payload);
  if (payload.status === 'approved') {
    const settings = await fetchPlatformSettings();
    if (settings.tie_vendor_approval_to_id === 'true') {
      await supabase.from('vendors').update({ status: 'approved' }).eq('id', vendorId).eq('status', 'pending');
    }
  }
  await logAdminAction(adminEmail, `identity_${payload.status}`, {
    targetType: 'vendor_identity',
    targetId: vendorId,
    details: { notes: payload.adminNotes },
  });
}

export async function reviewPermitWithLog(permitId, payload, adminEmail) {
  await reviewPermit(permitId, payload);
  await logAdminAction(adminEmail, `permit_${payload.status}`, {
    targetType: 'vendor_permit',
    targetId: permitId,
    details: { notes: payload.adminNotes },
  });
}

export async function setUserAccountStatus(userId, status, adminEmail) {
  const { error } = await supabase.from('users').update({ account_status: status }).eq('id', userId);
  if (error) throw new Error(error.message);
  await logAdminAction(adminEmail, status === 'suspended' ? 'suspend_user' : 'activate_user', {
    targetType: 'user',
    targetId: userId,
  });
}

export function validateLegalName(name) {
  const trimmed = (name || '').trim().replace(/\s+/g, ' ');
  if (trimmed.length < 3) return 'Enter your full legal name as shown on your ID.';
  const parts = trimmed.split(' ').filter(Boolean);
  if (parts.length < 2) return 'Enter first and last name exactly as printed on your government ID.';
  if (!/^[a-zA-ZÀ-ÿ'.,\- ]+$/.test(trimmed)) return 'Legal name should contain only letters, spaces, hyphens, and apostrophes.';
  return null;
}