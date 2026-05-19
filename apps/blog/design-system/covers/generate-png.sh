#!/usr/bin/env bash
# =============================================================
# Keeply Cover Kit · SVG → PNG batch converter
#
# Uses headless Chrome to rasterize cover.svg → cover.png
# for every article in content/{locale}/post/{slug}/.
#
# Runs from project root. Idempotent: overwrites existing cover.png.
#
# Usage:
#   bash design-system/covers/generate-png.sh
#   bash design-system/covers/generate-png.sh {slug}  # single article
# =============================================================

set -euo pipefail

# Chrome / Edge path (Windows bash). Adjust if elsewhere.
CHROME="${CHROME_PATH:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
if [ ! -f "$CHROME" ]; then
  CHROME="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
fi
if [ ! -f "$CHROME" ]; then
  echo "ERROR: Chrome/Edge not found. Set CHROME_PATH env var." >&2
  exit 1
fi

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FILTER_SLUG="${1:-}"

count=0
while IFS= read -r svg; do
  slug="$(basename "$(dirname "$svg")")"
  if [ -n "$FILTER_SLUG" ] && [ "$slug" != "$FILTER_SLUG" ]; then
    continue
  fi
  png="${svg%.svg}.png"
  abs_svg="$(cd "$(dirname "$svg")" && pwd)/$(basename "$svg")"
  # Convert git-bash POSIX path (/d/foo) → Windows drive path (d:/foo) for Chrome
  if [[ "$abs_svg" =~ ^/([a-zA-Z])/(.*) ]]; then
    abs_svg="${BASH_REMATCH[1]}:/${BASH_REMATCH[2]}"
  fi
  url="file:///${abs_svg}"

  echo "→ $svg"
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --window-size=1600,900 \
    --screenshot="$png" "$url" 2>/dev/null
  count=$((count + 1))
done < <(find "$PROJECT_ROOT/content" -path "*/post/*/cover.svg")

echo ""
echo "Generated $count PNG(s)."
