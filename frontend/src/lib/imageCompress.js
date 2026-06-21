const DEFAULT_MAX_EDGE = 800;
const DEFAULT_QUALITY = 0.82;
const TARGET_MAX_BYTES = 400 * 1024;

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image compression failed'))),
      type,
      quality
    );
  });
}

function pickOutputMime(fileType) {
  if (fileType === 'image/png') return 'image/png';
  if (fileType === 'image/gif') return 'image/gif';
  return 'image/webp';
}

function extForMime(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/gif') return 'gif';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

/**
 * Resize and re-encode an image in the browser to keep uploads small.
 * Targets ~400 KB max at 800px longest edge (WebP when supported).
 */
export async function compressImage(file, options = {}) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Choose an image file.');
  }

  const maxEdge = options.maxEdge ?? DEFAULT_MAX_EDGE;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const maxBytes = options.maxBytes ?? TARGET_MAX_BYTES;

  if (file.type === 'image/gif' && file.size <= maxBytes) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, maxEdge / longest);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close?.();
    throw new Error('Could not process image.');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  let mime = pickOutputMime(file.type);
  let q = quality;
  let blob = await canvasToBlob(canvas, mime, q);

  if (mime !== 'image/gif') {
    while (blob.size > maxBytes && q > 0.45) {
      q -= 0.07;
      blob = await canvasToBlob(canvas, mime, q);
    }
    if (blob.size > maxBytes && mime === 'image/webp') {
      mime = 'image/jpeg';
      q = quality;
      blob = await canvasToBlob(canvas, mime, q);
      while (blob.size > maxBytes && q > 0.45) {
        q -= 0.07;
        blob = await canvasToBlob(canvas, mime, q);
      }
    }
  }

  const baseName = (file.name || 'listing').replace(/\.[^.]+$/, '') || 'listing';
  return new File([blob], `${baseName}.${extForMime(mime)}`, { type: mime });
}

export function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}