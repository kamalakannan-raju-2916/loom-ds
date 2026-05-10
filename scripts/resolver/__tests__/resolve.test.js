'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { resolve, deepMerge } = require('../index.js');

// Minimal sandbox fixture mirroring real shape
const sandbox = {
  tokens: { primitive: { color: { cobalt: { base: '#2C66DD' } } } },
  components: {
    button: {
      variants: {
        primary: { bg: '{accent.primary}' },
        ghost:   { bg: 'transparent' },
      },
      sizes: {
        sm: { height: 28 }, md: { height: 36 }, lg: { height: 44 },
      },
    },
  },
  rules: {
    button: {
      component: 'lyte-button',
      lyteVersion: '^x.y',
      tokens: {
        '--button-radius':    { editable: true,  min: 0, max: 16, step: 1, unit: 'px' },
        '--button-font-size': { editable: true,  enum: [12, 14, 16] },
        '--button-border':    { editable: false, reason: 'locked floor' },
      },
      props: {
        size:    { editable: true, values: ['sm','md','lg'], addable: true,  removable: false },
        variant: { editable: true, values: ['primary','ghost'], addable: true, removable: false, default: 'primary' },
        type:    { editable: false, reason: 'HTML semantics' },
      },
      slots: {
        'icon-left':  { editable: true },
        default:      { editable: true },
      },
      variants: { addable: true,  removable: false, locked: ['primary'], max: 6 },
      sizes:    { addable: true,  removable: true,  max: 4 },
      states: {
        hover:    { editable: true,  tokens: { '--button-bg-hover': { editable: true } } },
        disabled: { editable: false },
      },
    },
  },
};

test('happy path: clean override produces zero errors and a merged config', () => {
  const overrides = {
    components: {
      button: {
        tokens: { '--button-radius': 8, '--button-font-size': 14 },
        variants: { outline: { bg: 'transparent', border: '1px solid currentColor' } },
        sizes: { xl: { height: 52 } },
      },
    },
  };
  const { config, errors } = resolve({ sandbox, overrides });
  assert.deepEqual(errors, []);
  assert.equal(config.components.button.variants.outline.bg, 'transparent');
  assert.equal(config.components.button.sizes.xl.height, 52);
  // base preserved
  assert.equal(config.components.button.variants.primary.bg, '{accent.primary}');
});

test('locked token rejected', () => {
  const { errors } = resolve({
    sandbox,
    overrides: { components: { button: { tokens: { '--button-border': '2px' } } } },
  });
  assert.equal(errors.length, 1);
  assert.equal(errors[0].code, 'TOKEN_LOCKED');
});

test('unknown token rejected (implicitly locked)', () => {
  const { errors } = resolve({
    sandbox,
    overrides: { components: { button: { tokens: { '--button-shadow': '0 1px 2px #000' } } } },
  });
  assert.equal(errors.length, 1);
  assert.equal(errors[0].code, 'TOKEN_UNKNOWN');
});

test('numeric range - below min and above max', () => {
  const { errors } = resolve({
    sandbox,
    overrides: { components: { button: { tokens: { '--button-radius': -1 } } } },
  });
  assert.equal(errors[0].code, 'TOKEN_BELOW_MIN');

  const r2 = resolve({
    sandbox,
    overrides: { components: { button: { tokens: { '--button-radius': 99 } } } },
  });
  assert.equal(r2.errors[0].code, 'TOKEN_ABOVE_MAX');
});

test('enum violation', () => {
  const { errors } = resolve({
    sandbox,
    overrides: { components: { button: { tokens: { '--button-font-size': 13 } } } },
  });
  assert.equal(errors[0].code, 'TOKEN_NOT_IN_ENUM');
});

test('locked prop rejected', () => {
  const { errors } = resolve({
    sandbox,
    overrides: { components: { button: { props: { type: { values: ['button','custom'] } } } } },
  });
  assert.equal(errors[0].code, 'PROP_LOCKED');
});

test('prop add allowed when addable=true', () => {
  const { errors } = resolve({
    sandbox,
    overrides: { components: { button: { props: { variant: { values: ['primary','ghost','solid'] } } } } },
  });
  assert.deepEqual(errors, []);
});

test('prop default must lie inside the value universe', () => {
  const { errors } = resolve({
    sandbox,
    overrides: { components: { button: { props: { variant: { default: 'nope' } } } } },
  });
  assert.equal(errors[0].code, 'PROP_DEFAULT_INVALID');
});

test('removing a locked variant is rejected', () => {
  const { errors } = resolve({
    sandbox,
    overrides: { components: { button: { variants: { primary: null } } } },
  });
  assert.ok(errors.some(e => e.code === 'VARIANTS_LOCKED'));
});

test('adding a size honours max cap', () => {
  const { errors } = resolve({
    sandbox,
    overrides: { components: { button: { sizes: { xl: { height: 52 }, xxl: { height: 60 } } } } },
  });
  // base has 3 + 2 added = 5, max is 4 → violation
  assert.ok(errors.some(e => e.code === 'SIZES_OVER_MAX'));
});

test('locked state rejected', () => {
  const { errors } = resolve({
    sandbox,
    overrides: { components: { button: { states: { disabled: { tokens: { '--x': 1 } } } } } },
  });
  assert.equal(errors[0].code, 'STATE_LOCKED');
});

test('unknown component rejected (no rules)', () => {
  const { errors } = resolve({
    sandbox,
    overrides: { components: { mystery: { tokens: { x: 1 } } } },
  });
  assert.equal(errors[0].code, 'NO_RULES');
});

test('null sentinels are stripped from final config', () => {
  // Force-stripped via removable=true on sizes
  const { config, errors } = resolve({
    sandbox,
    overrides: { components: { button: { sizes: { sm: null } } } },
  });
  assert.deepEqual(errors, []);
  assert.equal(config.components.button.sizes.sm, undefined);
  assert.equal(config.components.button.sizes.md.height, 36);
});

test('deepMerge does not mutate inputs', () => {
  const a = { x: { y: 1 } };
  const b = { x: { z: 2 } };
  const out = deepMerge(a, b);
  assert.equal(a.x.z, undefined);
  assert.equal(out.x.y, 1);
  assert.equal(out.x.z, 2);
});
