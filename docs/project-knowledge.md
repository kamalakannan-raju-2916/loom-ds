# Loom Design System - Project Knowledge

> **Version:** 1.0.0  
> **Maintained by:** Zoho Writer Design Team  
> **Products:** Zoho Writer, Zoho PDF Editor, Zoho RFP, Kanaa (and future Office Suite products)  
> **Source of truth:** GitHub repository `zoho-office/loom-ds`  
> **WCAG compliance:** AA (mandatory target), AAA (wherever possible)

---

## 1. What is Loom?

Loom is the unified design system for Zoho's Office Suite products. It provides a single set of design tokens, components, patterns, and accessibility rules that ensure visual and behavioral consistency across Writer, PDF Editor, RFP, Kanaa, and any future products added to the suite.

The name "Loom" reflects its purpose: weaving consistent patterns across products while allowing each product to retain its identity through accent color theming.

### Who uses Loom?

- **Designers** - create UI screens using Loom tokens and components in Figma and Claude
- **HTML developers** - consume CSS custom properties and component markup from the Loom GitHub repo
- **Product managers** - reference Loom documentation for feature spec consistency

### Design governance

Loom follows the Zoho DSG (Design Standard Groups) standards. DSG defines the global color palette, typography scales, and foundational UI rules that apply across all Zoho Corp products. Loom extends DSG standards with product-specific semantic tokens and components tailored for office/productivity applications.

**Rule: Never override DSG primitives.** If a color, font, or spacing value exists in DSG, Loom references it - it does not redefine it.

---

## 2. Token Architecture

Loom uses a three-tier token system. This is critical to understand - every design decision flows through these tiers.

### Tier 1: Primitive Tokens (Global)

Raw values with no semantic meaning. These come directly from DSG.

**Naming:** `{category}.{family}.{variant}`

Examples:
- `primitive.color.cornflower.base` → `#2D78FF`
- `primitive.color.cornflower.t80` → `#C0D7FF`
- `primitive.color.grey.s60` → `#626262`

**Token variable naming convention:**

In the repo (JSON files, CSS custom properties, code references), primitive colors use underscore-delimited lowercase names:

```
cornflower_t100, cornflower_t90, cornflower_t80, ... cornflower_t10
cornflower_s10, cornflower_s20, ... cornflower_s100
fern_t100, fern_t90, ... fern_t10
fern_s10, fern_s20, ... fern_s100
cardinal_t100, ... cardinal_s100
sunshine_t100, ... sunshine_s100
teal_t100, ... teal_s100
plum_t100, ... plum_s100
grey_t100, grey_t90, ... grey_t00
grey_s00, grey_s05, grey_s10, ... grey_s100
```

> **Note:** Figma variables retain their existing naming convention (e.g., "Cornflower/T 100", "Cornflower/S 10") and are NOT renamed to match the repo convention. The mapping between Figma names and repo token names is handled by the sync skill.

**Color scale convention (from DSG):**
- `base` = the canonical accent color
- `s10–s100` = shades (progressively darker, mixed toward black)
- `t10–t100` = tints (progressively lighter, mixed toward white)
- Grey is special: `s00–s100` runs light-to-dark (for light mode surfaces), `t00–t100` runs dark-to-light (for dark mode surfaces)

### Tier 2: Semantic/Alias Tokens

These map primitives to UI roles. **This is where theming happens.** Each semantic token has three modes: Light, Dark, and Grey.

**Naming:** `{role}.{element}.{property}.{variant}`

