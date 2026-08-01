/**
 * Edge-portable tax quote (mirrors tax-saas package core).
 * Keep in sync with tax-saas/src/engine/quote.js for major rate changes.
 */

const US_STATE: Record<string, { rate: number; name: string; mpf: boolean }> = {
  AL: { rate: 0.04, name: "Alabama", mpf: true },
  AK: { rate: 0, name: "Alaska", mpf: false },
  AZ: { rate: 0.056, name: "Arizona", mpf: true },
  AR: { rate: 0.065, name: "Arkansas", mpf: true },
  CA: { rate: 0.0725, name: "California", mpf: true },
  CO: { rate: 0.029, name: "Colorado", mpf: true },
  CT: { rate: 0.0635, name: "Connecticut", mpf: true },
  DE: { rate: 0, name: "Delaware", mpf: false },
  FL: { rate: 0.06, name: "Florida", mpf: true },
  GA: { rate: 0.04, name: "Georgia", mpf: true },
  HI: { rate: 0.04, name: "Hawaii", mpf: true },
  ID: { rate: 0.06, name: "Idaho", mpf: true },
  IL: { rate: 0.0625, name: "Illinois", mpf: true },
  IN: { rate: 0.07, name: "Indiana", mpf: true },
  IA: { rate: 0.06, name: "Iowa", mpf: true },
  KS: { rate: 0.065, name: "Kansas", mpf: true },
  KY: { rate: 0.06, name: "Kentucky", mpf: true },
  LA: { rate: 0.0445, name: "Louisiana", mpf: true },
  ME: { rate: 0.055, name: "Maine", mpf: true },
  MD: { rate: 0.06, name: "Maryland", mpf: true },
  MA: { rate: 0.0625, name: "Massachusetts", mpf: true },
  MI: { rate: 0.06, name: "Michigan", mpf: true },
  MN: { rate: 0.06875, name: "Minnesota", mpf: true },
  MS: { rate: 0.07, name: "Mississippi", mpf: true },
  MO: { rate: 0.04225, name: "Missouri", mpf: true },
  MT: { rate: 0, name: "Montana", mpf: false },
  NE: { rate: 0.055, name: "Nebraska", mpf: true },
  NV: { rate: 0.0685, name: "Nevada", mpf: true },
  NH: { rate: 0, name: "New Hampshire", mpf: false },
  NJ: { rate: 0.06625, name: "New Jersey", mpf: true },
  NM: { rate: 0.04875, name: "New Mexico", mpf: true },
  NY: { rate: 0.04, name: "New York", mpf: true },
  NC: { rate: 0.0475, name: "North Carolina", mpf: true },
  ND: { rate: 0.05, name: "North Dakota", mpf: true },
  OH: { rate: 0.0575, name: "Ohio", mpf: true },
  OK: { rate: 0.045, name: "Oklahoma", mpf: true },
  OR: { rate: 0, name: "Oregon", mpf: false },
  PA: { rate: 0.06, name: "Pennsylvania", mpf: true },
  RI: { rate: 0.07, name: "Rhode Island", mpf: true },
  SC: { rate: 0.06, name: "South Carolina", mpf: true },
  SD: { rate: 0.045, name: "South Dakota", mpf: true },
  TN: { rate: 0.07, name: "Tennessee", mpf: true },
  TX: { rate: 0.0625, name: "Texas", mpf: true },
  UT: { rate: 0.0485, name: "Utah", mpf: true },
  VT: { rate: 0.06, name: "Vermont", mpf: true },
  VA: { rate: 0.053, name: "Virginia", mpf: true },
  WA: { rate: 0.065, name: "Washington", mpf: true },
  WV: { rate: 0.06, name: "West Virginia", mpf: true },
  WI: { rate: 0.05, name: "Wisconsin", mpf: true },
  WY: { rate: 0.04, name: "Wyoming", mpf: true },
  DC: { rate: 0.06, name: "District of Columbia", mpf: true },
};

