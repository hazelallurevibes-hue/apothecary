import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import VideoEmbed from '../components/VideoEmbed';
import { customerCan, getCustomerContext, isProPlan, getEffectiveCustomerPlan } from '../lib/plans';
import { isCustomerProUser } from '../lib/proStatus';
import ProFeatureHint from '../components/ProFeatureHint';
import {
  completionPercent,
  fetchLessonProgress,
  markLessonComplete,
} from '../lib/courseProgressApi';
import { trackAchievementEvent } from '../lib/achievements';
import {
  coursePriceForCustomer,
  fetchCourseById,
  fetchCourseLessons,
  getEnrollmentStatus,
  isEnrolled,
} from '../lib/teachingPlatform';
import { checkoutCourseEnrollment } from '../lib/courseBillingApi';
import { fetchUserLearningProfile, scoreCourseForLearner } from '../lib/learningPathApi';
import { LEARNING_STYLES, formatDeliverySummary } from '../lib/teachingStudio';
import CourseCollegeHub from '../components/CourseCollegeHub';
import CourseCampusPanel from '../components/CourseCampusPanel';
import CohortRoomPanel from '../components/CohortRoomPanel';
import { checkPrerequisites } from '../lib/sanctumAdvancedApi';
import { useSeoContext } from '../components/SeoContext';
import { VERTICAL } from '../lib/vertical';
import TeachingPolicyAck from '../components/TeachingPolicyAck';
import {
  cancelCourseEnrollment,
  getCancelCount,
  evaluateCancelEligibility,
} from '../lib/teachingCancellation';
import { supabase } from '../lib/supabaseClient';

