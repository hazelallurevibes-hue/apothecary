/**
 * Tax Vato (@taxvato/core) — public API
 */
export { quoteTax, quoteSimple } from './engine/quote.js';
export { resolveRemitter, platformFeeTaxHint } from './engine/facilitator.js';
export { evaluateNexus, sellerHasNexusIn, DEFAULT_US_NEXUS } from './engine/nexus.js';
export { US_STATE_SALES_TAX, US_LOCAL_SAMPLES } from './data/us-state-rates.js';
export { VAT_GST_COUNTRIES, CA_PROVINCE_TAX } from './data/vat-countries.js';
export { PRODUCT_CATEGORIES, resolveCategory } from './data/product-categories.js';

export const TAX_VATO_VERSION = '0.1.0';
/** @deprecated use TAX_VATO_VERSION */
export const TAX_SAAS_VERSION = TAX_VATO_VERSION;
export const TENANT_HAZEL = 'hazelallure';
export const PRODUCT_NAME = 'Tax Vato';
