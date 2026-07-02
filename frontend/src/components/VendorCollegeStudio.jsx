import { useEffect, useState } from 'react';
import { SYLLABUS_TYPES, saveSyllabusItem, fetchSyllabus, issueHonor, HONOR_TYPES, postOpportunity } from '../lib/collegeApi';
import OfficeHoursPanel from './OfficeHoursPanel';
import { saveVendorStory } from '../lib/vendorStoryApi';
import {
  addPrerequisite,
  appointTA,
  createScholarship,
  fetchPrerequisitesForCourse,
  fetchScholarships,
  saveSemesterSettings,
} from '../lib/sanctumAdvancedApi';
import { fetchCohortPlaylist, saveCohortPlaylist } from '../lib/cohortApi';

const EMPTY_SLIDE = { title: '', body: '', image_url: '' };

export default function VendorCollegeStudio({ user, vendorId, courses = [] }) {
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [syllabus, setSyllabus] = useState([]);
  const [slides, setSlides] = useState([{ ...EMPTY_SLIDE }, { ...EMPTY_SLIDE }, { ...EMPTY_SLIDE }]);
  const [week, setWeek] = useState(1);
  const [itemTitle, setItemTitle] = useState('');
  const [itemType, setItemType] = useState('reading');
  const [honorEmail, setHonorEmail] = useState('');
  const [honorType, setHonorType] = useState('deans_list');
  const [oppTitle, setOppTitle] = useState('');
  const [oppDesc, setOppDesc] = useState('');
  const [msg, setMsg] = useState('');
  const [prereqId, setPrereqId] = useState('');
  const [prereqs, setPrereqs] = useState([]);
  const [semesterLabel, setSemesterLabel] = useState('');
  const [enrollmentCap, setEnrollmentCap] = useState('');
  const [scholarshipTitle, setScholarshipTitle] = useState('');
  const [scholarshipPct, setScholarshipPct] = useState(10);
  const [scholarships, setScholarships] = useState([]);
  const [taEmail, setTaEmail] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState('');

  useEffect(() => {
    if (!courseId) return;
    fetchSyllabus(Number(courseId)).then(setSyllabus).catch(() => setSyllabus([]));
    fetchPrerequisitesForCourse(Number(courseId)).then(setPrereqs).catch(() => setPrereqs([]));
    fetchScholarships(Number(courseId)).then(setScholarships).catch(() => setScholarships([]));
    fetchCohortPlaylist(Number(courseId)).then(setPlaylistUrl).catch(() => setPlaylistUrl(''));
    const c = courses.find((x) => String(x.id) === String(courseId));
    if (c) {
      setSemesterLabel(c.semester_label || '');
      setEnrollmentCap(c.enrollment_cap ? String(c.enrollment_cap) : '');
    }
  }, [courseId, courses]);

  const addSyllabus = async () => {
    if (!itemTitle.trim() || !courseId) return;
    await saveSyllabusItem({ course_id: Number(courseId), week_number: week, title: itemTitle, item_type: itemType, sort_order: syllabus.length });
    setSyllabus(await fetchSyllabus(Number(courseId)));
    setItemTitle('');
  };

  const saveStory = async () => {
    await saveVendorStory(vendorId, slides);
    setMsg('Origin story saved (3 slides max).');
  };

  const issue = async () => {
    if (!honorEmail.trim()) return;
    await issueHonor({ userEmail: honorEmail, termLabel: `Term ${new Date().getFullYear()}`, honorType, vendorId });
    setMsg('Honor roll entry issued.');
  };

  const addOpp = async () => {
    if (!oppTitle.trim()) return;
    await postOpportunity({ vendor_id: vendorId, title: oppTitle, description: oppDesc, opp_type: 'apprenticeship' });
    setMsg('Opportunity posted.');
  };

  const addPrereq = async () => {
    if (!prereqId || !courseId) return;
    await addPrerequisite(Number(courseId), Number(prereqId));
    setPrereqs(await fetchPrerequisitesForCourse(Number(courseId)));
    setPrereqId('');
    setMsg('Prerequisite linked.');
  };

  const saveSemester = async () => {
    if (!courseId) return;
    await saveSemesterSettings(Number(courseId), { semester_label: semesterLabel, enrollment_cap: enrollmentCap });
    setMsg('Semester settings saved.');
  };

  const addScholarship = async () => {
    if (!scholarshipTitle.trim() || !courseId) return;
    await createScholarship({ vendor_id: vendorId, course_id: Number(courseId), title: scholarshipTitle, discount_percent: scholarshipPct });
    setScholarships(await fetchScholarships(Number(courseId)));
    setScholarshipTitle('');
    setMsg('Scholarship created.');
  };

  const addTA = async () => {
    if (!taEmail.trim() || !courseId) return;
    await appointTA(Number(courseId), taEmail);
    setTaEmail('');
    setMsg('Teaching assistant appointed.');
  };

  const savePlaylist = async () => {
    if (!courseId) return;
    await saveCohortPlaylist(Number(courseId), playlistUrl);
    setMsg('Cohort playlist saved.');
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border p-5 bg-white">
        <h3 className="font-semibold text-[#4a1942] mb-3">Origin story carousel (3 slides)</h3>
        {slides.map((s, i) => (
          <div key={i} className="mb-3 space-y-1">
            <input value={s.title} onChange={(e) => { const n = [...slides]; n[i] = { ...n[i], title: e.target.value }; setSlides(n); }} className="w-full border rounded-xl px-3 py-2 text-sm" placeholder={`Slide ${i + 1} title`} />
            <textarea value={s.body} onChange={(e) => { const n = [...slides]; n[i] = { ...n[i], body: e.target.value }; setSlides(n); }} rows={2} className="w-full border rounded-xl px-3 py-2 text-sm" placeholder="Story text" />
          </div>
        ))}
        <button type="button" onClick={saveStory} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Save story</button>
      </section>

      <section className="rounded-2xl border p-5">
        <h3 className="font-semibold text-[#4a1942] mb-3">Syllabus builder</h3>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="border rounded-xl px-3 py-2 text-sm mb-3 w-full">
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <div className="flex flex-wrap gap-2 mb-2">
          <input type="number" value={week} onChange={(e) => setWeek(Number(e.target.value))} className="w-20 border rounded-xl px-2 py-2 text-sm" min={1} />
          <select value={itemType} onChange={(e) => setItemType(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
            {Object.entries(SYLLABUS_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} className="flex-1 border rounded-xl px-3 py-2 text-sm" placeholder="Week item title" />
          <button type="button" onClick={addSyllabus} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Add</button>
        </div>
        <p className="text-xs text-gray-500">{syllabus.length} syllabus items</p>
      </section>

      <OfficeHoursPanel user={user} vendorId={vendorId} courseId={courseId ? Number(courseId) : null} vendorMode />

      <section className="rounded-2xl border p-5 bg-indigo-50/20">
        <h3 className="font-semibold text-[#4a1942] mb-3">Semester &amp; enrollment cap</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          <input value={semesterLabel} onChange={(e) => setSemesterLabel(e.target.value)} className="border rounded-xl px-3 py-2 text-sm" placeholder="e.g. Spring 2026" />
          <input type="number" value={enrollmentCap} onChange={(e) => setEnrollmentCap(e.target.value)} className="w-28 border rounded-xl px-3 py-2 text-sm" placeholder="Cap" min={1} />
          <button type="button" onClick={saveSemester} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Save</button>
        </div>
        <p className="text-[10px] text-gray-500">Caps are convenience limits — not accredited enrollment.</p>
      </section>

      <section className="rounded-2xl border p-5">
        <h3 className="font-semibold text-[#4a1942] mb-3">Course prerequisites</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          <select value={prereqId} onChange={(e) => setPrereqId(e.target.value)} className="border rounded-xl px-3 py-2 text-sm flex-1">
            <option value="">Select required course…</option>
            {courses.filter((c) => String(c.id) !== String(courseId)).map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <button type="button" onClick={addPrereq} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Add</button>
        </div>
        {prereqs.length > 0 && (
          <ul className="text-xs text-gray-600 space-y-1">
            {prereqs.map((pid) => (
              <li key={pid}>Requires: {courses.find((c) => c.id === pid)?.title || `Course #${pid}`}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border p-5 bg-emerald-50/20">
        <h3 className="font-semibold text-[#4a1942] mb-3">Sanctum scholarships</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          <input value={scholarshipTitle} onChange={(e) => setScholarshipTitle(e.target.value)} className="flex-1 border rounded-xl px-3 py-2 text-sm" placeholder="Scholarship name" />
          <input type="number" value={scholarshipPct} onChange={(e) => setScholarshipPct(Number(e.target.value))} className="w-20 border rounded-xl px-2 py-2 text-sm" min={1} max={100} />
          <button type="button" onClick={addScholarship} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Create</button>
        </div>
        {scholarships.map((s) => (
          <p key={s.id} className="text-xs text-gray-600">{s.title} — {s.discount_percent}% off</p>
        ))}
      </section>

      <section className="rounded-2xl border p-5 bg-[#faf7f9]">
        <h3 className="font-semibold text-[#4a1942] mb-3">Cohort study playlist</h3>
        <div className="flex flex-wrap gap-2">
          <input value={playlistUrl} onChange={(e) => setPlaylistUrl(e.target.value)} className="flex-1 border rounded-xl px-3 py-2 text-sm" placeholder="Spotify or YouTube link…" />
          <button type="button" onClick={savePlaylist} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Save</button>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">Shared vibe for enrolled students — optional.</p>
      </section>

      <section className="rounded-2xl border p-5">
        <h3 className="font-semibold text-[#4a1942] mb-3">Teaching assistants</h3>
        <div className="flex flex-wrap gap-2">
          <input value={taEmail} onChange={(e) => setTaEmail(e.target.value)} className="border rounded-xl px-3 py-2 text-sm" placeholder="Assistant email" />
          <button type="button" onClick={addTA} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Appoint TA</button>
        </div>
      </section>

      <section className="rounded-2xl border p-5 bg-amber-50/30">
        <h3 className="font-semibold text-[#4a1942] mb-3">Issue honor roll</h3>
        <div className="flex flex-wrap gap-2">
          <input value={honorEmail} onChange={(e) => setHonorEmail(e.target.value)} className="border rounded-xl px-3 py-2 text-sm" placeholder="Student email" />
          <select value={honorType} onChange={(e) => setHonorType(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
            {Object.entries(HONOR_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button type="button" onClick={issue} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Issue honor</button>
        </div>
      </section>

      <section className="rounded-2xl border p-5">
        <h3 className="font-semibold text-[#4a1942] mb-3">Post opportunity (apprenticeship / research)</h3>
        <input value={oppTitle} onChange={(e) => setOppTitle(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm mb-2" placeholder="Title" />
        <textarea value={oppDesc} onChange={(e) => setOppDesc(e.target.value)} rows={2} className="w-full border rounded-xl px-3 py-2 text-sm mb-2" />
        <button type="button" onClick={addOpp} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Post</button>
      </section>

      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}