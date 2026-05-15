#!/usr/bin/env python3
"""Cross-locale language consistency audit (T16-leak guard).

Scans every `content/{ja,ko,it,zh-tw,zh-cn}/post/*/index.md` for English
tech-term leaks that should have been translated to the local language.

Phase 0 — allowlist (always kept in English):
    - Brand names: OneDrive, Microsoft, Word, Excel, PowerPoint, GitHub,
      Dropbox, Adobe, AutoCAD, Premiere, Photoshop, Time Machine, Apple,
      Google, Notion, Figma, Tina, NAS, RAID, SSO, etc.
    - File extensions: .docx, .asd, .psd, ...
    - Acronyms: CFO, CTO, IT, SOX, HIPAA, GDPR, CLI, GUI
    - Code spans: anything in backticks
    - Code-like inline strings: Cmd+S, Ctrl+S, git, etc.
    - URLs: ignored entirely

Phase 1 — blacklist (must be translated per locale):
    Tech terms that have widely-used local equivalents.
    Per-locale translation table below.

Phase 2 — auto-translation:
    --fix mode auto-applies the translation table.

Exit code:
    0 = all clean
    1 = HARD violations (any blacklist hit in body)

Usage:
    python _dev/blog/language-consistency-audit.py
    python _dev/blog/language-consistency-audit.py --slug onedrive-version-history
    python _dev/blog/language-consistency-audit.py --fix          # auto-fix and write
    python _dev/blog/language-consistency-audit.py --locale ja
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT_DIR = ROOT / "content"
LOCALES = {
    "ja": "ja",
    "ko": "ko",
    "it": "it",
    "zh-tw": "zh-tw",
    "zh-cn": "zh-cn",
}

# Allowlist — these stay in English even inside non-English locales.
ALLOWLIST_TERMS = {
    # Brand / product names
    "OneDrive", "SharePoint", "Microsoft", "Microsoft 365", "Microsoft Learn",
    "Microsoft Support", "Microsoft Q&A", "Word", "Excel", "PowerPoint",
    "Office", "Outlook", "Teams", "Azure", "Visual Studio",
    "GitHub", "GitLab", "Bitbucket", "git", "Mercurial", "svn", "Perforce",
    "Dropbox", "Google", "Google Drive", "Google Docs", "Google Workspace",
    "Notion", "Figma", "Slack", "Tactiq",
    "Adobe", "Photoshop", "Illustrator", "Premiere", "Acrobat",
    "AutoCAD", "Revit", "Apple", "macOS", "Mac", "Time Machine", "Finder",
    "Windows", "Linux", "iCloud", "iCloud Photos", "iOS", "iPad", "iPhone",
    "Keeply", "Release",  # Keeply feature names kept English
    "DocuSign", "Adobe Sign", "Veeam", "Acronis", "Backblaze", "M-Files",
    "Docuware", "Backblaze B2", "Mac", "Mercurial", "Fossil", "Pijul",
    "Synology", "QNAP", "Setapp", "Macworld", "Wikipedia", "Reddit",
    "FAQ", "TOC", "TL;DR",  # universal abbreviations
    "MS Support", "MS Learn", "MS Q&A",
    "Code Connect", "AI Overview",
    "HUIT", "UConn", "umaryland", "Harvard",
    "Anatomy of Work", "Asana", "McKinsey", "IDC",
    # File extensions kept as-is via dotted form
    # Code-like tokens
    "Cmd+S", "Ctrl+S", "Cmd+S", "Cmd-S", "Ctrl-S",
    "CFO", "CTO", "CEO", "COO", "CIO", "CMO", "IT",
    "SOX", "HIPAA", "GDPR", "PCI", "ISO",
    "CLI", "GUI", "UI", "UX", "API", "SDK", "CSV", "PDF", "JSON",
    "SaaS", "DAM", "LFS",
    "DLP", "SSO", "MFA", "2FA",
    "RAID", "NAS", "SMB", "SSD", "HDD", "USB", "LAN", "VPN",
    "SOC", "BWF", "ADR",
    "Hugo", "Hugo Stack", "Cloudflare", "GSC", "GA4", "BWT",
    "Tina",  # character name in articles
    # Numbers / version
    "v1", "v2", "v3", "v2.3", "v3.x",
    # Article-specific kept terms
    "FAQ schema", "Schema.org",
}

# Per-locale blacklist: English tech terms → local translation
# These are HARD violations when found in body text of the given locale.
BLACKLIST: dict[str, dict[str, str]] = {
    "ja": {
        # Microsoft official Japanese terms
        "AutoRecover": "自動回復",
        "Recycle Bin": "ごみ箱",
        # Generic tech terms
        "Release freeze": "リリース凍結",
        "Release-freeze": "リリース凍結",
        "Mock UI": "モック UI",
        "per-file note": "ファイル単位ノート",
        "per-file": "ファイル単位",
        "cross-tool portability": "クロスツール移植性",
        "cross-tool": "クロスツール",
        # "cap" (as English standalone word) — translate to 上限
        # only when it's a standalone English word, not part of slug like cap-mechanism
        # Treated separately below via regex.
        "major version": "メジャーバージョン",
        "major versions": "メジャーバージョン",
    },
    "ko": {
        "AutoRecover": "자동 복구",
        "Recycle Bin": "휴지통",
        "Release freeze": "Release 잠금",
        "Release-freeze": "Release 잠금",
        "Mock UI": "모크 UI",
        "per-file note": "파일별 노트",
        "per-file": "파일별",
        "cross-tool portability": "크로스 도구 이식성",
        "cross-tool": "크로스 도구",
        "major version": "주요 버전",
        "major versions": "주요 버전",
    },
    "it": {
        "AutoRecover": "Salvataggio automatico",
        "Recycle Bin": "Cestino",
        "Release freeze": "Blocco Release",
        "Release-freeze": "Blocco Release",
        "Mock UI": "mock UI",
        "per-file note": "nota per file",
        "per-file": "per file",
        "cross-tool portability": "portabilità tra strumenti",
        "cross-tool": "tra strumenti",
        "major version": "versione principale",
        "major versions": "versioni principali",
    },
    "zh-tw": {
        "AutoRecover": "自動回復",
        "Recycle Bin": "資源回收筒",
        "Release freeze": "發行版凍結",
        "Release-freeze": "發行版凍結",
        "Mock UI": "模擬介面",
        "per-file note": "單檔筆記",
        "per-file": "單檔",
        "cross-tool portability": "跨工具可攜性",
        "cross-tool": "跨工具",
        "major version": "主要版本",
        "major versions": "主要版本",
    },
    "zh-cn": {
        "AutoRecover": "自动恢复",
        "Recycle Bin": "回收站",
        "Release freeze": "发布版冻结",
        "Release-freeze": "发布版冻结",
        "Mock UI": "模拟界面",
        "per-file note": "单档笔记",
        "per-file": "单档",
        "cross-tool portability": "跨工具可移植性",
        "cross-tool": "跨工具",
        "major version": "主要版本",
        "major versions": "主要版本",
    },
}

# Standalone English "cap" word translation per locale (when not followed by - or _ or # or in slug-like contexts).
CAP_RE = re.compile(r"(?<![\w\-#])cap(?!s?[\w\-_])")
CAP_TRANSLATE = {
    "ja": "上限",
    "ko": "상한",
    "it": "limite",
    "zh-tw": "上限",
    "zh-cn": "上限",
}


def strip_inline_code(text: str) -> str:
    """Remove inline code spans `...` and code fences ```...``` so they
    don't trigger false positives."""
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"`[^`\n]+`", "", text)
    return text


