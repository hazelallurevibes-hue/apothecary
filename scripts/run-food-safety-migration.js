const fs = require('fs');
const path = require('path');
const { Client } = require('../backend/node_modules/pg');

const envPath = path.join(__dirname, '../frontend/.env.migrate');
const sqlPath = path.join(__dirname, '../VENDOR_FOOD_SAFETY_SETUP.sql');

const envText = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) {
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[m[1]] = val;
  }
}

const url = env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL;
if (!url) {
  console.error('No POSTGRES_URL in .env.migrate — run: vercel env pull .env.migrate --environment production');
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');
const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

client
  .connect()
  .then(() => client.query(sql))
  .then(() => {
    console.log('VENDOR_FOOD_SAFETY_SETUP.sql applied successfully.');
    return client.end();
  })
  .catch((e) => {
    console.error('Migration failed:', e.message);
    process.exit(1);
  });