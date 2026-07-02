import { supabase } from './supabaseClient';

export async function markLessonComplete({ studentEmail, lessonId, courseId }) {
  const { error } = await supabase.from('course_lesson_progress').upsert(
    {
      student_email: studentEmail.trim().toLowerCase(),
      lesson_id: lessonId,
      course_id: courseId,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'student_email,lesson_id' },
  );
  if (error) throw new Error(error.message);
}

export async function fetchLessonProgress(studentEmail, courseId) {
  const { data, error } = await supabase
    .from('course_lesson_progress')
    .select('lesson_id, completed_at')
    .eq('student_email', studentEmail.trim().toLowerCase())
    .eq('course_id', courseId);
  if (error) throw new Error(error.message);
  return new Set((data || []).map((r) => r.lesson_id));
}

export function completionPercent(completedCount, totalLessons) {
  if (!totalLessons) return 0;
  return Math.round((completedCount / totalLessons) * 100);
}