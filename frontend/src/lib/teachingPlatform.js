import { supabase } from './supabaseClient';
import { isProPlan } from './plans';
import { parseVideoUrl } from './videoEmbed';

export async function fetchPublishedCourses({ vendorId, category, search } = {}) {
  let q = supabase
    .from('vendor_courses')
    .select('*, vendors(id, name, logo)')
    .eq('published', true)
    .eq('approved', 1)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (vendorId) q = q.eq('vendor_id', vendorId);
  if (category) q = q.eq('category', category);
  const { data, error } = await q;
  if (error) throw error;
  let rows = data || [];
  if (search?.trim()) {
    const s = search.toLowerCase();
    rows = rows.filter(
      (c) => c.title?.toLowerCase().includes(s) || c.description?.toLowerCase().includes(s),
    );
  }
  return rows;
}

export async function fetchVendorCourses(vendorId) {
  const { data, error } = await supabase
    .from('vendor_courses')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchCourseById(id) {
  const { data, error } = await supabase.from('vendor_courses').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchCourseLessons(courseId) {
  const { data, error } = await supabase
    .from('vendor_course_lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function saveCourse(course) {
  const payload = { ...course, updated_at: new Date().toISOString() };
  if (course.preview_video_url) {
    const p = parseVideoUrl(course.preview_video_url);
    payload.preview_video_provider = p?.provider || null;
  }
  if (course.id) {
    const { data, error } = await supabase.from('vendor_courses').update(payload).eq('id', course.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('vendor_courses').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function saveLesson(lesson) {
  const payload = { ...lesson };
  if (lesson.video_url) {
    const p = parseVideoUrl(lesson.video_url);
    payload.video_provider = p?.provider || null;
  }
  if (lesson.id) {
    const { data, error } = await supabase.from('vendor_course_lessons').update(payload).eq('id', lesson.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('vendor_course_lessons').insert(payload).select().single();
  if (error) throw error;
  await supabase
    .from('vendor_courses')
    .update({ lesson_count: (await fetchCourseLessons(lesson.course_id)).length })
    .eq('id', lesson.course_id);
  return data;
}

export async function deleteLesson(id, courseId) {
  const { error } = await supabase.from('vendor_course_lessons').delete().eq('id', id);
  if (error) throw error;
  const lessons = await fetchCourseLessons(courseId);
  await supabase.from('vendor_courses').update({ lesson_count: lessons.length }).eq('id', courseId);
}

export function coursePriceForCustomer(course, customerPlan) {
  const base = Number(course?.price) || 0;
  const proPrice = course?.pro_member_price != null ? Number(course.pro_member_price) : null;
  if (isProPlan(customerPlan) && proPrice != null) return proPrice;
  return base;
}

export async function enrollInCourse({ courseId, user, amountPaid, discountApplied = 0 }) {
  const { data, error } = await supabase
    .from('vendor_course_enrollments')
    .insert({
      course_id: courseId,
      user_id: user?.id || null,
      user_email: user.email,
      amount_paid: amountPaid,
      discount_applied: discountApplied,
      pro_member_at_purchase: isProPlan(user?.customer_plan),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function isEnrolled(courseId, email) {
  if (!email) return false;
  const { data } = await supabase
    .from('vendor_course_enrollments')
    .select('id')
    .eq('course_id', courseId)
    .ilike('user_email', email.trim())
    .maybeSingle();
  return !!data;
}

export const COURSE_CATEGORIES = [
  { id: 'herbalism', label: 'Herbalism & apothecary' },
  { id: 'spiritual', label: 'Spiritual practice' },
  { id: 'energy', label: 'Energy & Reiki' },
  { id: 'tarot', label: 'Tarot & divination' },
  { id: 'wellness', label: 'Wellness & self-care' },
  { id: 'ritual', label: 'Ritual & ceremony' },
  { id: 'business', label: 'Healer business' },
  { id: 'other', label: 'Other' },
];