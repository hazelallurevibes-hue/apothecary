import { parseAllergenIds, serializeAllergenIds } from './allergens';
import { parseFoodLabelFromItem } from './foodLabels';
import { stripBpiciusListingFields } from './foodSafety';
import { parseItemOptions, normalizeOptionsForSave } from './itemOptions';
import { DEFAULT_LISTING_PHOTO, resolveListingPhoto } from './listingPhotos';
import { buildFreshnessPayload, buildPreorderPayload } from './shelfLifePresets';
import { legacyFulfillmentModeForDb, isFulfillmentConstraintError, normalizeFulfillmentMode } from './internationalStorefront';
import { parseGalleryPhotos } from './videoEmbed';
import { compressImage } from './imageCompress';
import { uploadListingThumbnail } from './storageApi';
import { supabase } from './supabaseClient';

export const EMPTY_THUMBNAIL = { url: '', file: null, preview: '' };

export function thumbnailFromItem(item) {
  const url = item?.photo || '';
  return { url, file: null, preview: resolveListingPhoto(url) };
}

export function menuItemToFormState(item) {
  if (!item) return null;
  return {
    item: {
      name: item.name || '',
      price: item.price != null ? String(item.price) : '',
      description: item.description || '',
      category: item.category || 'Other',
      time_made: item.time_made || '15 min',
      fulfillment_mode: item.fulfillment_mode || 'pickup_and_shipping',
    },
    media: {
      videoUrl: item.service_video_url || '',
      mediaType: item.media_type || 'photo',
      galleryPhotos: parseGalleryPhotos(item.gallery_photos),
    },
    allergens: parseAllergenIds(item.allergens),
    safety: {
      finish_temp_f: item.finish_temp_f != null ? String(item.finish_temp_f) : '',
      safety_opt_out: !!item.safety_opt_out,
      food_category: item.food_category || 'general',
      safety_practices_certified: !!item.safety_practices_certified,
      temp_photo_url: item.temp_photo_url || '',
    },
    preorder: {
      is_preorder: !!item.is_preorder,
      preorder_available_date: item.preorder_available_date || '',
      preorder_max_qty: item.preorder_max_qty != null ? String(item.preorder_max_qty) : '',
    },
    foodLabel: parseFoodLabelFromItem(item),
    options: parseItemOptions(item.item_options),
    thumbnail: thumbnailFromItem(item),
  };
}

export function produceItemToFormState(item) {
  if (!item) return null;
  const section = item.listing_section || 'produce';
  return {
    section,
    item: {
      name: item.name || '',
      price: item.price != null ? String(item.price) : '',
      unit: item.unit || (section === 'plants_trees' ? 'each' : 'lb'),
      description: item.description || '',
      farm_story: item.farm_story || item.description || '',
      organic: Number(item.organic) || 0,
      category: item.category || (section === 'plants_trees' ? 'Plants' : 'Produce'),
      fulfillment_mode: item.fulfillment_mode || 'pickup_and_shipping',
    },
    media: {
      videoUrl: item.service_video_url || '',
      mediaType: item.media_type || 'photo',
      galleryPhotos: parseGalleryPhotos(item.gallery_photos),
    },
    allergens: parseAllergenIds(item.allergens),
    safety: {
      finish_temp_f: item.finish_temp_f != null ? String(item.finish_temp_f) : '',
      safety_opt_out: !!item.safety_opt_out,
      food_category: item.food_category || 'raw_fresh',
      safety_practices_certified: !!item.safety_practices_certified,
      temp_photo_url: item.temp_photo_url || '',
    },
    freshness: {
      harvest_date: item.harvest_date || '',
      good_by_date: item.good_by_date || '',
      storage_method: item.storage_method || 'refrigerator',
      storage_notes: item.storage_notes || '',
      shelf_life_preset: item.shelf_life_preset || '',
      listing_section: section,
    },
    preorder: {
      is_preorder: !!item.is_preorder,
      preorder_available_date: item.preorder_available_date || '',
      preorder_max_qty: item.preorder_max_qty != null ? String(item.preorder_max_qty) : '',
    },
    options: parseItemOptions(item.item_options),
    thumbnail: thumbnailFromItem(item),
  };
}

