import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { resolveProfile, ensureOAuthUserProfile } from '../lib/auth';
import { syncUserProStatus } from '../lib/proStatus';
import { STORAGE_KEYS } from '../lib/storageKeys';

/**
 * Cross-site session restore for Magic ↔ Apothecary.
 * Session is already in shared Secure cookies — never accept tokens from the URL.
 */
export default function AuthBridge({ onLogin }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [msg, setMsg] = useState('Restoring your Hazel session…');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rawNext = params.get('next') || '/';
      const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

      try {
        // Force re-read from shared storage / cookies
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        let session = data?.session;

        if (!session?.user?.email) {
          // One refresh attempt after short delay (cookie write race)
          await new Promise((r) => setTimeout(r, 200));
          const second = await supabase.auth.getSession();
          session = second.data?.session;
        }

        if (!session?.user?.email) {
          setMsg('No active session found. Please sign in.');
          navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
          return;
        }

        const isOAuth = session.user.app_metadata?.provider === 'google';
        let profile = isOAuth
          ? await ensureOAuthUserProfile(session)
          : await resolveProfile(session.user.email, session.user.id);

        if (profile) {
          profile = await syncUserProStatus(profile);
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profile));
          onLogin?.(profile);
        }

        if (!cancelled) {
          setMsg('Welcome back — taking you through…');
          navigate(next, { replace: true });
        }
      } catch (e) {
        if (!cancelled) {
          setMsg(e.message || 'Could not restore session');
          navigate('/login', { replace: true });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params, navigate, onLogin]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="text-center space-y-3 max-w-sm">
        <div className="text-4xl" aria-hidden>
          ⑧
        </div>
        <p className="font-semibold text-[#4a1942]">{msg}</p>
        <p className="text-xs text-gray-500">Secure handoff — no passwords re-entered.</p>
      </div>
    </div>
  );
}
