// Loom Design Tokens - Figma Plugin (Primitives only)
// Mirrors the DSG Color Tokens Generator skill:
//   .github/skills/dsg-color-tokens-generator/SKILL.md

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

// ─── FONTS ──────────────────────────────────────────────────────────────────
// Loom standard: Zoho Puvi family. Fall back gracefully if not installed.

var FONT_PUVI = 'Zoho Puvi';
var FONT_PUVI_MONO = 'Zoho Puvi Mono';
var FONT_INSTALL_URL = 'https://github.com/kamalakannan-raju-2916/loom-ds#fonts--zoho-puvi-proprietary';

async function tryLoad(family, style) {
  try { await figma.loadFontAsync({ family: family, style: style }); return true; }
  catch (e) { return false; }
}

// Required font set - plugin refuses to run if any of these are missing.
async function loadFonts() {
  var required = [
    { family: FONT_PUVI,      style: 'Semibold' },
    { family: FONT_PUVI,      style: 'Medium' },
    { family: FONT_PUVI,      style: 'Regular' },
    { family: FONT_PUVI_MONO, style: 'Regular' }
  ];
  var missing = [];
  for (var i = 0; i < required.length; i++) {
    var ok = await tryLoad(required[i].family, required[i].style);
    if (!ok) missing.push(required[i].family + ' ' + required[i].style);
  }
  if (missing.length > 0) {
    var err = new Error(
      'Zoho Puvi fonts are required but not installed in Figma.\n\n' +
      'Missing: ' + missing.join(', ') + '\n\n' +
      'Download and install all .otf files from:\n' + FONT_INSTALL_URL + '\n\n' +
      'Then restart Figma and re-run the plugin.'
    );
    err.fontInstallRequired = true;
    throw err;
  }
}

function fontHex()      { return { family: FONT_PUVI,      style: 'Semibold' }; }
function fontFamily()   { return { family: FONT_PUVI_MONO, style: 'Regular' };  }
function fontPosition() { return { family: FONT_PUVI_MONO, style: 'Regular' };  }

