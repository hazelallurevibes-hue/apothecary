import { supabase } from './supabaseClient';

export const REPORT_REASONS = [
  { id: 'unsafe_food', label: 'Unsafe or unverified food practices' },
  { id: 'misleading', label: 'Misleading description or photos' },
  { id: 'prohibited', label: 'Prohibited or illegal item' },
  { id: 'allergen', label: 'Missing or wrong allergen info' },
  { id: 'expired', label: 'Expired or spoiled product' },
  { id: 'other', label: 'Other concern' },
];

export async function submitListingReport({
  itemType,
  itemId,
  itemName,
  vendorId,
  reporterEmail,
  reporterUserId,
  reason,
  details,
}) {
  const { data, error } = await supabase
    .from('listing_reports')
    .insert({
      item_type: itemType,
      item_id: itemId,
      item_name: itemName,
      vendor_id: vendorId || null,
      reporter_email: reporterEmail || null,
      reporter_user_id: reporterUserId || null,
      reason,
      details: details || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '42P01') {
      throw new Error('Reporting is not enabled yet — run PLATFORM_ENHANCEMENTS.sql in Supabase.');
    }
    throw new Error(error.message);
  }
  return data;
}

export async function fetchListingReports({ status = 'pending', limit = 50 } = {}) {
  let query = supabase
    .from('listing_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export async function updateListingReportStatus(id, status, adminNotes) {
  const { error } = await supabase
    .from('listing_reports')
    .update({
      status,
      admin_notes: adminNotes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}