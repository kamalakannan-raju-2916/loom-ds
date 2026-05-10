---
name: semantic-token-sync
description: "Sync Loom semantic design tokens (colors, spacing, radii, shadows, typography) from repo JSON into Figma Variables with Light/Dark modes via the Desktop Bridge. Use when: user wants to push semantic tokens to Figma, update Figma variables from token files, or sync themes."
argument-hint: "Optional: 'all' (default), 'colors', 'spacing', 'radii', 'shadows', 'typography'"
---

# Semantic Token Sync - Repo → Figma Variables

## Purpose

Reads Loom semantic token JSON files from the repository and creates/updates Figma Variable collections with **Light** and **Dark** modes. This replaces the need for Tokens Studio by using the Figma Desktop Bridge directly.

**One-way sync:** Repository (source of truth) → Figma Variables.

## Inputs

- User says "sync tokens" or "push tokens to Figma"
- Optional scope: `colors`, `spacing`, `radii`, `shadows`, `typography`, or `all` (default)

## Token File Locations

```
tokens/
├── semantic/
│   └── colors.json       ← Surface, text, border, status tokens (Light/Dark)
```

Future files (same format):
- `tokens/semantic/spacing.json`
- `tokens/semantic/radii.json`
- `tokens/semantic/shadows.json`
- `tokens/semantic/typography.json`

## Token JSON Format

Each token has Light and Dark values - either **raw hex/rgba** or a **reference** to a Primitives variable:

```json
{
  "semantic": {
    "group-name": {
      "token-name": { "Light": "{primitive.color.white}", "Dark": "{primitive.color.grey.t05}" }
    }
  }
}
```

Reference format: `{primitive.color.<key>}` where `<key>` maps to a Figma Primitives variable:
- `white`, `black`, `half` → `White` or `Essentials/White`
- `blue1`, `overlay1`, etc. → `Essentials/Blue1`, `Essentials/Overlay1`
- `grey.s90` → `Grey/Shade/90`
- `grey.t05` → `Grey/Tint/05`
- `cornflower.base` → `Cornflower/Master/Master`
- `cornflower.t30` → `Cornflower/Tint/30`

When a value is a reference, the skill creates a **Figma variable alias** pointing to the Primitives variable. Raw hex/rgba values are set directly.
```

## Figma Variable Structure

| Figma concept | Maps to |
|---|---|
| Collection | `Semantic` |
| Modes | `Light`, `Dark` |
| Variable groups | Slash-separated: `surface/page`, `text/primary`, `border/default` |
| Variable type | `COLOR` for colors, `FLOAT` for spacing/radii |

## Procedure

### Step 1: Confirm Figma Connection

Verify a Figma file is connected via `figma_list_open_files`.

### Step 2: Read Token File

Read the relevant token JSON from the repo (e.g. `tokens/semantic/colors.json`).

### Step 3: Bootstrap Semantic Collection

Run via `figma_execute`. This finds or creates the `Semantic` collection with Light/Dark modes.

```javascript
// === BOOTSTRAP: Find or create Semantic collection with Light/Dark modes ===

let collection = null;
const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
for (const c of allCollections) {
  if (c.name === 'Semantic') { collection = c; break; }
}

if (!collection) {
  collection = figma.variables.createVariableCollection('Semantic');
  // Rename default mode to "Light"
  collection.renameMode(collection.modes[0].modeId, 'Light');
  // Add "Dark" mode
  collection.addMode('Dark');
}

// Find mode IDs
let lightModeId = null;
let darkModeId = null;
for (const mode of collection.modes) {
  if (mode.name === 'Light') lightModeId = mode.modeId;
  if (mode.name === 'Dark') darkModeId = mode.modeId;
}

// If modes exist but names don't match (edge case), use positional
if (!lightModeId) lightModeId = collection.modes[0].modeId;
if (!darkModeId) darkModeId = collection.modes[1] ? collection.modes[1].modeId : null;

if (!darkModeId) {
  // Only one mode exists, add Dark
  darkModeId = collection.addMode('Dark');
}

return {
  collectionId: collection.id,
  lightModeId: lightModeId,
  darkModeId: darkModeId,
  existingModes: collection.modes.map(m => m.name),
  message: 'Semantic collection ready with Light/Dark modes'
};
```

### Step 4: Sync Color Tokens

The agent substitutes `__TOKENS_JSON__` with the actual parsed token data from the JSON file (the `semantic` object). Each token becomes a Figma Variable. **Reference values** (`{primitive.color.*}`) are created as variable aliases pointing to the Primitives collection; raw hex/rgba values are set directly.

Run via `figma_execute`:

```javascript
const COLLECTION_ID = '__COLLECTION_ID__';
const LIGHT_MODE_ID = '__LIGHT_MODE_ID__';
const DARK_MODE_ID = '__DARK_MODE_ID__';

// Token data - substituted by the agent from tokens/semantic/colors.json
const TOKENS = __TOKENS_JSON__;

// === HELPERS ===
function hexToFigmaColor(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 6) {
    return {
      r: parseInt(hex.substring(0,2), 16) / 255,
      g: parseInt(hex.substring(2,4), 16) / 255,
      b: parseInt(hex.substring(4,6), 16) / 255,
      a: 1
    };
  }
  return null;
}

function parseRgba(str) {
  const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
  if (match) {
    return {
      r: parseInt(match[1]) / 255,
      g: parseInt(match[2]) / 255,
      b: parseInt(match[3]) / 255,
      a: match[4] !== undefined ? parseFloat(match[4]) : 1
    };
  }
  return null;
}

