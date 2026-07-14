import { supabaseAuth, isAuthConfigured } from './supabaseAuth.js';
import { loadHistory, recordHistory } from './historyStore.js';

/** Push local history rows to magic_user_history when signed in */
export async function syncHistoryToCloud(userId, email) {
  if (!isAuthConfigured() || !userId) return { ok: false, reason: 'no-auth' };
  const local = loadHistory().slice(0, 50);
  if (!local.length) return { ok: true, count: 0 };
  try {
    const rows = local.map((h) => ({
      user_id: String(userId),
      user_email: email || null,
      entry_id: h.id,
      entry_type: h.type,
      title: h.title,
      summary: h.summary,
      payload: h.payload || {},
      anonymous: !!h.anonymous,
      created_at: h.createdAt,
    }));
    const { error } = await supabaseAuth.from('magic_user_history').upsert(rows, {
      onConflict: 'entry_id',
    });
    if (error) return { ok: false, reason: error.message };
    return { ok: true, count: rows.length };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

export async function pullHistoryFromCloud(userId) {
  if (!isAuthConfigured() || !userId) return [];
  try {
    const { data, error } = await supabaseAuth
      .from('magic_user_history')
      .select('*')
      .eq('user_id', String(userId))
      .order('created_at', { ascending: false })
      .limit(100);
    if (error || !data?.length) return [];
    // merge into local without duplicating
    const localIds = new Set(loadHistory().map((h) => h.id));
    for (const r of data) {
      if (localIds.has(r.entry_id)) continue;
      recordHistory({
        type: r.entry_type,
        title: r.title,
        summary: r.summary,
        payload: r.payload,
        anonymous: r.anonymous,
      });
    }
    return data;
  } catch {
    return [];
  }
}
