import { supabase } from './supabaseClient';

export async function fetchUpcomingOfficeHours({ vendorId, courseId } = {}) {
  let q = supabase
    .from('office_hours_slots')
    .select('*, vendors(name)')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')
    .limit(20);
  if (vendorId) q = q.eq('vendor_id', vendorId);
  if (courseId) q = q.eq('course_id', courseId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createOfficeHoursSlot(row) {
  const { data, error } = await supabase.from('office_hours_slots').insert(row).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function signupOfficeHours(slotId, seekerEmail) {
  const { error } = await supabase.from('office_hours_signups').insert({
    slot_id: slotId,
    seeker_email: seekerEmail.trim().toLowerCase(),
  });
  if (error) throw new Error(error.message);
}

export async function fetchSignups(slotId) {
  const { data, error } = await supabase.from('office_hours_signups').select('*').eq('slot_id', slotId);
  if (error) throw new Error(error.message);
  return data || [];
}