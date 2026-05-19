"""Inject timeline.svg + save-dialog.svg image refs into H2 #6 of excel-overwrite-postmortem.

For each of 4 launch locales, find the line right after "## ... {#h2-6-keeply-counterfactual}"
and inject a paragraph with both Mock UI image references at appropriate places in H2 #6.

- timeline.svg goes after the 3-step list ("1. ...\n2. ...\n3. ...") to show the timeline panel
- save-dialog.svg goes after the closing paragraph of H2 #6 (the "interface uses no git terminology" line)
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-overwrite-postmortem"

LOCALE_DIRNAME = {"ja": "ja", "en": "english", "zh-tw": "zh-tw", "ko": "ko"}

ALT_TEXT = {
    "ja": {
        "timeline": "Keeply タイムライン month_end_close_2026_05.xlsx：昨日 18:00 の morning baseline + 30 分自動取り込み履歴",
        "dialog": "Keeply「バージョン保存」ダイアログ：手動 save 時にノート入力 + 保存ボタン",
    },
    "en": {
        "timeline": "Keeply timeline for month_end_close_2026_05.xlsx: yesterday's 6 PM morning baseline + 30-min auto snapshots",
        "dialog": "Keeply Save Version dialog: note input + Save button for manual snapshot",
    },
    "zh-tw": {
        "timeline": "Keeply 時間軸 月底結算_2026年5月.xlsx：昨天 18:00 morning baseline + 30 分鐘自動取樣紀錄",
        "dialog": "Keeply「儲存版本」對話框：手動存版時填筆記 + 儲存按鈕",
    },
    "ko": {
        "timeline": "Keeply 타임라인 월말결산_2026년5월.xlsx: 어제 18:00 morning baseline + 30분 자동 스냅숏 기록",
        "dialog": "Keeply 「버전 저장」 다이얼로그: 수동 저장 시 노트 입력 + 저장 버튼",
    },
}

# Per locale: marker line to inject timeline.svg AFTER, and marker to inject dialog AFTER
INJECT_RULES = {
    "ja": [
        # Inject timeline.svg after the 3-step list
        ("3. 「このバージョンを復元」を押す\n", "timeline"),
        # Inject save-dialog.svg after the "uses no git terminology" closing line
        ("Keeply は git 用語を使わない", "dialog"),
    ],
    "en": [
        ("3. Hit \"Restore this version.\"\n", "timeline"),
        ("The interface uses no git terminology", "dialog"),
    ],
    "zh-tw": [
        ("3. 按「還原此版本」\n", "timeline"),
        ("介面上你不會看到任何 git 術語", "dialog"),
    ],
    "ko": [
        ("3. 「이 버전으로 복원」을 누른다.\n", "timeline"),
        ("화면에는 git 용어가 하나도 안 나온다", "dialog"),
    ],
}


def inject_image(text: str, after_marker: str, alt: str, filename: str) -> tuple[str, bool]:
    """Find the line containing after_marker, find the end of that paragraph, inject image after."""
    idx = text.find(after_marker)
    if idx < 0:
        return text, False
    # Find end of paragraph: next "\n\n"
    para_end = text.find("\n\n", idx)
    if para_end < 0:
        return text, False
    image_line = f"\n\n![{alt}]({filename})"
    new_text = text[:para_end] + image_line + text[para_end:]
    return new_text, True


def main():
    for locale, dirname in LOCALE_DIRNAME.items():
        path = ROOT / "content" / dirname / "post" / SLUG / "index.md"
        if not path.exists():
            print(f"  [MISS] {path}")
            continue
        text = path.read_text(encoding="utf-8")
        injected_count = 0
        for marker, img_kind in INJECT_RULES[locale]:
            alt = ALT_TEXT[locale][img_kind]
            filename = "timeline.svg" if img_kind == "timeline" else "save-dialog.svg"
            new_text, ok = inject_image(text, marker, alt, filename)
            if ok:
                text = new_text
                injected_count += 1
            else:
                print(f"  [WARN] marker not found in {locale}: {marker[:30]!r}")
        path.write_text(text, encoding="utf-8")
        print(f"  [OK injected {injected_count}/2] {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
