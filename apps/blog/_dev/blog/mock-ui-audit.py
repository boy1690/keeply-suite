#!/usr/bin/env python3
"""Keeply Mock-UI presence audit (monorepo port of keeply-mock-audit.py's
mock-UI half).

Background: the pre-merge `keeply-blog/.claude/hooks/keeply-mock-audit.py` did
two jobs — (1) cross-locale language-consistency and (2) Mock-UI presence. In
the keeply-suite monorepo, (1) is already enforced by
`.claude/hooks/blog-content-gate.js` (which runs language-consistency-audit.py).
(2) was NOT ported — this script fills that gap as a MANUAL spot-check.

DELIBERATELY NOT wired into blog-content-gate.js (decision 2026-05-22): a
full-corpus run flags 125 articles vs 89 that actually carry mocks, because the
"every >=1500-char/>=3-Keeply article needs save-dialog+timeline" mandate no
longer matches the grown corpus — mocks ship only to the core locales (not all
19), and install / getting-started articles don't need them. A corpus-wide
BLOCKING gate would therefore block every commit. Mock-UI presence is instead
enforced at authoring time via the keeply-mock-ui skill; use this script for a
targeted `--slug` check when retrofitting or reviewing a comparison article.

Qualifying article (all must hold), per the original hook:
- frontmatter `role` is unset or == cluster
- NOT `retrofit_status: v1-legacy`
- current locale is in `locales_required` / `launch_locales` (if that list is set)
- body (after frontmatter) >= 1500 chars
- mentions Keeply >= 3 times

A qualifying article must have BOTH `![..](save-dialog.svg)` and
`![..](timeline.svg)` references AND both SVG files present in the page bundle,
and must NOT contain ASCII box-drawing / ASCII timeline mock anti-patterns.

Usage:
    python mock-ui-audit.py                       # scan all (cwd = apps/blog)
    python mock-ui-audit.py --content-dir ./content
    python mock-ui-audit.py --slug excel-data-vanished   # one slug, repeatable

Exit 0 = every qualifying article has its mocks. Exit 1 = at least one is
missing (so blog-content-gate.js's runBlocking treats it as a block).
"""
import argparse
import re
import sys
from pathlib import Path


def parse_frontmatter(text: str) -> dict:
    """Crude YAML frontmatter parser — key: value pairs into a dict."""
    m = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).splitlines():
        kv = re.match(r"^([a-zA-Z_]+):\s*(.+)$", line)
        if kv:
            fm[kv.group(1)] = kv.group(2).strip().strip("\"'")
    return fm


def locale_of(path: Path) -> str:
    """Derive locale from content/{locale}/post/{slug}/index.md."""
    parts = str(path).replace("\\", "/").split("/")
    try:
        loc = parts[parts.index("content") + 1]
        return "en" if loc == "english" else loc.lower()
    except (ValueError, IndexError):
        return ""


def audit_article(path: Path) -> list[str]:
    """Return list of audit errors for this article, empty if it passes/skips."""
    text = path.read_text(encoding="utf-8", errors="replace")
    fm = parse_frontmatter(text)

    role = fm.get("role", "").lower()
    if role and role != "cluster":
        return []
    if fm.get("retrofit_status", "").lower() == "v1-legacy":
        return []

    launch_raw = fm.get("locales_required", "") or fm.get("launch_locales", "")
    if launch_raw:
        launch = [s.strip().strip("\"'").lower() for s in launch_raw.strip("[]").split(",")]
        loc = locale_of(path)
        if loc and loc not in launch:
            return []  # locale intentionally excluded

    body = re.sub(r"^---\n.*?\n---\n", "", text, count=1, flags=re.DOTALL)
    if len(body) < 1500:
        return []
    if len(re.findall(r"\b[Kk]eeply\b", body)) < 3:
        return []

    errors = []
    has_dialog_ref = "![" in text and "save-dialog.svg" in text
    has_timeline_ref = "![" in text and "timeline.svg" in text
    if not has_dialog_ref:
        errors.append("缺少 ![alt](save-dialog.svg) 引用")
    if not has_timeline_ref:
        errors.append("缺少 ![alt](timeline.svg) 引用")

    bundle = path.parent
    if not (bundle / "save-dialog.svg").exists():
        errors.append(f"缺少 {bundle.name}/save-dialog.svg 檔案")
    if not (bundle / "timeline.svg").exists():
        errors.append(f"缺少 {bundle.name}/timeline.svg 檔案")

    if re.search(r"^┌─+┐", body, re.MULTILINE):
        errors.append("發現 ASCII box-drawing dialog（禁用、改用 SVG）")
    if re.search(r"^Keeply (時間軸|时间轴) — ", body, re.MULTILINE) and not has_timeline_ref:
        errors.append("發現 ASCII timeline mock（禁用、改用 SVG）")

    return errors


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--content-dir", default="./content",
                    help="Hugo content directory (default: ./content, i.e. cwd=apps/blog)")
    ap.add_argument("--slug", action="append", default=None,
                    help="Limit to specific slug(s); repeatable")
    args = ap.parse_args()

    content_root = Path(args.content_dir).resolve()
    if not content_root.exists():
        print(f"mock-ui-audit: {content_root} not found (skipped).")
        return 0

    target_slugs = set(args.slug) if args.slug else None
    all_errors: dict[Path, list[str]] = {}
    for md in sorted(content_root.glob("*/post/*/index.md")):
        slug = md.parent.name
        if target_slugs and slug not in target_slugs:
            continue
        errs = audit_article(md)
        if errs:
            all_errors[md] = errs

    print("=" * 66)
    print("Keeply Mock-UI presence audit")
    print("=" * 66)
    if not all_errors:
        print("✅ 所有 qualifying cluster article 都有 save-dialog + timeline mock。")
        return 0

    print(f"\n🔴 {len(all_errors)} 篇 cluster article 缺 Mock UI（HARD）：\n")
    for md, errs in all_errors.items():
        try:
            rel = md.relative_to(content_root.parent)
        except ValueError:
            rel = md
        print(f"📄 {rel}")
        for e in errs:
            print(f"   {e}")
        print()
    print("修法：")
    print("  1. 用 keeply-mock-ui skill 生成 dialog + timeline SVG（per-locale，禁 cp 別篇）")
    print("  2. article body 加 ![alt](save-dialog.svg) + ![alt](timeline.svg)")
    print("  3. git add → 再 commit")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
