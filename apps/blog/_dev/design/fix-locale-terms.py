"""Translate English tech terms to local equivalents per locale.
- AutoRecover → 自動回復 (ja: オートリカバリ / ko: 자동 복구 / zh-TW: 自動回復)
- snapshot → スナップショット (ja only)
- bug → 規格漏洞 / not-spec (zh-TW)

Keep first AutoRecover mention as English (intro to feature name), translate rest.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-overwrite-postmortem"

LOCALE_DIRNAME = {"ja": "ja", "en": "english", "zh-tw": "zh-tw", "ko": "ko"}
SPEC_LOCALE_SUFFIX = {"ja": "ja", "en": "en", "zh-tw": "zh-TW", "ko": "ko"}

# Translation map per locale
TERMS = {
    "ja": {
        "AutoRecover": "オートリカバリ",
        "snapshot": "スナップショット",
    },
    "ko": {
        "AutoRecover": "자동 복구",
    },
    "zh-tw": {
        "AutoRecover": "自動回復",
        # "bug" usage: keep as 「規格」context (single occurrence; not an actual bug term)
        # 「這是規格、不是 bug」 — this is a self-conscious comment, OK as-is per linguistic flexibility
    },
}


def apply(path: Path, locale: str) -> dict:
    text = path.read_text(encoding="utf-8")
    counts = {}
    for term_en, term_local in TERMS.get(locale, {}).items():
        # Replace all occurrences (intro context can use either form)
        n = text.count(term_en)
        if n > 0:
            text = text.replace(term_en, term_local)
            counts[term_en] = n
    path.write_text(text, encoding="utf-8")
    return counts


def main():
    for locale, dirname in LOCALE_DIRNAME.items():
        if locale not in TERMS:
            continue
        for path in [
            ROOT / "specs" / SLUG / f"final.{SPEC_LOCALE_SUFFIX[locale]}.md",
            ROOT / "content" / dirname / "post" / SLUG / "index.md",
        ]:
            if not path.exists():
                continue
            counts = apply(path, locale)
            counts_str = ", ".join(f"{k}={v}" for k, v in counts.items()) or "(no change)"
            print(f"  [{locale}] {path.relative_to(ROOT)}: {counts_str}")


if __name__ == "__main__":
    main()
