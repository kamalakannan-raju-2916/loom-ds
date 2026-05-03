// Loom Design Tokens — Figma Plugin (code.js)
// Creates variable collections (Font, Spacing, Icon Size, Stroke Width, Radius)
// and visual reference pages (Colors, Semantics, Typography, Spacing).
// Colors are NOT created as variables — use the DSG Color Skill for that.

const LOOM_PREFIX = 'Loom';

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

function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastTextColor(hex) {
  const rgb = hexToRGB(hex);
  const lum = luminance(rgb.r, rgb.g, rgb.b);
  return lum > 0.179 ? '#000000' : '#FFFFFF';
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

// ─── Find or Create Page ────────────────────────────────────────────────────

function findOrCreatePage(name) {
  const existing = figma.root.children.find(p => p.name === name);
  if (existing) return existing;
  const page = figma.createPage();
  page.name = name;
  return page;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIABLE COLLECTIONS — each at root level, separate groups
// No colors here — those are managed by the DSG Color Tokens skill
// ═══════════════════════════════════════════════════════════════════════════════

async function syncFontVariables(typographyData) {
  const collection = await findOrCreateCollection('Font');
  const modeId = collection.modes[0].modeId;
  collection.renameMode(modeId, 'Default');
  const font = typographyData.primitive.font;
  let count = 0;

  for (const [key, val] of Object.entries(font.family)) {
    const v = await findOrCreateVariable(`family/${key}`, collection.id, 'STRING');
    v.setValueForMode(modeId, val);
    count++;
  }

  for (const [key, val] of Object.entries(font.weight)) {
    const v = await findOrCreateVariable(`weight/${key}`, collection.id, 'FLOAT');
    v.setValueForMode(modeId, val);
    count++;
  }

  for (const [key, val] of Object.entries(font.size)) {
    const v = await findOrCreateVariable(`size/${key}`, collection.id, 'FLOAT');
    v.setValueForMode(modeId, remToNumber(val));
    count++;
  }

  for (const [key, val] of Object.entries(font.lineHeight)) {
    const v = await findOrCreateVariable(`lineHeight/${key}`, collection.id, 'FLOAT');
    v.setValueForMode(modeId, remToNumber(val));
    count++;
  }

  for (const [key, val] of Object.entries(font.letterSpacing)) {
    const v = await findOrCreateVariable(`letterSpacing/${key}`, collection.id, 'FLOAT');
    const numVal = parseFloat(String(val).replace('em', ''));
    v.setValueForMode(modeId, numVal);
    count++;
  }

  return count;
}

async function syncSpacingVariables(spacingData) {
  const collection = await findOrCreateCollection('Spacing');
  const modeId = collection.modes[0].modeId;
  collection.renameMode(modeId, 'Default');
  let count = 0;

  for (const [key, val] of Object.entries(spacingData.primitive.spacing)) {
    const v = await findOrCreateVariable(key, collection.id, 'FLOAT');
    v.setValueForMode(modeId, pxToNumber(val));
    count++;
  }
  return count;
}

async function syncIconSizeVariables(spacingData) {
  const collection = await findOrCreateCollection('Icon Size');
  const modeId = collection.modes[0].modeId;
  collection.renameMode(modeId, 'Default');
  let count = 0;

  for (const [key, val] of Object.entries(spacingData.primitive.iconSize)) {
    const v = await findOrCreateVariable(key, collection.id, 'FLOAT');
    v.setValueForMode(modeId, pxToNumber(val));
    count++;
  }
  return count;
}

async function syncStrokeWidthVariables(spacingData) {
  const collection = await findOrCreateCollection('Stroke Width');
  const modeId = collection.modes[0].modeId;
  collection.renameMode(modeId, 'Default');
  let count = 0;

  for (const [key, val] of Object.entries(spacingData.primitive.strokeWidth)) {
    const v = await findOrCreateVariable(key, collection.id, 'FLOAT');
    v.setValueForMode(modeId, pxToNumber(val));
    count++;
  }
  return count;
}

async function syncRadiusVariables(radiiData) {
  const collection = await findOrCreateCollection('Radius');
  const modeId = collection.modes[0].modeId;
  collection.renameMode(modeId, 'Default');
  let count = 0;

  for (const [key, val] of Object.entries(radiiData.primitive.radius)) {
    const v = await findOrCreateVariable(key, collection.id, 'FLOAT');
    v.setValueForMode(modeId, pxToNumber(val));
    count++;
  }
  return count;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE CREATION — Visual reference sheets matching the catalog
// ═══════════════════════════════════════════════════════════════════════════════

async function createColorsPage(colorsData, productConfig) {
  const page = findOrCreatePage(`${LOOM_PREFIX} / Colors`);
  for (const child of [...page.children]) child.remove();

  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  const colors = colorsData.primitive.color;
  const families = productConfig.colorFamilies;
  let yOffset = 0;

  // Page title
  const title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = 32;
  title.characters = `${productConfig.name} — Color Palette`;
  title.fills = [figma.util.solidPaint('#1A1A1A')];
  page.appendChild(title);
  title.x = 0; title.y = yOffset;
  yOffset += 60;

  // Accent indicator
  const accentFamily = colors[productConfig.accent];
  const accentHex = (accentFamily && accentFamily.base && accentFamily.base.$value) || '#666666';
  const accentLabel = figma.createText();
  accentLabel.fontName = { family: 'Inter', style: 'Medium' };
  accentLabel.fontSize = 16;
  accentLabel.characters = `Accent: ${productConfig.accent} (${accentHex})`;
  accentLabel.fills = [figma.util.solidPaint('#666666')];
  page.appendChild(accentLabel);
  accentLabel.x = 0; accentLabel.y = yOffset;
  yOffset += 60;

  // Each color family as a row of swatches
  for (const familyName of families) {
    const family = colors[familyName];
    if (!family) continue;

    // Family label
    const label = figma.createText();
    label.fontName = { family: 'Inter', style: 'Bold' };
    label.fontSize = 14;
    label.characters = familyName.charAt(0).toUpperCase() + familyName.slice(1);
    label.fills = [figma.util.solidPaint('#333333')];
    page.appendChild(label);
    label.x = 0; label.y = yOffset;
    yOffset += 28;

    // Shades → Base → Tints
    const shadeKeys = ['s100','s90','s80','s70','s60','s50','s40','s30','s20','s10'];
    const tintKeys = ['t10','t20','t30','t40','t50','t60','t70','t80','t90','t100'];
    const allKeys = [...shadeKeys, 'base', ...tintKeys];

    let xOffset = 0;
    const swatchSize = 48;
    const gap = 4;

    for (const key of allKeys) {
      const token = family[key];
      if (!token) continue;
      const hex = token.$value;

      const rect = figma.createRectangle();
      rect.name = `${familyName}/${key}`;
      rect.resize(swatchSize, swatchSize);
      rect.cornerRadius = key === 'base' ? 8 : 4;
      rect.fills = [figma.util.solidPaint(hex)];
      page.appendChild(rect);
      rect.x = xOffset; rect.y = yOffset;

      // Label
      const hexLabel = figma.createText();
      hexLabel.fontName = { family: 'Inter', style: 'Regular' };
      hexLabel.fontSize = 8;
      hexLabel.characters = key === 'base' ? hex : key.toUpperCase();
      hexLabel.fills = [figma.util.solidPaint('#666666')];
      hexLabel.textAlignHorizontal = 'CENTER';
      hexLabel.resize(swatchSize, 12);
      page.appendChild(hexLabel);
      hexLabel.x = xOffset; hexLabel.y = yOffset + swatchSize + 2;

      xOffset += swatchSize + gap;
    }
    yOffset += swatchSize + 24 + 16;
  }

  return page;
}

async function createSemanticsPage(semanticTokens) {
  const page = findOrCreatePage(`${LOOM_PREFIX} / Semantics`);
  for (const child of [...page.children]) child.remove();

  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  let yOffset = 0;

  const title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = 32;
  title.characters = 'Semantic Tokens — Light & Dark';
  title.fills = [figma.util.solidPaint('#1A1A1A')];
  page.appendChild(title);
  title.x = 0; title.y = yOffset;
  yOffset += 50;

  const subtitle = figma.createText();
  subtitle.fontName = { family: 'Inter', style: 'Regular' };
  subtitle.fontSize = 14;
  subtitle.characters = 'Semantic tokens map primitives to UI roles. Each resolves differently per theme.';
  subtitle.fills = [figma.util.solidPaint('#666666')];
  page.appendChild(subtitle);
  subtitle.x = 0; subtitle.y = yOffset;
  yOffset += 48;

  const colWidth = 200;
  const rowHeight = 44;
  const headers = ['Token', 'Light', 'Dark'];
  for (let i = 0; i < headers.length; i++) {
    const h = figma.createText();
    h.fontName = { family: 'Inter', style: 'Bold' };
    h.fontSize = 12;
    h.characters = headers[i];
    h.fills = [figma.util.solidPaint('#999999')];
    page.appendChild(h);
    h.x = i * colWidth; h.y = yOffset;
  }
  yOffset += 28;

  if (semanticTokens && semanticTokens.length > 0) {
    for (const token of semanticTokens) {
      const nameText = figma.createText();
      nameText.fontName = { family: 'Inter', style: 'Medium' };
      nameText.fontSize = 13;
      nameText.characters = token.name;
      nameText.fills = [figma.util.solidPaint('#333333')];
      page.appendChild(nameText);
      nameText.x = 0; nameText.y = yOffset + 8;

      if (token.light) {
        const lr = figma.createRectangle();
        lr.resize(28, 28); lr.cornerRadius = 4;
        lr.fills = [figma.util.solidPaint(token.light)];
        page.appendChild(lr);
        lr.x = colWidth; lr.y = yOffset + 4;

        const ll = figma.createText();
        ll.fontName = { family: 'Inter', style: 'Regular' };
        ll.fontSize = 11; ll.characters = token.light;
        ll.fills = [figma.util.solidPaint('#666666')];
        page.appendChild(ll);
        ll.x = colWidth + 34; ll.y = yOffset + 12;
      }

      if (token.dark) {
        const dr = figma.createRectangle();
        dr.resize(28, 28); dr.cornerRadius = 4;
        dr.fills = [figma.util.solidPaint(token.dark)];
        dr.strokes = [figma.util.solidPaint('#E0E0E0')];
        dr.strokeWeight = 0.5;
        page.appendChild(dr);
        dr.x = colWidth * 2; dr.y = yOffset + 4;

        const dl = figma.createText();
        dl.fontName = { family: 'Inter', style: 'Regular' };
        dl.fontSize = 11; dl.characters = token.dark;
        dl.fills = [figma.util.solidPaint('#666666')];
        page.appendChild(dl);
        dl.x = colWidth * 2 + 34; dl.y = yOffset + 12;
      }
      yOffset += rowHeight;
    }
  }
  return page;
}

async function createTypographyPage(typographyData) {
  const page = findOrCreatePage(`${LOOM_PREFIX} / Typography`);
  for (const child of [...page.children]) child.remove();

  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  const font = typographyData.primitive.font;
  const typeScale = typographyData.primitive.typeScale;
  let yOffset = 0;

  const title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = 32;
  title.characters = 'Typography — Type Scale';
  title.fills = [figma.util.solidPaint('#1A1A1A')];
  page.appendChild(title);
  title.x = 0; title.y = yOffset;
  yOffset += 50;

  const familyNote = figma.createText();
  familyNote.fontName = { family: 'Inter', style: 'Regular' };
  familyNote.fontSize = 14;
  familyNote.characters = `Primary: ${font.family.primary}\nMono: ${font.family.mono}`;
  familyNote.fills = [figma.util.solidPaint('#666666')];
  page.appendChild(familyNote);
  familyNote.x = 0; familyNote.y = yOffset;
  yOffset += 60;

  const weightToStyle = { 'regular': 'Regular', 'medium': 'Medium', 'semibold': 'Bold', 'bold': 'Bold' };

  for (const [scaleName, config] of Object.entries(typeScale)) {
    const sizeVal = remToNumber(font.size[config.size]);
    const weightVal = config.weight;
    const lineHeightVal = remToNumber(font.lineHeight[config.lineHeight]);
    const style = weightToStyle[weightVal] || 'Regular';

    const label = figma.createText();
    label.fontName = { family: 'Inter', style: 'Medium' };
    label.fontSize = 11;
    label.characters = `${scaleName}  —  ${sizeVal}px / ${lineHeightVal}px / ${weightVal}`;
    label.fills = [figma.util.solidPaint('#999999')];
    page.appendChild(label);
    label.x = 0; label.y = yOffset;
    yOffset += 20;

    const specimen = figma.createText();
    specimen.fontName = { family: 'Inter', style: style };
    specimen.fontSize = Math.min(sizeVal, 48);
    specimen.lineHeight = { value: lineHeightVal, unit: 'PIXELS' };
    specimen.characters = 'The quick brown fox jumps over the lazy dog';
    specimen.fills = [figma.util.solidPaint('#1A1A1A')];
    page.appendChild(specimen);
    specimen.x = 0; specimen.y = yOffset;
    yOffset += Math.max(lineHeightVal + 12, 32) + 16;
  }

  return page;
}

async function createSpacingPage(spacingData, radiiData) {
  const page = findOrCreatePage(`${LOOM_PREFIX} / Spacing`);
  for (const child of [...page.children]) child.remove();

  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  let yOffset = 0;

  const title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = 32;
  title.characters = 'Spacing & Radii';
  title.fills = [figma.util.solidPaint('#1A1A1A')];
  page.appendChild(title);
  title.x = 0; title.y = yOffset;
  yOffset += 60;

  // Spacing scale
  const spacingLabel = figma.createText();
  spacingLabel.fontName = { family: 'Inter', style: 'Bold' };
  spacingLabel.fontSize = 18;
  spacingLabel.characters = 'Spacing Scale (4px base unit)';
  spacingLabel.fills = [figma.util.solidPaint('#333333')];
  page.appendChild(spacingLabel);
  spacingLabel.x = 0; spacingLabel.y = yOffset;
  yOffset += 36;

  for (const [key, val] of Object.entries(spacingData.primitive.spacing)) {
    const px = pxToNumber(val);

    const sLabel = figma.createText();
    sLabel.fontName = { family: 'Inter', style: 'Medium' };
    sLabel.fontSize = 12;
    sLabel.characters = `spacing-${key}  (${px}px)`;
    sLabel.fills = [figma.util.solidPaint('#666666')];
    page.appendChild(sLabel);
    sLabel.x = 0; sLabel.y = yOffset + 4;

    if (px > 0) {
      const bar = figma.createRectangle();
      bar.name = `spacing-${key}`;
      bar.resize(px * 4, 16);
      bar.cornerRadius = 3;
      bar.fills = [figma.util.solidPaint('#2C66DD')];
      bar.opacity = 0.7;
      page.appendChild(bar);
      bar.x = 160; bar.y = yOffset + 2;
    }
    yOffset += 28;
  }
  yOffset += 24;

  // Border Radii
  const radiiLabel = figma.createText();
  radiiLabel.fontName = { family: 'Inter', style: 'Bold' };
  radiiLabel.fontSize = 18;
  radiiLabel.characters = 'Border Radii';
  radiiLabel.fills = [figma.util.solidPaint('#333333')];
  page.appendChild(radiiLabel);
  radiiLabel.x = 0; radiiLabel.y = yOffset;
  yOffset += 36;

  let xOff = 0;
  for (const [key, val] of Object.entries(radiiData.primitive.radius)) {
    const px = pxToNumber(val);
    const size = 64;

    const rect = figma.createRectangle();
    rect.name = `radius-${key}`;
    rect.resize(size, size);
    rect.cornerRadius = Math.min(px, size / 2);
    rect.fills = [figma.util.solidPaint('#F0F0F0')];
    rect.strokes = [figma.util.solidPaint('#CCCCCC')];
    rect.strokeWeight = 1;
    page.appendChild(rect);
    rect.x = xOff; rect.y = yOffset;

    const rLabel = figma.createText();
    rLabel.fontName = { family: 'Inter', style: 'Regular' };
    rLabel.fontSize = 10;
    rLabel.characters = `${key}\n${val}`;
    rLabel.fills = [figma.util.solidPaint('#666666')];
    rLabel.textAlignHorizontal = 'CENTER';
    rLabel.resize(size, 24);
    page.appendChild(rLabel);
    rLabel.x = xOff; rLabel.y = yOffset + size + 4;

    xOff += size + 16;
  }
  yOffset += 120;

  // Icon Sizes
  const iconLabel = figma.createText();
  iconLabel.fontName = { family: 'Inter', style: 'Bold' };
  iconLabel.fontSize = 18;
  iconLabel.characters = 'Icon Sizes';
  iconLabel.fills = [figma.util.solidPaint('#333333')];
  page.appendChild(iconLabel);
  iconLabel.x = 0; iconLabel.y = yOffset;
  yOffset += 36;

  xOff = 0;
  for (const [key, val] of Object.entries(spacingData.primitive.iconSize)) {
    const px = pxToNumber(val);

    const rect = figma.createRectangle();
    rect.name = `icon-${key}`;
    rect.resize(px, px);
    rect.cornerRadius = 4;
    rect.fills = [figma.util.solidPaint('#E8E8E8')];
    rect.strokes = [figma.util.solidPaint('#999999')];
    rect.strokeWeight = 1;
    rect.dashPattern = [4, 4];
    page.appendChild(rect);
    rect.x = xOff; rect.y = yOffset;

    const iLabel = figma.createText();
    iLabel.fontName = { family: 'Inter', style: 'Regular' };
    iLabel.fontSize = 10;
    iLabel.characters = `${key} (${px}px)`;
    iLabel.fills = [figma.util.solidPaint('#666666')];
    page.appendChild(iLabel);
    iLabel.x = xOff; iLabel.y = yOffset + px + 4;

    xOff += px + 24;
  }

  return page;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

figma.showUI(__html__, { width: 420, height: 580, themeColors: true });

figma.ui.onmessage = async (msg) => {

  if (msg.type === 'sync-tokens') {
    const { productConfig, colorsData, typographyData, spacingData, radiiData, semanticTokens } = msg;

    try {
      // 1. Variable Collections (separate, at root level — no colors)
      figma.ui.postMessage({ type: 'status', message: 'Creating Font collection…' });
      const fontCount = await syncFontVariables(typographyData);

      figma.ui.postMessage({ type: 'status', message: 'Creating Spacing collection…' });
      const spacingCount = await syncSpacingVariables(spacingData);

      figma.ui.postMessage({ type: 'status', message: 'Creating Icon Size collection…' });
      const iconCount = await syncIconSizeVariables(spacingData);

      figma.ui.postMessage({ type: 'status', message: 'Creating Stroke Width collection…' });
      const strokeCount = await syncStrokeWidthVariables(spacingData);

      figma.ui.postMessage({ type: 'status', message: 'Creating Radius collection…' });
      const radiusCount = await syncRadiusVariables(radiiData);

      // 2. Figma Pages (visual reference sheets)
      figma.ui.postMessage({ type: 'status', message: 'Creating Colors page…' });
      await createColorsPage(colorsData, productConfig);

      figma.ui.postMessage({ type: 'status', message: 'Creating Semantics page…' });
      await createSemanticsPage(semanticTokens || []);

      figma.ui.postMessage({ type: 'status', message: 'Creating Typography page…' });
      await createTypographyPage(typographyData);

      figma.ui.postMessage({ type: 'status', message: 'Creating Spacing page…' });
      await createSpacingPage(spacingData, radiiData);

      const total = fontCount + spacingCount + iconCount + strokeCount + radiusCount;

      figma.ui.postMessage({
        type: 'complete',
        message: `Done! ${total} variables + 4 pages for ${productConfig.name}`,
        details: {
          font: fontCount,
          spacing: spacingCount,
          iconSize: iconCount,
          strokeWidth: strokeCount,
          radius: radiusCount,
          pages: 4
        }
      });

      figma.notify(`✅ Loom: ${total} variables + 4 pages synced for ${productConfig.name}`);

    } catch (err) {
      figma.ui.postMessage({ type: 'error', message: err.message || String(err) });
      figma.notify('❌ Token sync failed — see plugin for details', { error: true });
    }
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
