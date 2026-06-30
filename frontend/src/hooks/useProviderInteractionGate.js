import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { canInteractWithProviders } from '../lib/accountGates';

/**
 * Gate first provider interactions (book, order, message) until the seeker verifies email.
 * Vendors and admins bypass this gate.
 */
export function useProviderInteractionGate(user) {
  const [verified, setVerified] = useState(null);
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
    let active = true;
    setChecking(true);
    canInteractWithProviders(user).then((ok) => {
      if (active) {
        setVerified(ok);
        setChecking(false);
      }
    });
    return () => { active = false; };
  }, [user?.email, user?.role, user?.auth_provider, user?.email_verified]);

  const requireVerification = useCallback(async () => {
    if (!user?.email) {
      navigate('/login');
      return false;
    }
    const role = (user.role || '').toLowerCase();
    if (role === 'admin' || role === 'vendor') return true;

    const ok = verified === true ? true : await canInteractWithProviders(user);
    if (ok) {
      setVerified(true);
      return true;
    }

    const proceed = window.confirm(
      'Please verify your email before booking, ordering, or messaging practitioners. Open verification now?',
    );
    if (proceed) navigate('/verify-email');
    return false;
  }, [user, verified, navigate]);

  return { verified: verified === true, checking, requireVerification };
}