def strip_frontmatter(text: str) -> str:
    """Return body only, excluding YAML frontmatter."""
    m = re.match(r"^---\n.*?\n---\n(.*)", text, re.DOTALL)
    return m.group(1) if m else text


def strip_urls(text: str) -> str:
    """Remove markdown links + bare URLs (params often contain English)."""
    text = re.sub(r"\]\(https?://[^\s)]+\)", "](URL)", text)
    text = re.sub(r"https?://\S+", "URL", text)
    return text


def audit_file(path: Path, locale: str, fix: bool = False) -> tuple[list[tuple[str, int]], str]:
    """Return list of (term, count) violations + (optionally) fixed text."""
    text = path.read_text(encoding="utf-8")
    body = strip_frontmatter(text)
    body_clean = strip_inline_code(strip_urls(body))

    violations: list[tuple[str, int]] = []
    blacklist = BLACKLIST.get(locale, {})

    # 1. Blacklist exact terms
    for en, _ in blacklist.items():
        count = body_clean.count(en)
        if count > 0:
            violations.append((en, count))

    # 2. Standalone "cap" — but only inside the locale's body
    cap_hits = CAP_RE.findall(body_clean)
    if cap_hits:
        violations.append(("cap (standalone)", len(cap_hits)))

    if not fix:
        return violations, text

    # 3. Apply translations
    fixed = text
    body_full = strip_frontmatter(fixed)
    # Sort longer keys first to avoid prefix-collisions
    for en, local in sorted(blacklist.items(), key=lambda kv: -len(kv[0])):
        fixed_body_new = body_full.replace(en, local)
        if fixed_body_new != body_full:
            fixed = fixed.replace(body_full, fixed_body_new, 1)
            body_full = fixed_body_new
    # cap-as-standalone replacement in body only (preserve frontmatter slugs like cap-mechanism)
    cap_trans = CAP_TRANSLATE.get(locale, "上限")
    body_full = CAP_RE.sub(cap_trans, body_full)
    # rebuild fixed
    m = re.match(r"^(---\n.*?\n---\n)", text, re.DOTALL)
    if m:
        fixed = m.group(1) + body_full
    else:
        fixed = body_full
    return violations, fixed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--slug", help="audit one slug only")
    ap.add_argument("--locale", help="audit one locale only")
    ap.add_argument("--fix", action="store_true", help="auto-translate and write")
    args = ap.parse_args()

    target_locales = [args.locale] if args.locale else list(LOCALES.keys())
    rows: list[tuple[str, str, str, list[tuple[str, int]]]] = []

    for loc in target_locales:
        loc_dir = CONTENT_DIR / loc / "post" if loc != "en" else CONTENT_DIR / "english" / "post"
        if loc == "en":
            continue  # EN is the reference language, nothing to translate from
        if not loc_dir.exists():
            continue
        for slug_dir in sorted(loc_dir.iterdir()):
            if not slug_dir.is_dir():
                continue
            slug = slug_dir.name
            if args.slug and slug != args.slug:
                continue
            idx = slug_dir / "index.md"
            if not idx.exists():
                continue
            violations, fixed_text = audit_file(idx, loc, fix=args.fix)
            rows.append((loc, slug, str(idx), violations))
            if args.fix and violations:
                idx.write_text(fixed_text, encoding="utf-8")

    total_articles = len(rows)
    articles_with_leaks = sum(1 for r in rows if r[3])
    total_violations = sum(sum(v[1] for v in r[3]) for r in rows)

    print(f"# Language Consistency Audit")
    print(f"")
    print(f"Total: {total_articles} article-locale pairs scanned")
    print(f"Articles with leaks: {articles_with_leaks}")
    print(f"Total violations: {total_violations}")
    print(f"")
    if args.fix:
        print(f"**--fix MODE applied: leaks rewritten in place.**")
        print(f"")
    print(f"## Per-locale summary")
    print(f"")
    print(f"| Locale | Articles scanned | With leaks | Total leak count |")
    print(f"|---|---|---|---|")
    for loc in target_locales:
        if loc == "en":
            continue
        loc_rows = [r for r in rows if r[0] == loc]
        with_leaks = sum(1 for r in loc_rows if r[3])
        leak_count = sum(sum(v[1] for v in r[3]) for r in loc_rows)
        print(f"| {loc} | {len(loc_rows)} | {with_leaks} | {leak_count} |")
    print(f"")
    print(f"## Violations by article")
    print(f"")
    print(f"| Locale | Slug | Term | Count |")
    print(f"|---|---|---|---|")
    for loc, slug, _, viols in rows:
        for term, count in viols:
            print(f"| {loc} | `{slug}` | {term} | {count} |")

    if total_violations > 0 and not args.fix:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
