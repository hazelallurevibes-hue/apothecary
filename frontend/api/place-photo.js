/** Proxy Google Place photos — API key stays server-side. */
export default async function handler(req, res) {
  const ref = req.query.ref;
  if (!ref || typeof ref !== 'string') {
    return res.status(400).json({ error: 'ref required' });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(503).end();
  }

  const photoName = decodeURIComponent(ref);
  const mediaUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=640&skipHttpRedirect=true`;

  const meta = await fetch(mediaUrl, {
    headers: { 'X-Goog-Api-Key': apiKey },
  });

  if (!meta.ok) {
    return res.status(meta.status).end();
  }

  const json = await meta.json();
  const photoUri = json.photoUri;
  if (!photoUri) {
    return res.status(404).end();
  }

  const upstream = await fetch(photoUri);
  if (!upstream.ok) {
    return res.status(upstream.status).end();
  }

  const contentType = upstream.headers.get('content-type') || 'image/jpeg';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const buffer = await upstream.arrayBuffer();
  return res.status(200).send(Buffer.from(buffer));
}