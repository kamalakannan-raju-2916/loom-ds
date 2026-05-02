# Loom Design System

> The unified design system for Zoho's Office Suite — Writer, PDF Editor, RFP, Kanaa, and beyond.

Loom weaves consistent UI patterns across products while respecting each product's identity. Built on Zoho DSG standards, it provides design tokens, component specs, and accessibility-first guidelines for both designers and HTML developers.

## Quick start

### For HTML developers

```html
<!-- Include base tokens + your theme -->
<link rel="stylesheet" href="css/loom-tokens.css" />
<link rel="stylesheet" href="css/loom-light.css" />
<link rel="stylesheet" href="css/loom-components.css" />

<!-- Switch themes via data attribute -->
<html data-theme="light" data-product="writer">
```

```css
/* Use Loom tokens in your CSS */
.my-panel {
  background: var(--loom-surface-primary);
  color: var(--loom-text-primary);
  border: 1px solid var(--loom-border-default);
  border-radius: var(--loom-radius-lg);
  padding: var(--loom-space-6);
}
```

### For designers

1. Install [Tokens Studio for Figma](https://tokens.studio)
2. Connect to this repo using the config in `figma/sync-config.json`
3. Sync — all tokens appear as Figma Variables with Light/Dark/Grey modes

## Architecture

```
Primitive tokens (DSG)     →  Raw values: colors, sizes, weights
        ↓
Semantic tokens (Loom)     →  UI roles: surface, text, border, status
        ↓
Component tokens (Loom)    →  Scoped: button.primary.bg, input.border
        ↓
Product tokens (per-app)   →  Accent overrides: Writer=Cobalt, PDF=Cardinal
```

## Themes

Every token resolves across two themes:

| Theme | Surface | Text | Purpose |
|---|---|---|---|
| **Light** | White base | Dark text | Default, most contexts |
| **Dark** | Near-black base | Light text | Low-light, night mode |

## Accessibility

Loom targets WCAG AA as mandatory and AAA wherever possible:

- Normal text contrast: ≥ 4.5:1 (AA mandatory) / 7:1 (AAA preferred)
- Large text contrast: ≥ 3:1 (AA mandatory) / 4.5:1 (AAA preferred)
- All interactive elements keyboard accessible
- Touch targets: minimum 44×44px
- Color never used as sole state indicator

Run `npm run validate:contrast` to check all token pairings.

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
