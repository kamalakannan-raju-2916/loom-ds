#!/usr/bin/env node
// Loom DS — Scaffold a new product repo from templates/product/
//
// Usage:
//   node scripts/new-product.js --slug=writer --product="Zoho Writer" --admin=alice [--out=../loom-ds-writer]
//
// Copies the template to <out>, substitutes __SLUG__, __PRODUCT__, __ADMIN__,
// then runs the resolver to confirm the fresh scaffold validates clean.

'use strict';

const fs   = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const TEMPLATE  = path.join(REPO_ROOT, 'templates', 'product');

function parseArgs(argv) {
  const out = {};
  for (const a of argv.slice(2)) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function copyDir(src, dst, subs) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d, subs);
    } else {
      let content = fs.readFileSync(s, 'utf8');
      for (const [k, v] of Object.entries(subs)) {
        content = content.split(k).join(v);
      }
      fs.writeFileSync(d, content);
    }
  }
}

function main() {
  const args = parseArgs(process.argv);
  const slug    = args.slug;
  const product = args.product;
  const admin   = args.admin || 'TBD';
  const out     = path.resolve(args.out || `../loom-ds-${slug}`);

  if (!slug || !product) {
    console.error('Usage: node scripts/new-product.js --slug=<slug> --product="<Name>" [--admin=<gh-user>] [--out=<path>]');
    process.exit(2);
  }
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
    console.error(`✘ slug "${slug}" must match /^[a-z][a-z0-9-]*$/`);
    process.exit(2);
  }
  if (fs.existsSync(out)) {
    console.error(`✘ destination already exists: ${out}`);
    process.exit(2);
  }

  console.log(`→ scaffolding ${product} (${slug}) at ${out}`);
  copyDir(TEMPLATE, out, {
    '__SLUG__':    slug,
    '__PRODUCT__': product,
    '__ADMIN__':   admin,
  });
  console.log('✓ files written');

  // Validate the freshly-scaffolded repo with the resolver
  console.log('→ running resolver against scaffold');
  const cli = path.join(REPO_ROOT, 'scripts', 'resolver', 'cli.js');
  const r = spawnSync(process.execPath, [cli, out], { stdio: ['ignore', 'ignore', 'inherit'] });
  if (r.status === 0) {
    console.log('✓ scaffold validates clean');
  } else {
    console.error(`✘ resolver exited ${r.status}`);
    process.exit(r.status || 1);
  }

  console.log(`\nNext:`);
  console.log(`  cd ${out}`);
  console.log(`  git init && git add -A && git commit -m "init: scaffold from loom-ds template"`);
  console.log(`  # then create the repo on GitHub and push`);
}

main();
