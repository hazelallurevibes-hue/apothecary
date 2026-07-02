import { supabase } from './supabaseClient';

export async function fetchChosenFamiliar(email) {
  if (!email) return null;
  const { data, error } = await supabase
    .from('users')
    .select('chosen_familiar')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();
  if (error && error.code !== '42703') throw new Error(error.message);
  if (error?.code === '42703') return null;
  return data?.chosen_familiar || null;
}

export async function saveChosenFamiliar(email, familiarId) {
  if (!email) return null;
  const { data, error } = await supabase
    .from('users')
    .update({ chosen_familiar: familiarId || null })
    .eq('email', email.trim().toLowerCase())
    .select('chosen_familiar')
    .single();
  if (error) throw new Error(error.message);
  return data?.chosen_familiar;
}