import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import VideoEmbed from '../components/VideoEmbed';
import { getCustomerContext, isProPlan } from '../lib/plans';
import {
  coursePriceForCustomer,
  fetchCourseById,
  fetchCourseLessons,
  isEnrolled,
} from '../lib/teachingPlatform';
import { checkoutCourseEnrollment } from '../lib/courseBillingApi';
import { fetchUserLearningProfile, scoreCourseForLearner } from '../lib/learningPathApi';
import { LEARNING_STYLES, formatDeliverySummary } from '../lib/teachingStudio';

export default function CourseDetailPage({ user }) {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [toast, setToast] = useState('');

  const customerCtx = getCustomerContext(user);
  const price = course ? coursePriceForCustomer(course, customerCtx?.plan) : 0;
  const isPro = isProPlan(customerCtx?.plan);

  useEffect(() => {
    fetchCourseById(id).then(setCourse);
    fetchCourseLessons(id).then(setLessons);
    if (user?.email) {
      isEnrolled(id, user.email).then(setEnrolled);
      fetchUserLearningProfile(user.email).then((profile) => {
        fetchCourseById(id).then((c) => {
          if (c && profile.styles?.length) {
            setMatchScore(scoreCourseForLearner(c, profile.styles));
          }
        });
      });
    }
  }, [id, user?.email]);

  useEffect(() => {
    if (searchParams.get('enrolled') === '1') {
      setEnrolled(true);
      setToast('Payment confirmed — welcome to the Sanctum!');
      const next = new URLSearchParams(searchParams);
      next.delete('enrolled');
      setSearchParams(next, { replace: true });
    }
    if (searchParams.get('checkout') === 'cancel') {
      setToast('Checkout cancelled — your cart is clear.');
      const next = new URLSearchParams(searchParams);
      next.delete('checkout');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleEnroll = async () => {
    if (!user?.email) {
      alert('Sign in as a seeker to enroll.');
      return;
    }
    setEnrolling(true);
    setToast('');
    try {
      const result = await checkoutCourseEnrollment({ courseId: Number(id), email: user.email });
      if (result?.free || result?.enrolled) {
        setEnrolled(true);
        setToast('Enrolled! Your lessons are now available below.');
      }
    } catch (e) {
      alert(e.message || 'Enrollment failed.');
    }
    setEnrolling(false);
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
              <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-2xl text-sm font-medium">Enrolled ✓</span>
            ) : (
              <button
                type="button"
                onClick={handleEnroll}
                disabled={enrolling}
                className="px-6 py-3 bg-[#4a1942] text-white rounded-2xl font-semibold disabled:opacity-50 min-h-[44px]"
              >
                {enrolling ? 'Redirecting…' : price > 0 ? `Enroll — $${price.toFixed(2)}` : 'Enroll free'}
              </button>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-3">Lessons ({lessons.length})</h2>
            <div className="space-y-4">
              {previewLessons.map((l) => (
                <div key={l.id} className="border rounded-2xl p-4">
                  <div className="font-medium">{l.title}</div>
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
        </div>
      </div>
    </div>
  );
}