/**
 * Shared Supabase auth storage for Apothecary + Magic on *.hazelallure.com
 *
 * Security notes:
 * - Session lives only in http(s) cookies scoped to Domain=.hazelallure.com
 * - Secure + SameSite=Lax (not sent on third-party POSTs)
 * - Never put access/refresh tokens in query strings
 * - Localhost keeps localStorage only (no cross-port cookie domain)
 * - Chunked cookies avoid 4KB browser limits
 */

export const HAZEL_AUTH_STORAGE_KEY = 'hazel_sb_auth_v1';
const COOKIE_PREFIX = 'hazel_sb_auth';
const CHUNK = 3200; // stay under typical 4KB cookie limit with attributes
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

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
  const parts = document.cookie.split(';');
  for (const p of parts) {
    const [k, ...rest] = p.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('=') || '');
  }
  return null;
}

function writeCookie(name, value, maxAge = MAX_AGE) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}${cookieDomainAttr()}`;
}

function clearCookie(name) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}${cookieDomainAttr()}`;
}

function clearAllChunks() {
  const n = Number(readCookie(`${COOKIE_PREFIX}_n`) || '0');
  for (let i = 0; i < Math.max(n, 12); i++) clearCookie(`${COOKIE_PREFIX}_${i}`);
  clearCookie(`${COOKIE_PREFIX}_n`);
}

function readChunked() {
  const n = Number(readCookie(`${COOKIE_PREFIX}_n`) || '0');
  if (!n || n < 1 || n > 20) return null;
  let out = '';
  for (let i = 0; i < n; i++) {
    const part = readCookie(`${COOKIE_PREFIX}_${i}`);
    if (part == null) return null;
    out += part;
  }
  return out || null;
}

function writeChunked(value) {
  clearAllChunks();
  if (!value) return;
  const parts = [];
  for (let i = 0; i < value.length; i += CHUNK) {
    parts.push(value.slice(i, i + CHUNK));
  }
  writeCookie(`${COOKIE_PREFIX}_n`, String(parts.length));
  parts.forEach((p, i) => writeCookie(`${COOKIE_PREFIX}_${i}`, p));
}

/** Migrate legacy per-app keys once so users stay signed in after upgrade */
function migrateLegacyLocal(key) {
  try {
    const legacyKeys = [
      key,
      'magic_supabase_auth',
      'sb-jihinbkeqlkgywfsxizj-auth-token',
    ];
    for (const lk of legacyKeys) {
      const v = localStorage.getItem(lk);
      if (v && v.length > 20) return v;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export const sharedAuthStorage = {
  getItem(key) {
    try {
      const local = localStorage.getItem(key);
      if (local) return local;
    } catch {
      /* ignore */
    }
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

/**
 * Build a cross-site URL that lands on the bridge page (session already in shared cookie).
 * Never attaches tokens to the URL.
 */
export function buildAuthBridgeUrl(origin, nextPath = '/') {
  const base = String(origin || '').replace(/\/$/, '');
  const next = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
  const safeNext = next.startsWith('//') ? '/' : next;
  return `${base}/auth/bridge?next=${encodeURIComponent(safeNext)}`;
}

export function isHazelProductionHost() {
  if (typeof window === 'undefined') return false;
  return canUseSharedCookies();
}
