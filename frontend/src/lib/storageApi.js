import { supabase } from './supabaseClient';
import { compressImage, formatBytes } from './imageCompress';
import { STORAGE_KEYS } from './storageKeys';

const BUCKET = 'review-photos';
const VENDOR_BUCKET = 'vendor-assets';
const AVATAR_BUCKET = 'profile-avatars';

/** Max raw file size before compression (phone camera photos) */
const INPUT_MAX_BYTES = 15 * 1024 * 1024;

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

const COMPRESS_PRESETS = {
  avatar: { maxEdge: 1024, maxBytes: 900 * 1024, quality: 0.86 },
  banner: { maxEdge: 1400, maxBytes: 1200 * 1024, quality: 0.84 },
  vendor: { maxEdge: 1200, maxBytes: 1100 * 1024, quality: 0.85 },
  listing: { maxEdge: 800, maxBytes: 500 * 1024, quality: 0.82 },
  review: { maxEdge: 1200, maxBytes: 1024 * 1024, quality: 0.84 },
};

/** Must match public.current_user_email() — first path segment for profile-avatars RLS */
export function userStorageFolder(user) {
  const email = user?.email?.trim().toLowerCase();
  if (!email) throw new Error('Sign in to upload photos.');
  return email.replace(/[/\\]/g, '_');
}

function mapStorageError(error) {
  const msg = (error?.message || String(error)).toLowerCase();
  if (msg.includes('bucket not found')) {
    return 'Photo storage is not configured. Run SQL migration 34 in Supabase (profile storage).';
  }
  if (msg.includes('row-level security') || msg.includes('policy') || msg.includes('403')) {
    return 'Upload blocked by permissions. Sign out, sign back in, and try again.';
  }
  if (msg.includes('payload too large') || msg.includes('413') || msg.includes('maximum size')) {
    return 'Image is still too large after compression. Try a smaller photo or crop before uploading.';
  }
  if (msg.includes('mime') || msg.includes('not allowed')) {
    return 'That file type is not supported. Use JPEG, PNG, or WebP.';
  }
  return error?.message || 'Upload failed. Please try again.';
}

async function requireAuthSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw new Error(mapStorageError(error));
  if (!session?.access_token) {
    throw new Error('Your session expired. Sign out and sign in again, then retry the upload.');
  }
  return session;
}

async function prepareImageFile(file, preset = 'avatar') {
  if (!file) throw new Error('Choose a photo first.');
  if (!file.type?.startsWith('image/')) {
    throw new Error('Choose an image file (JPEG, PNG, or WebP).');
  }
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    throw new Error('HEIC photos are not supported in-browser. On iPhone: Settings → Camera → Formats → Most Compatible, or email the photo to yourself as JPEG.');
  }
  if (file.size > INPUT_MAX_BYTES) {
    throw new Error(`Photo must be under ${Math.round(INPUT_MAX_BYTES / 1024 / 1024)} MB before upload (yours is ${formatBytes(file.size)}).`);
  }

  const opts = COMPRESS_PRESETS[preset] || COMPRESS_PRESETS.avatar;
  try {
    return await compressImage(file, opts);
  } catch (err) {
    if (ALLOWED.includes(file.type) && file.size <= opts.maxBytes * 2) {
      return file;
    }
    throw new Error(err?.message || 'Could not process image. Try a different photo.');
  }
}

async function uploadImage(file, { bucket, folder, user, preset = 'avatar' }) {
  if (!user?.email) throw new Error('Sign in to upload photos.');

  await requireAuthSession();
  const prepared = await prepareImageFile(file, preset);

  const safeFolder = folder || userStorageFolder(user);
  const ext = prepared.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, prepared, {
    cacheControl: '3600',
    upsert: true,
    contentType: prepared.type || 'image/jpeg',
  });

  if (error) throw new Error(mapStorageError(error));

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadReviewPhoto(file, user) {
  const folder = `${userStorageFolder(user)}/review`;
  return uploadImage(file, { bucket: BUCKET, folder, user, preset: 'review' });
}

export async function uploadVendorAsset(file, user, vendorId, kind = 'banner') {
  const folder = `vendor-${vendorId}/${kind}`;
  return uploadImage(file, { bucket: VENDOR_BUCKET, folder, user, preset: 'vendor' });
}

export async function uploadProfileAvatar(file, user) {
  return uploadImage(file, { bucket: AVATAR_BUCKET, folder: userStorageFolder(user), user, preset: 'avatar' });
}

export async function uploadProfileBanner(file, user) {
  const folder = `${userStorageFolder(user)}/banner`;
  return uploadImage(file, { bucket: AVATAR_BUCKET, folder, user, preset: 'banner' });
}

export async function uploadTempPhoto(file, user, vendorId) {
  const folder = `vendor-${vendorId}/temp-proof`;
  return uploadImage(file, { bucket: VENDOR_BUCKET, folder, user, preset: 'vendor' });
}

export async function uploadListingThumbnail(file, user, vendorId, kind = 'menu') {
  const folder = `vendor-${vendorId}/listings/${kind}`;
  return uploadImage(file, { bucket: VENDOR_BUCKET, folder, user, preset: 'listing' });
}

export async function uploadVerificationDoc(file, user, vendorId, kind = 'id-front') {
  const folder = `vendor-${vendorId}/verification/${kind}`;
  return uploadImage(file, { bucket: VENDOR_BUCKET, folder, user, preset: 'vendor' });
}

/** Persist avatar URL on users row + local session cache */
export async function persistUserAvatar(user, avatarUrl, onProfileUpdate) {
  if (!user?.email || !avatarUrl) return;
  const { error } = await supabase
    .from('users')
    .update({ avatar: avatarUrl })
    .ilike('email', user.email.trim());
  if (error) throw new Error(error.message);

  const updated = { ...user, avatar: avatarUrl };
  try {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
  onProfileUpdate?.(updated);
  return updated;
}