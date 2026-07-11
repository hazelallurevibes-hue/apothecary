import { getGoogleKey, googleTextSearch, sortByStars } from './lib/google-places.js';

/** Cost-conscious Google Places text search — server-side only, capped at 8 results. */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const q = (req.query.q || '').trim();
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = Math.min(15000, Math.max(2000, parseInt(req.query.radius || '8000', 10)));

  if (!q || q.length < 3) {
    return res.status(400).json({ error: 'q must be at least 3 characters' });
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'lat and lng required' });
  }

  const apiKey = getGoogleKey();
  if (!apiKey) {
    return res.status(200).json({ places: [], configured: false });
  }

  try {
    const raw = await googleTextSearch({
      apiKey,
      lat,
      lng,
      radius,
      textQuery: q,
      maxResultCount: 8,
    });
    return res.status(200).json({
      places: sortByStars(raw),
      configured: true,
    });
  } catch (err) {
    console.error('places-search:', err?.message);
    return res.status(200).json({
      places: [],
      configured: true,
      message: 'Could not load places right now.',
    });
  }
}