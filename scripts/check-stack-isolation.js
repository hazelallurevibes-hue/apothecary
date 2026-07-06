#!/usr/bin/env node
/**
 * Fails if Bpicius Supabase ref appears in committed Hazel config.
 * Run: node scripts/check-stack-isolation.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BPICIUS_REF = 'emzpkxvxuwhfsknccoad';
const HAZEL_REF = 'jihinbkeqlkgywfsxizj';
const FILES = [
  'supabase/config.toml',
  'frontend/.env.example',
  'backend/.env.example',
  'HAZELALLURE_ISOLATED_SETUP.md',
];

const HAZEL_ONLY_PATHS = [
  'frontend/src/lib/verticals/hazelallure.js',
  'frontend/.env.example',
];

const BPICIUS_ONLY_PATHS = [
  'frontend/src/lib/verticals/bpicius.js',
  'frontend/.env.bpicius.example',
  'scripts/bpicius-fix-platform-emails.sql',
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

// Hazel default build must not point at Bpicius Supabase
const hazelVerticalFile = path.join(ROOT, 'frontend/src/lib/vertical.js');
if (fs.existsSync(hazelVerticalFile)) {
  const vText = fs.readFileSync(hazelVerticalFile, 'utf8');
  if (vText.includes("default: 'hazelallure'") === false && !vText.includes("|| 'hazelallure'")) {
    console.warn('WARN: vertical.js default may not be hazelallure');
  }
}

// Cross-brand email leaks in committed Hazel templates
for (const rel of ['frontend/.env.example']) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('MKJR21@bpicius.com') || text.includes('bpicius.com')) {
    console.error(`FAIL: ${rel} contains Bpicius branding — use frontend/.env.bpicius.example`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('OK: stack isolation check passed');