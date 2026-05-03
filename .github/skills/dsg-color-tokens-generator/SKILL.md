---
name: generate-color-tokens
description: "Generate DSG color token sets in Figma using the Desktop Bridge plugin. Use when: user wants to create color palettes, tints and shades, color tokens, brand colors in Figma. User provides a HEX code (or 'Grey') and the skill looks up the exact DSG-defined family, tints, and shades."
argument-hint: "Hex code (e.g. #2C66DD) or 'Grey' for the grey token set"
---

# Generate DSG Color Tokens in Figma

## Purpose

Creates a complete DSG (Design Standard Group) color token set in Figma using **pre-defined, exact hex values** — no algorithmic generation. Uses a "Color Palette Comp" component from the current file. Each color is also added as a variable in the **Primitives** collection and bound to the component fills.

**Self-bootstrapping**: This skill auto-creates all prerequisites (Primitives collection, Essentials variables, and the Color Palette Comp component) if they don't already exist. You can share this file and recipients can start using it immediately on any Figma file.

## Inputs

The user provides **only a HEX code** (e.g. `#2C66DD`). The skill:
1. Matches it to the correct DSG color family from the data below
2. Retrieves the family name, all tints, and all shades
3. Creates the token set, variables, and bindings

**Special case**: For **Grey**, the user says "Grey" (no master hex). Grey has 12 shades and 12 tints with positions 00, 05, 10, 20–100.

---

## DSG Color Data

All colors below are the **exact DSG-approved values**. Never generate colors algorithmically — always use these exact hex codes.

### Standard Colors (10 Shades, 10 Tints each)