// ─── BOOTSTRAP ──────────────────────────────────────────────────────────────

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

  // If an existing component was made with the old fonts/alignment, scrap it and rebuild.
  // This guarantees a clean Zoho Puvi build without needing to reload legacy fonts.
  if (component) {
    // Detach all instances of the old component first, then remove it.
    try {
      var oldInstances = figma.root.findAll(function(n) {
        return n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.id === component.id;
      });
      for (var oi = 0; oi < oldInstances.length; oi++) oldInstances[oi].remove();
    } catch (e) { /* best effort */ }
    component.remove();
    component = null;
  }

  // Property keys (either freshly created or rediscovered from existing component)
  var positionPropKey = null, hexCodePropKey = null, familyNamePropKey = null;

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

    // -- Color frame (84px tall, fill container width) --
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

    // -- Family Name text - Zoho Puvi Mono 11pt --
    var familyText = figma.createText();
    familyText.name = 'Family Name';
    familyText.fontName = fontFamily();
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

    // -- Position text - Zoho Puvi Mono 12pt --
    var posText = figma.createText();
    posText.name = 'Position';
    posText.fontName = fontPosition();
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

    // -- Hex Code Wrap frame --
    var hexWrap = figma.createFrame();
    hexWrap.name = 'Hex Code Wrap';
    hexWrap.layoutMode = 'HORIZONTAL';
    hexWrap.primaryAxisAlignItems = 'MIN';
    hexWrap.counterAxisAlignItems = 'CENTER';
    hexWrap.itemSpacing = 10;
    hexWrap.paddingTop = 8;
    hexWrap.paddingLeft = 0; hexWrap.paddingRight = 0; hexWrap.paddingBottom = 0;
    hexWrap.fills = [];

    // -- Hex Code text - Zoho Puvi Semibold 14pt, left-aligned --
    var hexText = figma.createText();
    hexText.name = 'Hex Code';
    hexText.fontName = fontHex();
    hexText.fontSize = 14;
    hexText.characters = 'Hex Code';
    hexText.textAlignHorizontal = 'LEFT';
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

    // -- Component properties (capture generated keys) --
    positionPropKey    = component.addComponentProperty('Position', 'TEXT', 'Position');
    hexCodePropKey     = component.addComponentProperty('Hex Code', 'TEXT', 'Hex Code');
    familyNamePropKey  = component.addComponentProperty('Family Name', 'TEXT', 'Family Name');

    // -- Bind text nodes' .characters to their respective properties --
    posText.componentPropertyReferences   = { characters: positionPropKey };
    hexText.componentPropertyReferences   = { characters: hexCodePropKey };
    familyText.componentPropertyReferences = { characters: familyNamePropKey };
  } else {
    // Existing component: rediscover keys + force-refresh fonts, alignment, and prop references
    var propDefs = component.componentPropertyDefinitions;
    var keys = Object.keys(propDefs);
    for (var k = 0; k < keys.length; k++) {
      var baseName = keys[k].split('#')[0];
      if (baseName === 'Position') positionPropKey = keys[k];
      else if (baseName === 'Hex Code') hexCodePropKey = keys[k];
      else if (baseName === 'Family Name') familyNamePropKey = keys[k];
    }
    var cf = component.children.find(function(c) { return c.name === 'Color'; });
    if (cf) {
      var familyTextNode = null, posTextNode = null;
      for (var ci = 0; ci < cf.children.length; ci++) {
        var ch = cf.children[ci];
        if (ch.type !== 'TEXT') continue;
        if (ch.fontSize === 11 || ch.name === 'Family Name') familyTextNode = ch;
        else if (ch.fontSize === 12 || ch.name === 'Position') posTextNode = ch;
      }
      if (familyTextNode) {
        familyTextNode.fontName = fontFamily();
        familyTextNode.fontSize = 11;
        familyTextNode.textAlignHorizontal = 'RIGHT';
        if (familyNamePropKey) familyTextNode.componentPropertyReferences = { characters: familyNamePropKey };
      }
      if (posTextNode) {
        posTextNode.fontName = fontPosition();
        posTextNode.fontSize = 12;
        posTextNode.textAlignHorizontal = 'RIGHT';
        if (positionPropKey) posTextNode.componentPropertyReferences = { characters: positionPropKey };
      }
    }
    var hw = component.children.find(function(c) { return c.name === 'Hex Code Wrap'; });
    if (hw) {
      hw.primaryAxisAlignItems = 'MIN';
      var ht = hw.children.find(function(c) { return c.type === 'TEXT'; });
      if (ht) {
        ht.fontName = fontHex();
        ht.fontSize = 14;
        ht.textAlignHorizontal = 'LEFT';
        if (hexCodePropKey) ht.componentPropertyReferences = { characters: hexCodePropKey };
      }
    }
  }

  // 4. Re-bind base fills (idempotent)
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
  var cfNode = component.children.find(function(c) { return c.name === 'Color'; });
  if (cfNode) {
    bindIfNeeded(cfNode, halfVar);
    for (var ci = 0; ci < cfNode.children.length; ci++) {
      var child = cfNode.children[ci];
      if (child.type === 'TEXT') bindIfNeeded(child, blackVar);
    }
  }
  var hwNode = component.children.find(function(c) { return c.name === 'Hex Code Wrap'; });
  if (hwNode) {
    var htNode = hwNode.children.find(function(c) { return c.type === 'TEXT'; });
    if (htNode) bindIfNeeded(htNode, blackVar);
  }

  return {
    collection: collection,
    modeId: modeId,
    whiteVar: whiteVar,
    blackVar: blackVar,
    halfVar: halfVar,
    blue1Var: blue1Var,
    blue2Var: blue2Var,
    purple1Var: purple1Var,
    purple2Var: purple2Var,
    overlay1Var: overlay1Var,
    overlay2Var: overlay2Var,
    component: component,
    positionPropKey: positionPropKey,
    hexCodePropKey: hexCodePropKey,
    familyNamePropKey: familyNamePropKey
  };
}

// ─── PRIMITIVE VARIABLES ────────────────────────────────────────────────────

