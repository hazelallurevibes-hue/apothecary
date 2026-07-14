import { buildCelestialProfile, profileBlurb } from './celestial';
import { supabaseAuth, isAuthConfigured } from './supabaseAuth';

const LOCAL_KEY = 'magic_celestial_profile_v1';

export function loadLocalProfile() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null');
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(profile));
  return profile;
}

export function setDobAndBuild({ dob, name, birthTime } = {}) {
  const celestial = buildCelestialProfile(dob, name);
  if (!celestial) throw new Error('Enter a valid date of birth (YYYY-MM-DD).');
  if (birthTime) celestial.birthTime = birthTime;
  celestial.blurb = profileBlurb(celestial);
  return saveLocalProfile(celestial);
}

/** Best-effort sync to public.users (columns may need SQL migration) */
export async function syncProfileToSupabase(email, celestial, avatarUrl) {
  if (!isAuthConfigured() || !email) return { ok: false, reason: 'no-auth' };
  const patch = {
    // standard columns if present
  };
  // Store JSON in a flexible way: try dedicated columns, ignore errors
  const attempts = [
    {
      date_of_birth: celestial?.dob || null,
      western_sign: celestial?.western?.sign || null,
      chinese_animal: celestial?.chinese?.animal || null,
      chinese_element: celestial?.chinese?.element || null,
      life_path_number: celestial?.lifePath || null,
      celestial_profile: celestial || null,
    },
    {
      date_of_birth: celestial?.dob || null,
    },
  ];
  if (avatarUrl) {
    attempts.forEach((a) => {
      a.avatar = avatarUrl;
    });
  }

  for (const body of attempts) {
    const { error } = await supabaseAuth.from('users').update(body).ilike('email', email);
    if (!error) return { ok: true };
    // try next narrower patch
  }
  return { ok: false, reason: 'columns-missing' };
}

export async function uploadAvatar(file, authId) {
  if (!isAuthConfigured() || !authId || !file) throw new Error('Sign in to upload avatar');
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `magic/${authId}/avatar.${ext}`;
  // try wte-avatars or avatars bucket; fall back to public URL data
  const buckets = ['wte-avatars', 'avatars', 'profiles'];
  for (const bucket of buckets) {
    const { error } = await supabaseAuth.storage.from(bucket).upload(path, file, {
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });
    if (!error) {
      const { data } = supabaseAuth.storage.from(bucket).getPublicUrl(path);
      return `${data.publicUrl}?t=${Date.now()}`;
    }
  }
  // data URL fallback (local only)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