```json
{
  "00D096": {
    "family": "Spurge",
    "shades": {"S 10":"00C58E","S 20":"00BB87","S 30":"00A678","S 40":"009169","S 50":"007D5A","S 60":"00684B","S 70":"00533C","S 80":"003E2D","S 90":"002A1E","S 100":"00140F"},
    "tints":  {"T 10":"0DD29B","T 20":"1AD5A1","T 30":"33D9AB","T 40":"4DDEB6","T 50":"66E3C0","T 60":"80E8CB","T 70":"99ECD5","T 80":"B3F1E0","T 90":"CCF6EA","T 100":"E6FAF5"}
  },
  "996633": {
    "family": "Clay",
    "shades": {"S 10":"916130","S 20":"895C2E","S 30":"7A5229","S 40":"6B4724","S 50":"5C3D1F","S 60":"4C3319","S 70":"3D2914","S 80":"2E1E0F","S 90":"1F140A","S 100":"0F0A05"},
    "tints":  {"T 10":"9E6E3D","T 20":"A37648","T 30":"AD855C","T 40":"B89471","T 50":"C2A385","T 60":"CCB399","T 70":"D6C2AD","T 80":"E1D1C2","T 90":"EBE0D6","T 100":"F5F0EB"}
  },
  "EBB625": {
    "family": "Tangerine",
    "shades": {"S 10":"E3AC15","S 20":"CE9C13","S 30":"B98D11","S 40":"A57D0F","S 50":"906D0D","S 60":"7C5E0B","S 70":"674E0A","S 80":"523E08","S 90":"3E2F06","S 100":"291F04"},
    "tints":  {"T 10":"ECBA30","T 20":"EDBD3B","T 30":"EFC551","T 40":"F1CC67","T 50":"F3D37C","T 60":"F5DB92","T 70":"F7E2A8","T 80":"F9E9BE","T 90":"FBF0D3","T 100":"FDF8E9"}
  },
  "04B55C": {
    "family": "Jade",
    "shades": {"S 10":"04AC57","S 20":"04A353","S 30":"03914A","S 40":"037E40","S 50":"026D37","S 60":"025A2E","S 70":"024825","S 80":"01361B","S 90":"012412","S 100":"001008"},
    "tints":  {"T 10":"11B964","T 20":"1EBD6D","T 30":"36C47D","T 40":"50CB8D","T 50":"68D39D","T 60":"82DAAE","T 70":"9BE1BE","T 80":"B4E9CE","T 90":"CDF0DE","T 100":"E6F8EF"}
  },
  "F9B21D": {
    "family": "Sunshine",
    "shades": {"S 10":"ECA91C","S 20":"E0A01A","S 30":"C78E17","S 40":"AE7C14","S 50":"956B11","S 60":"7C590E","S 70":"64470C","S 80":"4A3509","S 90":"322406","S 100":"181103"},
    "tints":  {"T 10":"FABB34","T 20":"FAC248","T 30":"FBC95C","T 40":"FBCF71","T 50":"FCD685","T 60":"FCDD99","T 70":"FDE4AE","T 80":"FDEBC2","T 90":"FEF1D6","T 100":"FEF8EB"}
  },
  "A41D1E": {
    "family": "Maroon",
    "shades": {"S 10":"971B1B","S 20":"891818","S 30":"7C1616","S 40":"6E1313","S 50":"601111","S 60":"520F0F","S 70":"370A0A","S 80":"290707","S 90":"1B0505","S 100":"0E0202"},
    "tints":  {"T 10":"A92929","T 20":"AD3435","T 30":"B64A4B","T 40":"BF6162","T 50":"C87778","T 60":"D28E8F","T 70":"DBA5A5","T 80":"E4BCBC","T 90":"EDD2D2","T 100":"F6E9E9"}
  },
  "DB2C6F": {
    "family": "Cerise",
    "shades": {"S 10":"CE2365","S 20":"BA1F5B","S 30":"A51C50","S 40":"901846","S 50":"7C153C","S 60":"671132","S 70":"520E28","S 80":"3E0A1E","S 90":"290714","S 100":"15030A"},
    "tints":  {"T 10":"DF417D","T 20":"E2548A","T 30":"E56797","T 40":"E87AA4","T 50":"EC8DB1","T 60":"EFA0BE","T 70":"F2B3CB","T 80":"F5C6D8","T 90":"F9D9E5","T 100":"FCECF2"}
  },
  "821F1F": {
    "family": "Burgundy",
    "shades": {"S 10":"791C1C","S 20":"6E1A1A","S 30":"631717","S 40":"581515","S 50":"4D1212","S 60":"421010","S 70":"370D0D","S 80":"2C0A0A","S 90":"210808","S 100":"160505"},
    "tints":  {"T 10":"882A2A","T 20":"8F3636","T 30":"9B4C4C","T 40":"A86363","T 50":"B47979","T 60":"C18F8F","T 70":"CDA5A5","T 80":"DABCBC","T 90":"E6D2D2","T 100":"F3E9E9"}
  },
  "0C97FF": {
    "family": "Brunnera",
    "shades": {"S 10":"0B8FF2","S 20":"0B88E5","S 30":"0A79CC","S 40":"0869B2","S 50":"075B99","S 60":"064B7F","S 70":"053C66","S 80":"042D4C","S 90":"021E33","S 100":"010F19"},
    "tints":  {"T 10":"189CFF","T 20":"25A2FF","T 30":"3DACFF","T 40":"55B6FF","T 50":"6DC1FF","T 60":"86CBFF","T 70":"9ED5FF","T 80":"B7E0FF","T 90":"CEEAFF","T 100":"E7F5FF"}
  },
  "E42527": {
    "family": "Crimson",
    "shades": {"S 10":"D71B1E","S 20":"C1181B","S 30":"AC1518","S 40":"961315","S 50":"811012","S 60":"6B0D0F","S 70":"560B0C","S 80":"400809","S 90":"2B0506","S 100":"150303"},
    "tints":  {"T 10":"E7393C","T 20":"E94D4F","T 30":"EB6163","T 40":"EE7476","T 50":"F0888A","T 60":"F39C9D","T 70":"F5B0B1","T 80":"F8C4C4","T 90":"FAD7D8","T 100":"FDEBEB"}
  },
  "089949": {
    "family": "Shamrock",
    "shades": {"S 10":"089145","S 20":"078942","S 30":"067A3A","S 40":"066B33","S 50":"055C2C","S 60":"044C24","S 70":"033D1D","S 80":"022E16","S 90":"021F0F","S 100":"010F07"},
    "tints":  {"T 10":"159E52","T 20":"21A35C","T 30":"39AD6D","T 40":"53B880","T 50":"6BC292","T 60":"84CCA4","T 70":"9CD6B6","T 80":"B5E1C9","T 90":"CEEBDB","T 100":"E7F5ED"}
  },
  "2E7D32": {
    "family": "Laurel",
    "shades": {"S 10":"2C772F","S 20":"29702D","S 30":"256428","S 40":"205723","S 50":"1C4B1E","S 60":"173E19","S 70":"123214","S 80":"0E250F","S 90":"09190A","S 100":"050C05"},
    "tints":  {"T 10":"39843C","T 20":"438A47","T 30":"58975B","T 40":"6DA470","T 50":"82B184","T 60":"97BE99","T 70":"ABCBAD","T 80":"C1D8C2","T 90":"D5E5D6","T 100":"EBF2EB"}
  },
  "DA3949": {
    "family": "Flamingo",
    "shades": {"S 10":"D42738","S 20":"BE2332","S 30":"A91F2D","S 40":"941B27","S 50":"7F1722","S 60":"6A131C","S 70":"551016","S 80":"3F0C11","S 90":"2A080B","S 100":"150406"},
    "tints":  {"T 10":"DE4B5A","T 20":"E15D6A","T 30":"E56F7B","T 40":"E8818B","T 50":"EB939C","T 60":"EEA5AC","T 70":"F2B7BD","T 80":"F5C9CD","T 90":"F8DBDE","T 100":"FCEDEE"}
  },
  "993399": {
    "family": "Plum",
    "shades": {"S 10":"8B2E8B","S 20":"7D2A7D","S 30":"6F256F","S 40":"612061","S 50":"531C53","S 60":"461746","S 70":"381338","S 80":"2A0E2A","S 90":"1C091C","S 100":"0E050E"},
    "tints":  {"T 10":"9E3D9E","T 20":"A348A3","T 30":"AD5CAD","T 40":"B871B8","T 50":"C285C2","T 60":"CC99CC","T 70":"D6ADD6","T 80":"E1C2E1","T 90":"EBD6EB","T 100":"F5EBF5"}
  },
  "13601F": {
    "family": "Parsley",
    "shades": {"S 10":"125B1D","S 20":"11561C","S 30":"0F4D19","S 40":"0D4316","S 50":"0B3A13","S 60":"09300F","S 70":"08260C","S 80":"061D09","S 90":"041306","S 100":"020903"},
    "tints":  {"T 10":"1F682A","T 20":"2B7036","T 30":"42804C","T 40":"5A9063","T 50":"71A079","T 60":"89B08F","T 70":"A1BFA5","T 80":"B9D0BC","T 90":"D0DFD2","T 100":"E8EFE9"}
  },
  "999900": {
    "family": "Olive",
    "shades": {"S 10":"919100","S 20":"898900","S 30":"7A7A00","S 40":"6B6B00","S 50":"5C5C00","S 60":"4C4C00","S 70":"3D3D00","S 80":"2E2E00","S 90":"1F1F00","S 100":"0F0F00"},
    "tints":  {"T 10":"9E9E0D","T 20":"A3A31A","T 30":"ADAD33","T 40":"B8B84D","T 50":"C2C266","T 60":"CCCC80","T 70":"D6D699","T 80":"E1E1B3","T 90":"EBEBCC","T 100":"F5F5E6"}
  },
  "085CF3": {
    "family": "Sapphire",
    "shades": {"S 10":"0857E7","S 20":"0753DA","S 30":"064AC2","S 40":"0640AA","S 50":"053792","S 60":"042E79","S 70":"032561","S 80":"021B48","S 90":"021231","S 100":"010918"},
    "tints":  {"T 10":"1564F4","T 20":"216DF4","T 30":"397DF5","T 40":"538DF7","T 50":"6B9DF8","T 60":"84AEF9","T 70":"9CBEFA","T 80":"B5CEFB","T 90":"CEDEFD","T 100":"E7EFFE"}
  },
  "00AED0": {
    "family": "Teal",
    "shades": {"S 10":"00A5C5","S 20":"009CBB","S 30":"008BA6","S 40":"007991","S 50":"00687D","S 60":"005768","S 70":"004653","S 80":"00343E","S 90":"00232A","S 100":"001114"},
    "tints":  {"T 10":"0DB2D2","T 20":"1AB6D5","T 30":"33BED9","T 40":"4DC6DE","T 50":"66CEE3","T 60":"80D7E8","T 70":"99DFEC","T 80":"B3E7F1","T 90":"CCEFF6","T 100":"E6F7FA"}
  },
  "008EE0": {
    "family": "Cerulean",
    "shades": {"S 10":"0087D5","S 20":"0080C9","S 30":"0072B3","S 40":"00639C","S 50":"005586","S 60":"004770","S 70":"00395A","S 80":"002A43","S 90":"001C2D","S 100":"000E16"},
    "tints":  {"T 10":"0D94E2","T 20":"1A9AE3","T 30":"33A5E6","T 40":"4DB0E9","T 50":"66BBEC","T 60":"80C7F0","T 70":"99D2F3","T 80":"B3DDF6","T 90":"CCE8F9","T 100":"E6F4FC"}
  },
  "3119D5": {
    "family": "Indigo",
    "shades": {"S 10":"2F18CA","S 20":"2C16BF","S 30":"2714AA","S 40":"221195","S 50":"1D0F80","S 60":"180C6A","S 70":"140A55","S 80":"0F073F","S 90":"0A052B","S 100":"050215"},
    "tints":  {"T 10":"3C25D7","T 20":"4630D9","T 30":"5A47DD","T 40":"6F5EE2","T 50":"8375E6","T 60":"988CEA","T 70":"ADA3EE","T 80":"C2BAF2","T 90":"D6D1F7","T 100":"EBE8FB"}
  },
  "663399": {
    "family": "Charoite",
    "shades": {"S 10":"613091","S 20":"5C2E89","S 30":"52297A","S 40":"47246B","S 50":"3D1F5C","S 60":"33194C","S 70":"29143D","S 80":"1E0F2E","S 90":"140A1F","S 100":"0A050F"},
    "tints":  {"T 10":"6E3D9E","T 20":"7648A3","T 30":"855CAD","T 40":"9471B8","T 50":"A385C2","T 60":"B399CC","T 70":"C7ACE3","T 80":"D5C0EA","T 90":"E3D5F1","T 100":"F1EAF8"}
  },
  "CC3929": {
    "family": "Cardinal",
    "shades": {"S 10":"BA3425","S 20":"A72E21","S 30":"95291D","S 40":"82241A","S 50":"6F1F16","S 60":"5D1A12","S 70":"4A150F","S 80":"380F0B","S 90":"250A07","S 100":"130504"},
    "tints":  {"T 10":"CF4334","T 20":"D14D3F","T 30":"D66154","T 40":"DB756A","T 50":"E0887F","T 60":"E69C94","T 70":"EBB0A9","T 80":"F0C4BF","T 90":"F5D7D4","T 100":"FAECEA"}
  },
  "2D78FF": {
    "family": "Cornflower",
    "shades": {"S 10":"2B72F2","S 20":"286CE5","S 30":"2460CC","S 40":"1F54B2","S 50":"1B4899","S 60":"163C7F","S 70":"123066","S 80":"0D244C","S 90":"091833","S 100":"040C19"},
    "tints":  {"T 10":"387FFF","T 20":"4286FF","T 30":"5793FF","T 40":"6CA1FF","T 50":"81AEFF","T 60":"96BCFF","T 70":"ABC9FF","T 80":"C0D7FF","T 90":"D5E4FF","T 100":"EAF2FF"}
  },
  "0C8844": {
    "family": "Fern",
    "shades": {"S 10":"0B7D3E","S 20":"0A7138","S 30":"096633","S 40":"085B2D","S 50":"074F28","S 60":"064422","S 70":"05391C","S 80":"042D17","S 90":"032211","S 100":"02170B"},
    "tints":  {"T 10":"188E4E","T 20":"249457","T 30":"3DA069","T 40":"55AC7C","T 50":"6DB88F","T 60":"86C4A2","T 70":"9ECFB4","T 80":"B7DCC7","T 90":"CEE7DA","T 100":"E7F3ED"}
  },
  "6200EA": {
    "family": "Sugilite",
    "shades": {"S 10":"5900D5","S 20":"5000C0","S 30":"4700AB","S 40":"3E0095","S 50":"350080","S 60":"2C006B","S 70":"240055","S 80":"1B0040","S 90":"12002B","S 100":"090015"},
    "tints":  {"T 10":"6D05FF","T 20":"7C1EFF","T 30":"8A37FF","T 40":"9950FF","T 50":"A769FF","T 60":"B682FF","T 70":"C59BFF","T 80":"D3B4FF","T 90":"E2CDFF","T 100":"F0E6FF"}
  },
  "003ADD": {
    "family": "Lapis",
    "shades": {"S 10":"0036CC","S 20":"0032BC","S 30":"002EAC","S 40":"002A9D","S 50":"00268D","S 60":"00217D","S 70":"001D6E","S 80":"00195E","S 90":"00154E","S 100":"00113F"},
    "tints":  {"T 10":"0042F6","T 20":"1151FF","T 30":"2C64FF","T 40":"4677FF","T 50":"608BFF","T 60":"7B9EFF","T 70":"95B1FF","T 80":"B0C5FF","T 90":"CAD8FF","T 100":"E5ECFF"}
  },
  "E65100": {
    "family": "Persimmon",
    "shades": {"S 10":"D14900","S 20":"BC4200","S 30":"A73A00","S 40":"923300","S 50":"7D2C00","S 60":"682500","S 70":"531D00","S 80":"3F1600","S 90":"2A0F00","S 100":"150700"},
    "tints":  {"T 10":"FF5900","T 20":"FF6A1A","T 30":"FF7A33","T 40":"FF8B4D","T 50":"FF9C66","T 60":"FFAC80","T 70":"FFBD99","T 80":"FFCDB3","T 90":"FFDECC","T 100":"FFEEE5"}
  },
  "2C66DD": {
    "family": "Cobalt",
    "shades": {"S 10":"225CCF","S 20":"1E52BB","S 30":"1B49A6","S 40":"184091","S 50":"14377C","S 60":"112E68","S 70":"0E2553","S 80":"0A1B3E","S 90":"071229","S 100":"030915"},
    "tints":  {"T 10":"376EDF","T 20":"4276E0","T 30":"5685E4","T 40":"6B94E7","T 50":"80A3EB","T 60":"96B3EE","T 70":"ABC2F1","T 80":"C0D1F5","T 90":"D5E0F8","T 100":"EAF0FC"}
  }
}
```

