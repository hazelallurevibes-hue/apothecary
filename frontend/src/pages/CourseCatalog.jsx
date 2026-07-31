import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchPublishedCourses, COURSE_CATEGORIES } from '../lib/teachingPlatform';
import { VERTICAL } from '../lib/vertical';
import VideoEmbed from '../components/VideoEmbed';
import LearningPathPanel from '../components/LearningPathPanel';
import SeasonalSanctumBanner from '../components/SeasonalSanctumBanner';

export default function CourseCatalog({ user }) {
  const [params] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState(params.get('q') || '');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = params.get('q');
    if (q != null) setSearch(q);
  }, [params]);

  useEffect(() => {
    setLoading(true);
    fetchPublishedCourses({ category, search })
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="pb-12">
      {/* Sticky college-style search */}
      <div className="sticky top-0 z-20 -mx-1 mb-6 pt-1 pb-3 bg-[var(--color-cream,#faf7f5)]/95 backdrop-blur border-b border-[#4a1942]/10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-[#f5f0e8] text-[#4a1942] border border-[#c9a227]/30 rounded-full text-[10px] font-semibold tracking-wide mb-1">
              📚 TEACHING SANCTUM
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold heading-font text-[#4a1942]">Learn &amp; Grow</h1>
          </div>
          <div className="flex flex-1 flex-wrap gap-2">
            <div className="flex flex-1 min-w-[12rem] rounded-xl overflow-hidden border-2 border-[#4a1942] bg-white shadow-sm">
              <input
                type="search"
                placeholder="Search courses, teachers, topics…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-0 px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-200 px-3 py-2.5 rounded-xl text-sm bg-white"
            >
              <option value="">All topics</option>
              {COURSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link to="/sanctum-student-hub" className="text-xs px-3 py-1.5 rounded-full bg-[#4a1942] text-white font-semibold">
            Student hub
          </Link>
          <Link to="/gathering" className="text-xs px-3 py-1.5 rounded-full border bg-white text-[#4a1942] font-medium">
            Classes near you (Hearth)
          </Link>
          {user?.role === 'vendor' && (
            <Link to="/vendor-teaching" className="text-xs px-3 py-1.5 rounded-full border bg-white text-[#4a1942] font-medium">
              Teaching studio
            </Link>
          )}
        </div>
      </div>

      <p className="text-gray-600 mb-6 max-w-2xl text-sm">
        Courses from Pro Practitioners on {VERTICAL.name} — herbalism, tarot, ritual craft, and spiritual business.
      </p>

      <SeasonalSanctumBanner />
      <LearningPathPanel user={user} />

      {loading && <p className="text-gray-500">Loading courses…</p>}

      {!loading && courses.length === 0 && (
        <div className="text-center py-16 border rounded-3xl bg-white">
          <div className="text-4xl mb-3">🌙</div>
          <p className="text-gray-600">
            {search
              ? `No courses match “${search}”. Try another search.`
              : 'Courses are being crafted by practitioners. Check back soon.'}
          </p>
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
                <div className="text-xs text-gray-500 mt-2">
                  {c.vendors.name}
                  {(c.vendors.city || c.vendors.state) && (
                    <span>
                      {' '}
                      · {[c.vendors.city, c.vendors.state].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
