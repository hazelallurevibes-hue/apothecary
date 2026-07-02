/**
 * Secret achievement engine — unlocks are discovered through play, not listed.
 * Persists to user_achievements when the table exists; localStorage fallback.
 */
import { supabase } from './supabaseClient';

const STORAGE_KEY = 'hazel_achievement_unlocks';

const DEFINITIONS = {
  first_light: { icon: '✨', rarity: 'common' },
  moonlit_scroll: { icon: '🌙', rarity: 'uncommon' },
  apothecary_whisper: { icon: '🌿', rarity: 'uncommon' },
  sanctum_threshold: { icon: '📜', rarity: 'rare' },
  gathering_voice: { icon: '🕯️', rarity: 'uncommon' },
  practitioner_path: { icon: '🪷', rarity: 'rare' },
  generous_spirit: { icon: '💫', rarity: 'rare' },
  quiet_guardian: { icon: '🐾', rarity: 'legendary' },
  seven_sisters: { icon: '⭐', rarity: 'epic' },
  hearth_keeper: { icon: '🔥', rarity: 'uncommon' },
  midnight_bloom: { icon: '🌸', rarity: 'legendary' },
  cartographer: { icon: '🗺️', rarity: 'rare' },
  loyal_seeker: { icon: '🦋', rarity: 'epic' },
  ritual_dawn: { icon: '🌅', rarity: 'uncommon' },
  velvet_paw: { icon: '🐈‍⬛', rarity: 'legendary' },
};

function readLocal(email) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return new Set(all[email] || []);
  } catch {
    return new Set();
  }
}

function writeLocal(email, ids) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[email] = [...ids];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export async function fetchUnlockedAchievements(email) {
  if (!email) return [];
  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_email', email.trim().toLowerCase());
  if (!error && data) {
    return data.map((r) => r.achievement_id);
  }
  return [...readLocal(email)];
}

export async function unlockAchievement(email, achievementId) {
  if (!email || !DEFINITIONS[achievementId]) return null;

  const normalized = email.trim().toLowerCase();
  const local = readLocal(normalized);
  if (local.has(achievementId)) return null;

  const { error } = await supabase.from('user_achievements').upsert(
    { user_email: normalized, achievement_id: achievementId },
    { onConflict: 'user_email,achievement_id', ignoreDuplicates: true },
  );

  if (error) {
    local.add(achievementId);
    writeLocal(normalized, local);
  }

  const def = DEFINITIONS[achievementId];
  return { id: achievementId, ...def };
}

export function getAchievementMeta(id) {
  return DEFINITIONS[id] || null;
}

/** Event hooks — call from UI after meaningful actions */
export async function trackAchievementEvent(email, event, meta = {}) {
  if (!email) return null;

  const map = {
    first_login: 'first_light',
    visited_sanctum: 'sanctum_threshold',
    first_community_post: 'gathering_voice',
    first_course_enroll: 'sanctum_threshold',
    first_review: 'generous_spirit',
    first_favorite: 'hearth_keeper',
    profile_customized: 'ritual_dawn',
    completed_lesson: meta.lessonCount >= 3 ? 'seven_sisters' : null,
    vendor_first_course: 'practitioner_path',
    vendor_first_certificate: 'apothecary_whisper',
    issued_student_badge: 'loyal_seeker',
    found_hidden_cat: 'velvet_paw',
    explored_at_night: 'moonlit_scroll',
    visited_five_pages: 'cartographer',
    easy_mode_enabled: 'quiet_guardian',
    first_order: 'midnight_bloom',
  };

  let id = map[event];
  if (event === 'completed_lesson' && !id) id = 'hearth_keeper';
  if (!id) return null;
  return unlockAchievement(email, id);
}

export const ACHIEVEMENT_FRAME_UNLOCK_COUNT = 5;