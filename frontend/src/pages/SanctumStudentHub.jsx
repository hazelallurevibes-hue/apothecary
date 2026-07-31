import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  buildTranscript,
  fetchHonorRoll,
  fetchCalendarEvents,
  fetchOpportunities,
  HONOR_TYPES,
  requestMentor,
} from '../lib/collegeApi';
import { fetchThankYouNotesForStudent, pinThankYouNote } from '../lib/thankYouApi';
import { STUDENT_BADGE_TYPES } from '../lib/studentBadgesApi';
import ProfileAvatarFrame from '../components/ProfileAvatarFrame';
import CredentialWalletPanel from '../components/CredentialWalletPanel';
import WellnessGpaCard from '../components/WellnessGpaCard';
import { fetchBundles } from '../lib/sanctumAdvancedApi';
import SolsticeRsvpCard from '../components/SolsticeRsvpCard';
import { fetchPublishedCourses } from '../lib/teachingPlatform';
import ProToolLock from '../components/ProToolLock';
import { isCustomerPro } from '../lib/plans';
import { isCustomerProUser } from '../lib/proStatus';

const TABS = [
  { id: 'open', label: 'Open', hint: 'Enrolling now' },
  { id: 'upcoming', label: 'Upcoming', hint: 'Starting soon' },
  { id: 'closed', label: 'Closed', hint: 'Past sessions' },
  { id: 'mine', label: 'My classes', hint: 'Enrolled' },
  { id: 'history', label: 'History', hint: 'Transcript' },
  { id: 'tools', label: 'Tools', hint: 'Hub utilities' },
];

/**
 * College-style Teaching Sanctum hub for seekers.
 */
