import { supabase } from './supabaseClient';
import { localDateKey } from './loginStreakApi';

export async function fetchTodayConfession(email) {
  if (!email) return null;
  const today = localDateKey();
  const { data, error } = await supabase
    .from('user_confessions')
    .select('*')
    .eq('user_email', email.trim().toLowerCase())
    .eq('confession_date', today)
    .maybeSingle();
  if (error && error.code !== '42P01') throw new Error(error.message);
  if (error?.code === '42P01') return null;
  return data;
}

export async function fetchConfessionHistory(email, limit = 30) {
  if (!email) return [];
  const { data, error } = await supabase
    .from('user_confessions')
    .select('*')
    .eq('user_email', email.trim().toLowerCase())
    .order('confession_date', { ascending: false })
    .limit(limit);
  if (error && error.code !== '42P01') throw new Error(error.message);
  if (error?.code === '42P01') return [];
  return data || [];
}

export async function saveConfession(email, body) {
  if (!email) throw new Error('Login required');
  const trimmed = (body || '').trim().slice(0, 2000);
  if (!trimmed) throw new Error('Write something first.');
  const today = localDateKey();
  const payload = {
    user_email: email.trim().toLowerCase(),
    body: trimmed,
    confession_date: today,
    is_private: true,
  };
  const { data, error } = await supabase
    .from('user_confessions')
    .upsert(payload, { onConflict: 'user_email,confession_date' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}