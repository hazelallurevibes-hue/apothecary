/**
 * Teaching Sanctum — college-style extras (Hazel Allure ceremonial campus).
 */
import { supabase } from './supabaseClient';

// ── Learning tracks ─────────────────────────────────────────────────────────
export async function fetchLearningTracks() {
  const { data, error } = await supabase
    .from('sanctum_learning_tracks')
    .select('*')
    .eq('published', true)
    .order('sort_order');
  if (error) {
    if (error.code === '42P01') return DEFAULT_TRACKS;
    throw new Error(error.message);
  }
  return data?.length ? data : DEFAULT_TRACKS;
}

export const DEFAULT_TRACKS = [
  {
    slug: 'herbal-foundations',
    title: 'Herbal Foundations Path',
    description: 'Garden-to-apothecary literacy with safety-first framing.',
    icon: '🌿',
  },
  {
    slug: 'tarot-ritual-arts',
    title: 'Tarot & Ritual Arts Path',
    description: 'Ethical divination craft and ritual design for guides.',
    icon: '🃏',
  },
  {
    slug: 'energy-bodywork',
    title: 'Energy & Body Wisdom Path',
    description: 'Breath, stillness, and energetic hygiene (non-medical).',
    icon: '✨',
  },
  {
    slug: 'practitioner-business',
    title: 'Practitioner Business Path',
    description: 'Boundaries, storefront craft, and client care ethics.',
    icon: '📜',
  },
  {
    slug: 'sanctum-scholar',
    title: 'Sanctum Scholar Path',
    description: 'Cross-track honors for deep completion and contribution.',
    icon: '👑',
  },
];

// ── Announcements ───────────────────────────────────────────────────────────
export async function fetchAnnouncements({ courseId, limit = 20 } = {}) {
  let q = supabase
    .from('sanctum_announcements')
    .select('*')
    .eq('published', true)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (courseId) q = q.eq('course_id', courseId);
  const { data, error } = await q;
  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export async function postAnnouncement({ vendorId, courseId, title, body, pinned = false }) {
  const { data, error } = await supabase
    .from('sanctum_announcements')
    .insert({
      vendor_id: vendorId,
      course_id: courseId || null,
      title,
      body,
      pinned,
      published: true,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Course discussion board ─────────────────────────────────────────────────
export async function fetchCourseDiscussion(courseId) {
  const { data, error } = await supabase
    .from('course_discussion_posts')
    .select('*')
    .eq('course_id', courseId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(100);
  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export async function postCourseDiscussion({ courseId, email, name, body, parentId = null }) {
  const { data, error } = await supabase
    .from('course_discussion_posts')
    .insert({
      course_id: courseId,
      user_email: email.trim().toLowerCase(),
      user_name: name || null,
      body: body.trim(),
      parent_id: parentId,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/** Ceremonial “degree” progress for display only */
export function ceremonialProgress({ enrollments = 0, honors = 0, lessonsComplete = 0 }) {
  const points = enrollments * 10 + honors * 25 + lessonsComplete * 2;
  let rank = 'Seeker Novice';
  if (points >= 20) rank = 'Apprentice of the Hearth';
  if (points >= 50) rank = 'Sanctum Adept';
  if (points >= 100) rank = 'Circle Keeper';
  if (points >= 200) rank = 'Sanctum Scholar';
  return { points, rank, nextHint: points < 200 ? 'Keep completing lessons & honors' : 'You walk among the scholars' };
}
