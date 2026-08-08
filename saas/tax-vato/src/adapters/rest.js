/**
 * Generic REST / headless cart mapper
 */
export function restCartToQuote(body) {
  return {
    tenantId: body.tenantId || body.tenant_id || 'default',
    currency: body.currency || 'USD',
    shipTo: body.shipTo || body.ship_to || body.destination || {},
    shipFrom: body.shipFrom || body.ship_from || body.origin,
    lines: body.lines || body.items || [],
    seller: body.seller || {},
    platform: body.platform || { marketplaceFacilitator: body.marketplace_facilitator !== false },
  };
}

export const FRAMEWORK_HINTS = {
  nextjs: 'Use TaxVatoClient in Route Handlers / Server Actions; never expose secret keys to the browser.',
  remix: 'Call quote from loader/action; pass taxTotal to the UI.',
  express: 'Mount tax-vato server or proxy /v1/* to Tax Vato.',
  laravel: 'HTTP client to /v1/quote with Bearer API key in config/services.php.',
  django: 'requests.post to Tax Vato; cache nexus profiles per seller.',
  shopify: 'Use adapters/shopify on cart update webhook or checkout UI extension.',
  woocommerce: 'PHP plugin or Node middleware with adapters/woocommerce.',
  squarespace: 'Embed public/embed.js with data-taxvato-key (test) for simple quote display.',
  webflow: 'Custom code embed widget + form ship-to fields.',
  static: 'Load embed.js; quote client-side with public test key only.',
};
