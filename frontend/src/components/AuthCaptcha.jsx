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
    return null;
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