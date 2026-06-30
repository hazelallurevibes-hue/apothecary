import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { registerAuthUser, validatePasswordPair, mapAuthError } from '../lib/signupFlow';
import { finalizeSignupSession, ensureOAuthUserProfile } from '../lib/auth';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { googleSignInEnabled } from '../lib/config';
import { runSecureAuthChecks } from '../lib/runSecureAuth';
import { useAuthCaptcha } from '../hooks/useAuthCaptcha';
import AuthCaptcha from '../components/AuthCaptcha';
import HoneypotField from '../components/HoneypotField';
import { PRACTITIONER_SPECIALTY_GROUPS } from '../lib/wellnessPreferences';

export default function VendorSignUp({ onLogin }) {
  const formStartedAt = useRef(Date.now());
  const [businessName, setBusinessName] = useState('');
  const [specialtyChoice, setSpecialtyChoice] = useState('');
  const [specialtyOther, setSpecialtyOther] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleMode, setGoogleMode] = useState(false);
  const captcha = useAuthCaptcha();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user?.email) return;
      const oauthEmail = session.user.email.trim().toLowerCase();
      setEmail(oauthEmail);
      setGoogleMode(true);
      const meta = session.user.user_metadata || {};
      const suggestedName = meta.full_name || meta.name || '';
      if (suggestedName && !businessName) setBusinessName(suggestedName);
    });
  }, []);

  const resolvedSpecialty = specialtyChoice === 'Other'
    ? specialtyOther.trim()
    : specialtyChoice;

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setMessage('You must agree to the Terms, Agreements, Privacy Policy, and FAQ to apply.');
      return;
    }
    if (!businessName || !email) {
      setMessage('Please provide your practice or business name and email.');
      return;
    }
    if (!googleMode) {
      if (!password || !confirmPassword) {
        setMessage('Please provide password and password confirmation.');
        return;
      }
      const passwordError = validatePasswordPair(password, confirmPassword);
      if (passwordError) {
        setMessage(passwordError);
        return;
      }
    }

    const gate = runSecureAuthChecks({
      honeypot,
      formStartedAt: formStartedAt.current,
      validateCaptcha: googleMode ? () => null : captcha.validateCaptcha,
    });
    if (!gate.ok) {
      setMessage(gate.message);
      if (gate.suspicious) captcha.resetCaptcha();
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      let applicantEmail = email.trim().toLowerCase();
      let activeSession = null;

      if (googleMode) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) {
          throw new Error('Sign in with Google first, then complete your practitioner application.');
        }
        activeSession = session;
        applicantEmail = session.user.email.trim().toLowerCase();
      } else {
        const signup = await registerAuthUser(email, password, {
          captchaToken: captcha.captchaToken,
        });
        applicantEmail = signup.email;
        activeSession = signup.session;

        if (signup.needsEmailConfirmation && !signup.session) {
          const { error: rpcError } = await supabase.rpc('submit_vendor_application', {
            p_business_name: businessName,
            p_cuisine: resolvedSpecialty || '',
            p_email: applicantEmail,
          });
          if (rpcError) throw rpcError;
          setMessage('Application saved! Confirm your email, then sign in — admin will approve your practitioner status after that.');
          captcha.resetCaptcha();
          return;
        }
      }

      const { data: application, error: rpcError } = await supabase.rpc('submit_vendor_application', {
        p_business_name: businessName,
        p_cuisine: resolvedSpecialty || '',
        p_email: applicantEmail,
      });
      if (rpcError) throw rpcError;

      if (activeSession && onLogin) {
        const sessionProfile = googleMode
          ? await ensureOAuthUserProfile(activeSession)
          : await finalizeSignupSession({ email: applicantEmail, session: activeSession });
        onLogin(
          {
            ...(sessionProfile || {}),
            name: application?.name || businessName,
            email: application?.email || applicantEmail,
            role: application?.role || 'vendor',
            vendor_id: application?.vendor_id,
          },
        );
      }

      setMessage(
        activeSession
          ? 'Application submitted! You are signed in — admin will approve your practitioner status shortly.'
          : 'Application submitted! Sign in at /login while admin reviews your application.',
      );
      if (!googleMode) captcha.resetCaptcha();
    } catch (err) {
      setMessage(mapAuthError(err));
      captcha.resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const successMessage = message.includes('submitted') || message.includes('saved') || message.includes('signed in');

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Practitioner Sign Up</h1>
      <div className="bg-white border rounded-3xl p-8 relative">
        {!googleMode && googleSignInEnabled && (
          <>
            <GoogleLoginButton redirectPath="/vendor-signup" disabled={loading} />
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or apply with email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </>
        )}
        {googleMode && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 mb-4">
            Signed in with Google as <strong>{email}</strong>. Complete your practitioner details below.
          </p>
        )}
        <form onSubmit={handleSignUp} className="space-y-4">
          <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          <input
            placeholder="Practice or business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full border p-3.5 rounded-2xl"
            required
          />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Specialty</label>
            <select
              value={specialtyChoice}
              onChange={(e) => setSpecialtyChoice(e.target.value)}
              className="w-full border p-3.5 rounded-2xl"
            >
              <option value="">Select a specialty (optional)</option>
              {PRACTITIONER_SPECIALTY_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </optgroup>
              ))}
              <option value="Other">Other</option>
            </select>
            {specialtyChoice === 'Other' && (
              <input
                placeholder="Describe your specialty (e.g. Curandera, Reiki master, herbal apothecary)"
                value={specialtyOther}
                onChange={(e) => setSpecialtyOther(e.target.value)}
                className="w-full border p-3.5 rounded-2xl mt-2"
              />
            )}
          </div>
          {!googleMode && (
            <>
              <input
                placeholder="Contact email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-3.5 rounded-2xl"
                type="email"
                required
              />
              <input
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-3.5 rounded-2xl"
                type="password"
                minLength={6}
                autoComplete="new-password"
                required
              />
              <div>
                <input
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full border p-3.5 rounded-2xl ${passwordsMismatch ? 'border-red-400' : ''}`}
                  type="password"
                  minLength={6}
                  autoComplete="new-password"
                  required
                />
                {passwordsMismatch && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match.</p>
                )}
              </div>
              <AuthCaptcha
                ref={captcha.captchaRef}
                onSuccess={captcha.onCaptchaSuccess}
                onExpire={captcha.onCaptchaExpire}
                onError={captcha.onCaptchaError}
              />
              {captcha.captchaError && (
                <p className="text-xs text-red-600">{captcha.captchaError}</p>
              )}
            </>
          )}
          <label className="flex items-start gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5"
              required
            />
            <span>
              I agree to the <Link to="/agreements" className="underline">Terms &amp; Practitioner Operating Agreement</Link>, <Link to="/policies-procedures" className="underline">Policies &amp; Procedures</Link>, and <Link to="/faq" className="underline">FAQ</Link>. I accept <strong>full liability</strong> for all services and goods I offer, will not offer prohibited items (drugs, unlicensed alcohol, illicit goods), and understand violations may result in <strong>permanent ban</strong>.
            </span>
          </label>
          <button
            type="submit"
            disabled={loading || !agreedToTerms || (!googleMode && passwordsMismatch)}
            className="w-full py-3.5 bg-[#4a1942] text-white rounded-3xl font-semibold mt-2 disabled:opacity-70"
          >
            {loading ? 'Submitting...' : 'Submit Practitioner Application'}
          </button>
          {message && (
            <div className={`text-xs text-center ${successMessage ? 'text-emerald-700' : 'text-red-600'}`}>
              {message}
            </div>
          )}
        </form>
        <p className="text-center mt-4 text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-[#4a1942]">Log in</Link>
        </p>
        <p className="text-center text-xs text-gray-500 mt-3">Applications are reviewed by admins. You will be notified when approved.</p>
      </div>
    </div>
  );
}