import { supabase } from './supabaseClient';
import { uploadProfileBanner as uploadBannerToStorage } from './storageApi';
import { getEffectiveCustomerPlan, isProPlan } from './plans';

export const SCRYING_FRAME_UNLOCK_CARDS = 39;

export const PROFILE_FRAMES = {
  none: { label: 'None', ring: '' },
  plum: { label: 'Plum vine', ring: 'ring-2 ring-[#4a1942]/60 ring-offset-2' },
  gold: { label: 'Soft gold', ring: 'ring-2 ring-amber-400/70 ring-offset-2' },
  moon: { label: 'Moonlit', ring: 'ring-2 ring-indigo-300/60 ring-offset-2' },
  blossom: { label: 'Blossom', ring: 'ring-2 ring-rose-300/60 ring-offset-2' },
  scrying: {
    label: 'Scrying mirror',
    ring: 'ring-2 ring-indigo-400/80 ring-offset-2 shadow-[0_0_14px_rgba(99,102,241,0.35)]',
    unlockCards: SCRYING_FRAME_UNLOCK_CARDS,
  },
};

export async function fetchProfileCustomization(email) {
  const { data, error } = await supabase
    .from('users')
    .select('profile_bio, profile_accent_color, profile_banner_url, profile_frame, pinned_student_badge_id, showcase_achievements, avatar, name, customer_plan, chosen_familiar')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function saveProfileCustomization(email, patch) {
  const allowed = {};
  if (patch.profile_bio !== undefined) allowed.profile_bio = patch.profile_bio?.slice(0, 500) || null;
  if (patch.profile_accent_color !== undefined) allowed.profile_accent_color = patch.profile_accent_color;
  if (patch.profile_banner_url !== undefined) allowed.profile_banner_url = patch.profile_banner_url;
  if (patch.profile_frame !== undefined) allowed.profile_frame = patch.profile_frame;
  if (patch.pinned_student_badge_id !== undefined) allowed.pinned_student_badge_id = patch.pinned_student_badge_id;
  if (patch.showcase_achievements !== undefined) allowed.showcase_achievements = patch.showcase_achievements;
  if (patch.avatar !== undefined) allowed.avatar = patch.avatar;
  if (patch.name !== undefined) allowed.name = patch.name;

  const { data, error } = await supabase
    .from('users')
    .update(allowed)
    .eq('email', email.trim().toLowerCase())
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function uploadProfileBanner(file, user) {
  return uploadBannerToStorage(file, user);
}

export function canUseProProfileFeatures(user) {
  if ((user?.role || '').toLowerCase() === 'admin') return true;
  return isProPlan(getEffectiveCustomerPlan(user));
}

export function frameClass(frameKey) {
  return PROFILE_FRAMES[frameKey]?.ring || PROFILE_FRAMES.none.ring;
}