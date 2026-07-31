import { supabase } from './supabaseClient';
import { checkEmailVerified } from './emailVerification';
import { fetchIdentityVerification } from './verificationApi';

/**
 * Ordered vendor launch checklist.
 * Photo ID is only required when the seller offers wellness *services* (menu listings).
 * Product-only sellers use email + policies + first product — standard e‑commerce path.
 */
export const VENDOR_ONBOARDING_STEPS = [
  {
    id: 'verify_email',
    label: 'Verify your email',
    description: 'Confirm your account email so we can reach you about orders.',
    path: '/verify-email',
    icon: '✉️',
    autoOnly: true,
  },
  {
    id: 'safety_policies',
    label: 'Review & accept safety policies',
    description: 'Read Policies & Procedures and accept seller safety attestations.',
    path: '/vendor-safety-acceptance',
    icon: '🛡️',
  },
  {
    id: 'seller_path',
    label: 'Choose what you sell',
    description: 'Products only (apothecary goods) or include sessions/services (ID required for services).',
    path: '/vendor-dashboard#seller-path',
    icon: '🛤️',
    autoOnly: false,
  },
  {
    id: 'id_verification',
    label: 'Photo ID (services only)',
    description: 'Required only if you offer sessions/services. Product-only shops can skip. Pending review counts as done.',
    path: '/vendor-verification',
    icon: '🪪',
    autoOnly: true,
    servicesOnly: true,
  },
  {
    id: 'first_listing',
    label: 'Post your first listing',
    description: 'Add an apothecary product (or a service if you chose services).',
    path: '/vendor-dashboard#listing-quick-add',
    icon: '📋',
    autoOnly: true,
  },
];

