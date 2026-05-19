#!/usr/bin/env bash
#
# alt_text_audit.sh — BWF v0.2.22 / AEO Task 4
# ============================================
# Audits content/{locale}/post/*/index.md for missing image_alt_data
# frontmatter field. AEO requirement: every featured image must have
# descriptive alt text for VLM extraction, not just "Featured image of
# post {title}" theme fallback.
#
# Usage:
#   bash scripts/alt_text_audit.sh                  # report-only
#   bash scripts/alt_text_audit.sh --strict         # exit 1 if missing
#   bash scripts/alt_text_audit.sh --strict --core  # only 6 core locales
#
# Exit codes:
#   0 — all articles have image_alt_data (strict mode) OR report-only
#   1 — at least one article missing image_alt_data (strict mode only)
#
# Integration: invoke from .github/workflows/deploy.yml *before*
# `hugo --gc --minify` with `--strict --core` to gate ship.

set -euo pipefail

STRICT=false
CORE_ONLY=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --strict) STRICT=true; shift ;;
        --core)   CORE_ONLY=true; shift ;;
        *) echo "Unknown flag: $1" >&2; exit 2 ;;
    esac
done

cd "$(dirname "$0")/.."

# Core 6 locales (per CLAUDE.md): en (content/english) / zh-tw / zh-cn / ja / ko / it
if $CORE_ONLY; then
    FIND_PATHS=(content/english content/zh-tw content/zh-cn content/ja content/ko content/it)
else
    FIND_PATHS=(content)
fi

MISSING=()
TOTAL=0
WITH_ALT=0

while IFS= read -r file; do
    TOTAL=$((TOTAL + 1))

    # Extract frontmatter (between first two --- markers) and check for image_alt_data
    if awk '/^---$/{c++; next} c==1{print} c==2{exit}' "$file" | grep -q '^image_alt_data:'; then
        WITH_ALT=$((WITH_ALT + 1))
    else
        # Also exclude articles that have no image: field at all (no featured image)
        if awk '/^---$/{c++; next} c==1{print} c==2{exit}' "$file" | grep -q '^image:'; then
            MISSING+=("$file")
        fi
    fi
done < <(find "${FIND_PATHS[@]}" -type f -path '*/post/*/index.md' 2>/dev/null)

echo "======================================"
echo "BWF AEO Task 4 — image_alt_data audit"
echo "======================================"
echo "Scanned: $TOTAL articles"
echo "With image_alt_data: $WITH_ALT"
echo "Missing (have image: but no image_alt_data): ${#MISSING[@]}"
echo

if [[ ${#MISSING[@]} -gt 0 ]]; then
    echo "Files missing image_alt_data:"
    for f in "${MISSING[@]}"; do
        echo "  - $f"
    done
    echo
fi

if $STRICT && [[ ${#MISSING[@]} -gt 0 ]]; then
    echo "STRICT mode: exit 1 — fix missing image_alt_data before ship"
    exit 1
fi

echo "OK (report-only mode or all entries present)"
exit 0
