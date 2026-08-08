/**
 * Multi-tenant API key helpers (stateless HMAC-style keys for embed + REST).
 * Production: store hashed keys in tax_vato_api_keys table; this validates format + optional secret.
 */

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

const PREFIX = 'tv_live_';
const TEST_PREFIX = 'tv_test_';

export function generateApiKey({ live = true } = {}) {
  const raw = randomBytes(24).toString('base64url');
  const prefix = live ? PREFIX : TEST_PREFIX;
  const key = `${prefix}${raw}`;
  return {
    key,
    prefix: key.slice(0, 12),
    hash: hashApiKey(key),
    live,
  };
}

export function hashApiKey(key) {
  return createHash('sha256').update(String(key)).digest('hex');
}

export function isValidKeyFormat(key) {
  return /^(tv_live_|tv_test_)[A-Za-z0-9_-]{20,}$/.test(String(key || ''));
}

/** Optional request signing for server-to-server */
export function signPayload(secret, body, timestamp) {
  const payload = `${timestamp}.${typeof body === 'string' ? body : JSON.stringify(body)}`;
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifySignature(secret, body, timestamp, signature, maxSkewMs = 300000) {
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > maxSkewMs) return false;
  const expected = signPayload(secret, body, timestamp);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(String(signature || ''));
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function parseBearer(authHeader) {
  const h = String(authHeader || '');
  if (h.toLowerCase().startsWith('bearer ')) return h.slice(7).trim();
  return h.trim() || null;
}
