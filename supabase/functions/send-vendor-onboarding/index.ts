import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { loadPlatformEmailConfig } from "../_shared/platformConfig.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function templates(siteUrl: string) {
  return {
    welcome: {
      subject: "Welcome to Bpicius — set up your storefront",
      body: (name: string) =>
        `Hi ${name},\n\nYour vendor account is approved! Next steps:\n1. Customize your storefront\n2. Post your first listing\n3. Review safety policies\n\nStart here: ${siteUrl}/storefront-settings`,
    },
    listing_reminder: {
      subject: "Ready to post your first Bpicius listing?",
      body: (name: string) =>
        `Hi ${name},\n\nCustomers are browsing the marketplace — add your first menu item or produce listing to start selling.\n\n${siteUrl}/vendor-dashboard`,
    },
    first_order: {
      subject: "🎉 Your first Bpicius order!",
      body: (name: string) =>
        `Hi ${name},\n\nCongratulations on your first order on Bpicius! Check your dashboard to fulfill it and message your customer.\n\n${siteUrl}/orders`,
    },
  } as const;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  try {
    const { vendor_email, vendor_name, step } = await req.json();
    if (!vendor_email || !step || !RESEND_API_KEY) {
      return json({ ok: false, error: "missing params or RESEND_API_KEY" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const cfg = await loadPlatformEmailConfig(supabase);
    const TEMPLATES = templates(cfg.siteUrl);
    const tpl = TEMPLATES[step as keyof typeof TEMPLATES];
    if (!tpl) return json({ ok: false, error: "unknown step" }, 400);

    const name = vendor_name || "Vendor";
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
        subject: tpl.subject,
        html: `<div style="font-family:system-ui,sans-serif;max-width:560px;white-space:pre-wrap;line-height:1.6">${escapeHtml(tpl.body(name))}</div>`,
      }),
    });

    if (!res.ok) return json({ ok: false, error: await res.text() }, 502);
    return json({ ok: true });
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