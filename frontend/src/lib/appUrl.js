import { VERTICAL } from './vertical';

/** Canonical production URL — override with VITE_APP_URL in Vercel env. */
export const DEFAULT_APP_URL = VERTICAL.appUrl;

export function getAppUrl() {
  const raw = (import.meta.env.VITE_APP_URL || DEFAULT_APP_URL).trim();
  return raw.replace(/\/$/, '');
}

export function getAppOrigin() {
  try {
    return new URL(getAppUrl()).origin;
  } catch {
    return DEFAULT_APP_URL;
  }
}