import { checkEmailVerified } from './emailVerification';
import {
  VENDOR_ONBOARDING_STEPS,
  getSellerPath,
  isIdStepSatisfied,
  offersServices,
} from './onboardingApi';

/** Seekers/customers must verify email before booking, ordering, or messaging practitioners. */
export async function canInteractWithProviders(user) {
  if (!user?.email) return false;
  const role = (user.role || '').toLowerCase();
  if (role === 'admin' || role === 'vendor') return true;
  return checkEmailVerified(user);
}

/**
 * Steps that block a seller from posting.
 * - Products: email + policies (+ path chosen)
 * - Services: also need ID submitted (pending OK) unless requireApprovedIdForServices
 */
export function getVendorSellBlockers(
  launchSteps = {},
  {
    identityVerified = false,
    requireApprovedIdForServices = false,
    listingKind = 'produce', // produce | menu
  } = {},
) {
  const blockers = ['verify_email', 'safety_policies'].filter((id) => !launchSteps[id]);
  if (!getSellerPath(launchSteps)) blockers.push('seller_path');

  const isService = listingKind === 'menu' || listingKind === 'service';
  const needsId = isService || offersServices(launchSteps);

  if (needsId && listingKind === 'menu') {
    if (requireApprovedIdForServices) {
      if (!identityVerified) blockers.push('id_verification');
    } else if (!isIdStepSatisfied(launchSteps) && !identityVerified) {
      blockers.push('id_verification');
    }
  }
  // Product listings: never require photo ID
  return blockers;
}

export function vendorSellBlockerMessage(launchSteps = {}, opts = {}) {
  const blockers = getVendorSellBlockers(launchSteps, opts);
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
