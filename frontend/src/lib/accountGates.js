import { checkEmailVerified } from './emailVerification';
import { VENDOR_ONBOARDING_STEPS } from './onboardingApi';

/** Seekers/customers must verify email before booking, ordering, or messaging practitioners. */
export async function canInteractWithProviders(user) {
  if (!user?.email) return false;
  const role = (user.role || '').toLowerCase();
  if (role === 'admin' || role === 'vendor') return true;
  return checkEmailVerified(user);
}

/** Steps that block a practitioner from selling / posting their first listing. */
export function getVendorSellBlockers(launchSteps = {}, { identityVerified = false, requireApprovedId = true } = {}) {
  const blockers = ['verify_email', 'safety_policies'].filter((id) => !launchSteps[id]);
  if (requireApprovedId) {
    if (!identityVerified) blockers.push('id_verification');
  } else if (!launchSteps.id_verification) {
    blockers.push('id_verification');
  }
  return blockers;
}

export function vendorSellBlockerMessage(launchSteps = {}) {
  const blockers = getVendorSellBlockers(launchSteps);
  if (!blockers.length) return null;
  const step = VENDOR_ONBOARDING_STEPS.find((s) => s.id === blockers[0]);
  const index = VENDOR_ONBOARDING_STEPS.findIndex((s) => s.id === blockers[0]);
  return {
    stepId: blockers[0],
    label: step?.label || blockers[0],
    path: step?.path || '/vendor-dashboard',
    message: `Complete step ${index + 1} — ${step?.label || blockers[0]} — before you can sell on Hazel Allure.`,
  };
}