const US_LOCAL: Record<string, { rate: number; name: string }> = {
  "US-NM-SANTA_FE": { rate: 0.03375, name: "Santa Fe local (sample)" },
  "US-NM-BERNALILLO": { rate: 0.026875, name: "Bernalillo local (sample)" },
  "US-TX-TRAVIS": { rate: 0.02, name: "Travis local (sample)" },
  "US-CA-LOS_ANGELES": { rate: 0.0225, name: "LA local (sample)" },
  "US-NY-NEW_YORK": { rate: 0.04875, name: "NYC local (sample)" },
  "US-CO-DENVER": { rate: 0.0421, name: "Denver local (sample)" },
  "US-WA-KING": { rate: 0.035, name: "King County local (sample)" },
  "US-IL-COOK": { rate: 0.0275, name: "Cook local (sample)" },
};

const VAT: Record<string, { rate: number; name: string }> = {
  DE: { rate: 0.19, name: "Germany VAT" },
  FR: { rate: 0.2, name: "France VAT" },
  GB: { rate: 0.2, name: "UK VAT" },
  IE: { rate: 0.23, name: "Ireland VAT" },
  IT: { rate: 0.22, name: "Italy VAT" },
  ES: { rate: 0.21, name: "Spain VAT" },
  NL: { rate: 0.21, name: "Netherlands VAT" },
  AT: { rate: 0.2, name: "Austria VAT" },
  BE: { rate: 0.21, name: "Belgium VAT" },
  SE: { rate: 0.25, name: "Sweden VAT" },
  PL: { rate: 0.23, name: "Poland VAT" },
  AU: { rate: 0.1, name: "Australia GST" },
  NZ: { rate: 0.15, name: "New Zealand GST" },
  SG: { rate: 0.09, name: "Singapore GST" },
  JP: { rate: 0.1, name: "Japan CT" },
  MX: { rate: 0.16, name: "Mexico IVA" },
  AE: { rate: 0.05, name: "UAE VAT" },
  ZA: { rate: 0.15, name: "South Africa VAT" },
  IN: { rate: 0.18, name: "India GST" },
};

const CA_PROV: Record<string, { gst: number; pst: number; hst: number; name: string }> = {
  AB: { gst: 0.05, pst: 0, hst: 0, name: "Alberta" },
  BC: { gst: 0.05, pst: 0.07, hst: 0, name: "BC" },
  MB: { gst: 0.05, pst: 0.07, hst: 0, name: "Manitoba" },
  NB: { gst: 0, pst: 0, hst: 0.15, name: "NB" },
  NL: { gst: 0, pst: 0, hst: 0.15, name: "NL" },
  NS: { gst: 0, pst: 0, hst: 0.15, name: "NS" },
  ON: { gst: 0, pst: 0, hst: 0.13, name: "Ontario" },
  PE: { gst: 0, pst: 0, hst: 0.15, name: "PEI" },
  QC: { gst: 0.05, pst: 0.09975, hst: 0, name: "Quebec" },
  SK: { gst: 0.05, pst: 0.06, hst: 0, name: "Saskatchewan" },
};

function money(n: number) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function digitalCat(c: string) {
  return ["digital_goods", "course_enrollment", "session_booking", "platform_subscription"].includes(c);
}

