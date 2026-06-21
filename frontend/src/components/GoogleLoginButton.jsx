import { useState } from 'react';
import { signInWithGoogle } from '../lib/auth';
import { useLocale } from '../i18n';

export default function GoogleLoginButton({ disabled = false }) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-3 py-3 border rounded-2xl text-sm font-medium hover:bg-gray-50 disabled:opacity-60 transition"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-5.514 0-10-4.486-10-10s4.486-10 10-10c2.289 0 4.397.777 6.086 2.085l5.657-5.657C33.64 10.053 28.991 8 24 8 12.954 8 4 16.954 4 28s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.65-.389-3.917z"/>
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c2.289 0 4.397.777 6.086 2.085l5.657-5.657C33.64 10.053 28.991 8 24 8 16.318 8 9.656 13.337 6.306 14.691z"/>
          <path fill="#4CAF50" d="M24 48c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 39.091 26.715 40 24 40c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 43.556 16.227 48 24 48z"/>
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-5.514 0-10-4.486-10-10s4.486-10 10-10c2.289 0 4.397.777 6.086 2.085l5.657-5.657C33.64 10.053 28.991 8 24 8 12.954 8 4 16.954 4 28s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.65-.389-3.917z"/>
        </svg>
        {loading ? t('auth.processing') : t('auth.google')}
      </button>
      {error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}
    </div>
  );
}