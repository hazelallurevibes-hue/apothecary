import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  corsHeaders,
  jsonResponse,
  resolveSiteUrl,
  stripeClient,
} from "../_shared/stripePro.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

/**
 * Create or resume Stripe Connect Express onboarding for a vendor storefront.
 * Stores stripe_account_id on vendors and returns account_link URL.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const vendorId = Number(body.vendor_id || body.vendorId);
    const name = body.name ? String(body.name).trim() : "";

    if (!email || !Number.isFinite(vendorId) || vendorId <= 0) {
      return jsonResponse({ ok: false, error: "email and vendor_id required" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    let vendor: {
      id: number;
      email?: string;
      name?: string;
      stripe_account_id?: string;
      stripe_connect_status?: string;
    } | null = null;

    {
      const full = await supabase
        .from("vendors")
        .select("id, email, name, stripe_account_id, stripe_connect_status")
        .eq("id", vendorId)
        .maybeSingle();
      if (full.error && /stripe_connect_status/i.test(full.error.message || "")) {
        const min = await supabase
          .from("vendors")
          .select("id, email, name, stripe_account_id")
          .eq("id", vendorId)
          .maybeSingle();
        vendor = min.data;
        if (min.error) {
          return jsonResponse({ ok: false, error: min.error.message }, 500);
        }
      } else if (full.error) {
        return jsonResponse({ ok: false, error: full.error.message }, 500);
      } else {
        vendor = full.data;
      }
    }

    if (!vendor) {
      return jsonResponse({ ok: false, error: "Vendor not found" }, 404);
    }

    let stripe;
    try {
      stripe = stripeClient();
    } catch (e) {
      return jsonResponse({ ok: false, error: String(e?.message || e) }, 500);
    }

    const siteUrl = await resolveSiteUrl(supabase);
    let accountId = vendor.stripe_account_id || null;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email,
        business_profile: {
          name: name || vendor.name || undefined,
          product_description: "Apothecary goods and wellness services via Hazel Allure",
        },
        metadata: {
          hazelallure_vendor_id: String(vendorId),
          hazelallure_email: email,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      const update: Record<string, unknown> = {
        stripe_account_id: accountId,
        stripe_connect_status: "pending",
      };
      let { error: upErr } = await supabase.from("vendors").update(update).eq("id", vendorId);
      if (upErr && /stripe_connect_status/i.test(upErr.message || "")) {
        const retry = await supabase
          .from("vendors")
          .update({ stripe_account_id: accountId })
          .eq("id", vendorId);
        upErr = retry.error;
      }
      if (upErr) {
        return jsonResponse({
          ok: false,
          error: `Account created (${accountId}) but failed to save: ${upErr.message}`,
          account_id: accountId,
        }, 500);
      }
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${siteUrl}/vendor-dashboard?connect=refresh`,
      return_url: `${siteUrl}/vendor-dashboard?connect=return`,
      type: "account_onboarding",
    });

    return jsonResponse({
      ok: true,
      url: accountLink.url,
      account_id: accountId,
    });
  } catch (e) {
    return jsonResponse({
      ok: false,
      error: String(e?.message || e),
    }, 500);
  }
});
