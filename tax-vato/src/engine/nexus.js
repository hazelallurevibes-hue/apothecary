/**
 * Economic nexus heuristics for sellers (not a filing system).
 * US Wayfair-era: typically $100k sales OR 200 transactions in a state (varies).
 */

export const DEFAULT_US_NEXUS = {
  salesThreshold: 100000,
  transactionThreshold: 200,
};

/**
 * @param {object} seller
 * @param {string[]} seller.nexusRegions - states/provinces where already registered
 * @param {string} seller.homeRegion - physical location
 * @param {Array<{region:string,sales:number,transactions:number}>} [seller.remoteSales]
 */
export function evaluateNexus(seller = {}, thresholds = DEFAULT_US_NEXUS) {
  const home = String(seller.homeRegion || seller.region || '').toUpperCase();
  const registered = new Set(
    (seller.nexusRegions || []).map((r) => String(r).toUpperCase()).filter(Boolean),
  );
  if (home) registered.add(home);

  const alerts = [];
  for (const row of seller.remoteSales || []) {
    const region = String(row.region || '').toUpperCase();
    if (!region || registered.has(region)) continue;
    const sales = Number(row.sales) || 0;
    const tx = Number(row.transactions) || 0;
    if (sales >= thresholds.salesThreshold || tx >= thresholds.transactionThreshold) {
      alerts.push({
        region,
        sales,
        transactions: tx,
        message: `Possible economic nexus in ${region}: $${sales.toFixed(0)} / ${tx} orders. Confirm registration.`,
      });
    }
  }

  return {
    registeredRegions: [...registered],
    alerts,
    thresholds,
  };
}

export function sellerHasNexusIn(seller, region) {
  const r = String(region || '').toUpperCase();
  if (!r) return false;
  const home = String(seller?.homeRegion || seller?.region || '').toUpperCase();
  if (home && home === r) return true;
  return (seller?.nexusRegions || []).map((x) => String(x).toUpperCase()).includes(r);
}
