import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SB_PUBLISHABLE_KEY") || "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Marks the caller's email as verified in Auth + public.users.
 * Requires a valid Supabase session JWT (from magic-link / confirm click).
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ") || authHeader.length < 30) {
      return json({
        ok: false,
        error:
          "Open the verification link in your Hazel Allure email first (that signs you in), then tap “I verified — refresh status”.",
      }, 401);
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY || SERVICE_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await userClient.auth.getUser();
    if (error || !data?.user?.id || !data.user.email) {
      return json({
        ok: false,
        error:
          "Session expired or missing. Open the verify link from your email again, then press refresh.",
      }, 401);
    }

    const authUser = data.user;
    const email = authUser.email!.toLowerCase();

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Force Auth email confirmed
    const { error: updErr } = await admin.auth.admin.updateUserById(authUser.id, {
      email_confirm: true,
    });
    if (updErr) {
      console.warn("updateUserById", updErr.message);
    }

    // public.users flag for app gates / banners
    const { error: dbErr } = await admin
      .from("users")
      .update({ email_verified: true })
      .ilike("email", email);

    if (dbErr) {
      console.warn("users.email_verified", dbErr.message);
    }

    return json({
      ok: true,
      verified: true,
      email,
      message: "Email verified — Hazel Allure recognizes this account as confirmed.",
    });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