### Grey (Special: No Master, 12 Shades + 12 Tints)

Triggered by user saying "Grey" — not by a hex code.

```json
{
  "Grey": {
    "family": "Grey",
    "hasMaster": false,
    "shades": {"S 00":"F5F5F5","S 05":"E9E9E9","S 10":"DCDCDC","S 20":"C4C4C4","S 30":"ABABAB","S 40":"939393","S 50":"7A7A7A","S 60":"626262","S 70":"494949","S 80":"313131","S 90":"181818","S 100":"0C0C0C"},
    "tints":  {"T 00":"07080A","T 05":"141516","T 10":"202123","T 20":"39393B","T 30":"525354","T 40":"6A6B6C","T 50":"838485","T 60":"9C9C9D","T 70":"B5B5B6","T 80":"CDCECE","T 90":"E7E7E7","T 100":"F2F2F3"}
  }
}
```

---

## Layout Structure

```
[Family Name Frame] ← HORIZONTAL auto layout, itemSpacing=40, HUG×HUG, fills=[]
├── [Master Instance] ← Color Palette Comp (158×141), layer name = "Master" (omitted for Grey)
│   ├── Color Frame (fill = Primitives variable, bound)
│   │   ├── Family Name text ← fill bound to Black or White Primitives variable
│   │   └── Position text ← fill bound to Black or White Primitives variable
│   └── Hex Code Wrap ← shows hex code without #
└── [Tints & Shades Frame] ← HORIZONTAL, WRAP, itemSpacing=0, counterAxisSpacing=0, width=1896 FIXED (for Grey: 12 per row), or 1580 FIXED (for 10-swatch families), HUG vertical
    ├── Tint instances (lightest → closest to master)
    └── Shade instances (closest to master → darkest)
```

