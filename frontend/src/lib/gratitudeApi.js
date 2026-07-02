import { supabase } from './supabaseClient';
import { analyzeContent, fetchActiveWordFilters } from './communityModeration';

const MAX_LEN = 280;

export async function fetchApprovedBlessings(limit = 40) {
  const { data, error } = await supabase
    .from('hearth_gratitude_blessings')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error && error.code !== '42P01') throw new Error(error.message);
  if (error?.code === '42P01') return [];
  return data || [];
}

export async function fetchPendingBlessings() {
  const { data, error } = await supabase
    .from('hearth_gratitude_blessings')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function submitBlessing(email, body) {
  if (!email) throw new Error('Sign in to leave a blessing.');
  const trimmed = (body || '').trim().slice(0, MAX_LEN);
  if (trimmed.length < 4) throw new Error('Write at least a few words of gratitude.');

  const filters = await fetchActiveWordFilters().catch(() => []);
  const analysis = analyzeContent(trimmed, filters);
  if (!analysis.allowed) throw new Error(analysis.userMessage || 'That blessing was blocked by community filters.');

  const status = analysis.flagged ? 'pending' : 'approved';

  const { data, error } = await supabase
    .from('hearth_gratitude_blessings')
    .insert({
      user_email: email.trim().toLowerCase(),
      body: trimmed,
      status,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function moderateBlessing(id, status, moderatorEmail) {
  const { error } = await supabase
    .from('hearth_gratitude_blessings')
    .update({ status, moderated_by: moderatorEmail || null })
    .eq('id', id);
  if (error) throw new Error(error.message);
}