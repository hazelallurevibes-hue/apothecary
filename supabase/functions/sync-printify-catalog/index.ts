import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors() });

  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user?.email) return json({ ok: false, error: "Sign in required" }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: vendor } = await admin
    .from("vendors")
    .select("id, name, external_store_urls, plan")
    .ilike("email", user.email)
    .maybeSingle();
  if (!vendor?.id) return json({ ok: false, error: "No practitioner shop for this account" }, 403);

  const body = await req.json().catch(() => ({}));
  const token = String(body.token || body.access_token || "").trim();
  let shopId = body.shop_id != null ? String(body.shop_id) : "";

  const { data: existing } = await admin
    .from("vendor_pod_connections")
    .select("access_token, shop_id")
    .eq("vendor_id", vendor.id)
    .eq("provider", "printify")
    .maybeSingle();

  const access = token || existing?.access_token;
  if (!access) return json({ ok: false, error: "Paste your Printify API token once to connect." }, 400);

  const printify = (path: string) =>
    fetch(`https://api.printify.com/v1${path}`, {
      headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
    });

  if (!shopId) {
    const shopsRes = await printify("/shops.json");
    const shopsJson = await shopsRes.json().catch(() => ({}));
    if (!shopsRes.ok) {
      return json({ ok: false, error: shopsJson.message || "Printify rejected the token" }, 400);
    }
    const shops = Array.isArray(shopsJson) ? shopsJson : shopsJson.data || [];
    shopId = String(shops[0]?.id || existing?.shop_id || "");
    if (!shopId) return json({ ok: false, error: "No Printify shop on this token. Add an API or Shopify store in Printify first." }, 400);
  }

  const prodRes = await printify(`/shops/${shopId}/products.json?limit=50`);
  const prodJson = await prodRes.json().catch(() => ({}));
  if (!prodRes.ok) {
    return json({ ok: false, error: prodJson.message || "Could not list Printify products" }, 400);
  }
  const products = Array.isArray(prodJson.data) ? prodJson.data : Array.isArray(prodJson) ? prodJson : [];

  const storeUrls = vendor.external_store_urls || {};
  const fallbackBuy =
    storeUrls.printify || storeUrls.shopify || storeUrls.etsy || storeUrls.custom || "";

  let upserted = 0;
  for (const p of products) {
    const enabled = (p.variants || []).filter((v: { is_enabled?: boolean }) => v.is_enabled !== false);
    const variant = enabled[0] || p.variants?.[0];
    const priceCents = Number(variant?.price || 0);
    const price = priceCents > 1000 ? priceCents / 100 : priceCents;
    const photo = p.images?.[0]?.src || p.images?.[0]?.url || null;
    const handle = p.external?.handle || "";
    const buyUrl = handle && storeUrls.shopify
      ? `${String(storeUrls.shopify).replace(/\/$/, "")}/products/${handle}`
      : fallbackBuy || null;

    const row = {
      vendor_id: vendor.id,
      name: p.title || "Printify item",
      description: (p.description || "").replace(/<[^>]+>/g, " ").slice(0, 2000),
      price: Number.isFinite(price) ? price : 0,
      photo,
      approved: 1,
      fulfillment_mode: "external_only",
      external_buy_url: buyUrl,
      pod_provider: "printify",
      pod_product_id: String(p.id),
      pod_synced_at: new Date().toISOString(),
    };

    const { data: existingItem } = await admin
      .from("produce_items")
      .select("id")
      .eq("vendor_id", vendor.id)
      .eq("pod_provider", "printify")
      .eq("pod_product_id", String(p.id))
      .maybeSingle();
    const { error } = existingItem?.id
      ? await admin.from("produce_items").update(row).eq("id", existingItem.id)
      : await admin.from("produce_items").insert(row);
    if (!error) upserted += 1;
  }

  await admin.from("vendor_pod_connections").upsert({
    vendor_id: vendor.id,
    provider: "printify",
    shop_id: shopId,
    access_token: access,
    last_sync_at: new Date().toISOString(),
    last_error: null,
    product_count: upserted,
  }, { onConflict: "vendor_id,provider" });

  return json({ ok: true, shop_id: shopId, synced: upserted });
});
