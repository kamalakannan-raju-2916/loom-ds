---
name: figma-component-export
description: "Export component designs from Figma back to the Loom repo as product-specific specs. Use when: designer has built/updated components in Figma using semantic variables and wants to push those specs to a specific product in the repo."
argument-hint: "Product name (e.g. 'writer') and component name (e.g. 'button'), or 'all' for all components"
---

# Figma Component Export - Figma → Repo

## Purpose

Reads component structures from Figma (built by designers using Loom semantic variables) and writes them back to the repo as product-specific component spec files. This completes the round-trip:

```
Repo (tokens) ──push──▶ Figma (variables)
                              │
                    Designer builds components
                    using those variables
                              │
Repo (specs)  ◀──pull────────┘  ← THIS SKILL
```

## Inputs

- **Product**: Which product to save under (e.g. `writer`)
- **Component**: Name of the component to export (e.g. `button`), or `all` for entire selection
- **Source**: Selected component(s) in Figma, or a specific page

## Output

Writes to: `tokens/products/{product}/components/{component-name}.json`

## Exported Data Structure

```json
{
  "name": "button",
  "product": "writer",
  "exportedFrom": "Figma",
  "exportedAt": "2026-05-02T10:00:00Z",
  "variants": [
    {
      "name": "Primary / Medium",
      "properties": {
        "width": "auto",
        "height": 36,
        "paddingLeft": 16,
        "paddingRight": 16,
        "borderRadius": 6,
        "itemSpacing": 8
      },
      "fills": {
        "variableBinding": "accent/primary",
        "resolvedLight": "#2C66DD",
        "resolvedDark": "#5685E4"
      },
      "strokes": [],
      "textStyles": {
        "fontFamily": "Zoho Puvi",
        "fontSize": 14,
        "fontWeight": 600,
        "fills": {
          "variableBinding": "text/on-accent",
          "resolvedLight": "#FFFFFF",
          "resolvedDark": "#FFFFFF"
        }
      }
    }
  ]
}
```

## Procedure

### Step 1: Confirm Figma Connection

Verify via `figma_list_open_files`.

### Step 2: Get Selected Components

Run via `figma_execute`:

```javascript
const selection = figma.currentPage.selection;
if (selection.length === 0) {
  return { error: 'No components selected. Please select component(s) in Figma first.' };
}

// Find all components and component sets in selection
const components = [];
for (const node of selection) {
  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    components.push({ id: node.id, name: node.name, type: node.type });
  } else if (node.type === 'INSTANCE') {
    const main = await node.getMainComponentAsync();
    if (main) components.push({ id: main.id, name: main.name, type: 'COMPONENT' });
  }
}

return {
  count: components.length,
  components: components,
  message: components.length > 0
    ? 'Found ' + components.length + ' component(s) to export'
    : 'No components found in selection. Select a Component or Component Set.'
};
```

### Step 3: Extract Component Data

For each component found, run via `figma_execute` (substitute `__COMPONENT_ID__`):

```javascript
const COMPONENT_ID = '__COMPONENT_ID__';

const node = await figma.getNodeByIdAsync(COMPONENT_ID);
if (!node) return { error: 'Component not found' };

// === HELPERS ===
async function getVariableBinding(fills) {
  if (!fills || fills.length === 0) return null;
  const fill = fills[0];
  if (fill.boundVariables && fill.boundVariables.color) {
    const varId = fill.boundVariables.color.id;
    const v = await figma.variables.getVariableByIdAsync(varId);
    if (v) return v.name;
  }
  return null;
}

function fillToHex(fills) {
  if (!fills || fills.length === 0 || fills[0].type !== 'SOLID') return null;
  const c = fills[0].color;
  const r = Math.round(c.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(c.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(c.b * 255).toString(16).padStart(2, '0');
  return '#' + r + g + b;
}

async function extractNodeData(n) {
  const data = {
    name: n.name,
    type: n.type,
    width: n.width,
    height: n.height
  };

  // Layout properties
  if (n.layoutMode) {
    data.layout = {
      mode: n.layoutMode,
      paddingTop: n.paddingTop,
      paddingRight: n.paddingRight,
      paddingBottom: n.paddingBottom,
      paddingLeft: n.paddingLeft,
      itemSpacing: n.itemSpacing,
      primaryAxisAlignItems: n.primaryAxisAlignItems,
      counterAxisAlignItems: n.counterAxisAlignItems
    };
  }

  // Border radius
  if (n.cornerRadius !== undefined && n.cornerRadius !== 0) {
    data.borderRadius = n.cornerRadius;
  }

  // Fills
  if (n.fills && n.fills.length > 0 && n.fills[0].visible !== false) {
    data.fills = {
      hex: fillToHex(n.fills),
      variable: await getVariableBinding(n.fills),
      opacity: n.fills[0].opacity !== undefined ? n.fills[0].opacity : 1
    };
  }

  // Strokes
  if (n.strokes && n.strokes.length > 0) {
    data.strokes = {
      hex: fillToHex(n.strokes),
      variable: await getVariableBinding(n.strokes),
      weight: n.strokeWeight
    };
  }

  // Text properties
  if (n.type === 'TEXT') {
    data.text = {
      fontFamily: n.fontName.family,
      fontStyle: n.fontName.style,
      fontSize: n.fontSize,
      lineHeight: n.lineHeight,
      letterSpacing: n.letterSpacing,
      textAlignHorizontal: n.textAlignHorizontal
    };
    data.fills = {
      hex: fillToHex(n.fills),
      variable: await getVariableBinding(n.fills)
    };
  }

  // Children
  if (n.children && n.children.length > 0) {
    data.children = [];
    for (const child of n.children) {
      data.children.push(await extractNodeData(child));
    }
  }

  return data;
}

// === MAIN ===
let variants = [];

if (node.type === 'COMPONENT_SET') {
  // Extract each variant
  for (const child of node.children) {
    variants.push(await extractNodeData(child));
  }
} else if (node.type === 'COMPONENT') {
  variants.push(await extractNodeData(node));
}

return {
  name: node.name,
  type: node.type,
  variantCount: variants.length,
  variants: variants
};
```

### Step 4: Write to Repo

The agent takes the returned JSON and writes it to:

```
tokens/products/{product}/components/{component-name}.json
```

Format the JSON with proper indentation. Add metadata:

```json
{
  "name": "component-name",
  "product": "writer",
  "exportedFrom": "Figma",
  "exportedAt": "ISO-timestamp",
  "source": { "fileId": "...", "nodeId": "..." },
  "variants": [ ... extracted data ... ]
}
```

### Step 5: Confirm & Commit

Report what was exported and ask the user if they want to commit/push to the repo.

---

## Usage Examples

- **"Export the button component for Writer"** → reads selected button, writes to `tokens/products/writer/components/button.json`
- **"Export all selected components for Writer"** → iterates selection, writes each one
- **"Update the modal spec for Writer"** → overwrites existing file with fresh export

## Notes

- Designer must **select** the component(s) in Figma before running
- Variable bindings are preserved - the spec shows which Loom token each fill/stroke uses
- Re-running for the same component **overwrites** the previous export (latest Figma state wins)
- This is a one-way Figma → repo flow; the repo becomes the documented spec
- Component specs in the repo serve as the **contract** between design and development
- Only maintainers (you) can merge these exports into `main` - designers can submit PRs
