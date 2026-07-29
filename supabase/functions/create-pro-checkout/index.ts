import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  corsHeaders,
  getOrCreateStripeCustomer,
  jsonResponse,
  BillingInterval,
  loadStripeSettings,
  PlanType,
  priceIdForPlan,
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
    const planType = (body.plan_type || body.planType) as PlanType;
    const billingInterval = ((body.billing_interval || body.billingInterval || "monthly") as string).toLowerCase() === "annual"
      ? "annual"
      : "monthly" as BillingInterval;
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !["vendor", "customer"].includes(planType)) {
      return jsonResponse({ ok: false, error: "email and plan_type (vendor|customer) required" }, 400);
    }

    const authHeader = req.headers.get("Authorization");
    let verifiedEmail = email;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const isAnon = token === ANON_KEY;
      if (!isAnon) {
        const authClient = createClient(SUPABASE_URL, ANON_KEY, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user: authUser } } = await authClient.auth.getUser();
        if (authUser?.email) verifiedEmail = authUser.email.toLowerCase();
      }
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const settings = await loadStripeSettings(supabase);

    if (settings.pro_billing_enabled === "false") {
      return jsonResponse({ ok: false, error: "Pro billing is temporarily disabled" }, 503);
    }

    let userRow: { id: number; email: string; name?: string; role?: string; vendor_id?: number } | null = null;

    const { data: exactUser } = await supabase
      .from("users")
      .select("id, email, name, role, vendor_id")
      .eq("email", verifiedEmail)
      .maybeSingle();

    userRow = exactUser;

    if (!userRow) {
      const { data: ciUsers } = await supabase
        .from("users")
        .select("id, email, name, role, vendor_id")
        .ilike("email", verifiedEmail)
        .order("id", { ascending: true })
        .limit(1);
      userRow = ciUsers?.[0] || null;
    }

    if (!userRow) {
      return jsonResponse({ ok: false, error: "Account not found. Sign in first." }, 404);
    }

    let vendorId: number | null = null;
    if (planType === "vendor") {
      const role = (userRow.role || "").toLowerCase();
      if (role !== "vendor" && role !== "admin") {
        return jsonResponse({
          ok: false,
          error: "Vendor Pro is for practitioner accounts. Apply as a practitioner first, then upgrade.",
        }, 403);
      }

      // Prefer explicit body id, then users.vendor_id, then lookup by email / user_id
      const bodyVid = body.vendor_id ? Number(body.vendor_id) : null;
      vendorId = bodyVid || userRow.vendor_id || null;

      if (!vendorId) {
        const { data: byEmail } = await supabase
          .from("vendors")
          .select("id, plan, email, user_id")
          .ilike("email", verifiedEmail)
          .order("id", { ascending: true })
          .limit(1);
        if (byEmail?.[0]?.id) vendorId = byEmail[0].id;
      }

      if (!vendorId && userRow.id) {
        const { data: byUser } = await supabase
          .from("vendors")
          .select("id, plan")
          .eq("user_id", userRow.id)
          .order("id", { ascending: true })
          .limit(1);
        if (byUser?.[0]?.id) vendorId = byUser[0].id;
      }

      if (!vendorId) {
        return jsonResponse({
          ok: false,
          error:
            "No vendor storefront linked to this account. Finish practitioner signup / approval so a storefront exists, then try Pro again.",
        }, 400);
      }

      // Heal users.vendor_id when missing so future checkouts work
      if (!userRow.vendor_id && vendorId) {
        await supabase.from("users").update({ vendor_id: vendorId }).eq("id", userRow.id);
      }

      const { data: vendor } = await supabase
        .from("vendors")
        .select("id, plan")
        .eq("id", vendorId)
        .maybeSingle();

      if (!vendor) {
        return jsonResponse({
          ok: false,
          error:
            "Vendor storefront record not found. Contact support or re-apply as a practitioner so your shop profile is created.",
        }, 404);
      }
      if ((vendor.plan || "free") === "paid" || (vendor.plan || "").toLowerCase() === "pro") {
        return jsonResponse({ ok: false, error: "already_pro", message: "You already have Pro Vendor access" }, 409);
      }
    } else {
      const { data: freshUser } = await supabase
        .from("users")
        .select("customer_plan")
        .eq("id", userRow.id)
        .single();
      if ((freshUser?.customer_plan || "free") === "paid") {
        return jsonResponse({ ok: false, error: "already_pro", message: "You already have Pro Member access" }, 409);
      }
    }

    const stripe = stripeClient();
    const siteUrl = await resolveSiteUrl(supabase);
    const priceId = priceIdForPlan(settings, planType, billingInterval);
    const customerId = await getOrCreateStripeCustomer(stripe, supabase, {
      email: verifiedEmail,
      userId: userRow.id,
      name: userRow.name,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/pro/success?type=${planType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pro/cancel?type=${planType}`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_update: { address: "auto", name: "auto" },
      metadata: {
        plan_type: planType,
        billing_interval: billingInterval,
        user_id: String(userRow.id),
        vendor_id: vendorId ? String(vendorId) : "",
        email: verifiedEmail,
      },
      subscription_data: {
        metadata: {
          plan_type: planType,
          billing_interval: billingInterval,
          user_id: String(userRow.id),
          vendor_id: vendorId ? String(vendorId) : "",
        },
      },
    });

    return jsonResponse({ ok: true, url: session.url, session_id: session.id });
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500);
  }
});