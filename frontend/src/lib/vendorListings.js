import { parseAllergenIds, serializeAllergenIds } from './allergens';
import { parseFoodLabelFromItem } from './foodLabels';
import { buildSafetyPayload } from './foodSafety';
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
  safety = null,
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
    ...buildSafetyPayload(safety || {}),
    ...buildFreshnessPayload({ ...freshness, listing_section: section }),
    ...buildPreorderPayload(preorder),
    item_options: normalizeOptionsForSave(options),
    last_activity_at: new Date().toISOString(),
    fulfillment_mode: normalizeFulfillmentMode(produce.fulfillment_mode),
  };
}

export function formatListingSaveError(error, fallback = 'Could not save listing.') {
  if (!error) return fallback;
  const msg = error.message || String(error);
  if (isFulfillmentConstraintError(error)) {
    return 'Fulfillment mode was rejected by the database. Run 27_fulfillment_pickup_shipping.sql in Supabase, or pick Local pickup / External store only.';
  }
  if (msg.includes('row-level security') || msg.includes('RLS')) {
    return 'Permission denied — sign in as the practitioner owner or run FIX_VENDOR_LISTING_CRUD.sql in Supabase.';
  }
  return msg.length > 180 ? `${msg.slice(0, 180)}…` : msg;
}

export async function saveProduceItemRecord(payload, { editId = null } = {}) {
  const attempt = async (body) => {
    if (editId) {
      return supabase.from('produce_items').update(body).eq('id', editId).select().single();
    }
    return supabase.from('produce_items').insert(body).select().single();
  };

  let { data, error } = await attempt(payload);
  if (!error) return { data, error: null };

  if (isFulfillmentConstraintError(error)) {
    const legacyPayload = {
      ...payload,
      fulfillment_mode: legacyFulfillmentModeForDb(payload.fulfillment_mode),
    };
    const retry = await attempt(legacyPayload);
    if (!retry.error) return retry;
    error = retry.error;
  }

  return { data: null, error };
}