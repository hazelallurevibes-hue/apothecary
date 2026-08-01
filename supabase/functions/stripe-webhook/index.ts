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
  const checkoutType = meta.checkout_type || "";

  if (checkoutType === "course_enrollment") {
    await handleCourseEnrollmentCheckout(supabase, session, meta);
    return;
  }

  if (checkoutType === "session_booking") {
    await handleSessionBookingCheckout(supabase, session, meta);
    return;
  }

  if (checkoutType === "marketplace_order") {
    await handleMarketplaceOrderCheckout(supabase, session, meta);
    return;
  }

  if (checkoutType === "product_subscribe" || meta.plan_type === "product_subscribe") {
    await handleProductSubscribeCheckout(supabase, session, meta);
    return;
  }

  // One-time featured placement ad
  if (meta.purpose === "featured_ad" || checkoutType === "featured_ad") {
    await handleFeaturedAdCheckout(supabase, session, meta);
    return;
  }

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

async function handleFeaturedAdCheckout(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
  meta: Record<string, string>,
) {
  const vendorId = Number(meta.vendor_id);
  const campaignId = Number(meta.campaign_id);
  const days = Math.max(1, Number(meta.package_days) || 7);
  if (!vendorId || !campaignId) return;
  if (session.payment_status && session.payment_status !== "paid") return;

  const starts = new Date();
  const ends = new Date(starts.getTime() + days * 24 * 60 * 60 * 1000);
  const paymentIntent = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;

  await supabase
    .from("vendor_ad_campaigns")
    .update({
      status: "active",
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      stripe_payment_intent_id: paymentIntent || null,
      stripe_checkout_session_id: session.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId)
    .eq("vendor_id", vendorId);

  await supabase
    .from("vendors")
    .update({
      featured_active: true,
      featured_until: ends.toISOString(),
    })
    .eq("id", vendorId);
}

async function handleCourseEnrollmentCheckout(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
  meta: Record<string, string>,
) {
  if (session.payment_status && session.payment_status !== "paid") return;

  const courseId = Number(meta.course_id);
  const email = (meta.user_email || session.customer_email || "").toLowerCase();
  if (!courseId || !email) return;

  const amountPaid = meta.amount_paid ? Number(meta.amount_paid) : (session.amount_total || 0) / 100;
  const paymentIntent = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;

  // Only count enrollment once (pending → paid)
  const { data: prior } = await supabase
    .from("vendor_course_enrollments")
    .select("id, payment_status")
    .eq("course_id", courseId)
    .ilike("user_email", email)
    .maybeSingle();

  const alreadyPaid = prior?.payment_status === "paid";

  await supabase
    .from("vendor_course_enrollments")
    .update({
      payment_status: "paid",
      amount_paid: amountPaid,
      stripe_payment_intent_id: paymentIntent || null,
      stripe_checkout_session_id: session.id,
      pro_member_at_purchase: meta.pro_member === "true",
    })
    .eq("course_id", courseId)
    .ilike("user_email", email);

  if (!alreadyPaid) {
    const { data: course } = await supabase
      .from("vendor_courses")
      .select("enrollment_count")
      .eq("id", courseId)
      .maybeSingle();

    await supabase.from("vendor_courses").update({
      enrollment_count: (Number(course?.enrollment_count) || 0) + 1,
    }).eq("id", courseId);
  }
}

async function handleSessionBookingCheckout(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
  meta: Record<string, string>,
) {
  const slotId = Number(meta.slot_id);
  const email = (meta.user_email || "").toLowerCase();
  if (!slotId || !email) return;

  const amountCents = session.amount_total || 0;

  const { data: booked } = await supabase.rpc("book_practitioner_slot", {
    p_slot_id: slotId,
    p_seeker_email: email,
    p_seeker_name: meta.seeker_name || null,
    p_seeker_notes: meta.seeker_notes || null,
    p_paid_confirmed: true,
  });

  const bookingId = (booked as { booking_id?: number })?.booking_id;
  if (bookingId) {
    await supabase.from("practitioner_bookings").update({
      amount_paid_cents: amountCents,
      stripe_checkout_session_id: session.id,
      status: "confirmed",
    }).eq("id", bookingId);
  }
}

/** Marketplace cart order — mark paid after Stripe Checkout succeeds */
async function handleMarketplaceOrderCheckout(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
  meta: Record<string, string>,
) {
  if (session.payment_status && session.payment_status !== "paid") {
    // still unpaid (e.g. async methods) — leave awaiting_payment
    return;
  }

  const orderId = Number(meta.order_id || session.client_reference_id);
  if (!orderId) return;

  const paymentIntent = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;

  const patch: Record<string, unknown> = {
    payment_status: "paid",
    status: "placed",
    payment_method: "card",
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: paymentIntent || null,
    paid_at: new Date().toISOString(),
    payment_note: `Paid via Stripe Checkout ${session.id}`,
  };

  let { error } = await supabase.from("orders").update(patch).eq("id", orderId);
  if (error && /column|schema cache|does not exist/i.test(error.message || "")) {
    const minimal = {
      payment_status: "paid",
      status: "placed",
      stripe_checkout_session_id: session.id,
    };
    const retry = await supabase.from("orders").update(minimal).eq("id", orderId);
    error = retry.error;
  }
  if (error) {
    console.error("handleMarketplaceOrderCheckout:", error.message);
  }
}

/** Product Subscribe & Save — do NOT grant platform Pro access */
async function handleProductSubscribeCheckout(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
  meta: Record<string, string>,
) {
  const userId = meta.user_id ? Number(meta.user_id) : null;
  const vendorId = meta.vendor_id ? Number(meta.vendor_id) : null;
  const produceItemId = meta.produce_item_id ? Number(meta.produce_item_id) : null;
  const email = (meta.email || session.customer_email || "").toLowerCase();
  const subId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id;

  if (!produceItemId || !email) return;

  await supabase.from("product_subscriptions").upsert(
    {
      user_id: userId,
      vendor_id: vendorId,
      produce_item_id: produceItemId,
      email,
      status: "active",
      stripe_checkout_session_id: session.id,
      stripe_subscription_id: subId || null,
      unit_amount_cents: session.amount_total || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,produce_item_id" },
  );
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