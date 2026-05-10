# Zoho Puvi - Loom DS Font Pack

This folder is the canonical source for **Zoho Puvi**, the proprietary font family used across Loom Design System.

## Required font files

Drop these `.otf` files directly into this folder (`assets/fonts/zoho-puvi/`):

**Zoho Puvi (sans, primary)**
- `Zoho Puvi Thin.otf`
- `Zoho Puvi Extralight.otf`
- `Zoho Puvi Light.otf`
- `Zoho Puvi Regular.otf`
- `Zoho Puvi Regular Italic.otf`
- `Zoho Puvi Medium.otf`
- `Zoho Puvi Semibold.otf`
- `Zoho Puvi Semibold Italic.otf`
- `Zoho Puvi Bold.otf`
- `Zoho Puvi Bold Italic.otf`
- `Zoho Puvi Extrabold.otf`
- `Zoho Puvi Black.otf`
- `Zoho Puvi Extrablack.otf`

**Zoho Puvi Compact**
- `Zoho Puvi Compact Regular.otf`
- `Zoho Puvi Compact Bold.otf`

**Zoho Puvi Condensed**
- `Zoho Puvi Condensed Regular.otf`
- `Zoho Puvi Condensed Bold.otf`

**Zoho Puvi Mono** (used by the Figma plugin for Family Name / Position labels)
- `ZohoPuviMono-Regular.otf`

**Zoho Puvi Serif**
- `Zoho Puvi Serif Regular.otf`
- `Zoho Puvi Serif Bold.otf`

**Zoho Puvi Slab**
- `Zoho Puvi Slab Regular.otf`
- `Zoho Puvi Slab Bold.otf`

**Zoho Puvi Tamil**
- `Zoho Puvi Tamil Regular.otf`
- `Zoho Puvi Tamil Bold.otf`

## Build the downloadable ZIP

After dropping the OTFs in, run:

```bash
./scripts/zip-fonts.sh
```

This produces `assets/fonts/zoho-puvi.zip` which is what the README links to for install.

## Install (designers / devs)

1. Download `zoho-puvi.zip` from the repo (link in root README).
2. Unzip.
3. Double-click each `.otf` and click **Install Font** (macOS Font Book / Windows Settings → Fonts).
4. Restart Figma - the Loom plugin will now pick up `Zoho Puvi` and `Zoho Puvi Mono` automatically.