export function quoteTax(input: Record<string, unknown> = {}) {
  const shipTo = (input.shipTo || {}) as Record<string, string>;
  const country = String(shipTo.country || "US").toUpperCase();
  const region = String(shipTo.region || shipTo.state || "").toUpperCase();
  const county = String(shipTo.county || "");
  const currency = String(input.currency || "USD").toUpperCase();
  const linesIn = Array.isArray(input.lines) ? input.lines as Array<Record<string, unknown>> : [];
  const platform = (input.platform || { marketplaceFacilitator: true }) as Record<string, unknown>;
  const seller = (input.seller || {}) as Record<string, unknown>;

  let remitter = "platform";
  let platformCollects = true;
  let sellerCollects = false;
  let reason = "Marketplace facilitator default";

  if (seller.collectIndependently) {
    remitter = "seller";
    platformCollects = false;
    sellerCollects = true;
    reason = "Seller collects independently";
  } else if (country === "US") {
    const st = US_STATE[region];
    if (st && !st.mpf) {
      remitter = st.rate > 0 ? "seller" : "none";
      platformCollects = false;
      sellerCollects = st.rate > 0;
      reason = `${region} non-MPF / zero`;
    } else {
      reason = `US MPF platform remits in ${region || "state"}`;
    }
  }

  let taxableSubtotal = 0;
  let exemptSubtotal = 0;
  let taxTotal = 0;
  const lineResults: Array<Record<string, unknown>> = [];
  const byJ: Record<string, { code: string; name: string; type: string; rate: number; tax: number }> = {};

  for (let i = 0; i < linesIn.length; i++) {
    const line = linesIn[i];
    const qty = Math.max(1, Number(line.quantity) || 1);
    const amount = money((Number(line.amount) || 0) * qty);
    const cat = String(line.productCategory || "physical_goods");
    if (line.taxExempt || cat === "food_exempt") {
      exemptSubtotal = money(exemptSubtotal + amount);
      lineResults.push({ index: i, amount, taxable: false, tax: 0, rate: 0, components: [] });
      continue;
    }
    if (cat === "session_booking" && country === "US" && !line.forceTaxable) {
      exemptSubtotal = money(exemptSubtotal + amount);
      lineResults.push({
        index: i,
        amount,
        taxable: false,
        tax: 0,
        rate: 0,
        components: [],
        note: "US service default non-taxable",
      });
      continue;
    }

    const components: Array<{ code: string; name: string; type: string; rate: number }> = [];
    if (country === "US") {
      const st = US_STATE[region];
      if (st?.rate) components.push({ code: `US-${region}`, name: st.name, type: "state", rate: st.rate });
      const lk = county
        ? `US-${region}-${county.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`
        : "";
      if (lk && US_LOCAL[lk]) {
        components.push({ code: lk, name: US_LOCAL[lk].name, type: "local", rate: US_LOCAL[lk].rate });
      }
    } else if (country === "CA") {
      const p = CA_PROV[region] || CA_PROV.ON;
      if (p.hst > 0) components.push({ code: `CA-${region}-HST`, name: `${p.name} HST`, type: "hst", rate: p.hst });
      else {
        if (p.gst) components.push({ code: "CA-GST", name: "Canada GST", type: "federal", rate: p.gst });
        if (p.pst) components.push({ code: `CA-${region}-PST`, name: `${p.name} PST`, type: "provincial", rate: p.pst });
      }
    } else if (VAT[country]) {
      components.push({
        code: `${country}-VAT`,
        name: VAT[country].name,
        type: "vat",
        rate: VAT[country].rate,
      });
      void digitalCat;
    }

    const rate = components.reduce((s, c) => s + c.rate, 0);
    const tax = money(amount * rate);
    taxableSubtotal = money(taxableSubtotal + amount);
    taxTotal = money(taxTotal + tax);
    for (const c of components) {
      if (!byJ[c.code]) byJ[c.code] = { ...c, tax: 0 };
      byJ[c.code].tax = money(byJ[c.code].tax + money(amount * c.rate));
    }
    lineResults.push({ index: i, amount, productCategory: cat, taxable: true, tax, rate, components });
  }

  const subtotal = money(taxableSubtotal + exemptSubtotal);
  return {
    ok: true,
    tenantId: input.tenantId || null,
    currency,
    provider: "tax-saas-edge",
    disclaimer: "Estimates only — confirm filings with a tax professional.",
    shipTo: { country, region, county: county || null, postalCode: shipTo.postalCode || null },
    remitter: { remitter, platformCollects, sellerCollects, reason },
    parties: {
      buyer: { paysTaxOnInvoice: taxTotal > 0, taxAmount: taxTotal },
      seller: { remitsSalesTax: sellerCollects },
      platform: { remitsSalesTax: platformCollects, taxHeldForRemittance: platformCollects ? taxTotal : 0 },
    },
    subtotal,
    taxableSubtotal,
    exemptSubtotal,
    taxTotal,
    total: money(subtotal + taxTotal),
    combinedRate: taxableSubtotal > 0 ? taxTotal / taxableSubtotal : 0,
    jurisdictions: Object.values(byJ),
    lines: lineResults,
    meta: { quotedAt: new Date().toISOString(), version: "0.1.0" },
  };
}
