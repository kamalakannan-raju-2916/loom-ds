# Loom DS - Architecture

> Canonical reference for personas, repository topology, the override model, and the sandbox-bump notification flow.
> If anything in this doc disagrees with code, **this doc wins** until updated.

---

## 1. Personas

| Persona | Where they work | Repo write access | Catalogue UI capability |
|---|---|---|---|
| **Maker** | Sandbox repo (this repo) | ✅ Sandbox | Read everywhere |
| **Team Admin** | Their product repo | ✅ Product (admin) | Manage roles, accept sandbox bumps, edit |
| **Designer** | Their product repo | ✅ Product (via UI) | Edit + commit from catalogue |
| **Developer** | Their product repo | ❌ Read-only | View + copy Lyte code |

**Sandbox is sealed.** No persona other than Maker may commit to it. The catalogue UI never exposes a write path to sandbox. (The Death Star plans stay with the architects.)

---

## 2. Repository topology

Two-repo trust boundary:

```
loom-ds-sandbox        ← this repo. Makers only.
  └─ Published as @loom/sandbox@x.y.z (SemVer)

loom-ds-writer         ← Writer team. Consumes @loom/sandbox.
loom-ds-books          ← Books team.
loom-ds-rfp            ← RFP team.
…                      ← one repo per product.
```

Each product repo:

```
loom-ds-<product>/
├─ package.json                    (deps: @loom/sandbox@^x.y.z)
├─ team.json                       (admin, designers, developers, directCommit?)
├─ overrides/
│  ├─ tokens/
│  │  ├─ primitives.json
│  │  ├─ semantics.json
│  │  ├─ typography.json
│  │  ├─ spacing.json
│  │  ├─ radius.json
│  │  ├─ shadows.json
│  │  └─ motion.json
│  ├─ components/
│  │  ├─ button.json
│  │  └─ …
│  ├─ icons.json
│  ├─ themes.json
│  ├─ density.json
│  └─ illustrations.json
└─ docs/catalog.html               (product catalogue, GitHub Pages)
```

For now the sandbox repo also hosts a derivable example product (`tokens/products/writer/`) so we can iterate without spinning a second repo. When Phase 3 lands we lift that product into its own repo.

---

## 3. Decisions (locked)

| # | Decision | Choice |
|---|---|---|
| 1 | Hosting | **GitHub Pages** per repo (sandbox + each product). |
| 2 | Auth | **GitHub App** ("Loom Catalogue") installed per product repo with `contents:write` + `pull_requests:write`. Sandbox repo gets the app installed in **read-only** mode so the catalogue can render but never write. |
| 3 | Component inventory v1 | Button, Input, Select/Dropdown, Checkbox, Radio, Modal, Tooltip, Tabs, Table, Toast. Built collaboratively with **Kicha** (krishnakumar.gh@zohocorp.com). See §7. |
| 4 | Versioning | **SemVer** on `@loom/sandbox`. Major = breaking; products opt in. |
| 5 | Sandbox-override policy | **Strictly monitored.** Sandbox bumps are notifications, never auto-applied. See §6. |

---

## 4. The override model

Three layers, resolved deterministically:

```
Sandbox base  +  Product overrides  =  Resolved config
   (frozen)        (gated by rules)        (rendered)
```

- **Sandbox base** - primitives, semantics, base components, `rules.json` per component.
- **Product overrides** - only the diff. Validated against the corresponding `rules.json`. Anything not declared editable in rules is **rejected** by the resolver before commit.
- **Resolved config** - what the catalogue renders and what `Copy Lyte code` emits.

The resolver is a pure function: `resolve(sandbox, overrides) → finalConfig | ValidationError[]`.

---

## 5. `rules.json` - provisions & exceptions contract

One file per component: `sandbox/components/<name>.rules.json`.

It declares what designers can/can't change. The schema lives at [sandbox/rules.schema.json](sandbox/rules.schema.json); a worked example for Button at [sandbox/components/button.rules.json](sandbox/components/button.rules.json).

**Top-level groups a rule file may declare:**

| Group | Purpose |
|---|---|
| `tokens` | Per-CSS-variable knobs (editable, source binding, range/enum, unit). |
| `props` | Per Lyte attribute/prop (editable values, addable new values). |
| `slots` | Slot composition rules (icon-left, icon-right, etc.). |
| `variants` | Whether designers can add/remove variants. |
| `sizes` | Whether designers can add/remove sizes; min/max per dimension. |
| `states` | Editable state styling (hover/active/disabled/loading). |
| `a11y` | Locked accessibility floors (focus ring, min tap target, ARIA). |

