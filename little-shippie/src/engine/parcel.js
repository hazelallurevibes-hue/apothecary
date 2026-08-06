/** Normalize parcel dimensions for rating + labels. */

export function normalizeParcel({
  weightOz = 16,
  lengthIn = 8,
  widthIn = 6,
  heightIn = 4,
  weightLb,
} = {}) {
  let oz = Number(weightOz);
  if (weightLb != null && Number.isFinite(Number(weightLb))) {
    oz = Number(weightLb) * 16;
  }
  oz = Math.max(1, Math.min(1120, oz || 16)); // up to 70 lb
  const L = Math.max(1, Number(lengthIn) || 8);
  const W = Math.max(1, Number(widthIn) || 6);
  const H = Math.max(1, Number(heightIn) || 4);
  const girth = 2 * (W + H);
  const dimensionalWeightLb = (L * W * H) / 166; // USPS-ish DIM
  const actualLb = oz / 16;
  const billableLb = Math.max(actualLb, dimensionalWeightLb);
  return {
    weightOz: oz,
    weightLb: actualLb,
    lengthIn: L,
    widthIn: W,
    heightIn: H,
    girthIn: girth,
    dimensionalWeightLb,
    billableLb,
    oversized: L > 22 || W > 18 || H > 15 || L + girth > 108,
  };
}

export function parseAddressLine(address = '') {
  const s = String(address || '').trim();
  if (!s) return { raw: '', country: 'US' };
  // "street, city, ST zip, country"
  const parts = s.split(',').map((p) => p.trim()).filter(Boolean);
  let country = 'US';
  let postal = '';
  let region = '';
  let city = '';
  let street = parts[0] || s;
  if (parts.length >= 2) city = parts[1] || '';
  if (parts.length >= 3) {
    const stZip = parts[2].match(/([A-Za-z]{2})\s+(\d{5}(-\d{4})?)/);
    if (stZip) {
      region = stZip[1].toUpperCase();
      postal = stZip[2];
    } else {
      region = parts[2];
    }
  }
  if (parts.length >= 4) country = parts[3].slice(0, 2).toUpperCase() || 'US';
  const zipOnly = s.match(/\b(\d{5})(-\d{4})?\b/);
  if (!postal && zipOnly) postal = zipOnly[1];
  return { raw: s, street, city, region, postal, country };
}
