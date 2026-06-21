import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vendorCan } from '../lib/plans';
import ServiceMediaField from '../components/ServiceMediaField';
import ListingThumbnailField from '../components/ListingThumbnailField';
import { EMPTY_THUMBNAIL } from '../lib/vendorListings';
import { resolveListingPhotoUrl } from '../lib/vendorListings';
import {
  COURSE_CATEGORIES,
  deleteLesson,
  fetchCourseLessons,
  fetchVendorCourses,
  saveCourse,
  saveLesson,
} from '../lib/teachingPlatform';
import { getVendorContext } from '../lib/plans';

const EMPTY_COURSE = {
  title: '',
  description: '',
  price: '',
  pro_member_price: '',
  category: 'spiritual',
  published: false,
};

const EMPTY_LESSON = {
  title: '',
  video_url: '',
  body: '',
  duration_minutes: '',
  free_preview: false,
  sort_order: 0,
};

export default function VendorTeaching({ user }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const canTeach = vendorCan(user, 'teaching_platform');

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [courseDraft, setCourseDraft] = useState({ ...EMPTY_COURSE });
  const [lessonDraft, setLessonDraft] = useState({ ...EMPTY_LESSON });
  const [coverThumb, setCoverThumb] = useState({ ...EMPTY_THUMBNAIL });
  const [previewVideo, setPreviewVideo] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    fetchVendorCourses(vendorId).then(setCourses).catch(() => setCourses([]));
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
    });
    setPreviewVideo(c.preview_video_url || '');
    setCoverThumb({ url: c.cover_photo || '', file: null, preview: c.cover_photo || '' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link to="/vendor-dashboard" className="text-sm text-[#4a1942]">← Practitioner dashboard</Link>
        <h1 className="text-4xl font-bold heading-font text-[#4a1942] mt-2">Teaching Sanctum</h1>
        <p className="text-gray-600 mt-2">Monetize your wisdom — courses with video lessons, Pro Member pricing, and free previews.</p>
      </div>

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
              <div className="text-xs text-gray-500">${c.price}{c.published ? ' · live' : ' · draft'}</div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setSelectedCourseId(null);
              setCourseDraft({ ...EMPTY_COURSE });
              setCoverThumb({ ...EMPTY_THUMBNAIL });
              setPreviewVideo('');
              setLessons([]);
            }}
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
              <h2 className="font-semibold text-lg">Lessons ({lessons.length})</h2>
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
    </div>
  );
}