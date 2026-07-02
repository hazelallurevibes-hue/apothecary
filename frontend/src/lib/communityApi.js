import { supabase } from './supabaseClient';
import { guardCommunityContent, logModAction } from './communityModeration';
import { reportContent } from './moderationApi';

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
    .eq('hidden', false)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).filter((t) => t.moderation_status !== 'removed');
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
    .eq('hidden', false)
    .order('created_at');
  if (pErr) throw new Error(pErr.message);
  return { thread, posts: (posts || []).filter((p) => p.moderation_status !== 'removed') };
}

export async function createThread({ topicId, authorEmail, title, body, spaceType = 'seeker' }) {
  const email = authorEmail.trim().toLowerCase();
  const mod = await guardCommunityContent({ email, title, body, spaceType });

  const { data: thread, error: tErr } = await supabase
    .from('community_threads')
    .insert({ topic_id: topicId, author_email: email, title: title.trim() })
    .select()
    .single();
  if (tErr) throw new Error(tErr.message);

  const { data: post, error: pErr } = await supabase.from('community_posts').insert({
    thread_id: thread.id,
    author_email: email,
    body: body.trim(),
    moderation_status: mod.moderationStatus,
    auto_flag_reason: mod.autoFlagReason,
    hidden: false,
  }).select().single();
  if (pErr) throw new Error(pErr.message);

  if (mod.shouldFlag) {
    await reportContent({
      reporterEmail: 'system@auto-mod',
      reason: `Auto-flagged: ${mod.autoFlagReason}`,
      threadId: thread.id,
      postId: post.id,
    });
    await logModAction({
      actorEmail: 'system@auto-mod',
      actionType: 'auto_flag',
      targetType: 'post',
      targetId: post.id,
      targetUserEmail: email,
      note: mod.autoFlagReason,
    });
  }
  return thread;
}

export async function replyToThread({ threadId, authorEmail, body, spaceType = 'seeker' }) {
  const email = authorEmail.trim().toLowerCase();
  const { data: thread } = await supabase.from('community_threads').select('locked').eq('id', threadId).maybeSingle();
  if (thread?.locked) throw new Error('This thread is locked by moderators.');

  const mod = await guardCommunityContent({ email, body, spaceType });

  const { data: post, error } = await supabase.from('community_posts').insert({
    thread_id: threadId,
    author_email: email,
    body: body.trim(),
    moderation_status: mod.moderationStatus,
    auto_flag_reason: mod.autoFlagReason,
    hidden: false,
  }).select().single();
  if (error) throw new Error(error.message);

  if (mod.shouldFlag) {
    await reportContent({
      reporterEmail: 'system@auto-mod',
      reason: `Auto-flagged: ${mod.autoFlagReason}`,
      threadId,
      postId: post.id,
    });
    await logModAction({
      actorEmail: 'system@auto-mod',
      actionType: 'auto_flag',
      targetType: 'post',
      targetId: post.id,
      targetUserEmail: email,
      note: mod.autoFlagReason,
    });
  }

  await supabase
    .from('community_threads')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', threadId);
}