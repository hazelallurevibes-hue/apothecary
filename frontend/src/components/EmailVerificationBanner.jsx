import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  checkEmailVerified,
  isEmailKnownVerified,
  resendVerificationEmail,
  writeEmailVerifiedCache,
} from '../lib/emailVerification';

function initialVerifiedState(user) {
  if (!user?.email) return null;
  if (isEmailKnownVerified(user)) return true;
  return null;
}

export default function EmailVerificationBanner({ user, variant = 'customer' }) {
  const [verified, setVerified] = useState(() => initialVerifiedState(user));
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const checkedEmailRef = useRef(null);
  const checkGenRef = useRef(0);

  const runCheck = useCallback(async (force = false) => {
    if (!user?.email) {
      setVerified(null);
      checkedEmailRef.current = null;
      return;
    }

    if (isEmailKnownVerified(user)) {
      setVerified(true);
      return;
    }

    const email = user.email.trim().toLowerCase();
    if (!force && checkedEmailRef.current === email) {
      return;
    }

    checkedEmailRef.current = email;
    const gen = ++checkGenRef.current;
    const ok = await checkEmailVerified(user);
    if (gen !== checkGenRef.current) return;

    if (ok) writeEmailVerifiedCache(user.email, true);
    setVerified(ok);
  }, [user?.email, user?.auth_provider, user?.email_verified]);

  useEffect(() => {
    runCheck(false);
  }, [runCheck]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      if (!sessionUser?.email || !user?.email) return;
      if (sessionUser.email.trim().toLowerCase() !== user.email.trim().toLowerCase()) return;
      if (sessionUser.email_confirmed_at || sessionUser.confirmed_at) {
        writeEmailVerifiedCache(user.email, true);
        setVerified(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [user?.email]);

  // Only show when we know email is unverified — never flash while checking (verified === null)
  if (verified !== false) return null;

  const isVendor = variant === 'vendor';

  const resend = async () => {
    setSending(true);
    setMessage('');
    try {
      await resendVerificationEmail(user.email, { role: isVendor ? 'vendor' : 'customer' });
      setMessage('Verification email sent — check your inbox and spam folder.');
    } catch (e) {
      setMessage(e.message || 'Could not send email. Try again shortly.');
    }
    setSending(false);
  };

  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-3xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-amber-950">
            {isVendor ? 'Verify your email to start selling' : 'Verify your email to connect with practitioners'}
          </div>
          <p className="text-sm text-amber-900/80 mt-1">
            {isVendor
              ? 'Your practitioner dashboard is ready — confirm your email, then complete identity verification before your first listing goes live.'
              : 'Your portal is open — confirm your email before your first booking, order, or message with a practitioner.'}
          </p>
          <p className="text-xs text-amber-800/70 mt-1">
            Waiting for confirmation: <strong>{user?.email}</strong>
          </p>
          {message && <p className="text-xs text-emerald-800 mt-2">{message}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              checkedEmailRef.current = null;
              runCheck(true);
            }}
            className="px-4 py-2 border border-amber-300 bg-white rounded-2xl text-sm font-medium hover:bg-amber-100/50"
          >
            I verified — refresh
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={sending}
            className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm font-medium disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Resend email'}
          </button>
          <Link
            to={isVendor ? '/vendor-email-verify' : '/verify-email'}
            className="px-4 py-2 border border-[#4a1942] text-[#4a1942] rounded-2xl text-sm font-medium text-center hover:bg-white"
          >
            Verification page →
          </Link>
        </div>
      </div>
    </div>
  );
}