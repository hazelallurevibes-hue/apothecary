import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorContext } from '../lib/plans';
import {
  refreshEmailVerificationStatus,
  resendVerificationEmail,
  writeEmailVerifiedCache,
} from '../lib/emailVerification';
import { markOnboardingStep } from '../lib/onboardingApi';
import { supabase } from '../lib/supabaseClient';

/**
 * Seeker email verification landing page.
 * Magic-link + "I verified — refresh status" both force server-side recognition.
 */
export default function EmailVerifyPage({ user, onProfileUpdate }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const isVendor = user?.role === 'vendor' || !!vendorId;
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [justVerified, setJustVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [displayEmail, setDisplayEmail] = useState(user?.email || '');

  const finalizeVerified = async (email) => {
    const e = (email || user?.email || '').trim();
    if (e) {
      writeEmailVerifiedCache(e, true);
      setDisplayEmail(e);
    }
    setVerified(true);
    setJustVerified(true);
    setMessage('');
    if (vendorId) {
      await markOnboardingStep(vendorId, 'verify_email', true).catch(() => {});
    }
    if (onProfileUpdate) {
      onProfileUpdate({
        ...(user || {}),
        email: e || user?.email,
        email_verified: true,
      });
    }
    window.dispatchEvent(new CustomEvent('hazel-email-verified', { detail: { email: e } }));
  };

  const refresh = async () => {
    setChecking(true);
    setMessage('');
    try {
      const result = await refreshEmailVerificationStatus(user);
      if (result.verified) {
        await finalizeVerified(result.email || user?.email);
      } else {
        setVerified(false);
        setMessage(
          result.message ||
            'Still not verified. Open the link in your Hazel Allure email first, then try again.',
        );
      }
    } catch (e) {
      setVerified(false);
      setMessage(e?.message || 'Could not check verification. Try again.');
    }
    setChecking(false);
  };

  useEffect(() => {
    refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        // Re-run full refresh so server marks users.email_verified
        const result = await refreshEmailVerificationStatus({
          ...user,
          email: session?.user?.email || user?.email,
        });
        if (result.verified) {
          await finalizeVerified(result.email);
          setChecking(false);
        }
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const resend = async () => {
    if (!user?.email) {
      setMessage('Sign in first, then resend the verification email.');
      return;
    }
    setSending(true);
    setMessage('');
    try {
      await resendVerificationEmail(user.email, { role: isVendor ? 'vendor' : 'customer' });
      setMessage(
        'Sent from Hazel Allure — open that email and tap “Verify my email”, then return here and press refresh.',
      );
    } catch (e) {
      setMessage(e.message || 'Could not send email. Try again in a few minutes.');
    }
    setSending(false);
  };

  const dashboardPath = isVendor ? '/vendor-dashboard' : '/customer-portal';

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-[#4a1942]">Verify your email</h1>
      <p className="text-sm text-gray-600 mb-6">
        {isVendor
          ? 'Step 1 of your practitioner launch checklist.'
          : 'One quick step before your first booking or order with a practitioner.'}
      </p>

      <div className="bg-white border rounded-3xl p-8 text-center shadow-sm">
        {checking ? (
          <p className="text-gray-500">Checking verification status…</p>
        ) : verified ? (
          <>
            <div className="text-4xl mb-3" aria-hidden>✅</div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-700 font-bold mb-2">
              {justVerified ? 'Just confirmed' : 'Verified'}
            </p>
            <p className="font-semibold text-lg text-emerald-900">Email verified</p>
            <p className="text-sm text-emerald-800 mt-2">
              Hazel Allure recognizes <strong>{displayEmail || user?.email || 'your email'}</strong> as confirmed.
              You can book, order, and message practitioners.
            </p>
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 text-left">
              <p className="font-medium">✓ System status: verified</p>
              <p className="text-xs mt-1 text-emerald-800/80">
                Saved on your account. The amber verify banner will clear automatically.
              </p>
            </div>
            {isVendor ? (
              <Link
                to="/vendor-safety-acceptance"
                className="inline-block mt-6 px-6 py-3 bg-[#4a1942] text-white rounded-2xl text-sm font-medium"
              >
                Next: Safety policies →
              </Link>
            ) : (
              <div className="mt-6 flex flex-col gap-2">
                <Link
                  to={dashboardPath}
                  className="inline-block px-6 py-3 bg-[#4a1942] text-white rounded-2xl text-sm font-medium"
                >
                  Continue to Seeker Portal →
                </Link>
                <Link to="/" className="text-sm text-[#4a1942] font-medium hover:underline">
                  Browse the apothecary
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-4xl mb-3" aria-hidden>✉️</div>
            <p className="text-gray-700 mb-2">
              Confirm <strong>{user?.email || 'your email'}</strong> to continue.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              1) Open the message from <strong>Hazel Allure</strong><br />
              2) Tap <strong>Verify my email</strong><br />
              3) You should land back here — or press the button below to sync status
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={checking}
                className="py-3 border-2 border-[#4a1942] bg-white rounded-2xl text-sm font-semibold text-[#4a1942] hover:bg-[#faf7f9] disabled:opacity-60"
              >
                {checking ? 'Checking…' : 'I verified — refresh status'}
              </button>
              <button
                type="button"
                onClick={resend}
                disabled={sending || !user?.email}
                className="py-3 bg-[#4a1942] text-white rounded-2xl text-sm font-medium disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Resend verification email'}
              </button>
              <Link
                to={dashboardPath}
                className="py-3 text-sm text-[#4a1942] font-medium hover:underline"
              >
                Return to dashboard (browse only until verified)
              </Link>
            </div>
          </>
        )}
        {message && (
          <p className="mt-4 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
