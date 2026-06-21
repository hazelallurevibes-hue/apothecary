import { useRef, useImperativeHandle, forwardRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { getTurnstileSiteKey, isCaptchaEnabled } from '../lib/authSecurity';

const AuthCaptcha = forwardRef(function AuthCaptcha({ onSuccess, onExpire, onError, className = '' }, ref) {
  const turnstileRef = useRef(null);
  const siteKey = getTurnstileSiteKey();

  useImperativeHandle(ref, () => ({
    reset() {
      turnstileRef.current?.reset();
    },
  }));

  if (!isCaptchaEnabled()) {
    return (
      <p className={`text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 ${className}`}>
        CAPTCHA not configured — set <code className="text-[9px]">VITE_TURNSTILE_SITE_KEY</code> and enable CAPTCHA in Supabase Auth.
      </p>
    );
  }

  return (
    <div className={className}>
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={(token) => onSuccess?.(token)}
        onExpire={() => onExpire?.()}
        onError={() => onError?.()}
        options={{ theme: 'light', size: 'normal' }}
      />
    </div>
  );
});

export default AuthCaptcha;