import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { loadPlatformEmailConfig } from "../_shared/platformConfig.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SB_PUBLISHABLE_KEY") || "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    if (!RESEND_API_KEY) {
      return json({ ok: false, error: "RESEND_API_KEY not configured" }, 503);
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const role = body.role === "vendor" ? "vendor" : "customer";
    if (!email || !email.includes("@")) {
      return json({ ok: false, error: "Valid email required" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const cfg = await loadPlatformEmailConfig(admin);

    // Must match live SPA routes (aliases also exist for legacy links)
    const verifyPath = role === "vendor" ? "/vendor-verify-email" : "/verify-email";
    // Prefer request origin when provided (preview / custom domains)
    const origin = String(body.origin || cfg.siteUrl || "").replace(/\/$/, "");
    const redirectTo = `${origin}${verifyPath}`;

    // Generate a confirmation / magic link with Admin API
    let actionLink: string | null = null;
    let linkError: string | null = null;

    // Prefer signup confirmation (sets email_confirmed_at), then magiclink, then invite
    for (const type of ["signup", "magiclink", "invite"] as const) {
      const { data, error } = await admin.auth.admin.generateLink({
        type,
        email,
        options: { redirectTo },
      });
      if (!error && data?.properties?.action_link) {
        actionLink = data.properties.action_link;
        break;
      }
      linkError = error?.message || linkError;
    }

    if (!actionLink) {
      // Last resort: invite user if they don't exist yet
      const { data: invited, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
      });
      if (!invErr && invited?.user) {
        // invite sends its own email via Supabase — still send branded Resend if we can get a link
        const { data: again } = await admin.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: { redirectTo },
        });
        actionLink = again?.properties?.action_link || null;
      }
      if (!actionLink) {
        return json({
          ok: false,
          error: linkError || invErr?.message || "Could not create verification link for this email",
        }, 400);
      }
    }

    const subject =
      role === "vendor"
        ? "Verify your practitioner email — Hazel Allure"
        : "Verify your email — Hazel Allure";

    const html = `
      <div style="font-family:Georgia,system-ui,sans-serif;max-width:560px;margin:0 auto;line-height:1.55;color:#2d1230">
        <div style="background:linear-gradient(135deg,#4a1942,#2d1230);color:#fff;padding:28px 24px;border-radius:16px 16px 0 0">
          <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a227">Hazel Allure</p>
          <h1 style="margin:8px 0 0;font-size:22px;font-weight:600">Confirm your email</h1>
        </div>
        <div style="border:1px solid #e8e0e6;border-top:0;padding:24px;border-radius:0 0 16px 16px;background:#faf7f5">
          <p style="margin:0 0 12px">Welcome to the apothecary circle.</p>
          <p style="margin:0 0 20px;color:#555">
            Tap the button below to verify <strong>${email}</strong> and unlock bookings, orders, and messages with practitioners.
          </p>
          <p style="text-align:center;margin:28px 0">
            <a href="${actionLink}"
               style="display:inline-block;background:#4a1942;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px">
              Verify my email
            </a>
          </p>
          <p style="font-size:12px;color:#777;margin:0 0 8px">Or copy this link:</p>
          <p style="font-size:11px;word-break:break-all;color:#4a1942;margin:0 0 20px">${actionLink}</p>
          <p style="font-size:12px;color:#888;margin:0">
            If you did not create a Hazel Allure account, you can ignore this message.
          </p>
          <hr style="border:none;border-top:1px solid #e8e0e6;margin:24px 0" />
          <p style="font-size:11px;color:#999;margin:0">
            From Hazel Allure · <a href="${cfg.siteUrl}" style="color:#4a1942">${cfg.siteUrl}</a><br/>
            Reply to ${cfg.replyTo}
          </p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: cfg.notifyFrom.includes("Hazel")
          ? cfg.notifyFrom
          : `Hazel Allure <${cfg.settings.email_from_address || "noreply@hazelallure.com"}>`,
        reply_to: cfg.replyTo,
        to: [email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return json({ ok: false, error: `Email send failed: ${errText}` }, 502);
    }

    // Mark users table for bookkeeping (optional column)
    try {
      await admin
        .from("users")
        .update({ email_verify_sent_at: new Date().toISOString() })
        .ilike("email", email);
    } catch {
      /* column may not exist */
    }

    return json({ ok: true, emailed: true, from: "Hazel Allure", to: email });
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
