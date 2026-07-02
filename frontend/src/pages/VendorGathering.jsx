import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProFeatureHint from '../components/ProFeatureHint';
import { getVendorContext, vendorCan } from '../lib/plans';
import { fetchTopics, fetchThreads, fetchThread, createThread, replyToThread } from '../lib/communityApi';

export default function VendorGathering({ user }) {
  const ctx = getVendorContext(user);
  const canAccess = vendorCan(user, 'vendor_gathering');
  const { threadId } = useParams();
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [threads, setThreads] = useState([]);
  const [threadDetail, setThreadDetail] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (!canAccess) return;
    fetchTopics('vendor', ctx?.vendorId).then(setTopics).catch(() => {});
  }, [canAccess, ctx?.vendorId]);

  useEffect(() => {
    if (!activeTopic || !canAccess) return;
    fetchThreads(activeTopic).then(setThreads).catch(() => {});
  }, [activeTopic, canAccess]);

  useEffect(() => {
    if (!threadId || !canAccess) {
      setThreadDetail(null);
      return;
    }
    fetchThread(Number(threadId)).then(setThreadDetail).catch(() => {});
  }, [threadId, canAccess]);

  if (!canAccess) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <h1 className="text-2xl font-semibold text-[#4a1942] mb-4">Practitioner gathering</h1>
        <ProFeatureHint hintKey="vendor_gathering" />
      </div>
    );
  }

  const startThread = async () => {
    if (!user?.email || !newTitle.trim() || !newBody.trim() || !activeTopic) return;
    const t = await createThread({ topicId: activeTopic, authorEmail: user.email, title: newTitle, body: newBody });
    setThreads((prev) => [t, ...prev]);
    setNewTitle('');
    setNewBody('');
  };

  const postReply = async () => {
    if (!reply.trim() || !threadId) return;
    await replyToThread({ threadId: Number(threadId), authorEmail: user.email, body: reply });
    setThreadDetail(await fetchThread(Number(threadId)));
    setReply('');
  };

  if (threadDetail) {
    const { thread, posts } = threadDetail;
    return (
      <div className="max-w-3xl mx-auto pb-16">
        <Link to="/vendor-gathering" className="text-sm text-[#4a1942] hover:underline">← Practitioner lounge</Link>
        <h1 className="text-2xl font-semibold mt-4 mb-6">{thread.title}</h1>
        <div className="space-y-4 mb-8">
          {posts.map((p) => (
            <article key={p.id} className="rounded-2xl border p-4 text-sm">
              <p className="text-xs text-gray-400 mb-1">{p.author_email.split('@')[0]}</p>
              <p className="whitespace-pre-wrap">{p.body}</p>
            </article>
          ))}
        </div>
        <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} className="w-full border rounded-xl px-3 py-2 text-sm mb-2" />
        <button type="button" onClick={postReply} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Reply</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <h1 className="text-3xl font-bold text-[#4a1942] mb-2">Practitioner lounge</h1>
      <p className="text-gray-600 mb-8 max-w-2xl">Peer space for Pro practitioners — Sanctum craft, compliance notes, and gentle growth. Not legal advice.</p>
      <div className="grid lg:grid-cols-3 gap-6">
        <aside className="space-y-2">
          {topics.map((t) => (
            <button key={t.id} type="button" onClick={() => setActiveTopic(t.id)} className={`w-full text-left rounded-xl px-4 py-3 border text-sm ${activeTopic === t.id ? 'bg-[#4a1942] text-white' : 'bg-white'}`}>
              {t.title}
            </button>
          ))}
        </aside>
        <div className="lg:col-span-2 space-y-4">
          {activeTopic && (
            <>
              <div className="rounded-2xl border p-4 space-y-2 bg-[#faf7f9]">
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm" placeholder="Thread title" />
                <textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} rows={3} className="w-full border rounded-xl px-3 py-2 text-sm" />
                <button type="button" onClick={startThread} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Start thread</button>
              </div>
              {threads.map((th) => (
                <Link key={th.id} to={`/vendor-gathering/thread/${th.id}`} className="block rounded-2xl border bg-white p-4 hover:border-[#4a1942]/25">
                  <p className="font-medium">{th.title}</p>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}