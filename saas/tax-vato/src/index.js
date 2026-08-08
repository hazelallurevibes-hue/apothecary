/**
 * Tax Vato (@taxvato/core) — public API
 */
export { quoteTax, quoteSimple } from './engine/quote.js';
export { resolveRemitter, platformFeeTaxHint } from './engine/facilitator.js';
export { evaluateNexus, sellerHasNexusIn, DEFAULT_US_NEXUS } from './engine/nexus.js';
export { US_STATE_SALES_TAX, US_LOCAL_SAMPLES } from './data/us-state-rates.js';
export { VAT_GST_COUNTRIES, CA_PROVINCE_TAX } from './data/vat-countries.js';
export { PRODUCT_CATEGORIES, resolveCategory } from './data/product-categories.js';
export { TaxVatoClient } from './api/client.js';
export { generateApiKey, hashApiKey, isValidKeyFormat } from './api/auth.js';
export { shopifyCartToQuote, applyQuoteToShopifyDraft } from './adapters/shopify.js';
export { wooCartToQuote, quoteToWooTaxLines } from './adapters/woocommerce.js';
export { restCartToQuote, FRAMEWORK_HINTS } from './adapters/rest.js';
export { taxVatoToStripeTaxParams, stripeTaxToTaxVatoQuote } from './adapters/stripe-tax.js';

export { quoteTaxFull, convertMoney } from './engine/quoteEnhanced.js';
export { convertCurrency, listCurrencies, loadFxTable } from './engine/currency.js';
export {
  competitiveTaxBundle,
  filingHintFor,
  digitalServicesHints,
  withholdingHints,
} from './engine/filing.js';
export {
  TAX_VATO_AI_TOOLS,
  toOpenAITools,
  toAnthropicTools,
  executeTaxVatoTool,
} from './ai/tools.js';

export const TAX_VATO_VERSION = '1.1.0';
/** @deprecated use TAX_VATO_VERSION */
export const TAX_SAAS_VERSION = TAX_VATO_VERSION;
export const TENANT_HAZEL = 'hazelallure';
export const PRODUCT_NAME = 'Tax Vato';
