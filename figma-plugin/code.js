// Loom Design Tokens — Figma Plugin v3
// Creates Primitives (colors) + Semantic (light/dark aliases) + Font/Spacing/Icon/Stroke/Radius
// Each page uses variable bindings on elements (fills, corner radius, width, fontSize, etc.)

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return { r: parseInt(hex.substring(0,2),16), g: parseInt(hex.substring(2,4),16), b: parseInt(hex.substring(4,6),16) };
}

function hexToFigma(hex) {
  var rgb = hexToRgb(hex);
  return { r: rgb.r/255, g: rgb.g/255, b: rgb.b/255 };
}

function relativeLuminance(r, g, b) {
  var vals = [r, g, b].map(function(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
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

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function pxToNumber(val) {
  if (typeof val === 'number') return val;
  return parseFloat(String(val).replace('px', ''));
}

function remToNumber(val) {
  if (typeof val === 'number') return val;
  var str = String(val);
  if (str.endsWith('rem')) return parseFloat(str) * 16;
  if (str.endsWith('px')) return parseFloat(str);
  return parseFloat(str);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOOTSTRAP — Primitives Collection, Essentials Variables, Color Palette Comp
// Same pattern as DSG Color Tokens Generator Skill
// ═══════════════════════════════════════════════════════════════════════════════

async function bootstrap() {
  // 1. Find or create Primitives collection
  var collection = null;
  var allCollections = await figma.variables.getLocalVariableCollectionsAsync();
  for (var i = 0; i < allCollections.length; i++) {
    if (allCollections[i].name === 'Primitives') { collection = allCollections[i]; break; }
  }
  if (!collection) {
    collection = figma.variables.createVariableCollection('Primitives');
  }
  var modeId = collection.modes[0].modeId;

  // 2. Find or create Essentials variables
  async function findOrCreateColorVar(name, r, g, b, a) {
    for (var j = 0; j < collection.variableIds.length; j++) {
      var v = await figma.variables.getVariableByIdAsync(collection.variableIds[j]);
      if (v && v.name === name) return v;
    }
    var newV = figma.variables.createVariable(name, collection, 'COLOR');
    newV.setValueForMode(modeId, { r: r, g: g, b: b, a: a !== undefined ? a : 1 });
    return newV;
  }

  var whiteVar = await findOrCreateColorVar('Essentials/White', 1, 1, 1);
  var blackVar = await findOrCreateColorVar('Essentials/Black', 0, 0, 0);
  var halfVar = await findOrCreateColorVar('Essentials/Half', 0.5, 0.5, 0.5);
  var blue1Var = await findOrCreateColorVar('Essentials/Blue1', 0x00/255, 0x6A/255, 0xFF/255);
  var blue2Var = await findOrCreateColorVar('Essentials/Blue2', 0x00/255, 0xA6/255, 0xFF/255);
  var purple1Var = await findOrCreateColorVar('Essentials/Purple1', 0x66/255, 0x33/255, 0x99/255);
  var purple2Var = await findOrCreateColorVar('Essentials/Purple2', 0xA3/255, 0x85/255, 0xC2/255);
  var overlay1Var = await findOrCreateColorVar('Essentials/Overlay1', 0, 0, 0, 0.5);
  var overlay2Var = await findOrCreateColorVar('Essentials/Overlay2', 0, 0, 0, 0.7);

  // 3. Find or create Color Palette Comp
  var component = null;
  var localComponents = figma.root.findAll(function(n) { return n.type === 'COMPONENT' && n.name === 'Color Palette Comp'; });
  if (localComponents.length > 0) {
    component = localComponents[0];
  }

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

    // Color frame
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
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

    var familyText = figma.createText();
    familyText.name = 'Family Name';
    familyText.fontName = { family: 'Inter', style: 'Medium' };
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
    posText.name = 'Position';
    posText.fontName = { family: 'Inter', style: 'Regular' };
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

    // Hex Code Wrap
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
    hexText.name = 'Hex Code';
    hexText.fontName = { family: 'Inter', style: 'Bold' };
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

  // 4. Discover property keys
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

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVE COLOR VARIABLES + PRIMITIVES PAGE
// ═══════════════════════════════════════════════════════════════════════════════

async function createPrimitiveColorVars(bs, colorsData, families) {
  var varMap = {}; // maps reference path → variable object
  var collection = bs.collection;
  var modeId = bs.modeId;

  // Map essentials to varMap
  varMap['white'] = bs.whiteVar;
  varMap['black'] = bs.blackVar;
  varMap['half'] = bs.halfVar;
  varMap['blue1'] = bs.blue1Var;
  varMap['blue2'] = bs.blue2Var;
  varMap['purple1'] = bs.purple1Var;
  varMap['purple2'] = bs.purple2Var;
  varMap['overlay1'] = bs.overlay1Var;
  varMap['overlay2'] = bs.overlay2Var;

  // Check existing variables to avoid duplicates
  var existingVars = await figma.variables.getLocalVariablesAsync('COLOR');
  var existingNames = {};
  for (var e = 0; e < existingVars.length; e++) {
    if (existingVars[e].variableCollectionId === collection.id) {
      existingNames[existingVars[e].name] = existingVars[e];
    }
  }

  function findOrCreate(varName, hex) {
    if (existingNames[varName]) {
      var existing = existingNames[varName];
      return existing;
    }
    var v = figma.variables.createVariable(varName, collection, 'COLOR');
    var fCol = hexToFigma(hex);
    v.setValueForMode(modeId, { r: fCol.r, g: fCol.g, b: fCol.b, a: 1 });
    existingNames[varName] = v;
    return v;
  }

  for (var fi = 0; fi < families.length; fi++) {
    var familyName = families[fi];
    var familyData = colorsData.primitive.color[familyName];
    if (!familyData) continue;

    var displayName = capitalize(familyName);
    var isGrey = (familyName === 'grey');

    // Get all keys sorted
    var familyKeys = Object.keys(familyData);

    for (var ki = 0; ki < familyKeys.length; ki++) {
      var key = familyKeys[ki];
      var token = familyData[key];
      if (!token || !token.$value) continue;
      var hex = token.$value;

      var varName;
      if (key === 'base') {
        varName = displayName + '/Master/Master';
        varMap[familyName + '.base'] = findOrCreate(varName, hex);
      } else if (key.startsWith('t')) {
        var tNum = key.substring(1);
        varName = displayName + '/Tint/' + tNum;
        varMap[familyName + '.' + key] = findOrCreate(varName, hex);
      } else if (key.startsWith('s')) {
        var sNum = key.substring(1);
        varName = displayName + '/Shade/' + sNum;
        varMap[familyName + '.' + key] = findOrCreate(varName, hex);
      }
    }
  }

  return varMap;
}

async function createPrimitivesPage(bs, colorsData, families, varMap) {
  // Find or create page
  var pageName = 'Primitives';
  var page = null;
  var pages = figma.root.children;
  for (var pi = 0; pi < pages.length; pi++) {
    if (pages[pi].name === pageName) { page = pages[pi]; break; }
  }
  if (!page) {
    page = figma.createPage();
    page.name = pageName;
  }

  // Clear existing content
  var children = [].concat(page.children);
  for (var ci = 0; ci < children.length; ci++) children[ci].remove();

  var component = bs.component;
  var startY = 0;

  for (var fi = 0; fi < families.length; fi++) {
    var familyName = families[fi];
    var familyData = colorsData.primitive.color[familyName];
    if (!familyData) continue;

    var displayName = capitalize(familyName);
    var isGrey = (familyName === 'grey');
    var hasMaster = !isGrey && familyData.base;

    // Main frame for this family
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

    // Tints & Shades frame
    var tsFrame = figma.createFrame();
    tsFrame.name = 'Tints & Shades';
    tsFrame.layoutMode = 'HORIZONTAL';
    tsFrame.layoutWrap = 'WRAP';
    tsFrame.primaryAxisAlignItems = 'MIN';
    tsFrame.counterAxisAlignItems = 'MIN';
    tsFrame.itemSpacing = 0;
    tsFrame.counterAxisSpacing = 0;
    var tsWidth = isGrey ? 1896 : 1580;
    tsFrame.resize(tsWidth, 10);
    tsFrame.fills = [];

    // Collect tint keys (sorted descending: t100, t90, ..., t10 or t05, t00)
    var tintKeys = [];
    var shadeKeys = [];
    var allKeys = Object.keys(familyData);
    for (var ai = 0; ai < allKeys.length; ai++) {
      var k = allKeys[ai];
      if (k.startsWith('t') && familyData[k] && familyData[k].$value) tintKeys.push(k);
      if (k.startsWith('s') && familyData[k] && familyData[k].$value) shadeKeys.push(k);
    }
    // Sort tints descending (t100 first)
    tintKeys.sort(function(a, b) { return parseInt(b.substring(1)) - parseInt(a.substring(1)); });
    // Sort shades ascending (s10 first)
    shadeKeys.sort(function(a, b) { return parseInt(a.substring(1)) - parseInt(b.substring(1)); });

    // Create tint instances (lightest → closest to master)
    for (var ti = 0; ti < tintKeys.length; ti++) {
      var tKey = tintKeys[ti];
      var tHex = familyData[tKey].$value;
      var tNum = tKey.substring(1);
      var tPosition = 'Tint ' + tNum;
      var tVarName = displayName + '/Tint/' + tNum;
      var tVar = varMap[familyName + '.' + tKey];
      var tInst = component.createInstance();
      tInst.name = tPosition;
      var tProps = {};
      tProps[bs.positionPropKey] = tPosition;
      tProps[bs.hexCodePropKey] = tHex.replace('#', '');
      tProps[bs.familyNamePropKey] = displayName;
      tInst.setProperties(tProps);
      // Bind Color frame fill
      var tColorFrame = tInst.children.find(function(c) { return c.name === 'Color'; });
      if (tColorFrame && tVar) {
        var tcf = [].concat(tColorFrame.fills);
        tcf[0] = figma.variables.setBoundVariableForPaint(tcf[0], 'color', tVar);
        tColorFrame.fills = tcf;
        // Text contrast
        var tTextVar = needsWhiteText(tHex) ? bs.whiteVar : bs.blackVar;
        var tFamilyText = tColorFrame.children.find(function(c) { return c.name === 'Family Name'; });
        var tPosText = tColorFrame.children.find(function(c) { return c.name === 'Position'; });
        if (tFamilyText) {
          var tf1 = [].concat(tFamilyText.fills);
          tf1[0] = figma.variables.setBoundVariableForPaint(tf1[0], 'color', tTextVar);
          tFamilyText.fills = tf1;
        }
        if (tPosText) {
          var tf2 = [].concat(tPosText.fills);
          tf2[0] = figma.variables.setBoundVariableForPaint(tf2[0], 'color', tTextVar);
          tPosText.fills = tf2;
        }
      }
      tsFrame.appendChild(tInst);
    }

    // Create master instance
    if (hasMaster) {
      var mHex = familyData.base.$value;
      var mVar = varMap[familyName + '.base'];
      var masterInst = component.createInstance();
      masterInst.name = 'Master';
      var mProps = {};
      mProps[bs.positionPropKey] = 'Master';
      mProps[bs.hexCodePropKey] = mHex.replace('#', '');
      mProps[bs.familyNamePropKey] = displayName;
      masterInst.setProperties(mProps);
      var mColorFrame = masterInst.children.find(function(c) { return c.name === 'Color'; });
      if (mColorFrame && mVar) {
        var mcf = [].concat(mColorFrame.fills);
        mcf[0] = figma.variables.setBoundVariableForPaint(mcf[0], 'color', mVar);
        mColorFrame.fills = mcf;
        var mTextVar = needsWhiteText(mHex) ? bs.whiteVar : bs.blackVar;
        var mFT = mColorFrame.children.find(function(c) { return c.name === 'Family Name'; });
        var mPT = mColorFrame.children.find(function(c) { return c.name === 'Position'; });
        if (mFT) { var mf1 = [].concat(mFT.fills); mf1[0] = figma.variables.setBoundVariableForPaint(mf1[0], 'color', mTextVar); mFT.fills = mf1; }
        if (mPT) { var mf2 = [].concat(mPT.fills); mf2[0] = figma.variables.setBoundVariableForPaint(mf2[0], 'color', mTextVar); mPT.fills = mf2; }
      }
      mainFrame.appendChild(masterInst);
    }

    // Create shade instances (closest to master → darkest)
    for (var si = 0; si < shadeKeys.length; si++) {
      var sKey = shadeKeys[si];
      var sHex = familyData[sKey].$value;
      var sNum = sKey.substring(1);
      var sPosition = 'Shade ' + sNum;
      var sVar = varMap[familyName + '.' + sKey];
      var sInst = component.createInstance();
      sInst.name = sPosition;
      var sProps = {};
      sProps[bs.positionPropKey] = sPosition;
      sProps[bs.hexCodePropKey] = sHex.replace('#', '');
      sProps[bs.familyNamePropKey] = displayName;
      sInst.setProperties(sProps);
      var sColorFrame = sInst.children.find(function(c) { return c.name === 'Color'; });
      if (sColorFrame && sVar) {
        var scf = [].concat(sColorFrame.fills);
        scf[0] = figma.variables.setBoundVariableForPaint(scf[0], 'color', sVar);
        sColorFrame.fills = scf;
        var sTextVar = needsWhiteText(sHex) ? bs.whiteVar : bs.blackVar;
        var sFT = sColorFrame.children.find(function(c) { return c.name === 'Family Name'; });
        var sPT = sColorFrame.children.find(function(c) { return c.name === 'Position'; });
        if (sFT) { var sf1 = [].concat(sFT.fills); sf1[0] = figma.variables.setBoundVariableForPaint(sf1[0], 'color', sTextVar); sFT.fills = sf1; }
        if (sPT) { var sf2 = [].concat(sPT.fills); sf2[0] = figma.variables.setBoundVariableForPaint(sf2[0], 'color', sTextVar); sPT.fills = sf2; }
      }
      tsFrame.appendChild(sInst);
    }

    mainFrame.appendChild(tsFrame);

    // Calculate next Y position
    startY += 200 + (isGrey ? 141 : 0) + 40;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC VARIABLES + SEMANTICS PAGE
// ═══════════════════════════════════════════════════════════════════════════════

function resolveRefToVarMapKey(ref) {
  // {primitive.color.grey.s90} → grey.s90
  // {primitive.color.white} → white
  // {primitive.color.cobalt.base} → cobalt.base
  // {primitive.color.overlay1} → overlay1
  var match = ref.match(/\{primitive\.color\.(.+)\}/);
  if (!match) return null;
  return match[1];
}

async function createSemanticVarsAndPage(semanticData, varMap, colorsData) {
  // 1. Find or create Semantic collection
  var semCollection = null;
  var allCollections = await figma.variables.getLocalVariableCollectionsAsync();
  for (var i = 0; i < allCollections.length; i++) {
    if (allCollections[i].name === 'Semantic') { semCollection = allCollections[i]; break; }
  }
  if (!semCollection) {
    semCollection = figma.variables.createVariableCollection('Semantic');
  }

  // Ensure Light and Dark modes
  var lightModeId = semCollection.modes[0].modeId;
  semCollection.renameMode(lightModeId, 'Light');
  var darkModeId = null;
  if (semCollection.modes.length < 2) {
    darkModeId = semCollection.addMode('Dark');
  } else {
    darkModeId = semCollection.modes[1].modeId;
    semCollection.renameMode(darkModeId, 'Dark');
  }

  // Check existing semantic vars
  var existingVars = await figma.variables.getLocalVariablesAsync('COLOR');
  var existingSemVars = {};
  for (var e = 0; e < existingVars.length; e++) {
    if (existingVars[e].variableCollectionId === semCollection.id) {
      existingSemVars[existingVars[e].name] = existingVars[e];
    }
  }

  // 2. Create semantic variables with aliases
  var semVarMap = {}; // token path → { variable, lightHex, darkHex }
  var groups = Object.keys(semanticData.semantic);

  for (var gi = 0; gi < groups.length; gi++) {
    var group = groups[gi];
    var entries = semanticData.semantic[group];
    var entryKeys = Object.keys(entries);

    for (var ei = 0; ei < entryKeys.length; ei++) {
      var name = entryKeys[ei];
      var modes = entries[name];
      var varName = group + '/' + name;

      var semVar;
      if (existingSemVars[varName]) {
        semVar = existingSemVars[varName];
      } else {
        semVar = figma.variables.createVariable(varName, semCollection, 'COLOR');
      }

      // Resolve light reference
      var lightKey = resolveRefToVarMapKey(modes.Light);
      var darkKey = resolveRefToVarMapKey(modes.Dark);

      // Set alias values
      if (lightKey && varMap[lightKey]) {
        semVar.setValueForMode(lightModeId, { type: 'VARIABLE_ALIAS', id: varMap[lightKey].id });
      }
      if (darkKey && varMap[darkKey]) {
        semVar.setValueForMode(darkModeId, { type: 'VARIABLE_ALIAS', id: varMap[darkKey].id });
      }

      // Resolve hex for display
      var lightHex = resolveHex(modes.Light, colorsData);
      var darkHex = resolveHex(modes.Dark, colorsData);

      semVarMap[varName] = { variable: semVar, lightHex: lightHex, darkHex: darkHex };
    }
  }

  // 3. Create Semantics page with swatches bound to semantic variables
  var pageName = 'Semantics';
  var page = null;
  var allPages = figma.root.children;
  for (var pi = 0; pi < allPages.length; pi++) {
    if (allPages[pi].name === pageName) { page = allPages[pi]; break; }
  }
  if (!page) {
    page = figma.createPage();
    page.name = pageName;
  }
  var existingChildren = [].concat(page.children);
  for (var cc = 0; cc < existingChildren.length; cc++) existingChildren[cc].remove();

  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  var yOffset = 0;

  // Title
  var title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = 32;
  title.characters = 'Semantic Tokens';
  title.fills = [figma.util.solidPaint('#1A1A1A')];
  page.appendChild(title);
  title.x = 0; title.y = yOffset;
  yOffset += 50;

  var subtitle = figma.createText();
  subtitle.fontName = { family: 'Inter', style: 'Regular' };
  subtitle.fontSize = 14;
  subtitle.characters = 'Each swatch is bound to its semantic variable (Light/Dark modes). Toggle modes to see theme changes.';
  subtitle.fills = [figma.util.solidPaint('#666666')];
  page.appendChild(subtitle);
  subtitle.x = 0; subtitle.y = yOffset;
  yOffset += 48;

  // Render groups
  for (var gi2 = 0; gi2 < groups.length; gi2++) {
    var grp = groups[gi2];
    var grpEntries = semanticData.semantic[grp];
    var grpKeys = Object.keys(grpEntries);

    // Group header
    var grpLabel = figma.createText();
    grpLabel.fontName = { family: 'Inter', style: 'Bold' };
    grpLabel.fontSize = 16;
    grpLabel.characters = capitalize(grp);
    grpLabel.fills = [figma.util.solidPaint('#333333')];
    page.appendChild(grpLabel);
    grpLabel.x = 0; grpLabel.y = yOffset;
    yOffset += 32;

    // Column headers
    var colHeaders = ['Token Name', 'Light', 'Dark'];
    var colXPositions = [0, 240, 460];
    for (var ch = 0; ch < colHeaders.length; ch++) {
      var hdr = figma.createText();
      hdr.fontName = { family: 'Inter', style: 'Medium' };
      hdr.fontSize = 11;
      hdr.characters = colHeaders[ch];
      hdr.fills = [figma.util.solidPaint('#999999')];
      page.appendChild(hdr);
      hdr.x = colXPositions[ch]; hdr.y = yOffset;
    }
    yOffset += 24;

    for (var ek = 0; ek < grpKeys.length; ek++) {
      var entryName = grpKeys[ek];
      var varPath = grp + '/' + entryName;
      var semEntry = semVarMap[varPath];
      if (!semEntry) continue;

      // Token name label
      var nameLabel = figma.createText();
      nameLabel.fontName = { family: 'Inter', style: 'Medium' };
      nameLabel.fontSize = 13;
      nameLabel.characters = varPath;
      nameLabel.fills = [figma.util.solidPaint('#333333')];
      page.appendChild(nameLabel);
      nameLabel.x = 0; nameLabel.y = yOffset + 6;

      // Light swatch (bound to semantic variable - shows light mode value)
      var lightRect = figma.createRectangle();
      lightRect.name = varPath + ' (Light)';
      lightRect.resize(36, 36);
      lightRect.cornerRadius = 6;
      // Bind fill to semantic variable
      var lFills = [figma.util.solidPaint(semEntry.lightHex || '#888888')];
      lFills[0] = figma.variables.setBoundVariableForPaint(lFills[0], 'color', semEntry.variable);
      lightRect.fills = lFills;
      lightRect.strokes = [figma.util.solidPaint('#E0E0E0')];
      lightRect.strokeWeight = 0.5;
      page.appendChild(lightRect);
      lightRect.x = colXPositions[1]; lightRect.y = yOffset;

      // Light hex label
      var lightLabel = figma.createText();
      lightLabel.fontName = { family: 'Inter', style: 'Regular' };
      lightLabel.fontSize = 11;
      lightLabel.characters = semEntry.lightHex || '—';
      lightLabel.fills = [figma.util.solidPaint('#666666')];
      page.appendChild(lightLabel);
      lightLabel.x = colXPositions[1] + 44; lightLabel.y = yOffset + 10;

      // Dark swatch (same variable, different mode shown as raw color for reference)
      var darkRect = figma.createRectangle();
      darkRect.name = varPath + ' (Dark)';
      darkRect.resize(36, 36);
      darkRect.cornerRadius = 6;
      var dFills = [figma.util.solidPaint(semEntry.darkHex || '#888888')];
      dFills[0] = figma.variables.setBoundVariableForPaint(dFills[0], 'color', semEntry.variable);
      darkRect.fills = dFills;
      darkRect.strokes = [figma.util.solidPaint('#E0E0E0')];
      darkRect.strokeWeight = 0.5;
      page.appendChild(darkRect);
      darkRect.x = colXPositions[2]; darkRect.y = yOffset;

      // Dark hex label
      var darkLabel = figma.createText();
      darkLabel.fontName = { family: 'Inter', style: 'Regular' };
      darkLabel.fontSize = 11;
      darkLabel.characters = semEntry.darkHex || '—';
      darkLabel.fills = [figma.util.solidPaint('#666666')];
      page.appendChild(darkLabel);
      darkLabel.x = colXPositions[2] + 44; darkLabel.y = yOffset + 10;

      yOffset += 48;
    }
    yOffset += 16;
  }

  return Object.keys(semVarMap).length;
}

function resolveHex(ref, colorsData) {
  var match = ref.match(/\{primitive\.color\.(.+)\}/);
  if (!match) return ref;
  var path = match[1].split('.');
  var obj = colorsData.primitive.color;
  for (var p = 0; p < path.length; p++) {
    if (!obj) return '#888888';
    obj = obj[path[p]];
  }
  if (obj && obj.$value) return obj.$value;
  if (typeof obj === 'string') return obj;
  return '#888888';
}

// ═══════════════════════════════════════════════════════════════════════════════
// FONT, SPACING, ICON SIZE, STROKE WIDTH, RADIUS — Variables + Pages
// ═══════════════════════════════════════════════════════════════════════════════

async function findOrCreateCollection(name) {
  var allCollections = await figma.variables.getLocalVariableCollectionsAsync();
  for (var i = 0; i < allCollections.length; i++) {
    if (allCollections[i].name === name) return allCollections[i];
  }
  return figma.variables.createVariableCollection(name);
}

async function findOrCreateVar(name, collectionId, type) {
  var existing = await figma.variables.getLocalVariablesAsync(type);
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].name === name && existing[i].variableCollectionId === collectionId) return existing[i];
  }
  return figma.variables.createVariable(name, collectionId, type);
}

async function createOtherCollections(typographyData, spacingData, radiiData) {
  var result = { font: [], spacing: [], iconSize: [], strokeWidth: [], radius: [] };

  // Font collection
  var fontCol = await findOrCreateCollection('Font');
  var fontModeId = fontCol.modes[0].modeId;
  fontCol.renameMode(fontModeId, 'Default');
  var font = typographyData.primitive.font;

  var familyKeys = Object.keys(font.family);
  for (var i = 0; i < familyKeys.length; i++) {
    var v = await findOrCreateVar('family/' + familyKeys[i], fontCol.id, 'STRING');
    v.setValueForMode(fontModeId, font.family[familyKeys[i]]);
    result.font.push(v);
  }
  var weightKeys = Object.keys(font.weight);
  for (var i = 0; i < weightKeys.length; i++) {
    var v = await findOrCreateVar('weight/' + weightKeys[i], fontCol.id, 'FLOAT');
    v.setValueForMode(fontModeId, font.weight[weightKeys[i]]);
    result.font.push(v);
  }
  var sizeKeys = Object.keys(font.size);
  for (var i = 0; i < sizeKeys.length; i++) {
    var v = await findOrCreateVar('size/' + sizeKeys[i], fontCol.id, 'FLOAT');
    v.setValueForMode(fontModeId, remToNumber(font.size[sizeKeys[i]]));
    result.font.push(v);
  }
  var lhKeys = Object.keys(font.lineHeight);
  for (var i = 0; i < lhKeys.length; i++) {
    var v = await findOrCreateVar('lineHeight/' + lhKeys[i], fontCol.id, 'FLOAT');
    v.setValueForMode(fontModeId, remToNumber(font.lineHeight[lhKeys[i]]));
    result.font.push(v);
  }
  var lsKeys = Object.keys(font.letterSpacing);
  for (var i = 0; i < lsKeys.length; i++) {
    var v = await findOrCreateVar('letterSpacing/' + lsKeys[i], fontCol.id, 'FLOAT');
    var lsVal = parseFloat(String(font.letterSpacing[lsKeys[i]]).replace('em', ''));
    v.setValueForMode(fontModeId, lsVal);
    result.font.push(v);
  }

  // Spacing collection
  var spacingCol = await findOrCreateCollection('Spacing');
  var spacingModeId = spacingCol.modes[0].modeId;
  spacingCol.renameMode(spacingModeId, 'Default');
  var spacingKeys = Object.keys(spacingData.primitive.spacing);
  for (var i = 0; i < spacingKeys.length; i++) {
    var v = await findOrCreateVar(spacingKeys[i], spacingCol.id, 'FLOAT');
    v.setValueForMode(spacingModeId, pxToNumber(spacingData.primitive.spacing[spacingKeys[i]]));
    result.spacing.push(v);
  }

  // Icon Size collection
  var iconCol = await findOrCreateCollection('Icon Size');
  var iconModeId = iconCol.modes[0].modeId;
  iconCol.renameMode(iconModeId, 'Default');
  var iconKeys = Object.keys(spacingData.primitive.iconSize);
  for (var i = 0; i < iconKeys.length; i++) {
    var v = await findOrCreateVar(iconKeys[i], iconCol.id, 'FLOAT');
    v.setValueForMode(iconModeId, pxToNumber(spacingData.primitive.iconSize[iconKeys[i]]));
    result.iconSize.push(v);
  }

  // Stroke Width collection
  var strokeCol = await findOrCreateCollection('Stroke Width');
  var strokeModeId = strokeCol.modes[0].modeId;
  strokeCol.renameMode(strokeModeId, 'Default');
  var strokeKeys = Object.keys(spacingData.primitive.strokeWidth);
  for (var i = 0; i < strokeKeys.length; i++) {
    var v = await findOrCreateVar(strokeKeys[i], strokeCol.id, 'FLOAT');
    v.setValueForMode(strokeModeId, pxToNumber(spacingData.primitive.strokeWidth[strokeKeys[i]]));
    result.strokeWidth.push(v);
  }

  // Radius collection
  var radiusCol = await findOrCreateCollection('Radius');
  var radiusModeId = radiusCol.modes[0].modeId;
  radiusCol.renameMode(radiusModeId, 'Default');
  var radiusKeys = Object.keys(radiiData.primitive.radius);
  for (var i = 0; i < radiusKeys.length; i++) {
    var v = await findOrCreateVar(radiusKeys[i], radiusCol.id, 'FLOAT');
    v.setValueForMode(radiusModeId, pxToNumber(radiiData.primitive.radius[radiusKeys[i]]));
    result.radius.push(v);
  }

  return result;
}

async function createTypographyPage(typographyData, fontVars) {
  var pageName = 'Typography';
  var page = null;
  var allPages = figma.root.children;
  for (var pi = 0; pi < allPages.length; pi++) {
    if (allPages[pi].name === pageName) { page = allPages[pi]; break; }
  }
  if (!page) { page = figma.createPage(); page.name = pageName; }
  var ch = [].concat(page.children);
  for (var c = 0; c < ch.length; c++) ch[c].remove();

  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  var font = typographyData.primitive.font;
  var typeScale = typographyData.primitive.typeScale;
  var yOffset = 0;

  var title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = 32;
  title.characters = 'Typography';
  title.fills = [figma.util.solidPaint('#1A1A1A')];
  page.appendChild(title);
  title.x = 0; title.y = yOffset;
  yOffset += 50;

  var familyNote = figma.createText();
  familyNote.fontName = { family: 'Inter', style: 'Regular' };
  familyNote.fontSize = 14;
  familyNote.characters = 'Primary: ' + font.family.primary + '\nMono: ' + font.family.mono;
  familyNote.fills = [figma.util.solidPaint('#666666')];
  page.appendChild(familyNote);
  familyNote.x = 0; familyNote.y = yOffset;
  yOffset += 60;

  // Find size variables for binding
  var sizeVarMap = {};
  for (var fv = 0; fv < fontVars.length; fv++) {
    if (fontVars[fv].name.startsWith('size/')) {
      sizeVarMap[fontVars[fv].name.replace('size/', '')] = fontVars[fv];
    }
  }

  var weightToStyle = { 'regular': 'Regular', 'medium': 'Medium', 'semibold': 'Bold', 'bold': 'Bold' };
  var scaleKeys = Object.keys(typeScale);

  for (var sk = 0; sk < scaleKeys.length; sk++) {
    var scaleName = scaleKeys[sk];
    var config = typeScale[scaleName];
    var sizeVal = remToNumber(font.size[config.size]);
    var lineHeightVal = remToNumber(font.lineHeight[config.lineHeight]);
    var style = weightToStyle[config.weight] || 'Regular';

    // Label
    var label = figma.createText();
    label.fontName = { family: 'Inter', style: 'Medium' };
    label.fontSize = 11;
    label.characters = scaleName + '  —  ' + sizeVal + 'px / ' + lineHeightVal + 'px / ' + config.weight;
    label.fills = [figma.util.solidPaint('#999999')];
    page.appendChild(label);
    label.x = 0; label.y = yOffset;
    yOffset += 20;

    // Specimen text with bound fontSize
    var specimen = figma.createText();
    specimen.fontName = { family: 'Inter', style: style };
    specimen.fontSize = Math.min(sizeVal, 48);
    specimen.lineHeight = { value: lineHeightVal, unit: 'PIXELS' };
    specimen.characters = 'The quick brown fox jumps over the lazy dog';
    specimen.fills = [figma.util.solidPaint('#1A1A1A')];
    page.appendChild(specimen);
    specimen.x = 0; specimen.y = yOffset;

    // Bind fontSize to the Font/size variable
    var sizeVar = sizeVarMap[config.size];
    if (sizeVar) {
      try { specimen.setBoundVariable('fontSize', sizeVar); } catch (e) { /* binding not supported */ }
    }

    yOffset += Math.max(lineHeightVal + 12, 32) + 16;
  }
}

async function createSpacingPage(spacingData, radiiData, vars) {
  var pageName = 'Spacing';
  var page = null;
  var allPages = figma.root.children;
  for (var pi = 0; pi < allPages.length; pi++) {
    if (allPages[pi].name === pageName) { page = allPages[pi]; break; }
  }
  if (!page) { page = figma.createPage(); page.name = pageName; }
  var ch = [].concat(page.children);
  for (var c = 0; c < ch.length; c++) ch[c].remove();

  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  var yOffset = 0;

  var title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = 32;
  title.characters = 'Spacing & Layout';
  title.fills = [figma.util.solidPaint('#1A1A1A')];
  page.appendChild(title);
  title.x = 0; title.y = yOffset;
  yOffset += 60;

  // --- SPACING SCALE ---
  var spacingLabel = figma.createText();
  spacingLabel.fontName = { family: 'Inter', style: 'Bold' };
  spacingLabel.fontSize = 18;
  spacingLabel.characters = 'Spacing Scale';
  spacingLabel.fills = [figma.util.solidPaint('#333333')];
  page.appendChild(spacingLabel);
  spacingLabel.x = 0; spacingLabel.y = yOffset;
  yOffset += 36;

  var spacingKeys = Object.keys(spacingData.primitive.spacing);
  for (var i = 0; i < spacingKeys.length; i++) {
    var sKey = spacingKeys[i];
    var px = pxToNumber(spacingData.primitive.spacing[sKey]);
    var spacingVar = vars.spacing[i];

    var sLabel = figma.createText();
    sLabel.fontName = { family: 'Inter', style: 'Medium' };
    sLabel.fontSize = 12;
    sLabel.characters = 'spacing/' + sKey + '  (' + px + 'px)';
    sLabel.fills = [figma.util.solidPaint('#666666')];
    page.appendChild(sLabel);
    sLabel.x = 0; sLabel.y = yOffset + 4;

    if (px > 0) {
      var bar = figma.createFrame();
      bar.name = 'spacing/' + sKey;
      bar.resize(px * 4, 20);
      bar.cornerRadius = 3;
      bar.fills = [figma.util.solidPaint('#2C66DD')];
      bar.layoutMode = 'HORIZONTAL';
      page.appendChild(bar);
      bar.x = 180; bar.y = yOffset;
      // Bind width to spacing variable
      if (spacingVar) {
        try { bar.setBoundVariable('paddingLeft', spacingVar); } catch (e) {}
      }
    }
    yOffset += 32;
  }
  yOffset += 24;

  // --- BORDER RADII ---
  var radiiLabel = figma.createText();
  radiiLabel.fontName = { family: 'Inter', style: 'Bold' };
  radiiLabel.fontSize = 18;
  radiiLabel.characters = 'Border Radius';
  radiiLabel.fills = [figma.util.solidPaint('#333333')];
  page.appendChild(radiiLabel);
  radiiLabel.x = 0; radiiLabel.y = yOffset;
  yOffset += 36;

  var radiusKeys = Object.keys(radiiData.primitive.radius);
  var xOff = 0;
  for (var i = 0; i < radiusKeys.length; i++) {
    var rKey = radiusKeys[i];
    var px = pxToNumber(radiiData.primitive.radius[rKey]);
    var radiusVar = vars.radius[i];
    var size = 64;

    var rect = figma.createRectangle();
    rect.name = 'radius/' + rKey;
    rect.resize(size, size);
    rect.cornerRadius = Math.min(px, size / 2);
    rect.fills = [figma.util.solidPaint('#F0F0F0')];
    rect.strokes = [figma.util.solidPaint('#CCCCCC')];
    rect.strokeWeight = 1;
    page.appendChild(rect);
    rect.x = xOff; rect.y = yOffset;
    // Bind corner radius to variable
    if (radiusVar) {
      try {
        rect.setBoundVariable('topLeftRadius', radiusVar);
        rect.setBoundVariable('topRightRadius', radiusVar);
        rect.setBoundVariable('bottomLeftRadius', radiusVar);
        rect.setBoundVariable('bottomRightRadius', radiusVar);
      } catch (e) {}
    }

    var rLabel = figma.createText();
    rLabel.fontName = { family: 'Inter', style: 'Regular' };
    rLabel.fontSize = 10;
    rLabel.characters = rKey + '\n' + radiiData.primitive.radius[rKey];
    rLabel.fills = [figma.util.solidPaint('#666666')];
    page.appendChild(rLabel);
    rLabel.x = xOff; rLabel.y = yOffset + size + 6;

    xOff += size + 20;
  }
  yOffset += 120;

  // --- ICON SIZES ---
  var iconLabel = figma.createText();
  iconLabel.fontName = { family: 'Inter', style: 'Bold' };
  iconLabel.fontSize = 18;
  iconLabel.characters = 'Icon Sizes';
  iconLabel.fills = [figma.util.solidPaint('#333333')];
  page.appendChild(iconLabel);
  iconLabel.x = 0; iconLabel.y = yOffset;
  yOffset += 36;

  var iconKeys = Object.keys(spacingData.primitive.iconSize);
  xOff = 0;
  for (var i = 0; i < iconKeys.length; i++) {
    var iKey = iconKeys[i];
    var px = pxToNumber(spacingData.primitive.iconSize[iKey]);
    var iconVar = vars.iconSize[i];

    var iRect = figma.createRectangle();
    iRect.name = 'iconSize/' + iKey;
    iRect.resize(px, px);
    iRect.cornerRadius = 4;
    iRect.fills = [figma.util.solidPaint('#E8E8E8')];
    iRect.strokes = [figma.util.solidPaint('#999999')];
    iRect.strokeWeight = 1;
    iRect.dashPattern = [4, 4];
    page.appendChild(iRect);
    iRect.x = xOff; iRect.y = yOffset;

    var iLabel = figma.createText();
    iLabel.fontName = { family: 'Inter', style: 'Regular' };
    iLabel.fontSize = 10;
    iLabel.characters = iKey + ' (' + px + 'px)';
    iLabel.fills = [figma.util.solidPaint('#666666')];
    page.appendChild(iLabel);
    iLabel.x = xOff; iLabel.y = yOffset + px + 6;

    xOff += px + 32;
  }
  yOffset += 80;

  // --- STROKE WIDTHS ---
  var strokeLabel = figma.createText();
  strokeLabel.fontName = { family: 'Inter', style: 'Bold' };
  strokeLabel.fontSize = 18;
  strokeLabel.characters = 'Stroke Widths';
  strokeLabel.fills = [figma.util.solidPaint('#333333')];
  page.appendChild(strokeLabel);
  strokeLabel.x = 0; strokeLabel.y = yOffset;
  yOffset += 36;

  var strokeKeys = Object.keys(spacingData.primitive.strokeWidth);
  xOff = 0;
  for (var i = 0; i < strokeKeys.length; i++) {
    var stKey = strokeKeys[i];
    var px = pxToNumber(spacingData.primitive.strokeWidth[stKey]);

    var stRect = figma.createRectangle();
    stRect.name = 'strokeWidth/' + stKey;
    stRect.resize(80, 40);
    stRect.cornerRadius = 6;
    stRect.fills = [figma.util.solidPaint('#FFFFFF')];
    stRect.strokes = [figma.util.solidPaint('#333333')];
    stRect.strokeWeight = px;
    page.appendChild(stRect);
    stRect.x = xOff; stRect.y = yOffset;

    var stLabel = figma.createText();
    stLabel.fontName = { family: 'Inter', style: 'Regular' };
    stLabel.fontSize = 10;
    stLabel.characters = stKey + ' (' + px + 'px)';
    stLabel.fills = [figma.util.solidPaint('#666666')];
    page.appendChild(stLabel);
    stLabel.x = xOff; stLabel.y = yOffset + 50;

    xOff += 112;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

figma.showUI(__html__, { width: 420, height: 520, themeColors: true });

figma.ui.onmessage = async function(msg) {

  if (msg.type === 'sync-tokens') {
    var productConfig = msg.productConfig;
    var colorsData = msg.colorsData;
    var typographyData = msg.typographyData;
    var spacingData = msg.spacingData;
    var radiiData = msg.radiiData;
    var semanticData = msg.semanticData;

    try {
      // Step 1: Bootstrap
      figma.ui.postMessage({ type: 'status', message: 'Bootstrapping Primitives collection…' });
      var bs = await bootstrap();

      // Step 2: Create color variables in Primitives
      figma.ui.postMessage({ type: 'status', message: 'Creating color variables in Primitives…' });
      var varMap = await createPrimitiveColorVars(bs, colorsData, productConfig.colorFamilies);

      // Step 3: Create Primitives page with swatches
      figma.ui.postMessage({ type: 'status', message: 'Creating Primitives page with swatches…' });
      await createPrimitivesPage(bs, colorsData, productConfig.colorFamilies, varMap);

      // Step 4: Semantic variables + page
      figma.ui.postMessage({ type: 'status', message: 'Creating Semantic variables & page…' });
      var semCount = await createSemanticVarsAndPage(semanticData, varMap, colorsData);

      // Step 5: Font, Spacing, Icon Size, Stroke Width, Radius
      figma.ui.postMessage({ type: 'status', message: 'Creating Font/Spacing/Radius collections…' });
      var otherVars = await createOtherCollections(typographyData, spacingData, radiiData);

      // Step 6: Typography page
      figma.ui.postMessage({ type: 'status', message: 'Creating Typography page…' });
      await createTypographyPage(typographyData, otherVars.font);

      // Step 7: Spacing page
      figma.ui.postMessage({ type: 'status', message: 'Creating Spacing page…' });
      await createSpacingPage(spacingData, radiiData, otherVars);

      // Summary
      var colorVarCount = Object.keys(varMap).length;
      var otherCount = otherVars.font.length + otherVars.spacing.length + otherVars.iconSize.length + otherVars.strokeWidth.length + otherVars.radius.length;
      var total = colorVarCount + semCount + otherCount;

      figma.ui.postMessage({
        type: 'complete',
        message: 'Done! ' + total + ' variables + 4 pages for ' + productConfig.name,
        details: {
          primitiveColors: colorVarCount,
          semantic: semCount,
          font: otherVars.font.length,
          spacing: otherVars.spacing.length,
          iconSize: otherVars.iconSize.length,
          strokeWidth: otherVars.strokeWidth.length,
          radius: otherVars.radius.length,
          pages: 4
        }
      });

      figma.notify('✅ Loom: ' + total + ' variables + 4 pages synced for ' + productConfig.name);

    } catch (err) {
      figma.ui.postMessage({ type: 'error', message: err.message || String(err) });
      figma.notify('❌ Token sync failed — see plugin for details', { error: true });
    }
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
