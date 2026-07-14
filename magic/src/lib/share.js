/** Share helpers + light-branded text cards for social */

const SITE = 'https://magic.hazelallure.com';
const BRAND = '✨ Magic Sanctum · magic.hazelallure.com';

export function brandFooter() {
  return `\n\n${BRAND}`;
}

export function sharePayload({ title, text, url = SITE }) {
  return {
    title: title || 'Magic Sanctum',
    text: `${text}${brandFooter()}`,
    url,
  };
}

export function shareUrls({ text, url = SITE }) {
  const encoded = encodeURIComponent(`${text}${brandFooter()}`);
  const u = encodeURIComponent(url);
  return {
    x: `https://twitter.com/intent/tweet?text=${encoded}&url=${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${encoded}`,
    // IG / TT: no reliable web intent — copy + open
    instagram: 'https://www.instagram.com/',
    tiktok: 'https://www.tiktok.com/',
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  };
}

export async function copyText(text) {
  const full = `${text}${brandFooter()}`;
  await navigator.clipboard.writeText(full);
  return full;
}

export async function nativeShare(payload) {
  if (!navigator.share) return false;
  try {
    await navigator.share(sharePayload(payload));
    return true;
  } catch {
    return false;
  }
}

/**
 * Draw a simple 1080x1350 share card on canvas (IG story friendly).
 * Returns data URL png.
 */
export function renderShareCard({
  headline = 'Magic Sanctum',
  body = '',
  meta = '',
  accent = '#c9a227',
}) {
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // background
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#1a0a18');
  grad.addColorStop(0.5, '#4a1942');
  grad.addColorStop(1, '#2a1028');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // gold frame
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.strokeRect(48, 48, w - 96, h - 96);

  ctx.fillStyle = accent;
  ctx.font = '600 28px Georgia, serif';
  ctx.fillText('MAGIC SANCTUM', 80, 120);

  ctx.fillStyle = '#f5f0e8';
  ctx.font = 'bold 64px Georgia, serif';
  wrapText(ctx, headline, 80, 220, w - 160, 72);

  ctx.fillStyle = 'rgba(245,240,232,0.92)';
  ctx.font = '36px Georgia, serif';
  wrapText(ctx, body, 80, 420, w - 160, 48);

  if (meta) {
    ctx.fillStyle = 'rgba(201,162,39,0.95)';
    ctx.font = '28px system-ui, sans-serif';
    wrapText(ctx, meta, 80, 980, w - 160, 36);
  }

  ctx.fillStyle = 'rgba(245,240,232,0.7)';
  ctx.font = '26px system-ui, sans-serif';
  ctx.fillText('magic.hazelallure.com', 80, h - 100);
  ctx.fillText('Entertainment only · Hazel Allure', 80, h - 60);

  return canvas.toDataURL('image/png');
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(/\s+/);
  let line = '';
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + ' ';
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, yy);
      line = words[n] + ' ';
      yy += lineHeight;
      if (yy > 1100) break;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, yy);
}

export function downloadDataUrl(dataUrl, filename = 'magic-sanctum.png') {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
