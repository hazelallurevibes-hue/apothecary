/**
 * US state-level general sales tax defaults (combined state base only).
 * Local (county/city) overlays applied separately when known.
 * Sources: typical published state rates; refresh periodically.
 * NOT legal advice.
 */
export const US_STATE_SALES_TAX = {
  AL: { rate: 0.04, name: 'Alabama', localHint: true, mpf: true },
  AK: { rate: 0, name: 'Alaska', localHint: true, mpf: false },
  AZ: { rate: 0.056, name: 'Arizona', localHint: true, mpf: true },
  AR: { rate: 0.065, name: 'Arkansas', localHint: true, mpf: true },
  CA: { rate: 0.0725, name: 'California', localHint: true, mpf: true },
  CO: { rate: 0.029, name: 'Colorado', localHint: true, mpf: true },
  CT: { rate: 0.0635, name: 'Connecticut', localHint: false, mpf: true },
  DE: { rate: 0, name: 'Delaware', localHint: false, mpf: false },
  FL: { rate: 0.06, name: 'Florida', localHint: true, mpf: true },
  GA: { rate: 0.04, name: 'Georgia', localHint: true, mpf: true },
  HI: { rate: 0.04, name: 'Hawaii GET (approx)', localHint: true, mpf: true },
  ID: { rate: 0.06, name: 'Idaho', localHint: true, mpf: true },
  IL: { rate: 0.0625, name: 'Illinois', localHint: true, mpf: true },
  IN: { rate: 0.07, name: 'Indiana', localHint: false, mpf: true },
  IA: { rate: 0.06, name: 'Iowa', localHint: true, mpf: true },
  KS: { rate: 0.065, name: 'Kansas', localHint: true, mpf: true },
  KY: { rate: 0.06, name: 'Kentucky', localHint: false, mpf: true },
  LA: { rate: 0.0445, name: 'Louisiana', localHint: true, mpf: true },
  ME: { rate: 0.055, name: 'Maine', localHint: false, mpf: true },
  MD: { rate: 0.06, name: 'Maryland', localHint: false, mpf: true },
  MA: { rate: 0.0625, name: 'Massachusetts', localHint: false, mpf: true },
  MI: { rate: 0.06, name: 'Michigan', localHint: false, mpf: true },
  MN: { rate: 0.06875, name: 'Minnesota', localHint: true, mpf: true },
  MS: { rate: 0.07, name: 'Mississippi', localHint: true, mpf: true },
  MO: { rate: 0.04225, name: 'Missouri', localHint: true, mpf: true },
  MT: { rate: 0, name: 'Montana', localHint: false, mpf: false },
  NE: { rate: 0.055, name: 'Nebraska', localHint: true, mpf: true },
  NV: { rate: 0.0685, name: 'Nevada', localHint: true, mpf: true },
  NH: { rate: 0, name: 'New Hampshire', localHint: false, mpf: false },
  NJ: { rate: 0.06625, name: 'New Jersey', localHint: false, mpf: true },
  NM: { rate: 0.04875, name: 'New Mexico GRT (approx base)', localHint: true, mpf: true },
  NY: { rate: 0.04, name: 'New York', localHint: true, mpf: true },
  NC: { rate: 0.0475, name: 'North Carolina', localHint: true, mpf: true },
  ND: { rate: 0.05, name: 'North Dakota', localHint: true, mpf: true },
  OH: { rate: 0.0575, name: 'Ohio', localHint: true, mpf: true },
  OK: { rate: 0.045, name: 'Oklahoma', localHint: true, mpf: true },
  OR: { rate: 0, name: 'Oregon', localHint: false, mpf: false },
  PA: { rate: 0.06, name: 'Pennsylvania', localHint: true, mpf: true },
  RI: { rate: 0.07, name: 'Rhode Island', localHint: false, mpf: true },
  SC: { rate: 0.06, name: 'South Carolina', localHint: true, mpf: true },
  SD: { rate: 0.045, name: 'South Dakota', localHint: true, mpf: true },
  TN: { rate: 0.07, name: 'Tennessee', localHint: true, mpf: true },
  TX: { rate: 0.0625, name: 'Texas', localHint: true, mpf: true },
  UT: { rate: 0.0485, name: 'Utah', localHint: true, mpf: true },
  VT: { rate: 0.06, name: 'Vermont', localHint: true, mpf: true },
  VA: { rate: 0.053, name: 'Virginia', localHint: true, mpf: true },
  WA: { rate: 0.065, name: 'Washington', localHint: true, mpf: true },
  WV: { rate: 0.06, name: 'West Virginia', localHint: true, mpf: true },
  WI: { rate: 0.05, name: 'Wisconsin', localHint: true, mpf: true },
  WY: { rate: 0.04, name: 'Wyoming', localHint: true, mpf: true },
  DC: { rate: 0.06, name: 'District of Columbia', localHint: false, mpf: true },
};

/** Sample county/local overlays (illustrative — expand via provider later). */
export const US_LOCAL_SAMPLES = {
  'US-NM-SANTA_FE': { rate: 0.03375, name: 'Santa Fe County/City overlay (sample)', parent: 'NM' },
  'US-NM-BERNALILLO': { rate: 0.026875, name: 'Bernalillo County overlay (sample)', parent: 'NM' },
  'US-TX-TRAVIS': { rate: 0.02, name: 'Travis County local (sample)', parent: 'TX' },
  'US-CA-LOS_ANGELES': { rate: 0.0225, name: 'LA County district (sample)', parent: 'CA' },
  'US-NY-NEW_YORK': { rate: 0.04875, name: 'NYC local (sample)', parent: 'NY' },
  'US-CO-DENVER': { rate: 0.0421, name: 'Denver local (sample)', parent: 'CO' },
  'US-WA-KING': { rate: 0.035, name: 'King County local (sample)', parent: 'WA' },
  'US-IL-COOK': { rate: 0.0275, name: 'Cook County local (sample)', parent: 'IL' },
};

export function localKey(country, region, county) {
  if (!country || !region || !county) return null;
  const c = String(county).trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  return `${String(country).toUpperCase()}-${String(region).toUpperCase()}-${c}`;
}
