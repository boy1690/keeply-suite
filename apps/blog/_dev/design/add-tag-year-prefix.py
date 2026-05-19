"""Add 【2026 {tag}】prefix to title for 4 locales per P1.11 + v0.2.24."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-overwrite-postmortem"

LOCALE_DIRNAME = {"ja": "ja", "en": "english", "zh-tw": "zh-tw", "ko": "ko"}
SPEC_LOCALE_SUFFIX = {"ja": "ja", "en": "en", "zh-tw": "zh-TW", "ko": "ko"}

TITLE_NEW = {
    "ja": '"【2026 ファイル管理】Excel 上書き 復元の現場検証：9:14 火曜、4 層で何が間に合ったか"',
    "en": '"【2026 File management】Excel overwrite recovery forensics: 9:14 Tuesday, what 4 layers retrieved"',
    "zh-tw": '"【2026 檔案管理】Excel 覆蓋還原現場鑑識：星期二 9:14，4 層救援搶回了什麼"',
    "ko": '"【2026 파일 관리】Excel 덮어쓴 파일 복구 현장 검증: 화요일 9시 14분, 4개 계층이 무엇을 건졌나"',
}

TITLE_OLD = {
    "ja": '"Excel 上書き 復元の現場検証：9:14 火曜、4 層で何が間に合ったか"',
    "en": '"Excel overwrite recovery forensics: 9:14 Tuesday, what 4 layers retrieved"',
    "zh-tw": '"Excel 覆蓋還原現場鑑識：星期二 9:14，4 層救援搶回了什麼"',
    "ko": '"Excel 덮어쓴 파일 복구 현장 검증: 화요일 9시 14분, 4개 계층이 무엇을 건졌나"',
}


def main():
    for locale, dirname in LOCALE_DIRNAME.items():
        for path in [
            ROOT / "specs" / SLUG / f"final.{SPEC_LOCALE_SUFFIX[locale]}.md",
            ROOT / "content" / dirname / "post" / SLUG / "index.md",
        ]:
            if not path.exists():
                continue
            text = path.read_text(encoding="utf-8")
            old_line = f'title: {TITLE_OLD[locale]}'
            new_line = f'title: {TITLE_NEW[locale]}'
            if old_line in text:
                text = text.replace(old_line, new_line, 1)
                path.write_text(text, encoding="utf-8")
                print(f"  [OK] {path.relative_to(ROOT)} title updated")
            else:
                print(f"  [MISS old title] {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
