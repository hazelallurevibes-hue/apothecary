import { quoteTax, evaluateNexus } from '../src/index.js';

const physical = quoteTax({
  tenantId: 'hazelallure',
  shipTo: { country: 'US', region: 'NM', county: 'Santa Fe', postalCode: '87501' },
  lines: [
    { amount: 48, quantity: 1, productCategory: 'herbal_supplement' },
    { amount: 8, quantity: 1, productCategory: 'shipping' },
  ],
  seller: { id: 'v1', homeRegion: 'NM', nexusRegions: ['NM'] },
  platform: { marketplaceFacilitator: true },
});

const course = quoteTax({
  tenantId: 'hazelallure',
  shipTo: { country: 'DE' },
  lines: [{ amount: 99, productCategory: 'course_enrollment' }],
  platform: { marketplaceFacilitator: true },
});

const ca = quoteTax({
  tenantId: 'hazelallure',
  shipTo: { country: 'CA', region: 'ON' },
  lines: [{ amount: 50, productCategory: 'physical_goods' }],
});

console.log('--- US-NM physical (MPF) ---');
console.log(JSON.stringify({
  taxTotal: physical.taxTotal,
  total: physical.total,
  remitter: physical.remitter.remitter,
  jurisdictions: physical.jurisdictions,
}, null, 2));

console.log('\n--- DE digital course ---');
console.log(JSON.stringify({
  taxTotal: course.taxTotal,
  rate: course.combinedRate,
  remitter: course.remitter.remitter,
}, null, 2));

console.log('\n--- CA-ON ---');
console.log(JSON.stringify({
  taxTotal: ca.taxTotal,
  jurisdictions: ca.jurisdictions,
}, null, 2));

console.log('\n--- Nexus alerts ---');
console.log(evaluateNexus({
  homeRegion: 'NM',
  nexusRegions: ['NM'],
  remoteSales: [
    { region: 'TX', sales: 120000, transactions: 50 },
    { region: 'OR', sales: 5000, transactions: 10 },
  ],
}));
