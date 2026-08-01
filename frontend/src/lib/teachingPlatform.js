import { supabase } from './supabaseClient';
import { isProPlan } from './plans';
import { parseVideoUrl } from './videoEmbed';
import { embedHaTeachInDescription, parseHaTeachMetadata } from './teachingStudio';

function normalizeJsonArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const p = JSON.parse(val);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Attach teaching metadata — prefers DB columns, falls back to HA_TEACH comment. */
export function enrichCourseWithTeachMeta(course) {
  if (!course) return course;
  const { delivery, styles, body } = parseHaTeachMetadata(course.description);
  const dbDelivery = normalizeJsonArray(course.delivery_modes);
  const dbStyles = normalizeJsonArray(course.learning_styles);
  return {
    ...course,
    description: body,
    delivery_modes: dbDelivery.length ? dbDelivery : delivery,
    learning_styles: dbStyles.length ? dbStyles : styles,
    _description_raw: course.description,
  };
}

export async function fetchPublishedCourses({ vendorId, category, search } = {}) {
  let q = supabase
    .from('vendor_courses')
    .select('*, vendors(id, name, logo, city, state, region, zip, latitude, longitude, street_address)')
    .eq('published', true)
    .eq('approved', 1)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (vendorId) q = q.eq('vendor_id', vendorId);
  if (category) q = q.eq('category', category);
  const { data, error } = await q;
  // Fallback if optional vendor location columns are missing on older DBs
  if (error && /column|does not exist|42703/i.test(error.message || '')) {
    const retry = await supabase
      .from('vendor_courses')
      .select('*, vendors(id, name, logo)')
      .eq('published', true)
      .eq('approved', 1)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
    if (retry.error) throw retry.error;
    let rows = retry.data || [];
    if (vendorId) rows = rows.filter((c) => Number(c.vendor_id) === Number(vendorId));
    if (category) rows = rows.filter((c) => c.category === category);
    if (search?.trim()) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.title?.toLowerCase().includes(s) ||
          c.description?.toLowerCase().includes(s) ||
          c.vendors?.name?.toLowerCase().includes(s),
      );
    }
    return rows.map(enrichCourseWithTeachMeta);
  }
  if (error) throw error;
  let rows = data || [];
  if (search?.trim()) {
    const s = search.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.title?.toLowerCase().includes(s) ||
        c.description?.toLowerCase().includes(s) ||
        c.vendors?.name?.toLowerCase().includes(s) ||
        c.vendors?.city?.toLowerCase().includes(s) ||
        c.vendors?.state?.toLowerCase().includes(s) ||
        c.vendors?.region?.toLowerCase().includes(s),
    );
  }
  return rows.map(enrichCourseWithTeachMeta);
}

export async function fetchVendorCourses(vendorId) {
  const { data, error } = await supabase
    .from('vendor_courses')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(enrichCourseWithTeachMeta);
}

