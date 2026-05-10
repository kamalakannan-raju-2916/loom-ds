// AUTO-GENERATED from scripts/resolver/index.js by scripts/build-sandbox-data.js
// Do not edit by hand. Re-run the build to refresh.

(function () {
  'use strict';
  // Loom DS - Override Resolver (Phase 1)
  //
  // Pure function:  resolve({ sandbox, overrides }) -> { config, errors }
  //
  //   sandbox   = { tokens, components, rules }   (base from @loom/sandbox)
  //   overrides = { tokens?, components? }         (product diff)
  //   config    = { tokens, components }           (resolved, ready to render)
  //   errors    = ValidationError[]                (empty when overrides are clean)
  //
  // Anything not declared editable in a component's rules.json is rejected.
  // No filesystem, no I/O. The CLI wraps this for disk reads.

  /** @typedef {{ path: string, code: string, message: string }} ValidationError */

  function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }

  function deepMerge(base, patch) {
    if (!isPlainObject(base)) return patch;
    if (!isPlainObject(patch)) return patch;
    const out = { ...base };
    for (const key of Object.keys(patch)) {
      out[key] = deepMerge(base[key], patch[key]);
    }
    return out;
  }

  function pushErr(errors, path, code, message) {
    errors.push({ path, code, message });
  }

  // ---------------------------------------------------------------------------
  // Per-block validators. Each validates a slice of an override against rules
  // and pushes errors. They never throw on bad data - they collect.
  // ---------------------------------------------------------------------------

  function validateTokens(tokenOverride, tokenRules, basePath, errors) {
    if (!isPlainObject(tokenOverride)) return;
    for (const [name, value] of Object.entries(tokenOverride)) {
      const rule = tokenRules && tokenRules[name];
      const path = `${basePath}.${name}`;

      if (!rule) {
        pushErr(errors, path, 'TOKEN_UNKNOWN',
          `Token "${name}" is not declared in rules.json - implicitly locked.`);
        continue;
      }
      if (rule.editable === false) {
        pushErr(errors, path, 'TOKEN_LOCKED',
          `Token "${name}" is locked: ${rule.reason || 'no reason given'}`);
        continue;
      }

      // Numeric range
      if (typeof value === 'number') {
        if (typeof rule.min === 'number' && value < rule.min) {
          pushErr(errors, path, 'TOKEN_BELOW_MIN',
            `Value ${value} below min ${rule.min}.`);
        }
        if (typeof rule.max === 'number' && value > rule.max) {
          pushErr(errors, path, 'TOKEN_ABOVE_MAX',
            `Value ${value} above max ${rule.max}.`);
        }
        if (typeof rule.step === 'number' && rule.min != null) {
          const offset = value - rule.min;
          if (Math.abs(offset % rule.step) > 1e-9) {
            pushErr(errors, path, 'TOKEN_STEP_MISMATCH',
              `Value ${value} not on step ${rule.step} from min ${rule.min}.`);
          }
        }
      }

      // Enum
      if (Array.isArray(rule.enum) && !rule.enum.includes(value)) {
        pushErr(errors, path, 'TOKEN_NOT_IN_ENUM',
          `Value ${JSON.stringify(value)} not in [${rule.enum.join(', ')}].`);
      }
    }
  }

  function validateProps(propOverride, propRules, basePath, errors) {
    if (!isPlainObject(propOverride)) return;
    for (const [name, override] of Object.entries(propOverride)) {
      const rule = propRules && propRules[name];
      const path = `${basePath}.${name}`;

      if (!rule) {
        pushErr(errors, path, 'PROP_UNKNOWN',
          `Prop "${name}" not declared in rules.json.`);
        continue;
      }
      if (rule.editable === false) {
        pushErr(errors, path, 'PROP_LOCKED',
          `Prop "${name}" is locked: ${rule.reason || 'no reason given'}`);
        continue;
      }

      // Override may set { values, default }
      if (Array.isArray(override.values)) {
        const baseValues = Array.isArray(rule.values) ? rule.values : [];
        const added = override.values.filter(v => !baseValues.includes(v));
        const removed = baseValues.filter(v => !override.values.includes(v));
        if (added.length && !rule.addable) {
          pushErr(errors, path, 'PROP_NOT_ADDABLE',
            `Cannot add values [${added.join(', ')}] - addable=false.`);
        }
        if (removed.length && !rule.removable) {
          pushErr(errors, path, 'PROP_NOT_REMOVABLE',
            `Cannot remove values [${removed.join(', ')}] - removable=false.`);
        }
      }
      if (override.default !== undefined) {
        const universe = Array.isArray(override.values) ? override.values
                       : Array.isArray(rule.values)     ? rule.values
                       : null;
        if (universe && !universe.includes(override.default)) {
          pushErr(errors, path, 'PROP_DEFAULT_INVALID',
            `Default ${JSON.stringify(override.default)} not in allowed values.`);
        }
      }
    }
  }

  function validateCollection(label, overrideMap, baseMap, rule, basePath, errors) {
    if (!isPlainObject(overrideMap)) return;
    if (!rule) return; // nothing to gate against - leave to top-level check
    const baseKeys = Object.keys(baseMap || {});
    const newKeys  = Object.keys(overrideMap);
    const added    = newKeys.filter(k => !baseKeys.includes(k));
    const lockedSet = new Set(rule.locked || []);

    if (added.length && !rule.addable) {
      pushErr(errors, `${basePath}.${label}`, `${label.toUpperCase()}_NOT_ADDABLE`,
        `Cannot add ${label} [${added.join(', ')}] - addable=false.`);
    }
    // Removal check: override is *additive* - explicit removal handled by null
    for (const [name, val] of Object.entries(overrideMap)) {
      if (val === null) {
        if (lockedSet.has(name)) {
          pushErr(errors, `${basePath}.${label}.${name}`, `${label.toUpperCase()}_LOCKED`,
            `${label} "${name}" is in rule.locked and cannot be removed.`);
        } else if (!rule.removable) {
          pushErr(errors, `${basePath}.${label}.${name}`, `${label.toUpperCase()}_NOT_REMOVABLE`,
            `Cannot remove ${label} "${name}" - removable=false.`);
        }
      }
    }
    if (typeof rule.max === 'number') {
      const finalCount = newKeys.filter(k => overrideMap[k] !== null).length
                       + baseKeys.filter(k => !(k in overrideMap)).length;
      if (finalCount > rule.max) {
        pushErr(errors, `${basePath}.${label}`, `${label.toUpperCase()}_OVER_MAX`,
          `Resulting ${label} count ${finalCount} exceeds max ${rule.max}.`);
      }
    }
  }

  function validateStates(stateOverride, stateRules, basePath, errors) {
    if (!isPlainObject(stateOverride)) return;
    for (const [name, patch] of Object.entries(stateOverride)) {
      const rule = stateRules && stateRules[name];
      const path = `${basePath}.${name}`;
      if (!rule) {
        pushErr(errors, path, 'STATE_UNKNOWN',
          `State "${name}" not declared in rules.json.`);
        continue;
      }
      if (rule.editable === false) {
        pushErr(errors, path, 'STATE_LOCKED', `State "${name}" is locked.`);
        continue;
      }
      if (patch && patch.tokens) {
        validateTokens(patch.tokens, rule.tokens, `${path}.tokens`, errors);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Component-level validator
  // ---------------------------------------------------------------------------

  function validateComponent(name, override, base, rules, errors) {
    if (!rules) {
      pushErr(errors, `components.${name}`, 'NO_RULES',
        `No rules.json found for component "${name}". Override rejected.`);
      return;
    }
    const path = `components.${name}`;
    if (override.tokens)   validateTokens(override.tokens, rules.tokens, `${path}.tokens`, errors);
    if (override.props)    validateProps(override.props, rules.props, `${path}.props`, errors);
    if (override.variants) validateCollection('variants', override.variants, base && base.variants, rules.variants, path, errors);
    if (override.sizes)    validateCollection('sizes',    override.sizes,    base && base.sizes,    rules.sizes,    path, errors);
    if (override.states)   validateStates(override.states, rules.states, `${path}.states`, errors);

    // Slot edits: if rules.slots present, gate by editable
    if (override.slots && rules.slots) {
      for (const [slot, slotPatch] of Object.entries(override.slots)) {
        const slotRule = rules.slots[slot];
        const slotPath = `${path}.slots.${slot}`;
        if (!slotRule) {
          pushErr(errors, slotPath, 'SLOT_UNKNOWN', `Slot "${slot}" not declared.`);
        } else if (slotRule.editable === false) {
          pushErr(errors, slotPath, 'SLOT_LOCKED',
            `Slot "${slot}" is locked: ${slotRule.reason || 'no reason given'}`);
        }
        // (accepts/iconSizeRange checks reserved for v2 once we render real children)
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Top-level resolve
  // ---------------------------------------------------------------------------

  /**
   * @param {{ sandbox: object, overrides: object }} input
   * @returns {{ config: object, errors: ValidationError[] }}
   */
  function resolve({ sandbox, overrides }) {
    const errors = [];
    if (!isPlainObject(sandbox))   throw new TypeError('resolve: sandbox must be an object');
    if (!isPlainObject(overrides)) overrides = {};

    // Component validation
    const componentOverrides = isPlainObject(overrides.components) ? overrides.components : {};
    const sandboxComponents  = isPlainObject(sandbox.components)   ? sandbox.components   : {};
    const sandboxRules       = isPlainObject(sandbox.rules)        ? sandbox.rules        : {};

    for (const [name, override] of Object.entries(componentOverrides)) {
      validateComponent(name, override || {}, sandboxComponents[name], sandboxRules[name], errors);
    }

    // Build resolved config - even if errors exist, we return the deep-merged
    // shape so the catalogue can render a "broken" preview alongside errors.
    const config = {
      tokens:     deepMerge(sandbox.tokens,     overrides.tokens),
      components: deepMerge(sandbox.components, overrides.components),
    };

    // Strip null sentinels (used by overrides to remove a variant/size/etc.)
    stripNulls(config);

    return { config, errors };
  }

  function stripNulls(node) {
    if (!isPlainObject(node)) return;
    for (const key of Object.keys(node)) {
      if (node[key] === null) delete node[key];
      else stripNulls(node[key]);
    }
  }



  window.LoomResolver = { resolve, deepMerge, validateComponent };
})();
