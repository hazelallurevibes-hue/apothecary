export const DEFAULT_LISTING_PHOTO = 'https://picsum.photos/seed/hazelallure-listing/640/480';

export function resolveListingPhoto(url) {
  const trimmed = (url || '').trim();
  return trimmed || DEFAULT_LISTING_PHOTO;
}