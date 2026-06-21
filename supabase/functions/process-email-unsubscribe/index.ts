import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  try {
    const { token } = await req.json();
    if (!token) return json({ ok: false, error: "token required" }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: row, error: findErr } = await supabase
      .from("email_unsubscribes")
      .select("*, vendors(name)")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (findErr) return json({ ok: false, error: findErr.message }, 500);
    if (!row) return json({ ok: false, error: "Invalid unsubscribe link" }, 404);

    await supabase
      .from("vendor_campaign_recipients")
      .update({ status: "unsubscribed" })
      .eq("vendor_id", row.vendor_id)
      .eq("email", row.email);

    return json({ ok: true, email: row.email, vendor_name: row.vendors?.name });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}