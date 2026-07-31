import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { canInteractWithProviders } from '../lib/accountGates';
import { isEmailKnownVerified } from '../lib/emailVerification';

/**
 * Gate first provider interactions (checkout, book, message) until the seeker verifies email.
 * Vendors and admins bypass. Browsing and add-to-cart stay open.
 */
export function useProviderInteractionGate(user) {
  const [verified, setVerified] = useState(() => {
    if (!user?.email) return null;
    const role = (user.role || '').toLowerCase();
    if (role === 'admin' || role === 'vendor') return true;
    if (isEmailKnownVerified(user)) return true;
    return null;
  });
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.email) {
      setVerified(null);
      setChecking(false);
      return;
    }
    const role = (user.role || '').toLowerCase();
    if (role === 'admin' || role === 'vendor') {
      setVerified(true);
      setChecking(false);
      return;
    }
    if (isEmailKnownVerified(user)) {
      setVerified(true);
      setChecking(false);
      return;
    }

    let active = true;
    setChecking(true);
    const t = setTimeout(() => {
      // Don't hang the UI forever if auth is slow
      if (active && verified !== true) setChecking(false);
    }, 4000);

    canInteractWithProviders(user)
      .then((ok) => {
        if (active) {
          setVerified(ok);
          setChecking(false);
        }
      })
      .catch(() => {
        if (active) {
          setVerified(false);
          setChecking(false);
        }
      });

    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [user?.email, user?.role, user?.auth_provider, user?.email_verified]);

  useEffect(() => {
    const onVerified = (ev) => {
      const e = (ev?.detail?.email || '').trim().toLowerCase();
      if (!user?.email) return;
      if (e && e !== user.email.trim().toLowerCase()) return;
      setVerified(true);
      setChecking(false);
    };
    window.addEventListener('hazel-email-verified', onVerified);
    return () => window.removeEventListener('hazel-email-verified', onVerified);
  }, [user?.email]);

  const requireVerification = useCallback(async () => {
    if (!user?.email) {
      navigate('/login');
      return false;
    }
    const role = (user.role || '').toLowerCase();
    if (role === 'admin' || role === 'vendor') return true;
    if (isEmailKnownVerified(user) || verified === true) {
      setVerified(true);
      return true;
    }

    let ok = false;
    try {
      ok = await canInteractWithProviders(user);
    } catch {
      ok = false;
    }
    if (ok) {
      setVerified(true);
      return true;
    }

    const proceed = window.confirm(
      'Please verify your email before placing an order, booking, or messaging practitioners. You can still browse and add items to your cart. Open verification now?',
    );
    if (proceed) navigate('/verify-email');
    return false;
  }, [user, verified, navigate]);

  return { verified: verified === true, checking, requireVerification };
}
