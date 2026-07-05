import { useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { registerAuthUser, validatePasswordPair, mapAuthError } from '../lib/signupFlow';
import { finalizeSignupSession, ensureOAuthUserProfile } from '../lib/auth';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { googleSignInEnabled } from '../lib/config';
import { runSecureAuthChecks } from '../lib/runSecureAuth';
import { isCaptchaEnabled } from '../lib/authSecurity';

import { useAuthCaptcha } from '../hooks/useAuthCaptcha';
import AuthCaptcha from '../components/AuthCaptcha';
import HoneypotField from '../components/HoneypotField';
import MyLikesDislikesQuestionnaire from '../components/MyLikesDislikesQuestionnaire';
import { EMPTY_FOOD_PREFS, saveFoodPreferences } from '../lib/foodPreferences';
import {
  SEEKER_OATH_ATTESTATIONS,
  allSeekerOathChecked,
  emptySeekerOathState,
} from '../lib/seekerOathPledge';
import { logSeekerOathAcceptance } from '../lib/seekerOathApi';
import PasswordInput from '../components/PasswordInput';

export default function CustomerSignUp({ onLogin }) {
  const [searchParams] = useSearchParams();
  const formStartedAt = useRef(Date.now());
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [seekerOath, setSeekerOath] = useState(emptySeekerOathState());
  const [oathLogged, setOathLogged] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('signup');
  const [sessionProfile, setSessionProfile] = useState(null);
  const [foodPrefs, setFoodPrefs] = useState({ ...EMPTY_FOOD_PREFS });
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [googleMode, setGoogleMode] = useState(false);
  const captcha = useAuthCaptcha();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user?.email) return;
      const oauthEmail = session.user.email.trim().toLowerCase();
      const meta = session.user.user_metadata || {};
      const displayName =
        meta.full_name ||
        meta.name ||
        `${meta.given_name || ''} ${meta.family_name || ''}`.trim() ||
        oauthEmail.split('@')[0];

      setGoogleMode(true);
      setEmail(oauthEmail);
      if (!name) setName(displayName);

      const profile = await ensureOAuthUserProfile(session);
      if (profile) {
        setSessionProfile(profile);
        setStep('prefs');
        setMessage('Signed in with Google! Share your wellness preferences (optional).');
      }
    });
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setMessage('You must agree to the Terms, Agreements, Privacy Policy, and FAQ to sign up.');
      return;
    }
    if (!allSeekerOathChecked(seekerOath)) {
      setMessage('You must acknowledge every Seeker oath item below.');
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
        role: 'customer',
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
        try {
          await logSeekerOathAcceptance({ userEmail: profileData.email, attestations: seekerOath });
          setOathLogged(true);
        } catch {
          /* migration 32 may be pending */
        }
        setSessionProfile(profileData);
        setStep('prefs');
        setMessage('Account created! Share your wellness preferences (optional).');
      } else {
        setMessage(
          signup.needsEmailConfirmation
            ? `Account created! We sent a confirmation link to ${signup.email} — check inbox and spam, then sign in. Use Resend on the verification page if it does not arrive.`
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
    if (googleMode && !oathLogged && !allSeekerOathChecked(seekerOath)) {
      setMessage('Please acknowledge every Seeker oath item before continuing.');
      return;
    }
    setPrefsSaving(true);
    try {
      if (googleMode && !oathLogged) {
        try {
          await logSeekerOathAcceptance({ userEmail: sessionProfile.email, attestations: seekerOath });
          setOathLogged(true);
        } catch {
          /* migration 32 may be pending */
        }
      }
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">Wellness Preferences</h1>
        <p className="text-gray-600 mb-6 text-sm">Help practitioners and artisans tailor offerings to your intentions. You can change this anytime in Account Settings.</p>
        {googleMode && !oathLogged && (
          <div className="mb-6 p-4 border rounded-2xl bg-[#faf7f9] space-y-2">
            <p className="text-xs font-semibold text-[#4a1942] uppercase tracking-wide">Seeker oath</p>
            {SEEKER_OATH_ATTESTATIONS.map((a) => (
              <label key={a.id} className="flex items-start gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={!!seekerOath[a.id]}
                  onChange={() => setSeekerOath((c) => ({ ...c, [a.id]: !c[a.id] }))}
                  className="mt-0.5 shrink-0"
                />
                <span>{a.label}</span>
              </label>
            ))}
          </div>
        )}
        <MyLikesDislikesQuestionnaire
          value={foodPrefs}
          onChange={setFoodPrefs}
          onSave={savePrefsAndFinish}
          saving={prefsSaving}
          compact
        />
        <button
          type="button"
          onClick={() => {
            if (googleMode && !oathLogged && !allSeekerOathChecked(seekerOath)) {
              setMessage('Please acknowledge every Seeker oath item before continuing.');
              return;
            }
            finishSignup(sessionProfile);
          }}
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
      <h1 className="text-3xl font-bold tracking-tight mb-6">Seeker Sign Up</h1>
      <div className="bg-white border rounded-3xl p-8 relative">
        {!googleMode && googleSignInEnabled && (
          <>
            <GoogleLoginButton redirectPath="/customer-signup" disabled={loading} />
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or sign up with email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </>
        )}
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
          <PasswordInput
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            autoComplete="new-password"
            inputClassName="text-base"
          />
          <div>
            <PasswordInput
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              autoComplete="new-password"
              error={passwordsMismatch}
              inputClassName="text-base"
            />
            {passwordsMismatch && (
              <p className="text-xs text-red-600 mt-1">Passwords do not match.</p>
            )}
          </div>
          {isCaptchaEnabled() && (
            <>
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
              I agree to the <Link to="/agreements" className="underline">Terms</Link>, <Link to="/customer-use-agreement" className="underline">Customer Use Agreement</Link>, <Link to="/policies-procedures" className="underline">Policies &amp; Procedures</Link>, and <Link to="/faq" className="underline">FAQ</Link>. I will perform my own due diligence on practitioners and apothecary goods and assume all booking and purchase risks.
            </span>
          </label>
          <div className="p-4 border rounded-2xl bg-[#faf7f9] space-y-2">
            <p className="text-xs font-semibold text-[#4a1942] uppercase tracking-wide">Seeker oath</p>
            {SEEKER_OATH_ATTESTATIONS.map((a) => (
              <label key={a.id} className="flex items-start gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={!!seekerOath[a.id]}
                  onChange={() => setSeekerOath((c) => ({ ...c, [a.id]: !c[a.id] }))}
                  className="mt-0.5 shrink-0"
                />
                <span>{a.label}</span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading || !agreedToTerms || !allSeekerOathChecked(seekerOath) || passwordsMismatch}
            className="w-full py-3.5 bg-[#4a1942] text-white rounded-3xl font-semibold mt-2 disabled:opacity-70"
          >
            {loading ? 'Creating...' : 'Create Seeker Account'}
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
          Applying as a practitioner?{' '}
          <Link to="/vendor-signup" className="text-[#4a1942] font-medium hover:underline">Vendor sign up</Link>
        </p>
        <p className="text-center mt-2 text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-[#4a1942]">Log in</Link>
        </p>
      </div>
    </div>
  );
}