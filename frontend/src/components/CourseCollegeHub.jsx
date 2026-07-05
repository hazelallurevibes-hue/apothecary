import { useEffect, useState } from 'react';
import {
  SYLLABUS_TYPES,
  fetchSyllabus,
  fetchStudyGroups,
  createStudyGroup,
  joinStudyGroup,
  submitEvaluation,
  joinWaitlist,
  fetchCalendarEvents,
  submitAssignment,
} from '../lib/collegeApi';
import { openCertificatePrint } from '../lib/certificatePdf';
import OfficeHoursPanel from './OfficeHoursPanel';
import ProFeatureHint from './ProFeatureHint';
import { customerCan } from '../lib/plans';
import {
  checkInEvent,
  checkPrerequisites,
  fetchPrerequisitesForCourse,
  fetchScholarships,
  graduateAlumni,
  issueCredentialWallet,
  submitCapstone,
} from '../lib/sanctumAdvancedApi';

export default function CourseCollegeHub({ user, course, enrolled, vendorName, progressPercent = 0 }) {
  const [syllabus, setSyllabus] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [evalRating, setEvalRating] = useState(5);
  const [evalText, setEvalText] = useState('');
  const [groupName, setGroupName] = useState('');
  const [msg, setMsg] = useState('');
  const [submission, setSubmission] = useState({});
  const [prereqIds, setPrereqIds] = useState([]);
  const [prereqMet, setPrereqMet] = useState(true);
  const [scholarships, setScholarships] = useState([]);
  const [capstoneTitle, setCapstoneTitle] = useState('');
  const [capstoneBody, setCapstoneBody] = useState('');
  const [printing, setPrinting] = useState(false);

  const courseId = course?.id;
  const vendorId = course?.vendor_id;
  const canEval = customerCan(user, 'lesson_progress');

  useEffect(() => {
    if (!courseId) return;
    fetchSyllabus(courseId).then(setSyllabus).catch(() => {});
    fetchStudyGroups(courseId).then(setGroups).catch(() => {});
    fetchCalendarEvents({ courseId }).then(setEvents).catch(() => {});
    fetchPrerequisitesForCourse(courseId).then(setPrereqIds).catch(() => setPrereqIds([]));
    fetchScholarships(courseId).then(setScholarships).catch(() => setScholarships([]));
    if (user?.email) {
      checkPrerequisites(courseId, user.email).then((r) => setPrereqMet(r.met)).catch(() => setPrereqMet(true));
    }
  }, [courseId, user?.email]);

  if (!courseId) return null;

  const onWaitlist = async () => {
    if (!user?.email) return;
    await joinWaitlist(courseId, user.email);
    setMsg('You are on the waitlist — we will notify you when a seat opens.');
  };

  const onEval = async () => {
    if (!user?.email) return;
    await submitEvaluation({ courseId, userEmail: user.email, rating: evalRating, feedback: evalText, wouldRecommend: true, anonymous: true });
    setMsg('Thank you — your course evaluation was recorded.');
  };

  const onCreateGroup = async () => {
    if (!user?.email || !groupName.trim()) return;
    await createStudyGroup({ courseId, name: groupName, createdBy: user.email });
    setGroups(await fetchStudyGroups(courseId));
    setGroupName('');
  };

  const onJoinGroup = async (gid) => {
    await joinStudyGroup(gid, user.email);
    setMsg('Joined study group.');
  };

  const onSubmitAssignment = async (itemId) => {
    const body = submission[itemId];
    if (!body?.trim()) return;
    await submitAssignment({ syllabusItemId: itemId, studentEmail: user.email, body });
    setMsg('Assignment submitted.');
  };

  const printCert = async () => {
    if (progressPercent < 80) { setMsg('Complete at least 80% of lessons to download your certificate.'); return; }
    setPrinting(true);
    try {
      const cred = await issueCredentialWallet({
        userEmail: user.email,
        credentialType: 'completion',
        referenceId: courseId,
        title: `${course.title} — completion`,
      });
      await graduateAlumni(courseId, user.email);
      openCertificatePrint({
        studentName: user?.name || user?.email?.split('@')[0],
        courseTitle: course.title,
        vendorName: vendorName || 'Practitioner',
        templateTitle: 'Certificate of Completion',
        bodyText: 'For dedicated study and mindful completion of course materials.',
        verifyHash: cred.verify_hash,
      });
      setMsg('Certificate saved to your credential wallet.');
    } catch (e) {
      setMsg(e.message || 'Could not issue certificate.');
    }
    setPrinting(false);
  };

  const onCapstone = async () => {
    if (!capstoneTitle.trim()) return;
    await submitCapstone({ courseId, studentEmail: user.email, title: capstoneTitle, body: capstoneBody });
    setMsg('Capstone submitted to your practitioner.');
    setCapstoneTitle('');
    setCapstoneBody('');
  };

  const onCheckIn = async (eventId) => {
    await checkInEvent(eventId, user.email);
    setMsg('Checked in — thank you for showing up.');
  };

  return (
    <div className="space-y-6 mt-8">
      {prereqIds.length > 0 && !enrolled && (
        <div className={`rounded-2xl border p-4 ${prereqMet ? 'border-emerald-200 bg-emerald-50/40' : 'border-amber-300 bg-amber-50/50'}`}>
          <p className="text-sm font-medium text-[#4a1942]">Prerequisites</p>
          <p className="text-xs text-gray-600 mt-1">
            {prereqMet ? 'You have met the required prior courses.' : 'Complete prerequisite courses before enrolling.'}
          </p>
        </div>
      )}

      {scholarships.length > 0 && !enrolled && (
        <section className="rounded-2xl border border-emerald-200/60 bg-emerald-50/30 p-4">
          <h3 className="font-semibold text-[#4a1942] text-sm mb-2">Available scholarships</h3>
          {scholarships.map((s) => (
            <p key={s.id} className="text-xs text-gray-700">{s.title} — {s.discount_percent}% off{s.code ? ` · code ${s.code}` : ''}</p>
          ))}
        </section>
      )}

      {!enrolled && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex flex-wrap gap-3 items-center justify-between">
          <p className="text-sm text-amber-900">Course full or not yet open? Join the waitlist.</p>
          <button type="button" onClick={onWaitlist} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Join waitlist</button>
        </div>
      )}

      {syllabus.length > 0 && (
        <section className="rounded-2xl border p-4 bg-white">
          <h3 className="font-semibold text-[#4a1942] mb-3">Syllabus</h3>
          <div className="space-y-2">
            {syllabus.map((item) => {
              const meta = SYLLABUS_TYPES[item.item_type] || SYLLABUS_TYPES.reading;
              return (
                <div key={item.id} className="flex flex-wrap gap-2 items-start text-sm border rounded-xl p-3">
                  <span>{meta.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">Week {item.week_number}: {item.title}</p>
                    {item.due_at && <p className="text-xs text-gray-500">Due {new Date(item.due_at).toLocaleDateString()}</p>}
                    {item.body && <p className="text-gray-600 mt-1">{item.body}</p>}
                    {enrolled && item.item_type === 'assignment' && (
                      <div className="mt-2">
                        <textarea value={submission[item.id] || ''} onChange={(e) => setSubmission((p) => ({ ...p, [item.id]: e.target.value }))} rows={2} className="w-full border rounded-lg text-xs px-2 py-1" placeholder="Your reflection or assignment…" />
                        <button type="button" onClick={() => onSubmitAssignment(item.id)} className="text-xs mt-1 underline text-[#4a1942]">Submit</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <OfficeHoursPanel user={user} vendorId={vendorId} courseId={courseId} />

      {enrolled && (
        <>
          <section className="rounded-2xl border p-4">
            <h3 className="font-semibold text-[#4a1942] mb-2">Study groups</h3>
            <div className="flex gap-2 mb-3">
              <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="New group name" className="flex-1 border rounded-xl px-3 py-2 text-sm" />
              <button type="button" onClick={onCreateGroup} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Create</button>
            </div>
            {groups.map((g) => (
              <div key={g.id} className="flex justify-between items-center text-sm border rounded-xl px-3 py-2 mb-2">
                <span>{g.name}</span>
                <button type="button" onClick={() => onJoinGroup(g.id)} className="text-xs underline">Join</button>
              </div>
            ))}
          </section>

          {events.length > 0 && (
            <section className="rounded-2xl border p-4 bg-[#faf7f9]">
              <h3 className="font-semibold text-[#4a1942] mb-2">Academic calendar</h3>
              {events.map((e) => (
                <div key={e.id} className="flex flex-wrap justify-between items-center text-sm text-gray-700 mb-2 gap-2">
                  <span>{new Date(e.starts_at).toLocaleDateString()} — {e.title}</span>
                  <button type="button" onClick={() => onCheckIn(e.id)} className="text-xs underline text-[#4a1942]">Check in</button>
                </div>
              ))}
            </section>
          )}

          {progressPercent >= 60 && (
            <section className="rounded-2xl border p-4">
              <h3 className="font-semibold text-[#4a1942] mb-2">Capstone project</h3>
              <input value={capstoneTitle} onChange={(e) => setCapstoneTitle(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm mb-2" placeholder="Project title" />
              <textarea value={capstoneBody} onChange={(e) => setCapstoneBody(e.target.value)} rows={3} className="w-full border rounded-xl px-3 py-2 text-sm mb-2" placeholder="Reflection, portfolio notes, or deliverable summary…" />
              <button type="button" onClick={onCapstone} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Submit capstone</button>
            </section>
          )}

          {progressPercent >= 50 && canEval && (
            <section className="rounded-2xl border p-4">
              <h3 className="font-semibold text-[#4a1942] mb-2">Course evaluation</h3>
              <select value={evalRating} onChange={(e) => setEvalRating(Number(e.target.value))} className="border rounded-xl px-3 py-2 text-sm mb-2">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
              </select>
              <textarea value={evalText} onChange={(e) => setEvalText(e.target.value)} rows={3} className="w-full border rounded-xl px-3 py-2 text-sm mb-2" placeholder="What helped you learn?" />
              <button type="button" onClick={onEval} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Submit evaluation</button>
            </section>
          )}
          {!canEval && enrolled && <ProFeatureHint hintKey="lesson_progress" user={user} />}

          {enrolled && (
            <button type="button" onClick={printCert} disabled={printing} className="px-5 py-2.5 rounded-full border border-[#4a1942] text-[#4a1942] text-sm disabled:opacity-50">
              {printing ? 'Issuing…' : 'Download completion certificate (PDF)'}
            </button>
          )}
        </>
      )}
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}