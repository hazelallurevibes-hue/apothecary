import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublishedCourses, COURSE_CATEGORIES } from '../lib/teachingPlatform';
import { VERTICAL } from '../lib/vertical';
import VideoEmbed from '../components/VideoEmbed';
import LearningPathPanel from '../components/LearningPathPanel';

export default function CourseCatalog({ user }) {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPublishedCourses({ category, search })
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#f5f0e8] text-[#4a1942] border border-[#c9a227]/30 rounded-full text-sm font-medium mb-3">
          📚 TEACHING SANCTUM
        </div>
        <h1 className="text-4xl font-bold heading-font text-[#4a1942]">Learn &amp; Grow</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Courses from Pro Practitioners on {VERTICAL.name} — herbalism, tarot, ritual craft, and spiritual business.
        </p>
      </div>

      <LearningPathPanel user={user} />

      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="search"
          placeholder="Search courses…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-5 py-3 rounded-3xl w-64 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-4 py-3 rounded-3xl text-sm"
        >
          <option value="">All topics</option>
          {COURSE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading courses…</p>}

      {!loading && courses.length === 0 && (
        <div className="text-center py-16 border rounded-3xl bg-white">
          <div className="text-4xl mb-3">🌙</div>
          <p className="text-gray-600">Courses are being crafted by practitioners. Check back soon.</p>
          <Link to="/vendor-signup" className="inline-block mt-4 text-[#4a1942] font-medium">Become a practitioner →</Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <Link
            key={c.id}
            to={`/courses/${c.id}`}
            className="bg-white border border-[#c9a227]/20 rounded-3xl overflow-hidden hover:shadow-md transition block group"
          >
            {c.preview_video_url ? (
              <div className="pointer-events-none">
                <VideoEmbed url={c.preview_video_url} title={c.title} />
              </div>
            ) : c.cover_photo ? (
              <img src={c.cover_photo} alt="" className="h-40 w-full object-cover group-hover:scale-105 transition" />
            ) : (
              <div className="h-40 bg-gradient-to-br from-[#4a1942] to-[#2d1230] flex items-center justify-center text-4xl">📚</div>
            )}
            <div className="p-5">
              <h3 className="font-semibold text-lg text-[#2d1230]">{c.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.description}</p>
              <div className="flex justify-between items-center mt-3 text-sm">
                <span className="text-[#4a1942] font-semibold">${Number(c.price).toFixed(2)}</span>
                {c.pro_member_price != null && (
                  <span className="text-xs text-[#c9a227]">Pro ${Number(c.pro_member_price).toFixed(2)}</span>
                )}
              </div>
              {c.vendors?.name && (
                <div className="text-xs text-gray-500 mt-2">{c.vendors.name}</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}