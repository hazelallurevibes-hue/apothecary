import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vendorCan, getVendorContext } from '../lib/plans';
import { supabase } from '../lib/supabaseClient';
import ServiceMediaField from '../components/ServiceMediaField';
import ListingThumbnailField from '../components/ListingThumbnailField';
import TeachingDeliveryPicker from '../components/TeachingDeliveryPicker';
import LearningStyleChips from '../components/LearningStyleChips';
import { EMPTY_THUMBNAIL, resolveListingPhotoUrl } from '../lib/vendorListings';
import {
  COURSE_CATEGORIES,
  deleteLesson,
  fetchCourseLessons,
  fetchVendorCourses,
  saveCourse,
  saveLesson,
} from '../lib/teachingPlatform';
import {
  LESSON_FORMATS,
  SESSION_TYPES,
  formatDeliverySummary,
  parseHaTeachMetadata,
} from '../lib/teachingStudio';
import { STREAM_PLATFORMS, getStreamUrlForPlatform } from '../lib/streamUtils';
import PractitionerSlotManager from '../components/PractitionerSlotManager';
import PractitionerBookingsPanel from '../components/PractitionerBookingsPanel';

const TABS = [
  { id: 'courses', label: 'Courses', icon: '📚' },
  { id: 'sessions', label: 'Live & 1:1', icon: '📡' },
  { id: 'guide', label: 'Learning design', icon: '✨' },
];

const EMPTY_COURSE = {
  title: '',
  description: '',
  price: '',
  pro_member_price: '',
  category: 'spiritual',
  published: false,
  delivery_modes: [],
  learning_styles: [],
};

const EMPTY_LESSON = {
  title: '',
  video_url: '',
  body: '',
  duration_minutes: '',
  free_preview: false,
  sort_order: 0,
};

const LEARNING_DESIGN_TIPS = [
  {
    title: 'Captions & transcripts',
    icon: '💬',
    body: 'Add captions to every video lesson. Paste a full transcript in the lesson body so reading/writing learners can follow along and screen readers can parse content.',
  },
  {
    title: 'Audio alternatives',
    icon: '🎧',
    body: 'Offer audio-only versions or narrated summaries for auditory learners and seekers who prefer eyes-closed ritual practice.',
  },
  {
    title: 'Visual clarity',
    icon: '👁️',
    body: 'Use high-contrast slides, labeled diagrams, and steady camera work. Describe on-screen actions for blind and low-vision seekers.',
  },
  {
    title: 'Kinesthetic practice',
    icon: '🌿',
    body: 'Include "try this now" prompts — blend a tincture, lay a spread, light a candle — with clear safety notes.',
  },
  {
    title: 'Easy mode alignment',
    icon: '🪄',
    body: 'Seekers can enable Easy mode site-wide for step-by-step tips. Keep lesson titles plain-language and break complex rituals into numbered steps.',
  },
  {
    title: 'Pacing & breaks',
    icon: '⏸️',
    body: 'Mark natural pause points in live streams. Offer async replays so solitary learners can revisit at their own rhythm.',
  },
];

