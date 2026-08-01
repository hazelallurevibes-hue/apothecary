/**
 * Marketplace facilitator (MPF) — who remits sales tax to the tax authority.
 *
 * US: In most MPF states, the marketplace (platform) collects and remits sales tax
 * on third-party sales when the platform facilitates payment.
 * Seller still may have income tax / other obligations.
 *
 * EU digital: platform or seller may collect VAT under OSS depending on role.
 */

import { US_STATE_SALES_TAX } from '../data/us-state-rates.js';

/**
 * @param {object} opts
 * @param {string} opts.country
 * @param {string} [opts.region]
 * @param {boolean} [opts.platformIsMarketplace]
 * @param {boolean} [opts.sellerCollectsIndependently]
 * @param {'physical_goods'|'digital_goods'|'course_enrollment'|'session_booking'|'shipping'|'platform_subscription'} [opts.productCategory]
 */
export function resolveRemitter(opts = {}) {
  const country = String(opts.country || 'US').toUpperCase();
  const region = String(opts.region || '').toUpperCase();
  const platformIsMarketplace = opts.platformIsMarketplace !== false;
  const sellerIndependent = !!opts.sellerCollectsIndependently;

  if (sellerIndependent) {
    return {
      remitter: 'seller',
      reason: 'Seller configured to collect independently (not MPF).',
      platformCollects: false,
      sellerCollects: true,
    };
  }

  if (country === 'US' && platformIsMarketplace) {
    const st = US_STATE_SALES_TAX[region];
    if (st && st.mpf === false) {
      return {
        remitter: st.rate > 0 ? 'seller' : 'none',
        reason: `${region || 'State'} has no marketplace facilitator sales tax (or zero rate).`,
        platformCollects: false,
        sellerCollects: st.rate > 0,
      };
    }
    if (st && st.mpf) {
      return {
        remitter: 'platform',
        reason: `US marketplace facilitator: platform remits in ${region || 'applicable states'}.`,
        platformCollects: true,
        sellerCollects: false,
      };
    }
    // Unknown region — assume platform collects if MPF marketplace
    return {
      remitter: 'platform',
      reason: 'US marketplace default: platform collects as facilitator where required.',
      platformCollects: true,
      sellerCollects: false,
    };
  }

  // EU / UK digital often platform or OSS registration
  if (platformIsMarketplace && ['GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'IE', 'AT', 'BE', 'SE', 'PL'].includes(country)) {
    return {
      remitter: 'platform',
      reason: 'Digital/marketplace VAT often collected by platform under OSS/IOSS or local rules (confirm registration).',
      platformCollects: true,
      sellerCollects: false,
    };
  }

  if (platformIsMarketplace && ['AU', 'NZ', 'SG', 'JP', 'MX', 'AE'].includes(country)) {
    return {
      remitter: 'platform',
      reason: 'Non-resident digital / marketplace GST-VAT: platform often remits when registered.',
      platformCollects: true,
      sellerCollects: false,
    };
  }

  return {
    remitter: 'seller',
    reason: 'Default: seller remits unless marketplace facilitator rules apply.',
    platformCollects: false,
    sellerCollects: true,
  };
}

/**
 * Platform's own tax on SaaS fees (Pro subscriptions) — separate from MPF sales tax on goods.
 * Rough: many US states tax SaaS; EU charges VAT on B2C SaaS.
 */
export function platformFeeTaxHint({ country, region, feeAmount }) {
  const c = String(country || 'US').toUpperCase();
  const amount = Number(feeAmount) || 0;
  if (amount <= 0) return { taxable: false, rate: 0, tax: 0, note: 'No platform fee' };

  if (c === 'US') {
    // Simplified: note that SaaS tax varies; do not auto-charge without provider
    return {
      taxable: true,
      rate: null,
      tax: null,
      note: 'US SaaS tax varies by state (e.g. taxable in NY/TX sometimes). Use Stripe Tax or provider for Pro invoices.',
    };
  }
  return {
    taxable: true,
    rate: null,
    tax: null,
    note: 'Check VAT on platform subscription for buyer location.',
  };
}
