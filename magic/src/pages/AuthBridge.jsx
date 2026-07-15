import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabaseAuth } from '../lib/supabaseAuth';
import { useAuth } from '../context/AuthContext';

/**
 * Cross-site session restore when arriving from Apothecary.
 * Tokens never travel in the URL — shared Secure cookies only.
 */
export default function AuthBridge() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [msg, setMsg] = useState('Restoring your Magic Sanctum session…');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rawNext = params.get('next') || '/';
      const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

      try {
        let { data } = await supabaseAuth.auth.getSession();
        if (!data?.session?.user?.email) {
          await new Promise((r) => setTimeout(r, 250));
          data = (await supabaseAuth.auth.getSession()).data;
        }

        if (!data?.session?.user?.email) {
          setMsg('No session yet — sign in once to link both sites.');
          navigate(`/auth?next=${encodeURIComponent(next)}`, { replace: true });
          return;
        }

        await refresh();
        if (!cancelled) {
          setMsg('Welcome back to the sanctum…');
          navigate(next, { replace: true });
        }
      } catch (e) {
        if (!cancelled) {
          setMsg(e.message || 'Could not restore session');
          navigate('/auth', { replace: true });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params, navigate, refresh]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4a1942] to-[#6b2d7a] border-2 border-[#c9a227] flex items-center justify-center text-white text-2xl font-black shadow-lg"
        aria-hidden
      >
        ⑧
      </div>
      <p className="font-display font-bold text-xl text-[#4a1942]">Magic Sanctum</p>
      <p className="text-sm text-[#4a1942]/70">{msg}</p>
    </div>
  );
}
