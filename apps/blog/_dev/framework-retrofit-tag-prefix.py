"""
Retrofit 【2026 檔案管理】 (per-locale) prefix into frontmatter title + first H1
across 6 core locales for shipped articles.

Safe rules:
- Only modify line 2 (frontmatter title: "...") and the FIRST line starting with "# "
- Skip if 【 already present (idempotent)
- Only the 6 core locales (en mapped to content/english/)
- Print dry-run report before any write
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "content"

LOCALE_DIR = {
    "en":    "english",
    "zh-tw": "zh-tw",
    "zh-cn": "zh-cn",
    "ja":    "ja",
    "ko":    "ko",
    "it":    "it",
}

PREFIX = {
    "en":    "【2026 File Management】",
    "zh-tw": "【2026 檔案管理】",
    "zh-cn": "【2026 文件管理】",
    "ja":    "【2026 ファイル管理】",
    "ko":    "【2026 파일 관리】",
    "it":    "【2026 Gestione file】",
}

SLUGS = [
    "autocad-wrong-version-crew",
    "dropbox-conflicted-copy",
    "departing-employee-data-risk",
    "hidden-cost-shared-folders",
    "install-keeply-windows-mac",
    "keeply-first-week-workflow",
    "restore-without-panic",
    "thesis-single-point-of-failure",
    "too-many-file-versions",
    "version-control-software-non-developer",
    "vibe-coding-rollback",
    "what-keeply-saves-vs-backup-cloud",
    "why-i-built-keeply",
]


def patch_file(path: Path, prefix: str, write: bool) -> tuple[bool, bool, str]:
    """Return (title_changed, h1_changed, status)."""
    raw = path.read_text(encoding="utf-8")
    lines = raw.split("\n")
    title_changed = False
    h1_changed = False

    # Patch frontmatter title (line 2 usually)
    for i, line in enumerate(lines[:10]):
        if line.startswith("title:"):
            # Extract quoted content
            if '"' in line:
                pre, q1, rest = line.partition('"')
                inner, q2, post = rest.partition('"')
                if "【" not in inner:
                    lines[i] = f'{pre}"{prefix}{inner}"{post}'
                    title_changed = True
            break

    # Patch first H1
    for i, line in enumerate(lines):
        if line.startswith("# "):
            content = line[2:]
            if "【" not in content:
                lines[i] = f"# {prefix}{content}"
                h1_changed = True
            break

    if (title_changed or h1_changed) and write:
        path.write_text("\n".join(lines), encoding="utf-8")

    parts = []
    if title_changed:
        parts.append("title")
    if h1_changed:
        parts.append("H1")
    status = "+".join(parts) if parts else "skip"
    return title_changed, h1_changed, status


def main() -> int:
    write = "--write" in sys.argv
    total_title = 0
    total_h1 = 0
    for slug in SLUGS:
        for locale, dirname in LOCALE_DIR.items():
            path = ROOT / dirname / "post" / slug / "index.md"
            if not path.exists():
                print(f"MISSING {locale}/{slug}")
                continue
            t, h, status = patch_file(path, PREFIX[locale], write)
            if t:
                total_title += 1
            if h:
                total_h1 += 1
            print(f"{status:>10}  {locale:>5}/{slug}")
    print(f"\nTotal: title={total_title} h1={total_h1}  write={write}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
