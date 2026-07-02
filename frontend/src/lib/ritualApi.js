import { supabase } from './supabaseClient';

export async function fetchTodayRitual(email) {
  const { data, error } = await supabase
    .from('user_daily_rituals')
    .select('*')
    .eq('user_email', email.trim().toLowerCase())
    .eq('ritual_date', new Date().toISOString().slice(0, 10))
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function saveDailyRitual(email, intentionText) {
  const { data, error } = await supabase.from('user_daily_rituals').upsert({
    user_email: email.trim().toLowerCase(),
    ritual_date: new Date().toISOString().slice(0, 10),
    intention_text: intentionText.slice(0, 280),
  }, { onConflict: 'user_email,ritual_date' }).select().single();
  if (error) throw new Error(error.message);
  return data;
}