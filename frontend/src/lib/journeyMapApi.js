import { supabase } from './supabaseClient';

export const JOURNEY_STEPS = [
  { id: 'account', label: 'Arrive', icon: '🕯️', hint: 'Create your seeker account' },
  { id: 'first_order', label: 'First offering', icon: '🌿', hint: 'Place your first order' },
  { id: 'first_course', label: 'Enter Sanctum', icon: '📚', hint: 'Enroll in a course' },
  { id: 'first_lesson', label: 'First lesson', icon: '✨', hint: 'Mark a lesson complete' },
  { id: 'first_review', label: 'Voice of gratitude', icon: '💫', hint: 'Leave a practitioner review' },
  { id: 'gathering', label: 'Join The Hearth', icon: '🔥', hint: 'Post in the gathering' },
  { id: 'study_group', label: 'Study circle', icon: '👥', hint: 'Join a study group' },
  { id: 'honor', label: 'Honor roll', icon: '🏆', hint: 'Earn a Sanctum honor' },
];

export async function computeJourneyProgress(email) {
  if (!email) return { completed: [], percent: 0 };
  const e = email.trim().toLowerCase();
  const completed = new Set(['account']);

  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).ilike('customer_email', e);
  if (orderCount > 0) completed.add('first_order');

  const { count: enrollCount } = await supabase.from('vendor_course_enrollments').select('*', { count: 'exact', head: true }).eq('user_email', e);
  if (enrollCount > 0) completed.add('first_course');

  const { count: lessonCount } = await supabase.from('course_lesson_progress').select('*', { count: 'exact', head: true }).eq('student_email', e);
  if (lessonCount > 0) completed.add('first_lesson');

  const { count: reviewCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).ilike('customer_email', e);
  if (reviewCount > 0) completed.add('first_review');

  const { count: postCount } = await supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('author_email', e);
  if (postCount > 0) completed.add('gathering');

  const { count: groupCount } = await supabase.from('study_group_members').select('*', { count: 'exact', head: true }).eq('user_email', e);
  if (groupCount > 0) completed.add('study_group');

  const { count: honorCount } = await supabase.from('honor_roll_entries').select('*', { count: 'exact', head: true }).eq('user_email', e);
  if (honorCount > 0) completed.add('honor');

  const ids = [...completed];
  return {
    completed: ids,
    percent: Math.round((ids.length / JOURNEY_STEPS.length) * 100),
  };
}