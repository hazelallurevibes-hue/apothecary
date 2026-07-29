/**
 * Seller "shelf score" 0–100 from existing storefront signals.
 * Encourages better photos, location, bio — higher trust & conversion.
 */

export function computeShelfScore(vendor = {}, listingCount = 0) {
  const checks = [];
  const add = (ok, label, pts) => checks.push({ ok: !!ok, label, pts });

  add(!!vendor.logo, 'Logo uploaded', 12);
  add(!!vendor.highlight_photo, 'Highlight / hero photo', 10);
  add(Array.isArray(vendor.banner_images) ? vendor.banner_images.length > 0 : !!vendor.banner_images, 'Banner image', 8);
  add((vendor.bio || '').trim().length >= 40, 'Bio (40+ characters)', 12);
  add(!!vendor.city || !!vendor.state, 'City / region listed', 10);
  add(vendor.latitude != null && vendor.longitude != null, 'Map coordinates for near-me', 8);
  add(listingCount >= 1, 'At least 1 live product', 12);
  add(listingCount >= 5, '5+ products on the shelf', 10);
  add(listingCount >= 12, '12+ products (full shelf)', 8);
  add((vendor.category || '').trim().length > 0, 'Category set', 5);
  add(!!vendor.phone || !!vendor.email, 'Contact on file', 5);

  const earned = checks.filter((c) => c.ok).reduce((s, c) => s + c.pts, 0);
  const max = checks.reduce((s, c) => s + c.pts, 0) || 1;
  const score = Math.min(100, Math.round((earned / max) * 100));

  let tier = 'Building';
  if (score >= 85) tier = 'Excellent';
  else if (score >= 70) tier = 'Strong';
  else if (score >= 50) tier = 'Good';

  const next = checks.filter((c) => !c.ok).slice(0, 3);

  return { score, tier, checks, next, earned, max };
}
