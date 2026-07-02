import { useEffect, useState } from 'react';
import ProFeatureHint from './ProFeatureHint';
import { vendorCan } from '../lib/plans';
import {
  deleteCertificate,
  fetchCertTemplates,
  fetchVendorCertificates,
  saveCertTemplate,
  uploadCertificate,
} from '../lib/certificatesApi';
import {
  fetchBadgesIssuedByVendor,
  fetchCourseEnrollees,
  issueStudentBadge,
  STUDENT_BADGE_TYPES,
} from '../lib/studentBadgesApi';
import { fetchVendorCourses } from '../lib/teachingPlatform';
import { trackAchievementEvent } from '../lib/achievements';

export default function VendorCertificateStudio({ user, vendorId }) {
  const canUse = vendorCan(user, 'certificates');
  const [certs, setCerts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [issued, setIssued] = useState([]);
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [file, setFile] = useState(null);
  const [tplTitle, setTplTitle] = useState('');
  const [tplBody, setTplBody] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [badgeType, setBadgeType] = useState('top_student');
  const [enrollees, setEnrollees] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!canUse || !vendorId) return;
    fetchVendorCertificates(vendorId).then(setCerts).catch(() => {});
    fetchCertTemplates(vendorId).then(setTemplates).catch(() => {});
    fetchVendorCourses(vendorId).then(setCourses).catch(() => {});
    fetchBadgesIssuedByVendor(vendorId).then(setIssued).catch(() => {});
  }, [canUse, vendorId]);

  useEffect(() => {
    if (!selectedCourse) return;
    fetchCourseEnrollees(Number(selectedCourse)).then(setEnrollees).catch(() => setEnrollees([]));
  }, [selectedCourse]);

  if (!canUse) {
    return (
      <div className="space-y-4">
        <ProFeatureHint hintKey="certificate_upload" />
        <ProFeatureHint hintKey="digital_cert" />
      </div>
    );
  }

  const onUpload = async () => {
    if (!title.trim()) return;
    try {
      await uploadCertificate({ vendorId, user, file, title, issuer });
      setCerts(await fetchVendorCertificates(vendorId));
      setTitle('');
      setIssuer('');
      setFile(null);
      const u = await trackAchievementEvent(user.email, 'vendor_first_certificate');
      if (u) window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: u }));
      setMessage('Certificate saved.');
    } catch (e) {
      setMessage(e.message);
    }
  };

  const onSaveTemplate = async () => {
    if (!tplTitle.trim()) return;
    await saveCertTemplate({
      vendorId,
      courseId: selectedCourse ? Number(selectedCourse) : null,
      title: tplTitle,
      bodyText: tplBody,
    });
    setTemplates(await fetchCertTemplates(vendorId));
    setTplTitle('');
    setTplBody('');
    setMessage('Digital template saved.');
  };

  const onIssueBadge = async () => {
    if (!studentEmail.trim()) return;
    const meta = STUDENT_BADGE_TYPES[badgeType];
    await issueStudentBadge({
      vendorId,
      courseId: selectedCourse ? Number(selectedCourse) : null,
      studentEmail,
      badgeType,
      title: meta.label,
    });
    setIssued(await fetchBadgesIssuedByVendor(vendorId));
    await trackAchievementEvent(user.email, 'issued_student_badge');
    setMessage(`Honors sent to ${studentEmail.split('@')[0]}.`);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#4a1942]/10 p-5 bg-white">
        <h3 className="font-semibold text-[#4a1942] mb-3">Upload credentials</h3>
        <p className="text-sm text-gray-500 mb-4">Licenses, training certificates, or credentials shown on your storefront.</p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="border rounded-xl px-3 py-2 text-sm" placeholder="Certificate title" />
          <input value={issuer} onChange={(e) => setIssuer(e.target.value)} className="border rounded-xl px-3 py-2 text-sm" placeholder="Issuing body (optional)" />
          <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0])} className="text-sm sm:col-span-2" />
        </div>
        <button type="button" onClick={onUpload} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Upload</button>
        <ul className="mt-4 space-y-2">
          {certs.map((c) => (
            <li key={c.id} className="flex justify-between items-center text-sm border rounded-xl px-3 py-2">
              <span>{c.title}{c.issuer ? ` · ${c.issuer}` : ''}</span>
              <button type="button" onClick={() => deleteCertificate(c.id, vendorId).then(() => fetchVendorCertificates(vendorId).then(setCerts))} className="text-red-600 text-xs">Remove</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[#4a1942]/10 p-5 bg-[#faf7f9]">
        <h3 className="font-semibold text-[#4a1942] mb-3">Digital certification templates</h3>
        <input value={tplTitle} onChange={(e) => setTplTitle(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm mb-2" placeholder="Template name" />
        <textarea value={tplBody} onChange={(e) => setTplBody(e.target.value)} rows={3} className="w-full border rounded-xl px-3 py-2 text-sm mb-2" placeholder="Completion wording…" />
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="border rounded-xl px-3 py-2 text-sm mb-3">
          <option value="">Any course</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <button type="button" onClick={onSaveTemplate} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Save template</button>
        {templates.length > 0 && <p className="text-xs text-gray-500 mt-3">{templates.length} template(s) ready</p>}
      </section>

      <section className="rounded-2xl border border-amber-200/60 p-5 bg-amber-50/30">
        <h3 className="font-semibold text-[#4a1942] mb-3">Issue student honors</h3>
        <p className="text-sm text-gray-600 mb-4">Top Student, Class Favorite, or completion — seekers may pin honors on their portrait (Pro Members).</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(STUDENT_BADGE_TYPES).map(([key, m]) => (
            <button key={key} type="button" onClick={() => setBadgeType(key)} className={`px-3 py-1.5 rounded-full text-xs border ${badgeType === key ? 'bg-[#4a1942] text-white' : ''}`}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm mb-2">
          <option value="">Select course</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        {enrollees.length > 0 && (
          <select value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm mb-2">
            <option value="">Choose student</option>
            {enrollees.map((e) => <option key={e.student_email} value={e.student_email}>{e.student_name || e.student_email}</option>)}
          </select>
        )}
        <input value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm mb-3" placeholder="Student email" />
        <button type="button" onClick={onIssueBadge} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Issue honor</button>
        {issued.length > 0 && <p className="text-xs text-gray-500 mt-3">{issued.length} honors issued recently</p>}
      </section>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}