Anything **not** declared in `rules.json` is implicitly **locked**.

---

## 6. Sandbox-bump notification flow

When Makers publish `@loom/sandbox@x.y.z`:

1. **Renovate / Dependabot** opens a PR on each product repo bumping the dep.
2. The catalogue page detects the available bump and shows a banner to **Admin + Designers + Developers**:
   > "Sandbox v1.4.0 is available. 3 components changed. Review →"
3. **Review screen** (Admin/Designer only):
   - Side-by-side diff per component (tokens, props, rules).
   - Flags overrides that would become **invalid** under new rules.
   - Per-change accept / defer toggles.
4. **Accept** → catalogue triggers commit (PR or direct per `team.json.directCommit`).
5. On merge → catalogue + Figma sync re-run, downstream consumers see the change.

Devs see the banner read-only - they cannot accept, but they're aware change is coming.

**Override conflict policy:** if a sandbox bump invalidates an existing override (e.g., a token was removed, an enum value pruned), the resolver marks it as `requires-resolution`. The product cannot deploy until Admin/Designer chooses keep-old (pin sandbox), drop-override, or migrate-to-new.

---

## 7. Kicha collaboration (Phase 0 → Phase 1)

Kicha is building basic components + semantics in parallel. Plan:

- **Kicha owns:** `sandbox/components/` source (the actual Lyte component scaffolds) and contributes the semantic token additions to `tokens/semantic/colors.json`.
- **We own:** `rules.json` per component (the provisions contract), the resolver, the catalogue UI, sandbox-bump UX.
- **Sync points:** Each new base component lands as a PR with both the Lyte source and a draft `rules.json`. We review the rules together. No merge to `main` without both.
- **Branch convention:** `feat/component-<name>` per component. Squash-merge.
- **Versioning:** Each new component = minor bump. Behavior change = patch. Removing/renaming = major.

---

## 8. Designer toolbox (v1 surface)

| Capability | File touched | Gate |
|---|---|---|
| Brand primitives | `overrides/tokens/primitives.json` | DSG-allowed colors only |
| Semantics + WCAG | `overrides/tokens/semantics.json` | Live AA/AAA contrast checker (Large/Small/Graphic) |
| Typography | `overrides/tokens/typography.json` | Family, size scale, line-height, weight |
| Spacing | `overrides/tokens/spacing.json` | Spacing scale, density modes |
| Radius / shadow / motion | `overrides/tokens/{radius,shadows,motion}.json` | Token scales |
| Component tweaks | `overrides/components/<name>.json` | Gated by `rules.json` |
| Icons | `overrides/icons.json` | Pick set + per-size mapping |
| Themes (modes) | `overrides/themes.json` | Enable Light/Dark/Grey/HC |
| Density | `overrides/density.json` | Compact/comfortable/spacious |
| Illustrations | `overrides/illustrations.json` | Optional empty-state art |

**Locked (Maker-only):** component HTML structure, Lyte JS behavior, accessibility floors (focus ring, ≥44px tap target, semantic HTML), `--focus-ring-width`, brand-agnostic primitives.

---

## 9. WCAG live-check (semantics editor)

Per WCAG 2.2 thresholds:

| Audience | AA | AAA |
|---|---|---|
| Small text (<18pt or <14pt bold) | ≥ 4.5 : 1 | ≥ 7.0 : 1 |
| Large text (≥18pt or ≥14pt bold) | ≥ 3.0 : 1 | ≥ 4.5 : 1 |
| Graphics / UI components | ≥ 3.0 : 1 | - |

Computed client-side against every paired surface in both Light and Dark modes. Designer cannot save a semantic that fails AA Small without an explicit "I accept" override (logged in commit message).

---

## 10. Roadmap (recap)

- **Phase 0 (here):** persona contract, repo topology, `rules.schema.json`, sample Button rules.
- **Phase 1:** `resolve()` function + validator.
- **Phase 2:** Sandbox catalogue refresh (rules visible in UI, WCAG checker).
- **Phase 3:** First product repo template (`loom-ds-writer`).
- **Phase 4:** Designer edit UI (token + component editors, live preview).
- **Phase 5:** GitHub App + commit-from-browser + `team.json` admin.
- **Phase 6:** Developer "Copy Lyte code".
- **Phase 7:** Product creation wizard.
