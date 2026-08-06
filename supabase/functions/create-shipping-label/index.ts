import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  corsHeaders,
  jsonResponse,
  loadStripeSettings,
} from "../_shared/stripePro.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EASYPOST_KEY = Deno.env.get("EASYPOST_API_KEY") || "";

/** Little Shippie estimate table (same logic as little-shippie package). */
function estimateRates(weightOz: number, lengthIn: number, widthIn: number, heightIn: number) {
  const oz = Math.max(1, weightOz || 16);
  const L = Math.max(1, lengthIn || 8);
  const W = Math.max(1, widthIn || 6);
  const H = Math.max(1, heightIn || 4);
  const dimLb = (L * W * H) / 166;
  const billable = Math.max(1, Math.ceil(Math.max(oz / 16, dimLb)));
  const oversized = L > 22 || W > 18 || H > 15;
  const services = [
    { carrier: "usps", service: "ground", label: "USPS Ground Advantage", base: 799, per: 185 },
    { carrier: "usps", service: "priority", label: "USPS Priority Mail", base: 1099, per: 220 },
    { carrier: "usps", service: "express", label: "USPS Priority Mail Express", base: 2899, per: 310 },
    { carrier: "ups", service: "ground", label: "UPS Ground", base: 1299, per: 240 },
    { carrier: "fedex", service: "home", label: "FedEx Home Delivery", base: 1399, per: 250 },
  ];
  return services.map((s) => {
    let rate = s.base + (billable - 1) * s.per;
    if (oversized) rate = Math.round(rate * 1.35);
    return { ...s, rate_cents: rate };
  });
}

