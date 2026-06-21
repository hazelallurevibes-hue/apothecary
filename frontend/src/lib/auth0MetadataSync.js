import { serializeAllergenIds } from './allergens';

/** Persist allergen profile to local user blob (Auth0 SPA cannot write metadata without Management API). */
export function syncAllergenToLocalUser(allergenIds) {
  try {
    const raw = localStorage.getItem('Hazel Allure_user');
    if (!raw) return;
    const user = JSON.parse(raw);
    user.allergen_avoid = serializeAllergenIds(allergenIds);
    localStorage.setItem('Hazel Allure_user', JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

/** Optional edge function sync when Management API secrets are configured. */
export async function syncAllergenToAuth0({ email, allergenIds }) {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base || !email) return { synced: false };
  try {
    const res = await fetch(`${base}/functions/v1/sync-auth0-metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email,
        allergen_avoid: serializeAllergenIds(allergenIds),
      }),
    });
    const json = await res.json().catch(() => ({}));
    return { synced: !!json.synced, reason: json.reason };
  } catch {
    return { synced: false, reason: 'edge_unavailable' };
  }
}

export function mergeAuth0AllergenMetadata(auth0User, profile) {
  const meta = auth0User?.['https://Hazel Allure.com/allergen_avoid']
    || auth0User?.user_metadata?.allergen_avoid
    || auth0User?.app_metadata?.allergen_avoid;
  if (!meta) return profile;
  return { ...profile, allergen_avoid: meta };
}