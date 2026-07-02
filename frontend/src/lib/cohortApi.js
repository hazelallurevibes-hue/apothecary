import { supabase } from './supabaseClient';

export async function fetchCohortThreads(courseId) {
  const { data, error } = await supabase
    .from('cohort_threads')
    .select('*')
    .eq('course_id', courseId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchCohortThread(threadId) {
  const { data: thread, error: tErr } = await supabase.from('cohort_threads').select('*').eq('id', threadId).maybeSingle();
  if (tErr) throw new Error(tErr.message);
  const { data: posts, error: pErr } = await supabase.from('cohort_posts').select('*').eq('thread_id', threadId).order('created_at');
  if (pErr) throw new Error(pErr.message);
  return { thread, posts: posts || [] };
}

export async function createCohortThread({ courseId, authorEmail, title, body }) {
  const email = authorEmail.trim().toLowerCase();
  const { data: thread, error: tErr } = await supabase
    .from('cohort_threads')
    .insert({ course_id: courseId, author_email: email, title: title.trim() })
    .select()
    .single();
  if (tErr) throw new Error(tErr.message);
  await supabase.from('cohort_posts').insert({ thread_id: thread.id, author_email: email, body: body.trim() });
  return thread;
}

export async function replyCohort({ threadId, authorEmail, body }) {
  const { error } = await supabase.from('cohort_posts').insert({
    thread_id: threadId,
    author_email: authorEmail.trim().toLowerCase(),
    body: body.trim(),
  });
  if (error) throw new Error(error.message);
}