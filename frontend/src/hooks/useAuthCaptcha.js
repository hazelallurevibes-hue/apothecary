import { useState, useRef, useCallback } from 'react';
import { requireCaptchaToken } from '../lib/authSecurity';

export function useAuthCaptcha() {
  const captchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState('');

  const onCaptchaSuccess = useCallback((token) => {
    setCaptchaToken(token);
    setCaptchaError('');
  }, []);

  const onCaptchaExpire = useCallback(() => {
    setCaptchaToken(null);
  }, []);

  const onCaptchaError = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaError('Security check failed to load. Refresh and try again.');
  }, []);

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    captchaRef.current?.reset();
  }, []);

  const validateCaptcha = useCallback(() => {
    const err = requireCaptchaToken(captchaToken);
    if (err) setCaptchaError(err);
    return err;
  }, [captchaToken]);

  return {
    captchaRef,
    captchaToken,
    captchaError,
    setCaptchaError,
    onCaptchaSuccess,
    onCaptchaExpire,
    onCaptchaError,
    resetCaptcha,
    validateCaptcha,
  };
}