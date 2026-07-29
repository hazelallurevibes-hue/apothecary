import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  corsHeaders,
  getOrCreateStripeCustomer,
  jsonResponse,
  loadStripeSettings,
  resolveSiteUrl,
  stripeClient,
} from "../_shared/stripePro.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

/**
 * Product Subscribe & Save — shopper recurring purchase for a vendor SKU.
 * Uses Stripe Checkout mode=subscription with price_data so vendors do not
 * need to create Price IDs in Stripe Dashboard for every product.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const itemId = Number(body.item_id || body.itemId);
    const itemType = String(body.item_type || body.itemType || "produce").toLowerCase();
    const vendorIdBody = body.vendor_id ? Number(body.vendor_id) : null;

    if (!email || !itemId) {
      return jsonResponse({ ok: false, error: "email and item_id required" }, 400);
    }

    const authHeader = req.headers.get("Authorization");
    let verifiedEmail = email;
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
    const settings = await loadStripeSettings(supabase);
    if (settings.pro_billing_enabled === "false") {
      return jsonResponse({ ok: false, error: "Billing is temporarily disabled" }, 503);
    }

    const { data: userRow } = await supabase
      .from("users")
      .select("id, email, name")
      .ilike("email", verifiedEmail)
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!userRow) {
      return jsonResponse({ ok: false, error: "Account not found. Sign in first." }, 404);
    }

    if (itemType !== "produce") {
      return jsonResponse({
        ok: false,
        error: "Subscribe & Save is available for apothecary products (not service listings).",
      }, 400);
    }

    const { data: item, error: itemErr } = await supabase
      .from("produce_items")
      .select("id, name, price, vendor_id, subscribe_enabled, subscribe_interval_days, subscribe_discount_pct, quantity_available")
      .eq("id", itemId)
      .maybeSingle();

    if (itemErr) {
      return jsonResponse({
        ok: false,
        error: /subscribe_/i.test(itemErr.message)
          ? "Subscribe columns missing — run inventory/subscription SQL migration."
          : itemErr.message,
      }, 500);
    }
    if (!item) return jsonResponse({ ok: false, error: "Product not found" }, 404);
    if (!item.subscribe_enabled) {
      return jsonResponse({ ok: false, error: "This product is not offered as a subscription." }, 400);
    }

    const vendorId = Number(item.vendor_id || vendorIdBody);
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id, name, plan, email")
      .eq("id", vendorId)
      .maybeSingle();

    if (!vendor) return jsonResponse({ ok: false, error: "Vendor not found" }, 404);
    const vPlan = String(vendor.plan || "free").toLowerCase();
    if (vPlan !== "paid" && vPlan !== "pro") {
      return jsonResponse({
        ok: false,
        error: "Seller must be Pro Practitioner to offer product subscriptions.",
      }, 403);
    }

    const base = Number(item.price) || 0;
    if (base <= 0) return jsonResponse({ ok: false, error: "Invalid product price" }, 400);
    const discount = Math.min(40, Math.max(0, Number(item.subscribe_discount_pct) || 0));
    const unitAmount = Math.max(50, Math.round(base * (1 - discount / 100) * 100)); // cents, min $0.50
    const intervalDays = Number(item.subscribe_interval_days) || 30;

    // Map days → Stripe recurring (prefer month for ~30)
    let recurring: { interval: "day" | "week" | "month"; interval_count: number };
    if (intervalDays <= 10) {
      recurring = { interval: "week", interval_count: 1 };
    } else if (intervalDays <= 18) {
      recurring = { interval: "week", interval_count: 2 };
    } else if (intervalDays <= 45) {
      recurring = { interval: "month", interval_count: 1 };
    } else if (intervalDays <= 75) {
      recurring = { interval: "month", interval_count: 2 };
    } else {
      recurring = { interval: "month", interval_count: 3 };
    }

    const stripe = stripeClient();
    const siteUrl = await resolveSiteUrl(supabase);
    const customerId = await getOrCreateStripeCustomer(stripe, supabase, {
      email: verifiedEmail,
      userId: userRow.id,
      name: userRow.name,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            recurring,
            product_data: {
              name: `${item.name} — Subscribe & Save`,
              description: `From ${vendor.name || "Hazel Allure maker"}. Cancel anytime.`,
              metadata: {
                produce_item_id: String(item.id),
                vendor_id: String(vendorId),
              },
            },
          },
        },
      ],
      success_url: `${siteUrl}/orders?subscribe=success&item=${item.id}`,
      cancel_url: `${siteUrl}/products?subscribe=cancel`,
      allow_promotion_codes: true,
      metadata: {
        checkout_type: "product_subscribe",
        plan_type: "product_subscribe",
        user_id: String(userRow.id),
        vendor_id: String(vendorId),
        produce_item_id: String(item.id),
        email: verifiedEmail,
      },
      subscription_data: {
        metadata: {
          checkout_type: "product_subscribe",
          user_id: String(userRow.id),
          vendor_id: String(vendorId),
          produce_item_id: String(item.id),
        },
      },
    });

    if (!session?.url) {
      return jsonResponse({ ok: false, error: "Stripe did not return a checkout URL" }, 500);
    }

    // Best-effort pending row
    await supabase.from("product_subscriptions").upsert(
      {
        user_id: userRow.id,
        vendor_id: vendorId,
        produce_item_id: item.id,
        email: verifiedEmail,
        status: "checkout_open",
        stripe_checkout_session_id: session.id,
        interval_days: intervalDays,
        unit_amount_cents: unitAmount,
        discount_pct: discount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,produce_item_id" },
    ).then(() => null).catch(() => null);

    return jsonResponse({ ok: true, url: session.url, session_id: session.id });
  } catch (e) {
    return jsonResponse({ ok: false, error: String((e as Error)?.message || e) }, 500);
  }
});
