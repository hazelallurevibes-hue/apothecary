/** Parse YouTube & Vimeo URLs for service/course embeds */

const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
];

const VIMEO_PATTERNS = [
  /vimeo\.com\/(\d+)/,
  /player\.vimeo\.com\/video\/(\d+)/,
];

export function parseVideoUrl(raw) {
  const url = (raw || '').trim();
  if (!url) return null;

  for (const re of YT_PATTERNS) {
    const m = url.match(re);
    if (m) return { provider: 'youtube', id: m[1], url };
  }
  for (const re of VIMEO_PATTERNS) {
    const m = url.match(re);
    if (m) return { provider: 'vimeo', id: m[1], url };
  }
  return null;
}

export function embedSrc(parsed) {
  if (!parsed) return null;
  if (parsed.provider === 'youtube') {
    return `https://www.youtube.com/embed/${parsed.id}?rel=0&modestbranding=1`;
  }
  if (parsed.provider === 'vimeo') {
    return `https://player.vimeo.com/video/${parsed.id}?title=0&byline=0`;
  }
  return null;
}

export function thumbnailFromVideo(parsed) {
  if (!parsed) return null;
  if (parsed.provider === 'youtube') {
    return `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`;
  }
  return null;
}

export function providerLabel(provider) {
  if (provider === 'youtube') return 'YouTube';
  if (provider === 'vimeo') return 'Vimeo';
  return provider || 'Video';
}

export function buildServiceMediaPayload({ photo, videoUrl, mediaType, galleryPhotos = [] }) {
  const parsed = parseVideoUrl(videoUrl);
  return {
    photo: photo || null,
    service_video_url: parsed?.url || (videoUrl?.trim() || null),
    service_video_provider: parsed?.provider || null,
    media_type: mediaType || (parsed && photo ? 'both' : parsed ? 'video' : 'photo'),
    gallery_photos: galleryPhotos.length ? JSON.stringify(galleryPhotos) : null,
  };
}

export function parseGalleryPhotos(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}