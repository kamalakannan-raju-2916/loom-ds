#!/usr/bin/env node
// Mirror sandbox/components/*.rules.json into docs/data/rules/ AND mirror
// product configs into docs/data/products/ so the GitHub-Pages-served catalogue
// can fetch them without leaving the docs/ root.
//
// Also generates docs/assets/loom-resolver.js from scripts/resolver/index.js
// (browser-friendly IIFE wrap) so both runtimes share the same source of truth.

'use strict';

const fs   = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

// -- 1. Mirror rules ---------------------------------------------------------
const SRC_RULES = path.join(ROOT, 'sandbox', 'components');
const DST_RULES = path.join(ROOT, 'docs', 'data', 'rules');
fs.mkdirSync(DST_RULES, { recursive: true });

const ruleFiles = fs.existsSync(SRC_RULES)
  ? fs.readdirSync(SRC_RULES).filter(f => f.endsWith('.rules.json'))
  : [];

const ruleIndex = [];
for (const file of ruleFiles) {
  const json = JSON.parse(fs.readFileSync(path.join(SRC_RULES, file), 'utf8'));
  fs.copyFileSync(path.join(SRC_RULES, file), path.join(DST_RULES, file));
  ruleIndex.push({ file, component: json.component, description: json.description || '' });
  console.log(`  rules • ${file}`);
}
fs.writeFileSync(path.join(DST_RULES, 'index.json'), JSON.stringify(ruleIndex, null, 2) + '\n');

// -- 2. Mirror components base (token defaults) -----------------------------
const SRC_COMP = path.join(ROOT, 'tokens', 'components');
const DST_COMP = path.join(ROOT, 'docs', 'data', 'components');
fs.mkdirSync(DST_COMP, { recursive: true });
if (fs.existsSync(SRC_COMP)) {
  for (const file of fs.readdirSync(SRC_COMP)) {
    if (!file.endsWith('.json')) continue;
    fs.copyFileSync(path.join(SRC_COMP, file), path.join(DST_COMP, file));
    console.log(`  comp  • ${file}`);
  }
}

// -- 3. Mirror products + their overrides -----------------------------------
const SRC_PRODUCTS = path.join(ROOT, 'tokens', 'products');
const DST_PRODUCTS = path.join(ROOT, 'docs', 'data', 'products');
fs.mkdirSync(DST_PRODUCTS, { recursive: true });

const productIndex = [];
if (fs.existsSync(SRC_PRODUCTS)) {
  for (const slug of fs.readdirSync(SRC_PRODUCTS)) {
    const cfg = path.join(SRC_PRODUCTS, slug, 'config.json');
    if (!fs.existsSync(cfg)) continue;
    const dstDir = path.join(DST_PRODUCTS, slug);
    fs.mkdirSync(dstDir, { recursive: true });
    fs.copyFileSync(cfg, path.join(dstDir, 'config.json'));
    const json = JSON.parse(fs.readFileSync(cfg, 'utf8'));
    productIndex.push({ slug, product: json.product, accent: json.accent });
    console.log(`  prod  • ${slug}/config.json`);
  }
}
fs.writeFileSync(path.join(DST_PRODUCTS, 'index.json'), JSON.stringify(productIndex, null, 2) + '\n');

// -- 3b. Mirror foundation tokens (primitives + semantics) ------------------
const SRC_TOKENS = path.join(ROOT, 'tokens');
const DST_TOKENS = path.join(ROOT, 'docs', 'data', 'tokens');
fs.mkdirSync(DST_TOKENS, { recursive: true });
const tokenSources = [
  ['primitive/colors.json',   'primitive-colors.json'],
  ['semantic/colors.json',    'semantic-colors.json'],
  ['semantic/structure.json', 'semantic-structure.json'],
];
for (const [src, dst] of tokenSources) {
  const srcPath = path.join(SRC_TOKENS, src);
  if (!fs.existsSync(srcPath)) continue;
  fs.copyFileSync(srcPath, path.join(DST_TOKENS, dst));
  console.log(`  token • ${dst}`);
}

// -- 4. Generate browser resolver --------------------------------------------
const SRC_RESOLVER = path.join(ROOT, 'scripts', 'resolver', 'index.js');
const DST_RESOLVER = path.join(ROOT, 'docs', 'assets', 'loom-resolver.js');
let src = fs.readFileSync(SRC_RESOLVER, 'utf8');
src = src.replace(/^'use strict';\s*/m, '');
src = src.replace(/module\.exports\s*=\s*\{[^}]*\};?/, '');
const wrapped =
`// AUTO-GENERATED from scripts/resolver/index.js by scripts/build-sandbox-data.js
// Do not edit by hand. Re-run the build to refresh.

(function () {
  'use strict';
${src.split('\n').map(l => l ? '  ' + l : l).join('\n')}
  window.LoomResolver = { resolve, deepMerge, validateComponent };
})();
`;
fs.writeFileSync(DST_RESOLVER, wrapped);
console.log(`  resolver → docs/assets/loom-resolver.js`);

console.log(`\n✓ rules:${ruleIndex.length}  products:${productIndex.length}`);

