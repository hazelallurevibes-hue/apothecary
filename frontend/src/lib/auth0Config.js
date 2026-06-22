/** Auth0 config — reads VITE_* or AUTH0_* (Vercel marketplace integration) */
import { VERTICAL } from './vertical';
import { DEFAULT_APP_URL, getAppUrl } from './appUrl';

export function getAuth0Domain() {
  return (import.meta.env.VITE_AUTH0_DOMAIN || import.meta.env.AUTH0_DOMAIN || '').trim();
}

export function getAuth0ClientId() {
  return (import.meta.env.VITE_AUTH0_CLIENT_ID || import.meta.env.AUTH0_CLIENT_ID || '').trim();
}

export function isAuth0Configured() {
  if (import.meta.env.VITE_AUTH0_ENABLED === 'false') return false;
  return !!(getAuth0Domain() && getAuth0ClientId());
}

/**
 * SPA redirect URI — must match Auth0 Application → Allowed Callback URLs exactly.
 * Default: origin only (e.g. https://apothecary.hazelallure.com).
 */
export function getAuth0CallbackPath() {
  const raw = (import.meta.env.VITE_AUTH0_CALLBACK_PATH || '').trim();
  return raw || '';
}

export function getAuth0RedirectUri() {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : getAppUrl();
  const path = getAuth0CallbackPath();
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getAuth0ProviderProps() {
  const domain = getAuth0Domain();
  return {
    domain,
    clientId: getAuth0ClientId(),
    authorizationParams: {
      redirect_uri: getAuth0RedirectUri(),
      scope: 'openid profile email',
    },
    cacheLocation: 'localstorage',
    useRefreshTokens: import.meta.env.VITE_AUTH0_USE_REFRESH_TOKENS === 'true',
  };
}

/** URLs to allowlist in Auth0 Dashboard → Application → Settings (SPA type). */
export function getAuth0DashboardUrls() {
  const production = getAppUrl();
  const origins = [
    production,
    VERTICAL.siteUrl,
    'https://hazelallure-apothecary.vercel.app',
    'http://localhost:5173',
    'http://localhost:4173',
  ];
  const uniqueOrigins = [...new Set(origins)];
  const callbackPath = getAuth0CallbackPath();
  const callbacks = uniqueOrigins.map((o) => (callbackPath ? `${o}${callbackPath}` : o));
  return {
    allowedCallbackUrls: [
      ...callbacks,
      `${production}/api/auth/callback`,
      'https://hazelallure-apothecary.vercel.app/api/auth/callback',
      'http://localhost:5173/api/auth/callback',
    ],
    allowedLogoutUrls: uniqueOrigins.map((o) => `${o}/login`),
    allowedWebOrigins: uniqueOrigins,
    applicationType: 'Single Page Application',
    domain: getAuth0Domain(),
  };
}

export { DEFAULT_APP_URL };