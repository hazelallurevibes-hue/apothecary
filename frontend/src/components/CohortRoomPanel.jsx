import { useEffect, useState } from 'react';
import { createCohortThread, fetchCohortThreads, replyCohort } from '../lib/cohortApi';
import ReportContentButton from './ReportContentButton';

export default function CohortRoomPanel({ user, courseId, courseTitle }) {
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [reply, setReply] = useState('');

  useEffect(() => {
    fetchCohortThreads(courseId).then(setThreads).catch(() => setThreads([]));
  }, [courseId]);

  useEffect(() => {
    if (!activeId) { setDetail(null); return; }
    import('../lib/cohortApi').then(({ fetchCohortThread }) => fetchCohortThread(activeId).then(setDetail));
  }, [activeId]);

  const start = async () => {
    if (!user?.email || !title.trim() || !body.trim()) return;
    const t = await createCohortThread({ courseId, authorEmail: user.email, title, body });
    setThreads((p) => [t, ...p]);
    setTitle('');
    setBody('');
  };

  const postReply = async () => {
    if (!reply.trim() || !activeId) return;
    await replyCohort({ threadId: activeId, authorEmail: user.email, body: reply });
    const { fetchCohortThread } = await import('../lib/cohortApi');
    setDetail(await fetchCohortThread(activeId));
    setReply('');
  };

  return (
    <section className="rounded-3xl border border-[#4a1942]/10 bg-[#faf7f9] p-5 mt-8">
      <h2 className="font-semibold text-[#4a1942]">Cohort room · {courseTitle}</h2>
      <p className="text-xs text-gray-500 mb-4">Classmates only — study questions, ritual check-ins, peer support.</p>

      {!activeId ? (
        <>
          <div className="space-y-2 mb-4">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm" placeholder="Thread title" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} className="w-full border rounded-xl px-3 py-2 text-sm" placeholder="Start a cohort conversation…" />
            <button type="button" onClick={start} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Post to cohort</button>
          </div>
          {threads.map((t) => (
            <button key={t.id} type="button" onClick={() => setActiveId(t.id)} className="block w-full text-left rounded-xl border bg-white p-3 mb-2 text-sm hover:border-[#4a1942]/30">
              {t.title}
            </button>
          ))}
        </>
      ) : detail && (
        <div>
          <button type="button" onClick={() => setActiveId(null)} className="text-xs text-[#4a1942] mb-3">← Cohort threads</button>
          <h3 className="font-medium mb-3">{detail.thread.title}</h3>
          {detail.posts.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-3 mb-2 text-sm">
              <p className="text-xs text-gray-400">{p.author_email.split('@')[0]}</p>
              <p className="whitespace-pre-wrap">{p.body}</p>
              <ReportContentButton user={user} cohortPostId={p.id} cohortThreadId={activeId} />
            </div>
          ))}
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} className="w-full border rounded-xl px-3 py-2 text-sm mt-2" />
          <button type="button" onClick={postReply} className="mt-2 px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Reply</button>
        </div>
      )}
    </section>
  );
}