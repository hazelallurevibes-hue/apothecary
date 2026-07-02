import { supabase } from './supabaseClient';
import { fetchPlatformSettings } from './platformSettingsApi';

const MOD_MESSAGE = {
  block: 'This message contains language that violates our community guidelines. Hate speech, bullying, and harassment are not tolerated on The Hearth.',
  strike: 'Your account has active community warnings. Posting is temporarily restricted — contact Support if you believe this is an error.',
  locked: 'This thread is locked by moderators.',
};

let filterCache = null;
let filterCacheAt = 0;
const CACHE_MS = 60_000;

function normalizeText(text) {
  return (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function phraseMatches(normalized, filter) {
  const phrase = normalizeText(filter.phrase);
  if (!phrase) return false;
  if (filter.match_type === 'exact') return normalized === phrase;
  if (filter.match_type === 'word') {
    const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return re.test(normalized);
  }
  return normalized.includes(phrase);
}

export function analyzeContent(text, filters = []) {
  const normalized = normalizeText(text);
  const matches = (filters || []).filter((f) => f.active !== false && phraseMatches(normalized, f));
  const blocked = matches.some((m) => m.severity === 'block');
  const flagged = matches.some((m) => m.severity === 'flag' || m.severity === 'warn');
  const top = matches.find((m) => m.severity === 'block') || matches[0];
  return {
    allowed: !blocked,
    blocked,
    flagged,
    matches,
    reason: top ? `${top.category}: "${top.phrase}"` : null,
    userMessage: blocked ? MOD_MESSAGE.block : null,
  };
}

export async function fetchActiveWordFilters(force = false) {
  if (!force && filterCache && Date.now() - filterCacheAt < CACHE_MS) return filterCache;
  const { data, error } = await supabase
    .from('community_word_filters')
    .select('*')
    .eq('active', true)
    .order('severity', { ascending: true });
  if (error) throw new Error(error.message);
  filterCache = data || [];
  filterCacheAt = Date.now();
  return filterCache;
}

export function invalidateFilterCache() {
  filterCache = null;
}

export async function fetchModerators() {
  const { data, error } = await supabase.from('community_moderators').select('*').eq('active', true).order('display_name');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function isCommunityMod(email) {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  const { data } = await supabase.from('community_moderators').select('id').eq('user_email', e).eq('active', true).maybeSingle();
  return !!data;
}

export async function getModProfile(email) {
  const { data } = await supabase.from('community_moderators').select('*').eq('user_email', email.trim().toLowerCase()).eq('active', true).maybeSingle();
  return data;
}

export async function checkUserPostingRights(email) {
  const settings = await fetchPlatformSettings();
  const strikeLimit = Number(settings.hearth_strike_post_ban || 3);
  const windowDays = Number(settings.hearth_warning_days || 30);
  const since = new Date(Date.now() - windowDays * 86400000).toISOString();
  const { data, error } = await supabase
    .from('community_warnings')
    .select('strike_level')
    .eq('user_email', email.trim().toLowerCase())
    .gte('created_at', since);
  if (error) throw new Error(error.message);
  const strikes = (data || []).reduce((s, w) => s + (w.strike_level || 1), 0);
  if (strikes >= strikeLimit) {
    return { allowed: false, strikes, reason: MOD_MESSAGE.strike };
  }
  return { allowed: true, strikes };
}

export async function guardCommunityContent({ email, title = '', body, spaceType = 'seeker' }) {
  const rights = await checkUserPostingRights(email);
  if (!rights.allowed) throw new Error(rights.reason);

  const settings = await fetchPlatformSettings();
  const filters = await fetchActiveWordFilters();
  const combined = [title, body].filter(Boolean).join(' ');
  const analysis = analyzeContent(combined, filters);

  if (analysis.blocked && settings.hearth_auto_block_enabled !== 'false') {
    await logModAction({
      actorEmail: 'system@auto-mod',
      actionType: 'auto_block',
      targetUserEmail: email.trim().toLowerCase(),
      note: `${spaceType}: ${analysis.reason}`,
    });
    await issueWarning({
      userEmail: email,
      reason: `Auto-blocked post attempt: ${analysis.reason}`,
      warningType: 'auto_mod',
      strikeLevel: 1,
      issuedByEmail: 'system@auto-mod',
      spaceType,
    });
    throw new Error(analysis.userMessage || MOD_MESSAGE.block);
  }

  const shouldFlag = analysis.flagged && settings.hearth_auto_flag_enabled !== 'false';
  return { analysis, shouldFlag, moderationStatus: shouldFlag ? 'flagged' : 'visible', autoFlagReason: shouldFlag ? analysis.reason : null };
}

export async function issueWarning({ userEmail, reason, warningType = 'admin', strikeLevel = 1, issuedByEmail, modId, spaceType = 'seeker' }) {
  const { data, error } = await supabase.from('community_warnings').insert({
    user_email: userEmail.trim().toLowerCase(),
    reason: reason.trim().slice(0, 500),
    warning_type: warningType,
    strike_level: strikeLevel,
    issued_by_email: issuedByEmail?.trim().toLowerCase() || null,
    mod_id: modId || null,
    space_type: spaceType,
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
  }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchWarningsForUser(email) {
  const { data, error } = await supabase.from('community_warnings').select('*').eq('user_email', email.trim().toLowerCase()).order('created_at', { ascending: false }).limit(20);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchRecentWarnings(limit = 40) {
  const { data, error } = await supabase.from('community_warnings').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function logModAction({ actorEmail, actionType, targetType, targetId, targetUserEmail, note }) {
  const { error } = await supabase.from('community_mod_actions').insert({
    actor_email: actorEmail.trim().toLowerCase(),
    action_type: actionType,
    target_type: targetType || null,
    target_id: targetId || null,
    target_user_email: targetUserEmail?.trim().toLowerCase() || null,
    note: note?.trim().slice(0, 500) || null,
  });
  if (error) throw new Error(error.message);
}

export async function hidePost(postId, actorEmail, note) {
  const { error } = await supabase.from('community_posts').update({
    hidden: true,
    moderation_status: 'hidden',
    moderated_by: actorEmail.trim().toLowerCase(),
    moderated_at: new Date().toISOString(),
    auto_flag_reason: note || null,
  }).eq('id', postId);
  if (error) throw new Error(error.message);
  await logModAction({ actorEmail, actionType: 'hide_post', targetType: 'post', targetId: postId, note });
}

export async function lockThread(threadId, actorEmail, lock = true) {
  const { error } = await supabase.from('community_threads').update({
    locked: lock,
    moderation_status: lock ? 'flagged' : 'visible',
    moderated_by: actorEmail.trim().toLowerCase(),
    moderated_at: new Date().toISOString(),
  }).eq('id', threadId);
  if (error) throw new Error(error.message);
  await logModAction({ actorEmail, actionType: lock ? 'lock_thread' : 'unlock_thread', targetType: 'thread', targetId: threadId });
}

export async function assignModerator(row) {
  const { data, error } = await supabase.from('community_moderators').upsert({
    user_email: row.user_email.trim().toLowerCase(),
    display_name: row.display_name.trim(),
    space_type: row.space_type || 'both',
    badge_title: row.badge_title || 'Hearth Keeper',
    active: row.active !== false,
    appointed_by: row.appointed_by?.trim().toLowerCase() || null,
    notes: row.notes || null,
  }, { onConflict: 'user_email' }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function revokeModerator(email) {
  const { error } = await supabase.from('community_moderators').update({ active: false }).eq('user_email', email.trim().toLowerCase());
  if (error) throw new Error(error.message);
}

export async function addWordFilter(row) {
  const { data, error } = await supabase.from('community_word_filters').insert({
    phrase: row.phrase.trim().toLowerCase(),
    match_type: row.match_type || 'substring',
    severity: row.severity || 'block',
    category: row.category || 'other',
    active: true,
    created_by: row.created_by?.trim().toLowerCase() || null,
  }).select().single();
  if (error) throw new Error(error.message);
  invalidateFilterCache();
  return data;
}

export async function toggleWordFilter(id, active) {
  const { error } = await supabase.from('community_word_filters').update({ active }).eq('id', id);
  if (error) throw new Error(error.message);
  invalidateFilterCache();
}

export async function deleteWordFilter(id) {
  const { error } = await supabase.from('community_word_filters').delete().eq('id', id);
  if (error) throw new Error(error.message);
  invalidateFilterCache();
}

export async function fetchModActions(limit = 30) {
  const { data, error } = await supabase.from('community_mod_actions').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
}

export const REPORT_PRESETS = [
  { id: 'hate', label: 'Hate speech' },
  { id: 'bully', label: 'Bullying or harassment' },
  { id: 'threat', label: 'Threats or intimidation' },
  { id: 'spam', label: 'Spam or solicitation' },
  { id: 'medical', label: 'Unsafe medical advice' },
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'other', label: 'Other policy violation' },
];