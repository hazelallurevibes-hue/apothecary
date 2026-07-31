import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorContext } from '../lib/plans';
import {
  checkEmailVerified,
  consumeEmailVerifyCallback,
  markEmailVerifiedInSystem,
  resendVerificationEmail,
  writeEmailVerifiedCache,
} from '../lib/emailVerification';
import { markOnboardingStep } from '../lib/onboardingApi';
import { supabase } from '../lib/supabaseClient';

export default function VendorEmailVerify({ user, onProfileUpdate }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [justVerified, setJustVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [displayEmail, setDisplayEmail] = useState(user?.email || '');

  const finalizeVerified = async (email) => {
    const e = email || user?.email;
    if (e) {
      await markEmailVerifiedInSystem(e);
      writeEmailVerifiedCache(e, true);
      setDisplayEmail(e);
    }
    setVerified(true);
    setJustVerified(true);
    if (vendorId) {
      await markOnboardingStep(vendorId, 'verify_email', true).catch(() => {});
    }
    if (onProfileUpdate && user) {
      onProfileUpdate({ ...user, email_verified: true });
    }
    window.dispatchEvent(new CustomEvent('hazel-email-verified', { detail: { email: e } }));
  };

  const refresh = async () => {
    setChecking(true);
    const cb = await consumeEmailVerifyCallback();
    if (cb.verified) {
      await finalizeVerified(cb.email || user?.email);
      setChecking(false);
      return;
    }
    const ok = await checkEmailVerified(user);
    if (ok) await finalizeVerified(user?.email);
    else setVerified(false);
    setChecking(false);
  };

  useEffect(() => {
    refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        const u = session?.user;
        if (u?.email && (u.email_confirmed_at || u.confirmed_at)) {
          await finalizeVerified(u.email);
          setChecking(false);
        }
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const resend = async () => {
    if (!user?.email) return;
    setSending(true);
    setMessage('');
    try {
      await resendVerificationEmail(user.email, { role: 'vendor' });
      setMessage('Sent from Hazel Allure — check inbox and spam.');
    } catch (e) {
      setMessage(e.message || 'Could not send email.');
    }
    setSending(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-[#4a1942]">Verify your email</h1>
      <p className="text-sm text-gray-600 mb-6">Step 1 of your practitioner launch checklist.</p>

      <div className="bg-white border rounded-3xl p-8 text-center shadow-sm">
        {checking ? (
          <p className="text-gray-500">Checking verification status…</p>
        ) : verified ? (
          <>
            <div className="text-4xl mb-3">✅</div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-700 font-bold mb-2">
              {justVerified ? 'Just confirmed' : 'Verified'}
            </p>
            <p className="font-semibold text-lg text-emerald-900">Email verified</p>
            <p className="text-sm text-emerald-800 mt-2">
              Hazel Allure recognizes <strong>{displayEmail || user?.email}</strong> as confirmed.
            </p>
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 text-left">
              <p className="font-medium">✓ System status: verified</p>
              <p className="text-xs mt-1">Checklist step “verify email” is complete.</p>
            </div>
            <Link
              to="/vendor-safety-acceptance"
              className="inline-block mt-6 px-6 py-3 bg-[#4a1942] text-white rounded-2xl text-sm font-medium"
            >
              Next: Safety policies →
            </Link>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">✉️</div>
            <p className="text-gray-700 mb-2">Confirm <strong>{user?.email}</strong> before continuing.</p>
            <p className="text-xs text-gray-500 mb-6">
              Open the Hazel Allure email, tap verify, and you will return here with a success message.
            </p>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={refresh} className="py-3 border rounded-2xl text-sm font-medium hover:bg-gray-50">
                I verified — refresh status
              </button>
              <button
                type="button"
                onClick={resend}
                disabled={sending}
                className="py-3 bg-[#4a1942] text-white rounded-2xl text-sm font-medium disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Resend verification email'}
              </button>
            </div>
          </>
        )}
        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
