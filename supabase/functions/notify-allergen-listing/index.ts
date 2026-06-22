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
    const { item_type, item_id, item_name, vendor_id, allergens } = await req.json();
    if (!allergens || !RESEND_API_KEY) return json({ ok: true, sent: 0 });

    const allergenIds = String(allergens).split(",").map((s: string) => s.trim()).filter(Boolean);
    if (!allergenIds.length) return json({ ok: true, sent: 0 });

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const cfg = await loadPlatformEmailConfig(supabase);
    const { data: users } = await supabase
      .from("users")
      .select("email, name, allergen_avoid")
      .not("allergen_avoid", "is", null)
      .neq("allergen_avoid", "");

    const { data: vendor } = await supabase.from("vendors").select("name").eq("id", vendor_id).maybeSingle();
    const vendorName = vendor?.name || "A local vendor";
    const listingPath = item_type === "menu" ? "/services" : "/products";

    let sent = 0;
    for (const u of users || []) {
      const avoid = String(u.allergen_avoid || "").split(",").map((s: string) => s.trim()).filter(Boolean);
      if (!avoid.length) continue;
      const hasConflict = allergenIds.some((id: string) => avoid.includes(id));
      if (hasConflict) continue;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: cfg.notifyFrom,
          reply_to: cfg.replyTo,
          to: [u.email],
          subject: `New listing safe for your allergen profile — ${item_name}`,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:560px;line-height:1.5">
              <p>Hi ${escapeHtml(u.name || "there")},</p>
              <p><strong>${escapeHtml(vendorName)}</strong> posted <strong>${escapeHtml(item_name)}</strong> — it does not include allergens on your Hazel Allure avoid list.</p>
              <p><a href="${cfg.siteUrl}${listingPath}" style="display:inline-block;background:#4a1942;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:600">Browse on Hazel Allure</a></p>
              <p style="font-size:11px;color:#9ca3af">Update your allergen profile in Account Settings. Hazel Allure does not guarantee cross-contact in artisan preparation.</p>
            </div>
          `,
        }),
      });
      if (res.ok) sent += 1;
    }

    return json({ ok: true, sent });
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