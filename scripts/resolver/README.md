# Loom Resolver (Phase 1)

Pure JS function that merges product overrides onto the sandbox base and validates them against each component's `rules.json`.

```js
const { resolve } = require('./scripts/resolver');
const { config, errors } = resolve({ sandbox, overrides });
```

- `sandbox`   — `{ tokens, components, rules }` loaded from this repo.
- `overrides` — `{ tokens?, components? }` loaded from a product repo.
- `config`    — fully merged, ready to render.
- `errors`    — `[]` when overrides are clean; otherwise an array of `{ path, code, message }`.

**Anything not declared editable in rules.json is rejected.** Implicit lock by design.

## CLI

```bash
node scripts/resolver/cli.js <productDir>
```

Where `<productDir>` contains an `overrides/` folder. Resolved JSON goes to stdout, validation log to stderr. Exit `0` on clean, `1` on errors.

Try the bundled samples:

```bash
node scripts/resolver/cli.js sandbox/examples/writer    # ✓ exit 0
node scripts/resolver/cli.js sandbox/examples/invalid   # ✘ exit 1, 8 errors
```

## Tests

```bash
node --test scripts/resolver/__tests__/resolve.test.js
```

## Error codes

| Code | Meaning |
|---|---|
| `NO_RULES` | Component has no `rules.json` in sandbox. Override rejected wholesale. |
| `TOKEN_UNKNOWN` | Token not declared in rules → implicitly locked. |
| `TOKEN_LOCKED` | Token explicitly `editable: false`. |
| `TOKEN_BELOW_MIN` / `TOKEN_ABOVE_MAX` | Numeric range violated. |
| `TOKEN_STEP_MISMATCH` | Value not on declared step. |
| `TOKEN_NOT_IN_ENUM` | Value not in `enum`. |
| `PROP_UNKNOWN` / `PROP_LOCKED` | Prop not declared / locked. |
| `PROP_NOT_ADDABLE` / `PROP_NOT_REMOVABLE` | Tried to add/remove values without permission. |
| `PROP_DEFAULT_INVALID` | Default sits outside the allowed value universe. |
| `VARIANTS_NOT_ADDABLE` / `_NOT_REMOVABLE` / `_LOCKED` / `_OVER_MAX` | Variant collection rule violations. |
| `SIZES_NOT_ADDABLE` / `_NOT_REMOVABLE` / `_LOCKED` / `_OVER_MAX` | Size collection rule violations. |
| `STATE_UNKNOWN` / `STATE_LOCKED` | State editing not permitted. |
| `SLOT_UNKNOWN` / `SLOT_LOCKED` | Slot edit not permitted. |

## Removing things

To remove a variant/size in an override, set its value to `null`. The resolver strips nulls from the final config and gates removal through the rule's `removable` and `locked` keys.

```json
{ "components": { "button": { "sizes": { "sm": null } } } }
```
