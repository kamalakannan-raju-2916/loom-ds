# Loom Design System

> A unified design system for Zoho products — built on DSG standards, implemented with Lyte components.

Loom weaves consistent UI patterns across any Zoho product that adopts it. It provides design tokens following Zoho DSG (Design Standard Groups) guidelines and component implementations using the [Lyte framework](https://lyteframework.com).

<p align="center">
  <a href="https://kamalakannan-raju-2916.github.io/loom-ds/catalog.html">
    <img src="https://img.shields.io/badge/🎨_Designers_Click_Here-2C66DD?style=for-the-badge&logoColor=white" alt="Designers Click Here">
  </a>
</p>

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│  DSG (Zoho Design Standard Groups)                      │
│  Global standards: colors, typography, spacing, icons   │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Loom Design Tokens                                     │
│  Primitive → Semantic → Component tokens                │
│  Light & Dark themes, WCAG AA compliant                 │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Lyte Components                                        │
│  HTML/CSS implementation using Lyte framework (v3.9)    │
│  lyte-component, templates, data binding, routing       │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Zoho Products                                          │
│  Any product that adopts Loom gets themed components    │
└─────────────────────────────────────────────────────────┘
```

---

## Token Architecture

Tokens flow through three tiers — every design decision traces back to DSG primitives.

| Tier | Source | Purpose | Example |
|---|---|---|---|
| **Primitive** | DSG | Raw values (no meaning) | `cobalt.base` → `#2C66DD` |
| **Semantic** | Loom | UI roles (themed) | `surface.primary`, `text.secondary` |
| **Component** | Loom | Scoped to component | `button.primary.bg`, `input.border` |

---

## Themes

| Theme | Surface | Text | Purpose |
|---|---|---|---|
| **Light** | White base | Dark text | Default |
| **Dark** | Near-black base | Light text | Low-light / night mode |

Themes are applied via a `data-theme` attribute:

```html
<html data-theme="light">
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Design tokens | JSON (DTCG format), CSS custom properties |
| Component framework | [Lyte](https://lyteframework.com) v3.9 |
| UI components | `@zoho/lyte-ui-component` (buttons, dropdowns, modals, tables, etc.) |
| Styling | CSS with `--loom-*` custom properties |
| Figma sync | Figma Desktop Bridge (no plugins needed) |

---

## Quick Start

### Using Loom tokens in a Lyte component

```css
/* component.css */
.panel {
  background: var(--loom-surface-primary);
  color: var(--loom-text-primary);
  border: 1px solid var(--loom-border-default);
  border-radius: var(--loom-radius-lg);
  padding: var(--loom-space-6);
}
```

```html
<!-- component.html (Lyte template) -->
<template tag-name="loom-panel">
  <div class="panel">
    <lyte-yield yield-name="content"></lyte-yield>
  </div>
</template>
```

### For designers (Figma)

Loom uses the **Figma Desktop Bridge** and AI skills to manage design tokens — no third-party plugins (like Tokens Studio) required.

#### Primitive colors (DSG palettes)
1. Open your Figma file with the Desktop Bridge connected
2. Provide a DSG accent hex code (e.g. `#2C66DD` for Cobalt, or say "Grey")
3. The skill generates the full palette: tints, shades, master swatch — all bound to a **Primitives** variable collection

→ See [`.github/skills/dsg-color-tokens-generator/SKILL.md`](.github/skills/dsg-color-tokens-generator/SKILL.md)

#### Semantic tokens (Light/Dark themes)
1. Say "sync tokens" with the Desktop Bridge connected
2. The skill reads `tokens/semantic/*.json` and creates/updates a **Semantic** variable collection with Light and Dark modes
3. Re-run anytime tokens change — it's idempotent

→ See [`.github/skills/semantic-token-sync/SKILL.md`](.github/skills/semantic-token-sync/SKILL.md)

#### Export components (Figma → Repo)
1. Design your components in Figma using Loom semantic variables
2. Select the component(s) and say "export button for Writer"
3. The skill extracts structure, variable bindings, and properties → writes to `tokens/products/writer/components/`

→ See [`.github/skills/figma-component-export/SKILL.md`](.github/skills/figma-component-export/SKILL.md)

---

## Repository Structure

```
loom-ds/
├── .github/
│   └── skills/
│       ├── dsg-color-tokens-generator/
│       │   └── SKILL.md                 ← DSG color palettes → Figma
│       ├── semantic-token-sync/
│       │   └── SKILL.md                 ← Semantic tokens → Figma
│       └── figma-component-export/
│           └── SKILL.md                 ← Figma components → Repo
├── tokens/
│   ├── primitive/
│   │   └── colors.json              ← DSG primitive colors (616 tokens, 28 families)
│   ├── semantic/
│   │   └── colors.json              ← Semantic tokens (Light/Dark)
│   ├── components/
│   │   ├── button.json              ← Button component tokens
│   │   └── input.json               ← Input component tokens
│   └── products/
│       └── writer/
│           ├── config.json              ← Writer product config (accent, components)
│           └── components/              ← Figma-exported component specs
├── docs/
│   ├── index.html                   ← Landing page (Designers Click Here)
│   ├── catalog.html                 ← Product catalog (color palettes)
│   └── project-knowledge.md         ← Full token spec and design rules
├── README.md
└── SETUP-GUIDE.md
```

---

## Workflow

```
┌───────────────────────────────────────────────────────────┐
│  1. Maintainer defines tokens in repo JSON             │
└─────────────────────────────┬─────────────────────────────┘
                              │  push (skill)
                              ▼
┌───────────────────────────────────────────────────────────┐
│  2. Figma receives variables (Primitives + Semantic)   │
└─────────────────────────────┬─────────────────────────────┘
                              │  designer builds
                              ▼
┌───────────────────────────────────────────────────────────┐
│  3. Designer creates components using those variables  │
└─────────────────────────────┬─────────────────────────────┘
                              │  export (skill)
                              ▼
┌───────────────────────────────────────────────────────────┐
│  4. Component specs pushed back to repo (per product)  │
└───────────────────────────────────────────────────────────┘
```

---

## Accessibility

Loom targets **WCAG AA** as mandatory, **AAA** wherever possible:

- Normal text contrast: ≥ 4.5:1 (AA) / 7:1 (AAA preferred)
- Large text contrast: ≥ 3:1 (AA) / 4.5:1 (AAA preferred)
- All interactive elements keyboard accessible
- Touch targets: minimum 44×44px
- Color never used as sole state indicator

---

## Contributing

1. Create an issue describing the proposed change
2. Branch from `main`, make your changes
3. Submit a PR — requires maintainer approval

**Rule:** Never override DSG primitives. If a value exists in DSG, Loom references it — it does not redefine it.

## License

Internal use only — Zoho Corporation.
