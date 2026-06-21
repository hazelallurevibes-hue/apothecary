import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import {
  grantProAccess,
  mapStripeStatus,
  PlanType,
  revokeProAccess,
  subscriptionIsActive,
  upsertSubscriptionRow,
} from "../_shared/stripePro.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-11-20.acacia" });

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig || !WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "Webhook not configured" }), { status: 503 });
    }

    const event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: seen } = await supabase
      .from("stripe_webhook_events")
      .select("id")
      .eq("id", event.id)
      .maybeSingle();

    if (seen) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
    }

    await supabase.from("stripe_webhook_events").insert({
      id: event.id,
      event_type: event.type,
    });

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(supabase, event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await handleInvoicePaid(supabase, event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoiceFailed(supabase, event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e) {
    console.error("stripe-webhook error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 400 });
  }
});

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
) {
  const meta = session.metadata || {};
  const planType = (meta.plan_type || "customer") as PlanType;
  const userId = meta.user_id ? Number(meta.user_id) : null;
  const vendorId = meta.vendor_id ? Number(meta.vendor_id) : null;
  const subId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id;

  if (!subId) return;

  const subscription = await stripe.subscriptions.retrieve(subId);
  await syncSubscription(supabase, subscription, { userId, vendorId, planType });

  if (subscriptionIsActive(mapStripeStatus(subscription.status))) {
    await grantProAccess(supabase, planType, { userId: userId || undefined, vendorId: vendorId || undefined });
  }
}

async function handleSubscriptionChange(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription,
) {
  const meta = subscription.metadata || {};
  const planType = (meta.plan_type || "customer") as PlanType;
  const userId = meta.user_id ? Number(meta.user_id) : null;
  const vendorId = meta.vendor_id ? Number(meta.vendor_id) : null;

  await syncSubscription(supabase, subscription, { userId, vendorId, planType });

  const status = mapStripeStatus(subscription.status);
  if (subscriptionIsActive(status)) {
    await grantProAccess(supabase, planType, { userId: userId || undefined, vendorId: vendorId || undefined });
  } else if (["canceled", "unpaid", "incomplete"].includes(status)) {
    await revokeProAccess(supabase, planType, { userId: userId || undefined, vendorId: vendorId || undefined });
  }
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription,
) {
  const meta = subscription.metadata || {};
  const planType = (meta.plan_type || "customer") as PlanType;
  const userId = meta.user_id ? Number(meta.user_id) : null;
  const vendorId = meta.vendor_id ? Number(meta.vendor_id) : null;

  await upsertSubscriptionRow(supabase, {
    stripe_subscription_id: subscription.id,
    status: "canceled",
    cancel_at_period_end: false,
    updated_at: new Date().toISOString(),
  });

  await revokeProAccess(supabase, planType, { userId: userId || undefined, vendorId: vendorId || undefined });
}

async function handleInvoicePaid(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice,
) {
  const subId = typeof invoice.subscription === "string"
    ? invoice.subscription
    : invoice.subscription?.id;
  if (!subId) return;

  const subscription = await stripe.subscriptions.retrieve(subId);
  const meta = subscription.metadata || {};
  const planType = (meta.plan_type || "customer") as PlanType;
  const userId = meta.user_id ? Number(meta.user_id) : null;
  const vendorId = meta.vendor_id ? Number(meta.vendor_id) : null;

  await upsertSubscriptionRow(supabase, {
    stripe_subscription_id: subscription.id,
    last_payment_at: new Date().toISOString(),
    last_payment_status: "paid",
    amount_cents: invoice.amount_paid,
    currency: invoice.currency || "usd",
    status: mapStripeStatus(subscription.status),
    updated_at: new Date().toISOString(),
  });

  if (subscriptionIsActive(mapStripeStatus(subscription.status))) {
    await grantProAccess(supabase, planType, { userId: userId || undefined, vendorId: vendorId || undefined });
  }
}

async function handleInvoiceFailed(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice,
) {
  const subId = typeof invoice.subscription === "string"
    ? invoice.subscription
    : invoice.subscription?.id;
  if (!subId) return;

  await upsertSubscriptionRow(supabase, {
    stripe_subscription_id: subId,
    status: "past_due",
    last_payment_status: "failed",
    updated_at: new Date().toISOString(),
  });
}

async function syncSubscription(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription,
  ctx: { userId: number | null; vendorId: number | null; planType: PlanType },
) {
  const priceId = subscription.items?.data?.[0]?.price?.id || null;
  const amountCents = subscription.items?.data?.[0]?.price?.unit_amount || null;
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer?.id;

  await upsertSubscriptionRow(supabase, {
    user_id: ctx.userId,
    vendor_id: ctx.planType === "vendor" ? ctx.vendorId : null,
    plan_type: ctx.planType,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    status: mapStripeStatus(subscription.status),
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    amount_cents: amountCents,
    currency: subscription.currency || "usd",
    metadata: subscription.metadata || {},
  });
}