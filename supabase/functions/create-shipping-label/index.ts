import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  corsHeaders,
  jsonResponse,
  loadStripeSettings,
} from "../_shared/stripePro.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Quote or purchase a shipping label for a marketplace order.
 * Phase 1: rate estimate + markup ledger (EasyPost/Shippo wire-up via SHIPPING_PROVIDER_KEY later).
 *
 * Body: { order_id, action: 'quote'|'purchase', carrier?, service?, weight_oz?, vendor_id }
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const body = await req.json();
    const orderId = Number(body.order_id || body.orderId);
    const action = String(body.action || "quote").toLowerCase();
    const vendorId = Number(body.vendor_id || body.vendorId);

    if (!orderId) return jsonResponse({ ok: false, error: "order_id required" }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const settings = await loadStripeSettings(supabase);

    const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (!order) return jsonResponse({ ok: false, error: "Order not found" }, 404);

    const vid = vendorId || Number(order.vendor_id);
    const carrier = String(body.carrier || "usps").toLowerCase();
    const service = String(body.service || "priority").toLowerCase();
    const weightOz = Math.max(1, Number(body.weight_oz) || 16);

    // Simple rate table (USD cents) — replace with EasyPost live rates
    const baseTable: Record<string, number> = {
      "usps-ground": 899,
      "usps-priority": 1299,
      "usps-express": 2899,
      "ups-ground": 1499,
      "fedex-home": 1599,
    };
    const key = `${carrier}-${service}`;
    let rateCents = baseTable[key] || 1299;
    // Weight bump
    rateCents += Math.max(0, Math.ceil(weightOz / 16) - 1) * 250;

    const markupFixed = Math.round(Number(settings.shipping_label_markup_cents || "150"));
    const markupPct = Number(settings.shipping_label_markup_percent || "10");
    const markupCents = markupFixed + Math.round(rateCents * (markupPct / 100));
    const totalCharged = rateCents + markupCents;

    if (action === "quote") {
      const { data: row } = await supabase.from("shipping_labels").insert({
        order_id: orderId,
        vendor_id: vid,
        carrier,
        service,
        rate_cents: rateCents,
        markup_cents: markupCents,
        total_charged_cents: totalCharged,
        status: "quoted",
        provider: "builtin_estimate",
        ship_to: { address: order.address },
      }).select().single();

      return jsonResponse({
        ok: true,
        quote: {
          id: row?.id,
          carrier,
          service,
          rate_cents: rateCents,
          markup_cents: markupCents,
          total_charged_cents: totalCharged,
          currency: "USD",
          note: "Estimate — connect EasyPost/Shippo for live purchasable labels.",
        },
      });
    }

    if (action === "purchase") {
      // Placeholder purchase: stores purchased status; wire SHIPPO_API_KEY later
      const tracking = `HA${orderId}${Date.now().toString(36).toUpperCase()}`;
      const { data: row, error } = await supabase.from("shipping_labels").insert({
        order_id: orderId,
        vendor_id: vid,
        carrier,
        service,
        rate_cents: rateCents,
        markup_cents: markupCents,
        total_charged_cents: totalCharged,
        status: "purchased",
        provider: "builtin_estimate",
        tracking_number: tracking,
        label_url: null,
        purchased_at: new Date().toISOString(),
        ship_to: { address: order.address },
      }).select().single();
      if (error) return jsonResponse({ ok: false, error: error.message }, 500);

      await supabase.from("orders").update({
        tracking_number: tracking,
        shipping_carrier: carrier,
        shipping_service: service,
        shipping_amount: totalCharged / 100,
        shipped_at: new Date().toISOString(),
        status: "shipped",
        payout_status: order.payout_status === "held" ? "release_ready" : order.payout_status,
      }).eq("id", orderId);

      return jsonResponse({
        ok: true,
        label: row,
        message: "Label recorded & order marked shipped. Live PDF labels require EasyPost/Shippo keys.",
      });
    }

    return jsonResponse({ ok: false, error: "action must be quote or purchase" }, 400);
  } catch (e) {
    console.error("create-shipping-label:", e);
    return jsonResponse({ ok: false, error: String((e as Error)?.message || e) }, 500);
  }
});
