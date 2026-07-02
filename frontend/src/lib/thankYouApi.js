import { supabase } from './supabaseClient';

export async function sendThankYouNote({ vendorId, studentEmail, message, reviewId, voiceUrl }) {
  const { data, error } = await supabase.from('thank_you_notes').insert({
    vendor_id: vendorId,
    student_email: studentEmail.trim().toLowerCase(),
    message: message.trim().slice(0, 500),
    review_id: reviewId || null,
    voice_url: voiceUrl?.trim() || null,
  }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchThankYouNotesForStudent(email) {
  const { data, error } = await supabase.from('thank_you_notes').select('*, vendors(name)').eq('student_email', email.trim().toLowerCase()).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function pinThankYouNote(noteId, email, pinned) {
  const { error } = await supabase.from('thank_you_notes').update({ pinned_on_profile: pinned }).eq('id', noteId).eq('student_email', email.trim().toLowerCase());
  if (error) throw new Error(error.message);
}