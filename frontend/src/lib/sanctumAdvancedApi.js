import { supabase } from './supabaseClient';

export const BANNED_CERT_KEYWORDS = [
  'medical doctor', 'physician', 'md', 'do', 'registered nurse', 'rn', 'np', 'pa-c',
  'licensed clinical', 'psychiatrist', 'psychologist license', 'dentist', 'dds', 'dmd',
  'pharmacist', 'pharmd', 'attorney', 'esq', 'cpa', 'pe license', 'accredited degree',
  'board certified physician', 'juris doctor', 'jd', 'doctorate of medicine',
];

export function validateCertificateTitle(title) {
  const lower = (title || '').toLowerCase();
  for (const banned of BANNED_CERT_KEYWORDS) {
    if (lower.includes(banned)) {
      return { ok: false, reason: `Certificates cannot imply licensed or accredited professions (e.g. doctor, RN, attorney). Use wellness or course-completion wording instead.` };
    }
  }
  return { ok: true };
}

function hashCredential(email, type, refId) {
  const raw = `${email}:${type}:${refId}:${Date.now()}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  return `HA-${Math.abs(h).toString(36).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
}

export async function issueCredentialWallet({ userEmail, credentialType, referenceId, title }) {
  const check = validateCertificateTitle(title);
  if (!check.ok) throw new Error(check.reason);
  const verify_hash = hashCredential(userEmail, credentialType, referenceId);
  const { data, error } = await supabase.from('credential_wallet').insert({
    user_email: userEmail.trim().toLowerCase(),
    credential_type: credentialType,
    reference_id: referenceId,
    verify_hash,
    title,
  }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchCredentialWallet(email) {
  const { data, error } = await supabase.from('credential_wallet').select('*').eq('user_email', email.trim().toLowerCase()).order('issued_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function verifyCredentialHash(hash) {
  const { data, error } = await supabase.from('credential_wallet').select('title, issued_at, credential_type, user_email').eq('verify_hash', hash).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function checkPrerequisites(courseId, userEmail) {
  const { data: prereqs } = await supabase.from('course_prerequisites').select('required_course_id').eq('course_id', courseId);
  if (!prereqs?.length) return { met: true, missing: [] };
  const { data: enrollments } = await supabase.from('vendor_course_enrollments').select('course_id').eq('user_email', userEmail.trim().toLowerCase());
  const enrolled = new Set((enrollments || []).map((e) => e.course_id));
  const missing = prereqs.filter((p) => !enrolled.has(p.required_course_id)).map((p) => p.required_course_id);
  return { met: missing.length === 0, missing };
}

export async function addPrerequisite(courseId, requiredCourseId) {
  const { error } = await supabase.from('course_prerequisites').insert({ course_id: courseId, required_course_id: requiredCourseId });
  if (error) throw new Error(error.message);
}

export async function fetchPrerequisitesForCourse(courseId) {
  const { data, error } = await supabase.from('course_prerequisites').select('required_course_id').eq('course_id', courseId);
  if (error) throw new Error(error.message);
  return (data || []).map((r) => r.required_course_id);
}

export async function saveSemesterSettings(courseId, settings) {
  const { error } = await supabase.from('vendor_courses').update({
    semester_label: settings.semester_label || null,
    enrollment_cap: settings.enrollment_cap ? Number(settings.enrollment_cap) : null,
    semester_starts_at: settings.semester_starts_at || null,
    semester_ends_at: settings.semester_ends_at || null,
  }).eq('id', courseId);
  if (error) throw new Error(error.message);
}

export async function fetchScholarships(courseId) {
  const { data, error } = await supabase.from('sanctum_scholarships').select('*').eq('course_id', courseId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function computeWellnessLearningScore(email) {
  const e = email.trim().toLowerCase();
  const [lessons, posts, evals, honors, alumni] = await Promise.all([
    supabase.from('course_lesson_progress').select('id', { count: 'exact', head: true }).eq('student_email', e),
    supabase.from('community_posts').select('id', { count: 'exact', head: true }).eq('author_email', e),
    supabase.from('course_evaluations').select('id', { count: 'exact', head: true }).eq('user_email', e),
    supabase.from('honor_roll_entries').select('id', { count: 'exact', head: true }).eq('user_email', e),
    supabase.from('course_alumni').select('id', { count: 'exact', head: true }).eq('user_email', e),
  ]);
  const components = {
    lessons: lessons.count || 0,
    community: posts.count || 0,
    evaluations: evals.count || 0,
    honors: honors.count || 0,
    alumni: alumni.count || 0,
  };
  const score = Math.min(4.0, (
    (components.lessons * 0.08) +
    (components.community * 0.05) +
    (components.evaluations * 0.15) +
    (components.honors * 0.25) +
    (components.alumni * 0.3)
  ));
  await supabase.from('wellness_learning_scores').upsert({
    user_email: e,
    score: Math.round(score * 100) / 100,
    components,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_email' });
  return { score, components };
}

export async function graduateAlumni(courseId, userEmail) {
  const { error } = await supabase.from('course_alumni').upsert({
    course_id: courseId,
    user_email: userEmail.trim().toLowerCase(),
  }, { onConflict: 'course_id,user_email' });
  if (error) throw new Error(error.message);
  await issueCredentialWallet({ userEmail, credentialType: 'completion', referenceId: courseId, title: 'Sanctum course completion' });
}

export async function submitCapstone({ courseId, studentEmail, title, body, portfolioUrl }) {
  const { error } = await supabase.from('capstone_submissions').upsert({
    course_id: courseId,
    student_email: studentEmail.trim().toLowerCase(),
    title,
    body,
    portfolio_url: portfolioUrl,
  }, { onConflict: 'course_id,student_email' });
  if (error) throw new Error(error.message);
}

export async function fetchBundles() {
  const { data, error } = await supabase.from('learning_path_bundles').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createScholarship(row) {
  const { data, error } = await supabase.from('sanctum_scholarships').insert(row).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function appointTA(courseId, assistantEmail) {
  const { error } = await supabase.from('course_teaching_assistants').upsert({
    course_id: courseId,
    assistant_email: assistantEmail.trim().toLowerCase(),
  }, { onConflict: 'course_id,assistant_email' });
  if (error) throw new Error(error.message);
}

export async function submitPeerReview({ submissionId, reviewerEmail, feedback }) {
  const { error } = await supabase.from('peer_reviews').upsert({
    submission_id: submissionId,
    reviewer_email: reviewerEmail.trim().toLowerCase(),
    feedback,
  }, { onConflict: 'submission_id,reviewer_email' });
  if (error) throw new Error(error.message);
}

export async function proposeGatheringTopic({ proposerEmail, title, body }) {
  const { error } = await supabase.from('gathering_proposals').insert({
    proposer_email: proposerEmail.trim().toLowerCase(),
    title,
    body,
  });
  if (error) throw new Error(error.message);
}

export async function voteProposal(proposalId) {
  const { data } = await supabase.from('gathering_proposals').select('votes').eq('id', proposalId).single();
  await supabase.from('gathering_proposals').update({ votes: (data?.votes || 0) + 1 }).eq('id', proposalId);
}

export async function checkInEvent(eventId, userEmail) {
  const { error } = await supabase.from('event_checkins').upsert({
    event_id: eventId,
    user_email: userEmail.trim().toLowerCase(),
  }, { onConflict: 'event_id,user_email' });
  if (error) throw new Error(error.message);
}