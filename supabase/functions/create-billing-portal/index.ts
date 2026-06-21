import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  corsHeaders,
  jsonResponse,
  PlanType,
  resolveSiteUrl,
  stripeClient,
} from "../_shared/stripePro.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const body = await req.json();
    const planType = (body.plan_type || body.planType || "customer") as PlanType;
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) return jsonResponse({ ok: false, error: "email required" }, 400);

    let verifiedEmail = email;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      if (token !== ANON_KEY) {
        const authClient = createClient(SUPABASE_URL, ANON_KEY, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user: authUser } } = await authClient.auth.getUser();
        if (authUser?.email) verifiedEmail = authUser.email.toLowerCase();
      }
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: userRow } = await supabase
      .from("users")
      .select("id, stripe_customer_id")
      .ilike("email", verifiedEmail)
      .maybeSingle();

    if (!userRow) return jsonResponse({ ok: false, error: "Account not found" }, 404);

    let stripeCustomerId = userRow.stripe_customer_id;

    if (!stripeCustomerId) {
      const { data: sub } = await supabase
        .from("platform_subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", userRow.id)
        .eq("plan_type", planType)
        .not("stripe_customer_id", "is", null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      stripeCustomerId = sub?.stripe_customer_id;
    }

    if (!stripeCustomerId) {
      return jsonResponse({ ok: false, error: "No billing account found. Subscribe to Pro first." }, 404);
    }

    const stripe = stripeClient();
    const siteUrl = await resolveSiteUrl(supabase);
    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${siteUrl}/account-settings#billing`,
    });

    return jsonResponse({ ok: true, url: portal.url });
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500);
  }
});