function ensureFamilyVar(collection, modeId, existingNames, varName, hex) {
  if (existingNames[varName]) return existingNames[varName];
  var v = figma.variables.createVariable(varName, collection, 'COLOR');
  var c = hexToFigma(hex);
  v.setValueForMode(modeId, { r: c.r, g: c.g, b: c.b, a: 1 });
  existingNames[varName] = v;
  return v;
}

// JSON key (e.g. "t10", "s05", "base") → SKILL position display name
function keyToPosition(key) {
  if (key === 'base') return 'Master';
  if (key.charAt(0) === 't') return 'Tint ' + key.substring(1);
  if (key.charAt(0) === 's') return 'Shade ' + key.substring(1);
  return key;
}
function keyToVarPath(displayName, key) {
  if (key === 'base') return displayName + '/Master/Master';
  if (key.charAt(0) === 't') return displayName + '/Tint/' + key.substring(1);
  if (key.charAt(0) === 's') return displayName + '/Shade/' + key.substring(1);
  return displayName + '/' + key;
}

// ─── INSTANCE BUILDER ───────────────────────────────────────────────────────

function buildSwatchInstance(bs, position, hex, displayName, colorVar) {
  var inst = bs.component.createInstance();
  inst.name = position;

  // Set component property text values
  var props = {};
  if (bs.positionPropKey)   props[bs.positionPropKey]   = position;
  if (bs.hexCodePropKey)    props[bs.hexCodePropKey]    = hex.replace('#', '').toUpperCase();
  if (bs.familyNamePropKey) props[bs.familyNamePropKey] = displayName;
  inst.setProperties(props);

  // Bind fill on the Color frame to the variable, and choose AAA-contrast text var
  var colorFrame = inst.children.find(function(c) { return c.name === 'Color'; });
  if (colorFrame && colorVar) {
    var fills = [].concat(colorFrame.fills);
    fills[0] = figma.variables.setBoundVariableForPaint(fills[0], 'color', colorVar);
    colorFrame.fills = fills;
    var textVar = needsWhiteText(hex) ? bs.whiteVar : bs.blackVar;
    for (var i = 0; i < colorFrame.children.length; i++) {
      var t = colorFrame.children[i];
      if (t.type !== 'TEXT') continue;
      var tf = [].concat(t.fills);
      tf[0] = figma.variables.setBoundVariableForPaint(tf[0], 'color', textVar);
      t.fills = tf;
    }
  }
  return inst;
}

// ─── ESSENTIALS DEFINITION ──────────────────────────────────────────────────

function essentialsList(bs) {
  return [
    { position: 'White',    hex: '#FFFFFF', variable: bs.whiteVar },
    { position: 'Black',    hex: '#000000', variable: bs.blackVar },
    { position: 'Half',     hex: '#7F7F7F', variable: bs.halfVar },
    { position: 'Blue1',    hex: '#006AFF', variable: bs.blue1Var },
    { position: 'Blue2',    hex: '#00A6FF', variable: bs.blue2Var },
    { position: 'Purple1',  hex: '#663399', variable: bs.purple1Var },
    { position: 'Purple2',  hex: '#A385C2', variable: bs.purple2Var },
    { position: 'Overlay1', hex: '#000000', variable: bs.overlay1Var },
    { position: 'Overlay2', hex: '#000000', variable: bs.overlay2Var }
  ];
}

// ─── PRIMITIVES PAGE BUILDER ────────────────────────────────────────────────

