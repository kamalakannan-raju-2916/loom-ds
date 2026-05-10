# Loom DS - __PRODUCT__

This repo holds the Loom Design System overrides for **__PRODUCT__**. It depends on `@loom/sandbox` (the sealed base) and stores only the diff that makes __PRODUCT__ visually & behaviorally distinct.

## Quickstart

```bash
npm install
npm run resolve            # validate overrides against sandbox rules
```

## Layout

```
overrides/
├─ tokens/
│  ├─ primitives.json    # brand colors (DSG-allowed only)
│  ├─ semantics.json     # role tokens with WCAG checks
│  ├─ typography.json    # (optional) font scale
│  ├─ spacing.json       # (optional) spacing scale
│  ├─ radius.json        # (optional)
│  ├─ shadows.json       # (optional)
│  └─ motion.json        # (optional)
└─ components/
   └─ <name>.json        # gated by sandbox/components/<name>.rules.json
team.json                 # admin, designers, developers, directCommit
```

## Roles

See [`team.json`](team.json). Roles drive what the catalogue UI lets each user do.

| Role | Catalogue UI | Repo writes |
|---|---|---|
| Admin | Full edit + role management + accept sandbox bumps | ✅ |
| Designer | Edit tokens & components (gated by sandbox rules) | ✅ via UI |
| Developer | View-only + Copy Lyte code | ❌ |

## Sandbox bumps

When `@loom/sandbox` publishes a new version, the catalogue page shows a banner. Admin/Designer reviews the diff and accepts or defers. See [architecture.md §6 in the sandbox repo](https://github.com/kamalakannan-raju-2916/loom-ds/blob/main/architecture.md#6-sandbox-bump-notification-flow).

## Don't edit

- Sandbox source. This repo never writes upstream.
- Anything not declared `editable: true` in a component's `rules.json`.

The resolver enforces both - `npm run resolve` will fail your CI if you try.
