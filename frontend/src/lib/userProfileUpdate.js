import { supabase } from './supabaseClient';

const DELIVERY_COLUMN_RE = /doordash_linked|ubereats_linked/i;

/** Build users-row patch for Account Settings save. */
export function buildProfileSavePatch({
  name,
  avatar,
  allergen_avoid,
  doordash_linked,
  ubereats_linked,
}) {
  return {
    name,
    avatar,
    allergen_avoid,
    doordash_linked,
    ubereats_linked,
  };
}

/**
 * Update users row; retries without delivery-link columns when migration not applied yet.
 */
export async function updateUserProfile(email, patch) {
  const trimmed = email.trim();
  let { error } = await supabase.from('users').update(patch).ilike('email', trimmed);

  if (
    error
    && DELIVERY_COLUMN_RE.test(error.message)
    && ('doordash_linked' in patch || 'ubereats_linked' in patch)
  ) {
    const { doordash_linked: _d, ubereats_linked: _u, ...core } = patch;
    ({ error } = await supabase.from('users').update(core).ilike('email', trimmed));
  }

  return { error };
}