export default function CourseDetailPage({ user }) {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [pendingPay, setPendingPay] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [policyAck, setPolicyAck] = useState(false);
  const [enrollmentRow, setEnrollmentRow] = useState(null);
  const [cancelInfo, setCancelInfo] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [toast, setToast] = useState('');
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [prereqMet, setPrereqMet] = useState(true);
  const { setPageSeo } = useSeoContext();

  const customerCtx = getCustomerContext(user);
  const canTrackProgress = customerCan(user, 'lesson_progress');
  const price = course ? coursePriceForCustomer(course, customerCtx?.plan) : 0;
  const isPro = isCustomerProUser(user) || isProPlan(getEffectiveCustomerPlan(user));

  const refreshEnrollment = async () => {
    if (!user?.email) {
      setEnrolled(false);
      setPendingPay(false);
      setEnrollmentRow(null);
      setCancelInfo(null);
      return;
    }
    const ok = await isEnrolled(id, user.email);
    setEnrolled(ok);
    if (!ok) {
      const st = await getEnrollmentStatus(id, user.email);
      setPendingPay(String(st?.payment_status || '') === 'pending');
      setEnrollmentRow(null);
    } else {
      setPendingPay(false);
      const { data } = await supabase
        .from('vendor_course_enrollments')
        .select('*')
        .eq('course_id', Number(id))
        .ilike('user_email', user.email.trim())
        .maybeSingle();
      setEnrollmentRow(data);
      const count = await getCancelCount(user.email);
      setCancelInfo(
        evaluateCancelEligibility({
          priorCancelCount: count,
          enrolledAt: data?.created_at,
          amountCents: Math.round((Number(data?.amount_paid) || 0) * 100),
        }),
      );
    }
  };

  useEffect(() => {
    fetchCourseById(id).then(setCourse);
    fetchCourseLessons(id).then(setLessons);
    if (user?.email) {
      refreshEnrollment();
      checkPrerequisites(Number(id), user.email).then((r) => setPrereqMet(r.met)).catch(() => setPrereqMet(true));
      fetchLessonProgress(user.email, Number(id)).then(setCompletedLessons).catch(() => setCompletedLessons(new Set()));
      fetchUserLearningProfile(user.email).then((profile) => {
        fetchCourseById(id).then((c) => {
          if (c && profile.styles?.length) {
            setMatchScore(scoreCourseForLearner(c, profile.styles));
          }
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.email]);

  useEffect(() => {
    if (searchParams.get('enrolled') === '1') {
      setToast('Payment received — unlocking lessons (may take a few seconds)…');
      // Webhook may lag slightly
      const timers = [500, 2000, 4000].map((ms) =>
        window.setTimeout(() => {
          refreshEnrollment().then(() => {
            isEnrolled(id, user?.email).then((ok) => {
              if (ok) setToast('Payment confirmed — welcome to the Sanctum!');
            });
          });
        }, ms),
      );
      const next = new URLSearchParams(searchParams);
      next.delete('enrolled');
      next.delete('session_id');
      setSearchParams(next, { replace: true });
      return () => timers.forEach(clearTimeout);
    }
    if (searchParams.get('checkout') === 'cancel') {
      setToast('Checkout cancelled. You are not charged and not enrolled until payment completes.');
      const next = new URLSearchParams(searchParams);
      next.delete('checkout');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!course) return undefined;
    setPageSeo({
      course,
      courseTitle: course.title,
      image: course.cover_photo,
      title: `${course.title} — ${VERTICAL.labels.courses} | ${VERTICAL.name}`,
      description: (course.description || `Enroll in ${course.title} on ${VERTICAL.name}.`).slice(0, 160),
      ogType: 'product',
    });
    return () => setPageSeo({});
  }, [course, setPageSeo]);

  const handleEnroll = async () => {
    if (!user?.email) {
      alert('Sign in as a seeker to enroll.');
      return;
    }
    if (!policyAck) {
      alert('Please acknowledge the Teaching Sanctum cancellation & safety policy before enrolling.');
      return;
    }
    const prereqs = await checkPrerequisites(Number(id), user.email);
    if (!prereqs.met) {
      alert('Complete prerequisite courses before enrolling in this course.');
      setPrereqMet(false);
      return;
    }
    setEnrolling(true);
    setToast('');
    try {
      const result = await checkoutCourseEnrollment({ courseId: Number(id), email: user.email });
      if (result?.free || result?.enrolled) {
        setEnrolled(true);
        setToast('Enrolled! Your lessons are now available below.');
        await refreshEnrollment();
      }
    } catch (e) {
      alert(e.message || 'Enrollment failed.');
    }
    setEnrolling(false);
  };

  const handleCancelEnrollment = async () => {
    if (!enrollmentRow || !user?.email) return;
    if (!window.confirm(cancelInfo?.message || 'Cancel this enrollment?')) return;
    setCancelling(true);
    try {
      const result = await cancelCourseEnrollment({
        enrollment: enrollmentRow,
        email: user.email,
        reason: 'seeker_request',
        courseVendorId: course?.vendor_id,
      });
      setToast(result.message || 'Enrollment cancelled.');
      setEnrolled(false);
      setEnrollmentRow(null);
      await refreshEnrollment();
    } catch (e) {
      alert(e.message || 'Could not cancel');
    }
    setCancelling(false);
  };

  if (!course) return <div className="p-8 text-gray-500">Loading course…</div>;

  const previewLessons = enrolled ? lessons : lessons.filter((l) => l.free_preview);
  const matchPct = matchScore > 0 ? Math.min(100, Math.round((matchScore / 12) * 100)) : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/courses" className="text-sm text-[#4a1942] mb-4 inline-block">← All courses</Link>

      {toast && (
        <div
          className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}

      <div className="bg-white border rounded-3xl overflow-hidden">
        {course.preview_video_url ? (
          <VideoEmbed url={course.preview_video_url} title={course.title} />
        ) : course.cover_photo ? (
          <img src={course.cover_photo} alt="" className="w-full h-56 object-cover" />
        ) : null}

        <div className="p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl font-bold heading-font text-[#4a1942]">{course.title}</h1>
            {matchPct >= 50 && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#c9a227]/20 text-[#4a1942]">
                {matchPct}% learning-style match
              </span>
            )}
          </div>
          <p className="text-gray-700 leading-relaxed">{course.description}</p>

          {(course.delivery_modes?.length > 0 || course.learning_styles?.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {course.delivery_modes?.length > 0 && (
                <span className="text-[10px] uppercase tracking-wide px-3 py-1 rounded-full bg-[#f5f0e8] text-[#4a1942]">
                  {formatDeliverySummary(course.delivery_modes)}
                </span>
              )}
              {course.learning_styles?.map((styleId) => (
                <span
                  key={styleId}
                  className="text-[10px] px-2 py-1 rounded-full border border-[#c9a227]/30 text-[#4a1942]"
                >
                  {LEARNING_STYLES.find((s) => s.id === styleId)?.label || styleId}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 p-4 bg-[#f5f0e8] rounded-2xl">
            <div>
              <div className="text-2xl font-bold text-[#4a1942]">${price.toFixed(2)}</div>
              {course.pro_member_price != null && !isPro && (
                <div className="text-xs text-[#c9a227]">
                  Pro Members: ${Number(course.pro_member_price).toFixed(2)} —{' '}
                  <Link to="/pro-upgrade?type=customer" className="underline">upgrade</Link>
                </div>
              )}
            </div>
            {enrolled ? (
              <div className="flex flex-col gap-2 items-start">
                <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-2xl text-sm font-medium">
                  Enrolled ✓
                </span>
                {cancelInfo && (
                  <p className="text-[11px] text-gray-600 max-w-sm">{cancelInfo.message}</p>
                )}
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancelEnrollment}
                  className="text-xs underline text-red-700 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling…' : 'Cancel enrollment (policy applies)'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full max-w-md">
                <TeachingPolicyAck checked={policyAck} onChange={setPolicyAck} />
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrolling || !prereqMet || !policyAck}
                  className="px-6 py-3 bg-[#4a1942] text-white rounded-2xl font-semibold disabled:opacity-50 min-h-[44px]"
                  title={!prereqMet ? 'Complete prerequisite courses first' : !policyAck ? 'Accept policy first' : undefined}
                >
                  {enrolling
                    ? 'Opening Stripe…'
                    : !prereqMet
                      ? 'Prerequisites required'
                      : pendingPay
                        ? price > 0
                          ? `Complete payment — $${price.toFixed(2)}`
                          : 'Complete enrollment'
                        : price > 0
                          ? `Enroll — $${price.toFixed(2)}`
                          : 'Enroll free'}
                </button>
                {pendingPay && (
                  <p className="text-xs text-amber-800">
                    Checkout started but not finished — tap again to resume Stripe payment. Lessons unlock after payment.
                  </p>
                )}
                {price > 0 && (
                  <p className="text-[11px] text-gray-500">
                    Secure Stripe Checkout · funds go to the practitioner&apos;s connected account
                  </p>
                )}
              </div>
            )}
          </div>

          {enrolled && lessons.length > 0 && (
            <div className="rounded-2xl border border-[#4a1942]/10 p-4 bg-[#faf7f9]">
              {canTrackProgress ? (
                <>
                  <p className="text-sm text-[#4a1942] font-medium">Sanctum progress</p>
                  <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-[#4a1942] transition-all"
                      style={{ width: `${completionPercent(completedLessons.size, lessons.length)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {completedLessons.size} of {lessons.length} lessons marked complete
                  </p>
                </>
              ) : (
                <ProFeatureHint hintKey="lesson_progress" user={user} />
              )}
            </div>
          )}

          <div>
            <h2 className="font-semibold text-lg mb-3">Lessons ({lessons.length})</h2>
            <div className="space-y-4">
              {previewLessons.map((l) => (
                <div key={l.id} className="border rounded-2xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{l.title}</div>
                    {enrolled && canTrackProgress && (
                      <button
                        type="button"
                        onClick={async () => {
                          await markLessonComplete({ studentEmail: user.email, lessonId: l.id, courseId: Number(id) });
                          const next = new Set(completedLessons);
                          next.add(l.id);
                          setCompletedLessons(next);
                          const u = await trackAchievementEvent(user.email, 'completed_lesson', { lessonCount: next.size });
                          if (u) window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: u }));
                        }}
                        className={`text-xs px-3 py-1 rounded-full border ${completedLessons.has(l.id) ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'border-gray-200'}`}
                      >
                        {completedLessons.has(l.id) ? 'Complete ✓' : 'Mark complete'}
                      </button>
                    )}
                  </div>
                  {l.duration_minutes && (
                    <div className="text-xs text-gray-500">{l.duration_minutes} min</div>
                  )}
                  {l.video_url && (enrolled || l.free_preview) && (
                    <div className="mt-3">
                      <VideoEmbed url={l.video_url} title={l.title} />
                    </div>
                  )}
                  {!enrolled && !l.free_preview && (
                    <p className="text-xs text-gray-500 mt-2">Enroll to unlock this lesson.</p>
                  )}
                  {l.body && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{l.body}</p>}
                </div>
              ))}
              {!enrolled && lessons.length > previewLessons.length && (
                <p className="text-sm text-gray-500">
                  +{lessons.length - previewLessons.length} more lessons after enrollment
                </p>
              )}
            </div>
          </div>

          <CourseCampusPanel courseId={Number(id)} user={user} enrolled={enrolled} />

          <CourseCollegeHub
            user={user}
            course={course}
            enrolled={enrolled}
            vendorName={course.vendors?.name}
            progressPercent={completionPercent(completedLessons.size, lessons.length)}
          />
          {enrolled && user?.email && (
            <CohortRoomPanel user={user} courseId={Number(id)} courseTitle={course.title} />
          )}
        </div>
      </div>
    </div>
  );
}