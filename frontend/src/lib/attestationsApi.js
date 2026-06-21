import { supabase } from './supabaseClient';
import { VENDOR_LISTING_ATTESTATIONS } from './vendorListingAgreement';

export async function logListingAttestation({
  vendorId,
  userEmail,
  itemType,
  itemId,
  itemName,
  attestationIds,
}) {
  const ids = attestationIds?.length
    ? attestationIds
    : VENDOR_LISTING_ATTESTATIONS.map((a) => a.id);

  const { error } = await supabase.from('listing_attestations').insert({
    vendor_id: vendorId,
    user_email: userEmail || null,
    item_type: itemType,
    item_id: itemId || null,
    item_name: itemName,
    attestation_ids: ids.join(','),
  });

  if (error && error.code !== '42P01') {
    console.warn('logListingAttestation:', error.message);
  }
}

export async function fetchListingAttestations({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('listing_attestations')
    .select('*, vendors(name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export function attestationsToCsv(rows) {
  const header = ['id', 'vendor_id', 'vendor_name', 'user_email', 'item_type', 'item_id', 'item_name', 'attestation_ids', 'created_at'];
  const lines = [header.join(',')];
  for (const r of rows || []) {
    lines.push([
      r.id,
      r.vendor_id,
      csvEscape(r.vendors?.name || ''),
      csvEscape(r.user_email || ''),
      r.item_type,
      r.item_id,
      csvEscape(r.item_name || ''),
      csvEscape(r.attestation_ids || ''),
      r.created_at,
    ].join(','));
  }
  return lines.join('\n');
}

function csvEscape(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}