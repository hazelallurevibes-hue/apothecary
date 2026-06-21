import { supabase } from './supabaseClient';
import { aggregateOrdersByQuarter, DEFAULT_PLATFORM_FEE_RATE, defaultRateForState } from './vendorTax';

const TAX_FIELDS = 'collect_sales_tax, sales_tax_rate, tax_state, tax_county, platform_fee_rate, vendor_tax_id, tax_filing_name, name';

export async function fetchVendorTaxSettings(vendorId) {
  const vid = Number(vendorId);
  if (!vid) return null;

  const { data, error } = await supabase
    .from('vendors')
    .select(TAX_FIELDS)
    .eq('id', vid)
    .maybeSingle();

  if (error && error.code !== '42703') throw new Error(error.message);
  if (!data) return null;

  return {
    ...data,
    platform_fee_rate: Number(data.platform_fee_rate) || DEFAULT_PLATFORM_FEE_RATE,
    sales_tax_rate: Number(data.sales_tax_rate) || defaultRateForState(data.tax_state),
  };
}

export async function saveVendorTaxSettings(vendorId, settings) {
  const vid = Number(vendorId);
  if (!vid) throw new Error('Vendor ID required.');

  const payload = {
    collect_sales_tax: !!settings.collect_sales_tax,
    sales_tax_rate: Number(settings.sales_tax_rate) || 0,
    tax_state: (settings.tax_state || '').trim().toUpperCase() || null,
    tax_county: (settings.tax_county || '').trim() || null,
    platform_fee_rate: Number(settings.platform_fee_rate) || DEFAULT_PLATFORM_FEE_RATE,
    vendor_tax_id: (settings.vendor_tax_id || '').trim() || null,
    tax_filing_name: (settings.tax_filing_name || '').trim() || null,
  };

  const { error } = await supabase.from('vendors').update(payload).eq('id', vid);
  if (error) throw new Error(error.message || 'Could not save tax settings. Run VENDOR_TAX_AND_ONBOARDING.sql.');
  return payload;
}

export async function fetchVendorOrdersForTax(vendorId) {
  const vid = Number(vendorId);
  if (!vid) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('vendor_id', vid)
    .order('id', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function saveTaxSnapshot(vendorId, snapshot) {
  const vid = Number(vendorId);
  const { error } = await supabase.from('vendor_tax_snapshots').upsert(
    {
      vendor_id: vid,
      year: snapshot.year,
      quarter: snapshot.quarter,
      gross_sales: snapshot.grossSales,
      sales_tax_collected: snapshot.salesTaxCollected,
      platform_fees_paid: snapshot.platformFees,
      estimated_state_tax_owed: snapshot.estimatedStateTaxOwed,
      estimated_federal_income_tax: snapshot.estimatedFederalIncomeTax,
      estimated_self_employment_tax: snapshot.estimatedSelfEmploymentTax,
      net_vendor_earnings: snapshot.netEarnings,
      generated_at: new Date().toISOString(),
    },
    { onConflict: 'vendor_id,year,quarter' }
  );

  if (error && error.code !== '42P01') throw new Error(error.message);
}

export async function fetchTaxSnapshots(vendorId) {
  const { data, error } = await supabase
    .from('vendor_tax_snapshots')
    .select('*')
    .eq('vendor_id', Number(vendorId))
    .order('year', { ascending: false })
    .order('quarter', { ascending: false });

  if (error && error.code !== '42P01') return [];
  return data || [];
}