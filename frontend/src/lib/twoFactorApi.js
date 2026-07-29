import { supabase } from './supabaseClient';

export class MfaRequiredError extends Error {
  constructor(factorId, email) {
    super('Two-factor authentication required.');
    this.name = 'MfaRequiredError';
    this.factorId = factorId;
    this.email = email;
  }
}

/** True when password sign-in succeeded but TOTP verification is still required. */
export async function getMfaAssuranceState() {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) throw new Error(error.message);
  return data;
}

export async function listAllTotpFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw new Error(error.message);
  return data?.totp || [];
}

export async function listTotpFactors() {
  return (await listAllTotpFactors()).filter((f) => f.status === 'verified');
}

export async function hasVerifiedTotp() {
  const factors = await listTotpFactors();
  return factors.length > 0;
}

/** Remove unfinished enrollments so Set Up 2FA can restart cleanly. */
export async function clearUnverifiedTotpFactors() {
  const factors = await listAllTotpFactors();
  const pending = factors.filter((f) => f.status !== 'verified');
  for (const f of pending) {
    try {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    } catch {
      /* ignore */
    }
  }
}

export async function enrollTotp(friendlyName = 'Hazel Allure authenticator') {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session?.access_token) {
    throw new Error('Sign in again before setting up 2FA — your session is missing.');
  }

  // Supabase blocks a second enroll while an unverified factor remains.
  await clearUnverifiedTotpFactors();

  const verified = await listTotpFactors();
  if (verified.length > 0) {
    throw new Error('2FA is already enabled. Disable it first if you need to re-enroll.');
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: `${friendlyName} ${Date.now().toString(36).slice(-4)}`,
  });
  if (error) {
    const msg = error.message || 'Could not start 2FA setup.';
    if (/already|exists|enrolled/i.test(msg)) {
      throw new Error('An authenticator factor is already registered. Disable 2FA first, then try again.');
    }
    throw new Error(msg);
  }
  if (!data?.id || !data?.totp) {
    throw new Error('2FA setup returned incomplete data. Refresh the page and try again.');
  }
  return data;
}

export async function verifyTotpEnrollment(factorId, code) {
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) throw new Error(challengeError.message);

  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code: code.trim(),
  });
  if (error) throw new Error(error.message || 'Invalid code — try again.');
  return data;
}

export async function completeMfaSignIn(factorId, code) {
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) throw new Error(challengeError.message);

  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code: code.trim(),
  });
  if (error) throw new Error(error.message || 'Invalid authentication code.');
  return data;
}

export async function unenrollTotp(factorId) {
  const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw new Error(error.message || 'Could not disable 2FA.');
  return data;
}

/** After password sign-in, throw MfaRequiredError when TOTP is required. */
export async function assertMfaComplete(email) {
  const aal = await getMfaAssuranceState();
  if (aal?.currentLevel === 'aal2' || aal?.nextLevel !== 'aal2') return;

  const factors = await listTotpFactors();
  if (!factors.length) return;

  throw new MfaRequiredError(factors[0].id, email);
}