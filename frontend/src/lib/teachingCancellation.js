/**
 * Teaching Sanctum cancellation & hold-fee policy.
 *
 * - Free cancel with ≥ 48 hours notice (for live sessions)
 * - After 2 prior cancellations, further cancels (or re-bookings after abuse)
 *   require a non-refundable 10% hold fee of the class/session price
 * - Within 48 hours: not eligible for refund; still counts toward cancel tally
 */
import { supabase } from './supabaseClient';

export const CANCEL_HOURS = 48;
export const FREE_CANCEL_LIMIT = 2;
export const HOLD_FEE_PERCENT = 10;

export async function getCancelCount(email) {
  if (!email) return 0;
  try {
    const { data, error } = await supabase.rpc('teaching_cancel_count', {
      p_email: email.trim().toLowerCase(),
    });
    if (!error && data != null) return Number(data) || 0;
  } catch {
    /* fall through */
  }
  const { count } = await supabase
    .from('teaching_cancellations')
    .select('id', { count: 'exact', head: true })
    .ilike('seeker_email', email.trim());
  return count || 0;
}

/** Whether the next cancel (or booking after abuse) triggers a 10% hold fee. */
export function holdFeeApplies(priorCancelCount) {
  return Number(priorCancelCount) >= FREE_CANCEL_LIMIT;
}

export function computeHoldFeeCents(amountCents) {
  const a = Math.max(0, Number(amountCents) || 0);
  return Math.round(a * (HOLD_FEE_PERCENT / 100));
}

/**
 * Session: true if starts_at is at least 48h away.
 * Course: true if enrolled_at / created is within policy window unused — for courses
 * we use "more than 48h after enrollment still free cancel only if not past free limit"
 * and "within 48h of purchase" can cancel free if under limit.
 */
export function isOutside48hWindow({ startsAt, enrolledAt, now = new Date() } = {}) {
  if (startsAt) {
    const start = new Date(startsAt).getTime();
    const ms = CANCEL_HOURS * 60 * 60 * 1000;
    return start - now.getTime() >= ms;
  }
  if (enrolledAt) {
    // Digital course: free cancel window is first 48h after enroll (if unused)
    const en = new Date(enrolledAt).getTime();
    const ms = CANCEL_HOURS * 60 * 60 * 1000;
    return now.getTime() - en <= ms;
  }
  return false;
}

export function evaluateCancelEligibility({
  priorCancelCount = 0,
  startsAt,
  enrolledAt,
  amountCents = 0,
}) {
  const outside48 = isOutside48hWindow({ startsAt, enrolledAt });
  const needsHoldFee = holdFeeApplies(priorCancelCount);
  const holdFeeCents = needsHoldFee ? computeHoldFeeCents(amountCents) : 0;

  let refundEligible = false;
  let message = '';

  if (startsAt) {
    // Live session
    if (outside48 && !needsHoldFee) {
      refundEligible = true;
      message = `Cancel free — more than ${CANCEL_HOURS}h before start (cancel #${priorCancelCount + 1} of ${FREE_CANCEL_LIMIT} free).`;
    } else if (outside48 && needsHoldFee) {
      refundEligible = true; // refund net of hold fee
      message = `You have cancelled ${priorCancelCount} times. A non-refundable ${HOLD_FEE_PERCENT}% hold fee ($${(holdFeeCents / 100).toFixed(2)}) applies; remainder may be refunded if outside ${CANCEL_HOURS}h.`;
    } else if (!outside48 && needsHoldFee) {
      refundEligible = false;
      message = `Inside ${CANCEL_HOURS}h window — no refund. Hold fee ${HOLD_FEE_PERCENT}% still due if not already collected.`;
    } else {
      refundEligible = false;
      message = `Inside ${CANCEL_HOURS}h of start — cancellation accepted but no refund.`;
    }
  } else {
    // Course enrollment
    if (outside48 && !needsHoldFee) {
      refundEligible = true;
      message = `Cancel within ${CANCEL_HOURS}h of enrollment free (cancel #${priorCancelCount + 1} of ${FREE_CANCEL_LIMIT}).`;
    } else if (outside48 && needsHoldFee) {
      refundEligible = true;
      message = `Non-refundable ${HOLD_FEE_PERCENT}% hold fee applies due to prior cancellations.`;
    } else {
      refundEligible = false;
      message = `Outside the ${CANCEL_HOURS}h enrollment window or access already used — refund at practitioner discretion only.`;
    }
  }

  return {
    outside48h: outside48,
    priorCancelCount,
    needsHoldFee,
    holdFeeCents,
    holdFeePercent: HOLD_FEE_PERCENT,
    refundEligible,
    message,
    freeCancelLimit: FREE_CANCEL_LIMIT,
    cancelHours: CANCEL_HOURS,
  };
}

