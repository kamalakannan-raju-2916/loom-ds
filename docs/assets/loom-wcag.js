// Loom - WCAG 2.2 contrast helper (browser-friendly, no deps)
// Exposes: window.LoomWCAG = { contrast, score, parseHex }

(function () {
  'use strict';

  function parseHex(hex) {
    if (typeof hex !== 'string') return null;
    let h = hex.trim().replace(/^#/, '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  function srgbToLinear(c) {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function relativeLuminance({ r, g, b }) {
    return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
  }

  function contrast(fgHex, bgHex) {
    const fg = parseHex(fgHex), bg = parseHex(bgHex);
    if (!fg || !bg) return null;
    const L1 = relativeLuminance(fg), L2 = relativeLuminance(bg);
    const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
    return (hi + 0.05) / (lo + 0.05);
  }

  // WCAG 2.2 thresholds
  const T = {
    aaSmall: 4.5, aaaSmall: 7.0,
    aaLarge: 3.0, aaaLarge: 4.5,
    uiGraphic: 3.0,
  };

  function score(ratio) {
    if (ratio == null) return null;
    return {
      ratio,
      aaSmall:  ratio >= T.aaSmall,
      aaaSmall: ratio >= T.aaaSmall,
      aaLarge:  ratio >= T.aaLarge,
      aaaLarge: ratio >= T.aaaLarge,
      uiGraphic: ratio >= T.uiGraphic,
    };
  }

  window.LoomWCAG = { contrast, score, parseHex, thresholds: T };
})();
