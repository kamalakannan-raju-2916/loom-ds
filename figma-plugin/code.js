// Loom Design Tokens — Figma Plugin (code.js)
// Runs in the Figma sandbox. Receives messages from ui.html and creates/updates variables.

const REPO_BASE = 'https://raw.githubusercontent.com/kamalakannan-raju-2916/loom-ds/main/tokens';

// ─── Helpers ────────────────────────────────────────────────────────────────

function hexToRGB(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return {
    r: parseInt(hex.substring(0,2), 16) / 255,
    g: parseInt(hex.substring(2,4), 16) / 255,
    b: parseInt(hex.substring(4,6), 16) / 255
  };
}

function rgbaToFigma(str) {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  return {
    color: { r: +m[1]/255, g: +m[2]/255, b: +m[3]/255 },
    opacity: m[4] !== undefined ? parseFloat(m[4]) : 1
  };
}

function colorToFigma(val) {
  if (val.startsWith('rgba') || val.startsWith('rgb')) {
    const parsed = rgbaToFigma(val);
    if (parsed) return parsed;
  }
  return { color: hexToRGB(val), opacity: 1 };
}

function pxToNumber(val) {
  if (typeof val === 'number') return val;
  return parseFloat(String(val).replace('px', ''));
}

function remToNumber(val) {
  if (typeof val === 'number') return val;
  const str = String(val);
  if (str.endsWith('rem')) return parseFloat(str) * 16;
  if (str.endsWith('px')) return parseFloat(str);
  return parseFloat(str);
}

// ─── Find or Create Collection ──────────────────────────────────────────────

async function findOrCreateCollection(name) {
  const existing = await figma.variables.getLocalVariableCollectionsAsync();
  const found = existing.find(c => c.name === name);
  if (found) return found;
  return figma.variables.createVariableCollection(name);
}

// ─── Find or Create Variable ────────────────────────────────────────────────

async function findOrCreateVariable(name, collectionId, type) {
  const existing = await figma.variables.getLocalVariablesAsync(type);
  const found = existing.find(v => v.name === name && v.variableCollectionId === collectionId);
  if (found) return found;
  return figma.variables.createVariable(name, collectionId, type);
}

// ─── Sync Color Tokens ─────────────────────────────────────────────────────

async function syncColorTokens(colorsData, productConfig, collection, modeId) {
  const families = productConfig.colorFamilies;
  const colors = colorsData.primitive.color;
  let count = 0;

  // Always include essentials
  const essentialKeys = ['white', 'black', 'half', 'blue1', 'blue2', 'purple1', 'purple2', 'overlay1', 'overlay2'];
  for (const key of essentialKeys) {
    if (!colors[key]) continue;
    const val = colors[key].$value || colors[key];
    const name = `color/essentials/${key}`;
    const variable = await findOrCreateVariable(name, collection.id, 'COLOR');
    const figmaColor = colorToFigma(String(val));
    variable.setValueForMode(modeId, figmaColor.color);
    count++;
  }

  // Link token
  if (colors.link) {
    const linkVal = colors.link.$value || '#006AFF';
    const linkVar = await findOrCreateVariable('color/essentials/link', collection.id, 'COLOR');
    linkVar.setValueForMode(modeId, hexToRGB(String(linkVal)));
    count++;
  }

  // Product accent + selected families
  for (const familyName of families) {
    const family = colors[familyName];
    if (!family) continue;

    const entries = Object.entries(family);
    for (const [shade, token] of entries) {
      const val = token.$value || token;
      const name = `color/${familyName}/${shade}`;
      const variable = await findOrCreateVariable(name, collection.id, 'COLOR');
      const figmaColor = colorToFigma(String(val));
      variable.setValueForMode(modeId, figmaColor.color);
      count++;
    }
  }

  return count;
}

// ─── Sync Typography Tokens ─────────────────────────────────────────────────

