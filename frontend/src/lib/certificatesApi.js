import { supabase } from './supabaseClient';
import { uploadVendorAsset } from './storageApi';

export async function fetchVendorCertificates(vendorId) {
  const { data, error } = await supabase
    .from('practitioner_certificates')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function uploadCertificate({ vendorId, user, file, title, issuer, issuedAt }) {
  const fileUrl = file ? await uploadVendorAsset(file, user, vendorId, 'certificates') : null;
  const { data, error } = await supabase
    .from('practitioner_certificates')
    .insert({
      vendor_id: vendorId,
      title: title.trim(),
      issuer: issuer?.trim() || null,
      file_url: fileUrl,
      issued_at: issuedAt || null,
      visible_on_storefront: true,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCertificate(id, vendorId) {
  const { error } = await supabase
    .from('practitioner_certificates')
    .delete()
    .eq('id', id)
    .eq('vendor_id', vendorId);
  if (error) throw new Error(error.message);
}

export async function fetchCertTemplates(vendorId) {
  const { data, error } = await supabase
    .from('digital_cert_templates')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function saveCertTemplate({ vendorId, courseId, title, subtitle, bodyText, sealColor, id }) {
  const row = {
    vendor_id: vendorId,
    course_id: courseId || null,
    title: title.trim(),
    subtitle: subtitle?.trim() || null,
    body_text: bodyText?.trim() || null,
    seal_color: sealColor || '#4a1942',
  };
  if (id) {
    const { data, error } = await supabase
      .from('digital_cert_templates')
      .update(row)
      .eq('id', id)
      .eq('vendor_id', vendorId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  const { data, error } = await supabase.from('digital_cert_templates').insert(row).select().single();
  if (error) throw new Error(error.message);
  return data;
}