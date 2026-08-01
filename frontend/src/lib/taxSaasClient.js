/**
 * Hazel Allure client for Tax SaaS (@tax-saas package + edge tax-quote).
 */
import { quoteTax as localQuote, evaluateNexus, US_STATE_SALES_TAX } from '@tax-saas/index.js';
import { supabase } from './supabaseClient';

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export { evaluateNexus, US_STATE_SALES_TAX };

/**
 * Quote tax for checkout. Prefers local engine (fast); optionally hits edge for audit persist.
 */
export function quoteCheckoutTax({
  subtotal,
  country = 'US',
  region,
  county,
  postalCode,
  city,
  productCategory = 'physical_goods',
  shippingAmount = 0,
  sellerNexusRegions = [],
  sellerHomeRegion,
  marketplaceFacilitator = true,
}) {
  const lines = [
    { amount: Number(subtotal) || 0, quantity: 1, productCategory },
  ];
  if (shippingAmount > 0) {
    lines.push({ amount: Number(shippingAmount), quantity: 1, productCategory: 'shipping' });
  }

  return localQuote({
    tenantId: 'hazelallure',
    shipTo: { country, region, county, postalCode, city },
    lines,
    seller: {
      nexusRegions: sellerNexusRegions,
      homeRegion: sellerHomeRegion,
    },
    platform: { marketplaceFacilitator },
  });
}

/** Optional remote quote + persist for compliance trail */
export async function quoteTaxRemote(payload, { persist = false } = {}) {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    return { ok: true, quote: localQuote(payload) };
  }
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(`${FN_BASE}/tax-quote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...payload, persist }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'tax-quote failed');
  return json;
}

export async function loadVendorNexus(vendorId) {
  if (!vendorId) return null;
  const { data } = await supabase
    .from('tax_nexus_profiles')
    .select('*')
    .eq('tenant_id', 'hazelallure')
    .eq('vendor_id', Number(vendorId))
    .maybeSingle();
  return data;
}

export async function saveVendorNexus(vendorId, profile) {
  const payload = {
    tenant_id: 'hazelallure',
    seller_ref: `vendor:${vendorId}`,
    vendor_id: Number(vendorId),
    home_country: profile.home_country || 'US',
    home_region: profile.home_region || null,
    nexus_regions: profile.nexus_regions || [],
    collect_independently: !!profile.collect_independently,
    notes: profile.notes || null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('tax_nexus_profiles')
    .upsert(payload, { onConflict: 'tenant_id,seller_ref' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
