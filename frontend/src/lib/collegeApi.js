import { supabase } from './supabaseClient';

export const SYLLABUS_TYPES = {
  reading: { label: 'Reading', icon: '📖' },
  assignment: { label: 'Assignment', icon: '📝' },
  live: { label: 'Live session', icon: '📡' },
  ritual: { label: 'Ritual practice', icon: '🕯️' },
  exam: { label: 'Reflection exam', icon: '🪞' },
  discussion: { label: 'Discussion', icon: '💬' },
  office_hours: { label: 'Office hours', icon: '🏛️' },
};

export const HONOR_TYPES = {
  deans_list: { label: "Dean's List", icon: '🌟' },
  presidents_list: { label: "President's List", icon: '👑' },
  sanctum_scholar: { label: 'Sanctum Scholar', icon: '📜' },
  rising_scholar: { label: 'Rising Scholar', icon: '🌱' },
  community_scholar: { label: 'Community Scholar', icon: '🕯️' },
};

// ── Syllabus ────────────────────────────────────────────────────────────────
export async function fetchSyllabus(courseId) {
  const { data, error } = await supabase.from('course_syllabus_items').select('*').eq('course_id', courseId).order('week_number').order('sort_order');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function saveSyllabusItem(item) {
  if (item.id) {
    const { data, error } = await supabase.from('course_syllabus_items').update(item).eq('id', item.id).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
  const { data, error } = await supabase.from('course_syllabus_items').insert(item).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Study groups ────────────────────────────────────────────────────────────
export async function fetchStudyGroups(courseId) {
  const { data, error } = await supabase.from('study_groups').select('*, study_group_members(count)').eq('course_id', courseId);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createStudyGroup({ courseId, name, description, createdBy, maxMembers = 12 }) {
  const { data, error } = await supabase.from('study_groups').insert({
    course_id: courseId, name, description, created_by: createdBy, max_members: maxMembers,
  }).select().single();
  if (error) throw new Error(error.message);
  await supabase.from('study_group_members').insert({ group_id: data.id, user_email: createdBy });
  return data;
}

export async function joinStudyGroup(groupId, email) {
  const { error } = await supabase.from('study_group_members').insert({ group_id: groupId, user_email: email.trim().toLowerCase() });
  if (error) throw new Error(error.message);
}

// ── Evaluations ─────────────────────────────────────────────────────────────
export async function submitEvaluation({ courseId, userEmail, rating, feedback, wouldRecommend, anonymous }) {
  const { error } = await supabase.from('course_evaluations').upsert({
    course_id: courseId,
    user_email: userEmail.trim().toLowerCase(),
    rating,
    feedback,
    would_recommend: wouldRecommend,
    anonymous,
  }, { onConflict: 'course_id,user_email' });
  if (error) throw new Error(error.message);
}

// ── Honor roll ──────────────────────────────────────────────────────────────
export async function fetchHonorRoll(email) {
  const { data, error } = await supabase.from('honor_roll_entries').select('*').eq('user_email', email.trim().toLowerCase()).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function issueHonor({ userEmail, termLabel, honorType, note, vendorId }) {
  const { error } = await supabase.from('honor_roll_entries').insert({
    user_email: userEmail.trim().toLowerCase(),
    term_label: termLabel,
    honor_type: honorType,
    note,
    issued_by_vendor_id: vendorId || null,
  });
  if (error) throw new Error(error.message);
}

// ── Waitlist ────────────────────────────────────────────────────────────────
export async function joinWaitlist(courseId, email) {
  const { error } = await supabase.from('course_waitlist').upsert({ course_id: courseId, user_email: email.trim().toLowerCase() }, { onConflict: 'course_id,user_email' });
  if (error) throw new Error(error.message);
}

// ── Calendar ────────────────────────────────────────────────────────────────
export async function fetchCalendarEvents({ courseId, vendorId } = {}) {
  let q = supabase.from('academic_calendar_events').select('*').gte('starts_at', new Date(Date.now() - 7 * 86400000).toISOString()).order('starts_at').limit(30);
  if (courseId) q = q.eq('course_id', courseId);
  if (vendorId) q = q.eq('vendor_id', vendorId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data || [];
}

// ── Assignments ─────────────────────────────────────────────────────────────
export async function submitAssignment({ syllabusItemId, studentEmail, body }) {
  const { error } = await supabase.from('assignment_submissions').upsert({
    syllabus_item_id: syllabusItemId,
    student_email: studentEmail.trim().toLowerCase(),
    body,
    submitted_at: new Date().toISOString(),
  }, { onConflict: 'syllabus_item_id,student_email' });
  if (error) throw new Error(error.message);
}

// ── Transcript (aggregated) ─────────────────────────────────────────────────
export async function buildTranscript(email) {
  const e = email.trim().toLowerCase();
  const [enrollments, badges, honors, progress] = await Promise.all([
    supabase.from('vendor_course_enrollments').select('*, vendor_courses(title, vendor_id)').eq('user_email', e),
    supabase.from('student_badges_issued').select('*, vendors(name)').eq('student_email', e),
    supabase.from('honor_roll_entries').select('*').eq('user_email', e),
    supabase.from('course_lesson_progress').select('course_id').eq('student_email', e),
  ]);
  const courses = enrollments.data || [];
  const lessonCounts = {};
  for (const p of progress.data || []) {
    lessonCounts[p.course_id] = (lessonCounts[p.course_id] || 0) + 1;
  }
  return {
    courses: courses.map((c) => ({
      title: c.vendor_courses?.title,
      enrolled_at: c.enrolled_at,
      lessons_completed: lessonCounts[c.course_id] || 0,
    })),
    badges: badges.data || [],
    honors: honors.data || [],
  };
}

// ── Mentor & opportunities ────────────────────────────────────────────────────
export async function requestMentor({ seekerEmail, courseId, topic }) {
  const { error } = await supabase.from('mentor_requests').insert({
    seeker_email: seekerEmail.trim().toLowerCase(),
    course_id: courseId || null,
    topic,
  });
  if (error) throw new Error(error.message);
}

export async function fetchOpportunities(vendorId) {
  let q = supabase.from('sanctum_opportunities').select('*, vendors(name)').order('created_at', { ascending: false }).limit(20);
  if (vendorId) q = q.eq('vendor_id', vendorId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function postOpportunity(row) {
  const { data, error } = await supabase.from('sanctum_opportunities').insert(row).select().single();
  if (error) throw new Error(error.message);
  return data;
}