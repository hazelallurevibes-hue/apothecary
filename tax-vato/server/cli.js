#!/usr/bin/env node
import { generateApiKey } from '../src/api/auth.js';
import { quoteTax, PRODUCT_NAME, TAX_VATO_VERSION } from '../src/index.js';

const [,, cmd, ...args] = process.argv;

if (!cmd || cmd === 'help') {
  console.log(`${PRODUCT_NAME} CLI v${TAX_VATO_VERSION}
  taxvato keygen [--test]
  taxvato quote --country US --region NM --amount 100
  taxvato serve
`);
  process.exit(0);
}

if (cmd === 'keygen') {
  const live = !args.includes('--test');
  console.log(JSON.stringify(generateApiKey({ live }), null, 2));
  process.exit(0);
}

if (cmd === 'quote') {
  const get = (f) => {
    const i = args.indexOf(f);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const q = quoteTax({
    shipTo: { country: get('--country') || 'US', region: get('--region') || 'NM' },
    lines: [{ amount: Number(get('--amount') || 100), productCategory: get('--cat') || 'physical_goods' }],
  });
  console.log(JSON.stringify({ taxTotal: q.taxTotal, total: q.total, remitter: q.remitter, jurisdictions: q.jurisdictions }, null, 2));
  process.exit(0);
}

if (cmd === 'serve') {
  await import('./index.js');
} else {
  console.error('Unknown command', cmd);
  process.exit(1);
}