## Primitives Variable Collection

The skill uses a variable collection named **"Primitives"** with nine Essentials variables grouped under `Essentials/`. IDs are **not hardcoded** — the bootstrap step (Step 2) finds or creates them dynamically and returns the actual IDs to use.

- **Collection**: "Primitives" (found or created by bootstrap)
- **Mode**: First mode of the collection (found or created by bootstrap)
- **Essentials variables** (all under `Essentials/` group):
  - `Essentials/White` — #FFFFFF
  - `Essentials/Black` — #000000
  - `Essentials/Half` — #7F7F7F
  - `Essentials/Blue1` — #006AFF
  - `Essentials/Blue2` — #00A6FF
  - `Essentials/Purple1` — #663399
  - `Essentials/Purple2` — #A385C2
  - `Essentials/Overlay1` — #000000 @ 50% opacity
  - `Essentials/Overlay2` — #000000 @ 70% opacity

### Variable Naming Convention

Variables are created with slash-grouped names using three subgroups — **Tint**, **Master**, **Shade**:
- `{Family}/Master/Master` — e.g. `Cobalt/Master/Master`
- `{Family}/Tint/10` through `{Family}/Tint/100` — e.g. `Cobalt/Tint/10`
- `{Family}/Shade/10` through `{Family}/Shade/100` — e.g. `Cobalt/Shade/10`
- For Grey: `Grey/Shade/00`, `Grey/Shade/05`, `Grey/Shade/10`, ..., `Grey/Tint/00`, `Grey/Tint/05`, `Grey/Tint/10`, ...

### Variable Binding

- The **"Color" frame fill** on each instance is bound to its corresponding Primitives variable (not a raw hex fill).
- The **"Family Name"** and **"Position" text fills** are bound to the `Essentials/Black` or `Essentials/White` Primitives variable based on AAA contrast.

## AAA Contrast for Text Color

- Calculate WCAG relative luminance for the background color
- Calculate contrast ratio against both black and white
- Choose whichever gives contrast ratio ≥ 7:1 (AAA)
- If neither meets 7:1, choose the higher contrast one
- Use the `Essentials/Black` or `Essentials/White` variable from the Primitives collection (IDs obtained from bootstrap)

## Placement Rules

