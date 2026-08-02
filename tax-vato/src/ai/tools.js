/**
 * AI / LLM tool definitions for Tax Vato.
 * Compatible with OpenAI function-calling, Anthropic tools, and generic agents.
 */

export const TAX_VATO_AI_TOOLS = [
  {
    name: 'taxvato_quote',
    description:
      'Estimate sales tax / VAT / GST for a cart. Returns taxTotal, jurisdictions, marketplace facilitator remitter (buyer/seller/platform), and optional multi-currency totals. Not tax advice.',
    parameters: {
      type: 'object',
      properties: {
        currency: { type: 'string', description: 'ISO currency for the quote, e.g. USD, EUR' },
        lineCurrency: { type: 'string', description: 'If line amounts are in a different currency' },
        convertResultTo: { type: 'string', description: 'Also convert tax/total into this currency' },
        shipTo: {
          type: 'object',
          properties: {
            country: { type: 'string' },
            region: { type: 'string', description: 'State/province code' },
            postalCode: { type: 'string' },
            city: { type: 'string' },
            county: { type: 'string' },
          },
          required: ['country'],
        },
        lines: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              amount: { type: 'number' },
              quantity: { type: 'number' },
              productCategory: {
                type: 'string',
                description: 'physical_goods | digital_goods | course_enrollment | session_booking | shipping | platform_subscription',
              },
              taxExempt: { type: 'boolean' },
            },
            required: ['amount'],
          },
        },
        marketplaceFacilitator: { type: 'boolean', default: true },
        seller: {
          type: 'object',
          properties: {
            country: { type: 'string' },
            homeRegion: { type: 'string' },
            nexusRegions: { type: 'array', items: { type: 'string' } },
            collectIndependently: { type: 'boolean' },
          },
        },
      },
      required: ['shipTo', 'lines'],
    },
  },
  {
    name: 'taxvato_convert_currency',
    description: 'Convert an amount between currencies using Tax Vato FX table (ECB/Frankfurter-updatable).',
    parameters: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
        from: { type: 'string' },
        to: { type: 'string' },
      },
      required: ['amount', 'from', 'to'],
    },
  },
  {
    name: 'taxvato_nexus_evaluate',
    description: 'Heuristic economic nexus alerts for a seller given remote sales by region (US Wayfair-style thresholds).',
    parameters: {
      type: 'object',
      properties: {
        homeRegion: { type: 'string' },
        nexusRegions: { type: 'array', items: { type: 'string' } },
        remoteSales: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              region: { type: 'string' },
              sales: { type: 'number' },
              transactions: { type: 'number' },
            },
          },
        },
      },
    },
  },
  {
    name: 'taxvato_filing_hints',
    description: 'Get filing cadence and digital-services / withholding hints for a country/region after a quote or standalone.',
    parameters: {
      type: 'object',
      properties: {
        country: { type: 'string' },
        region: { type: 'string' },
        isDigital: { type: 'boolean' },
        sellerCountry: { type: 'string' },
        amount: { type: 'number' },
      },
      required: ['country'],
    },
  },
  {
    name: 'taxvato_list_currencies',
    description: 'List ISO currencies available in the current FX table and rates as-of date.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'taxvato_health',
    description: 'Health check: product version, rates version, FX as-of.',
    parameters: { type: 'object', properties: {} },
  },
];

/** OpenAI Chat Completions tools format */
export function toOpenAITools() {
  return TAX_VATO_AI_TOOLS.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

/** Anthropic tools format */
export function toAnthropicTools() {
  return TAX_VATO_AI_TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));
}

/**
 * Execute a tool call by name (server-side).
 */
export async function executeTaxVatoTool(name, args = {}) {
  const { quoteTaxFull, convertMoney } = await import('../engine/quoteEnhanced.js');
  const { evaluateNexus, PRODUCT_NAME, TAX_VATO_VERSION } = await import('../index.js');
  const { listCurrencies, loadFxTable } = await import('../engine/currency.js');
  const { competitiveTaxBundle, filingHintFor, digitalServicesHints, withholdingHints } = await import(
    '../engine/filing.js'
  );

  switch (name) {
    case 'taxvato_quote': {
      const quote = quoteTaxFull({
        currency: args.currency || 'USD',
        lineCurrency: args.lineCurrency,
        convertResultTo: args.convertResultTo,
        shipTo: args.shipTo || {},
        lines: args.lines || [],
        seller: args.seller || {},
        platform: { marketplaceFacilitator: args.marketplaceFacilitator !== false },
        includeCompetitive: true,
      });
      return { ok: true, quote };
    }
    case 'taxvato_convert_currency':
      return { ok: true, ...convertMoney(args.amount, args.from, args.to) };
    case 'taxvato_nexus_evaluate':
      return { ok: true, nexus: evaluateNexus(args) };
    case 'taxvato_filing_hints':
      return {
        ok: true,
        filing: filingHintFor({ country: args.country, region: args.region }),
        digitalServices: digitalServicesHints({
          country: args.country,
          isDigital: !!args.isDigital,
          sellerCountry: args.sellerCountry,
        }),
        withholding: withholdingHints({ country: args.country, amount: args.amount }),
      };
    case 'taxvato_list_currencies': {
      const fx = loadFxTable();
      return { ok: true, currencies: listCurrencies(), asOf: fx.asOf, base: fx.base, source: fx.source };
    }
    case 'taxvato_health': {
      const fx = loadFxTable();
      return {
        ok: true,
        product: PRODUCT_NAME,
        version: TAX_VATO_VERSION,
        fxAsOf: fx.asOf,
        fxSource: fx.source,
        currencies: listCurrencies().length,
      };
    }
    default:
      return { ok: false, error: `Unknown tool: ${name}` };
  }
}
