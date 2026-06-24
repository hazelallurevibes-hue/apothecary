import { supabase } from './supabaseClient';

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function checkoutCourseEnrollment({ courseId, email }) {
  const res = await fetch(`${FN_BASE}/create-course-checkout`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      course_id: courseId,
      email: email?.trim().toLowerCase(),
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Checkout failed');
  if (json.url) {
    window.location.href = json.url;
    return json;
  }
  return json;
}