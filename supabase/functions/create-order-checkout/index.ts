import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  computeApplicationFeeCents,
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
 * Create a Stripe Checkout Session for a marketplace cart order.
 * Destination charge → connected vendor Express account + platform application fee.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const body = await req.json();
    const orderId = Number(body.order_id || body.orderId);
    const emailIn = String(body.email || "").trim().toLowerCase();

    if (!orderId || !Number.isFinite(orderId)) {
      return jsonResponse({ ok: false, error: "order_id required" }, 400);
    }

    const authHeader = req.headers.get("Authorization");
    let verifiedEmail = emailIn;
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

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr) {
      return jsonResponse({ ok: false, error: orderErr.message }, 500);
    }
    if (!order) {
      return jsonResponse({ ok: false, error: "Order not found" }, 404);
    }

    const buyerEmail = String(order.buyer_email || verifiedEmail || "").toLowerCase();
    if (verifiedEmail && order.buyer_email && order.buyer_email.toLowerCase() !== verifiedEmail) {
      return jsonResponse({ ok: false, error: "This order belongs to a different account." }, 403);
    }
    if (!buyerEmail) {
      return jsonResponse({ ok: false, error: "Order has no buyer email." }, 400);
    }

    if (order.payment_status === "paid" || order.payment_status === "cod") {
      return jsonResponse({
        ok: true,
        already_paid: true,
        payment_status: order.payment_status,
      });
    }

    const amount = Number(order.total);
    if (!Number.isFinite(amount) || amount <= 0) {
      // Free / zero total — mark paid without Stripe
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "placed",
          paid_at: new Date().toISOString(),
          payment_note: "Zero-total order — no card charge",
        })
        .eq("id", orderId);
      return jsonResponse({ ok: true, free: true, order_id: orderId });
    }

    const vendorId = Number(order.vendor_id);
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id, name, stripe_account_id, stripe_connect_status, platform_fee_rate")
      .eq("id", vendorId)
      .maybeSingle();

    if (!vendor?.stripe_account_id || !/^acct_/.test(String(vendor.stripe_account_id))) {
      return jsonResponse({
        ok: false,
        error: "This maker has not finished Stripe Connect. Choose PayPal or cash, or ask them to connect Stripe.",
      }, 400);
    }

    let stripe;
    try {
      stripe = stripeClient();
    } catch (e) {
      return jsonResponse({ ok: false, error: String((e as Error)?.message || e) }, 500);
    }

    // Resolve integer user for Stripe customer
    let userId: number | null = order.user_id != null && Number.isFinite(Number(order.user_id))
      ? Number(order.user_id)
      : null;
    let userName: string | undefined;
    {
      const { data: userRow } = await supabase
        .from("users")
        .select("id, name, email")
        .ilike("email", buyerEmail)
        .maybeSingle();
      if (userRow?.id) {
        userId = Number(userRow.id);
        userName = userRow.name || undefined;
      }
    }

    const siteUrl = await resolveSiteUrl(supabase);
    let customerId: string | undefined;
    if (userId) {
      customerId = await getOrCreateStripeCustomer(stripe, supabase, {
        email: buyerEmail,
        userId,
        name: userName,
      });
    }

    const amountCents = Math.round(amount * 100);
    // Fee basis = product subtotal (not tax / shipping) when available
    const feeBasisDollars = Number(order.subtotal ?? amount) || amount;
    const feeBasisCents = Math.round(feeBasisDollars * 100);
    const taxHeldCents = Math.round((Number(order.sales_tax) || 0) * 100);
    const shippingCents = Math.round((Number(order.shipping_amount) || 0) * 100);
    const settings = await loadStripeSettings(supabase);
    const fees = computeApplicationFeeCents(feeBasisCents, settings);
    const applicationFee = fees.applicationFeeCents;

    // Physical marketplace goods: hold funds on platform until ship (separate charge + later Transfer).
    // Digital fulfillment_class: destination charge (immediate split) — rare for cart.
    const delivery = String(order.delivery_method || "shipping").toLowerCase();
    const fulfillmentClass = String(order.fulfillment_class || "physical").toLowerCase() === "digital"
      ? "digital"
      : "physical";
    const holdPhysical =
      fulfillmentClass === "physical" ||
      delivery === "shipping" ||
      delivery === "pickup";
    // vendor net = subtotal − platform application fee (admin + stripe estimate)
    const vendorPayoutCents = Math.max(0, feeBasisCents - applicationFee);

    let items: Array<{ name?: string; qty?: number; price?: number }> = [];
    try {
      const raw = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
      if (Array.isArray(raw)) items = raw;
    } catch {
      items = [];
    }

    const lineItems = items.length > 0
      ? items.map((it) => {
        const qty = Math.max(1, Number(it.qty) || 1);
        const unit = Math.max(0, Math.round((Number(it.price) || 0) * 100));
        return {
          price_data: {
            currency: "usd",
            unit_amount: unit || Math.round(amountCents / items.length),
            product_data: {
              name: String(it.name || "Marketplace item").slice(0, 120),
              description: `Hazel Allure · ${vendor.name || "Maker"} · Order #${orderId}`,
            },
          },
          quantity: qty,
        };
      })
      : [{
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: `Order #${orderId} — ${vendor.name || "Hazel Allure"}`,
            description: "Apothecary marketplace order",
          },
        },
        quantity: 1,
      }];

    // If line items sum drifts from order total (tax/fees), use single line for exact total
    const lineSum = lineItems.reduce(
      (s, li) => s + (li.price_data.unit_amount * li.quantity),
      0,
    );
    const useSingleLine = Math.abs(lineSum - amountCents) > 2;

    const paymentIntentData: Record<string, unknown> = {
      metadata: {
        checkout_type: "marketplace_order",
        order_id: String(orderId),
        vendor_id: String(vendorId),
        hold: holdPhysical ? "1" : "0",
        vendor_payout_cents: String(vendorPayoutCents),
      },
      transfer_group: `order_${orderId}`,
    };

    if (holdPhysical) {
      // Separate charges & transfers: full amount on platform; Transfer after ship
      // (no transfer_data / application_fee on PI)
    } else {
      if (applicationFee > 0) paymentIntentData.application_fee_amount = applicationFee;
      paymentIntentData.transfer_data = { destination: vendor.stripe_account_id };
    }

    const sessionParams: Record<string, unknown> = {
      mode: "payment",
      line_items: useSingleLine
        ? [{
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `Order #${orderId} — ${vendor.name || "Hazel Allure"}`,
              description: items.map((i) => i.name).filter(Boolean).join(", ").slice(0, 200) ||
                "Apothecary marketplace order",
            },
          },
          quantity: 1,
        }]
        : lineItems,
      success_url: `${siteUrl}/orders?paid=1&order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/orders?checkout=cancel&order=${orderId}`,
      customer_email: customerId ? undefined : buyerEmail,
      customer: customerId || undefined,
      client_reference_id: String(orderId),
      metadata: {
        checkout_type: "marketplace_order",
        order_id: String(orderId),
        vendor_id: String(vendorId),
        user_id: userId != null ? String(userId) : "",
        user_email: buyerEmail,
        platform: "hazelallure",
        hold: holdPhysical ? "1" : "0",
        fulfillment_class: fulfillmentClass,
        vendor_payout_cents: String(vendorPayoutCents),
        tax_held_cents: String(taxHeldCents),
      },
      payment_intent_data: paymentIntentData,
    };

    const session = await stripe.checkout.sessions.create(
      sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0],
    );

    const patch: Record<string, unknown> = {
      stripe_checkout_session_id: session.id,
      payment_method: "card",
      payment_status: "unpaid",
      status: "awaiting_payment",
      platform_fee: fees.adminFeeCents / 100,
      platform_fee_cents: applicationFee,
      vendor_payout_cents: vendorPayoutCents,
      tax_held_cents: taxHeldCents,
      fulfillment_class: fulfillmentClass,
      payout_status: holdPhysical ? "held" : "released",
      payment_note: holdPhysical
        ? `Stripe Checkout ${session.id} · PHYSICAL HOLD until shipped · vendor net ~$${(vendorPayoutCents / 100).toFixed(2)} · fee $${(applicationFee / 100).toFixed(2)}`
        : `Stripe Checkout ${session.id} → ${vendor.stripe_account_id} · immediate · fee $${(applicationFee / 100).toFixed(2)}`,
    };
    void shippingCents;

    let { error: upErr } = await supabase.from("orders").update(patch).eq("id", orderId);
    if (upErr && /column|schema cache|does not exist/i.test(upErr.message || "")) {
      const minimal = {
        stripe_checkout_session_id: session.id,
        payment_status: "unpaid",
        status: "awaiting_payment",
      };
      const retry = await supabase.from("orders").update(minimal).eq("id", orderId);
      upErr = retry.error;
    }
    if (upErr) {
      console.error("create-order-checkout save session:", upErr.message);
    }

    return jsonResponse({
      ok: true,
      url: session.url,
      session_id: session.id,
      order_id: orderId,
      application_fee_cents: applicationFee,
      admin_fee_cents: fees.adminFeeCents,
      stripe_estimate_cents: fees.stripeEstimateCents,
    });
  } catch (e) {
    console.error("create-order-checkout:", e);
    return jsonResponse({ ok: false, error: String((e as Error)?.message || e) }, 500);
  }
});
