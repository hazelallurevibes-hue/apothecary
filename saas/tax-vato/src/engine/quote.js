import { US_STATE_SALES_TAX, US_LOCAL_SAMPLES, localKey, resolveUsRates } from '../data/us-state-rates.js';
import { VAT_GST_COUNTRIES, CA_PROVINCE_TAX, MX_IVA } from '../data/vat-countries.js';
import { resolveCategory } from '../data/product-categories.js';
import { resolveRemitter } from './facilitator.js';
import { sellerHasNexusIn } from './nexus.js';

function roundMoney(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function money(n) {
  return roundMoney(n);
}

/**
 * Build a tax quote for a multi-line cart.
 *
 * @param {object} input
 * @param {string} [input.tenantId]
 * @param {string} [input.currency]
 * @param {{country:string,region?:string,postalCode?:string,city?:string,county?:string}} input.shipTo
 * @param {{country?:string,region?:string}} [input.shipFrom]
 * @param {Array<{amount:number,quantity?:number,productCategory?:string,taxCode?:string,taxExempt?:boolean}>} input.lines
 * @param {{id?:string,nexusRegions?:string[],homeRegion?:string,country?:string,collectIndependently?:boolean}} [input.seller]
 * @param {{marketplaceFacilitator?:boolean,country?:string}} [input.platform]
 * @param {boolean} [input.includeShippingTax]
 */
export function quoteTax(input = {}) {
  const shipTo = input.shipTo || {};
  const country = String(shipTo.country || 'US').toUpperCase();
  const region = String(shipTo.region || shipTo.state || '').toUpperCase();
  const county = shipTo.county || '';
  const currency = (input.currency || 'USD').toUpperCase();
  const linesIn = Array.isArray(input.lines) ? input.lines : [];
  const platform = input.platform || { marketplaceFacilitator: true };
  const seller = input.seller || {};

  const remitterBase = resolveRemitter({
    country,
    region,
    platformIsMarketplace: platform.marketplaceFacilitator !== false,
    sellerCollectsIndependently: !!seller.collectIndependently,
  });

  const jurisdictions = [];
  const lineResults = [];
  let taxableSubtotal = 0;
  let exemptSubtotal = 0;
  let taxTotal = 0;

  for (let i = 0; i < linesIn.length; i++) {
    const line = linesIn[i];
    const qty = Math.max(1, Number(line.quantity) || 1);
    const amount = money((Number(line.amount) || 0) * qty);
    const cat = resolveCategory(line.productCategory || 'physical_goods');
    const exempt = !!line.taxExempt || cat.taxability === 'exempt';

    if (exempt) {
      exemptSubtotal = money(exemptSubtotal + amount);
      lineResults.push({
        index: i,
        amount,
        productCategory: line.productCategory || 'physical_goods',
        taxable: false,
        tax: 0,
        rate: 0,
        components: [],
        note: 'Exempt category or line marked taxExempt',
      });
      continue;
    }

    // Pure services often untaxed in many US states unless configured
    if (cat.taxability === 'varies' && country === 'US' && !line.forceTaxable) {
      exemptSubtotal = money(exemptSubtotal + amount);
      lineResults.push({
        index: i,
        amount,
        productCategory: line.productCategory,
        taxable: false,
        tax: 0,
        rate: 0,
        components: [],
        note: 'Service category treated as non-taxable by default in US (override with forceTaxable)',
      });
      continue;
    }

    const components = buildRateComponents({
      country,
      region,
      county,
      productCategory: line.productCategory || 'physical_goods',
      isDigital: cat.digital,
      estimateLocal: input.estimateLocal !== false,
      mxBorder: !!input.mxBorder || !!shipTo.mxBorder || !!shipTo.borderRegion,
    });

    const combinedRate = components.reduce((s, c) => s + c.rate, 0);
    const tax = money(amount * combinedRate);
    taxableSubtotal = money(taxableSubtotal + amount);
    taxTotal = money(taxTotal + tax);

    for (const c of components) {
      if (!jurisdictions.find((j) => j.code === c.code)) {
        jurisdictions.push({
          code: c.code,
          name: c.name,
          type: c.type,
          rate: c.rate,
        });
      }
    }

    lineResults.push({
      index: i,
      amount,
      productCategory: line.productCategory || 'physical_goods',
      taxable: true,
      tax,
      rate: combinedRate,
      components,
    });
  }

  const subtotal = money(taxableSubtotal + exemptSubtotal);
  const total = money(subtotal + taxTotal);

  // Party breakdown for remittance / reporting
  const remitter = { ...remitterBase };
  if (country === 'US' && remitter.platformCollects && region) {
    // If seller has no nexus and not MPF state edge cases — still MPF
    remitter.sellerNexusInDestination = sellerHasNexusIn(seller, region);
  }

  const byJurisdiction = {};
  for (const lr of lineResults) {
    for (const c of lr.components || []) {
      const share = money(lr.amount * c.rate);
      if (!byJurisdiction[c.code]) {
        byJurisdiction[c.code] = {
          code: c.code,
          name: c.name,
          type: c.type,
          rate: c.rate,
          tax: 0,
        };
      }
      byJurisdiction[c.code].tax = money(byJurisdiction[c.code].tax + share);
    }
  }

  const parties = {
    buyer: {
      paysTaxOnInvoice: taxTotal > 0,
      taxAmount: taxTotal,
      currency,
      shipTo: { country, region, county: county || null, postalCode: shipTo.postalCode || null },
    },
    seller: {
      remitsSalesTax: remitter.sellerCollects,
      receivesGross: subtotal,
      note: remitter.sellerCollects
        ? 'Seller remits sales tax to authorities.'
        : 'Platform collects sales tax (MPF); seller still tracks income/nexus.',
    },
    platform: {
      remitsSalesTax: remitter.platformCollects,
      taxHeldForRemittance: remitter.platformCollects ? taxTotal : 0,
      note: remitter.reason,
    },
  };

  return {
    ok: true,
    tenantId: input.tenantId || null,
    currency,
    provider: 'tax-vato',
    disclaimer:
      'Tax Vato operational estimates. Sources: Tax Foundation (US), CRA (Canada), SAT/PwC summaries (Mexico). Confirm with a tax professional before filing. Local US ZIP-level rates may differ from avg-local estimates.',
    shipTo: { country, region, county: county || null, city: shipTo.city || null, postalCode: shipTo.postalCode || null },
    remitter,
    parties,
    subtotal,
    taxableSubtotal,
    exemptSubtotal,
    taxTotal,
    total,
    combinedRate: taxableSubtotal > 0 ? taxTotal / taxableSubtotal : 0,
    jurisdictions: Object.values(byJurisdiction),
    lines: lineResults,
    meta: {
      quotedAt: new Date().toISOString(),
      version: '1.2.0',
      rateTableAsOf: '2026-01-01',
      sources: ['tax_foundation_us_2026', 'cra_gst_hst_rates', 'mx_iva_pwc'],
    },
  };
}

function buildRateComponents({
  country,
  region,
  county,
  productCategory,
  isDigital,
  estimateLocal = true,
  mxBorder = false,
}) {
  const components = [];

  if (country === 'US') {
    const resolved = resolveUsRates(region, { county, estimateLocal });
    const st = resolved.state;
    if (st && st.rate > 0) {
      components.push({
        code: `US-${region}`,
        name: st.name,
        type: 'state',
        rate: st.rate,
        sourceId: st.sourceId || 'tax_foundation_us_2026',
      });
    }
    if (resolved.local && resolved.local.rate > 0) {
      components.push({
        code: resolved.mode === 'state_plus_sample_local' ? localKey('US', region, county) : `US-${region}-AVG-LOCAL`,
        name: resolved.local.name,
        type: 'local',
        rate: resolved.local.rate,
        estimated: !!resolved.local.estimated,
        sourceId: 'tax_foundation_us_2026',
      });
    }
    return components;
  }

  if (country === 'CA') {
    const prov = CA_PROVINCE_TAX[region] || CA_PROVINCE_TAX.ON;
    if (prov.hst > 0) {
      components.push({
        code: `CA-${region}-HST`,
        name: `${prov.name} HST`,
        type: 'hst',
        rate: prov.hst,
        sourceId: prov.sourceId || 'cra_gst_hst_rates',
      });
    } else {
      if (prov.gst > 0) {
        components.push({
          code: 'CA-GST',
          name: 'Canada GST',
          type: 'federal',
          rate: prov.gst,
          sourceId: 'cra_gst_hst_rates',
        });
      }
      if (prov.pst > 0) {
        components.push({
          code: `CA-${region}-PST`,
          name: `${prov.name} ${prov.system === 'GST+QST' ? 'QST' : 'PST'}`,
          type: 'provincial',
          rate: prov.pst,
          sourceId: prov.sourceId || 'cra_gst_hst_rates',
        });
      }
    }
    return components;
  }

  if (country === 'MX') {
    const rate = mxBorder ? MX_IVA.border : MX_IVA.standard;
    components.push({
      code: mxBorder ? 'MX-IVA-BORDER' : 'MX-IVA',
      name: mxBorder ? 'Mexico IVA (border stimulus 8%)' : 'Mexico IVA 16%',
      type: 'vat',
      rate,
      sourceId: mxBorder ? 'mx_border_stimulus' : 'mx_iva_pwc',
      note: mxBorder ? MX_IVA.borderNote : undefined,
    });
    return components;
  }

  const vat = VAT_GST_COUNTRIES[country];
  if (vat && vat.rate > 0) {
    components.push({
      code: `${country}-VAT`,
      name: `${vat.name} ${vat.system}`,
      type: String(vat.system || 'vat').toLowerCase(),
      rate: vat.rate,
      sourceId: vat.sourceId || null,
    });
  }

  return components;
}

/** Convenience: simple cart subtotal + ship-to address → tax total */
export function quoteSimple({
  subtotal,
  country = 'US',
  region,
  county,
  productCategory = 'physical_goods',
  marketplaceFacilitator = true,
  sellerNexusRegions = [],
  sellerHomeRegion,
}) {
  return quoteTax({
    shipTo: { country, region, county },
    lines: [{ amount: subtotal, quantity: 1, productCategory }],
    platform: { marketplaceFacilitator },
    seller: { nexusRegions: sellerNexusRegions, homeRegion: sellerHomeRegion },
  });
}
