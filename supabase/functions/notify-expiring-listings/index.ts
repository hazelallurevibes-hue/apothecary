import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { loadPlatformEmailConfig } from "../_shared/platformConfig.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Payload {
  vendor_id: number;
  vendor_email?: string;
  vendor_name?: string;
  expiring_count?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  try {
    const body = (await req.json()) as Payload;
    const { vendor_email, vendor_name, expiring_count, vendor_id } = body;
    if (!vendor_email) return json({ ok: false, error: "vendor_email required" }, 400);
    if (!RESEND_API_KEY) return json({ ok: true, emailed: false });

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
        to: [vendor_email],
        subject: `⏳ ${expiring_count || 1} listing(s) expiring soon on Bpicius`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px">
            <h2 style="color:#083a9b">Produce expiring within 3 days</h2>
            <p>${expiring_count || 1} Farmers Market listing(s) for <strong>${vendor_name || "your farm"}</strong> are nearing their good-by date.</p>
            <p><a href="${cfg.siteUrl}/vendor-dashboard">Update or hide listings →</a></p>
          </div>
        `,
      }),
    });
    if (!res.ok) return json({ ok: false, error: await res.text() }, 502);
    return json({ ok: true, emailed: true, vendor_id });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}