import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/stripePro.ts";
import { quoteTax } from "../_shared/taxQuote.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Tax Vato — worldwide multi-party tax quote.
 * Body: { shipTo, lines, seller?, platform?, tenantId?, persist? }
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const body = await req.json();
    const tenantId = String(body.tenantId || body.tenant_id || "hazelallure");

    const quote = quoteTax({
      tenantId,
      currency: body.currency || "USD",
      shipTo: body.shipTo || body.ship_to || {},
      shipFrom: body.shipFrom || body.ship_from,
      lines: body.lines || [],
      seller: body.seller || {},
      platform: body.platform || { marketplaceFacilitator: true },
    });

    if (body.persist) {
      const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
      await supabase.from("tax_quotes").insert({
        tenant_id: tenantId,
        quote_json: quote,
        ship_to: quote.shipTo,
        tax_total: quote.taxTotal,
        currency: quote.currency,
      });
    }

    return jsonResponse({ ok: true, quote });
  } catch (e) {
    console.error("tax-quote:", e);
    return jsonResponse({ ok: false, error: String((e as Error)?.message || e) }, 500);
  }
});
