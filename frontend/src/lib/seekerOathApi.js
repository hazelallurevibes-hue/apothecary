import { supabase } from './supabaseClient';
import { SEEKER_OATH_VERSION } from './seekerOathPledge';

export async function logSeekerOathAcceptance({ userEmail, attestations }) {
  const { data, error } = await supabase.from('seeker_oath_acceptances').insert({
    user_email: userEmail.trim().toLowerCase(),
    attestation_version: SEEKER_OATH_VERSION,
    attestations,
  }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchSeekerOathAcceptance(email) {
  const { data, error } = await supabase
    .from('seeker_oath_acceptances')
    .select('*')
    .eq('user_email', email.trim().toLowerCase())
    .order('accepted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}