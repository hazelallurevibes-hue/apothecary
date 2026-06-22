import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { loadPlatformEmailConfig } from "../_shared/platformConfig.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    if (!RESEND_API_KEY) {
      return json({ ok: false, error: "RESEND_API_KEY not configured in Supabase secrets" }, 503);
    }

    const { to } = await req.json();
    if (!to || !String(to).includes("@")) {
      return json({ ok: false, error: "Valid to email required" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const cfg = await loadPlatformEmailConfig(supabase);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: cfg.notifyFrom,
        reply_to: cfg.replyTo,
        to: [String(to).trim()],
        subject: "Hazel Allure test email — domain & settings OK",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;line-height:1.5">
            <h2 style="color:#4a1942">Hazel Allure email test</h2>
            <p>If you received this, your site email settings and Resend domain are working.</p>
            <ul style="font-size:14px;color:#444">
              <li><strong>Site URL:</strong> ${cfg.siteUrl}</li>
              <li><strong>From:</strong> ${cfg.notifyFrom}</li>
              <li><strong>Reply-to:</strong> ${cfg.replyTo}</li>
              <li><strong>Public contact:</strong> ${cfg.settings.email_contact || "—"}</li>
            </ul>
            <p><a href="${cfg.siteUrl}" style="color:#4a1942">Open Hazel Allure →</a></p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return json({ ok: false, error: errText }, 502);
    }

    return json({ ok: true, emailed: true, to });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}