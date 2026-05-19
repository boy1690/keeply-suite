"""Fix language-consistency leaks in excel-data-vanished-postmortem 3 locales."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-data-vanished-postmortem"
LOCALE_DIRNAME = {"ja": "ja", "zh-tw": "zh-tw", "ko": "ko"}
SPEC_LOCALE_SUFFIX = {"ja": "ja", "zh-tw": "zh-TW", "ko": "ko"}

REPLACEMENTS = {
    "ja": {
        "major version v8": "メジャーバージョン v8",
        "major version として記録": "メジャーバージョンとして記録",
        "auto-save": "自動保存",
        "snapshot": "スナップショット",
    },
    "zh-tw": {
        "AutoRecover": "自動回復",
        "major version v8": "主要版本 v8",
        "major version 有留下來": "主要版本有留下來",
    },
    "ko": {
        "AutoRecover": "자동 복구",
        "major version v8": "메이저 버전 v8",
        "major version": "메이저 버전",
        "auto-save": "자동 저장",
        "snapshot": "스냅숏",
    },
}


def main():
    for locale, dirname in LOCALE_DIRNAME.items():
        rules = REPLACEMENTS.get(locale, {})
        for path in [
            ROOT / "specs" / SLUG / f"final.{SPEC_LOCALE_SUFFIX[locale]}.md",
            ROOT / "content" / dirname / "post" / SLUG / "index.md",
        ]:
            if not path.exists():
                continue
            text = path.read_text(encoding="utf-8")
            n = 0
            for old, new in rules.items():
                count = text.count(old)
                if count:
                    text = text.replace(old, new)
                    n += count
            path.write_text(text, encoding="utf-8")
            print(f"  [{locale}] {path.relative_to(ROOT)}: {n} replacements")


if __name__ == "__main__":
    main()