function parseColor(value) {
  if (value.startsWith('#')) return hexToFigmaColor(value);
  if (value.startsWith('rgb')) return parseRgba(value);
  return null;
}

function isReference(value) {
  return typeof value === 'string' && value.startsWith('{') && value.endsWith('}');
}

function extractRefKey(value) {
  return value.slice(1, -1).replace('primitive.color.', '');
}

// Converts Figma Primitives variable name to the reference key used in JSON
function figmaNameToRefKey(name) {
  if (name.startsWith('Essentials/')) return name.substring(11).toLowerCase();
  const parts = name.split('/');
  if (parts.length === 3 && parts[1] === 'Master') return parts[0].toLowerCase() + '.base';
  if (parts.length === 3 && parts[1] === 'Shade') return parts[0].toLowerCase() + '.s' + parts[2];
  if (parts.length === 3 && parts[1] === 'Tint') return parts[0].toLowerCase() + '.t' + parts[2];
  return name.toLowerCase();
}

// === FIND PRIMITIVES COLLECTION & BUILD REFERENCE LOOKUP ===
let primCollection = null;
const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
for (const c of allCollections) {
  if (c.name === 'Primitives') { primCollection = c; break; }
}

const refKeyToVar = {};
if (primCollection) {
  for (const varId of primCollection.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(varId);
    if (v) refKeyToVar[figmaNameToRefKey(v.name)] = v;
  }
}

// === GET SEMANTIC COLLECTION ===
const collection = await figma.variables.getVariableCollectionByIdAsync(COLLECTION_ID);
if (!collection) return { error: 'Semantic collection not found - run bootstrap first' };

// === BUILD LOOKUP of existing semantic variables ===
const existingVars = {};
for (const varId of collection.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(varId);
  if (v) existingVars[v.name] = v;
}

// === RESOLVE VALUE: alias or raw color ===
function resolveValue(value) {
  if (isReference(value)) {
    const key = extractRefKey(value);
    const primVar = refKeyToVar[key];
    if (primVar) return { type: 'VARIABLE_ALIAS', id: primVar.id };
    // Reference not found - skip
    return null;
  }
  return parseColor(value);
}

// === CREATE OR UPDATE VARIABLES ===
let created = 0;
let updated = 0;
let skipped = 0;
let aliased = 0;
const skippedTokens = [];

for (const [group, tokens] of Object.entries(TOKENS)) {
  for (const [name, values] of Object.entries(tokens)) {
    const varName = group + '/' + name;
    const lightVal = resolveValue(values.Light);
    const darkVal = resolveValue(values.Dark);

    if (!lightVal || !darkVal) {
      skipped++;
      skippedTokens.push(varName);
      continue;
    }

    let variable = existingVars[varName];
    if (!variable) {
      variable = figma.variables.createVariable(varName, collection, 'COLOR');
      created++;
    } else {
      updated++;
    }

    variable.setValueForMode(LIGHT_MODE_ID, lightVal);
    variable.setValueForMode(DARK_MODE_ID, darkVal);

    if (lightVal.type === 'VARIABLE_ALIAS' || darkVal.type === 'VARIABLE_ALIAS') aliased++;
  }
}

return {
  created: created,
  updated: updated,
  skipped: skipped,
  aliased: aliased,
  skippedTokens: skippedTokens,
  total: created + updated,
  message: 'Synced ' + (created + updated) + ' semantic color variables (' + created + ' new, ' + updated + ' updated, ' + aliased + ' aliased, ' + skipped + ' skipped)'
};
```

### Step 5: Report Results

Report back to the user:
- How many variables were created/updated
- Any skipped tokens (e.g. rgba values that couldn't be parsed)
- Confirm the collection and modes are set up correctly

---

## Updating Tokens

When token values change in the repo JSON:
1. User says "sync tokens" again
2. The skill re-reads the JSON and runs Step 4
3. Existing variables are **updated in place** (matched by name), new ones are created
4. No duplicates - the skill is idempotent

## Extending to Other Token Types

### Spacing / Radii (FLOAT variables)

Same pattern but use `FLOAT` type:

```javascript
// For spacing tokens like { "space": { "1": { "Light": 4, "Dark": 4 } } }
const variable = figma.variables.createVariable(varName, collection, 'FLOAT');
variable.setValueForMode(LIGHT_MODE_ID, values.Light);
variable.setValueForMode(DARK_MODE_ID, values.Dark);
```

### Typography

Typography doesn't map cleanly to Figma Variables (it's multi-property). Instead:
- Create Figma **Text Styles** programmatically
- Or store as reference documentation only

---

## Notes

- **Idempotent** - safe to run multiple times; existing variables are updated, not duplicated
- **One-way sync** - repo is the source of truth; Figma receives, never sends back
- **No plugins required** - uses Figma Desktop Bridge (`figma_execute`) only
- **Variable naming** uses slash-grouped format: `surface/page`, `text/primary`, `border/focus`
- **Variable aliases** - reference values (`{primitive.color.*}`) create Figma variable aliases pointing to the Primitives collection, maintaining the live link between semantic and primitive tokens
- RGBA colors (like overlays) are supported with alpha channel
- The Primitives collection must exist with the referenced variables before syncing aliases. Run the DSG color token skill first if needed
- Run bootstrap (Step 3) once per file; the sync step (Step 4) can be repeated freely
- If a variable name changes in the JSON, the old variable remains in Figma (manual cleanup needed)
