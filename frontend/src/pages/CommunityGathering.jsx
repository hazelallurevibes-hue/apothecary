import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProFeatureHint from '../components/ProFeatureHint';
import { customerCan } from '../lib/plans';
import {
  createThread,
  fetchThread,
  fetchThreads,
  fetchTopics,
  replyToThread,
} from '../lib/communityApi';
import { trackAchievementEvent } from '../lib/achievements';
import { getStudyHallPrompt } from '../lib/seasonalSanctum';
import AmbientSoundToggle from '../components/AmbientSoundToggle';
import OfficeHoursPanel from '../components/OfficeHoursPanel';
import GatheringProposals from '../components/GatheringProposals';
import SolsticeRsvpCard from '../components/SolsticeRsvpCard';
import DailyOracleCard from '../components/DailyOracleCard';
import CommunityCodeBanner from '../components/CommunityCodeBanner';
import ModAuthorBadge from '../components/ModAuthorBadge';
import ReportContentButton from '../components/ReportContentButton';
import { fetchModerators } from '../lib/communityModeration';
import { fetchPlatformSettings } from '../lib/platformSettingsApi';
import CovenRollCall from '../components/CovenRollCall';
import GratitudeWall from '../components/GratitudeWall';

export default function CommunityGathering({ user }) {
  const { threadId } = useParams();
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [threads, setThreads] = useState([]);
  const [threadDetail, setThreadDetail] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [modMap, setModMap] = useState({});
  const [showBanner, setShowBanner] = useState(true);
  const canStart = customerCan(user, 'community_threads');

  useEffect(() => {
    fetchModerators().then((mods) => {
      const m = {};
      mods.forEach((x) => { m[x.user_email] = x; });
      setModMap(m);
    }).catch(() => {});
    fetchPlatformSettings().then((s) => setShowBanner(s.hearth_show_community_banner !== 'false')).catch(() => {});
  }, []);

  useEffect(() => {
    fetchTopics('seeker').then(setTopics).catch((e) => setError(e.message));
    trackAchievementEvent(user?.email, 'visited_sanctum').then((u) => {
      if (u) window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: u }));
    });
  }, [user?.email]);

  useEffect(() => {
    if (!activeTopic) return;
    fetchThreads(activeTopic).then(setThreads).catch((e) => setError(e.message));
  }, [activeTopic]);

  useEffect(() => {
    if (!threadId) {
      setThreadDetail(null);
      return;
    }
    fetchThread(Number(threadId)).then(setThreadDetail).catch((e) => setError(e.message));
  }, [threadId]);

  const startThread = async () => {
    if (!canStart || !user?.email || !newTitle.trim() || !newBody.trim()) return;
    try {
      const t = await createThread({
        topicId: activeTopic,
        authorEmail: user.email,
        title: newTitle,
        body: newBody,
        spaceType: 'seeker',
      });
      const unlocked = await trackAchievementEvent(user.email, 'first_community_post');
      if (unlocked) window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: unlocked }));
      setNewTitle('');
      setNewBody('');
      setThreads((prev) => [t, ...prev]);
    } catch (e) {
      setError(e.message);
    }
  };

  const postReply = async () => {
    if (!user?.email || !reply.trim() || !threadId) return;
    try {
      await replyToThread({ threadId: Number(threadId), authorEmail: user.email, body: reply, spaceType: 'seeker' });
      const detail = await fetchThread(Number(threadId));
      setThreadDetail(detail);
      setReply('');
    } catch (e) {
      setError(e.message);
    }
  };

  if (threadDetail) {
    const { thread, posts } = threadDetail;
    return (
      <div className="max-w-3xl mx-auto pb-16">
        <Link to="/gathering" className="text-sm text-[#4a1942] hover:underline">← Gathering</Link>
        <h1 className="text-2xl font-semibold text-[#4a1942] mt-4 mb-2">{thread.title}</h1>
        <p className="text-xs text-gray-500 mb-6">Started by {thread.author_email.split('@')[0]}</p>
        <div className="space-y-4 mb-8">
          {posts.map((p) => (
            <article key={p.id} className="rounded-2xl border border-gray-100 bg-white p-4 text-sm">
              <p className="text-xs text-gray-400 mb-2">
                {p.author_email.split('@')[0]}
                <ModAuthorBadge mod={modMap[p.author_email]} />
              </p>
              <p className="text-gray-700 whitespace-pre-wrap">{p.body}</p>
              <ReportContentButton user={user} threadId={thread.id} postId={p.id} />
            </article>
          ))}
        </div>
        {user && !thread.locked && (
          <div className="rounded-2xl border border-[#4a1942]/10 p-4">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              className="w-full border rounded-xl px-3 py-2 text-sm mb-2"
              placeholder="Add your voice…"
            />
            <button type="button" onClick={postReply} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">
              Reply
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[#4a1942]/60 mb-2">Seeker gathering</p>
        <h1 className="text-3xl font-bold text-[#4a1942]">The Hearth</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          A warm room for seekers — introductions, Sanctum study, apothecary finds, and seasonal practice.
          Hazel Allure hosts the space; you own your words. Be kind, be truthful, no medical claims.
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-3">
          <p className="text-sm text-[#4a1942]/80 italic">Study hall prompt: {getStudyHallPrompt()}</p>
          <AmbientSoundToggle />
        </div>
      </header>

      <CovenRollCall />
      <GratitudeWall user={user} />
      {showBanner && <CommunityCodeBanner />}
      <SolsticeRsvpCard user={user} />
      <DailyOracleCard className="mb-6" />
      <OfficeHoursPanel user={user} />
      <GatheringProposals user={user} />

      {error && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          {error.includes('does not exist') ? 'Run SQL migration 26 in Supabase to enable the gathering.' : error}
        </p>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <aside className="space-y-2">
          {topics.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTopic(t.id)}
              className={`w-full text-left rounded-xl px-4 py-3 border text-sm transition ${activeTopic === t.id ? 'bg-[#4a1942] text-white border-[#4a1942]' : 'bg-white border-gray-100 hover:border-[#4a1942]/30'}`}
            >
              <span className="font-medium block">{t.title}</span>
              <span className={`text-xs ${activeTopic === t.id ? 'text-white/80' : 'text-gray-500'}`}>{t.description}</span>
            </button>
          ))}
        </aside>

        <div className="lg:col-span-2 space-y-4">
          {!activeTopic && (
            <p className="text-gray-500 text-sm">Choose a topic to browse threads.</p>
          )}
          {activeTopic && (
            <>
              {!canStart && <ProFeatureHint hintKey="community_post" />}
              {canStart && user && (
                <div className="rounded-2xl border border-[#4a1942]/10 p-4 bg-[#faf7f9] space-y-2">
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-sm"
                    placeholder="Thread title"
                  />
                  <textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    rows={3}
                    className="w-full border rounded-xl px-3 py-2 text-sm"
                    placeholder="Begin the conversation…"
                  />
                  <button type="button" onClick={startThread} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">
                    Start thread
                  </button>
                </div>
              )}
              {threads.map((th) => (
                <Link
                  key={th.id}
                  to={`/gathering/thread/${th.id}`}
                  className="block rounded-2xl border border-gray-100 bg-white p-4 hover:border-[#4a1942]/25 transition"
                >
                  <p className="font-medium text-[#4a1942]">{th.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{th.author_email.split('@')[0]} · {new Date(th.updated_at).toLocaleDateString()}</p>
                </Link>
              ))}
              {threads.length === 0 && <p className="text-sm text-gray-500">No threads yet — be the first gentle voice.</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}