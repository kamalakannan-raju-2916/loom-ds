#!/usr/bin/env node
// Loom DS — Resolver CLI
//
// Usage:
//   node scripts/resolver/cli.js <productDir>
//
//   <productDir> must contain an `overrides/` folder.
//   Sandbox is read from this repo's root (tokens/, sandbox/components/).
//
// Output: prints resolved config to stdout, errors to stderr.
// Exit code: 0 if errors=[], 1 otherwise.

'use strict';

const fs   = require('node:fs');
const path = require('node:path');
const { resolve } = require('./index.js');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function readJsonIfExists(p) {
  return fs.existsSync(p) ? readJson(p) : undefined;
}

function readDirJson(dir) {
  if (!fs.existsSync(dir)) return {};
  const out = {};
  for (const file of fs.readdirSync(dir)) {
    if (file.startsWith('.')) continue;          // skip .keep, .DS_Store, etc.
    if (!file.endsWith('.json')) continue;
    const name = path.basename(file, '.json').replace(/\.rules$/, '');
    out[name] = readJson(path.join(dir, file));
  }
  return out;
}

function loadSandbox() {
  return {
    tokens: {
      primitive: readJsonIfExists(path.join(REPO_ROOT, 'tokens/primitive/colors.json')),
      semantic:  readJsonIfExists(path.join(REPO_ROOT, 'tokens/semantic/colors.json')),
    },
    components: readDirJson(path.join(REPO_ROOT, 'tokens/components')),
    rules:      readDirJson(path.join(REPO_ROOT, 'sandbox/components')),
  };
}

function loadOverrides(productDir) {
  const root = path.resolve(productDir);
  const oroot = path.join(root, 'overrides');
  if (!fs.existsSync(oroot)) {
    throw new Error(`overrides/ not found in ${root}`);
  }
  return {
    tokens: {
      primitive: readJsonIfExists(path.join(oroot, 'tokens/primitives.json')),
      semantic:  readJsonIfExists(path.join(oroot, 'tokens/semantics.json')),
    },
    components: readDirJson(path.join(oroot, 'components')),
  };
}

function main() {
  const productDir = process.argv[2];
  if (!productDir) {
    console.error('Usage: node scripts/resolver/cli.js <productDir>');
    process.exit(2);
  }
  const sandbox   = loadSandbox();
  const overrides = loadOverrides(productDir);
  const { config, errors } = resolve({ sandbox, overrides });

  if (errors.length) {
    console.error(`✘ ${errors.length} validation error(s):`);
    for (const e of errors) console.error(`  [${e.code}] ${e.path}: ${e.message}`);
  } else {
    console.error('✓ overrides valid');
  }
  process.stdout.write(JSON.stringify(config, null, 2) + '\n');
  process.exit(errors.length ? 1 : 0);
}

if (require.main === module) main();