**Surface tokens:**
| Token | Light | Dark | Grey |
|---|---|---|---|
| `surface.page` | `#FFFFFF` | `grey.t05` (#141516) | `grey.s05` (#E9E9E9) |
| `surface.primary` | `#FFFFFF` | `grey.t10` (#202123) | `grey.s00` (#F5F5F5) |
| `surface.secondary` | `grey.s00` (#F5F5F5) | `grey.t05` (#141516) | `grey.s05` (#E9E9E9) |
| `surface.tertiary` | `grey.s05` (#E9E9E9) | `grey.t00` (#07080A) | `grey.s10` (#DCDCDC) |
| `surface.elevated` | `#FFFFFF` | `grey.t20` (#39393B) | `#FFFFFF` |
| `surface.overlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.7)` | `rgba(0,0,0,0.5)` |

**Text tokens:**
| Token | Light | Dark | Grey |
|---|---|---|---|
| `text.primary` | `grey.s90` (#181818) | `grey.t90` (#E7E7E7) | `grey.s90` (#181818) |
| `text.secondary` | `grey.s60` (#626262) | `grey.t60` (#9C9C9D) | `grey.s60` (#626262) |
| `text.tertiary` | `grey.s40` (#939393) | `grey.t40` (#6A6B6C) | `grey.s40` (#939393) |
| `text.disabled` | `grey.s20` (#C4C4C4) | `grey.t20` (#39393B) | `grey.s20` (#C4C4C4) |
| `text.on-accent` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| `text.link` | `#006AFF` | `#00A6FF` | `#006AFF` |
| `text.link-visited` | `charoite.base` (#663399) | `charoite.t50` (#A385C2) | `charoite.base` (#663399) |

**Border tokens:**
| Token | Light | Dark | Grey |
|---|---|---|---|
| `border.default` | `grey.s10` (#DCDCDC) | `grey.t20` (#39393B) | `grey.s10` (#DCDCDC) |
| `border.strong` | `grey.s20` (#C4C4C4) | `grey.t30` (#525354) | `grey.s20` (#C4C4C4) |
| `border.subtle` | `grey.s05` (#E9E9E9) | `grey.t10` (#202123) | `grey.s05` (#E9E9E9) |
| `border.focus` | `cornflower.base` (#2D78FF) | `cornflower.t30` (#5793FF) | `cornflower.base` (#2D78FF) |

**Status tokens (same pattern for each status):**
| Role | Color family | Light bg | Light text | Dark bg | Dark text |
|---|---|---|---|---|---|
| `status.success` | Fern | `fern.t100` | `fern.s30` | `fern.s60` | `fern.t60` |
| `status.warning` | Tangerine | `tangerine.t100` | `tangerine.s50` | `tangerine.s70` | `tangerine.t50` |
| `status.danger` | Cardinal | `cardinal.t100` | `cardinal.s10` | `cardinal.s60` | `cardinal.t50` |
| `status.info` | Cornflower | `cornflower.t100` | `cornflower.s10` | `cornflower.s60` | `cornflower.t50` |

**Product accent tokens (Tier 2.5 - product-specific):**

Each product selects its own accent from the DSG palette. The accent token resolves differently per product:

| Token | Writer | PDF Editor | RFP | Kanaa |
|---|---|---|---|---|
| `accent.primary` | `cornflower.base` | `cardinal.base` | `fern.base` | `cerulean.base` |
| `accent.hover` | `cornflower.s10` | `cardinal.s10` | `fern.s10` | `cerulean.s10` |
| `accent.active` | `cornflower.s20` | `cardinal.s20` | `fern.s20` | `cerulean.s20` |
| `accent.subtle` | `cornflower.t90` | `cardinal.t90` | `fern.t90` | `cerulean.t90` |
| `accent.muted` | `cornflower.t100` | `cardinal.t100` | `fern.t100` | `cerulean.t100` |

### Tier 3: Component Tokens

Scoped to specific components. These reference semantic tokens.

Example for Button:
```
button.primary.bg         → {accent.primary}
button.primary.bg-hover   → {accent.hover}
button.primary.bg-active  → {accent.active}
button.primary.text       → {text.on-accent}
button.primary.border     → transparent
button.secondary.bg       → transparent
button.secondary.bg-hover → {accent.muted}
button.secondary.text     → {accent.primary}
button.secondary.border   → {border.default}
button.ghost.bg           → transparent
button.ghost.bg-hover     → {surface.secondary}
button.ghost.text         → {text.primary}
```

---

## 3. Typography

### Font stack
- **Primary:** Zoho Puvi (Zoho's proprietary font) - fallback to system sans-serif
- **Monospace:** Zoho Puvi Mono → fallback to `"SF Mono", "Fira Code", monospace`
- **Document content (Writer):** Supports user-selected fonts; UI chrome always uses Zoho Puvi

### Type scale
| Role | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|
| `display` | 32px | 600 | 40px | -0.02em |
| `heading-1` | 24px | 600 | 32px | -0.01em |
| `heading-2` | 20px | 600 | 28px | -0.01em |
| `heading-3` | 16px | 600 | 24px | 0 |
| `body-large` | 16px | 400 | 24px | 0 |
| `body` | 14px | 400 | 20px | 0 |
| `body-small` | 13px | 400 | 18px | 0.01em |
| `caption` | 12px | 400 | 16px | 0.02em |
| `overline` | 11px | 600 | 16px | 0.08em |

### Font weight map
| Name | Value | Usage |
|---|---|---|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Labels, emphasis |
| Semibold | 600 | Headings, buttons |
| Bold | 700 | Rare - data emphasis only |

---

## 4. Spacing & Layout

### Spacing scale (4px base unit)
| Token | Value | Usage |
|---|---|---|
| `space.0` | 0px | - |
| `space.1` | 4px | Tight internal gaps |
| `space.2` | 8px | Default internal padding |
| `space.3` | 12px | Between related elements |
| `space.4` | 16px | Standard component padding |
| `space.5` | 20px | Section gaps |
| `space.6` | 24px | Card padding |
| `space.8` | 32px | Between sections |
| `space.10` | 40px | Page margins |
| `space.12` | 48px | Major section separators |
| `space.16` | 64px | Page-level spacing |

### Border radius
| Token | Value | Usage |
|---|---|---|
| `radius.none` | 0px | Tables, sharp elements |
| `radius.sm` | 4px | Small elements (tags, badges) |
| `radius.md` | 6px | Buttons, inputs, cards |
| `radius.lg` | 8px | Modals, panels, dropdowns |
| `radius.xl` | 12px | Floating elements, tooltips |
| `radius.full` | 9999px | Pills, avatars |

### Elevation / Shadow
| Token | Value | Usage |
|---|---|---|
| `shadow.sm` | `0 1px 2px rgba(0,0,0,0.06)` | Subtle lift |
| `shadow.md` | `0 2px 8px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `shadow.lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, popovers |
| `shadow.xl` | `0 16px 48px rgba(0,0,0,0.16)` | Floating panels |

In Dark mode, shadows use `rgba(0,0,0,0.3)` base instead of `0.06–0.16`.

---

## 5. Iconography

- **Style:** Outlined (1.5px stroke), with filled variants for active/selected states
- **Grid:** 24×24px canvas with 20×20px live area, 2px padding
- **Stroke:** 1.5px uniform, round caps and joins
- **Minimum size:** 16×16px (simplified glyph below this size)
- **Touch target:** Always 44×44px minimum regardless of visual size

---

## 6. Component Specifications

### Button

**Sizes:**
| Size | Height | Padding (h) | Font size | Icon size |
|---|---|---|---|---|
| Small | 28px | 12px | 12px | 14px |
| Medium | 36px | 16px | 14px | 16px |
| Large | 44px | 20px | 16px | 20px |

**Variants:** Primary (filled accent), Secondary (outlined), Ghost (text only), Danger (cardinal filled), Icon-only (square aspect)

**States:** Default, Hover, Active/Pressed, Focused, Disabled, Loading

**Accessibility:**
- Focus ring: 2px solid `border.focus`, 2px offset
- Disabled: 40% opacity, `pointer-events: none`, `aria-disabled="true"`
- Loading: spinner replaces label, `aria-busy="true"`, button disabled
- Icon-only buttons MUST have `aria-label`
- Minimum touch target: 44×44px (even for Small size, use padding)

### Input / Text Field

**Sizes:** Small (28px), Medium (36px), Large (44px)

**Anatomy:** Label (above) + Input container + Helper text (below) + Optional leading/trailing icon

**States:** Default, Hover, Focused, Error, Disabled, Read-only

**Accessibility:**
- Label is REQUIRED - either visible or `aria-label`
- Error state: `aria-invalid="true"`, `aria-describedby` pointing to error message
- Helper text: linked via `aria-describedby`
- Placeholder is NOT a substitute for label

### Select / Dropdown

Same sizes as Input. Opens a listbox panel with `role="listbox"`, each option has `role="option"`. Full keyboard navigation: Arrow keys move focus, Enter selects, Escape closes, Type-ahead search.

### Checkbox & Radio

- Visual size: 18×18px
- Touch target: 44×44px
- Label must be clickable
- Group: wrap in `fieldset` with `legend`
- Indeterminate state supported for Checkbox

### Toggle / Switch

- Track: 36×20px (medium)
- Thumb: 16×16px
- MUST have visible label - toggle alone is insufficient
- `role="switch"`, `aria-checked`

### Modal / Dialog

- Max width: 480px (small), 640px (medium), 800px (large)
- Focus trap: Tab cycles within modal
- Escape key closes
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → title
- Return focus to trigger element on close
- Overlay: `surface.overlay` token

### Tooltip

- Max width: 240px
- `role="tooltip"`, triggered element has `aria-describedby`
- Delay: 300ms show, 100ms hide
- Never put interactive content inside tooltips

### Toast / Notification

- Position: bottom-center or top-right
- Auto-dismiss: 5s default (configurable)
- `role="status"` or `role="alert"` (for errors)
- Must be dismissible via close button
- Never use as the only feedback mechanism for critical actions

### Card

- Default padding: `space.6` (24px)
- Border: 1px solid `border.default`
- Radius: `radius.lg`
- Clickable cards: `role="link"` or `role="button"`, full-card click target
- Must NOT nest interactive elements (buttons) inside clickable cards

### Sidebar / Navigation

- Width: 240px (expanded), 56px (collapsed)
- Active item: accent background (`accent.muted`), accent text
- Keyboard: Arrow keys navigate items, Enter activates
- `role="navigation"`, `aria-label`

### Table

- Header: `surface.secondary` background, `text.secondary` color, `body-small` size
- Row height: 44px minimum
- Alternating rows: optional, use `surface.secondary` for even rows
- Sortable columns: `aria-sort`, visible indicator icon
- Selectable rows: checkbox column, `aria-selected`

### Tabs

- `role="tablist"` → `role="tab"` → `role="tabpanel"`
- `aria-selected`, `aria-controls`, `aria-labelledby`
- Arrow keys move between tabs, Tab key moves to panel content
- Active indicator: 2px accent bottom border

---

## 7. Accessibility Rules (WCAG)

### Color contrast requirements
| Element | AA (mandatory target) | AAA (wherever possible) |
|---|---|---|
| Normal text (< 18px) | 4.5:1 | 7:1 |
| Large text (≥ 18px or 14px bold) | 3:1 | 4.5:1 |
| UI components & graphical objects | 3:1 | 3:1 |
| Non-text indicators (icons, borders) | 3:1 | 3:1 |

### Mandatory checks for every component
1. All interactive elements reachable via keyboard
2. Visible focus indicator on every focusable element
3. Color is NEVER the only indicator of state (always pair with icon, text, or pattern)
4. Touch targets minimum 44×44px
5. All images have alt text (or `aria-hidden="true"` if decorative)
6. Form inputs have programmatic labels
7. Error messages are announced to screen readers
8. Heading hierarchy is sequential (no skipping levels)
9. Reduced motion: respect `prefers-reduced-motion` - disable animations
10. Content reflows at 400% zoom without horizontal scrolling

### Contrast validation per theme
Every semantic color pairing must be validated across ALL THREE themes. Common failure points:
- Warning text on warning background in Dark mode
- Disabled text readability in Grey mode
- Link color distinction from body text

---

## 8. Generating UI Screens with Loom

When a designer (or Claude) generates a UI screen, follow this process:

### Input
The designer provides one or more of:
- A text description ("settings page for Writer with sidebar navigation")
- A pencil sketch (photo or scan)
- A wireframe from Figma
- Reference to an existing screen ("similar to Writer's toolbar but for PDF Editor")

### Process
1. **Identify the product** → determines which accent color set to use
2. **Identify the theme** → Light (default), Dark, or Grey
3. **Map all UI elements to Loom components** → use the component specs above
4. **Apply semantic tokens** → never use primitive hex values directly in screens
5. **Validate accessibility** → contrast ratios, focus order, ARIA attributes
6. **Output clean HTML/CSS** using CSS custom properties that reference Loom tokens

### Output format
Always generate HTML that:
- Uses CSS custom properties (`var(--loom-surface-primary)`, etc.)
- Includes all necessary ARIA attributes
- Supports theme switching via a `data-theme="light|dark|grey"` attribute on the root
- Is responsive (mobile-first, then adapts to desktop)
- Uses the correct product accent

### CSS custom property naming convention
```
--loom-{category}-{token-path}

Examples:
--loom-surface-page
--loom-text-primary
--loom-border-default
--loom-accent-primary
--loom-space-4
--loom-radius-md
--loom-shadow-md
--loom-font-body
--loom-font-heading-1
```

---

## 9. File Structure (GitHub Repository)

```
zoho-office/loom-ds/
├── README.md
├── LICENSE
├── package.json
├── tokens/
│   ├── primitive/
│   │   ├── colors.json          ← DSG color primitives (all 28 families)
│   │   ├── typography.json      ← Font sizes, weights, line heights
│   │   ├── spacing.json         ← 4px-based spacing scale
│   │   └── radii.json           ← Border radius values
│   ├── semantic/
│   │   ├── light.json           ← Light theme alias mappings
│   │   ├── dark.json            ← Dark theme alias mappings
│   │   └── grey.json            ← Grey theme alias mappings
│   ├── component/
│   │   ├── button.json
│   │   ├── input.json
│   │   ├── modal.json
│   │   └── ...
│   └── product/
│       ├── writer.json          ← Writer accent overrides
│       ├── pdf-editor.json
│       ├── rfp.json
│       └── kanaa.json
├── css/
│   ├── loom-tokens.css          ← Generated CSS custom properties
│   ├── loom-light.css
│   ├── loom-dark.css
│   ├── loom-grey.css
│   └── loom-components.css      ← Base component styles
├── docs/
│   ├── getting-started.md
│   ├── tokens.md
│   ├── components/
│   │   ├── button.md
│   │   ├── input.md
│   │   └── ...
│   ├── accessibility.md
│   └── theming.md
├── figma/
│   ├── sync-config.json         ← Tokens Studio sync configuration
│   └── FIGMA-SETUP.md
└── scripts/
    ├── build-css.js             ← Token JSON → CSS custom properties
    ├── validate-contrast.js     ← WCAG contrast ratio checker
    └── sync-figma.js            ← Push tokens to Figma Variables
```

---

## 10. Workflow Rules

### For designers adding/modifying tokens
1. Propose change in GitHub issue with rationale
2. Update the relevant JSON file in a branch
3. Run `validate-contrast.js` to check all color pairings
4. Submit pull request - requires 1 designer + 1 dev approval
5. After merge, CI generates updated CSS and Figma sync

### For designers generating screens in Claude
1. Open the "Loom Design System" Claude Project
2. Describe the screen or upload a sketch
3. Specify: product (Writer/PDF Editor/RFP/Kanaa), theme (Light/Dark/Grey)
4. Claude generates HTML using Loom tokens and components
5. Designer reviews, iterates, and exports

### For HTML developers consuming Loom
1. Include `loom-tokens.css` + theme-specific CSS (light/dark/grey)
2. Include `loom-components.css` for base component styles
3. Use CSS custom properties in all styling - never hardcode values
4. Reference component docs for markup patterns and ARIA requirements

---

## 11. DSG Primary Accent Colors (Quick Reference)

| Name | Hex | Usage |
|---|---|---|
| Cornflower | `#2D78FF` | Primary accent, Zoho Writer |
| Cobalt | `#2C66DD` | Primary blue accent (legacy/alt) |
| Cardinal | `#CC3929` | Error states, Zoho PDF Editor |
| Fern | `#0C8844` | Success states, Zoho RFP |
| Tangerine | `#EBB625` | Warning states |

### Extended palette families
Blues: Brunnera, Cerulean, Cornflower, Sapphire, Lapis, Indigo, Teal
Reds: Burgundy, Maroon, Crimson, Persimmon, Flamingo, Cerise
Greens: Spurge, Jade, Shamrock, Laurel, Parsley, Olive
Purples: Plum, Charoite, Sugilite
Warm: Sunshine, Clay
Neutral: Grey (with dedicated light-mode shades and dark-mode tints)

### Hyperlink colors (DSG approved)
- Light mode: `#006AFF` (4.66:1 contrast ratio)
- Dark mode: `#00A6FF` (6.06:1 contrast ratio)

---

## 12. Do's and Don'ts

### Do
- Always use semantic tokens in UI screens, not primitive hex values
- Validate every screen against all three themes before handoff
- Use the component specs - don't reinvent buttons, inputs, etc.
- Test keyboard navigation for every interactive element
- Include ARIA attributes in every component instance
- Follow the DSG naming conventions for any new color additions

### Don't
- Override DSG primitive colors - ever
- Use color as the only state indicator
- Skip focus management in modals and dropdowns
- Use placeholder text instead of labels
- Hardcode hex values in CSS - always use custom properties
- Create new spacing values outside the 4px scale
- Nest interactive elements inside clickable containers