- First color token set: x=0, y=0
- Each subsequent set: 40px below the bottom edge of the last existing color token set frame
- Detect existing sets: scan `figma.currentPage` direct children for FRAME nodes with `layoutMode === 'HORIZONTAL'` and `itemSpacing === 40`

## Procedure

### Step 1: Confirm Figma Connection

Verify a Figma file is connected via `figma_list_open_files`.

### Step 2: Bootstrap Prerequisites

Run the bootstrap code below via `figma_execute` **once per session** (before the first color token generation). This ensures all prerequisites exist and returns the dynamic IDs to use in Step 4.

The bootstrap handles **all combinations**:
- If nothing exists → creates Primitives collection, Essentials variables, and Color Palette Comp component
- If only variables exist but no component → creates the component using existing variables
- If only the component exists but no variables → creates the collection and variables, then re-binds the component
- If everything exists and fills are already correctly bound → returns existing IDs without modifying anything
- If everything exists but variables were recreated (different IDs) → re-binds only the mismatched fills

```javascript
// === BOOTSTRAP: Find or create Primitives collection, Essentials variables, and Color Palette Comp ===

// --- 1. Find or create Primitives collection ---
let collection = null;
const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
for (const c of allCollections) {
  if (c.name === 'Primitives') { collection = c; break; }
}
if (!collection) {
  collection = figma.variables.createVariableCollection('Primitives');
}
const modeId = collection.modes[0].modeId;

// --- 2. Find or create Essentials variables ---
async function findOrCreateColorVar(name, r, g, b, a) {
  for (const varId of collection.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(varId);
    if (v && v.name === name) return v;
  }
  const v = figma.variables.createVariable(name, collection, 'COLOR');
  v.setValueForMode(modeId, { r, g, b, a: a !== undefined ? a : 1 });
  return v;
}
const whiteVar    = await findOrCreateColorVar('Essentials/White', 1, 1, 1);
const blackVar    = await findOrCreateColorVar('Essentials/Black', 0, 0, 0);
const halfVar     = await findOrCreateColorVar('Essentials/Half', 0.5, 0.5, 0.5);
const blue1Var    = await findOrCreateColorVar('Essentials/Blue1', 0x00/255, 0x6A/255, 0xFF/255);
const blue2Var    = await findOrCreateColorVar('Essentials/Blue2', 0x00/255, 0xA6/255, 0xFF/255);
const purple1Var  = await findOrCreateColorVar('Essentials/Purple1', 0x66/255, 0x33/255, 0x99/255);
const purple2Var  = await findOrCreateColorVar('Essentials/Purple2', 0xA3/255, 0x85/255, 0xC2/255);
const overlay1Var = await findOrCreateColorVar('Essentials/Overlay1', 0, 0, 0, 0.5);
const overlay2Var = await findOrCreateColorVar('Essentials/Overlay2', 0, 0, 0, 0.7);

// --- 3. Find or create Color Palette Comp component ---
let component = null;

// Search all local components for one named "Color Palette Comp"
const localComponents = figma.root.findAll(n => n.type === 'COMPONENT' && n.name === 'Color Palette Comp');
if (localComponents.length > 0) {
  component = localComponents[0];
}

if (!component) {
  // Create the component from scratch
  component = figma.createComponent();
  component.name = 'Color Palette Comp';
  component.resize(158, 141);
  component.layoutMode = 'VERTICAL';
  component.primaryAxisAlignItems = 'MIN';
  component.counterAxisAlignItems = 'MIN';
  component.itemSpacing = 0;
  component.paddingLeft = 16; component.paddingRight = 16;
  component.paddingTop = 16; component.paddingBottom = 16;
  component.layoutSizingHorizontal = 'FIXED';
  component.layoutSizingVertical = 'HUG';
  // Bind component background fill to White variable
  let compFills = [figma.util.solidPaint('#FFFFFF')];
  compFills[0] = figma.variables.setBoundVariableForPaint(compFills[0], 'color', whiteVar);
  component.fills = compFills;

  // -- Color frame (84px tall, fill container width) --
  const colorFrame = figma.createFrame();
  colorFrame.name = 'Color';
  colorFrame.layoutMode = 'VERTICAL';
  colorFrame.primaryAxisAlignItems = 'MIN';
  colorFrame.counterAxisAlignItems = 'MAX';
  colorFrame.itemSpacing = 0;
  colorFrame.paddingLeft = 10; colorFrame.paddingRight = 10;
  colorFrame.paddingTop = 10; colorFrame.paddingBottom = 10;
  colorFrame.resize(126, 84);
  colorFrame.layoutSizingHorizontal = 'FILL';
  colorFrame.layoutSizingVertical = 'FIXED';
  colorFrame.cornerRadius = 8;
  // Bind Color frame fill to Half variable (default placeholder)
  let cfFills = [figma.util.solidPaint('#7F7F7F')];
  cfFills[0] = figma.variables.setBoundVariableForPaint(cfFills[0], 'color', halfVar);
  colorFrame.fills = cfFills;

  // -- Family Name text --
  const familyText = figma.createText();
  await figma.loadFontAsync({ family: 'SF Mono', style: 'Medium' });
  await figma.loadFontAsync({ family: 'SF Mono', style: 'Regular' });
  await figma.loadFontAsync({ family: 'SF Mono', style: 'Semibold' });
  familyText.name = 'Family Name';
  familyText.fontName = { family: 'SF Mono', style: 'Medium' };
  familyText.fontSize = 11;
  familyText.characters = 'Family Name';
  familyText.textAlignHorizontal = 'RIGHT';
  familyText.textAutoResize = 'HEIGHT';
  familyText.resize(75, familyText.height);
  familyText.layoutSizingHorizontal = 'FIXED';
  familyText.layoutSizingVertical = 'HUG';
  let ftFills = [figma.util.solidPaint('#000000')];
  ftFills[0] = figma.variables.setBoundVariableForPaint(ftFills[0], 'color', blackVar);
  familyText.fills = ftFills;
  colorFrame.appendChild(familyText);

  // -- Position text --
  const posText = figma.createText();
  posText.name = 'Position';
  posText.fontName = { family: 'SF Mono', style: 'Regular' };
  posText.fontSize = 12;
  posText.characters = 'Position';
  posText.textAlignHorizontal = 'RIGHT';
  posText.textAutoResize = 'WIDTH_AND_HEIGHT';
  posText.layoutSizingHorizontal = 'HUG';
  posText.layoutSizingVertical = 'HUG';
  let ptFills = [figma.util.solidPaint('#000000')];
  ptFills[0] = figma.variables.setBoundVariableForPaint(ptFills[0], 'color', blackVar);
  posText.fills = ptFills;
  colorFrame.appendChild(posText);

  component.appendChild(colorFrame);

  // -- Hex Code Wrap frame --
  const hexWrap = figma.createFrame();
  hexWrap.name = 'Hex Code Wrap';
  hexWrap.layoutMode = 'HORIZONTAL';
  hexWrap.primaryAxisAlignItems = 'CENTER';
  hexWrap.counterAxisAlignItems = 'CENTER';
  hexWrap.itemSpacing = 10;
  hexWrap.paddingTop = 8;
  hexWrap.paddingLeft = 0; hexWrap.paddingRight = 0; hexWrap.paddingBottom = 0;
  hexWrap.layoutSizingHorizontal = 'FILL';
  hexWrap.layoutSizingVertical = 'HUG';
  hexWrap.fills = [];

  const hexText = figma.createText();
  hexText.name = 'Hex Code';
  hexText.fontName = { family: 'SF Mono', style: 'Semibold' };
  hexText.fontSize = 14;
  hexText.characters = 'Hex Code';
  hexText.textAutoResize = 'HEIGHT';
  hexText.resize(126, hexText.height);
  hexText.layoutSizingHorizontal = 'FILL';
  hexText.layoutSizingVertical = 'HUG';
  let htFills = [figma.util.solidPaint('#000000')];
  htFills[0] = figma.variables.setBoundVariableForPaint(htFills[0], 'color', blackVar);
  hexText.fills = htFills;
  hexWrap.appendChild(hexText);

  component.appendChild(hexWrap);

  // -- Add component properties --
  component.addComponentProperty('Position', 'TEXT', 'Position');
  component.addComponentProperty('Hex Code', 'TEXT', 'Hex Code');
  component.addComponentProperty('Family Name', 'TEXT', 'Family Name');

  // Move component off-canvas so it doesn't interfere with token layouts
  component.x = -500;
  component.y = -500;
}

// --- 4. Re-bind component fills ONLY if not already correctly bound ---
function isBoundTo(fills, varId) {
  return fills && fills.length > 0 && fills[0].boundVariables && fills[0].boundVariables.color && fills[0].boundVariables.color.id === varId;
}
function bindIfNeeded(node, targetVar) {
  if (!isBoundTo(node.fills, targetVar.id)) {
    let f = [...node.fills];
    if (f.length > 0) {
      f[0] = figma.variables.setBoundVariableForPaint(f[0], 'color', targetVar);
      node.fills = f;
    }
  }
}

// Component background → White
bindIfNeeded(component, whiteVar);

const colorFrame = component.children.find(c => c.name === 'Color');
if (colorFrame) {
  // Color frame fill → Half
  bindIfNeeded(colorFrame, halfVar);
  // Text fills → Black
  for (const textName of ['Family Name', 'Position']) {
    const txt = colorFrame.children.find(c => c.name === textName);
    if (txt) bindIfNeeded(txt, blackVar);
  }
}
const hexWrapNode = component.children.find(c => c.name === 'Hex Code Wrap');
if (hexWrapNode) {
  const hexTextNode = hexWrapNode.children.find(c => c.name === 'Hex Code');
  if (hexTextNode) bindIfNeeded(hexTextNode, blackVar);
}

// --- 5. Discover component property keys (they include generated suffixes like #10:0) ---
const propDefs = component.componentPropertyDefinitions;
let positionPropKey = null, hexCodePropKey = null, familyNamePropKey = null;
for (const key of Object.keys(propDefs)) {
  const baseName = key.split('#')[0];
  if (baseName === 'Position') positionPropKey = key;
  else if (baseName === 'Hex Code') hexCodePropKey = key;
  else if (baseName === 'Family Name') familyNamePropKey = key;
}

return {
  collectionId: collection.id,
  modeId: modeId,
  whiteVarId: whiteVar.id,
  blackVarId: blackVar.id,
  halfVarId: halfVar.id,
  blue1VarId: blue1Var.id,
  blue2VarId: blue2Var.id,
  purple1VarId: purple1Var.id,
  purple2VarId: purple2Var.id,
  overlay1VarId: overlay1Var.id,
  overlay2VarId: overlay2Var.id,
  componentId: component.id,
  positionPropKey: positionPropKey,
  hexCodePropKey: hexCodePropKey,
  familyNamePropKey: familyNamePropKey,
  message: 'Bootstrap complete — all prerequisites verified/created'
};
```