export default function VendorTeaching({ user }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const canTeach = vendorCan(user, 'teaching_platform');

  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [courseDraft, setCourseDraft] = useState({ ...EMPTY_COURSE });
  const [lessonDraft, setLessonDraft] = useState({ ...EMPTY_LESSON });
  const [coverThumb, setCoverThumb] = useState({ ...EMPTY_THUMBNAIL });
  const [previewVideo, setPreviewVideo] = useState('');
  const [saving, setSaving] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [sessionTypes, setSessionTypes] = useState([]);

  useEffect(() => {
    if (!vendorId) return;
    fetchVendorCourses(vendorId).then(setCourses).catch(() => setCourses([]));
  }, [vendorId]);

  useEffect(() => {
    if (!vendorId) return;
    supabase
      .from('vendors')
      .select('stream_youtube, stream_twitch, stream_rumble, stream_platform, bio')
      .eq('id', Number(vendorId))
      .single()
      .then(({ data }) => {
        if (data) {
          setVendor(data);
          const { delivery } = parseHaTeachMetadata(data.bio || '');
          if (delivery.length) setSessionTypes(delivery.filter((d) => ['live_stream', 'one_on_one', 'group_cohort'].includes(d)));
        }
      })
      .catch(() => setVendor(null));
  }, [vendorId]);

  useEffect(() => {
    if (!selectedCourseId) {
      setLessons([]);
      return;
    }
    fetchCourseLessons(selectedCourseId).then(setLessons).catch(() => setLessons([]));
  }, [selectedCourseId]);

  if (!canTeach) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">📚</div>
        <h1 className="text-3xl font-bold heading-font text-[#4a1942]">Teaching Sanctum</h1>
        <p className="text-gray-600 mt-4 max-w-md mx-auto">
          Pro Practitioners monetize courses — herbalism, tarot, ritual craft, spiritual business — with YouTube &amp; Vimeo lessons.
        </p>
        <Link to="/pro-upgrade?type=vendor" className="inline-block mt-8 px-8 py-3 bg-[#4a1942] text-white rounded-3xl font-semibold">
          Unlock Pro Teaching →
        </Link>
      </div>
    );
  }

  const handleSaveCourse = async () => {
    if (!courseDraft.title || !vendorId) return;
    setSaving(true);
    try {
      const cover = await resolveListingPhotoUrl(coverThumb, user, vendorId, 'course');
      const saved = await saveCourse({
        ...courseDraft,
        id: selectedCourseId,
        vendor_id: vendorId,
        price: Number(courseDraft.price) || 0,
        pro_member_price: courseDraft.pro_member_price ? Number(courseDraft.pro_member_price) : null,
        cover_photo: cover,
        preview_video_url: previewVideo.trim() || null,
        delivery_modes: courseDraft.delivery_modes,
        learning_styles: courseDraft.learning_styles,
      });
      setCourses(await fetchVendorCourses(vendorId));
      setSelectedCourseId(saved.id);
      setCourseDraft({
        title: saved.title,
        description: saved.description || '',
        price: String(saved.price),
        pro_member_price: saved.pro_member_price != null ? String(saved.pro_member_price) : '',
        category: saved.category || 'spiritual',
        published: saved.published,
        delivery_modes: saved.delivery_modes || [],
        learning_styles: saved.learning_styles || [],
      });
    } catch (e) {
      alert(e.message || 'Save failed — run apothecary platform SQL migration.');
    }
    setSaving(false);
  };

  const handleAddLesson = async () => {
    if (!selectedCourseId || !lessonDraft.title) return;
    setSaving(true);
    try {
      await saveLesson({
        ...lessonDraft,
        course_id: selectedCourseId,
        duration_minutes: lessonDraft.duration_minutes ? Number(lessonDraft.duration_minutes) : null,
        sort_order: lessons.length,
      });
      setLessons(await fetchCourseLessons(selectedCourseId));
      setLessonDraft({ ...EMPTY_LESSON });
    } catch (e) {
      alert(e.message || 'Could not add lesson.');
    }
    setSaving(false);
  };

  const selectCourse = (c) => {
    setSelectedCourseId(c.id);
    setCourseDraft({
      title: c.title,
      description: c.description || '',
      price: String(c.price),
      pro_member_price: c.pro_member_price != null ? String(c.pro_member_price) : '',
      category: c.category || 'spiritual',
      published: c.published,
      delivery_modes: c.delivery_modes || [],
      learning_styles: c.learning_styles || [],
    });
    setPreviewVideo(c.preview_video_url || '');
    setCoverThumb({ url: c.cover_photo || '', file: null, preview: c.cover_photo || '' });
  };

  const newCourse = () => {
    setSelectedCourseId(null);
    setCourseDraft({ ...EMPTY_COURSE });
    setCoverThumb({ ...EMPTY_THUMBNAIL });
    setPreviewVideo('');
    setLessons([]);
  };

  const toggleSessionType = (id) => {
    setSessionTypes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const configuredStreams = STREAM_PLATFORMS.filter((p) => getStreamUrlForPlatform(vendor, p.id));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <Link to="/vendor-dashboard" className="text-sm text-[#4a1942]">← Practitioner dashboard</Link>
        <h1 className="text-4xl font-bold heading-font text-[#4a1942] mt-2">Teaching Studio</h1>
        <p className="text-gray-600 mt-2">
          Design inclusive teachings — async courses, live sanctum sessions, and 1:1 mentorship — all in one place.
        </p>
      </div>

      <nav
        className="flex flex-wrap gap-2 mb-8 p-1.5 bg-[#f5f0e8]/60 rounded-3xl border border-[#c9a227]/20"
        aria-label="Teaching studio sections"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-[#4a1942] text-white shadow-sm'
                : 'text-[#4a1942] hover:bg-white/80'
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'courses' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-2">
            <div className="font-semibold text-sm text-gray-500 px-1">Your courses</div>
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCourse(c)}
                className={`w-full text-left p-3 rounded-2xl border text-sm ${
                  selectedCourseId === c.id ? 'border-[#4a1942] bg-[#f5f0e8]' : 'hover:border-[#c9a227]/40'
                }`}
              >
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-gray-500">
                  ${c.price}{c.published ? ' · live' : ' · draft'}
                  {c.delivery_modes?.length > 0 && (
                    <span className="block mt-0.5 text-[#4a1942]/70">
                      {formatDeliverySummary(c.delivery_modes)}
                    </span>
                  )}
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={newCourse}
              className="w-full p-3 border border-dashed rounded-2xl text-sm text-[#4a1942]"
            >
              + New course
            </button>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-3xl p-6 space-y-4">
              <h2 className="font-semibold text-lg">{selectedCourseId ? 'Edit course' : 'Create course'}</h2>
              <input
                placeholder="Course title"
                value={courseDraft.title}
                onChange={(e) => setCourseDraft({ ...courseDraft, title: e.target.value })}
                className="border p-3 rounded-2xl w-full"
              />
              <textarea
                placeholder="Description — what seekers will learn"
                value={courseDraft.description}
                onChange={(e) => setCourseDraft({ ...courseDraft, description: e.target.value })}
                className="border p-3 rounded-2xl w-full min-h-[80px]"
              />

              <TeachingDeliveryPicker
                value={courseDraft.delivery_modes}
                onChange={(delivery_modes) => setCourseDraft({ ...courseDraft, delivery_modes })}
                disabled={saving}
              />

              <LearningStyleChips
                value={courseDraft.learning_styles}
                onChange={(learning_styles) => setCourseDraft({ ...courseDraft, learning_styles })}
                disabled={saving}
              />

              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Price ($)"
                  value={courseDraft.price}
                  onChange={(e) => setCourseDraft({ ...courseDraft, price: e.target.value })}
                  className="border p-3 rounded-2xl"
                />
                <input
                  type="number"
                  placeholder="Pro Member price ($) — optional"
                  value={courseDraft.pro_member_price}
                  onChange={(e) => setCourseDraft({ ...courseDraft, pro_member_price: e.target.value })}
                  className="border p-3 rounded-2xl"
                />
              </div>
              <select
                value={courseDraft.category}
                onChange={(e) => setCourseDraft({ ...courseDraft, category: e.target.value })}
                className="border p-3 rounded-2xl w-full text-sm"
              >
                {COURSE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <ListingThumbnailField
                value={coverThumb}
                onChange={setCoverThumb}
                disabled={saving}
                label="Course cover image"
              />
              <ServiceMediaField
                thumbnail={{ url: '', file: null, preview: '' }}
                onThumbnailChange={() => {}}
                videoUrl={previewVideo}
                onVideoUrlChange={setPreviewVideo}
                mediaType="video"
                onMediaTypeChange={() => {}}
                disabled={saving}
                label="Preview video (YouTube / Vimeo)"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={courseDraft.published}
                  onChange={(e) => setCourseDraft({ ...courseDraft, published: e.target.checked })}
                />
                Publish course (admin may approve before public catalog)
              </label>
              <button
                type="button"
                onClick={handleSaveCourse}
                disabled={saving}
                className="px-6 py-2.5 bg-[#4a1942] text-white rounded-2xl font-medium disabled:opacity-50"
              >
                Save course
              </button>
            </div>

            {selectedCourseId && (
              <div className="bg-white border rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Lessons ({lessons.length})</h2>
                  <div className="flex flex-wrap gap-1">
                    {LESSON_FORMATS.slice(0, 5).map((f) => (
                      <span key={f.id} className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                        {f.icon} {f.label}
                      </span>
                    ))}
                  </div>
                </div>
                {lessons.map((l) => (
                  <div key={l.id} className="flex justify-between items-center p-3 border rounded-2xl text-sm">
                    <span>{l.title}{l.free_preview ? ' · free preview' : ''}</span>
                    <button
                      type="button"
                      className="text-red-600 text-xs"
                      onClick={async () => {
                        await deleteLesson(l.id, selectedCourseId);
                        setLessons(await fetchCourseLessons(selectedCourseId));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <input
                  placeholder="Lesson title"
                  value={lessonDraft.title}
                  onChange={(e) => setLessonDraft({ ...lessonDraft, title: e.target.value })}
                  className="border p-3 rounded-2xl w-full"
                />
                <input
                  placeholder="YouTube or Vimeo URL"
                  value={lessonDraft.video_url}
                  onChange={(e) => setLessonDraft({ ...lessonDraft, video_url: e.target.value })}
                  className="border p-3 rounded-2xl w-full"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={lessonDraft.free_preview}
                    onChange={(e) => setLessonDraft({ ...lessonDraft, free_preview: e.target.checked })}
                  />
                  Free preview lesson
                </label>
                <button
                  type="button"
                  onClick={handleAddLesson}
                  disabled={saving}
                  className="px-5 py-2 border border-[#4a1942] text-[#4a1942] rounded-2xl text-sm font-medium"
                >
                  Add lesson
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-3xl p-6 md:p-8">
            <h2 className="font-semibold text-lg mb-1">Live sanctum &amp; 1:1 sessions</h2>
            <p className="text-sm text-gray-500 mb-6">
              Connect your stream platforms and define which session types you offer. Stream URLs are managed in storefront settings.
            </p>

            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Session types you offer</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {SESSION_TYPES.map((st) => {
                  const active = sessionTypes.includes(st.id);
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => toggleSessionType(st.id)}
                      aria-pressed={active}
                      className={`text-left p-3 rounded-2xl border text-sm transition ${
                        active ? 'border-[#4a1942] bg-[#f5f0e8]' : 'hover:border-[#c9a227]/40'
                      }`}
                    >
                      <span className="font-medium block">{st.label}</span>
                      <span className="text-xs text-gray-500">{st.description}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Session preferences are saved with your next course update. Bookings flow through your service listings.
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-3">Stream platform status</h3>
              {configuredStreams.length > 0 ? (
                <ul className="space-y-2 mb-4">
                  {configuredStreams.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 text-sm p-3 bg-green-50 border border-green-100 rounded-2xl">
                      <span className="text-green-600">✓</span>
                      <span className="font-medium">{p.label}</span>
                      <span className="text-gray-500 truncate text-xs flex-1">
                        {getStreamUrlForPlatform(vendor, p.id)}
                      </span>
                      {vendor?.stream_platform === p.id && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#4a1942] text-white rounded-full">Active</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-sm text-amber-800 mb-4">
                  No stream URLs configured yet. Add YouTube, Twitch, or Rumble links in storefront settings to go live.
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {STREAM_PLATFORMS.map((p) => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border text-center ${
                      getStreamUrlForPlatform(vendor, p.id) ? 'border-green-200 bg-green-50/50' : 'border-dashed'
                    }`}
                  >
                    <div className="font-medium text-sm">{p.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getStreamUrlForPlatform(vendor, p.id) ? 'Connected' : 'Not linked'}
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/storefront-settings"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#4a1942] text-white rounded-2xl font-medium text-sm"
              >
                Configure stream links in Storefront Settings →
              </Link>
            </div>
          </div>

          <PractitionerSlotManager vendorId={vendorId} />
          <PractitionerBookingsPanel vendorId={vendorId} />

          <div className="bg-gradient-to-br from-[#f5f0e8] to-white border rounded-3xl p-6 md:p-8">
            <h3 className="font-semibold mb-2">Quick tips for live teachings</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Test your embed on mobile before announcing a live ritual.</li>
              <li>Archive past broadcasts from storefront settings — thumbnails appear publicly, URLs stay private.</li>
              <li>Pair live streams with async replay lessons so solitary learners can catch up.</li>
              <li>Publish open slots above — seekers book directly from your Live Studio profile tab.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-3xl p-6 md:p-8">
            <h2 className="font-semibold text-xl mb-1">Learning design guide</h2>
            <p className="text-sm text-gray-500 mb-6">
              Build teachings every seeker can access — across VARK+ learning styles, abilities, and pacing preferences.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {LEARNING_DESIGN_TIPS.map((tip) => (
                <article
                  key={tip.title}
                  className="p-4 rounded-2xl border bg-[#faf8f5] hover:border-[#c9a227]/30 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">{tip.icon}</span>
                    <div>
                      <h3 className="font-medium text-[#4a1942]">{tip.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{tip.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="bg-[#4a1942] text-white rounded-3xl p-6 md:p-8">
            <h3 className="font-semibold text-lg mb-3">Accessibility checklist</h3>
            <ul className="text-sm space-y-2 opacity-90">
              <li>☑ Captions on all video content (YouTube auto-captions are a start — edit for accuracy)</li>
              <li>☑ Text transcript or lesson notes for every video module</li>
              <li>☑ Alt text on course cover images and diagram uploads</li>
              <li>☑ Plain-language titles — avoid jargon without explanation</li>
              <li>☑ Content warnings for intense ritual or trauma-related material</li>
              <li>☑ Multiple formats: video + audio + written summary where possible</li>
            </ul>
            <p className="text-xs mt-4 opacity-70">
              Seekers can enable Easy mode and text scaling site-wide via the accessibility hub in the footer.
            </p>
          </div>

          <div className="border border-dashed rounded-3xl p-6 text-center text-sm text-gray-500">
            <p>
              Lesson quizzes and interactive worksheets are on the roadmap — use the <strong>quiz_placeholder</strong> format tag when planning your curriculum.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}