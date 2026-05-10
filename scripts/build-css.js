#!/usr/bin/env node

/**
 * build-css.js - Loom Design System CSS generator
 *
 * Reads token JSON files from tokens/ and generates CSS custom properties.
 *
 * Output files:
 *   css/loom-primitives.css   - All primitive tokens (colors, typography, spacing, radii)
 *   css/loom-semantic.css     - Semantic tokens with Light/Dark via data-theme
 *   css/loom-tokens.css       - Combined (imports both above)
 *
 * Usage:
 *   node scripts/build-css.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOKENS = path.join(ROOT, 'tokens');
const OUT = path.join(ROOT, 'css');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function cssVarName(...parts) {
  return '--loom-' + parts.filter(Boolean).join('-');
}

/** Flatten a nested object into [key-path, leaf-value] pairs. */
function flattenTokens(obj, prefix) {
  const entries = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$') || key === 'meta') continue;
    const nextPrefix = prefix ? `${prefix}-${key}` : key;
    if (val && typeof val === 'object' && !val.$value && !val.Light) {
      entries.push(...flattenTokens(val, nextPrefix));
    } else {
      entries.push([nextPrefix, val]);
    }
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Primitive colors
// ---------------------------------------------------------------------------

function buildPrimitiveColors() {
  const data = readJSON(path.join(TOKENS, 'primitive/colors.json'));
  const lines = [];
  lines.push('  /* Primitive Colors */');

  const colors = data.primitive.color;
  for (const [family, familyVal] of Object.entries(colors)) {
    if (familyVal && typeof familyVal === 'object' && familyVal.$value) {
      // Top-level essential (white, black, half, blue1, etc.)
      lines.push(`  ${cssVarName('color', family)}: ${familyVal.$value};`);
    } else if (familyVal && typeof familyVal === 'object') {
      // Family with variants (cobalt, fern, grey, etc.)
      for (const [variant, variantVal] of Object.entries(familyVal)) {
        if (variant.startsWith('$')) continue;
        if (variantVal && variantVal.$value) {
          lines.push(`  ${cssVarName('color', family, variant)}: ${variantVal.$value};`);
        }
      }
    }
  }

  return lines;
}

// ---------------------------------------------------------------------------
// Primitive typography
// ---------------------------------------------------------------------------

function buildPrimitiveTypography() {
  const data = readJSON(path.join(TOKENS, 'primitive/typography.json'));
  const lines = [];
  lines.push('');
  lines.push('  /* Typography - Families */');

  const font = data.primitive.font;
  for (const [key, val] of Object.entries(font.family)) {
    lines.push(`  ${cssVarName('font', key)}: ${val};`);
  }

  lines.push('');
  lines.push('  /* Typography - Weights */');
  for (const [key, val] of Object.entries(font.weight)) {
    lines.push(`  ${cssVarName('weight', key)}: ${val};`);
  }

  lines.push('');
  lines.push('  /* Typography - Sizes */');
  for (const [key, val] of Object.entries(font.size)) {
    lines.push(`  ${cssVarName('size', key)}: ${val};`);
  }

  lines.push('');
  lines.push('  /* Typography - Line Heights */');
  for (const [key, val] of Object.entries(font.lineHeight)) {
    lines.push(`  ${cssVarName('lh', key)}: ${val};`);
  }

  lines.push('');
  lines.push('  /* Typography - Letter Spacing */');
  for (const [key, val] of Object.entries(font.letterSpacing)) {
    lines.push(`  ${cssVarName('ls', key)}: ${val};`);
  }

  // Type scale composites
  lines.push('');
  lines.push('  /* Typography - Type Scale (composites) */');
  const scale = data.primitive.typeScale;
  for (const [role, def] of Object.entries(scale)) {
    lines.push(`  ${cssVarName('ts', role, 'size')}: var(${cssVarName('size', def.size)});`);
    lines.push(`  ${cssVarName('ts', role, 'weight')}: var(${cssVarName('weight', def.weight)});`);
    lines.push(`  ${cssVarName('ts', role, 'lh')}: var(${cssVarName('lh', def.lineHeight)});`);
    lines.push(`  ${cssVarName('ts', role, 'ls')}: var(${cssVarName('ls', def.letterSpacing)});`);
  }

  return lines;
}

// ---------------------------------------------------------------------------
// Primitive spacing
// ---------------------------------------------------------------------------

function buildPrimitiveSpacing() {
  const data = readJSON(path.join(TOKENS, 'primitive/spacing.json'));
  const lines = [];

  lines.push('');
  lines.push('  /* Spacing */');
  for (const [key, val] of Object.entries(data.primitive.spacing)) {
    lines.push(`  ${cssVarName('space', key)}: ${val};`);
  }

  lines.push('');
  lines.push('  /* Icon Sizes */');
  for (const [key, val] of Object.entries(data.primitive.iconSize)) {
    lines.push(`  ${cssVarName('icon', key)}: ${val};`);
  }

  lines.push('');
  lines.push('  /* Stroke Widths */');
  for (const [key, val] of Object.entries(data.primitive.strokeWidth)) {
    lines.push(`  ${cssVarName('stroke', key)}: ${val};`);
  }

  return lines;
}

// ---------------------------------------------------------------------------
// Primitive radii & shadows
// ---------------------------------------------------------------------------

function buildPrimitiveRadii() {
  const data = readJSON(path.join(TOKENS, 'primitive/radii.json'));
  const lines = [];

  lines.push('');
  lines.push('  /* Border Radius */');
  for (const [key, val] of Object.entries(data.primitive.radius)) {
    lines.push(`  ${cssVarName('radius', key)}: ${val};`);
  }

  lines.push('');
  lines.push('  /* Shadows */');
  for (const [key, val] of Object.entries(data.primitive.shadow)) {
    lines.push(`  ${cssVarName('shadow', key)}: ${val};`);
  }

  return lines;
}

// ---------------------------------------------------------------------------
// Semantic tokens (Light / Dark)
// ---------------------------------------------------------------------------

function resolveReference(ref, primitiveColors) {
  // Resolve {primitive.color.X} or {primitive.color.X.Y} → raw value
  const match = ref.match(/^\{primitive\.color\.(.+)\}$/);
  if (!match) return ref;

  const tokenPath = match[1]; // e.g. "grey.s90" or "white" or "overlay1"
  const parts = tokenPath.split('.');

  let node = primitiveColors;
  for (const p of parts) {
    if (!node || typeof node !== 'object') return ref;
    node = node[p];
  }

  if (node && node.$value) return node.$value;
  return ref;
}

function buildSemanticForMode(semanticData, mode, primitiveColors) {
  const lines = [];
  const sem = semanticData.semantic;

  for (const [category, tokens] of Object.entries(sem)) {
    lines.push(`  /* ${category} */`);
    for (const [name, modeValues] of Object.entries(tokens)) {
      const raw = modeValues[mode];
      if (!raw) continue;
      const resolved = resolveReference(raw, primitiveColors);
      lines.push(`  ${cssVarName(category, name)}: ${resolved};`);
    }
    lines.push('');
  }

  return lines;
}

// ---------------------------------------------------------------------------
// Component tokens
// ---------------------------------------------------------------------------

/** Convert semantic references like {text.primary} or {radius.md} to var(--loom-*). */
function resolveComponentRef(val) {
  if (typeof val !== 'string') return typeof val === 'number' ? `${val}px` : String(val);
  return val.replace(/\{([^}]+)\}/g, (_, ref) => {
    const varName = '--loom-' + ref.replace(/\./g, '-');
    return `var(${varName})`;
  });
}