export async function resolveListingPhotoUrl(thumbnail, user, vendorId, kind) {
  if (thumbnail?.file) {
    const compressed = thumbnail.file.size ? thumbnail.file : await compressImage(thumbnail.file);
    return uploadListingThumbnail(compressed, user, vendorId, kind);
  }
  const existing = (thumbnail?.url || '').trim();
  return existing || DEFAULT_LISTING_PHOTO;
}

export function buildProduceItemPayload({
  vendorId,
  produce,
  section = 'produce',
  allergens = [],
  freshness = {},
  preorder = {},
  options = [],
  photo,
}) {
  const description = (produce.description || produce.farm_story || '').trim();
  return {
    vendor_id: vendorId,
    name: produce.name?.trim(),
    price: parseFloat(produce.price),
    unit: produce.unit || 'each',
    description,
    farm_story: (produce.farm_story || description).trim(),
    organic: Number(produce.organic) || 0,
    category: section === 'plants_trees' ? (produce.category || 'Plants') : produce.category,
    photo,
    approved: 1,
    allergens: serializeAllergenIds(allergens),
    ...buildFreshnessPayload({ ...freshness, listing_section: section }),
    ...buildPreorderPayload(preorder),
    item_options: normalizeOptionsForSave(options),
    last_activity_at: new Date().toISOString(),
    fulfillment_mode: normalizeFulfillmentMode(produce.fulfillment_mode),
  };
}

function isRlsError(error) {
  const msg = (error?.message || String(error)).toLowerCase();
  return msg.includes('row-level security') || msg.includes('rls') || error?.code === '42501';
}

export async function hasSupabaseWriteSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session?.access_token;
}

export function formatListingSaveError(error, fallback = 'Could not save listing.') {
  if (!error) return fallback;
  const msg = error.message || String(error);
  const lower = msg.toLowerCase();
  if (isFulfillmentConstraintError(error)) {
    return 'Fulfillment mode was rejected by the database. Run supabase/hazel-sql-to-run/28_fix_fulfillment_constraints.sql (or 27_fulfillment_pickup_shipping.sql), then try Pickup or shipping again.';
  }
  if (lower.includes('column') && lower.includes('available')) {
    return 'Listing schema mismatch (available vs availability) — refresh the app and try again. If it persists, redeploy the latest apothecary build.';
  }
  if (isRlsError(error)) {
    return 'Permission denied — sign in again with email/password or Google, confirm your account is linked to a vendor, or run FIX_VENDOR_LISTING_INSERT.sql in Supabase.';
  }
  if (lower.includes('not authorized to manage listings')) {
    return 'Your account is not linked to a practitioner profile. Sign out, sign back in, or contact support.';
  }
  if (lower.includes('function') && lower.includes('insert_vendor')) {
    return 'Publish RPC missing — run FIX_VENDOR_LISTING_INSERT.sql in the Supabase SQL editor, then retry.';
  }
  return msg.length > 180 ? `${msg.slice(0, 180)}…` : msg;
}

async function saveProduceViaRpc(payload, { editId = null, userEmail = null } = {}) {
  const email = userEmail?.trim().toLowerCase();
  if (!email) return { data: null, error: { message: 'Sign in required to publish listings.' } };

  const row = stripBpiciusListingFields(payload);
  const rpcName = editId ? 'update_vendor_produce_listing' : 'insert_vendor_produce_listing';
  const args = editId
    ? { p_email: email, p_edit_id: editId, p_payload: row }
    : { p_email: email, p_payload: row };

  const { data, error } = await supabase.rpc(rpcName, args);
  if (error) return { data: null, error };
  return { data, error: null };
}

