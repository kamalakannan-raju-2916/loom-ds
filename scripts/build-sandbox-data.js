#!/usr/bin/env node
// Mirror sandbox/components/*.rules.json into docs/data/rules/ so the
// GitHub-Pages-served catalogue can fetch them without leaving the docs/ root.

'use strict';

const fs   = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC  = path.join(ROOT, 'sandbox', 'components');
const DST  = path.join(ROOT, 'docs', 'data', 'rules');

fs.mkdirSync(DST, { recursive: true });

const files = fs.existsSync(SRC)
  ? fs.readdirSync(SRC).filter(f => f.endsWith('.rules.json'))
  : [];

const index = [];
for (const file of files) {
  const src = path.join(SRC, file);
  const dst = path.join(DST, file);
  fs.copyFileSync(src, dst);
  const json = JSON.parse(fs.readFileSync(src, 'utf8'));
  index.push({
    file,
    component: json.component,
    description: json.description || '',
  });
  console.log(`  • ${file}`);
}
fs.writeFileSync(path.join(DST, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log(`✓ wrote ${files.length} rule file(s) + index.json → docs/data/rules/`);
