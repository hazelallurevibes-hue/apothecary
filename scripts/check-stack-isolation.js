#!/usr/bin/env node
/**
 * Fails if Bpicius Supabase ref appears in committed Hazel config.
 * Run: node scripts/check-stack-isolation.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BPICIUS_REF = 'emzpkxvxuwhfsknccoad';
const FILES = [
  'supabase/config.toml',
  'frontend/.env.example',
  'backend/.env.example',
  'HAZELALLURE_ISOLATED_SETUP.md',
];

let failed = false;

for (const rel of FILES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes(BPICIUS_REF) && !text.includes('do not') && !text.includes('Do NOT') && !text.includes('NEVER')) {
    console.error(`FAIL: ${rel} contains Bpicius ref ${BPICIUS_REF}`);
    failed = true;
  }
}

const localFiles = ['frontend/.env.local', 'backend/.env.local'];
for (const rel of localFiles) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  const active = fs.readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n');
  if (active.includes(BPICIUS_REF)) {
    console.error(`FAIL: ${rel} still has Bpicius Supabase URL — use wife's NEW project keys`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('OK: no Bpicius Supabase leak in Hazel stack config');