async function syncTypographyTokens(typoData, collection, modeId) {
  const font = typoData.primitive.font;
  let count = 0;

  // Font sizes → FLOAT
  for (const [key, val] of Object.entries(font.size)) {
    const name = `font/size/${key}`;
    const variable = await findOrCreateVariable(name, collection.id, 'FLOAT');
    variable.setValueForMode(modeId, remToNumber(val));
    count++;
  }

  // Font weights → FLOAT
  for (const [key, val] of Object.entries(font.weight)) {
    const name = `font/weight/${key}`;
    const variable = await findOrCreateVariable(name, collection.id, 'FLOAT');
    variable.setValueForMode(modeId, val);
    count++;
  }

  // Line heights → FLOAT
  for (const [key, val] of Object.entries(font.lineHeight)) {
    const name = `font/lineHeight/${key}`;
    const variable = await findOrCreateVariable(name, collection.id, 'FLOAT');
    variable.setValueForMode(modeId, remToNumber(val));
    count++;
  }

  // Font families → STRING
  for (const [key, val] of Object.entries(font.family)) {
    const name = `font/family/${key}`;
    const variable = await findOrCreateVariable(name, collection.id, 'STRING');
    variable.setValueForMode(modeId, val);
    count++;
  }

  return count;
}

// ─── Sync Spacing Tokens ───────────────────────────────────────────────────

async function syncSpacingTokens(spacingData, collection, modeId) {
  const primitives = spacingData.primitive;
  let count = 0;

  // Spacing scale → FLOAT
  for (const [key, val] of Object.entries(primitives.spacing)) {
    const name = `spacing/${key}`;
    const variable = await findOrCreateVariable(name, collection.id, 'FLOAT');
    variable.setValueForMode(modeId, pxToNumber(val));
    count++;
  }

  // Icon sizes → FLOAT
  for (const [key, val] of Object.entries(primitives.iconSize)) {
    const name = `iconSize/${key}`;
    const variable = await findOrCreateVariable(name, collection.id, 'FLOAT');
    variable.setValueForMode(modeId, pxToNumber(val));
    count++;
  }

  // Stroke widths → FLOAT
  for (const [key, val] of Object.entries(primitives.strokeWidth)) {
    const name = `strokeWidth/${key}`;
    const variable = await findOrCreateVariable(name, collection.id, 'FLOAT');
    variable.setValueForMode(modeId, pxToNumber(val));
    count++;
  }

  return count;
}

// ─── Sync Radii Tokens ──────────────────────────────────────────────────────

async function syncRadiiTokens(radiiData, collection, modeId) {
  const primitives = radiiData.primitive;
  let count = 0;

  // Border radii → FLOAT
  for (const [key, val] of Object.entries(primitives.radius)) {
    const name = `radius/${key}`;
    const variable = await findOrCreateVariable(name, collection.id, 'FLOAT');
    variable.setValueForMode(modeId, pxToNumber(val));
    count++;
  }

  return count;
}

// ─── Main Message Handler ───────────────────────────────────────────────────

figma.showUI(__html__, { width: 420, height: 560, themeColors: true });

figma.ui.onmessage = async (msg) => {

  if (msg.type === 'sync-tokens') {
    const { productKey, productConfig, colorsData, typographyData, spacingData, radiiData } = msg;

    try {
      figma.ui.postMessage({ type: 'status', message: `Creating collection: Loom / ${productConfig.name}…` });

      // ── Primitives Collection ──
      const primCollection = await findOrCreateCollection(`Loom / ${productConfig.name} / Primitives`);
      const primModeId = primCollection.modes[0].modeId;

      // Rename default mode
      primCollection.renameMode(primModeId, 'Default');

      // Colors
      figma.ui.postMessage({ type: 'status', message: 'Syncing color tokens…' });
      const colorCount = await syncColorTokens(colorsData, productConfig, primCollection, primModeId);

      // Typography
      figma.ui.postMessage({ type: 'status', message: 'Syncing typography tokens…' });
      const typoCount = await syncTypographyTokens(typographyData, primCollection, primModeId);

      // Spacing
      figma.ui.postMessage({ type: 'status', message: 'Syncing spacing tokens…' });
      const spacingCount = await syncSpacingTokens(spacingData, primCollection, primModeId);

      // Radii
      figma.ui.postMessage({ type: 'status', message: 'Syncing radii tokens…' });
      const radiiCount = await syncRadiiTokens(radiiData, primCollection, primModeId);

      const total = colorCount + typoCount + spacingCount + radiiCount;

      figma.ui.postMessage({
        type: 'complete',
        message: `Synced ${total} variables for ${productConfig.name}`,
        details: {
          colors: colorCount,
          typography: typoCount,
          spacing: spacingCount,
          radii: radiiCount
        }
      });

      figma.notify(`✅ Loom: ${total} tokens synced for ${productConfig.name}`);

    } catch (err) {
      figma.ui.postMessage({ type: 'error', message: err.message || String(err) });
      figma.notify('❌ Token sync failed — see plugin for details', { error: true });
    }
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
