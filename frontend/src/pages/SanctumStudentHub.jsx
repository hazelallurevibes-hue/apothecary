import { useEffect, useState } from 'react';
import SeekerJourneyMap from '../components/SeekerJourneyMap';
import { buildTranscript, fetchHonorRoll, fetchCalendarEvents, fetchOpportunities, HONOR_TYPES, requestMentor } from '../lib/collegeApi';
import { fetchThankYouNotesForStudent, pinThankYouNote } from '../lib/thankYouApi';
import { STUDENT_BADGE_TYPES } from '../lib/studentBadgesApi';
import ProfileAvatarFrame from '../components/ProfileAvatarFrame';
import CredentialWalletPanel from '../components/CredentialWalletPanel';
import WellnessGpaCard from '../components/WellnessGpaCard';
import { fetchBundles } from '../lib/sanctumAdvancedApi';

export default function SanctumStudentHub({ user }) {
  const [transcript, setTranscript] = useState(null);
  const [honors, setHonors] = useState([]);
  const [events, setEvents] = useState([]);
  const [opps, setOpps] = useState([]);
  const [thanks, setThanks] = useState([]);
  const [mentorTopic, setMentorTopic] = useState('');
  const [msg, setMsg] = useState('');
  const [bundles, setBundles] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    buildTranscript(user.email).then(setTranscript).catch(() => {});
    fetchHonorRoll(user.email).then(setHonors).catch(() => {});
    fetchCalendarEvents().then(setEvents).catch(() => {});
    fetchOpportunities().then(setOpps).catch(() => {});
    fetchThankYouNotesForStudent(user.email).then(setThanks).catch(() => {});
    fetchBundles().then(setBundles).catch(() => []);
  }, [user?.email]);

  const requestMentorship = async () => {
    if (!mentorTopic.trim()) return;
    await requestMentor({ seekerEmail: user.email, topic: mentorTopic });
    setMsg('Mentor request sent — a practitioner may reach out.');
    setMentorTopic('');
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-[#4a1942]/60">Teaching Sanctum</p>
        <h1 className="text-3xl font-bold text-[#4a1942]">Student hub</h1>
        <p className="text-gray-600 mt-2">Transcript, honors, calendar, mentorship — your academic sanctuary.</p>
      </header>

      <SeekerJourneyMap user={user} />
      <WellnessGpaCard user={user} />
      <CredentialWalletPanel user={user} />

      <div className="flex items-center gap-4 p-4 rounded-2xl border bg-white">
        <ProfileAvatarFrame avatarUrl={user?.avatar} name={user?.name} size="md" />
        <div>
          <p className="font-medium">{user?.name}</p>
          <p className="text-xs text-gray-500">Digital seeker ID · Hazel Allure Sanctum</p>
        </div>
      </div>

      {honors.length > 0 && (
        <section className="rounded-2xl border border-amber-200/60 bg-amber-50/30 p-5">
          <h2 className="font-semibold text-[#4a1942] mb-3">Honor roll</h2>
          <div className="flex flex-wrap gap-2">
            {honors.map((h) => {
              const meta = HONOR_TYPES[h.honor_type] || HONOR_TYPES.deans_list;
              return (
                <span key={h.id} className="px-3 py-2 rounded-full bg-white border text-sm">
                  {meta.icon} {meta.label} · {h.term_label}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {transcript && (
        <section className="rounded-2xl border p-5 bg-white">
          <h2 className="font-semibold text-[#4a1942] mb-3">Unofficial transcript</h2>
          {transcript.courses.length === 0 && <p className="text-sm text-gray-500">No enrollments yet.</p>}
          {transcript.courses.map((c, i) => (
            <p key={i} className="text-sm text-gray-700 py-1 border-b border-gray-50">
              {c.title} · {c.lessons_completed} lessons · {c.enrolled_at ? new Date(c.enrolled_at).toLocaleDateString() : ''}
            </p>
          ))}
          {transcript.badges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {transcript.badges.map((b) => (
                <span key={b.id} className="text-xs px-2 py-1 rounded-full bg-[#4a1942]/5">
                  {STUDENT_BADGE_TYPES[b.badge_type]?.icon} {b.title}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {thanks.length > 0 && (
        <section className="rounded-2xl border p-5">
          <h2 className="font-semibold text-[#4a1942] mb-3">Practitioner blessings</h2>
          {thanks.map((n) => (
            <blockquote key={n.id} className="text-sm italic text-gray-700 border-l-2 border-[#4a1942]/20 pl-3 mb-3">
              &ldquo;{n.message}&rdquo; — {n.vendors?.name}
              <button type="button" onClick={() => pinThankYouNote(n.id, user.email, !n.pinned_on_profile).then(() => fetchThankYouNotesForStudent(user.email).then(setThanks))} className="block text-xs text-[#4a1942] mt-1 underline">
                {n.pinned_on_profile ? 'Unpin from profile' : 'Pin on profile'}
              </button>
            </blockquote>
          ))}
        </section>
      )}

      {bundles.length > 0 && (
        <section className="rounded-2xl border p-5">
          <h2 className="font-semibold text-[#4a1942] mb-2">Learning paths</h2>
          {bundles.map((b) => (
            <p key={b.id} className="text-sm text-gray-700 mb-1"><strong>{b.title}</strong> — {b.description}</p>
          ))}
        </section>
      )}

      {events.length > 0 && (
        <section className="rounded-2xl border p-5 bg-[#faf7f9]">
          <h2 className="font-semibold text-[#4a1942] mb-2">Academic calendar</h2>
          {events.slice(0, 8).map((e) => (
            <p key={e.id} className="text-sm text-gray-700">{new Date(e.starts_at).toLocaleString()} — {e.title}</p>
          ))}
        </section>
      )}

      {opps.length > 0 && (
        <section className="rounded-2xl border p-5">
          <h2 className="font-semibold text-[#4a1942] mb-3">Research &amp; opportunities</h2>
          {opps.map((o) => (
            <div key={o.id} className="mb-3 text-sm">
              <p className="font-medium">{o.title} · {o.vendors?.name}</p>
              <p className="text-gray-600">{o.description}</p>
              {o.application_url && <a href={o.application_url} className="text-xs underline text-[#4a1942]">Apply</a>}
            </div>
          ))}
        </section>
      )}

      <section className="rounded-2xl border p-5">
        <h2 className="font-semibold text-[#4a1942] mb-2">Request mentorship</h2>
        <input value={mentorTopic} onChange={(e) => setMentorTopic(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm mb-2" placeholder="Topic you seek guidance on…" />
        <button type="button" onClick={requestMentorship} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Request mentor</button>
      </section>

      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}