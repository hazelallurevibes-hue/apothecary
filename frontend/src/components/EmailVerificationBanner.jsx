import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkEmailVerified, resendVerificationEmail } from '../lib/emailVerification';

export default function EmailVerificationBanner({ user, variant = 'customer' }) {
  const [verified, setVerified] = useState(null);
  const [checking, setChecking] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = async () => {
    if (!user?.email) {
      setVerified(null);
      setChecking(false);
      return;
    }
    setChecking(true);
    const ok = await checkEmailVerified(user);
    setVerified(ok);
    setChecking(false);
  };

  useEffect(() => {
    refresh();
  }, [user?.email, user?.auth_provider]);

  if (checking || verified) return null;

  const isVendor = variant === 'vendor';

  const resend = async () => {
    setSending(true);
    setMessage('');
    try {
      await resendVerificationEmail(user.email);
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
            onClick={refresh}
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
            to="/verify-email"
            className="px-4 py-2 border border-[#4a1942] text-[#4a1942] rounded-2xl text-sm font-medium text-center hover:bg-white"
          >
            Verification page →
          </Link>
        </div>
      </div>
    </div>
  );
}