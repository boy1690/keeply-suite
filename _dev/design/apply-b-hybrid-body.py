"""Apply B hybrid body changes to excel-data-vanished-postmortem 4 locales.

Per Touch 4.3 Body SERP-mimic insight:
- 守 (mirror SERP): UI markup 【】 / numbered procedural sub-block / cushion word reduction (zh-TW)
- 破 (differentiation 保留): forensic narrative / persona / 外部權威 URL 引用

Changes per locale:
1. UI path markup conversion 「ファイル → 情報 → バージョン履歴」→ 【ファイル → 情報 → バージョン履歴】
   (only UI button paths; keep 「」 for sheet names / quoted speech)
2. Insert procedural sub-block at end of H2 #3 (SharePoint #REF! 修復手順)
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-data-vanished-postmortem"
LOCALE_DIRNAME = {"ja": "ja", "en": "english", "zh-tw": "zh-tw", "ko": "ko"}
SPEC_LOCALE_SUFFIX = {"ja": "ja", "en": "en", "zh-tw": "zh-TW", "ko": "ko"}


# Per-locale: (old_string, new_string) tuples applied in order
RULES = {
    "ja": [
        # UI markup conversion
        ('「ファイル → 情報 → バージョン履歴」を開いた',
         '【ファイル → 情報 → バージョン履歴】を開いた'),
        ('「バージョン履歴」を選ぶ',
         '【バージョン履歴】を選ぶ'),
        ('「v7 に戻す」をクリック',
         '【v7 に戻す】をクリック'),
        ('Excel 内部「バージョン履歴」ボタンより',
         'Excel 内部の【バージョン履歴】ボタンより'),
        # Insert procedural sub-block at end of H2 #3 section (before "ここまでで失われた時間")
        ('Sheet 削除という event を「主要版本」として記録するが、deleted-sheet cascade の formula 影響まで巻き戻すわけではない。\n\nここまでで失われた時間：3 時間 28 分。',
         'Sheet 削除という event を「主要版本」として記録するが、deleted-sheet cascade の formula 影響まで巻き戻すわけではない。\n\n**復元後の cascade formula 修復手順**：\n\n1. 復元された Sheet「販売実績」を確認（250 行のデータが戻っている）\n2. Sheet「見積もり」を開く → `#REF!` が大量に出ている\n3. formula bar で参照先 cell address を 1 つずつ書き換え\n4. cell 数が多い場合は VLOOKUP / XLOOKUP で一括置換も検討\n\nここまでで失われた時間：3 時間 28 分。'),
    ],
    "zh-tw": [
        # UI markup
        ('Excel 的「檔案 → 資訊 → 版本歷史」',
         'Excel 的【檔案 → 資訊 → 版本歷史】'),
        ('選「版本歷史」',
         '選【版本歷史】'),
        ('按「還原 v7」',
         '按【還原 v7】'),
        ('從 Excel 介面內按那顆按鈕',
         '從 Excel 介面內按【版本歷史】按鈕'),
        # Insert procedural sub-block in H2 #3
        ('Sheet 被刪這件事會被記成「主要版本」，可是它沒辦法回頭去修被刪 Sheet 連帶造成的公式錯誤。\n\n到這裡，已經損失 3 小時 28 分鐘。',
         'Sheet 被刪這件事會被記成「主要版本」，可是它沒辦法回頭去修被刪 Sheet 連帶造成的公式錯誤。\n\n**復原後 cascade 公式的修復步驟**：\n\n1. 復原後打開 Sheet「報價」（公式 cell 大片 `#REF!`）\n2. 在資料編輯列找到原本指向「業績實績」的位址\n3. 一格一格改寫成新的參照位置\n4. 同 Sheet 公式太多，用 VLOOKUP / XLOOKUP 批次處理\n\n到這裡，已經損失 3 小時 28 分鐘。'),
    ],
    "en": [
        # UI markup
        ('Excel\'s File → Info → Version History',
         'Excel\'s **[File → Info → Version History]**'),
        ('chose "Version History"',
         'chose **[Version History]**'),
        ('clicked "Restore v7"',
         'clicked **[Restore v7]**'),
        ('Going through Excel\'s in-app "Version History" button',
         'Going through Excel\'s in-app **[Version History]** button'),
        # Insert procedural sub-block in H2 #3
        ('It records "sheet deletion" as a major version event, but it doesn\'t roll back the cascading formula damage from the deleted sheet.\n\nTime lost so far: 3 hours 28 minutes.',
         'It records "sheet deletion" as a major version event, but it doesn\'t roll back the cascading formula damage from the deleted sheet.\n\n**Manual cascade-formula repair steps after restore**:\n\n1. Open the restored "Quotes" sheet (you\'ll see `#REF!` across many cells)\n2. In the formula bar, locate the original cell references that pointed to "Sales Records"\n3. Rewrite each reference to the new cell address one by one\n4. If the sheet has too many formulas, use VLOOKUP / XLOOKUP for batch replacement\n\nTime lost so far: 3 hours 28 minutes.'),
    ],
    "ko": [
        # UI markup
        ('Excel의 「파일 → 정보 → 버전 기록」',
         'Excel의 【파일 → 정보 → 버전 기록】'),
        ('「버전 기록」을 선택',
         '【버전 기록】을 선택'),
        ('「v7 복원」 클릭',
         '【v7 복원】 클릭'),
        ('Excel 화면 안의 「버전 기록」 버튼',
         'Excel 화면 안의 【버전 기록】 버튼'),
        # Insert procedural sub-block in H2 #3
        ('Sheet 삭제라는 event를 「주요 버전」으로 기록하지만, 삭제된 Sheet로 인한 cascade 수식 영향까지 되돌리지는 않는다.\n\n여기까지 잃은 시간: 3시간 28분.',
         'Sheet 삭제라는 event를 「주요 버전」으로 기록하지만, 삭제된 Sheet로 인한 cascade 수식 영향까지 되돌리지는 않는다.\n\n**복원 후 cascade 수식 수동 복구 단계**:\n\n1. 복원된 Sheet「판매 실적」 확인 (250행 데이터가 돌아온 상태)\n2. Sheet「견적」 열기 → `#REF!`가 대량으로 표시됨\n3. 수식 입력줄에서 「판매 실적」을 가리키던 참조 주소를 하나씩 새 주소로 다시 작성\n4. 셀 수가 많으면 VLOOKUP / XLOOKUP으로 일괄 치환 고려\n\n여기까지 잃은 시간: 3시간 28분.'),
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
                    print(f"    [MISS in {locale}] {old[:40]!r}")
            path.write_text(text, encoding="utf-8")
            print(f"  [{locale}] {path.relative_to(ROOT)}: {applied}/{len(rules)} rules")


if __name__ == "__main__":
    main()
