import { supabase } from './supabaseClient';
import { parseAllergenIds, serializeAllergenIds } from './allergens';

export const DIET_OPTIONS = [
  { id: 'none', label: 'No specific diet' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'gluten_free', label: 'Gluten-free' },
  { id: 'dairy_free', label: 'Dairy-free' },
  { id: 'keto', label: 'Keto / low-carb' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
  { id: 'low_sodium', label: 'Low sodium' },
  { id: 'other', label: 'Other (describe in notes)' },
];

export const EMPTY_FOOD_PREFS = {
  diet_type: 'none',
  disliked_foods: '',
  disliked_herbs: '',
  liked_foods: '',
  food_prefs_notes: '',
  allergen_avoid: [],
  customer_region: 'US',
};

export function parseCommaList(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export function serializeCommaList(arr) {
  if (!Array.isArray(arr)) return '';
  return arr.map((s) => String(s).trim()).filter(Boolean).join(', ');
}

export async function fetchFoodPreferences(email) {
  if (!email) return { ...EMPTY_FOOD_PREFS };
  const { data } = await supabase
    .from('users')
    .select('diet_type, disliked_foods, disliked_herbs, liked_foods, food_prefs_notes, allergen_avoid, food_prefs_completed_at, customer_region, easy_mode_enabled')
    .ilike('email', email.trim())
    .maybeSingle();

  if (!data) return { ...EMPTY_FOOD_PREFS };

  return {
    diet_type: data.diet_type || 'none',
    disliked_foods: data.disliked_foods || '',
    disliked_herbs: data.disliked_herbs || '',
    liked_foods: data.liked_foods || '',
    food_prefs_notes: data.food_prefs_notes || '',
    allergen_avoid: parseAllergenIds(data.allergen_avoid),
    food_prefs_completed_at: data.food_prefs_completed_at,
    customer_region: data.customer_region || 'US',
    easy_mode_enabled: !!data.easy_mode_enabled,
  };
}

export async function saveFoodPreferences(email, prefs, { markComplete = true } = {}) {
  const payload = {
    diet_type: prefs.diet_type || 'none',
    disliked_foods: (prefs.disliked_foods || '').trim(),
    disliked_herbs: (prefs.disliked_herbs || '').trim(),
    liked_foods: (prefs.liked_foods || '').trim(),
    food_prefs_notes: (prefs.food_prefs_notes || '').trim(),
    allergen_avoid: serializeAllergenIds(prefs.allergen_avoid || []),
    customer_region: prefs.customer_region || 'US',
  };
  if (markComplete) payload.food_prefs_completed_at = new Date().toISOString();

  const { error } = await supabase
    .from('users')
    .update(payload)
    .ilike('email', email.trim());

  if (error) throw new Error(error.message);
  return payload;
}

export async function fetchVendorPreferenceInsights(vendorId) {
  const { data, error } = await supabase.rpc('vendor_customer_preference_insights', {
    p_vendor_id: Number(vendorId),
  });
  if (error) throw new Error(error.message);
  return data || {};
}

export async function userHasApprovedModificationOrder(userId, vendorId) {
  if (!userId || !vendorId) return false;
  const { data } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', userId)
    .eq('vendor_id', vendorId)
    .eq('modification_status', 'approved')
    .eq('rating_restricted', true)
    .limit(1);
  return (data || []).length > 0;
}