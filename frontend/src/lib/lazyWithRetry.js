import { lazy } from 'react';

const CHUNK_RELOAD_KEY = 'hazel_chunk_reload';

const CHUNK_ERROR_RE =
  /failed to fetch dynamically imported module|loading chunk|importing a module script failed/i;

function isChunkLoadError(error) {
  return CHUNK_ERROR_RE.test(error?.message || String(error));
}

/** Clear after a successful full app load (see App.jsx). */
export function clearChunkReloadFlag() {
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * React.lazy wrapper that reloads once when a deploy invalidates cached chunk URLs.
 */
export function lazyWithRetry(importFactory) {
  return lazy(() =>
    importFactory().catch((error) => {
      if (isChunkLoadError(error)) {
        let reloaded = false;
        try {
          reloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1';
        } catch {
          /* ignore */
        }
        if (!reloaded) {
          try {
            sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
          } catch {
            /* ignore */
          }
          window.location.reload();
          return new Promise(() => {});
        }
        clearChunkReloadFlag();
      }
      throw error;
    }),
  );
}