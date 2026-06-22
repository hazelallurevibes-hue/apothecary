import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { loadPlatformEmailConfig } from "./platformConfig.ts";

export type PlanType = "vendor" | "customer";

export function stripeClient(): Stripe {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2024-11-20.acacia" });
}

export async function loadStripeSettings(supabase: SupabaseClient) {
  const { data } = await supabase.from("platform_settings").select("key, value");
  const settings: Record<string, string> = {};
  for (const row of data || []) {
    if (row.value != null) settings[row.key] = String(row.value);
  }
  return settings;
}

export type BillingInterval = "monthly" | "annual";

export function priceIdForPlan(
  settings: Record<string, string>,
  planType: PlanType,
  interval: BillingInterval = "monthly",
): string {
  const keys =
    interval === "annual"
      ? {
          vendor: "stripe_vendor_pro_annual_price_id",
          customer: "stripe_customer_pro_annual_price_id",
        }
      : {
          vendor: "stripe_vendor_pro_price_id",
          customer: "stripe_customer_pro_price_id",
        };
  const key = planType === "vendor" ? keys.vendor : keys.customer;
  const id = (settings[key] || "").trim();
  if (!id) {
    throw new Error(
      `Stripe ${interval} price not configured (${key}). Add it in Admin → Pro Payments.`,
    );
  }
  return id;
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

export async function resolveSiteUrl(supabase: SupabaseClient) {
  const cfg = await loadPlatformEmailConfig(supabase);
  return cfg.siteUrl;
}

export async function getOrCreateStripeCustomer(
  stripe: Stripe,
  supabase: SupabaseClient,
  opts: { email: string; userId: number; name?: string },
): Promise<string> {
  const { data: userRow } = await supabase
    .from("users")
    .select("id, stripe_customer_id, name, email")
    .eq("id", opts.userId)
    .maybeSingle();

  if (userRow?.stripe_customer_id) return userRow.stripe_customer_id;

  const customer = await stripe.customers.create({
    email: opts.email,
    name: opts.name || userRow?.name || undefined,
    metadata: { hazelallure_user_id: String(opts.userId) },
  });

  await supabase
    .from("users")
    .update({ stripe_customer_id: customer.id })
    .eq("id", opts.userId);

  return customer.id;
}

export async function grantProAccess(
  supabase: SupabaseClient,
  planType: PlanType,
  opts: { userId?: number; vendorId?: number },
) {
  if (planType === "vendor" && opts.vendorId) {
    await supabase.from("vendors").update({ plan: "paid" }).eq("id", opts.vendorId);
  }
  if (planType === "customer" && opts.userId) {
    await supabase.from("users").update({ customer_plan: "paid" }).eq("id", opts.userId);
  }
}

export async function revokeProAccess(
  supabase: SupabaseClient,
  planType: PlanType,
  opts: { userId?: number; vendorId?: number },
) {
  if (planType === "vendor" && opts.vendorId) {
    await supabase.from("vendors").update({ plan: "free" }).eq("id", opts.vendorId);
  }
  if (planType === "customer" && opts.userId) {
    await supabase.from("users").update({ customer_plan: "free" }).eq("id", opts.userId);
  }
}

export async function upsertSubscriptionRow(
  supabase: SupabaseClient,
  row: Record<string, unknown>,
) {
  const subId = row.stripe_subscription_id as string | undefined;
  if (!subId) return;

  const { data: existing } = await supabase
    .from("platform_subscriptions")
    .select("id")
    .eq("stripe_subscription_id", subId)
    .maybeSingle();

  const payload = { ...row, updated_at: new Date().toISOString() };
  if (existing?.id) {
    await supabase.from("platform_subscriptions").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("platform_subscriptions").insert(payload);
  }
}

export function mapStripeStatus(status: string): string {
  const allowed = ["inactive", "trialing", "active", "past_due", "canceled", "unpaid", "incomplete"];
  return allowed.includes(status) ? status : "inactive";
}

export function subscriptionIsActive(status: string): boolean {
  return status === "active" || status === "trialing";
}