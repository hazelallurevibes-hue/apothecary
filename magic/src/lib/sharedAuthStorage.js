/**
 * Shared Supabase auth storage for Magic + Apothecary on *.hazelallure.com
 * Keep in sync with frontend/src/lib/sharedAuthStorage.js
 *
 * Security: Secure+SameSite=Lax cookies on parent domain only; no tokens in URLs.
 */

export const HAZEL_AUTH_STORAGE_KEY = 'hazel_sb_auth_v1';
const COOKIE_PREFIX = 'hazel_sb_auth';
const CHUNK = 3000;
const MAX_AGE = 60 * 60 * 24 * 14;

function canUseSharedCookies() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (window.location.protocol !== 'https:') return false;
  const h = window.location.hostname;
  return h === 'hazelallure.com' || h.endsWith('.hazelallure.com');
}

function cookieDomainAttr() {
  return canUseSharedCookies() ? '; Domain=.hazelallure.com' : '';
}

function readCookie(name) {
  try {
    const parts = document.cookie.split(';');
    for (const p of parts) {
      const [k, ...rest] = p.trim().split('=');
      if (k === name) {
        const raw = rest.join('=') || '';
        try {
          return decodeURIComponent(raw);
        } catch {
          return raw;
        }
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeCookie(name, value, maxAge = MAX_AGE) {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    // Prefer base64 for payload chunks to avoid encodeURIComponent size blow-ups
    document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}${cookieDomainAttr()}`;
  } catch {
    /* ignore quota / blocked cookies */
  }
}

function clearCookie(name) {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}${cookieDomainAttr()}`;
  } catch {
    /* ignore */
  }
}

function clearAllChunks() {
  const n = Number(readCookie(`${COOKIE_PREFIX}_n`) || '0');
  for (let i = 0; i < Math.max(n, 24); i++) clearCookie(`${COOKIE_PREFIX}_${i}`);
  clearCookie(`${COOKIE_PREFIX}_n`);
}

function toB64(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return btoa(str);
  }
}

function fromB64(b64) {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    try {
      return atob(b64);
    } catch {
      return null;
    }
  }
}

function readChunked() {
  const n = Number(readCookie(`${COOKIE_PREFIX}_n`) || '0');
  if (!n || n < 1 || n > 40) return null;
  let out = '';
  for (let i = 0; i < n; i++) {
    const part = readCookie(`${COOKIE_PREFIX}_${i}`);
    if (part == null) return null;
    out += part;
  }
  // Prefer base64 decode; fall back to raw JSON string
  const decoded = fromB64(out);
  if (decoded && (decoded.startsWith('{') || decoded.startsWith('['))) return decoded;
  if (out.startsWith('{') || out.startsWith('%7B') || out.startsWith('%7b')) {
    try {
      return decodeURIComponent(out);
    } catch {
      return out;
    }
  }
  return decoded || out || null;
}

function writeChunked(value) {
  clearAllChunks();
  if (!value) return;
  const payload = toB64(value);
  const parts = [];
  for (let i = 0; i < payload.length; i += CHUNK) {
    parts.push(payload.slice(i, i + CHUNK));
  }
  writeCookie(`${COOKIE_PREFIX}_n`, String(parts.length));
  parts.forEach((p, i) => writeCookie(`${COOKIE_PREFIX}_${i}`, p));
}

function migrateLegacyLocal(key) {
  try {
    const legacyKeys = [
      key,
      'magic_supabase_auth',
      'sb-jihinbkeqlkgywfsxizj-auth-token',
      // common supabase-js default patterns
      ...Object.keys(localStorage).filter((k) => k.includes('auth-token') || k.includes('supabase.auth')),
    ];
    for (const lk of legacyKeys) {
      try {
        const v = localStorage.getItem(lk);
        if (v && v.length > 40 && (v.includes('access_token') || v.includes('refresh_token'))) return v;
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Pull session JSON from any available store (for bridge recovery). */
export function readSharedSessionRaw() {
  try {
    const local = localStorage.getItem(HAZEL_AUTH_STORAGE_KEY);
    if (local && local.length > 40) return local;
  } catch {
    /* ignore */
  }
  if (canUseSharedCookies()) {
    const c = readChunked();
    if (c && c.length > 40) return c;
  }
  return migrateLegacyLocal(HAZEL_AUTH_STORAGE_KEY);
}

export function extractTokensFromStoredSession(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // supabase-js v2 typically stores session object at top level or under currentSession
    const sess = parsed?.currentSession || parsed?.session || parsed;
    const access_token = sess?.access_token;
    const refresh_token = sess?.refresh_token;
    if (access_token && refresh_token) return { access_token, refresh_token };
  } catch {
    /* ignore */
  }
  return null;
}

export const sharedAuthStorage = {
  getItem(key) {
    // Prefer shared cookies first when on production Hazel hosts so Magic
    // immediately sees Apothecary's session (localStorage is origin-isolated).
    if (canUseSharedCookies()) {
      const fromCookie = readChunked();
      if (fromCookie) {
        try {
          localStorage.setItem(key, fromCookie);
        } catch {
          /* ignore */
        }
        return fromCookie;
      }
    }
    try {
      const local = localStorage.getItem(key);
      if (local) return local;
    } catch {
      /* ignore */
    }
    const migrated = migrateLegacyLocal(key);
    if (migrated) {
      try {
        localStorage.setItem(key, migrated);
      } catch {
        /* ignore */
      }
      if (canUseSharedCookies()) writeChunked(migrated);
      return migrated;
    }
    return null;
  },

  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
    if (canUseSharedCookies()) writeChunked(value);
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem('magic_supabase_auth');
    } catch {
      /* ignore */
    }
    if (canUseSharedCookies()) clearAllChunks();
  },
};

export function buildAuthBridgeUrl(origin, nextPath = '/') {
  const base = String(origin || '').replace(/\/$/, '');
  const next = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
  const safeNext = next.startsWith('//') ? '/' : next;
  return `${base}/auth/bridge?next=${encodeURIComponent(safeNext)}`;
}

export function canShareHazelCookies() {
  return canUseSharedCookies();
}
