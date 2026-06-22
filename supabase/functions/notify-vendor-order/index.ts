import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { loadPlatformEmailConfig } from "../_shared/platformConfig.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Payload {
  order_id: number;
  vendor_id: number;
  vendor_email?: string;
  vendor_name?: string;
  total?: number;
  status?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  try {
    const body = (await req.json()) as Payload;
    const { vendor_email, vendor_name, order_id, total, status } = body;
    if (!vendor_email) return json({ ok: false, error: "vendor_email required" }, 400);
    if (!RESEND_API_KEY) return json({ ok: true, emailed: false, reason: "RESEND_API_KEY not configured" });

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
        subject: `New order #${order_id} on Hazel Allure`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px">
            <h2 style="color:#4a1942">New order for ${vendor_name || "your storefront"}</h2>
            <p>Order <strong>#${order_id}</strong> — $${Number(total || 0).toFixed(2)} (${status || "placed"})</p>
            <p><a href="${cfg.siteUrl}/vendor-dashboard">Open Practitioner Dashboard →</a></p>
          </div>
        `,
      }),
    });
    if (!res.ok) return json({ ok: false, error: await res.text() }, 502);
    return json({ ok: true, emailed: true });
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