export function parseOnboardingState(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

/** products | services | both */
export function getSellerPath(steps = {}) {
  const p = steps.seller_path_value || steps.sellerPath || steps.path;
  if (p === 'services' || p === 'both' || p === 'products') return p;
  if (steps.seller_path === true && steps.offers_services) return 'both';
  if (steps.seller_path === true) return 'products';
  return null;
}

export function offersServices(steps = {}) {
  const p = getSellerPath(steps);
  return p === 'services' || p === 'both';
}

export function stepsForSeller(steps = {}) {
  const path = getSellerPath(steps);
  return VENDOR_ONBOARDING_STEPS.filter((s) => {
    if (s.servicesOnly && path === 'products') return false;
    if (s.servicesOnly && !path) return true; // show until they choose
    return true;
  });
}

export async function fetchVendorOnboarding(vendorId) {
  const { data, error } = await supabase
    .from('vendors')
    .select(
      'onboarding_completed, status, bio, stream_platform, safety_policies_accepted_at, identity_verified, category',
    )
    .eq('id', vendorId)
    .single();

  if (error) return { steps: {}, vendor: null };
  return {
    steps: parseOnboardingState(data?.onboarding_completed),
    vendor: data,
  };
}

export async function markOnboardingStep(vendorId, stepId, completed = true, extra = {}) {
  const { data: current } = await supabase
    .from('vendors')
    .select('onboarding_completed')
    .eq('id', vendorId)
    .single();

  const steps = { ...parseOnboardingState(current?.onboarding_completed), ...extra };
  steps[stepId] = completed;

  const { error } = await supabase
    .from('vendors')
    .update({ onboarding_completed: steps })
    .eq('id', vendorId);

  if (error && error.code !== '42703') throw new Error(error.message);
  return steps;
}

export async function setSellerPath(vendorId, pathValue) {
  // products | services | both
  const completed = pathValue === 'products' || pathValue === 'services' || pathValue === 'both';
  return markOnboardingStep(vendorId, 'seller_path', completed, {
    seller_path_value: pathValue,
    offers_services: pathValue === 'services' || pathValue === 'both',
    // Product-only: clear ID requirement from progress blockers
    ...(pathValue === 'products'
      ? { id_verification: true, id_verification_status: 'not_required' }
      : {}),
  });
}

export function onboardingProgress(steps) {
  const list = stepsForSeller(steps);
  const total = list.length;
  const done = list.filter((s) => {
    if (s.id === 'id_verification') {
      return isIdStepSatisfied(steps);
    }
    return !!steps[s.id];
  }).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function isIdStepSatisfied(steps = {}) {
  if (!offersServices(steps) && getSellerPath(steps) === 'products') return true;
  if (steps.id_verification_status === 'not_required') return true;
  if (steps.id_verification_status === 'pending') return true; // submitted & waiting
  if (steps.id_verification_status === 'approved') return true;
  if (steps.id_verification_status === 'flagged') return true; // with admin, still progressed
  return !!steps.id_verification;
}

export function launchChecklistComplete(steps) {
  return stepsForSeller(steps).every((s) => {
    if (s.id === 'id_verification') return isIdStepSatisfied(steps);
    return !!steps[s.id];
  });
}

/** Permanent graduation flag — once true, checklist stays hidden even if a probe fails. */
export function isLaunchFullyDone(steps = {}) {
  if (steps.launch_complete === true || steps.launch_complete === 'true' || steps.launch_complete === 1) {
    return true;
  }
  return launchChecklistComplete(steps);
}

export function launchDoneStorageKey(vendorId) {
  return `ha_launch_done_v2_${vendorId}`;
}

export function readLaunchDoneLocal(vendorId) {
  if (!vendorId) return false;
  try {
    return localStorage.getItem(launchDoneStorageKey(vendorId)) === '1';
  } catch {
    return false;
  }
}

export function writeLaunchDoneLocal(vendorId) {
  if (!vendorId) return;
  try {
    localStorage.setItem(launchDoneStorageKey(vendorId), '1');
  } catch {
    /* ignore */
  }
}

export function nextIncompleteStep(steps) {
  if (isLaunchFullyDone(steps)) return null;
  return (
    stepsForSeller(steps).find((s) => {
      if (s.id === 'id_verification') return !isIdStepSatisfied(steps);
      return !steps[s.id];
    }) || null
  );
}

export async function autoDetectOnboarding(vendorId, { menuCount = 0, produceCount = 0, user = null } = {}) {
  const { steps, vendor } = await fetchVendorOnboarding(vendorId);

  // Already graduated — never re-open the checklist by rewriting steps to incomplete
  if (steps.launch_complete === true || steps.launch_complete === 'true' || steps.launch_complete === 1) {
    writeLaunchDoneLocal(vendorId);
    const soft = { ...steps };
    if (menuCount + produceCount > 0) soft.first_listing = true;
    return soft;
  }

  // Local graduation from a previous session (DB lag / partial write)
  if (readLaunchDoneLocal(vendorId) && launchChecklistComplete(steps)) {
    const graduated = {
      ...steps,
      launch_complete: true,
      launch_completed_at: steps.launch_completed_at || new Date().toISOString(),
    };
    await supabase.from('vendors').update({ onboarding_completed: graduated }).eq('id', vendorId);
    return graduated;
  }

  const updates = { ...steps };

  // Email: only upgrade to verified — never demote a previously completed step
  if (user) {
    const emailOk = await checkEmailVerified(user);
    if (emailOk || steps.verify_email) {
      updates.verify_email = true;
    } else {
      updates.verify_email = false;
    }
  }
  // If no user object this call, leave prior verify_email as-is (do not force false)

  if (vendor?.safety_policies_accepted_at || steps.safety_policies) {
    updates.safety_policies = true;
  }

  // Infer path from existing inventory if not chosen
  if (!getSellerPath(updates)) {
    if (menuCount > 0 && produceCount > 0) {
      updates.seller_path = true;
      updates.seller_path_value = 'both';
      updates.offers_services = true;
    } else if (menuCount > 0) {
      updates.seller_path = true;
      updates.seller_path_value = 'services';
      updates.offers_services = true;
    } else if (produceCount > 0) {
      updates.seller_path = true;
      updates.seller_path_value = 'products';
      updates.offers_services = false;
      updates.id_verification = true;
      updates.id_verification_status = 'not_required';
    }
  }

  let identity = null;
  try {
    identity = await fetchIdentityVerification(vendorId);
  } catch {
    identity = null;
  }

  const idStatus = String(identity?.status || '').toLowerCase();
  const priorStatus = String(steps.id_verification_status || updates.id_verification_status || '').toLowerCase();
  const priorSatisfied =
    priorStatus === 'pending' ||
    priorStatus === 'approved' ||
    priorStatus === 'flagged' ||
    priorStatus === 'submitted' ||
    priorStatus === 'under_review' ||
    priorStatus === 'not_required' ||
    !!steps.id_verification;

  if (vendor?.identity_verified || idStatus === 'approved') {
    updates.id_verification = true;
    updates.id_verification_status = 'approved';
  } else if (
    idStatus === 'pending' ||
    idStatus === 'flagged' ||
    idStatus === 'under_review' ||
    idStatus === 'submitted' ||
    idStatus === 'in_review'
  ) {
    updates.id_verification = true;
    updates.id_verification_status = idStatus === 'flagged' ? 'flagged' : 'pending';
  } else if (identity && (identity.id_front_url || identity.selfie_url || identity.submitted_at)) {
    updates.id_verification = true;
    updates.id_verification_status = idStatus || 'pending';
  } else if (getSellerPath(updates) === 'products') {
    updates.id_verification = true;
    updates.id_verification_status = 'not_required';
  } else if (priorSatisfied) {
    // Never wipe a prior submission if fetch failed / RLS returned null
    updates.id_verification = true;
    updates.id_verification_status = priorStatus || 'pending';
  } else if (offersServices(updates)) {
    updates.id_verification = false;
    updates.id_verification_status = 'needed';
  }

  // Listing: sticky once true
  if (menuCount + produceCount > 0 || steps.first_listing) {
    updates.first_listing = true;
  }

  if (vendor?.bio || vendor?.stream_platform) updates.storefront = true;

  // Soft graduate: real shops with listings + path + policies should not be trapped by flaky email probes
  if (
    updates.first_listing &&
    updates.seller_path &&
    updates.safety_policies &&
    (getSellerPath(updates) === 'products' || isIdStepSatisfied(updates))
  ) {
    updates.verify_email = true;
  }

  // Graduate permanently when all visible steps are done
  if (launchChecklistComplete(updates)) {
    updates.launch_complete = true;
    updates.launch_completed_at = updates.launch_completed_at || new Date().toISOString();
    writeLaunchDoneLocal(vendorId);
  }

  // Persist when anything meaningful changed
  const keys = new Set([...Object.keys(updates), ...Object.keys(steps)]);
  let changed = false;
  for (const k of keys) {
    if (JSON.stringify(updates[k]) !== JSON.stringify(steps[k])) {
      changed = true;
      break;
    }
  }
  if (changed) {
    await supabase.from('vendors').update({ onboarding_completed: updates }).eq('id', vendorId);
  }
  return updates;
}

export async function acceptSafetyPolicies(vendorId) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('vendors')
    .update({ safety_policies_accepted_at: now })
    .eq('id', vendorId);

  if (error && error.code !== '42703') {
    throw new Error(error.message || 'Run VENDOR_TAX_AND_ONBOARDING.sql');
  }

  return markOnboardingStep(vendorId, 'safety_policies', true);
}