export async function recordCancellation({
  email,
  kind,
  referenceId,
  vendorId,
  amountCents = 0,
  within48h = false,
  holdFeeCents = 0,
  holdFeeStatus = 'none',
  priorCancelCount = 0,
  reason = '',
}) {
  const payload = {
    seeker_email: String(email).trim().toLowerCase(),
    kind,
    reference_id: referenceId || null,
    vendor_id: vendorId || null,
    amount_cents: amountCents,
    within_48h: !!within48h,
    hold_fee_cents: holdFeeCents,
    hold_fee_status: holdFeeStatus,
    prior_cancel_count: priorCancelCount,
    reason: (reason || '').slice(0, 500) || null,
  };
  const { data, error } = await supabase.from('teaching_cancellations').insert(payload).select().single();
  if (error) throw new Error(error.message || 'Could not record cancellation');
  return data;
}

/** Cancel a session booking under policy. */
export async function cancelSessionBooking({ booking, email, reason }) {
  if (!booking?.id || !email) throw new Error('Booking and email required');
  const count = await getCancelCount(email);
  const startsAt = booking.practitioner_session_slots?.starts_at || booking.starts_at;
  const amountCents = Number(booking.amount_paid_cents) || Number(booking.practitioner_session_slots?.price_cents) || 0;
  const eval_ = evaluateCancelEligibility({
    priorCancelCount: count,
    startsAt,
    amountCents,
  });

  const { error } = await supabase
    .from('practitioner_bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason || null,
      cancel_within_48h: !eval_.outside48h,
      hold_fee_cents: eval_.holdFeeCents,
    })
    .eq('id', booking.id)
    .ilike('seeker_email', email.trim());

  if (error) throw new Error(error.message);

  // Re-open slot if still in future
  const slotId = booking.slot_id;
  if (slotId && eval_.outside48h) {
    await supabase
      .from('practitioner_session_slots')
      .update({ status: 'open', updated_at: new Date().toISOString() })
      .eq('id', slotId)
      .eq('status', 'booked');
  }

  await recordCancellation({
    email,
    kind: 'session',
    referenceId: booking.id,
    vendorId: booking.vendor_id,
    amountCents,
    within48h: !eval_.outside48h,
    holdFeeCents: eval_.holdFeeCents,
    holdFeeStatus: eval_.holdFeeCents > 0 ? 'due' : 'none',
    priorCancelCount: count,
    reason,
  });

  return eval_;
}

/** Cancel course enrollment under policy. */
export async function cancelCourseEnrollment({ enrollment, email, reason, courseVendorId }) {
  if (!enrollment?.id || !email) throw new Error('Enrollment and email required');
  const count = await getCancelCount(email);
  const amountCents = Math.round((Number(enrollment.amount_paid) || 0) * 100);
  const enrolledAt = enrollment.created_at || enrollment.enrolled_at;
  const eval_ = evaluateCancelEligibility({
    priorCancelCount: count,
    enrolledAt,
    amountCents,
  });

  const { error } = await supabase
    .from('vendor_course_enrollments')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason || null,
      hold_fee_cents: eval_.holdFeeCents,
      payment_status: eval_.refundEligible && !eval_.needsHoldFee ? 'refunded' : enrollment.payment_status,
    })
    .eq('id', enrollment.id)
    .ilike('user_email', email.trim());

  if (error) throw new Error(error.message);

  await recordCancellation({
    email,
    kind: 'course',
    referenceId: enrollment.id,
    vendorId: courseVendorId || null,
    amountCents,
    within48h: !eval_.outside48h,
    holdFeeCents: eval_.holdFeeCents,
    holdFeeStatus: eval_.holdFeeCents > 0 ? 'due' : 'none',
    priorCancelCount: count,
    reason,
  });

  return eval_;
}

export const TEACHING_POLICY_SUMMARY = {
  cancelHours: CANCEL_HOURS,
  freeCancelLimit: FREE_CANCEL_LIMIT,
  holdFeePercent: HOLD_FEE_PERCENT,
  bullets: [
    `Cancel live sessions at least ${CANCEL_HOURS} hours before start for a refund-eligible cancel (subject to free-cancel limit).`,
    `You get ${FREE_CANCEL_LIMIT} free cancellations. After that, a non-refundable ${HOLD_FEE_PERCENT}% hold fee of the class/session price applies.`,
    `Cancellations inside ${CANCEL_HOURS} hours are not refund-eligible (protects practitioners' calendars).`,
    'Course enrollments: free cancel within 48 hours of purchase if you have free cancels remaining and have not abused access.',
    'No-shows may be treated as late cancellations by the practitioner.',
    'Chargebacks after attending or downloading course content may result in account suspension.',
  ],
};
