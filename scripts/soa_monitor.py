#!/usr/bin/env python3
"""
soa_monitor.py — BWF v0.2.22 / AEO Task 5 SCAFFOLD
===================================================
Share of Answer (SoA) monitoring pipeline for keeply-blog. Queries the
SE Ranking AI Result Tracker API across the 4 core LLM engines and
records citation status for the Golden Prompt Set.

STATUS: SCAFFOLD ONLY — needs:
1. SE Ranking subscription with AI Result Tracker addon ($129-279/mo +
   100K API credits — see https://seranking.com/subscription.html)
2. GitHub Actions secret SERANKING_API_KEY
3. SITE_ID populated from your SE Ranking dashboard
4. scripts/golden_prompt_set.csv populated with 100-200 prompts

Usage:
    SERANKING_API_KEY=xxx SITE_ID=1234567 python scripts/soa_monitor.py

    Optional flags:
        --dry-run          show what would be queried without API call
        --engines LIST     comma-separated: chatgpt,perplexity,gemini,copilot
        --output PATH      output CSV path (default: output/soa-YYYY-MM-DD.csv)

Outputs:
    output/soa-YYYY-MM-DD.csv with columns:
        prompt, engine, brand_mentioned, position, cited_urls, raw_response
"""

import argparse
import csv
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

try:
    import requests  # noqa: F401
except ImportError:
    print("ERROR: 'requests' not installed. pip install requests pandas python-dotenv")
    sys.exit(1)


SE_RANKING_API_BASE = "https://api4.seranking.com"
DEFAULT_ENGINES = ["chatgpt", "perplexity", "gemini", "google_ai_mode"]

# Exponential backoff config (per SE Ranking API rate-limit doc).
RETRY_MAX = 5
RETRY_BASE_SECONDS = 2


def load_prompts(csv_path: Path) -> list[dict]:
    """Load Golden Prompt Set from CSV. Expected columns:
    prompt, target_article_slug, intent_stage, locale."""
    if not csv_path.exists():
        print(f"ERROR: Prompt set not found at {csv_path}")
        print(f"       Populate {csv_path} with 100-200 prompts before running.")
        sys.exit(1)
    with csv_path.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def query_seranking(
    api_key: str,
    site_id: str,
    engine: str,
    prompt: str,
    dry_run: bool = False,
) -> dict:
    """Query SE Ranking AI Result Tracker for a single prompt + engine.

    Returns dict with brand_visibility / references / raw response.
    """
    if dry_run:
        return {
            "engine": engine,
            "prompt": prompt,
            "brand_mentioned": False,
            "position": None,
            "cited_urls": [],
            "raw": "[dry-run]",
        }

    url = f"{SE_RANKING_API_BASE}/sites/{site_id}/airt/llm/{engine}/prompts/rankings"
    headers = {
        "Authorization": f"Token {api_key}",
        "Content-Type": "application/json",
    }
    params = {"prompt": prompt}

    for attempt in range(RETRY_MAX):
        try:
            resp = requests.get(url, headers=headers, params=params, timeout=30)
            if resp.status_code == 429:
                # Exponential backoff per SE Ranking rate-limit policy.
                wait = RETRY_BASE_SECONDS * (2 ** attempt)
                print(f"  rate-limited, backing off {wait}s (attempt {attempt+1})")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            data = resp.json().get("data", {})
            return {
                "engine": engine,
                "prompt": prompt,
                "brand_mentioned": "keeply" in str(data).lower(),
                "position": data.get("position"),
                "cited_urls": data.get("references", []),
                "raw": json.dumps(data, ensure_ascii=False),
            }
        except requests.RequestException as e:
            wait = RETRY_BASE_SECONDS * (2 ** attempt)
            print(f"  request failed ({e}), retrying in {wait}s")
            time.sleep(wait)

    return {
        "engine": engine,
        "prompt": prompt,
        "brand_mentioned": False,
        "position": None,
        "cited_urls": [],
        "raw": f"[error after {RETRY_MAX} retries]",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="SoA monitoring for keeply-blog")
    parser.add_argument("--dry-run", action="store_true", help="no API calls")
    parser.add_argument(
        "--engines",
        default=",".join(DEFAULT_ENGINES),
        help=f"comma-separated engines (default: {','.join(DEFAULT_ENGINES)})",
    )
    parser.add_argument("--output", type=Path, default=None, help="output CSV path")
    parser.add_argument(
        "--prompts",
        type=Path,
        default=Path("scripts/golden_prompt_set.csv"),
        help="Golden Prompt Set CSV path",
    )
    args = parser.parse_args()

    api_key = os.environ.get("SERANKING_API_KEY", "")
    site_id = os.environ.get("SITE_ID", "")

    if not args.dry_run and (not api_key or not site_id):
        print("ERROR: set SERANKING_API_KEY + SITE_ID env vars, or use --dry-run")
        return 2

    prompts = load_prompts(args.prompts)
    engines = [e.strip() for e in args.engines.split(",") if e.strip()]
    output = args.output or Path("output") / f"soa-{datetime.now():%Y-%m-%d}.csv"
    output.parent.mkdir(parents=True, exist_ok=True)

    print(f"Querying {len(prompts)} prompts × {len(engines)} engines = "
          f"{len(prompts) * len(engines)} API calls "
          f"({'DRY RUN' if args.dry_run else 'LIVE'})")
    print(f"Output: {output}")

    rows = []
    for i, p in enumerate(prompts, 1):
        prompt_text = p.get("prompt", "").strip()
        if not prompt_text:
            continue
        for engine in engines:
            print(f"[{i}/{len(prompts)}] {engine}: {prompt_text[:60]}...")
            result = query_seranking(api_key, site_id, engine, prompt_text, args.dry_run)
            result["target_article_slug"] = p.get("target_article_slug", "")
            result["intent_stage"] = p.get("intent_stage", "")
            result["locale"] = p.get("locale", "")
            result["queried_at"] = datetime.now().isoformat()
            rows.append(result)

    with output.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "queried_at", "prompt", "engine", "locale", "intent_stage",
                "target_article_slug", "brand_mentioned", "position",
                "cited_urls", "raw",
            ],
        )
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

    mentioned = sum(1 for r in rows if r["brand_mentioned"])
    total = len(rows) or 1
    print(f"\nDone. Brand SoA: {mentioned}/{total} ({100 * mentioned // total}%)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