async function saveMenuViaRpc(payload, { editId = null, userEmail = null } = {}) {
  const email = userEmail?.trim().toLowerCase();
  if (!email) return { data: null, error: { message: 'Sign in required to publish listings.' } };

  const row = stripBpiciusListingFields(payload);
  const rpcName = editId ? 'update_vendor_menu_listing' : 'insert_vendor_menu_listing';
  const args = editId
    ? { p_email: email, p_edit_id: editId, p_payload: row }
    : { p_email: email, p_payload: row };

  const { data, error } = await supabase.rpc(rpcName, args);
  if (error) return { data: null, error };
  return { data, error: null };
}

export async function saveMenuItemRecord(payload, { editId = null, userEmail = null, preferRpc = false } = {}) {
  const attemptDirect = async (body) => {
    const row = stripBpiciusListingFields(body);
    if (editId) {
      return supabase.from('menu_items').update(row).eq('id', editId).select().single();
    }
    return supabase.from('menu_items').insert(row).select().single();
  };

  // Prefer RPC when no real Supabase session (e.g. Auth0 hybrid) or caller asked for it
  if (preferRpc || !(await hasSupabaseWriteSession())) {
    const rpcResult = await saveMenuViaRpc(payload, { editId, userEmail });
    if (!rpcResult.error) return rpcResult;
    // continue to direct + retries so users still get a clear error path
  }

  let { data, error } = await attemptDirect(payload);
  if (!error) return { data, error: null };

  // Unknown-column errors (e.g. legacy "available") — strip and retry once
  const msg = String(error?.message || '').toLowerCase();
  if (msg.includes('column') && (msg.includes('available') || msg.includes('does not exist'))) {
    const cleaned = stripBpiciusListingFields({ ...payload, availability: payload.availability || 'In stock' });
    delete cleaned.available;
    const retry = await attemptDirect(cleaned);
    if (!retry.error) return retry;
    error = retry.error;
  }

  if (isFulfillmentConstraintError(error)) {
    const legacyPayload = {
      ...payload,
      fulfillment_mode: legacyFulfillmentModeForDb(payload.fulfillment_mode),
      availability: payload.availability || 'In stock',
    };
    delete legacyPayload.available;
    const retry = await attemptDirect(legacyPayload);
    if (!retry.error) return retry;
    error = retry.error;
  }

  if (userEmail && (isRlsError(error) || isFulfillmentConstraintError(error) || msg.includes('column'))) {
    const rpcPayload = {
      ...payload,
      availability: payload.availability || 'In stock',
      fulfillment_mode: isFulfillmentConstraintError(error)
        ? legacyFulfillmentModeForDb(payload.fulfillment_mode)
        : payload.fulfillment_mode,
    };
    delete rpcPayload.available;
    const rpcResult = await saveMenuViaRpc(rpcPayload, { editId, userEmail });
    if (!rpcResult.error) return rpcResult;
    return { data: null, error: rpcResult.error || error };
  }

  return { data: null, error };
}

export async function saveProduceItemRecord(payload, { editId = null, userEmail = null, preferRpc = false } = {}) {
  const attemptDirect = async (body) => {
    const row = stripBpiciusListingFields(body);
    if (editId) {
      return supabase.from('produce_items').update(row).eq('id', editId).select().single();
    }
    return supabase.from('produce_items').insert(row).select().single();
  };

  if (preferRpc || !(await hasSupabaseWriteSession())) {
    const rpcResult = await saveProduceViaRpc(payload, { editId, userEmail });
    if (!rpcResult.error) return rpcResult;
  }

  let { data, error } = await attemptDirect(payload);
  if (!error) return { data, error: null };

  if (isFulfillmentConstraintError(error)) {
    const legacyPayload = {
      ...payload,
      fulfillment_mode: legacyFulfillmentModeForDb(payload.fulfillment_mode),
    };
    const retry = await attemptDirect(legacyPayload);
    if (!retry.error) return retry;
    error = retry.error;
  }

  if (isRlsError(error) && userEmail) {
    const rpcPayload = isFulfillmentConstraintError(error)
      ? { ...payload, fulfillment_mode: legacyFulfillmentModeForDb(payload.fulfillment_mode) }
      : payload;
    const rpcResult = await saveProduceViaRpc(rpcPayload, { editId, userEmail });
    if (!rpcResult.error) return rpcResult;
  }

  return { data: null, error };
}