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

      // Prefer body.vendor_id, then users.vendor_id, then vendors.email match
      // (schema uses email + users.vendor_id — there is no vendors.user_id column)
      const bodyVid = body.vendor_id ? Number(body.vendor_id) : NaN;
      vendorId = Number.isFinite(bodyVid) && bodyVid > 0
        ? bodyVid
        : (userRow.vendor_id ? Number(userRow.vendor_id) : null);

      if (!vendorId) {
        const { data: byEmail, error: emailErr } = await supabase
          .from("vendors")
          .select("id, plan, email")
          .ilike("email", verifiedEmail)
          .order("id", { ascending: true })
          .limit(5);
        if (emailErr) {
          return jsonResponse({ ok: false, error: `Vendor lookup failed: ${emailErr.message}` }, 500);
        }
        if (byEmail?.[0]?.id) vendorId = Number(byEmail[0].id);
      }

      // Also try matching vendor name/email from approved applications loosely
      if (!vendorId) {
        const { data: allMine } = await supabase
          .from("vendors")
          .select("id, plan, email, status")
          .or(`email.ilike.${verifiedEmail}`)
          .limit(1);
        if (allMine?.[0]?.id) vendorId = Number(allMine[0].id);
      }

      if (!vendorId) {
        return jsonResponse({
          ok: false,
          error:
            "No storefront linked to this account. Open Vendor Dashboard once after approval (so your shop profile exists), then try Go Pro again. If still stuck, contact support with your login email.",
        }, 400);
      }

      // Heal users.vendor_id when missing so future checkouts work
      if (!userRow.vendor_id && vendorId) {
        await supabase.from("users").update({ vendor_id: vendorId }).eq("id", userRow.id);
      }

      const { data: vendor, error: vendorErr } = await supabase
        .from("vendors")
        .select("id, plan, email, status")
        .eq("id", vendorId)
        .maybeSingle();

      if (vendorErr) {
        return jsonResponse({ ok: false, error: `Vendor load failed: ${vendorErr.message}` }, 500);
      }
      if (!vendor) {
        return jsonResponse({
          ok: false,
          error:
            "Storefront record not found for this account. Re-open Vendor Dashboard or contact support so your shop row can be re-linked.",
        }, 404);
      }
      const plan = String(vendor.plan || "free").toLowerCase();
      if (plan === "paid" || plan === "pro") {
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

    let stripe;
    let priceId: string;
    let siteUrl: string;
    try {
      stripe = stripeClient();
      siteUrl = await resolveSiteUrl(supabase);
      priceId = priceIdForPlan(settings, planType, billingInterval);
    } catch (cfgErr) {
      return jsonResponse({
        ok: false,
        error: String(cfgErr?.message || cfgErr),
      }, 500);
    }

    let customerId: string;
    try {
      customerId = await getOrCreateStripeCustomer(stripe, supabase, {
        email: verifiedEmail,
        userId: userRow.id,
        name: userRow.name,
      });
    } catch (custErr) {
      return jsonResponse({
        ok: false,
        error: `Stripe customer error: ${String(custErr?.message || custErr)}`,
      }, 500);
    }

    try {
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

      if (!session?.url) {
        return jsonResponse({ ok: false, error: "Stripe did not return a checkout URL" }, 500);
      }
      return jsonResponse({ ok: true, url: session.url, session_id: session.id });
    } catch (stripeErr) {
      const msg = String(stripeErr?.message || stripeErr);
      return jsonResponse({
        ok: false,
        error: msg.includes("No such price")
          ? "Stripe price ID is invalid. Check Admin → Pro Payments price IDs match your Stripe mode (test vs live)."
          : `Stripe checkout error: ${msg}`,
      }, 500);
    }
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e?.message || e) }, 500);
  }
});