export async function fetchCourseById(id) {
  const { data, error } = await supabase.from('vendor_courses').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return enrichCourseWithTeachMeta(data);
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
  const { delivery_modes, learning_styles, _description_raw, ...rest } = course;
  const vendorId = Number(course.vendor_id);
  if (!Number.isFinite(vendorId) || vendorId <= 0) {
    throw new Error('vendor_id is required to save a course.');
  }

  // Ownership: never allow rewriting another practice’s course
  if (course.id) {
    const { data: existingRow, error: ownErr } = await supabase
      .from('vendor_courses')
      .select('id, vendor_id')
      .eq('id', course.id)
      .maybeSingle();
    if (ownErr) throw new Error(ownErr.message);
    if (!existingRow) throw new Error('Course not found.');
    if (Number(existingRow.vendor_id) !== vendorId) {
      throw new Error('You can only edit courses for your own practice.');
    }
  }

  const payload = { ...rest, vendor_id: vendorId, updated_at: new Date().toISOString() };

  if (delivery_modes !== undefined || learning_styles !== undefined) {
    const existing = course.id ? await fetchCourseById(course.id) : null;
    const body = rest.description !== undefined
      ? parseHaTeachMetadata(rest.description).body
      : (existing?.description ?? '');
    const delivery = delivery_modes ?? existing?.delivery_modes ?? [];
    const styles = learning_styles ?? existing?.learning_styles ?? [];
    payload.delivery_modes = delivery;
    payload.learning_styles = styles;
    payload.one_on_one_enabled = delivery.includes('one_on_one');
    payload.description = embedHaTeachInDescription(body, { delivery, styles });
  } else if (rest.description !== undefined) {
    payload.description = parseHaTeachMetadata(rest.description).body;
  }

  if (course.preview_video_url) {
    const p = parseVideoUrl(course.preview_video_url);
    payload.preview_video_provider = p?.provider || null;
  }

  // Self-serve publish: go live when practitioner marks published
  if (payload.published === true || payload.published === 1) {
    payload.approved = 1;
  }

  if (course.id) {
    const { data, error } = await supabase
      .from('vendor_courses')
      .update(payload)
      .eq('id', course.id)
      .eq('vendor_id', vendorId)
      .select()
      .single();
    if (error) throw error;
    return enrichCourseWithTeachMeta(data);
  }
  const insertPayload = {
    ...payload,
    approved: payload.published ? 1 : (payload.approved ?? 0),
  };
  const { data, error } = await supabase.from('vendor_courses').insert(insertPayload).select().single();
  if (error) throw error;
  return enrichCourseWithTeachMeta(data);
}

export async function saveLesson(lesson) {
  const payload = { ...lesson };
  if (lesson.video_url) {
    const p = parseVideoUrl(lesson.video_url);
    payload.video_provider = p?.provider || null;
  }

  // Ensure lesson belongs to a course we can write
  if (lesson.course_id) {
    const { data: course } = await supabase
      .from('vendor_courses')
      .select('id, vendor_id')
      .eq('id', lesson.course_id)
      .maybeSingle();
    if (!course) throw new Error('Course not found for this lesson.');
  }

  if (lesson.id) {
    const { data, error } = await supabase
      .from('vendor_course_lessons')
      .update(payload)
      .eq('id', lesson.id)
      .select()
      .single();
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

/** Delete a course (owner-only via RLS). */
export async function deleteCourse(courseId, vendorId) {
  const vid = Number(vendorId);
  const cid = Number(courseId);
  if (!cid || !vid) throw new Error('courseId and vendorId required');
  const { error } = await supabase
    .from('vendor_courses')
    .delete()
    .eq('id', cid)
    .eq('vendor_id', vid);
  if (error) throw error;
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
    .select('id, payment_status')
    .eq('course_id', courseId)
    .ilike('user_email', email.trim())
    .maybeSingle();
  if (!data) return false;
  const status = String(data.payment_status || 'free').toLowerCase();
  // Pending unpaid checkout must not unlock lessons
  return status === 'paid' || status === 'free' || status === '';
}

/** Pending Stripe enrollment (awaiting payment). */
export async function getEnrollmentStatus(courseId, email) {
  if (!email) return null;
  const { data } = await supabase
    .from('vendor_course_enrollments')
    .select('id, payment_status, stripe_checkout_session_id, amount_paid')
    .eq('course_id', courseId)
    .ilike('user_email', email.trim())
    .maybeSingle();
  return data || null;
}

export const COURSE_CATEGORIES = [
  { id: 'herbalism', label: 'Herbalism & apothecary' },
  { id: 'spiritual', label: 'Spiritual practice' },
  { id: 'energy', label: 'Energy & Reiki' },
  { id: 'tarot', label: 'Tarot & divination' },
  { id: 'wellness', label: 'Wellness & self-care' },
  { id: 'ritual', label: 'Ritual & ceremony' },
  { id: 'business', label: 'Practitioner business' },
  { id: 'other', label: 'Other' },
];