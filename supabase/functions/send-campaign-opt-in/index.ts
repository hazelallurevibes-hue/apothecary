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
    const { recipient_id, vendor_id } = await req.json();
    if (!RESEND_API_KEY) return json({ ok: false, error: "RESEND_API_KEY not configured" }, 503);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const cfg = await loadPlatformEmailConfig(supabase);
    let query = supabase
      .from("vendor_campaign_recipients")
      .select("*, vendors(name)")
      .eq("status", "pending");

    if (recipient_id) query = query.eq("id", recipient_id);
    else if (vendor_id) query = query.eq("vendor_id", vendor_id);
    else return json({ ok: false, error: "recipient_id or vendor_id required" }, 400);

    const { data: rows, error } = await query.limit(50);
    if (error) return json({ ok: false, error: error.message }, 500);

    let sent = 0;
    for (const row of rows || []) {
      if (!row.confirm_token) continue;
      const vendorName = row.vendors?.name || "a Hazel Allure practitioner";
      const confirmUrl = `${cfg.siteUrl}/campaign-confirm/${row.confirm_token}`;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: cfg.notifyFrom,
          reply_to: cfg.replyTo,
          to: [row.email],
          subject: `Confirm you'd like updates from ${vendorName} on Hazel Allure`,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:560px;line-height:1.5">
              <p>You were invited to receive occasional emails from <strong>${escapeHtml(vendorName)}</strong> about their Hazel Allure storefront.</p>
              <p><a href="${confirmUrl}" style="display:inline-block;background:#4a1942;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:600">Confirm subscription</a></p>
              <p style="font-size:11px;color:#9ca3af">If you did not expect this, ignore this email. All purchases happen only on Hazel Allure.</p>
            </div>
          `,
        }),
      });
      if (res.ok) sent += 1;
    }

    return json({ ok: true, sent, total: rows?.length || 0 });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});

function escapeHtml(s: string) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}