/**
 * Little Shippie edge: quote multi-service rates + purchase label.
 * With EASYPOST_API_KEY → live labels; otherwise estimate + printable tracking.
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
    const lengthIn = Math.max(1, Number(body.length_in) || 8);
    const widthIn = Math.max(1, Number(body.width_in) || 6);
    const heightIn = Math.max(1, Number(body.height_in) || 4);

    const estimates = estimateRates(weightOz, lengthIn, widthIn, heightIn);
    const picked =
      estimates.find((e) => e.carrier === carrier && e.service === service) || estimates[1] || estimates[0];
    let rateCents = picked.rate_cents;

    const markupFixed = Math.round(Number(settings.shipping_label_markup_cents || "150"));
    const markupPct = Number(settings.shipping_label_markup_percent || "10");
    const markupCents = markupFixed + Math.round(rateCents * (markupPct / 100));
    const totalCharged = rateCents + markupCents;

    if (action === "quote" || action === "shop") {
      const rates = estimates.map((e) => {
        const m = markupFixed + Math.round(e.rate_cents * (markupPct / 100));
        return {
          carrier: e.carrier,
          service: e.service,
          label: e.label,
          rate_cents: e.rate_cents,
          markup_cents: m,
          total_charged_cents: e.rate_cents + m,
          currency: "USD",
          provider: EASYPOST_KEY ? "easypost_ready" : "little_shippie_estimate",
        };
      });
      return jsonResponse({
        ok: true,
        rates,
        quote: rates.find((r) => r.carrier === carrier && r.service === service) || rates[0],
        parcel: { weightOz, lengthIn, widthIn, heightIn },
        note: EASYPOST_KEY
          ? "EasyPost key present — purchase uses live path when wired."
          : "Little Shippie estimates — print labels now; connect EasyPost for live USPS PDFs.",
      });
    }

    if (action === "purchase") {
      let tracking = `HA${orderId}${Date.now().toString(36).toUpperCase()}`;
      let labelUrl: string | null = null;
      let provider = "little_shippie_estimate";

      // Optional EasyPost purchase (when key configured)
      if (EASYPOST_KEY) {
        try {
          const { data: vendor } = await supabase
            .from("vendors")
            .select("name, city, state, zip, address, country, email, phone")
            .eq("id", vid)
            .maybeSingle();
          const shipTo = String(order.address || "");
          const epRes = await fetch("https://api.easypost.com/v2/shipments", {
            method: "POST",
            headers: {
              Authorization: `Basic ${btoa(EASYPOST_KEY + ":")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              shipment: {
                to_address: { name: order.buyer_email || "Buyer", street1: shipTo, country: "US" },
                from_address: {
                  name: vendor?.name || "Maker",
                  street1: vendor?.address || "See packing slip",
                  city: vendor?.city || "Unknown",
                  state: vendor?.state || "CA",
                  zip: vendor?.zip || "00000",
                  country: vendor?.country || "US",
                  phone: vendor?.phone || "0000000000",
                },
                parcel: {
                  weight: weightOz,
                  length: lengthIn,
                  width: widthIn,
                  height: heightIn,
                },
              },
            }),
          });
          if (epRes.ok) {
            const shipment = await epRes.json();
            const rate = (shipment.rates || []).find((r: { carrier?: string; service?: string }) =>
              String(r.carrier || "").toLowerCase().includes(carrier)
            ) || (shipment.rates || [])[0];
            if (rate?.id) {
              const buyRes = await fetch(`https://api.easypost.com/v2/shipments/${shipment.id}/buy`, {
                method: "POST",
                headers: {
                  Authorization: `Basic ${btoa(EASYPOST_KEY + ":")}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ rate: { id: rate.id } }),
              });
              if (buyRes.ok) {
                const bought = await buyRes.json();
                tracking = bought.tracking_code || tracking;
                labelUrl = bought.postage_label?.label_url || null;
                provider = "easypost";
                if (bought.selected_rate?.rate) {
                  rateCents = Math.round(Number(bought.selected_rate.rate) * 100);
                }
              }
            }
          }
        } catch (epErr) {
          console.warn("easypost fallback to estimate", epErr);
        }
      }

      const finalMarkup = markupFixed + Math.round(rateCents * (markupPct / 100));
      const finalTotal = rateCents + finalMarkup;

      const { data: row, error } = await supabase.from("shipping_labels").insert({
        order_id: orderId,
        vendor_id: vid,
        carrier,
        service,
        rate_cents: rateCents,
        markup_cents: finalMarkup,
        total_charged_cents: finalTotal,
        status: "purchased",
        provider,
        tracking_number: tracking,
        label_url: labelUrl,
        purchased_at: new Date().toISOString(),
        ship_to: { address: order.address },
        meta: { weight_oz: weightOz, length_in: lengthIn, width_in: widthIn, height_in: heightIn },
      }).select().single();

      if (error) {
        // retry without meta column
        const retry = await supabase.from("shipping_labels").insert({
          order_id: orderId,
          vendor_id: vid,
          carrier,
          service,
          rate_cents: rateCents,
          markup_cents: finalMarkup,
          total_charged_cents: finalTotal,
          status: "purchased",
          provider,
          tracking_number: tracking,
          label_url: labelUrl,
          purchased_at: new Date().toISOString(),
          ship_to: { address: order.address },
        }).select().single();
        if (retry.error) return jsonResponse({ ok: false, error: retry.error.message }, 500);
      }

      await supabase.from("orders").update({
        tracking_number: tracking,
        shipping_carrier: carrier,
        shipping_service: service,
        shipping_amount: finalTotal / 100,
        shipped_at: new Date().toISOString(),
        status: "shipped",
        payout_status: order.payout_status === "held" ? "release_ready" : order.payout_status,
      }).eq("id", orderId);

      return jsonResponse({
        ok: true,
        label: row || { tracking_number: tracking, label_url: labelUrl, carrier, service },
        message: labelUrl
          ? "Live label purchased. Open PDF to print."
          : "Little Shippie label recorded — use Print label for shipper + buyer sheet. Add EASYPOST_API_KEY for live USPS PDFs.",
        label_url: labelUrl,
      });
    }

    return jsonResponse({ ok: false, error: "action must be quote, shop, or purchase" }, 400);
  } catch (e) {
    console.error("create-shipping-label:", e);
    return jsonResponse({ ok: false, error: String((e as Error)?.message || e) }, 500);
  }
});
