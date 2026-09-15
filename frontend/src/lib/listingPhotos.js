export const DEFAULT_LISTING_PHOTO = '/brand/og-lockup.png';

export function resolveListingPhoto(url) {
  const trimmed = (url || '').trim();
  return trimmed || DEFAULT_LISTING_PHOTO;
}