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

export async function listTotpFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw new Error(error.message);
  return (data?.totp || []).filter((f) => f.status === 'verified');
}

export async function hasVerifiedTotp() {
  const factors = await listTotpFactors();
  return factors.length > 0;
}

export async function enrollTotp(friendlyName = 'Authenticator app') {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName,
  });
  if (error) throw new Error(error.message || 'Could not start 2FA setup.');
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