function buildComponentTokens(componentFile) {
  const data = readJSON(componentFile);
  const comp = data.component; // e.g. "button"
  const lines = [];

  if (data.variants) {
    for (const [variant, props] of Object.entries(data.variants)) {
      for (const [prop, modeVals] of Object.entries(props)) {
        const val = modeVals.Light || modeVals;
        lines.push(`  ${cssVarName(comp, variant, prop)}: ${resolveComponentRef(val)};`);
      }
    }
  }

  if (data.sizes) {
    for (const [size, props] of Object.entries(data.sizes)) {
      for (const [prop, val] of Object.entries(props)) {
        lines.push(`  ${cssVarName(comp, size, prop)}: ${resolveComponentRef(val)};`);
      }
    }
  }

  return lines;
}

// ---------------------------------------------------------------------------
// Main build
// ---------------------------------------------------------------------------

function build() {
  fs.mkdirSync(OUT, { recursive: true });

  const colorsData = readJSON(path.join(TOKENS, 'primitive/colors.json'));
  const primitiveColors = colorsData.primitive.color;
  const semanticData = readJSON(path.join(TOKENS, 'semantic/colors.json'));

  // ---- Primitives CSS ----
  const primLines = [
    '/* Loom Design System - Primitive Tokens */',
    '/* Auto-generated by scripts/build-css.js - do not edit manually */',
    '',
    ':root {'
  ];

  primLines.push(...buildPrimitiveColors());
  primLines.push(...buildPrimitiveTypography());
  primLines.push(...buildPrimitiveSpacing());
  primLines.push(...buildPrimitiveRadii());

  primLines.push('}');
  primLines.push('');

  fs.writeFileSync(path.join(OUT, 'loom-primitives.css'), primLines.join('\n'));

  // ---- Semantic CSS ----
  const semLines = [
    '/* Loom Design System - Semantic Tokens (Light / Dark) */',
    '/* Auto-generated by scripts/build-css.js - do not edit manually */',
    '',
    '/* Light theme (default) */',
    ':root,',
    '[data-theme="light"] {'
  ];

  semLines.push(...buildSemanticForMode(semanticData, 'Light', primitiveColors));
  semLines.push('}');
  semLines.push('');
  semLines.push('/* Dark theme */');
  semLines.push('[data-theme="dark"] {');
  semLines.push(...buildSemanticForMode(semanticData, 'Dark', primitiveColors));
  semLines.push('}');
  semLines.push('');

  // Component tokens
  const compDir = path.join(TOKENS, 'components');
  if (fs.existsSync(compDir)) {
    const compFiles = fs.readdirSync(compDir).filter(f => f.endsWith('.json'));
    if (compFiles.length > 0) {
      semLines.push('/* Component tokens */');
      semLines.push(':root {');
      for (const file of compFiles) {
        semLines.push(`  /* ${path.basename(file, '.json')} */`);
        semLines.push(...buildComponentTokens(path.join(compDir, file)));
      }
      semLines.push('}');
      semLines.push('');
    }
  }

  fs.writeFileSync(path.join(OUT, 'loom-semantic.css'), semLines.join('\n'));

  // ---- Combined entry point ----
  const combined = [
    '/* Loom Design System - All Tokens */',
    '/* Auto-generated by scripts/build-css.js - do not edit manually */',
    '',
    '@import "loom-primitives.css";',
    '@import "loom-semantic.css";',
    ''
  ];

  fs.writeFileSync(path.join(OUT, 'loom-tokens.css'), combined.join('\n'));

  // ---- Summary ----
  const primCount = primLines.filter(l => l.trim().startsWith('--loom-')).length;
  const lightCount = buildSemanticForMode(semanticData, 'Light', primitiveColors)
    .filter(l => l.trim().startsWith('--loom-')).length;
  const darkCount = buildSemanticForMode(semanticData, 'Dark', primitiveColors)
    .filter(l => l.trim().startsWith('--loom-')).length;

  console.log('✓ css/loom-primitives.css  - %d custom properties', primCount);
  console.log('✓ css/loom-semantic.css    - %d light + %d dark + component tokens', lightCount, darkCount);
  console.log('✓ css/loom-tokens.css      - combined entry point');
  console.log('Done.');
}

build();
