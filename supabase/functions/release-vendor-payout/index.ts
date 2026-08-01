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

/**
 * Transfer held marketplace funds to the vendor Connect account.
 * Call after ship (or after hold days) for physical card orders.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const body = await req.json();
    const orderId = Number(body.order_id || body.orderId);
    if (!orderId) return jsonResponse({ ok: false, error: "order_id required" }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (error) return jsonResponse({ ok: false, error: error.message }, 500);
    if (!order) return jsonResponse({ ok: false, error: "Order not found" }, 404);

    if (order.payment_status !== "paid" && order.payment_status !== "cod") {
      return jsonResponse({ ok: false, error: "Order is not paid" }, 400);
    }
    if (order.payout_status === "released") {
      return jsonResponse({ ok: true, already_released: true, transfer_id: order.stripe_transfer_id });
    }
    if (order.payment_method === "cash" || order.payment_status === "cod") {
      await supabase.from("orders").update({ payout_status: "cod" }).eq("id", orderId);
      return jsonResponse({ ok: true, cod: true, message: "COD — no platform transfer" });
    }

    const { data: vendor } = await supabase
      .from("vendors")
      .select("id, stripe_account_id, name")
      .eq("id", order.vendor_id)
      .maybeSingle();

    if (!vendor?.stripe_account_id) {
      return jsonResponse({ ok: false, error: "Vendor has no Stripe Connect account" }, 400);
    }

    let amountCents = Number(order.vendor_payout_cents);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      const sub = Math.round((Number(order.subtotal ?? order.total) || 0) * 100);
      const fee = Math.round((Number(order.platform_fee) || 0) * 100);
      amountCents = Math.max(0, sub - fee);
    }
    if (amountCents < 50) {
      return jsonResponse({ ok: false, error: "Transfer amount too small" }, 400);
    }

    // Optional hold-days gate
    const settings = await loadStripeSettings(supabase);
    const releaseMode = settings.physical_payout_release || "on_ship";
    const holdDays = Number(settings.physical_payout_hold_days || "0");
    if (releaseMode === "on_ship" && !order.shipped_at && order.fulfillment_class !== "digital") {
      return jsonResponse({
        ok: false,
        error: "Mark the order shipped before releasing payout.",
      }, 400);
    }
    if (holdDays > 0 && order.shipped_at) {
      const ready = new Date(order.shipped_at).getTime() + holdDays * 86400000;
      if (Date.now() < ready) {
        return jsonResponse({
          ok: false,
          error: `Hold period active until ${new Date(ready).toISOString()}`,
          release_at: new Date(ready).toISOString(),
        }, 400);
      }
    }

    const stripe = stripeClient();
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: "usd",
      destination: vendor.stripe_account_id,
      transfer_group: `order_${orderId}`,
      metadata: {
        order_id: String(orderId),
        vendor_id: String(order.vendor_id),
        platform: "hazelallure",
      },
    });

    await supabase.from("orders").update({
      payout_status: "released",
      stripe_transfer_id: transfer.id,
      payment_note: `${order.payment_note || ""} · Transferred ${transfer.id} $${(amountCents / 100).toFixed(2)}`.trim(),
    }).eq("id", orderId);

    return jsonResponse({
      ok: true,
      transfer_id: transfer.id,
      amount_cents: amountCents,
      destination: vendor.stripe_account_id,
    });
  } catch (e) {
    console.error("release-vendor-payout:", e);
    return jsonResponse({ ok: false, error: String((e as Error)?.message || e) }, 500);
  }
});
