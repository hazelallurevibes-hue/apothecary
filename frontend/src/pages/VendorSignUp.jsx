import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { registerAuthUser, validatePasswordPair, mapAuthError } from '../lib/signupFlow';
import { finalizeSignupSession } from '../lib/auth';
import { runSecureAuthChecks } from '../lib/runSecureAuth';
import { useAuthCaptcha } from '../hooks/useAuthCaptcha';
import AuthCaptcha from '../components/AuthCaptcha';
import HoneypotField from '../components/HoneypotField';

export default function VendorSignUp({ onLogin }) {
  const formStartedAt = useRef(Date.now());
  const [businessName, setBusinessName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const captcha = useAuthCaptcha();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setMessage('You must agree to the Terms, Agreements, Privacy Policy and FAQ to apply.');
      return;
    }
    if (!businessName || !email || !password || !confirmPassword) {
      setMessage('Please provide business name, email, password, and password confirmation.');
      return;
    }
    const passwordError = validatePasswordPair(password, confirmPassword);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    const gate = runSecureAuthChecks({
      honeypot,
      formStartedAt: formStartedAt.current,
      validateCaptcha: captcha.validateCaptcha,
    });
    if (!gate.ok) {
      setMessage(gate.message);
      if (gate.suspicious) captcha.resetCaptcha();
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const signup = await registerAuthUser(email, password, {
        captchaToken: captcha.captchaToken,
      });

      const { data: application, error: rpcError } = await supabase.rpc('submit_vendor_application', {
        p_business_name: businessName,
        p_cuisine: cuisine || '',
        p_email: signup.email,
      });
      if (rpcError) throw rpcError;

      if (signup.session && onLogin) {
        const sessionProfile = await finalizeSignupSession(signup);
        onLogin(
          sessionProfile || {
            name: application?.name || businessName,
            email: application?.email || signup.email,
            role: application?.role || 'vendor',
            vendor_id: application?.vendor_id,
          },
        );
      }

      setMessage(
        signup.needsEmailConfirmation
          ? 'Application saved! Confirm your email, then sign in — admin will approve your vendor status after that.'
          : signup.session
            ? 'Application submitted! You are signed in — admin will approve your vendor status shortly.'
            : 'Application submitted! Sign in at /login while admin reviews your application.',
      );
      captcha.resetCaptcha();
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
      <h1 className="text-3xl font-bold tracking-tight mb-6">Vendor Sign Up</h1>
      <div className="bg-white border rounded-3xl p-8 relative">
        <form onSubmit={handleSignUp} className="space-y-4">
          <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          <input
            placeholder="Business / Farm name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full border p-3.5 rounded-2xl"
            required
          />
          <input
            placeholder="Cuisine / Product type (e.g. Mexican, Honey, Produce)"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full border p-3.5 rounded-2xl"
          />
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
          <label className="flex items-start gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5"
              required
            />
            <span>
              I agree to the <Link to="/agreements" className="underline">Terms &amp; Vendor Operating Agreement</Link>, <Link to="/policies-procedures" className="underline">Policies &amp; Procedures</Link>, and <Link to="/faq" className="underline">FAQ</Link>. I accept <strong>full liability</strong> for all products I sell, will not offer prohibited items (drugs, unlicensed alcohol, illicit goods), and understand violations may result in <strong>permanent ban</strong>.
            </span>
          </label>
          <button
            type="submit"
            disabled={loading || !agreedToTerms || passwordsMismatch}
            className="w-full py-3.5 bg-[#4a1942] text-white rounded-3xl font-semibold mt-2 disabled:opacity-70"
          >
            {loading ? 'Submitting...' : 'Submit Vendor Application'}
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