import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { registerAuthUser, validatePasswordPair, mapAuthError } from '../lib/signupFlow';
import { finalizeSignupSession } from '../lib/auth';
import { runSecureAuthChecks } from '../lib/runSecureAuth';
import { useAuthCaptcha } from '../hooks/useAuthCaptcha';
import AuthCaptcha from '../components/AuthCaptcha';
import HoneypotField from '../components/HoneypotField';
import MyLikesDislikesQuestionnaire from '../components/MyLikesDislikesQuestionnaire';
import { EMPTY_FOOD_PREFS, saveFoodPreferences } from '../lib/foodPreferences';

export default function CustomerSignUp({ onLogin }) {
  const formStartedAt = useRef(Date.now());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('signup');
  const [sessionProfile, setSessionProfile] = useState(null);
  const [foodPrefs, setFoodPrefs] = useState({ ...EMPTY_FOOD_PREFS });
  const [prefsSaving, setPrefsSaving] = useState(false);
  const captcha = useAuthCaptcha();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setMessage('You must agree to the Terms, Agreements, Privacy Policy and FAQ to sign up.');
      return;
    }
    if (!name || !email || !password || !confirmPassword) {
      setMessage('Please fill out all fields including password confirmation.');
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

      const { data: profile, error: rpcError } = await supabase.rpc('submit_customer_signup', {
        p_name: name,
        p_email: signup.email,
      });
      if (rpcError) throw rpcError;

      if (signup.session) {
        const resolved = await finalizeSignupSession(signup);
        const profileData = resolved || {
          name: profile?.name || name,
          email: profile?.email || signup.email,
          role: profile?.role || 'customer',
        };
        setSessionProfile(profileData);
        setStep('prefs');
        setMessage('Account created! Tell us what you like and avoid (optional).');
      } else {
        setMessage(
          signup.needsEmailConfirmation
            ? 'Account created! Check your email to confirm, then sign in at /login.'
            : 'Account created! You can sign in at /login.',
        );
      }
      captcha.resetCaptcha();
    } catch (err) {
      setMessage(mapAuthError(err));
      captcha.resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const finishSignup = (profileData) => {
    onLogin(profileData);
    setMessage('Welcome to Hazel Allure — heal with intention, shop with spirit!');
  };

  const savePrefsAndFinish = async () => {
    if (!sessionProfile?.email) return;
    setPrefsSaving(true);
    try {
      await saveFoodPreferences(sessionProfile.email, foodPrefs);
      finishSignup({
        ...sessionProfile,
        food_prefs_completed_at: new Date().toISOString(),
        diet_type: foodPrefs.diet_type,
        customer_region: foodPrefs.customer_region,
      });
    } catch (e) {
      setMessage(e.message);
    }
    setPrefsSaving(false);
  };

  if (step === 'prefs' && sessionProfile) {
    return (
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Likes &amp; Dislikes</h1>
        <p className="text-gray-600 mb-6 text-sm">Help local vendors serve you better. You can change this anytime in Account Settings.</p>
        <MyLikesDislikesQuestionnaire
          value={foodPrefs}
          onChange={setFoodPrefs}
          onSave={savePrefsAndFinish}
          saving={prefsSaving}
          compact
        />
        <button
          type="button"
          onClick={() => finishSignup(sessionProfile)}
          className="mt-4 w-full py-3 border rounded-3xl text-sm text-gray-600 hover:bg-gray-50"
        >
          Skip for now
        </button>
        {message && <p className="text-xs text-center mt-3 text-emerald-700">{message}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Customer Sign Up</h1>
      <div className="bg-white border rounded-3xl p-8 relative">
        <form onSubmit={handleSignUp} className="space-y-4">
          <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          <input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-3.5 rounded-2xl"
            required
          />
          <input
            placeholder="Email address"
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
              I agree to the <Link to="/agreements" className="underline">Terms</Link>, <Link to="/customer-use-agreement" className="underline">Customer Use Agreement</Link>, <Link to="/policies-procedures" className="underline">Policies &amp; Procedures</Link>, and <Link to="/faq" className="underline">FAQ</Link>. I will perform my own due diligence on vendors and food safety and assume all purchase risks.
            </span>
          </label>
          <button
            type="submit"
            disabled={loading || !agreedToTerms || passwordsMismatch}
            className="w-full py-3.5 bg-[#4a1942] text-white rounded-3xl font-semibold mt-2 disabled:opacity-70"
          >
            {loading ? 'Creating...' : 'Create Customer Account'}
          </button>
          {message && (
            <div
              className={`text-xs text-center ${message.includes('Welcome') ? 'text-emerald-700' : 'text-red-600'}`}
            >
              {message}
            </div>
          )}
        </form>
        <p className="text-center mt-4 text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-[#4a1942]">Log in</Link>
        </p>
      </div>
    </div>
  );
}