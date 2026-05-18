"""Rewrite excel-data-vanished-postmortem titles + descriptions per locale.

Each locale's title independently re-derived from how that locale's reader
would describe the incident to a colleague (not direct-translated from ja master).
Apply to spec + content.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-data-vanished-postmortem"

LOCALE_DIRNAME = {"ja": "ja", "en": "english", "zh-tw": "zh-tw", "ko": "ko"}
SPEC_LOCALE_SUFFIX = {"ja": "ja", "en": "en", "zh-tw": "zh-TW", "ko": "ko"}

NEW = {
    "ja": {
        "old_title": '【2026 ファイル管理】消えたエクセルのデータ:14:32 火曜、共同編集が呑み込んだ Sheet を 4 層で追う',
        # Note: original used full-width colon "：" not half-width; let me use as-is
        "new_title": '【2026 ファイル管理】Excel 共同編集で Sheet が消えた:14:32 火曜、4 層救援が間に合わなかった現場検証',
        "old_desc": "14:32 火曜、提案資料の Sheet が共同編集中に消えた。OneDrive、SharePoint バージョン履歴、Time Machine、復元ソフトの 4 層を秒単位で検証した事故報告書。",
        "new_desc": "14:32 火曜、共同編集中に提案 Excel ファイルの Sheet が消えた。OneDrive 同期、SharePoint バージョン履歴、Time Machine、復元ソフトの 4 層救援がなぜ間に合わなかったかを秒単位で検証した事故報告書。",
    },
    "en": {
        "old_title": '【2026 File management】Excel data vanished: 14:32 Tuesday, what collaborative editing swallowed, traced through 4 layers',
        "new_title": '【2026 File management】An Excel sheet vanished mid-collaborative-edit: 14:32 Tuesday, why 4 recovery layers all failed',
        "old_desc": "14:32 Tuesday. A sheet in the proposal Excel file vanished mid-collaborative-edit. A second-by-second forensic walk of OneDrive sync, SharePoint version history, Time Machine, and recovery software.",
        "new_desc": "14:32 Tuesday. An Excel sheet vanished during collaborative editing — a colleague's accidental delete. A second-by-second forensic walk of why OneDrive sync, SharePoint version history, Time Machine, and recovery software all failed to bring it back.",
    },
    "zh-tw": {
        "old_title": '【2026 檔案管理】消失的 Excel 資料:星期二 14:32，共同編輯吃掉的 Sheet 怎麼從 4 層救援',
        "new_title": '【2026 檔案管理】Excel 共編誤刪 Sheet:14:32 那個下午，4 層救援為什麼一個都救不回',
        "old_desc": "星期二 14:32，提案資料的 Sheet 在共同編輯中消失。秒級檢驗 OneDrive、SharePoint 版本歷史、Time Machine、還原軟體 4 層救援的事故報告書。",
        "new_desc": "星期二 14:32，提案的 Excel 開啟發現整個 Sheet 不見了 — 同事中午共編時誤刪。秒級檢驗 OneDrive 同步、SharePoint 版本歷史、Time Machine、還原軟體 4 層救援為什麼一個都救不回的事故報告書。",
    },
    "ko": {
        "old_title": '【2026 파일 관리】사라진 Excel 데이터: 화요일 14시 32분, 공동 편집이 삼킨 Sheet를 4개 계층으로 추적',
        "new_title": '【2026 파일 관리】공동 편집 중 Excel Sheet가 사라졌다: 화요일 14:32, 4개 복구 계층이 모두 실패한 이유',
        "old_desc": "화요일 14시 32분, 제안 자료의 Sheet가 공동 편집 중 사라졌다. OneDrive 동기화, SharePoint 버전 기록, Time Machine, 복구 소프트웨어 4개 계층의 사고 보고서, 초 단위 검증.",
        "new_desc": "화요일 14:32, 제안용 Excel을 열어보니 Sheet 하나가 통째로 사라졌다 — 동료가 점심 시간 공동 편집 중 실수로 삭제. OneDrive 동기화, SharePoint 버전 기록, Time Machine, 복구 소프트웨어 4개 계층이 모두 실패한 이유를 초 단위로 검증한 사고 보고서.",
    },
}


def main():
    for locale, dirname in LOCALE_DIRNAME.items():
        n = NEW[locale]
        for path in [
            ROOT / "specs" / SLUG / f"final.{SPEC_LOCALE_SUFFIX[locale]}.md",
            ROOT / "content" / dirname / "post" / SLUG / "index.md",
        ]:
            if not path.exists():
                continue
            text = path.read_text(encoding="utf-8")
            applied = 0
            # Use looser match: replace the title line + description line directly
            # Match title by full-width colon variant too
            for old, new in [
                (n["old_title"], n["new_title"]),
                (n["old_title"].replace(":", "："), n["new_title"]),
                (n["old_desc"], n["new_desc"]),
            ]:
                if old in text:
                    text = text.replace(old, new, 1)
                    applied += 1
                    break  # only need first match
            # Now apply description
            for old, new in [(n["old_desc"], n["new_desc"])]:
                if old in text:
                    text = text.replace(old, new, 1)
                    applied += 1
            path.write_text(text, encoding="utf-8")
            print(f"  [{locale}] {path.relative_to(ROOT)}: {applied} replacements")


if __name__ == "__main__":
    main()
