import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorContext } from '../lib/plans';
import { checkEmailVerified, resendVerificationEmail } from '../lib/emailVerification';
import { markOnboardingStep } from '../lib/onboardingApi';

export default function VendorEmailVerify({ user }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const refresh = async () => {
    setChecking(true);
    const ok = await checkEmailVerified(user);
    setVerified(ok);
    if (ok && vendorId) {
      await markOnboardingStep(vendorId, 'verify_email', true).catch(() => {});
    }
    setChecking(false);
  };

  useEffect(() => {
    refresh();
  }, [user?.email]);

  const resend = async () => {
    if (!user?.email) return;
    setSending(true);
    setMessage('');
    try {
      await resendVerificationEmail(user.email);
      setMessage('Verification email sent — check your inbox and spam folder.');
    } catch (e) {
      setMessage(e.message || 'Could not send email. Try logging out and back in.');
    }
    setSending(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-2">Verify your email</h1>
      <p className="text-sm text-gray-600 mb-6">Step 1 of your vendor launch checklist.</p>

      <div className="bg-white border rounded-3xl p-8 text-center">
        {checking ? (
          <p className="text-gray-500">Checking status…</p>
        ) : verified ? (
          <>
            <div className="text-4xl mb-3">✅</div>
            <p className="font-medium text-emerald-800">Email verified for {user?.email}</p>
            <Link to="/vendor-safety-acceptance" className="inline-block mt-6 px-6 py-3 bg-[#4a1942] text-white rounded-2xl text-sm font-medium">
              Next: Safety policies →
            </Link>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">✉️</div>
            <p className="text-gray-700 mb-2">Confirm <strong>{user?.email}</strong> before continuing.</p>
            <p className="text-xs text-gray-500 mb-6">Click the link in your signup email, then press refresh below.</p>
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