#!/usr/bin/env bash
# Bundle Zoho Puvi OTFs into a downloadable ZIP.
# Run from repo root: ./scripts/zip-fonts.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO_ROOT/assets/fonts/zoho-puvi"
OUT="$REPO_ROOT/assets/fonts/zoho-puvi.zip"

if ! ls "$SRC"/*.otf >/dev/null 2>&1; then
  echo "❌ No .otf files in $SRC. Drop the Zoho Puvi OTFs in there first." >&2
  exit 1
fi

rm -f "$OUT"
( cd "$SRC" && zip -j "$OUT" *.otf )
echo "✅ Created $OUT"
ls -lh "$OUT"