async function createPrimitivesPage(bs, colorsData, families) {
  // Find or create Primitives page; clear children
  var pageName = 'Primitives';
  var page = null;
  for (var pi = 0; pi < figma.root.children.length; pi++) {
    if (figma.root.children[pi].name === pageName) { page = figma.root.children[pi]; break; }
  }
  if (!page) { page = figma.createPage(); page.name = pageName; }
  // Make Primitives the active page so subsequent createInstance() lands here too
  await figma.setCurrentPageAsync(page);

  var existing = [].concat(page.children);
  for (var ec = 0; ec < existing.length; ec++) existing[ec].remove();

  // Move the Color Palette Comp onto this page (off-canvas)
  page.appendChild(bs.component);
  bs.component.x = -500;
  bs.component.y = -500;

  // Cache existing variable names in Primitives collection
  var existingVars = await figma.variables.getLocalVariablesAsync('COLOR');
  var existingNames = {};
  for (var ev = 0; ev < existingVars.length; ev++) {
    if (existingVars[ev].variableCollectionId === bs.collection.id) {
      existingNames[existingVars[ev].name] = existingVars[ev];
    }
  }

  var startY = 0;

  // ── Essentials row (first) ─────────────────────────────────────────────
  var essFrame = figma.createFrame();
  essFrame.name = 'Essentials';
  essFrame.layoutMode = 'HORIZONTAL';
  essFrame.layoutWrap = 'WRAP';
  essFrame.primaryAxisAlignItems = 'MIN';
  essFrame.counterAxisAlignItems = 'MIN';
  essFrame.itemSpacing = 0;
  essFrame.counterAxisSpacing = 0;
  essFrame.resize(1580, 10);
  essFrame.fills = [];
  essFrame.x = 0;
  essFrame.y = startY;
  page.appendChild(essFrame);

  var ess = essentialsList(bs);
  for (var ei = 0; ei < ess.length; ei++) {
    var e = ess[ei];
    var inst = buildSwatchInstance(bs, e.position, e.hex, 'Essentials', e.variable);
    essFrame.appendChild(inst);
  }
  essFrame.layoutSizingHorizontal = 'FIXED';
  essFrame.layoutSizingVertical = 'HUG';
  startY += essFrame.height + 40;

  // ── Family rows ────────────────────────────────────────────────────────
  for (var fi = 0; fi < families.length; fi++) {
    var familyName = families[fi];
    var familyData = colorsData.primitive.color[familyName];
    if (!familyData) continue;

    var displayName = capitalize(familyName);
    var isGrey = (familyName === 'grey');
    var hasMaster = !isGrey && !!familyData.base;
    var tsWidth = isGrey ? 1896 : 1580;

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

    // 1. Tints (lightest → closest to master)
    for (var ti = 0; ti < tintKeys.length; ti++) {
      var tk = tintKeys[ti];
      var tHex = familyData[tk].$value;
      var tVar = ensureFamilyVar(bs.collection, bs.modeId, existingNames, keyToVarPath(displayName, tk), tHex);
      tsFrame.appendChild(buildSwatchInstance(bs, keyToPosition(tk), tHex, displayName, tVar));
    }

    // 2. Master into mainFrame
    if (hasMaster) {
      var mHex = familyData.base.$value;
      var mVar = ensureFamilyVar(bs.collection, bs.modeId, existingNames, keyToVarPath(displayName, 'base'), mHex);
      mainFrame.appendChild(buildSwatchInstance(bs, 'Master', mHex, displayName, mVar));
    }

    // 3. Shades (closest to master → darkest)
    for (var si = 0; si < shadeKeys.length; si++) {
      var sk = shadeKeys[si];
      var sHex = familyData[sk].$value;
      var sVar = ensureFamilyVar(bs.collection, bs.modeId, existingNames, keyToVarPath(displayName, sk), sHex);
      tsFrame.appendChild(buildSwatchInstance(bs, keyToPosition(sk), sHex, displayName, sVar));
    }

    mainFrame.appendChild(tsFrame);
    tsFrame.layoutSizingHorizontal = 'FIXED';
    tsFrame.layoutSizingVertical = 'HUG';

    startY += mainFrame.height + 40;
  }
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
        message: 'Done! Primitives synced for ' + productConfig.name + ' (' + productConfig.colorFamilies.length + ' families + Essentials)'
      });
      figma.notify('✅ Loom: Primitives synced for ' + productConfig.name);
    } catch (err) {
      var msg = err && err.message ? err.message : String(err);
      figma.ui.postMessage({ type: 'error', message: msg, fontInstallRequired: !!(err && err.fontInstallRequired) });
      var notice = err && err.fontInstallRequired
        ? '❌ Loom: Zoho Puvi fonts not installed - see plugin panel'
        : '❌ Token sync failed - see plugin for details';
      figma.notify(notice, { error: true });
    }
  }
  if (msg.type === 'cancel') figma.closePlugin();
};
