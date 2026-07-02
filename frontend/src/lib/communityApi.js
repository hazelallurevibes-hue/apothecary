import { supabase } from './supabaseClient';

export async function fetchTopics(spaceType, vendorId = null) {
  let q = supabase
    .from('community_topics')
    .select('*')
    .eq('space_type', spaceType)
    .order('sort_order');
  if (spaceType === 'vendor' && vendorId) {
    q = q.or(`vendor_id.is.null,vendor_id.eq.${vendorId}`);
  } else if (spaceType === 'seeker') {
    q = q.is('vendor_id', null);
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchThreads(topicId) {
  const { data, error } = await supabase
    .from('community_threads')
    .select('*')
    .eq('topic_id', topicId)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchThread(threadId) {
  const { data: thread, error: tErr } = await supabase
    .from('community_threads')
    .select('*, community_topics(title, space_type)')
    .eq('id', threadId)
    .maybeSingle();
  if (tErr) throw new Error(tErr.message);
  if (!thread) return null;

  const { data: posts, error: pErr } = await supabase
    .from('community_posts')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at');
  if (pErr) throw new Error(pErr.message);
  return { thread, posts: posts || [] };
}

export async function createThread({ topicId, authorEmail, title, body }) {
  const email = authorEmail.trim().toLowerCase();
  const { data: thread, error: tErr } = await supabase
    .from('community_threads')
    .insert({ topic_id: topicId, author_email: email, title: title.trim() })
    .select()
    .single();
  if (tErr) throw new Error(tErr.message);

  const { error: pErr } = await supabase.from('community_posts').insert({
    thread_id: thread.id,
    author_email: email,
    body: body.trim(),
  });
  if (pErr) throw new Error(pErr.message);
  return thread;
}

export async function replyToThread({ threadId, authorEmail, body }) {
  const { error } = await supabase.from('community_posts').insert({
    thread_id: threadId,
    author_email: authorEmail.trim().toLowerCase(),
    body: body.trim(),
  });
  if (error) throw new Error(error.message);

  await supabase
    .from('community_threads')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', threadId);
}