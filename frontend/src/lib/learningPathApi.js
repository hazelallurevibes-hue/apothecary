import { supabase } from './supabaseClient';
import { fetchPublishedCourses, enrichCourseWithTeachMeta } from './teachingPlatform';
import { LEARNING_STYLES } from './teachingStudio';

/** Map wellness lifestyle choices to likely learning style affinities */
const LIFESTYLE_TO_STYLES = {
  vegan: ['kinesthetic', 'reading_writing'],
  plant_based: ['visual', 'kinesthetic'],
  organic_only: ['visual', 'solitary'],
  fragrance_free: ['auditory', 'solitary'],
  auditory: ['auditory'],
};

export async function fetchUserLearningProfile(email) {
  if (!email) return { styles: [], source: 'default' };
  const { data } = await supabase
    .from('users')
    .select('preferred_learning_styles, diet_type, food_prefs_notes')
    .ilike('email', email.trim())
    .maybeSingle();

  if (!data) return { styles: [], source: 'default' };

  let styles = Array.isArray(data.preferred_learning_styles)
    ? data.preferred_learning_styles
    : [];

  if (!styles.length && data.diet_type && LIFESTYLE_TO_STYLES[data.diet_type]) {
    styles = LIFESTYLE_TO_STYLES[data.diet_type];
  }

  return { styles, source: styles.length ? 'profile' : 'default', notes: data.food_prefs_notes };
}

export async function savePreferredLearningStyles(email, styles) {
  const { error } = await supabase
    .from('users')
    .update({ preferred_learning_styles: styles })
    .ilike('email', email.trim());

  if (error) throw new Error(error.message);
}

export function scoreCourseForLearner(course, preferredStyles) {
  if (!preferredStyles?.length) return 0;
  const courseStyles = course.learning_styles || [];
  const delivery = course.delivery_modes || [];
  let score = 0;

  for (const s of preferredStyles) {
    if (courseStyles.includes(s)) score += 3;
  }

  if (preferredStyles.includes('visual') && delivery.includes('async_video')) score += 1;
  if (preferredStyles.includes('auditory') && (delivery.includes('audio_only') || delivery.includes('live_stream'))) score += 1;
  if (preferredStyles.includes('kinesthetic') && delivery.includes('in_person_workshop')) score += 2;
  if (preferredStyles.includes('social') && (delivery.includes('group_cohort') || delivery.includes('live_stream'))) score += 2;
  if (preferredStyles.includes('solitary') && delivery.includes('async_video')) score += 1;
  if (preferredStyles.includes('reading_writing') && delivery.includes('downloadable_workbook')) score += 2;

  if (course.featured) score += 1;
  return score;
}

export async function recommendCoursesForUser(email, { limit = 6 } = {}) {
  const profile = await fetchUserLearningProfile(email);
  const courses = (await fetchPublishedCourses({})).map(enrichCourseWithTeachMeta);

  if (!profile.styles.length) {
    return {
      courses: courses.slice(0, limit),
      profile,
      reason: 'popular',
    };
  }

  const ranked = courses
    .map((c) => ({ course: c, score: scoreCourseForLearner(c, profile.styles) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked.filter((r) => r.score > 0).slice(0, limit);
  const picks = top.length >= 3
    ? top.map((r) => r.course)
    : [...top.map((r) => r.course), ...courses.filter((c) => !top.find((t) => t.course.id === c.id))].slice(0, limit);

  return {
    courses: picks,
    profile,
    reason: 'learning_style_match',
    styleLabels: profile.styles.map((id) => LEARNING_STYLES.find((s) => s.id === id)?.label || id),
  };
}