import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAuth } from '../lib/supabaseAuth';
import { restoreSession } from '../lib/auth';
import { useAuth } from '../context/AuthContext';

/** Handles Supabase OAuth / magic-link return to magic.hazelallure.com */
export default function AuthCallback() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const [msg, setMsg] = useState('Sealing the session…');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Exchange hash/query tokens if present
        const { error } = await supabaseAuth.auth.getSession();
        if (error) throw error;
        const user = await restoreSession();
        if (!cancelled) {
          if (user) {
            setUser?.(user);
            setMsg('Welcome back — opening the sanctum…');
            nav('/settings', { replace: true });
          } else {
            setMsg('No session found. Try signing in again.');
            setTimeout(() => nav('/auth', { replace: true }), 1500);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setMsg(e.message || 'Auth callback failed');
          setTimeout(() => nav('/auth', { replace: true }), 2000);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nav, setUser]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-sm text-[#4a1942]/70">
      {msg}
    </div>
  );
}
