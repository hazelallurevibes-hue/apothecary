import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabaseAuth } from '../lib/supabaseAuth';
import {
  HAZEL_AUTH_STORAGE_KEY,
  extractTokensFromStoredSession,
  readSharedSessionRaw,
  sharedAuthStorage,
} from '../lib/sharedAuthStorage';
import { resolveMagicUser } from '../lib/auth';
import { useAuth } from '../context/AuthContext';

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
 * Cross-site session restore when arriving from Apothecary.
 * Must always leave this page (hard redirect) within a few seconds.
 */
export default function AuthBridge() {
  const [params] = useSearchParams();
  const { setUser } = useAuth();
  const [msg, setMsg] = useState('Restoring your Magic Sanctum session…');
  const [failed, setFailed] = useState(false);
  const finished = useRef(false);

  const next = safeNextPath(params.get('next'));

  const go = (path) => {
    if (finished.current) return;
    finished.current = true;
    // Hard navigation — more reliable than React Router after async auth
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
        // 1) Pull raw session from shared cookies / storage and force setSession
        const raw = readSharedSessionRaw();
        const tokens = extractTokensFromStoredSession(raw);
        if (tokens) {
          setMsg('Linking your Hazel session…');
          try {
            // Ensure storage sees the value before Supabase reads it
            sharedAuthStorage.setItem(HAZEL_AUTH_STORAGE_KEY, raw);
            await withTimeout(
              supabaseAuth.auth.setSession({
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

        // 2) getSession with timeout
        setMsg('Checking session…');
        let session = null;
        try {
          const { data } = await withTimeout(supabaseAuth.auth.getSession(), 2000, 'getSession timeout');
          session = data?.session || null;
        } catch (e) {
          console.warn('[auth bridge] getSession:', e?.message || e);
        }

        if (!session?.user?.email && tokens) {
          // last attempt
          try {
            const { data } = await supabaseAuth.auth.getSession();
            session = data?.session || null;
          } catch {
            /* ignore */
          }
        }

        if (!session?.user?.email) {
          setMsg('No shared session found — please sign in once.');
          setFailed(true);
          setTimeout(() => go(`/auth?next=${encodeURIComponent(next)}`), 800);
          return;
        }

        // 3) Load profile (bounded) so Pro status is ready
        setMsg('Loading your profile…');
        try {
          const user = await withTimeout(resolveMagicUser(session), 2500, 'profile timeout');
          if (user && setUser) setUser(user);
        } catch (e) {
          console.warn('[auth bridge] profile:', e?.message || e);
        }

        if (!cancelled) {
          setMsg('Welcome back — opening the sanctum…');
          go(next);
        }
      } catch (e) {
        console.warn('[auth bridge]', e);
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
      // Do NOT set finished=true here — StrictMode remount must still redirect
    };
  }, [next, setUser]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div
        className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4a1942] to-[#6b2d7a] border-2 border-[#c9a227] flex items-center justify-center text-white text-2xl font-black shadow-lg animate-pulse"
        aria-hidden
      >
        ⑧
      </div>
      <p className="font-display font-bold text-xl text-[#4a1942]">Magic Sanctum</p>
      <p className="text-sm text-[#4a1942]/70 text-center max-w-sm">{msg}</p>
      <div className="flex flex-wrap gap-2 justify-center pt-2">
        <button type="button" className="btn-primary text-sm" onClick={() => go(next)}>
          Continue to Magic
        </button>
        <Link to={`/auth?next=${encodeURIComponent(next)}`} className="btn-secondary text-sm">
          Sign in
        </Link>
      </div>
      {failed && (
        <p className="text-[11px] text-[#4a1942]/50 text-center max-w-xs">
          If this keeps happening, sign in once on Magic — then hops between Apothecary and Magic stay signed in.
        </p>
      )}
    </div>
  );
}
