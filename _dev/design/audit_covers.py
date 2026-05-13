#!/usr/bin/env python3
"""
audit_covers.py — Detect cover.svg copy-paste leaks across articles.

Failure modes this catches:

  F1. Missing cover.svg or cover.png in a published post bundle.
  F2. Byte-identical cover.svg shared across multiple slugs in the same locale
      (copy-paste without editing — e.g. 2026-05-13 leak where 4 zh-tw posts
      all shipped the same `photoshop-autosave-not-version-history` cover).
  F3. The `Cover: {identifier}` comment in cover.svg names *another* post's slug
      (clear evidence of copy-paste — distinct from F2 only when the SVG body
      has been edited downstream but the header forgot to update).

Usage:
  python _dev/design/audit_covers.py                 # audit all locales × all slugs
  python _dev/design/audit_covers.py --slug X        # audit one slug (used in /blg Touch 4 gate)
  python _dev/design/audit_covers.py --locale zh-tw  # audit one locale

Exit codes:
  0  all green
  1  one or more failures (CI / /blg gate halts here)
"""

from __future__ import annotations

import argparse
import hashlib
import sys
from collections import defaultdict
from pathlib import Path

LOCALE_DIRS = {
    "zh-tw": "content/zh-tw/post",
    "en": "content/english/post",
    "zh-cn": "content/zh-cn/post",
    "ja": "content/ja/post",
    "ko": "content/ko/post",
    "it": "content/it/post",
}


def md5(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()


def identifier_line(svg_path: Path) -> str:
    """Return the `Cover: ...` identifier from the SVG header comment, or ''."""
    try:
        for line in svg_path.read_text(encoding="utf-8", errors="replace").splitlines()[:10]:
            if "Cover:" in line:
                return line.split("Cover:", 1)[1].strip()
    except OSError:
        pass
    return ""


def audit(repo_root: Path, slug_filter: str | None, locale_filter: str | None) -> int:
    failures: list[str] = []

    all_slugs: set[str] = set()
    for rel in LOCALE_DIRS.values():
        d = repo_root / rel
        if d.is_dir():
            all_slugs.update(p.name for p in d.iterdir() if p.is_dir())

    for locale, rel in LOCALE_DIRS.items():
        if locale_filter and locale != locale_filter:
            continue
        locale_dir = repo_root / rel
        if not locale_dir.is_dir():
            continue

        # Always collect md5 for ALL slugs in the locale, so --slug mode can still
        # detect collisions against other slugs already shipped in the repo.
        hash_groups: dict[str, list[str]] = defaultdict(list)
        for post_dir in sorted(locale_dir.iterdir()):
            if not post_dir.is_dir():
                continue
            svg = post_dir / "cover.svg"
            if svg.is_file():
                hash_groups[md5(svg)].append(post_dir.name)

        for post_dir in sorted(locale_dir.iterdir()):
            if not post_dir.is_dir():
                continue
            slug = post_dir.name
            if slug_filter and slug != slug_filter:
                continue

            svg = post_dir / "cover.svg"
            png = post_dir / "cover.png"

            # F1 — missing files
            if not svg.is_file():
                failures.append(f"[F1 missing-svg] {locale}/{slug}: cover.svg not found")
                continue
            if not png.is_file():
                failures.append(f"[F1 missing-png] {locale}/{slug}: cover.png not found")

            # F2 — this slug's md5 shared by any OTHER slug in the same locale
            sibling_slugs = [s for s in hash_groups[md5(svg)] if s != slug]
            if sibling_slugs:
                failures.append(
                    f"[F2 duplicate-svg] {locale}/{slug}: cover.svg is byte-identical to "
                    f"{', '.join(sibling_slugs)} (copy-paste — re-design before ship)"
                )

            # F3 — identifier names some OTHER post's slug (high-precision copy-paste signal)
            ident = identifier_line(svg)
            for other in all_slugs:
                if other != slug and other in ident:
                    failures.append(
                        f"[F3 wrong-slug-in-identifier] {locale}/{slug}: cover.svg identifier "
                        f"is `{ident[:80]}` — names `{other}`, not `{slug}`"
                    )
                    break

    if failures:
        print("Cover audit FAILED — fix before ship:", file=sys.stderr)
        for f in failures:
            print(f"  {f}", file=sys.stderr)
        print(f"\n{len(failures)} failure(s). See _dev/design/audit_covers.py docstring for fix steps.", file=sys.stderr)
        return 1

    print("Cover audit OK — every shipped post has a unique, well-identified cover.svg + cover.png")
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--slug", help="audit one slug only")
    p.add_argument("--locale", help="audit one locale only (zh-tw / en / zh-cn / ja / ko / it)")
    p.add_argument("--repo-root", default=".", help="repo root (default: cwd)")
    args = p.parse_args()
    return audit(Path(args.repo_root).resolve(), args.slug, args.locale)


if __name__ == "__main__":
    sys.exit(main())
