#!/usr/bin/env bash
# =============================================================
# refresh-og-cache.sh
# Force social-media platforms to re-scrape Open Graph metadata
# for blog posts after publish.
#
# Why: FB / LinkedIn cache OG previews aggressively. After fixing
# meta tags or publishing covers, old (broken) cards stick around
# until a re-scrape is triggered.
#
# Usage:
#   bash scripts/refresh-og-cache.sh              # all posts, 4 launch locales
#   bash scripts/refresh-og-cache.sh {slug}       # specific slug only
#   bash scripts/refresh-og-cache.sh --open       # opens FB/LI debuggers in browser
#   bash scripts/refresh-og-cache.sh --fb-api     # auto-call FB Graph API (needs FB_GRAPH_TOKEN)
#
# Env:
#   FB_GRAPH_TOKEN   FB Graph API app access token (for --fb-api mode)
#   BASE_URL         Site base URL (default: https://blog.keeply.work)
# =============================================================

set -euo pipefail

BASE_URL="${BASE_URL:-https://blog.keeply.work}"
LOCALES=(en zh-tw zh-cn ja ko it)

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCALE_DIR_FOR() {
  case "$1" in
    en) echo "english" ;;
    *)  echo "$1" ;;
  esac
}

# Parse args
filter_slug=""
mode="print"
for arg in "$@"; do
  case "$arg" in
    --open)    mode="open" ;;
    --fb-api)  mode="fbapi" ;;
    --help|-h) sed -n '2,20p' "$0"; exit 0 ;;
    -*)        echo "Unknown flag: $arg" >&2; exit 1 ;;
    *)         filter_slug="$arg" ;;
  esac
done

# Collect post URLs
urls=()
for locale in "${LOCALES[@]}"; do
  loc_dir="$(LOCALE_DIR_FOR "$locale")"
  post_root="$PROJECT_ROOT/content/$loc_dir/post"
  [ -d "$post_root" ] || continue
  while IFS= read -r -d '' bundle; do
    slug="$(basename "$bundle")"
    if [ -n "$filter_slug" ] && [ "$slug" != "$filter_slug" ]; then continue; fi
    urls+=("$BASE_URL/$locale/post/$slug/")
  done < <(find "$post_root" -mindepth 1 -maxdepth 1 -type d -print0)
done

if [ "${#urls[@]}" -eq 0 ]; then
  echo "No matching posts found." >&2
  exit 1
fi

urlencode() {
  local s="$1"
  printf '%s' "$s" | sed -e 's|:|%3A|g' -e 's|/|%2F|g' -e 's|?|%3F|g' -e 's|=|%3D|g' -e 's|&|%26|g'
}

case "$mode" in
  print)
    echo "Found ${#urls[@]} URL(s). Click each link to refresh OG cache:"
    echo ""
    for u in "${urls[@]}"; do
      enc="$(urlencode "$u")"
      echo "## $u"
      echo "  - FB:       https://developers.facebook.com/tools/debug/?q=$enc"
      echo "  - LinkedIn: https://www.linkedin.com/post-inspector/inspect/$enc"
      echo "  - Discord:  $u?v=$(date +%s) (paste this URL with cache-buster)"
      echo ""
    done
    echo "Tip: rerun with --open to open all FB/LI tabs at once."
    ;;
  open)
    if ! command -v start >/dev/null 2>&1 && ! command -v xdg-open >/dev/null 2>&1; then
      echo "ERROR: no 'start' (Windows) or 'xdg-open' (Linux) available." >&2
      exit 1
    fi
    OPENER="start"
    command -v start >/dev/null 2>&1 || OPENER="xdg-open"
    for u in "${urls[@]}"; do
      enc="$(urlencode "$u")"
      "$OPENER" "https://developers.facebook.com/tools/debug/?q=$enc" >/dev/null 2>&1 || true
      "$OPENER" "https://www.linkedin.com/post-inspector/inspect/$enc" >/dev/null 2>&1 || true
      sleep 0.3   # don't slam the OS shell
    done
    echo "Opened ${#urls[@]} URL(s) × 2 platforms (FB + LinkedIn) in browser."
    echo "Click 'Scrape Again' on each FB tab; LinkedIn auto-refreshes."
    ;;
  fbapi)
    if [ -z "${FB_GRAPH_TOKEN:-}" ]; then
      echo "ERROR: FB_GRAPH_TOKEN env var not set." >&2
      echo "Get an app access token at https://developers.facebook.com/tools/accesstoken/" >&2
      exit 1
    fi
    ok=0; fail=0
    for u in "${urls[@]}"; do
      resp="$(curl -sS -X POST "https://graph.facebook.com/v18.0/?id=$(urlencode "$u")&scrape=true&access_token=$FB_GRAPH_TOKEN" || true)"
      if echo "$resp" | grep -q '"id"'; then
        echo "✓ $u"
        ok=$((ok+1))
      else
        echo "✗ $u — $resp"
        fail=$((fail+1))
      fi
    done
    echo ""
    echo "Done: $ok ok, $fail failed."
    ;;
esac
