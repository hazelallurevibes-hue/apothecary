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
    const { campaign_id } = await req.json();
    if (!campaign_id) return json({ ok: false, error: "campaign_id required" }, 400);
    if (!RESEND_API_KEY) return json({ ok: false, error: "RESEND_API_KEY not configured" }, 503);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const cfg = await loadPlatformEmailConfig(supabase);
    const { data: campaign, error } = await supabase
      .from("vendor_email_campaigns")
      .select("*, vendors(name, email, plan)")
      .eq("id", campaign_id)
      .single();
    if (error || !campaign) return json({ ok: false, error: "Campaign not found" }, 404);

    if (campaign.status !== "approved") {
      return json({ ok: false, error: `Campaign must be approved before sending (current: ${campaign.status})` }, 400);
    }

    const { data: settingsRows } = await supabase.from("platform_settings").select("key, value");
    const settings = Object.fromEntries((settingsRows || []).map((r: { key: string; value: string }) => [r.key, r.value]));
    const doubleOptIn = settings.campaign_double_opt_in !== "false";

    const vendorName = campaign.vendors?.name || "Local vendor";
    const storefront = campaign.storefront_url || `${cfg.siteUrl}/vendor/${campaign.vendor_id}`;
    let recipients = String(campaign.recipient_emails)
      .split(",")
      .map((e: string) => e.trim().toLowerCase())
      .filter((e: string) => e.includes("@"));

    if (doubleOptIn) {
      const { data: confirmed } = await supabase
        .from("vendor_campaign_recipients")
        .select("email")
        .eq("vendor_id", campaign.vendor_id)
        .eq("status", "confirmed");
      const confirmedSet = new Set((confirmed || []).map((r: { email: string }) => r.email.toLowerCase()));
      recipients = recipients.filter((e: string) => confirmedSet.has(e));
      if (!recipients.length) {
        return json({ ok: false, error: "No confirmed recipients — send opt-in confirmations first" }, 400);
      }
    }

    const { data: unsubRows } = await supabase
      .from("email_unsubscribes")
      .select("email")
      .eq("vendor_id", campaign.vendor_id);
    const unsubSet = new Set((unsubRows || []).map((r: { email: string }) => r.email.toLowerCase()));
    recipients = recipients.filter((e: string) => !unsubSet.has(e));

    let sent = 0;
    for (const to of recipients) {
      const token = crypto.randomUUID();
      await supabase.from("email_unsubscribes").upsert(
        { email: to, vendor_id: campaign.vendor_id, unsubscribe_token: token },
        { onConflict: "email,vendor_id", ignoreDuplicates: true },
      );
      const { data: unsub } = await supabase
        .from("email_unsubscribes")
        .select("unsubscribe_token")
        .eq("email", to)
        .eq("vendor_id", campaign.vendor_id)
        .maybeSingle();
      const unsubUrl = `${cfg.siteUrl}/email-unsubscribe/${unsub?.unsubscribe_token || token}`;

      const htmlBody = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;line-height:1.5">
        <p style="white-space:pre-wrap">${escapeHtml(campaign.body_text)}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
        <p style="font-size:14px;color:#374151">
          <strong>Shop ${escapeHtml(vendorName)} on Hazel Allure</strong><br/>
          All orders and messaging stay on the Hazel Allure platform for your safety.
        </p>
        <p><a href="${storefront}" style="display:inline-block;background:#4a1942;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:600">Visit storefront on Hazel Allure</a></p>
        <p style="font-size:11px;color:#9ca3af;margin-top:24px">
          Sent via Hazel Allure Practitioner Campaigns • ${cfg.siteUrl}<br/>
          <a href="${unsubUrl}" style="color:#6b7280">Unsubscribe from ${escapeHtml(vendorName)} emails</a>
        </p>
      </div>
    `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: cfg.notifyFrom,
          reply_to: cfg.replyTo,
          to: [to],
          subject: campaign.subject,
          html: htmlBody,
          tags: [{ name: "campaign_id", value: String(campaign_id) }],
        }),
      });

      const resJson = await res.json().catch(() => ({}));
      if (res.ok) {
        sent += 1;
        await supabase.from("campaign_email_sends").insert({
          campaign_id,
          recipient_email: to,
          resend_email_id: resJson.id || null,
          status: "sent",
        });
      }
    }

    await supabase
      .from("vendor_email_campaigns")
      .update({
        status: sent > 0 ? "sent" : "failed",
        sent_count: sent,
        sent_at: new Date().toISOString(),
      })
      .eq("id", campaign_id);

    const monthKey = new Date().toISOString().slice(0, 7);
    const { data: vendor } = await supabase
      .from("vendors")
      .select("campaigns_sent_this_month, campaigns_month_key")
      .eq("id", campaign.vendor_id)
      .single();

    let used = vendor?.campaigns_sent_this_month || 0;
    if (vendor?.campaigns_month_key !== monthKey) used = 0;
    await supabase
      .from("vendors")
      .update({
        campaigns_sent_this_month: used + 1,
        campaigns_month_key: monthKey,
      })
      .eq("id", campaign.vendor_id);

    return json({ ok: true, sent, total: recipients.length });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}