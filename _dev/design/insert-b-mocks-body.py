"""Insert B 3 mock SVG image refs into body of excel-data-vanished-postmortem
across 4 locales. Insertion points:
- H2 #2 OneDrive: onedrive-sync-popup.svg
- H2 #3 SharePoint (after restore click): sharepoint-version-history.svg
- H2 #3 SharePoint (before procedural sub-block): excel-ref-error-grid.svg
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-data-vanished-postmortem"
LOCALE_DIRNAME = {"ja": "ja", "en": "english", "zh-tw": "zh-tw", "ko": "ko"}
SPEC_LOCALE_SUFFIX = {"ja": "ja", "en": "en", "zh-tw": "zh-TW", "ko": "ko"}


# Per-locale: list of (old_substring_match, new_substring_with_inserted_image)
RULES = {
    "ja": [
        # H2 #2 OneDrive — insert before final paragraph
        (
            "つまり「同期されている」イコール「あなたの作業が安全」ではない。ましてや共同編集中は、他人の delete も同期される。",
            "![Mock UI OneDrive 同期通知：緑チェック + 「全て最新の状態です」+ 黄色警告「同期済 ≠ あなたのデータが安全」](onedrive-sync-popup.svg)\n\nつまり「同期されている」イコール「あなたの作業が安全」ではない。ましてや共同編集中は、他人の delete も同期される。"
        ),
        # H2 #3 — insert sharepoint-version-history after restore click
        (
            "【v7 に戻す】をクリック。\n\n数秒待つ。",
            "【v7 に戻す】をクリック。\n\n![Mock UI SharePoint バージョン履歴 list：v8 田中削除（紅）/ v7 鈴木 復元ボタン（青）/ v6 / v5 過去版](sharepoint-version-history.svg)\n\n数秒待つ。"
        ),
        # H2 #3 — insert excel-ref-error-grid before procedural sub-block
        (
            "deleted-sheet cascade の formula 影響まで巻き戻すわけではない。\n\n**復元後の cascade formula 修復手順**",
            "deleted-sheet cascade の formula 影響まで巻き戻すわけではない。\n\n![Mock UI Excel #REF! cell grid：B-D 欄全部 #REF! / A 欄クライアント名保留 / 公式列で 削除済 Sheet 参照](excel-ref-error-grid.svg)\n\n**復元後の cascade formula 修復手順**"
        ),
    ],
    "zh-tw": [
        (
            "「已同步」不等於「你的工作安全」。在共同編輯模式下，別人的 delete 也會同步進來。",
            "![Mock UI OneDrive 同步通知：綠勾 +「全部都是最新狀態」+ 黃色警告「已同步 ≠ 你的資料安全」](onedrive-sync-popup.svg)\n\n「已同步」不等於「你的工作安全」。在共同編輯模式下，別人的 delete 也會同步進來。"
        ),
        (
            "按【還原 v7】。\n\n等幾秒。",
            "按【還原 v7】。\n\n![Mock UI SharePoint 版本歷史 list：v8 小林刪除（紅）/ v7 陳小姐 還原按鈕（藍）/ v6 / v5 過去版](sharepoint-version-history.svg)\n\n等幾秒。"
        ),
        (
            "Sheet 被刪這件事會被記成「主要版本」，可是它沒辦法回頭去修被刪 Sheet 連帶造成的公式錯誤。\n\n**復原後 cascade 公式的修復步驟**",
            "Sheet 被刪這件事會被記成「主要版本」，可是它沒辦法回頭去修被刪 Sheet 連帶造成的公式錯誤。\n\n![Mock UI Excel #REF! cell grid：B-D 欄全部 #REF! / A 欄客戶名保留 / 公式列指向已刪 Sheet](excel-ref-error-grid.svg)\n\n**復原後 cascade 公式的修復步驟**"
        ),
    ],
    "en": [
        (
            "\"Synced\" does not equal \"your work is safe.\" In a collaborative editing context, other people's deletes also sync.",
            "![Mock UI OneDrive sync popup: green check + \"All up to date\" + yellow warning \"Synced ≠ Your data is safe\"](onedrive-sync-popup.svg)\n\n\"Synced\" does not equal \"your work is safe.\" In a collaborative editing context, other people's deletes also sync."
        ),
        (
            "She clicked \"Restore v7.\"\n\nA few seconds.",
            "She clicked \"Restore v7.\"\n\n![Mock UI SharePoint Version History list: v8 Mike delete (red) / v7 Sarah Restore button (blue) / v6 / v5 past versions](sharepoint-version-history.svg)\n\nA few seconds."
        ),
        (
            "It records \"sheet deletion\" as a major version event, but it doesn't roll back the cascading formula damage from the deleted sheet.\n\n**Manual cascade-formula repair steps after restore**",
            "It records \"sheet deletion\" as a major version event, but it doesn't roll back the cascading formula damage from the deleted sheet.\n\n![Mock UI Excel #REF! cell grid: columns B-D all #REF! / column A client names intact / formula bar shows reference to deleted Sheet](excel-ref-error-grid.svg)\n\n**Manual cascade-formula repair steps after restore**"
        ),
    ],
    "ko": [
        (
            "「동기화됨」이 「당신의 작업이 안전」을 뜻하지 않는다. 게다가 공동 편집 중에는 다른 사람의 delete도 동기화된다.",
            "![Mock UI OneDrive 동기화 알림: 초록 체크 + 「모두 최신 상태입니다」 + 노란색 경고 「동기화됨 ≠ 데이터가 안전」](onedrive-sync-popup.svg)\n\n「동기화됨」이 「당신의 작업이 안전」을 뜻하지 않는다. 게다가 공동 편집 중에는 다른 사람의 delete도 동기화된다."
        ),
        (
            "「v7 복원」 클릭.\n\n몇 초 기다림.",
            "「v7 복원」 클릭.\n\n![Mock UI SharePoint 버전 기록 list: v8 박 대리 삭제(빨강) / v7 김 과장 복원 버튼(파랑) / v6 / v5 과거 버전](sharepoint-version-history.svg)\n\n몇 초 기다림."
        ),
        (
            "Sheet 삭제라는 event를 「주요 버전」으로 기록하지만, 삭제된 Sheet로 인한 cascade 수식 영향까지 되돌리지는 않는다.\n\n**복원 후 cascade 수식 수동 복구 단계**",
            "Sheet 삭제라는 event를 「주요 버전」으로 기록하지만, 삭제된 Sheet로 인한 cascade 수식 영향까지 되돌리지는 않는다.\n\n![Mock UI Excel #REF! cell grid: B-D 열 모두 #REF! / A 열 고객명 유지 / 수식 입력줄에 삭제된 Sheet 참조](excel-ref-error-grid.svg)\n\n**복원 후 cascade 수식 수동 복구 단계**"
        ),
    ],
}


def main():
    for locale, dirname in LOCALE_DIRNAME.items():
        rules = RULES.get(locale, [])
        for path in [
            ROOT / "specs" / SLUG / f"final.{SPEC_LOCALE_SUFFIX[locale]}.md",
            ROOT / "content" / dirname / "post" / SLUG / "index.md",
        ]:
            if not path.exists():
                continue
            text = path.read_text(encoding="utf-8")
            applied = 0
            for old, new in rules:
                if old in text:
                    text = text.replace(old, new, 1)
                    applied += 1
                else:
                    print(f"    [MISS in {locale}] {old[:60]!r}")
            path.write_text(text, encoding="utf-8")
            print(f"  [{locale}] {path.relative_to(ROOT)}: {applied}/{len(rules)} mocks inserted")


if __name__ == "__main__":
    main()
