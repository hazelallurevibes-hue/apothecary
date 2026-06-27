import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { signIn, resetPassword, finalizeSignupSession } from '../lib/auth';
import { registerAuthUser, validatePasswordPair, mapAuthError } from '../lib/signupFlow';
import { runSecureAuthChecks } from '../lib/runSecureAuth';
import { useAuthCaptcha } from '../hooks/useAuthCaptcha';
import AuthCaptcha from '../components/AuthCaptcha';
import HoneypotField from '../components/HoneypotField';
import { enableTestAccounts, LIVE_TEST_ACCOUNTS, auth0Enabled } from '../lib/config';
import Auth0LoginButton from '../components/Auth0LoginButton';
import Auth0ErrorBanner from '../components/Auth0ErrorBanner';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useLocale } from '../i18n';
import { VERTICAL } from '../lib/vertical';

export default function Login({ onLogin, loading }) {
  const { t } = useLocale();
  const formStartedAt = useRef(Date.now());
  const captcha = useAuthCaptcha();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [message, setMessage] = useState('');
  const [messageOk, setMessageOk] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFAMsg, setTwoFAMsg] = useState('');

  const doRealLogin = async (em, pwd, { captchaToken, skipCaptcha } = {}) => {
    try {
      const profile = await signIn(em, pwd, skipCaptcha ? {} : { captchaToken });
      onLogin(profile);
      captcha.resetCaptcha();
    } catch (e) {
      console.error('Login error:', e);
      setMessageOk(false);
      setMessage(mapAuthError(e) || e.message || 'Login failed. Check your email/password and try again.');
      captcha.resetCaptcha();
    }
  };

  const submit2FA = () => {
    if (!pendingUser?.email) return;
    if (twoFactorToken.length < 6) { setTwoFAMsg('Enter full 6-digit code'); return; }
    doRealLogin(pendingUser.email, twoFactorToken);
    setTimeout(() => { setNeeds2FA(false); setTwoFactorToken(''); }, 600);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageOk(false);
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
    try {
      if (isSignUp) {
        const passwordError = validatePasswordPair(password, confirmPassword);
        if (passwordError) throw new Error(passwordError);
        const signup = await registerAuthUser(email, password, {
          captchaToken: captcha.captchaToken,
        });
        const displayName = signup.email.split('@')[0] || 'Seeker';
        const { error: rpcError } = await supabase.rpc('submit_customer_signup', {
          p_name: displayName,
          p_email: signup.email,
        });
        if (rpcError) throw rpcError;
        if (signup.session) {
          const profile = await finalizeSignupSession(signup);
          if (profile) onLogin(profile);
          setMessageOk(true);
          setMessage('Welcome to Hazel Allure — you are signed in.');
        } else {
          setMessageOk(true);
          setMessage(
            signup.needsEmailConfirmation
              ? 'Sign up successful! Check your email to confirm, then sign in.'
              : 'Sign up successful! You can sign in now.',
          );
        }
        captcha.resetCaptcha();
      } else {
        await doRealLogin(email, password, { captchaToken: captcha.captchaToken });
      }
    } catch (e) {
      setMessageOk(false);
      setMessage(mapAuthError(e) || e.message || 'Authentication error. Please try again.');
      captcha.resetCaptcha();
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setMessageOk(false);
      setMessage('Please enter your email above first.');
      return;
    }
    const captchaErr = captcha.validateCaptcha();
    if (captchaErr) {
      setMessageOk(false);
      setMessage(captchaErr);
      return;
    }
    const { error } = await resetPassword(email, { captchaToken: captcha.captchaToken });
    setMessageOk(!error);
    setMessage(error ? mapAuthError(error) : 'Password reset link sent! Check your email.');
    captcha.resetCaptcha();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#4a1942] rounded-3xl mx-auto flex items-center justify-center mb-4">
            <span className="text-white text-4xl" aria-hidden="true">🌿</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter heading-font">{VERTICAL.name}</h1>
          <p className="text-gray-500 mt-2">{VERTICAL.tagline}</p>
          <p className="text-gray-400 text-sm mt-1">Healing services, apothecary goods &amp; the Teaching Sanctum</p>
        </div>

        <div className="bg-white border rounded-3xl p-8 shadow-sm">
          <h2 className="font-semibold text-xl mb-6 text-center">{t('auth.signIn')}</h2>

          {!needs2FA && (
            <>
              <div className="text-center text-sm text-gray-500 mb-4">
                {auth0Enabled ? 'Sign in securely with Auth0 or Google, or use email below' : t('auth.signInSubtitle')}
              </div>

              <div className="mb-4 space-y-3">
                <GoogleLoginButton disabled={loading} />
                {auth0Enabled && (
                  <>
                    <Auth0ErrorBanner />
                    <Auth0LoginButton disabled={loading} />
                  </>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{t('auth.orEmail')}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </div>

              <form onSubmit={handleAuth} className="space-y-3 relative">
                <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                <input
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border p-3.5 rounded-2xl text-sm" 
                  required 
                />
                <input 
                  type="password" 
                  placeholder={isSignUp ? 'Password (min 6 characters)' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border p-3.5 rounded-2xl text-sm"
                  minLength={isSignUp ? 6 : undefined}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required 
                />
                {isSignUp && (
                  <>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full border p-3.5 rounded-2xl text-sm ${confirmPassword && password !== confirmPassword ? 'border-red-400' : ''}`}
                      minLength={6}
                      autoComplete="new-password"
                      required
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-600">Passwords do not match.</p>
                    )}
                  </>
                )}
                <AuthCaptcha
                  ref={captcha.captchaRef}
                  onSuccess={captcha.onCaptchaSuccess}
                  onExpire={captcha.onCaptchaExpire}
                  onError={captcha.onCaptchaError}
                />
                {captcha.captchaError && (
                  <p className="text-xs text-red-600">{captcha.captchaError}</p>
                )}
                {isSignUp && (
                  <label className="flex items-start gap-2 text-xs text-gray-600">
                    <input 
                      type="checkbox" 
                      checked={agreedToTerms} 
                      onChange={(e) => setAgreedToTerms(e.target.checked)} 
                      className="mt-0.5" 
                      required 
                    />
                    <span>
                      I agree to the <Link to="/agreements" className="underline">Terms</Link>, <Link to="/policies-procedures" className="underline">Policies &amp; Procedures</Link>, and <Link to="/faq" className="underline">FAQ</Link>. I understand Hazel Allure does not verify practitioner credentials or product outcomes; practitioners and seekers bear sole responsibility and liability.
                    </span>
                  </label>
                )}
                <button 
                  type="submit"
                  disabled={loading || (isSignUp && (!agreedToTerms || (confirmPassword && password !== confirmPassword)))}
                  className="w-full py-3.5 bg-[#4a1942] text-white rounded-3xl font-semibold disabled:opacity-70"
                >
                  {loading ? t('auth.processing') : (isSignUp ? t('auth.signUp') : t('auth.signInBtn'))}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAgreedToTerms(false);
                    setConfirmPassword('');
                    captcha.resetCaptcha();
                    formStartedAt.current = Date.now();
                  }}
                  className="text-xs text-[#4a1942] underline"
                >
                  {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}
                </button>
                <button 
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-xs text-gray-500 underline block"
                >
                  {t('auth.forgotPassword')}
                </button>
                {message && (
                  <div className={`text-xs text-center ${messageOk ? 'text-emerald-600' : 'text-red-600'}`}>
                    {message}
                  </div>
                )}
              </form>
            </>
          )}

          {needs2FA && pendingUser && (
            <div>
              <div className="text-center mb-4">
                <div className="text-2xl mb-1">🔐</div>
                <div className="font-semibold">Two-Factor Required</div>
                <div className="text-sm text-gray-500">for {pendingUser.email}</div>
              </div>
              <input value={twoFactorToken} onChange={e=>setTwoFactorToken(e.target.value.replace(/\D/g,''))} maxLength={6} placeholder="123456" className="w-full text-center border p-4 rounded-3xl font-mono tracking-[8px] text-2xl" />
              <button onClick={submit2FA} className="mt-3 w-full py-3 bg-emerald-700 text-white rounded-3xl font-semibold">Verify Code &amp; Sign In</button>
              <button onClick={()=>{setNeeds2FA(false); setTwoFactorToken(''); setPendingUser(null);}} className="mt-2 w-full text-xs text-gray-500">Cancel / Use different account</button>
              {twoFAMsg && <div className="mt-3 text-xs text-center text-emerald-600">{twoFAMsg}</div>}
              <div className="text-[10px] text-center text-gray-400 mt-4">Enter any 6-digit code if 2FA is enabled for the account in Supabase.</div>
            </div>
          )}

          {enableTestAccounts && LIVE_TEST_ACCOUNTS.length > 0 && !needs2FA && (
            <div className="mt-6 pt-6 border-t">
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 text-center">Live test accounts</div>
              <div className="grid grid-cols-2 gap-2">
                {LIVE_TEST_ACCOUNTS.map((acct) => (
                  <button
                    key={acct.email}
                    type="button"
                    disabled={loading}
                    onClick={() => doRealLogin(acct.email, acct.password, { skipCaptcha: true })}
                    className={`py-2.5 px-3 text-white text-xs font-semibold rounded-2xl ${acct.color} disabled:opacity-60`}
                  >
                    {acct.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3">For staging/live QA only. Disable with VITE_ENABLE_TEST_ACCOUNTS=false before public launch.</p>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#4a1942] font-medium">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}