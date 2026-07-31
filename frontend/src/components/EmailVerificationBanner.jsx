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

/**
 * Amber verification banner with Resend.
 * forceShow: parent (e.g. listing gate) forces the banner visible even while check is pending
 * statusMessage: e.g. "We just re-sent…" after auto-resend on product post
 */
export default function EmailVerificationBanner({
  user,
  variant = 'customer',
  forceShow = false,
  statusMessage = '',
  onDismissForce,
}) {
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
    if (statusMessage) setMessage(statusMessage);
  }, [statusMessage]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      if (!sessionUser?.email || !user?.email) return;
      if (sessionUser.email.trim().toLowerCase() !== user.email.trim().toLowerCase()) return;
      if (sessionUser.email_confirmed_at || sessionUser.confirmed_at) {
        writeEmailVerifiedCache(user.email, true);
        setVerified(true);
        onDismissForce?.();
      }
    });
    return () => subscription.unsubscribe();
  }, [user?.email, onDismissForce]);

  // Show when we know email is unverified, OR parent forces it (listing blocked)
  const show = verified === false || (forceShow && verified !== true);
  if (!show) return null;

  const isVendor = variant === 'vendor';

  const resend = async () => {
    setSending(true);
    setMessage('');
    try {
      await resendVerificationEmail(user.email, { role: isVendor ? 'vendor' : 'customer' });
      setMessage(
        'Verification email sent from Hazel Allure — check inbox and spam/junk (subject: “Verify your email — Hazel Allure”).',
      );
    } catch (e) {
      setMessage(e.message || 'Could not send email. Try again shortly, or contact support.');
    }
    setSending(false);
  };

  // Auto-resend once when forceShow flips on and we have an email (parent may have already resent;
  // this is a no-op path if user only landed with forceShow — parent handles primary resend)
  useEffect(() => {
    if (!forceShow || !user?.email || verified === true) return;
    // Scroll into view when forced
    requestAnimationFrame(() => {
      document.getElementById('email-verify-banner')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [forceShow, user?.email, verified]);

  return (
    <div
      id="email-verify-banner"
      className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm sticky top-2 z-20"
      role="alert"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-amber-950">
            {isVendor ? 'Verify your email to start selling' : 'Verify your email to connect with practitioners'}
          </div>
          <p className="text-sm text-amber-900/80 mt-1">
            {isVendor
              ? 'Your practitioner dashboard is ready — confirm your email, then complete identity verification before your first listing goes live. We can re-send the confirmation link with one tap.'
              : 'Your portal is open — confirm your email before your first booking, order, or message with a practitioner.'}
          </p>
          <p className="text-xs text-amber-800/70 mt-1">
            Waiting for confirmation: <strong>{user?.email || 'your account email'}</strong>
          </p>
          {message && (
            <p className="text-sm text-emerald-900 mt-2 font-medium bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              {message}
            </p>
          )}
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
            disabled={sending || !user?.email}
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
