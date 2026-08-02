import { useEffect, useState } from 'react';
import {
  fetchAnnouncements,
  fetchCourseDiscussion,
  postCourseDiscussion,
} from '../lib/sanctumCollegeExtras';
import { fetchSyllabus, SYLLABUS_TYPES } from '../lib/collegeApi';

/**
 * College-style course campus: announcements, syllabus peek, discussion board.
 */
export default function CourseCampusPanel({ courseId, user, enrolled }) {
  const [announcements, setAnnouncements] = useState([]);
  const [posts, setPosts] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [body, setBody] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const reload = () => {
    if (!courseId) return;
    fetchAnnouncements({ courseId, limit: 8 }).then(setAnnouncements).catch(() => setAnnouncements([]));
    fetchCourseDiscussion(courseId).then(setPosts).catch(() => setPosts([]));
    fetchSyllabus(courseId).then(setSyllabus).catch(() => setSyllabus([]));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const submit = async () => {
    setErr('');
    setMsg('');
    if (!user?.email) {
      setErr('Sign in to post.');
      return;
    }
    if (!enrolled) {
      setErr('Enroll to join the course discussion board.');
      return;
    }
    if (!body.trim()) return;
    try {
      await postCourseDiscussion({
        courseId: Number(courseId),
        email: user.email,
        name: user.name,
        body: body.trim(),
      });
      setBody('');
      setMsg('Posted to the circle.');
      reload();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-3xl border bg-white p-6">
        <h2 className="font-semibold text-lg text-[#4a1942] heading-font">Course campus</h2>
        <p className="text-xs text-gray-500 mt-1">
          Syllabus, board, and discussion — sanctum college energy, not an accredited university.
        </p>

        {syllabus.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-[#4a1942]">Syllabus</h3>
            <ul className="mt-2 space-y-2">
              {syllabus.slice(0, 12).map((item) => (
                <li key={item.id} className="text-sm flex gap-2 border-b border-gray-50 pb-2">
                  <span>{SYLLABUS_TYPES[item.item_type]?.icon || '📖'}</span>
                  <span>
                    <span className="font-medium">Week {item.week_number || '—'}:</span> {item.title}
                    {item.description && (
                      <span className="block text-xs text-gray-500">{item.description}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {announcements.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#4a1942]">Announcements</h3>
            <div className="mt-2 space-y-2">
              {announcements.map((a) => (
                <div key={a.id} className="rounded-xl bg-[#faf7f9] px-3 py-2 text-sm">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-gray-600 text-xs mt-0.5 whitespace-pre-wrap">{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-3xl border bg-white p-6">
        <h3 className="font-semibold text-[#4a1942]">Circle discussion</h3>
        <p className="text-xs text-gray-500 mt-1">Enrolled seekers only for posting. Be kind; no medical claims.</p>
        {err && <p className="text-xs text-red-600 mt-2">{err}</p>}
        {msg && <p className="text-xs text-emerald-700 mt-2">{msg}</p>}
        <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
          {posts.length === 0 && <p className="text-sm text-gray-500">No posts yet — start the circle.</p>}
          {posts.map((p) => (
            <div key={p.id} className="text-sm border-b border-gray-50 pb-2">
              <p className="font-medium text-[#4a1942]">{p.user_name || p.user_email?.split('@')[0]}</p>
              <p className="text-gray-700 whitespace-pre-wrap">{p.body}</p>
            </div>
          ))}
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={enrolled ? 'Share a question or reflection…' : 'Enroll to post…'}
          disabled={!enrolled}
          className="mt-3 w-full border rounded-2xl p-3 text-sm min-h-[72px] disabled:bg-gray-50"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!enrolled}
          className="mt-2 px-4 py-2 bg-[#4a1942] text-white rounded-xl text-sm font-medium disabled:opacity-50"
        >
          Post to circle
        </button>
      </section>
    </div>
  );
}
