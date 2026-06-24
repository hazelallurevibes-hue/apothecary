import { supabase } from './supabaseClient';

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchOpenSlots(vendorId, { from = new Date().toISOString(), limit = 20 } = {}) {
  const { data, error } = await supabase
    .from('practitioner_session_slots')
    .select('*')
    .eq('vendor_id', Number(vendorId))
    .eq('status', 'open')
    .gte('starts_at', from)
    .order('starts_at', { ascending: true })
    .limit(limit);

  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export async function fetchVendorSlots(vendorId) {
  const { data, error } = await supabase
    .from('practitioner_session_slots')
    .select('*')
    .eq('vendor_id', Number(vendorId))
    .gte('starts_at', new Date(Date.now() - 86400000).toISOString())
    .order('starts_at', { ascending: true })
    .limit(50);

  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export async function createSessionSlot(slot) {
  const { data, error } = await supabase
    .from('practitioner_session_slots')
    .insert({
      ...slot,
      vendor_id: Number(slot.vendor_id),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function cancelSessionSlot(slotId) {
  const { error } = await supabase
    .from('practitioner_session_slots')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', slotId);

  if (error) throw new Error(error.message);
}

export async function bookSessionSlot({ slotId, email, name, notes }) {
  const res = await fetch(`${FN_BASE}/create-session-checkout`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      slot_id: slotId,
      email: email?.trim().toLowerCase(),
      seeker_name: name,
      notes,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Booking failed');
  if (json.url) {
    window.location.href = json.url;
    return json;
  }
  return json;
}

export async function fetchMyBookings(email) {
  if (!email) return [];
  const { data, error } = await supabase
    .from('practitioner_bookings')
    .select('*, practitioner_session_slots(*)')
    .ilike('seeker_email', email.trim())
    .order('booked_at', { ascending: false })
    .limit(20);

  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export function formatSlotTime(iso, timezone = 'America/Denver') {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}