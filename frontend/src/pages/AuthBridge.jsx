import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  HAZEL_AUTH_STORAGE_KEY,
  extractTokensFromStoredSession,
  readSharedSessionRaw,
  sharedAuthStorage,
} from '../lib/sharedAuthStorage';
import { resolveProfile, ensureOAuthUserProfile } from '../lib/auth';
import { syncUserProStatus } from '../lib/proStatus';
import { STORAGE_KEYS } from '../lib/storageKeys';

function safeNextPath(raw) {
  const n = raw || '/';
  if (!n.startsWith('/') || n.startsWith('//')) return '/';
  return n;
}

function withTimeout(promise, ms, label = 'timeout') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(label)), ms);
    }),
  ]);
}

/**
 * Cross-site session restore for Magic → Apothecary.
 * Always leaves this page via hard redirect.
 */
export default function AuthBridge({ onLogin }) {
  const [params] = useSearchParams();
  const [msg, setMsg] = useState('Restoring your Hazel session…');
  const [failed, setFailed] = useState(false);
  const finished = useRef(false);
  const next = safeNextPath(params.get('next'));

  const go = (path) => {
    if (finished.current) return;
    finished.current = true;
    window.location.replace(path);
  };

  useEffect(() => {
    let cancelled = false;
    const hardTimeout = setTimeout(() => {
      if (!cancelled && !finished.current) {
        setMsg('Taking too long — continuing…');
        go(next);
      }
    }, 4500);

    (async () => {
      try {
        const raw = readSharedSessionRaw();
        const tokens = extractTokensFromStoredSession(raw);
        if (tokens) {
          setMsg('Linking your Magic session…');
          try {
            sharedAuthStorage.setItem(HAZEL_AUTH_STORAGE_KEY, raw);
            await withTimeout(
              supabase.auth.setSession({
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
              }),
              2500,
              'setSession timeout',
            );
          } catch (e) {
            console.warn('[auth bridge] setSession:', e?.message || e);
          }
        }

        setMsg('Checking session…');
        let session = null;
        try {
          const { data } = await withTimeout(supabase.auth.getSession(), 2000, 'getSession timeout');
          session = data?.session || null;
        } catch (e) {
          console.warn('[auth bridge] getSession:', e?.message || e);
        }

        if (!session?.user?.email) {
          setMsg('No shared session — please sign in.');
          setFailed(true);
          setTimeout(() => go(`/login?next=${encodeURIComponent(next)}`), 800);
          return;
        }

        setMsg('Loading your profile…');
        try {
          const isOAuth = session.user.app_metadata?.provider === 'google';
          let profile = isOAuth
            ? await withTimeout(ensureOAuthUserProfile(session), 2500, 'oauth profile timeout')
            : await withTimeout(
                resolveProfile(session.user.email, session.user.id),
                2500,
                'profile timeout',
              );
          if (profile) {
            try {
              profile = await withTimeout(syncUserProStatus(profile), 2000, 'pro sync timeout');
            } catch {
              /* keep profile */
            }
            localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profile));
            onLogin?.(profile);
          }
        } catch (e) {
          console.warn('[auth bridge] profile:', e?.message || e);
        }

        if (!cancelled) {
          setMsg('Welcome back…');
          go(next);
        }
      } catch (e) {
        if (!cancelled) {
          setMsg(e?.message || 'Could not restore session');
          setFailed(true);
          setTimeout(() => go(next), 600);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(hardTimeout);
    };
  }, [next, onLogin]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="text-center space-y-3 max-w-sm">
        <div className="text-4xl animate-pulse" aria-hidden>
          ⑧
        </div>
        <p className="font-semibold text-[#4a1942]">{msg}</p>
        <p className="text-xs text-gray-500">Secure handoff — no passwords re-entered.</p>
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          <button
            type="button"
            onClick={() => go(next)}
            className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm font-semibold"
          >
            Continue
          </button>
          <Link
            to={`/login?next=${encodeURIComponent(next)}`}
            className="px-4 py-2 border rounded-2xl text-sm"
          >
            Sign in
          </Link>
        </div>
        {failed && (
          <p className="text-[11px] text-gray-500">
            If this persists, sign in once on Apothecary, then open Magic again.
          </p>
        )}
      </div>
    </div>
  );
}