The bootstrap returns a JSON object with all dynamic IDs. **Save these values** — they are used as substitution parameters in Step 4.

### Step 3: Look Up Color Data

From the user's hex input (strip `#`, uppercase), find the matching entry in the DSG Color Data above. Extract:
- `FAMILY_NAME` — the family name
- `MASTER_HEX` — the master hex (without #)
- `SHADES` — object of position→hex for shades
- `TINTS` — object of position→hex for tints
- For Grey: no master, 12+12 positions

### Step 4: Execute Color Token Generation

Run the code below via `figma_execute`. The agent must **substitute**:
- `__FAMILY_NAME__`, `__MASTER_HEX__`, `__HAS_MASTER__`, `__TINTS_SHADES_WIDTH__`, `__SHADES_JSON__`, `__TINTS_JSON__` — from Step 3 lookup
- `__COMPONENT_ID__`, `__COLLECTION_ID__`, `__MODE_ID__`, `__WHITE_VAR_ID__`, `__BLACK_VAR_ID__` — from Step 2 bootstrap result
- `__POSITION_PROP_KEY__`, `__HEX_CODE_PROP_KEY__`, `__FAMILY_NAME_PROP_KEY__` — from Step 2 bootstrap result

- For standard colors: `__HAS_MASTER__` = `true`, `__TINTS_SHADES_WIDTH__` = `1580`
- For Grey: `__HAS_MASTER__` = `false`, `__TINTS_SHADES_WIDTH__` = `1896`

```javascript
const FAMILY_NAME = '__FAMILY_NAME__';
const MASTER_HEX = '__MASTER_HEX__';
const HAS_MASTER = __HAS_MASTER__;
const COMPONENT_ID = '__COMPONENT_ID__';
const TINTS_SHADES_WIDTH = __TINTS_SHADES_WIDTH__;
const COLLECTION_ID = '__COLLECTION_ID__';
const MODE_ID = '__MODE_ID__';
const WHITE_VAR_ID = '__WHITE_VAR_ID__';
const BLACK_VAR_ID = '__BLACK_VAR_ID__';
const POSITION_PROP_KEY = '__POSITION_PROP_KEY__';
const HEX_CODE_PROP_KEY = '__HEX_CODE_PROP_KEY__';
const FAMILY_NAME_PROP_KEY = '__FAMILY_NAME_PROP_KEY__';

const SHADES = __SHADES_JSON__;
const TINTS = __TINTS_JSON__;

// === HELPERS ===
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return { r: parseInt(hex.substring(0,2),16), g: parseInt(hex.substring(2,4),16), b: parseInt(hex.substring(4,6),16) };
}
function hexToFigma(hex) {
  const rgb = hexToRgb(hex);
  return { r: rgb.r/255, g: rgb.g/255, b: rgb.b/255 };
}
function relativeLuminance(r,g,b) {
  const [rs,gs,bs] = [r,g,b].map(v => { v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4); });
  return 0.2126*rs+0.7152*gs+0.0722*bs;
}
function needsWhiteText(hex) {
  const rgb = hexToRgb(hex);
  const lum = relativeLuminance(rgb.r,rgb.g,rgb.b);
  const cWhite = 1.05/(lum+0.05);
  const cBlack = (lum+0.05)/0.05;
  if (cBlack>=7) return false;
  if (cWhite>=7) return true;
  return cWhite>cBlack;
}

// === FIND PLACEMENT ===
const page = figma.currentPage;
let maxBottom = -40;
for (const child of page.children) {
  if (child.type==='FRAME' && child.layoutMode==='HORIZONTAL' && child.itemSpacing===40) {
    const bottom = child.y+child.height;
    if (bottom>maxBottom) maxBottom=bottom;
  }
}
const startY = maxBottom+40;

// === GET COMPONENT, COLLECTION & VARIABLES (using IDs from bootstrap) ===
const component = await figma.getNodeByIdAsync(COMPONENT_ID);
if (!component) return 'Component not found — run bootstrap first';
const collection = await figma.variables.getVariableCollectionByIdAsync(COLLECTION_ID);
if (!collection) return 'Primitives collection not found — run bootstrap first';
const whiteVar = await figma.variables.getVariableByIdAsync(WHITE_VAR_ID);
const blackVar = await figma.variables.getVariableByIdAsync(BLACK_VAR_ID);

// === POSITION DISPLAY NAME HELPER ===
// Converts JSON keys ("T 10", "S 10") to display names ("Tint 10", "Shade 10")
function toDisplayName(key) {
  if (key.startsWith('T ')) return 'Tint ' + key.substring(2);
  if (key.startsWith('S ')) return 'Shade ' + key.substring(2);
  return key;
}

// === VARIABLE NAME HELPER ===
function getVarName(familyName, position) {
  if (position === 'Master') return familyName + '/Master/Master';
  if (position.startsWith('Tint ')) return familyName + '/Tint/' + position.substring(5);
  if (position.startsWith('Shade ')) return familyName + '/Shade/' + position.substring(6);
  return familyName + '/' + position;
}

// === CREATE VARIABLE & BIND INSTANCE ===
function createVarAndBind(inst, position, hex, familyName) {
  inst.name = position;
  const props = {};
  props[POSITION_PROP_KEY] = position;
  props[HEX_CODE_PROP_KEY] = hex;
  props[FAMILY_NAME_PROP_KEY] = familyName;
  inst.setProperties(props);
  const varName = getVarName(familyName, position);
  const colorVar = figma.variables.createVariable(varName, collection, 'COLOR');
  const fCol = hexToFigma(hex);
  colorVar.setValueForMode(MODE_ID, { r:fCol.r, g:fCol.g, b:fCol.b, a:1 });
  const colorFrame = inst.children.find(c => c.name==='Color');
  let fills = [...colorFrame.fills];
  fills[0] = figma.variables.setBoundVariableForPaint(fills[0], 'color', colorVar);
  colorFrame.fills = fills;
  const textVar = needsWhiteText(hex) ? whiteVar : blackVar;
  const familyText = colorFrame.children.find(c => c.name==='Family Name');
  const posText = colorFrame.children.find(c => c.name==='Position');
  if (familyText) {
    let tf = [...familyText.fills];
    tf[0] = figma.variables.setBoundVariableForPaint(tf[0], 'color', textVar);
    familyText.fills = tf;
  }
  if (posText) {
    let pf = [...posText.fills];
    pf[0] = figma.variables.setBoundVariableForPaint(pf[0], 'color', textVar);
    posText.fills = pf;
  }
}

// === BUILD LAYOUT ===
// Variable creation order: Tints → Master → Shades (matching the Primitives panel grouping)
const mainFrame = figma.createFrame();
mainFrame.name = FAMILY_NAME;
mainFrame.layoutMode = 'HORIZONTAL';
mainFrame.primaryAxisAlignItems = 'MIN';
mainFrame.counterAxisAlignItems = 'MIN';
mainFrame.itemSpacing = 40;
mainFrame.layoutSizingHorizontal = 'HUG';
mainFrame.layoutSizingVertical = 'HUG';
mainFrame.fills = [];
mainFrame.x = 0;
mainFrame.y = startY;

// 1. Create Tints & Shades frame (not yet appended to mainFrame)
const tsFrame = figma.createFrame();
tsFrame.name = 'Tints & Shades';
tsFrame.layoutMode = 'HORIZONTAL';
tsFrame.layoutWrap = 'WRAP';
tsFrame.primaryAxisAlignItems = 'MIN';
tsFrame.counterAxisAlignItems = 'MIN';
tsFrame.itemSpacing = 0;
tsFrame.counterAxisSpacing = 0;
tsFrame.resize(TINTS_SHADES_WIDTH, 10);
tsFrame.layoutSizingHorizontal = 'FIXED';
tsFrame.layoutSizingVertical = 'HUG';
tsFrame.fills = [];

// 2. Create tint instances FIRST (variables: {Family}/Tint/100 → {Family}/Tint/10)
const tintKeys = Object.keys(TINTS);
for (let i = tintKeys.length-1; i >= 0; i--) {
  const key = tintKeys[i];
  const inst = component.createInstance();
  createVarAndBind(inst, toDisplayName(key), TINTS[key], FAMILY_NAME);
  tsFrame.appendChild(inst);
}

// 3. Create master instance SECOND (variable: {Family}/Master/Master)
if (HAS_MASTER) {
  const masterInst = component.createInstance();
  createVarAndBind(masterInst, 'Master', MASTER_HEX, FAMILY_NAME);
  mainFrame.appendChild(masterInst);
}

// 4. Create shade instances THIRD (variables: {Family}/Shade/10 → {Family}/Shade/100)
const shadeKeys = Object.keys(SHADES);
for (const key of shadeKeys) {
  const inst = component.createInstance();
  createVarAndBind(inst, toDisplayName(key), SHADES[key], FAMILY_NAME);
  tsFrame.appendChild(inst);
}

// 5. Append tsFrame after master so layout is: [Master] [Tints & Shades]
mainFrame.appendChild(tsFrame);

return {
  frameId: mainFrame.id,
  frameName: mainFrame.name,
  x: mainFrame.x,
  y: mainFrame.y,
  totalSwatches: (HAS_MASTER?1:0) + tintKeys.length + shadeKeys.length,
  message: 'Created ' + FAMILY_NAME + ' color tokens with ' + tintKeys.length + ' tints and ' + shadeKeys.length + ' shades, all bound to Primitives variables'
};
```

### Step 5: Take Screenshot

Take a screenshot of the created frame using `figma_take_screenshot` with the returned `frameId`.

### Step 6: Verify

Visually confirm:
- Light tints have black text, dark shades have white text
- All swatches are correctly arranged (tints first, then shades)
- The frame is positioned 40px below any previously existing token set

---

## Notes

- **Never generate colors algorithmically** — always use the exact DSG hex values from this file
- **No hardcoded IDs** — all component/collection/variable/property IDs are obtained dynamically from the bootstrap step
- **Run bootstrap once per session** (Step 2) before generating any color tokens. It is idempotent — safe to run multiple times
- The bootstrap creates the "Color Palette Comp" component if missing, using **SF Mono** font (Medium, Regular, Semibold weights)
- The Essentials group (`Essentials/White`, `Essentials/Black`, `Essentials/Half`, `Essentials/Blue1`, `Essentials/Blue2`, `Essentials/Purple1`, `Essentials/Purple2`, `Essentials/Overlay1`, `Essentials/Overlay2`) are base variables used for text contrast, overlays, and link colors
- Component properties have generated suffixes (e.g. `Position#10:0`) that vary per file — the bootstrap discovers the actual keys
- The color swatch is the fill of the "Color" FRAME (not a child Rectangle)
- The hex code displayed in swatches is without the `#` prefix
- Standard families use 1580px width (10 swatches per row × 158px each)
- Grey uses 1896px width (12 swatches per row × 158px each)
- Tints are arranged from lightest (Tint 100) to closest to master (Tint 10), left to right
- Shades are arranged from closest to master (Shade 10) to darkest (Shade 100), left to right
- Each variable is created under `Primitives` collection with `{Family}/Tint/{num}`, `{Family}/Master/Master`, `{Family}/Shade/{num}` naming
- **Variable creation order**: Tints (100→10) → Master → Shades (10→100), so they appear grouped correctly in the Primitives panel
- Both fill colors and text colors use Primitives variable bindings (not raw color values)
- `createVariable` must be called with the collection **node** (not the ID string) — use `getVariableCollectionByIdAsync` first
- When wrapping occurs, tints appear on the top row(s) and shades on the bottom row(s)
- The bootstrap places the component at x=-500, y=-500 (off-canvas) so it doesn't interfere with token layouts
- The bootstrap only re-binds component fills when the existing binding doesn't match the current variable ID — if already correctly bound, nothing is modified
