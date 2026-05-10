#!/usr/bin/env bash
# Bundle the Loom Figma plugin into a downloadable ZIP.
# Run from repo root: ./scripts/zip-figma-plugin.sh
# IMPORTANT: Re-run this whenever figma-plugin/ changes so the README download
# button serves the latest version.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO_ROOT/figma-plugin"
OUT_DIR="$REPO_ROOT/assets/figma-plugin"
OUT="$OUT_DIR/loom-figma-plugin.zip"

if [[ ! -f "$SRC/manifest.json" ]]; then
  echo "❌ figma-plugin/manifest.json not found at $SRC" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
rm -f "$OUT"
( cd "$SRC" && zip -r "$OUT" . -x "*.DS_Store" )
echo "✅ Created $OUT"
ls -lh "$OUT"
