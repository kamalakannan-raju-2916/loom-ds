// Loom Design Tokens — Figma Plugin
// PRIMITIVES ONLY. Mirrors the DSG Color Tokens Generator skill exactly:
//   .github/skills/dsg-color-tokens-generator/SKILL.md
//
// Creates / updates:
//   - Primitives variable collection (Essentials/* + {Family}/Tint|Master|Shade/N)
//   - "Color Palette Comp" component (off-canvas at -500,-500)
//   - "Primitives" page with one HORIZONTAL row per family: [Master] [Tints & Shades wrap]

// ─── HELPERS ────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return {
    r: parseInt(hex.substring(0,2),16),
    g: parseInt(hex.substring(2,4),16),
    b: parseInt(hex.substring(4,6),16)
  };
}
function hexToFigma(hex) {
  var rgb = hexToRgb(hex);
  return { r: rgb.r/255, g: rgb.g/255, b: rgb.b/255 };
}
function relativeLuminance(r, g, b) {
  var v = [r, g, b].map(function(x) {
    x /= 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
function needsWhiteText(hex) {
  var rgb = hexToRgb(hex);
  var lum = relativeLuminance(rgb.r, rgb.g, rgb.b);
  var cWhite = 1.05 / (lum + 0.05);
  var cBlack = (lum + 0.05) / 0.05;
  if (cBlack >= 7) return false;
  if (cWhite >= 7) return true;
  return cWhite > cBlack;
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// Try SF Mono (skill spec) first; fall back to Inter on systems without it.
var FONT_FAMILY = 'SF Mono';
async function loadFonts() {
  var styles = ['Medium', 'Regular', 'Semibold'];
  try {
    for (var i = 0; i < styles.length; i++) {
      await figma.loadFontAsync({ family: 'SF Mono', style: styles[i] });
    }
    FONT_FAMILY = 'SF Mono';
    return;
  } catch (e) {
    // Fall through to Inter
  }
  // Inter doesn't have a true "Semibold" in the bundled set — map to Medium.
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
    FONT_FAMILY = 'Inter';
  } catch (e2) {
    FONT_FAMILY = 'Inter';
  }
}
function fontFor(role) {
  // role: 'family' (medium), 'position' (regular), 'hex' (semibold)
  if (FONT_FAMILY === 'SF Mono') {
    if (role === 'family') return { family: 'SF Mono', style: 'Medium' };
    if (role === 'position') return { family: 'SF Mono', style: 'Regular' };
    return { family: 'SF Mono', style: 'Semibold' };
  }
  if (role === 'family') return { family: 'Inter', style: 'Medium' };
  if (role === 'position') return { family: 'Inter', style: 'Regular' };
  // hex: try Semi Bold then fall back to Medium
  return { family: 'Inter', style: 'Semi Bold' };
}

// ─── BOOTSTRAP (skill Step 2 verbatim, ported to plugin sandbox) ────────────

async function bootstrap() {
  // 1. Find or create Primitives collection
  var collection = null;
  var allCollections = await figma.variables.getLocalVariableCollectionsAsync();
  for (var i = 0; i < allCollections.length; i++) {
    if (allCollections[i].name === 'Primitives') { collection = allCollections[i]; break; }
  }
  if (!collection) collection = figma.variables.createVariableCollection('Primitives');
  var modeId = collection.modes[0].modeId;

  // 2. Find or create Essentials variables
  async function findOrCreateColorVar(name, r, g, b, a) {
    for (var j = 0; j < collection.variableIds.length; j++) {
      var v = await figma.variables.getVariableByIdAsync(collection.variableIds[j]);
      if (v && v.name === name) return v;
    }
    var nv = figma.variables.createVariable(name, collection, 'COLOR');
    nv.setValueForMode(modeId, { r: r, g: g, b: b, a: a !== undefined ? a : 1 });
    return nv;
  }

  var whiteVar    = await findOrCreateColorVar('Essentials/White', 1, 1, 1);
  var blackVar    = await findOrCreateColorVar('Essentials/Black', 0, 0, 0);
  var halfVar     = await findOrCreateColorVar('Essentials/Half', 0.5, 0.5, 0.5);
  var blue1Var    = await findOrCreateColorVar('Essentials/Blue1', 0x00/255, 0x6A/255, 0xFF/255);
  var blue2Var    = await findOrCreateColorVar('Essentials/Blue2', 0x00/255, 0xA6/255, 0xFF/255);
  var purple1Var  = await findOrCreateColorVar('Essentials/Purple1', 0x66/255, 0x33/255, 0x99/255);
  var purple2Var  = await findOrCreateColorVar('Essentials/Purple2', 0xA3/255, 0x85/255, 0xC2/255);
  var overlay1Var = await findOrCreateColorVar('Essentials/Overlay1', 0, 0, 0, 0.5);
  var overlay2Var = await findOrCreateColorVar('Essentials/Overlay2', 0, 0, 0, 0.7);

  // 3. Find or create Color Palette Comp
  await loadFonts();
  var component = null;
  var localComponents = figma.root.findAll(function(n) {
    return n.type === 'COMPONENT' && n.name === 'Color Palette Comp';
  });
  if (localComponents.length > 0) component = localComponents[0];

  if (!component) {
    component = figma.createComponent();
    component.name = 'Color Palette Comp';
    component.resize(158, 141);
    component.layoutMode = 'VERTICAL';
    component.primaryAxisAlignItems = 'MIN';
    component.counterAxisAlignItems = 'MIN';
    component.itemSpacing = 0;
    component.paddingLeft = 16; component.paddingRight = 16;
    component.paddingTop = 16; component.paddingBottom = 16;
    var compFills = [figma.util.solidPaint('#FFFFFF')];
    compFills[0] = figma.variables.setBoundVariableForPaint(compFills[0], 'color', whiteVar);
    component.fills = compFills;

    // Color frame (84px tall, fill container width)
    var colorFrame = figma.createFrame();
    colorFrame.name = 'Color';
    colorFrame.layoutMode = 'VERTICAL';
    colorFrame.primaryAxisAlignItems = 'MIN';
    colorFrame.counterAxisAlignItems = 'MAX';
    colorFrame.itemSpacing = 0;
    colorFrame.paddingLeft = 10; colorFrame.paddingRight = 10;
    colorFrame.paddingTop = 10; colorFrame.paddingBottom = 10;
    colorFrame.resize(126, 84);
    colorFrame.cornerRadius = 8;
    var cfFills = [figma.util.solidPaint('#7F7F7F')];
    cfFills[0] = figma.variables.setBoundVariableForPaint(cfFills[0], 'color', halfVar);
    colorFrame.fills = cfFills;

    // Family Name text
    var familyText = figma.createText();
    familyText.fontName = fontFor('family');
    familyText.fontSize = 11;
    familyText.characters = 'Family Name';
    familyText.textAlignHorizontal = 'RIGHT';
    familyText.textAutoResize = 'HEIGHT';
    familyText.resize(75, familyText.height);
    var ftFills = [figma.util.solidPaint('#000000')];
    ftFills[0] = figma.variables.setBoundVariableForPaint(ftFills[0], 'color', blackVar);
    familyText.fills = ftFills;
    colorFrame.appendChild(familyText);
    familyText.layoutSizingHorizontal = 'FIXED';
    familyText.layoutSizingVertical = 'HUG';

    // Position text
    var posText = figma.createText();
    posText.fontName = fontFor('position');
    posText.fontSize = 12;
    posText.characters = 'Position';
    posText.textAlignHorizontal = 'RIGHT';
    posText.textAutoResize = 'WIDTH_AND_HEIGHT';
    var ptFills = [figma.util.solidPaint('#000000')];
    ptFills[0] = figma.variables.setBoundVariableForPaint(ptFills[0], 'color', blackVar);
    posText.fills = ptFills;
    colorFrame.appendChild(posText);
    posText.layoutSizingHorizontal = 'HUG';
    posText.layoutSizingVertical = 'HUG';

    component.appendChild(colorFrame);
    colorFrame.layoutSizingHorizontal = 'FILL';
    colorFrame.layoutSizingVertical = 'FIXED';

    // Hex Code Wrap frame
    var hexWrap = figma.createFrame();
    hexWrap.name = 'Hex Code Wrap';
    hexWrap.layoutMode = 'HORIZONTAL';
    hexWrap.primaryAxisAlignItems = 'CENTER';
    hexWrap.counterAxisAlignItems = 'CENTER';
    hexWrap.itemSpacing = 10;
    hexWrap.paddingTop = 8;
    hexWrap.paddingLeft = 0; hexWrap.paddingRight = 0; hexWrap.paddingBottom = 0;
    hexWrap.fills = [];

    var hexText = figma.createText();
    hexText.fontName = fontFor('hex');
    hexText.fontSize = 14;
    hexText.characters = 'Hex Code';
    hexText.textAutoResize = 'HEIGHT';
    hexText.resize(126, hexText.height);
    var htFills = [figma.util.solidPaint('#000000')];
    htFills[0] = figma.variables.setBoundVariableForPaint(htFills[0], 'color', blackVar);
    hexText.fills = htFills;
    hexWrap.appendChild(hexText);
    hexText.layoutSizingHorizontal = 'FILL';
    hexText.layoutSizingVertical = 'HUG';

    component.appendChild(hexWrap);
    hexWrap.layoutSizingHorizontal = 'FILL';
    hexWrap.layoutSizingVertical = 'HUG';

    component.addComponentProperty('Position', 'TEXT', 'Position');
    component.addComponentProperty('Hex Code', 'TEXT', 'Hex Code');
    component.addComponentProperty('Family Name', 'TEXT', 'Family Name');

    component.x = -500;
    component.y = -500;
  }

  // 4. Re-bind component fills only if not already correctly bound
  function isBoundTo(fills, varId) {
    return fills && fills.length > 0 && fills[0].boundVariables && fills[0].boundVariables.color && fills[0].boundVariables.color.id === varId;
  }
  function bindIfNeeded(node, targetVar) {
    if (!isBoundTo(node.fills, targetVar.id)) {
      var f = [].concat(node.fills);
      if (f.length > 0) {
        f[0] = figma.variables.setBoundVariableForPaint(f[0], 'color', targetVar);
        node.fills = f;
      }
    }
  }
  bindIfNeeded(component, whiteVar);
  var cf = component.children.find(function(c) { return c.name === 'Color'; });
  if (cf) {
    bindIfNeeded(cf, halfVar);
    var ft = cf.children.find(function(c) { return c.name === 'Family Name'; });
    if (ft) bindIfNeeded(ft, blackVar);
    var pt = cf.children.find(function(c) { return c.name === 'Position'; });
    if (pt) bindIfNeeded(pt, blackVar);
  }
  var hw = component.children.find(function(c) { return c.name === 'Hex Code Wrap'; });
  if (hw) {
    var ht = hw.children.find(function(c) { return c.name === 'Hex Code'; });
    if (ht) bindIfNeeded(ht, blackVar);
  }

  // 5. Discover component property keys (suffixed like Position#10:0)
  var propDefs = component.componentPropertyDefinitions;
  var positionPropKey = null, hexCodePropKey = null, familyNamePropKey = null;
  var keys = Object.keys(propDefs);
  for (var k = 0; k < keys.length; k++) {
    var baseName = keys[k].split('#')[0];
    if (baseName === 'Position') positionPropKey = keys[k];
    else if (baseName === 'Hex Code') hexCodePropKey = keys[k];
    else if (baseName === 'Family Name') familyNamePropKey = keys[k];
  }

  return {
    collection: collection,
    modeId: modeId,
    whiteVar: whiteVar,
    blackVar: blackVar,
    component: component,
    positionPropKey: positionPropKey,
    hexCodePropKey: hexCodePropKey,
    familyNamePropKey: familyNamePropKey
  };
}

// ─── PRIMITIVE VARIABLES ────────────────────────────────────────────────────

async function ensureFamilyVar(collection, modeId, existingNames, varName, hex) {
  if (existingNames[varName]) return existingNames[varName];
  var v = figma.variables.createVariable(varName, collection, 'COLOR');
  var c = hexToFigma(hex);
  v.setValueForMode(modeId, { r: c.r, g: c.g, b: c.b, a: 1 });
  existingNames[varName] = v;
  return v;
}

// JSON key (e.g. "t10", "s05", "base") → SKILL position display name (e.g. "Tint 10", "Shade 05", "Master")
function keyToPosition(key) {
  if (key === 'base') return 'Master';
  if (key.charAt(0) === 't') return 'Tint ' + key.substring(1);
  if (key.charAt(0) === 's') return 'Shade ' + key.substring(1);
  return key;
}
// Variable name segment for {Family}/X/N
function keyToVarPath(displayName, key) {
  if (key === 'base') return displayName + '/Master/Master';
  if (key.charAt(0) === 't') return displayName + '/Tint/' + key.substring(1);
  if (key.charAt(0) === 's') return displayName + '/Shade/' + key.substring(1);
  return displayName + '/' + key;
}

// ─── PRIMITIVES PAGE BUILDER ────────────────────────────────────────────────

function buildSwatchInstance(bs, component, position, hex, displayName, colorVar) {
  var inst = component.createInstance();
  inst.name = position;
  var props = {};
  props[bs.positionPropKey] = position;
  props[bs.hexCodePropKey] = hex.replace('#', '');
  props[bs.familyNamePropKey] = displayName;
  inst.setProperties(props);

  var colorFrame = inst.children.find(function(c) { return c.name === 'Color'; });
  if (colorFrame && colorVar) {
    var fills = [].concat(colorFrame.fills);
    fills[0] = figma.variables.setBoundVariableForPaint(fills[0], 'color', colorVar);
    colorFrame.fills = fills;
    var textVar = needsWhiteText(hex) ? bs.whiteVar : bs.blackVar;
    var ft = colorFrame.children.find(function(c) { return c.name === 'Family Name'; });
    if (ft) {
      var tf = [].concat(ft.fills);
      tf[0] = figma.variables.setBoundVariableForPaint(tf[0], 'color', textVar);
      ft.fills = tf;
    }
    var pt = colorFrame.children.find(function(c) { return c.name === 'Position'; });
    if (pt) {
      var pf = [].concat(pt.fills);
      pf[0] = figma.variables.setBoundVariableForPaint(pf[0], 'color', textVar);
      pt.fills = pf;
    }
  }
  return inst;
}

async function createPrimitivesPage(bs, colorsData, families) {
  // Find or create Primitives page; clear children
  var pageName = 'Primitives';
  var page = null;
  for (var pi = 0; pi < figma.root.children.length; pi++) {
    if (figma.root.children[pi].name === pageName) { page = figma.root.children[pi]; break; }
  }
  if (!page) { page = figma.createPage(); page.name = pageName; }
  var existing = [].concat(page.children);
  for (var ec = 0; ec < existing.length; ec++) existing[ec].remove();

  // Cache existing variable names in Primitives collection
  var existingVars = await figma.variables.getLocalVariablesAsync('COLOR');
  var existingNames = {};
  for (var ev = 0; ev < existingVars.length; ev++) {
    if (existingVars[ev].variableCollectionId === bs.collection.id) {
      existingNames[existingVars[ev].name] = existingVars[ev];
    }
  }

  var component = bs.component;
  var startY = 0;

  for (var fi = 0; fi < families.length; fi++) {
    var familyName = families[fi];
    var familyData = colorsData.primitive.color[familyName];
    if (!familyData) continue;

    var displayName = capitalize(familyName);
    var isGrey = (familyName === 'grey');
    var hasMaster = !isGrey && !!familyData.base;
    var tsWidth = isGrey ? 1896 : 1580;

    // Collect & sort tints (descending by num so 100→…→00) and shades (ascending)
    var tintKeys = [];
    var shadeKeys = [];
    var allKeys = Object.keys(familyData);
    for (var ai = 0; ai < allKeys.length; ai++) {
      var k = allKeys[ai];
      if (!familyData[k] || !familyData[k].$value) continue;
      if (k.charAt(0) === 't') tintKeys.push(k);
      else if (k.charAt(0) === 's') shadeKeys.push(k);
    }
    tintKeys.sort(function(a, b) { return parseInt(b.substring(1), 10) - parseInt(a.substring(1), 10); });
    shadeKeys.sort(function(a, b) { return parseInt(a.substring(1), 10) - parseInt(b.substring(1), 10); });

    // Build mainFrame (HORIZONTAL, gap 40, HUG x HUG) and tsFrame (HORIZONTAL WRAP, FIXED width, HUG height)
    var mainFrame = figma.createFrame();
    mainFrame.name = displayName;
    mainFrame.layoutMode = 'HORIZONTAL';
    mainFrame.primaryAxisAlignItems = 'MIN';
    mainFrame.counterAxisAlignItems = 'MIN';
    mainFrame.itemSpacing = 40;
    mainFrame.fills = [];
    mainFrame.x = 0;
    mainFrame.y = startY;
    page.appendChild(mainFrame);
    mainFrame.layoutSizingHorizontal = 'HUG';
    mainFrame.layoutSizingVertical = 'HUG';

    var tsFrame = figma.createFrame();
    tsFrame.name = 'Tints & Shades';
    tsFrame.layoutMode = 'HORIZONTAL';
    tsFrame.layoutWrap = 'WRAP';
    tsFrame.primaryAxisAlignItems = 'MIN';
    tsFrame.counterAxisAlignItems = 'MIN';
    tsFrame.itemSpacing = 0;
    tsFrame.counterAxisSpacing = 0;
    tsFrame.resize(tsWidth, 10);
    tsFrame.fills = [];

    // 1. Tints first (lightest → closest to master)
    for (var ti = 0; ti < tintKeys.length; ti++) {
      var tk = tintKeys[ti];
      var tHex = familyData[tk].$value;
      var tVar = await ensureFamilyVar(bs.collection, bs.modeId, existingNames, keyToVarPath(displayName, tk), tHex);
      var tInst = buildSwatchInstance(bs, component, keyToPosition(tk), tHex, displayName, tVar);
      tsFrame.appendChild(tInst);
    }

    // 2. Master into mainFrame
    if (hasMaster) {
      var mHex = familyData.base.$value;
      var mVar = await ensureFamilyVar(bs.collection, bs.modeId, existingNames, keyToVarPath(displayName, 'base'), mHex);
      var mInst = buildSwatchInstance(bs, component, 'Master', mHex, displayName, mVar);
      mainFrame.appendChild(mInst);
    }

    // 3. Shades (closest to master → darkest)
    for (var si = 0; si < shadeKeys.length; si++) {
      var sk = shadeKeys[si];
      var sHex = familyData[sk].$value;
      var sVar = await ensureFamilyVar(bs.collection, bs.modeId, existingNames, keyToVarPath(displayName, sk), sHex);
      var sInst = buildSwatchInstance(bs, component, keyToPosition(sk), sHex, displayName, sVar);
      tsFrame.appendChild(sInst);
    }

    // 4. tsFrame appended last → mainFrame layout becomes [Master][Tints & Shades]
    mainFrame.appendChild(tsFrame);
    tsFrame.layoutSizingHorizontal = 'FIXED';
    tsFrame.layoutSizingVertical = 'HUG';

    // Advance Y by mainFrame height + 40 gap (mainFrame has hugged content now)
    startY += mainFrame.height + 40;
  }

  // Switch view to Primitives page so the user sees output
  await figma.setCurrentPageAsync(page);
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

figma.showUI(__html__, { width: 420, height: 480, themeColors: true });

figma.ui.onmessage = async function(msg) {
  if (msg.type === 'sync-tokens') {
    var productConfig = msg.productConfig;
    var colorsData = msg.colorsData;
    try {
      figma.ui.postMessage({ type: 'status', message: 'Bootstrapping Primitives collection…' });
      var bs = await bootstrap();

      figma.ui.postMessage({ type: 'status', message: 'Building Primitives page…' });
      await createPrimitivesPage(bs, colorsData, productConfig.colorFamilies);

      figma.ui.postMessage({
        type: 'complete',
        message: 'Done! Primitives synced for ' + productConfig.name + ' (' + productConfig.colorFamilies.length + ' families)'
      });
      figma.notify('✅ Loom: Primitives synced for ' + productConfig.name);
    } catch (err) {
      figma.ui.postMessage({ type: 'error', message: err.message || String(err) });
      figma.notify('❌ Token sync failed — see plugin for details', { error: true });
    }
  }
  if (msg.type === 'cancel') figma.closePlugin();
};
