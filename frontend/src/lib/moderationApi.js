import { supabase } from './supabaseClient';

export async function reportContent({ reporterEmail, reason, threadId, postId, cohortThreadId, cohortPostId }) {
  const { error } = await supabase.from('community_reports').insert({
    reporter_email: reporterEmail.trim().toLowerCase(),
    reason: reason.trim(),
    thread_id: threadId || null,
    post_id: postId || null,
    cohort_thread_id: cohortThreadId || null,
    cohort_post_id: cohortPostId || null,
    status: 'pending',
  });
  if (error) throw new Error(error.message);
}

export async function fetchPendingReports() {
  const { data, error } = await supabase.from('community_reports').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateReportStatus(id, status, adminNote) {
  const { error } = await supabase.from('community_reports').update({ status, admin_note: adminNote }).eq('id', id);
  if (error) throw new Error(error.message);
}