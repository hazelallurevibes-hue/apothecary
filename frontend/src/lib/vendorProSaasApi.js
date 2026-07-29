import { supabase } from './supabaseClient';
import { downloadCsv, downloadText } from './csvExport';
import {
  aggregateOrdersByQuarter,
  annual1099SummaryToCsv,
  quarterlyReportToCsv,
  parseOrderFinancials,
} from './vendorTax';
import { fetchVendorOrdersForTax, fetchVendorTaxSettings } from './vendorTaxApi';

export async function fetchVendorProFields(vendorId) {
  const { data, error } = await supabase
    .from('vendors')
    .select(
      'id, name, market_day_mode, market_day_note, story_video_url, branded_email_footer, shift_notes, ships_domestically, ships_internationally, fulfillment_default',
    )
    .eq('id', Number(vendorId))
    .maybeSingle();
  if (error && error.code !== '42703') {
    // Retry minimal columns if some missing
    const { data: d2 } = await supabase
      .from('vendors')
      .select('id, name')
      .eq('id', Number(vendorId))
      .maybeSingle();
    return d2 || null;
  }
  return data;
}

export async function saveVendorProFields(vendorId, patch) {
  const { error } = await supabase.from('vendors').update(patch).eq('id', Number(vendorId));
  if (error) throw new Error(error.message);
  return patch;
}

/** Download a multi-file “tax pack” for the accountant (sequential CSVs + readme). */
export async function downloadTaxPack(vendorId, { year = new Date().getFullYear() } = {}) {
  const [settings, orders] = await Promise.all([
    fetchVendorTaxSettings(vendorId),
    fetchVendorOrdersForTax(vendorId),
  ]);
  const name = settings?.tax_filing_name || settings?.name || `vendor-${vendorId}`;
  const safe = String(name).replace(/[^\w\-]+/g, '_').slice(0, 40);

  // Line-item order export
  const orderRows = (orders || []).map((o) => {
    const f = parseOrderFinancials(o);
    return {
      order_id: o.id,
      date: o.date || o.created_at || '',
      status: o.status || '',
      customer: o.customer_name || o.customer_email || '',
      subtotal: f.subtotal,
      sales_tax: f.salesTax,
      platform_fee: f.platformFee,
      total: f.total,
      net_to_vendor: f.netToVendor,
      delivery_method: o.delivery_method || '',
    };
  });
  if (orderRows.length) {
    downloadCsv(orderRows, `${safe}-orders-${year}.csv`);
  } else {
    downloadCsv([{ note: 'No orders yet' }], `${safe}-orders-${year}.csv`);
  }

  // Quarterly packs Q1–Q4
  for (let q = 1; q <= 4; q += 1) {
    const quarterly = aggregateOrdersByQuarter(orders, year, q);
    const csvText = quarterlyReportToCsv(quarterly, name);
    downloadText(String(csvText || ''), `${safe}-tax-Q${q}-${year}.csv`);
  }

  const annual = annual1099SummaryToCsv({
    vendor: { id: vendorId, name, ...(settings || {}) },
    year,
    orders,
  });
  downloadText(String(annual || ''), `${safe}-payment-summary-${year}.csv`);

  downloadText(
    [
      'Hazel Allure — Vendor Tax Pack',
      `Vendor: ${name} (#${vendorId})`,
      `Year: ${year}`,
      '',
      'Contents:',
      `- ${safe}-orders-${year}.csv — order-level sales`,
      `- ${safe}-tax-Q1..Q4-${year}.csv — quarterly estimates`,
      `- ${safe}-payment-summary-${year}.csv — annual payment summary for CPA`,
      '',
      'NOT TAX ADVICE. Hazel Allure does not file taxes for you.',
      'Generated: ' + new Date().toISOString(),
    ].join('\n'),
    `${safe}-tax-pack-README.txt`,
  );

  return { orderCount: orders?.length || 0, year };
}

export function parseShiftNotes(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function makeShiftNote({ author, body, role = 'staff' }) {
  return {
    id: `sn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    author: author || 'Staff',
    role,
    body: (body || '').trim(),
    created_at: new Date().toISOString(),
  };
}
