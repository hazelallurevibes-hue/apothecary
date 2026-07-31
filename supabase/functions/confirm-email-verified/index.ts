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

function mapOtpType(raw: string | null | undefined): "signup" | "magiclink" | "invite" | "email" | "recovery" {
  const t = (raw || "signup").toLowerCase();
  if (t === "magiclink" || t === "magic_link") return "magiclink";
  if (t === "invite") return "invite";
  if (t === "email" || t === "email_change") return "email";
  if (t === "recovery") return "recovery";
  return "signup";
}

/**
 * Confirms email via:
 * A) token_hash + type from email link (verifyOtp) — primary, works with PKCE SPA
 * B) existing session JWT — secondary
 * Then forces Auth email_confirm + public.users.email_verified.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const tokenHash = String(body.token_hash || body.tokenHash || "").trim();
    const otpType = mapOtpType(body.type);
    const authHeader = req.headers.get("Authorization") || "";

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let email: string | null = null;
    let userId: string | null = null;

    // --- Path A: email link token_hash (no session required) ---
    if (tokenHash) {
      const { data, error } = await admin.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      });
      if (error) {
        // try alternate types if first fails
        let ok = false;
        for (const alt of ["signup", "email", "magiclink", "invite"] as const) {
          if (alt === otpType) continue;
          const retry = await admin.auth.verifyOtp({ token_hash: tokenHash, type: alt });
          if (!retry.error && retry.data?.user) {
            email = retry.data.user.email?.toLowerCase() || null;
            userId = retry.data.user.id;
            ok = true;
            break;
          }
        }
        if (!ok) {
          return json({
            ok: false,
            error:
              error.message ||
              "This verification link is invalid or expired. Tap Resend for a new email.",
          }, 400);
        }
      } else {
        email = data?.user?.email?.toLowerCase() || null;
        userId = data?.user?.id || null;
      }
    }

    // --- Path B: existing JWT session ---
    if (!userId && authHeader.startsWith("Bearer ") && authHeader.length > 30) {
      const userClient = createClient(SUPABASE_URL, ANON_KEY || SERVICE_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data, error } = await userClient.auth.getUser();
      if (!error && data?.user) {
        email = data.user.email?.toLowerCase() || null;
        userId = data.user.id;
      }
    }

    if (!userId || !email) {
      return json({
        ok: false,
        error:
          "Could not verify. Open the newest “Verify my email” link from Hazel Allure (check spam), or resend a fresh email.",
      }, 401);
    }

    // Force confirmed in Auth (idempotent)
    const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });
    if (updErr) console.warn("updateUserById", updErr.message);

    const { error: dbErr } = await admin
      .from("users")
      .update({ email_verified: true })
      .ilike("email", email);
    if (dbErr) console.warn("users.email_verified", dbErr.message);

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
