/** Great-circle distance in miles — no external API required. */
export function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function vendorLocationBlob(v) {
  return [v.city, v.state, v.zip, v.region, v.street_address, v.name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function vendorLocationLabel(v) {
  const parts = [v.city, v.state, v.zip, v.region].filter(Boolean);
  return parts.join(', ') || v.street_address || 'Location not listed';
}