import { supabase } from './supabaseClient';
import { checkEmailVerified } from './emailVerification';
import { fetchIdentityVerification } from './verificationApi';

/** Ordered vendor launch checklist — complete in sequence before going live. */
export const VENDOR_ONBOARDING_STEPS = [
  {
    id: 'verify_email',
    label: 'Verify your email',
    description: 'Confirm your account email so we can reach you about orders and compliance.',
    path: '/verify-email',
    icon: '✉️',
    autoOnly: true,
  },
  {
    id: 'safety_policies',
    label: 'Review & accept safety policies',
    description: 'Read Policies & Procedures and accept vendor safety attestations.',
    path: '/vendor-safety-acceptance',
    icon: '🛡️',
  },
  {
    id: 'id_verification',
    label: 'Photo ID verification',
    description: 'Submit government ID for admin review before your first public listing.',
    path: '/vendor-verification',
    icon: '🪪',
    autoOnly: true,
  },
  {
    id: 'first_listing',
    label: 'Post your first listing',
    description: 'Add a healing service or apothecary listing — this is the final launch step.',
    path: '/vendor-dashboard#add-menu',
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

export async function fetchVendorOnboarding(vendorId) {
  const { data, error } = await supabase
    .from('vendors')
    .select('onboarding_completed, status, bio, stream_platform, safety_policies_accepted_at, identity_verified')
    .eq('id', vendorId)
    .single();

  if (error) return { steps: {}, vendor: null };
  return {
    steps: parseOnboardingState(data?.onboarding_completed),
    vendor: data,
  };
}

export async function markOnboardingStep(vendorId, stepId, completed = true) {
  const { data: current } = await supabase
    .from('vendors')
    .select('onboarding_completed')
    .eq('id', vendorId)
    .single();

  const steps = parseOnboardingState(current?.onboarding_completed);
  steps[stepId] = completed;

  const { error } = await supabase
    .from('vendors')
    .update({ onboarding_completed: steps })
    .eq('id', vendorId);

  if (error && error.code !== '42703') throw new Error(error.message);
  return steps;
}

export function onboardingProgress(steps) {
  const total = VENDOR_ONBOARDING_STEPS.length;
  const done = VENDOR_ONBOARDING_STEPS.filter((s) => steps[s.id]).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function launchChecklistComplete(steps) {
  return VENDOR_ONBOARDING_STEPS.every((s) => steps[s.id]);
}

export function nextIncompleteStep(steps) {
  return VENDOR_ONBOARDING_STEPS.find((s) => !steps[s.id]) || null;
}

export async function autoDetectOnboarding(vendorId, { menuCount = 0, produceCount = 0, user = null } = {}) {
  const { steps, vendor } = await fetchVendorOnboarding(vendorId);
  const updates = { ...steps };

  if (user) {
    const emailOk = await checkEmailVerified(user);
    if (emailOk) updates.verify_email = true;
  }

  if (vendor?.safety_policies_accepted_at || steps.safety_policies) {
    updates.safety_policies = true;
  }

  let identity = null;
  try {
    identity = await fetchIdentityVerification(vendorId);
  } catch {
    identity = null;
  }
  if (vendor?.identity_verified || ['pending', 'approved'].includes(identity?.status)) {
    updates.id_verification = true;
  }

  if (menuCount + produceCount > 0) updates.first_listing = true;

  if (vendor?.bio || vendor?.stream_platform) updates.storefront = true;

  const changed = VENDOR_ONBOARDING_STEPS.some((s) => updates[s.id] && !steps[s.id]);
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