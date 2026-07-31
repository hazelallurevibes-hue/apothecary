import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  corsHeaders,
  jsonResponse,
  loadStripeSettings,
  resolveSiteUrl,
  stripeClient,
} from "../_shared/stripePro.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/** One-time Stripe Checkout for featured placement ads. */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const vendorId = Number(body.vendor_id || body.vendorId);
    if (!email || !Number.isFinite(vendorId) || vendorId <= 0) {
      return jsonResponse({ ok: false, error: "email and vendor_id required" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const settings = await loadStripeSettings(supabase);
    const priceCents = Math.max(100, Number(settings.featured_ad_price_cents) || 4900);
    const days = Math.max(1, Number(settings.featured_ad_days) || 7);

    const { data: vendor } = await supabase
      .from("vendors")
      .select("id, name, email")
      .eq("id", vendorId)
      .maybeSingle();
    if (!vendor) return jsonResponse({ ok: false, error: "Vendor not found" }, 404);

    const { data: campaign, error: cErr } = await supabase
      .from("vendor_ad_campaigns")
      .insert({
        vendor_id: vendorId,
        status: "pending_payment",
        package_days: days,
        amount_cents: priceCents,
      })
      .select("id")
      .single();
    if (cErr) {
      return jsonResponse({
        ok: false,
        error: cErr.message || "Could not create campaign (run ads migration)",
      }, 500);
    }

    let stripe;
    let siteUrl: string;
    try {
      stripe = stripeClient();
      siteUrl = await resolveSiteUrl(supabase);
    } catch (e) {
      return jsonResponse({ ok: false, error: String(e?.message || e) }, 500);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: priceCents,
            product_data: {
              name: `Featured placement — ${days} days`,
              description: `Homepage & marketplace sponsored placement for ${vendor.name || "your shop"}`,
            },
          },
        },
      ],
      success_url: `${siteUrl}/vendor-dashboard?ad=success&campaign=${campaign.id}`,
      cancel_url: `${siteUrl}/vendor-dashboard?ad=cancel`,
      metadata: {
        purpose: "featured_ad",
        vendor_id: String(vendorId),
        campaign_id: String(campaign.id),
        package_days: String(days),
      },
    });

    await supabase
      .from("vendor_ad_campaigns")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", campaign.id);

    if (!session.url) {
      return jsonResponse({ ok: false, error: "Stripe did not return checkout URL" }, 500);
    }
    return jsonResponse({ ok: true, url: session.url, campaign_id: campaign.id });
  } catch (e) {
    return jsonResponse({ ok: false, error: String(e?.message || e) }, 500);
  }
});
