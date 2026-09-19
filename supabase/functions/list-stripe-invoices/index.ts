import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  corsHeaders,
  jsonResponse,
  stripeClient,
} from "../_shared/stripePro.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });

  try {
    const body = await req.json().catch(() => ({}));
    let email = String(body.email || "").trim().toLowerCase();

    const authHeader = req.headers.get("Authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      if (token !== ANON_KEY) {
        const authClient = createClient(SUPABASE_URL, ANON_KEY, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await authClient.auth.getUser();
        if (user?.email) email = user.email.toLowerCase();
      }
    }
    if (!email) return jsonResponse({ ok: false, error: "Sign in required" }, 401);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: userRow } = await supabase
      .from("users")
      .select("id, stripe_customer_id")
      .ilike("email", email)
      .maybeSingle();
    if (!userRow) return jsonResponse({ ok: true, invoices: [] });

    let customerId = userRow.stripe_customer_id;
    if (!customerId) {
      const { data: sub } = await supabase
        .from("platform_subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", userRow.id)
        .not("stripe_customer_id", "is", null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      customerId = sub?.stripe_customer_id;
    }
    if (!customerId) return jsonResponse({ ok: true, invoices: [] });

    const stripe = stripeClient();
    const list = await stripe.invoices.list({ customer: customerId, limit: 24 });
    const invoices = (list.data || []).map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amount_paid: (inv.amount_paid || 0) / 100,
      amount_due: (inv.amount_due || 0) / 100,
      currency: inv.currency,
      created: inv.created,
      hosted_invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
      period_end: inv.period_end,
    }));
    return jsonResponse({ ok: true, invoices });
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500);
  }
});
