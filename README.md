# Loom Design System

> A unified design system for Zoho products — built on DSG standards, implemented with Lyte components.

Loom weaves consistent UI patterns across any Zoho product that adopts it. It provides design tokens following Zoho DSG (Design Standard Groups) guidelines and component implementations using the [Lyte framework](https://lyteframework.com).

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
| Figma sync | Tokens Studio plugin connected to this repo |

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

### For designers

1. Install [Tokens Studio for Figma](https://tokens.studio)
2. Connect to this repo using the config in `figma/sync-config.json`
3. Sync — tokens appear as Figma Variables with Light/Dark modes

---

## Repository Structure

```
loom-ds/
├── tokens/
│   └── primitive/
│       └── colors.json          ← DSG primitive color tokens (616 tokens, 28 families)
├── docs/
│   └── project-knowledge.md     ← Full token spec and design rules
├── README.md
└── SETUP-GUIDE.md
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

1. Clone the repo
2. Create a feature branch
3. Make changes (tokens, components, docs)
4. Submit a pull request for review

**Rule:** Never override DSG primitives. If a value exists in DSG, Loom references it — it does not redefine it.

## Documentation

- [Getting started](docs/getting-started.md)
- [Token reference](docs/tokens.md)
- [Component specs](docs/components/)
- [Accessibility guide](docs/accessibility.md)
- [Theming guide](docs/theming.md)

## Contributing

1. Create an issue describing the proposed change
2. Branch from `main`, make your changes
3. Run `npm run validate` to check contrast and token integrity
4. Submit a PR — requires 1 designer + 1 developer approval

## License

Internal use only — Zoho Corporation.
