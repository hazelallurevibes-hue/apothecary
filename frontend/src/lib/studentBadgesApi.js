import { supabase } from './supabaseClient';

export const STUDENT_BADGE_TYPES = {
  top_student: { label: 'Top Student', icon: '🏆', color: 'amber' },
  class_favorite: { label: 'Class Favorite', icon: '💜', color: 'plum' },
  completion: { label: 'Course Completion', icon: '📜', color: 'sage' },
  custom: { label: 'Honors', icon: '✨', color: 'gold' },
};

export async function issueStudentBadge({
  vendorId,
  courseId,
  studentEmail,
  badgeType,
  title,
  note,
  templateId,
}) {
  const { data, error } = await supabase
    .from('student_badges_issued')
    .insert({
      vendor_id: vendorId,
      course_id: courseId || null,
      student_email: studentEmail.trim().toLowerCase(),
      badge_type: badgeType,
      title: title.trim(),
      note: note?.trim() || null,
      template_id: templateId || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchBadgesForStudent(email) {
  const { data, error } = await supabase
    .from('student_badges_issued')
    .select('*, vendors(name), vendor_courses(title)')
    .eq('student_email', email.trim().toLowerCase())
    .order('issued_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchBadgesIssuedByVendor(vendorId) {
  const { data, error } = await supabase
    .from('student_badges_issued')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('issued_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchCourseEnrollees(courseId) {
  const { data, error } = await supabase
    .from('vendor_course_enrollments')
    .select('user_email, enrolled_at')
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((r) => ({
    student_email: r.user_email,
    student_name: r.user_email?.split('@')[0],
    enrolled_at: r.enrolled_at,
  }));
}