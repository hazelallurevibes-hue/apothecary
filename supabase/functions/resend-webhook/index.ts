import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  try {
    if (WEBHOOK_SECRET) {
      const sig = req.headers.get("svix-signature") || req.headers.get("resend-signature");
      if (!sig) return json({ ok: false, error: "missing signature" }, 401);
    }

    const payload = await req.json();
    const type = payload?.type as string;
    const data = payload?.data || {};
    const emailId = data.email_id || data.id;
    if (!emailId) return json({ ok: true, skipped: "no email id" });

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: sendRow } = await supabase
      .from("campaign_email_sends")
      .select("id, campaign_id, status")
      .eq("resend_email_id", emailId)
      .maybeSingle();

    if (!sendRow) return json({ ok: true, skipped: "unknown email" });

    const updates: Record<string, unknown> = {};
    if (type === "email.opened") {
      updates.status = "opened";
      updates.opened_at = new Date().toISOString();
    } else if (type === "email.clicked") {
      updates.status = "clicked";
      updates.clicked_at = new Date().toISOString();
    } else if (type === "email.bounced" || type === "email.complained") {
      updates.status = "bounced";
    } else if (type === "email.delivered") {
      updates.status = "delivered";
    }

    if (Object.keys(updates).length) {
      await supabase.from("campaign_email_sends").update(updates).eq("id", sendRow.id);

      if (type === "email.opened") {
        const { data: camp } = await supabase
          .from("vendor_email_campaigns")
          .select("opens_count")
          .eq("id", sendRow.campaign_id)
          .single();
        await supabase
          .from("vendor_email_campaigns")
          .update({ opens_count: (camp?.opens_count || 0) + 1 })
          .eq("id", sendRow.campaign_id);
      }
      if (type === "email.clicked") {
        const { data: camp } = await supabase
          .from("vendor_email_campaigns")
          .select("clicks_count")
          .eq("id", sendRow.campaign_id)
          .single();
        await supabase
          .from("vendor_email_campaigns")
          .update({ clicks_count: (camp?.clicks_count || 0) + 1 })
          .eq("id", sendRow.campaign_id);
      }
      if (type === "email.bounced" || type === "email.complained") {
        const { data: camp } = await supabase
          .from("vendor_email_campaigns")
          .select("bounces_count")
          .eq("id", sendRow.campaign_id)
          .single();
        await supabase
          .from("vendor_email_campaigns")
          .update({ bounces_count: (camp?.bounces_count || 0) + 1 })
          .eq("id", sendRow.campaign_id);
      }
    }

    return json({ ok: true });
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