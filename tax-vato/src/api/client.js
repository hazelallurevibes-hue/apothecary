/**
 * Tax Vato JavaScript client — works in browser and Node.
 *
 * @example
 * import { TaxVatoClient } from '@taxvato/core/client';
 * const tv = new TaxVatoClient({ apiKey: 'tv_live_…', baseUrl: 'https://api.example.com' });
 * const quote = await tv.quote({ shipTo: { country: 'US', region: 'NM' }, lines: [{ amount: 40 }] });
 */

export class TaxVatoClient {
  constructor({ apiKey, baseUrl = '', tenantId = 'default', fetchImpl } = {}) {
    this.apiKey = apiKey;
    this.baseUrl = String(baseUrl || '').replace(/\/$/, '');
    this.tenantId = tenantId;
    this.fetch = fetchImpl || globalThis.fetch;
    if (!this.fetch) throw new Error('fetch is required (Node 18+ or polyfill)');
  }

  async _request(path, { method = 'GET', body } = {}) {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;
    if (this.tenantId) headers['X-Tax-Vato-Tenant'] = this.tenantId;

    const res = await this.fetch(url, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(json.error || json.message || `Tax Vato HTTP ${res.status}`);
      err.status = res.status;
      err.body = json;
      throw err;
    }
    return json;
  }

  /** Local engine when no baseUrl (offline / embedded) */
  async quoteLocal(input) {
    const { quoteTax } = await import('../index.js');
    return { ok: true, quote: quoteTax({ ...input, tenantId: input.tenantId || this.tenantId }) };
  }

  async quote(input) {
    if (!this.baseUrl) return this.quoteLocal(input);
    return this._request('/v1/quote', {
      method: 'POST',
      body: { ...input, tenantId: input.tenantId || this.tenantId },
    });
  }

  async commit(input) {
    if (!this.baseUrl) {
      const q = await this.quoteLocal(input);
      return {
        ok: true,
        transaction: {
          id: `local_${Date.now()}`,
          status: 'committed',
          quote: q.quote,
        },
      };
    }
    return this._request('/v1/transactions', {
      method: 'POST',
      body: { ...input, tenantId: input.tenantId || this.tenantId },
    });
  }

  async refund(transactionId, { amount, reason } = {}) {
    if (!this.baseUrl) return { ok: true, status: 'refunded', id: transactionId };
    return this._request(`/v1/transactions/${transactionId}/refund`, {
      method: 'POST',
      body: { amount, reason },
    });
  }

  async nexusEvaluate(seller) {
    if (!this.baseUrl) {
      const { evaluateNexus } = await import('../index.js');
      return { ok: true, nexus: evaluateNexus(seller) };
    }
    return this._request('/v1/nexus/evaluate', { method: 'POST', body: { seller } });
  }

  async health() {
    if (!this.baseUrl) return { ok: true, mode: 'local', product: 'Tax Vato' };
    return this._request('/v1/health');
  }

  async convertCurrency({ amount, from, to }) {
    if (!this.baseUrl) {
      const { convertCurrency } = await import('../engine/currency.js');
      return { ok: true, ...convertCurrency(amount, from, to) };
    }
    return this._request('/v1/fx/convert', {
      method: 'POST',
      body: { amount, from, to },
    });
  }

  async listCurrencies() {
    if (!this.baseUrl) {
      const { listCurrencies, loadFxTable } = await import('../engine/currency.js');
      const fx = loadFxTable();
      return { ok: true, currencies: listCurrencies(), asOf: fx.asOf, source: fx.source };
    }
    return this._request('/v1/fx/currencies');
  }

  /** Discover tools for LLM agents */
  async aiTools() {
    if (!this.baseUrl) {
      const { TAX_VATO_AI_TOOLS, toOpenAITools, toAnthropicTools } = await import('../ai/tools.js');
      return { ok: true, tools: TAX_VATO_AI_TOOLS, openai: toOpenAITools(), anthropic: toAnthropicTools() };
    }
    return this._request('/v1/ai/tools');
  }

  /** Run a named AI tool */
  async aiExecute(name, args = {}) {
    if (!this.baseUrl) {
      const { executeTaxVatoTool } = await import('../ai/tools.js');
      return executeTaxVatoTool(name, args);
    }
    return this._request('/v1/ai/execute', {
      method: 'POST',
      body: { name, arguments: args },
    });
  }
}

export default TaxVatoClient;