export default function SanctumStudentHub({ user }) {
  const [tab, setTab] = useState('open');
  const [search, setSearch] = useState('');
  const [transcript, setTranscript] = useState(null);
  const [honors, setHonors] = useState([]);
  const [events, setEvents] = useState([]);
  const [opps, setOpps] = useState([]);
  const [thanks, setThanks] = useState([]);
  const [mentorTopic, setMentorTopic] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [bundles, setBundles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const isPro = isCustomerProUser(user) || isCustomerPro(user);

  useEffect(() => {
    if (!user?.email) return;
    buildTranscript(user.email).then(setTranscript).catch(() => {});
    fetchHonorRoll(user.email).then(setHonors).catch(() => {});
    fetchCalendarEvents().then(setEvents).catch(() => {});
    fetchOpportunities().then(setOpps).catch(() => {});
    fetchThankYouNotesForStudent(user.email).then(setThanks).catch(() => {});
    fetchBundles().then(setBundles).catch(() => []);
  }, [user?.email]);

  useEffect(() => {
    setLoadingCourses(true);
    fetchPublishedCourses({ search })
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, [search]);

  const now = Date.now();
  const openCourses = courses.filter((c) => c.published !== false);
  const upcoming = events.filter((e) => new Date(e.starts_at).getTime() >= now - 86400000);
  const closedEvents = events.filter((e) => new Date(e.starts_at).getTime() < now - 86400000);
  const filteredOpen = openCourses.filter((c) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(s) ||
      c.description?.toLowerCase().includes(s) ||
      c.vendors?.name?.toLowerCase().includes(s) ||
      c.vendors?.city?.toLowerCase().includes(s)
    );
  });

  const requestMentorship = async () => {
    setErr('');
    setMsg('');
    if (!user?.email) {
      setErr('Sign in to request mentorship.');
      return;
    }
    if (!mentorTopic.trim()) {
      setErr('Describe the topic you want guidance on.');
      return;
    }
    setBusy(true);
    try {
      await requestMentor({
        seekerEmail: user.email,
        seekerName: user.name,
        topic: mentorTopic.trim(),
      });
      setMsg('Mentorship request sent. Pro practitioners see this in Teaching analytics and may message you.');
      setMentorTopic('');
    } catch (e) {
      setErr(e.message || 'Could not send request');
    }
    setBusy(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Sticky college search */}
      <div className="sticky top-0 z-20 -mx-1 mb-6 pt-1 pb-3 bg-[var(--color-cream,#faf7f5)]/95 backdrop-blur border-b border-[#4a1942]/10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227] font-semibold">Teaching Sanctum</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#4a1942] heading-font">Student hub</h1>
          </div>
          <div className="flex-1 flex rounded-xl overflow-hidden border-2 border-[#4a1942] bg-white shadow-sm">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search classes, topics, teachers…"
              className="flex-1 min-w-0 px-4 py-2.5 text-sm outline-none"
            />
            <Link
              to={`/courses${search ? `?q=${encodeURIComponent(search)}` : ''}`}
              className="px-4 bg-[#4a1942] text-white text-sm font-semibold flex items-center"
            >
              Catalog
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                tab === t.id
                  ? 'bg-[#4a1942] text-white border-[#4a1942]'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-2xl border bg-white mb-6">
        <ProfileAvatarFrame avatarUrl={user?.avatar} name={user?.name} size="md" />
        <div className="min-w-0">
          <p className="font-medium">{user?.name || 'Seeker'}</p>
          <p className="text-xs text-gray-500">
            Digital seeker ID · {isPro ? 'Pro Member tools unlocked' : 'Free tools + Pro upgrades'}
          </p>
        </div>
        <Link to="/courses" className="ml-auto text-xs font-semibold underline text-[#4a1942] shrink-0">
          Full catalog →
        </Link>
      </div>

      {/* Hub cards */}
      {tab === 'open' && (
        <section className="space-y-4">
          <h2 className="font-semibold text-[#4a1942]">Open classes</h2>
          {loadingCourses && <p className="text-sm text-gray-500">Loading classes…</p>}
          {!loadingCourses && filteredOpen.length === 0 && (
            <p className="text-sm text-gray-500 rounded-2xl border border-dashed p-6 text-center">
              No open classes match. Try another search or browse the full catalog.
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            {filteredOpen.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="rounded-2xl border bg-white p-4 hover:border-[#c9a227]/50 hover:shadow-sm transition"
              >
                <p className="font-semibold text-[#4a1942] line-clamp-1">{c.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.vendors?.name || 'Practitioner'}</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.description}</p>
                <div className="flex justify-between items-center mt-3 text-sm">
                  <span className="font-semibold text-[#4a1942]">${Number(c.price || 0).toFixed(2)}</span>
                  {c.pro_member_price != null && (
                    <span className="text-xs text-emerald-700">Pro ${Number(c.pro_member_price).toFixed(2)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {tab === 'upcoming' && (
        <section className="space-y-3">
          <h2 className="font-semibold text-[#4a1942]">Upcoming calendar</h2>
          {upcoming.length === 0 && (
            <p className="text-sm text-gray-500">No upcoming events yet. Check open classes to enroll.</p>
          )}
          {upcoming.map((e) => (
            <div key={e.id} className="rounded-2xl border bg-white p-4 text-sm">
              <p className="font-medium text-[#4a1942]">{e.title}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(e.starts_at).toLocaleString()}</p>
              {e.description && <p className="text-gray-600 mt-2">{e.description}</p>}
            </div>
          ))}
          <Link to="/courses" className="inline-block text-sm font-semibold underline text-[#4a1942]">
            Browse open classes →
          </Link>
        </section>
      )}

      {tab === 'closed' && (
        <section className="space-y-3">
          <h2 className="font-semibold text-[#4a1942]">Closed sessions</h2>
          <p className="text-xs text-gray-500">
            Past calendar sessions and ended cohort dates. Your personal enrollments live under My classes &amp; History.
          </p>
          {closedEvents.length === 0 && (
            <p className="text-sm text-gray-500 rounded-2xl border border-dashed p-6 text-center">
              No closed sessions on the sanctum calendar yet.
            </p>
          )}
          {closedEvents.map((e) => (
            <div key={e.id} className="rounded-2xl border bg-white p-4 text-sm opacity-90">
              <div className="flex justify-between gap-2">
                <p className="font-medium text-[#4a1942]">{e.title}</p>
                <span className="text-[10px] uppercase font-bold text-gray-500 self-start">Closed</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{new Date(e.starts_at).toLocaleString()}</p>
              {e.description && <p className="text-gray-600 mt-2">{e.description}</p>}
            </div>
          ))}
          <Link to="/courses" className="inline-block text-sm font-semibold underline text-[#4a1942]">
            Find open classes →
          </Link>
        </section>
      )}

      {tab === 'mine' && (
        <section className="space-y-3">
          <h2 className="font-semibold text-[#4a1942]">My classes</h2>
          {(!transcript || transcript.courses.length === 0) && (
            <p className="text-sm text-gray-500">
              You are not enrolled yet.{' '}
              <Link to="/courses" className="underline text-[#4a1942]">
                Find a class
              </Link>
            </p>
          )}
          {(transcript?.courses || []).map((c, i) => (
            <div key={i} className="rounded-2xl border bg-white p-4 text-sm flex justify-between gap-3">
              <div>
                <p className="font-medium text-[#4a1942]">{c.title || 'Course'}</p>
                <p className="text-xs text-gray-500">
                  {c.lessons_completed || 0} lessons done
                  {c.enrolled_at ? ` · since ${new Date(c.enrolled_at).toLocaleDateString()}` : ''}
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 self-center">Open</span>
            </div>
          ))}
        </section>
      )}

      {tab === 'history' && (
        <section className="space-y-4">
          <h2 className="font-semibold text-[#4a1942]">History &amp; transcript</h2>
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-sm font-semibold mb-2">Unofficial transcript</h3>
            {(!transcript || transcript.courses.length === 0) && (
              <p className="text-sm text-gray-500">No history yet — enroll to build your record.</p>
            )}
            {(transcript?.courses || []).map((c, i) => (
              <p key={i} className="text-sm text-gray-700 py-1 border-b border-gray-50">
                {c.title} · {c.lessons_completed} lessons
              </p>
            ))}
            {(transcript?.badges || []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {transcript.badges.map((b) => (
                  <span key={b.id} className="text-xs px-2 py-1 rounded-full bg-[#4a1942]/5">
                    {STUDENT_BADGE_TYPES[b.badge_type]?.icon} {b.title}
                  </span>
                ))}
              </div>
            )}
          </div>
          {honors.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
              <h3 className="text-sm font-semibold mb-2">Honor roll</h3>
              <div className="flex flex-wrap gap-2">
                {honors.map((h) => {
                  const meta = HONOR_TYPES[h.honor_type] || HONOR_TYPES.deans_list;
                  return (
                    <span key={h.id} className="px-3 py-1.5 rounded-full bg-white border text-xs">
                      {meta.icon} {meta.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {tab === 'tools' && (
        <section className="space-y-6">
          <div className="rounded-3xl border border-[#c9a227]/30 bg-gradient-to-br from-[#4a1942] to-[#2d1230] text-white p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227] font-bold">College app hub</p>
            <h2 className="text-xl font-bold mt-1">Everything you need for the Sanctum</h2>
            <p className="text-sm text-white/80 mt-2">
              Free tools stay open. Pro tools appear greyed with a clear upgrade path — no hidden walls.
            </p>
          </div>

          <h3 className="font-semibold text-[#4a1942] text-sm uppercase tracking-wide">Free tools</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { to: '/courses', title: 'Course catalog', blurb: 'Browse all open classes' },
              { to: '/gathering', title: 'The Hearth', blurb: 'Community + nearby classes' },
              { to: '/customer-portal', title: 'Seeker portal', blurb: 'Orders, sessions, path' },
              { to: '/messages', title: 'Messages', blurb: 'Talk with teachers' },
              { to: '/learn', title: 'Guides library', blurb: 'Multimodal articles & culture notes' },
              { to: '/remedies', title: 'Remedies research', blurb: 'Educational monographs' },
            ].map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="rounded-2xl border bg-white p-4 hover:border-[#4a1942]/30 hover:shadow-sm transition"
              >
                <p className="font-semibold text-[#4a1942] text-sm">{t.title}</p>
                <p className="text-xs text-gray-500 mt-1">{t.blurb}</p>
              </Link>
            ))}
          </div>

          <h3 className="font-semibold text-[#4a1942] text-sm uppercase tracking-wide">Pro tools</h3>
          <ProToolLock
            user={user}
            planType="customer"
            title="Wellness GPA & deep path"
            blurb="Pro Members get deeper learning analytics, priority paths, and advanced Sanctum insights."
          >
            <WellnessGpaCard user={user} />
          </ProToolLock>

          <ProToolLock
            user={user}
            planType="customer"
            title="Credential wallet"
            blurb="Store and showcase class honors with Pro Member profile tools."
          >
            <CredentialWalletPanel user={user} />
          </ProToolLock>

          <ProToolLock
            user={user}
            planType="customer"
            title="Priority learning paths"
            blurb="Pro Members unlock curated path sequencing and solstice priority seating tools."
          >
            <div className="rounded-2xl border bg-white p-5">
              <p className="font-semibold text-[#4a1942]">Priority path builder</p>
              <p className="text-sm text-gray-600 mt-1">
                Stack open classes into a semester-style sequence with reminders. Available with Pro Member.
              </p>
              <Link to="/courses" className="inline-block mt-3 text-sm font-semibold text-[#4a1942] underline">
                Browse catalog to plan →
              </Link>
            </div>
          </ProToolLock>

          <SolsticeRsvpCard user={user} />

          {bundles.length > 0 && (
            <div className="rounded-2xl border p-5 bg-white">
              <h3 className="font-semibold text-sm text-[#4a1942] mb-2">Learning paths</h3>
              {bundles.map((b) => (
                <p key={b.id} className="text-sm text-gray-700 mb-1">
                  <strong>{b.title}</strong> — {b.description}
                </p>
              ))}
            </div>
          )}

          {opps.length > 0 && (
            <div className="rounded-2xl border p-5 bg-white">
              <h3 className="font-semibold text-sm text-[#4a1942] mb-2">Opportunities</h3>
              {opps.map((o) => (
                <div key={o.id} className="mb-3 text-sm">
                  <p className="font-medium">{o.title}</p>
                  <p className="text-gray-600">{o.description}</p>
                </div>
              ))}
            </div>
          )}

          {thanks.length > 0 && (
            <div className="rounded-2xl border p-5">
              <h3 className="font-semibold text-sm text-[#4a1942] mb-2">Practitioner blessings</h3>
              {thanks.map((n) => (
                <blockquote key={n.id} className="text-sm italic text-gray-700 border-l-2 border-[#4a1942]/20 pl-3 mb-3">
                  &ldquo;{n.message}&rdquo;
                  <button
                    type="button"
                    onClick={() =>
                      pinThankYouNote(n.id, user.email, !n.pinned_on_profile).then(() =>
                        fetchThankYouNotesForStudent(user.email).then(setThanks),
                      )
                    }
                    className="block text-xs text-[#4a1942] mt-1 underline not-italic"
                  >
                    {n.pinned_on_profile ? 'Unpin' : 'Pin on profile'}
                  </button>
                </blockquote>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Mentorship — always visible at bottom of hub */}
      <section className="mt-10 rounded-3xl border-2 border-[#4a1942]/15 bg-white p-5 sm:p-6">
        <h2 className="font-bold text-lg text-[#4a1942]">Request mentorship</h2>
        <p className="text-sm text-gray-600 mt-1">
          Tell practitioners what you want to learn. Pro teachers see open requests in Teaching analytics and can
          message you.
        </p>
        <input
          value={mentorTopic}
          onChange={(e) => setMentorTopic(e.target.value)}
          className="w-full border rounded-xl px-3 py-2.5 text-sm mt-3"
          placeholder="e.g. Beginner herbal safety, tarot ethics, ritual journaling…"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={requestMentorship}
            className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm font-semibold disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send mentorship request'}
          </button>
          <Link to="/messages" className="px-4 py-2 rounded-full border text-sm font-medium text-[#4a1942]">
            Open messages
          </Link>
        </div>
        {msg && <p className="text-sm text-emerald-800 mt-2">{msg}</p>}
        {err && <p className="text-sm text-red-700 mt-2">{err}</p>}
      </section>
    </div>
  );
}
