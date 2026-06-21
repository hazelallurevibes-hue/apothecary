import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  corsHeaders,
  jsonResponse,
  loadStripeSettings,
  stripeClient,
} from "../_shared/stripePro.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Slot = "vendor_monthly" | "vendor_annual" | "customer_monthly" | "customer_annual";

const SLOT_KEYS: Record<Slot, string> = {
  vendor_monthly: "stripe_vendor_pro_price_id",
  vendor_annual: "stripe_vendor_pro_annual_price_id",
  customer_monthly: "stripe_customer_pro_price_id",
  customer_annual: "stripe_customer_pro_annual_price_id",
};

async function bootstrapTestPrices(stripe: ReturnType<typeof stripeClient>, settings: Record<string, string>) {
  const specs = [
    {
      productName: "Bpicius Pro Vendor",
      slotMonthly: "vendor_monthly" as Slot,
      slotAnnual: "vendor_annual" as Slot,
      monthlyCents: Math.round(parseFloat(settings.stripe_vendor_pro_monthly_display || "29.99") * 100),
      annualCents: Math.round(parseFloat(settings.stripe_vendor_pro_annual_display || "299.99") * 100),
    },
    {
      productName: "Bpicius Pro Member",
      slotMonthly: "customer_monthly" as Slot,
      slotAnnual: "customer_annual" as Slot,
      monthlyCents: Math.round(parseFloat(settings.stripe_customer_pro_monthly_display || "9.99") * 100),
      annualCents: Math.round(parseFloat(settings.stripe_customer_pro_annual_display || "99.99") * 100),
    },
  ];

  const created: Array<{ product: string; price_id: string; interval: string; slot: Slot }> = [];

  for (const spec of specs) {
    const product = await stripe.products.create({
      name: spec.productName,
      metadata: { bpicius_plan: spec.productName.includes("Vendor") ? "vendor" : "customer" },
    });

    const monthly = await stripe.prices.create({
      product: product.id,
      unit_amount: spec.monthlyCents,
      currency: "usd",
      recurring: { interval: "month" },
      metadata: { bpicius_interval: "monthly" },
    });
    created.push({ product: spec.productName, price_id: monthly.id, interval: "month", slot: spec.slotMonthly });

    const annual = await stripe.prices.create({
      product: product.id,
      unit_amount: spec.annualCents,
      currency: "usd",
      recurring: { interval: "year" },
      metadata: { bpicius_interval: "annual" },
    });
    created.push({ product: spec.productName, price_id: annual.id, interval: "year", slot: spec.slotAnnual });
  }

  return created;
}

function classifyPrice(productName: string, interval: string): Slot | null {
  const name = productName.toLowerCase();
  const isVendor = name.includes("vendor");
  const isCustomer = name.includes("member") || name.includes("customer");
  if (!isVendor && !isCustomer) return null;
  if (interval === "month") return isVendor ? "vendor_monthly" : "customer_monthly";
  if (interval === "year") return isVendor ? "vendor_annual" : "customer_annual";
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const autoSync = body.auto_sync === true;
    const bootstrap = body.bootstrap === true;
    const stripe = stripeClient();
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const settings = await loadStripeSettings(supabase);

    if (bootstrap) {
      const existing = await stripe.prices.list({ limit: 1 });
      if (existing.data.length === 0) {
        await bootstrapTestPrices(stripe, settings);
      }
    }

    const account = await stripe.accounts.retrieve();
    const prices = await stripe.prices.list({
      limit: 100,
      expand: ["data.product"],
    });

    const catalog = prices.data
      .filter((p) => p.recurring)
      .map((p) => {
        const product = typeof p.product === "object" && p.product && "name" in p.product
          ? p.product
          : null;
        const productName = product?.name || "Unknown";
        const interval = p.recurring?.interval || "";
        const slot = classifyPrice(productName, interval);
        return {
          price_id: p.id,
          product_name: productName,
          interval,
          amount: p.unit_amount,
          currency: p.currency,
          slot,
        };
      });

    const matched: Partial<Record<Slot, string>> = {};
    for (const row of catalog) {
      if (row.slot && !matched[row.slot]) matched[row.slot] = row.price_id;
    }

    const updates: Record<string, string> = {};
    for (const [slot, key] of Object.entries(SLOT_KEYS) as [Slot, string][]) {
      if (matched[slot]) updates[key] = matched[slot]!;
    }

    if (autoSync && Object.keys(updates).length) {
      const now = new Date().toISOString();
      for (const [key, value] of Object.entries(updates)) {
        await supabase.from("platform_settings").upsert(
          { key, value, updated_at: now },
          { onConflict: "key" },
        );
      }
    }

    const refreshed = await loadStripeSettings(supabase);

    return jsonResponse({
      ok: true,
      stripe_account_id: account.id,
      stripe_mode: (Deno.env.get("STRIPE_SECRET_KEY") || "").startsWith("sk_live_") ? "live" : "test",
      price_count: prices.data.length,
      bootstrapped: bootstrap,
      auto_synced: autoSync && Object.keys(updates).length > 0,
      catalog,
      matched,
      updates,
      current: {
        vendor_monthly: refreshed.stripe_vendor_pro_price_id || "",
        vendor_annual: refreshed.stripe_vendor_pro_annual_price_id || "",
        customer_monthly: refreshed.stripe_customer_pro_price_id || "",
        customer_annual: refreshed.stripe_customer_pro_annual_price_id || "",
      },
    });
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e) }, 500);
  }
});