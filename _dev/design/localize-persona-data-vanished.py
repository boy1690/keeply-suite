"""Localize persona names per locale convention for excel-data-vanished-postmortem.

Per BWF v0.4 Section Touch 4.3.5 (persona localization rule):
- ja master keeps 鈴木さん / 田中さん (already correct per ja convention)
- zh-TW: 鈴木 → 陳小姐 / 田中 → 小林
- en: Suzuki → Sarah / Tanaka → Mike
- ko: 스즈키 → 김 과장 / 다나카 → 박 대리

This is v1 baseline based on cultural knowledge. Next persona article should
verify against actual SERP top 5 case-study samples per locale.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-data-vanished-postmortem"
LOCALE_DIRNAME = {"zh-tw": "zh-tw", "en": "english", "ko": "ko"}
SPEC_LOCALE_SUFFIX = {"zh-tw": "zh-TW", "en": "en", "ko": "ko"}


# Per-locale: ordered (old, new) tuples — order matters for longer-string-first
RULES = {
    "zh-tw": [
        # Longer compound first to avoid partial collision
        ("業務的鈴木先生（**合成案例**）", "業務的陳小姐（**合成案例**）"),
        ("業務的鈴木先生", "業務的陳小姐"),
        ("後輩田中開過這個檔", "後輩小林開過這個檔"),
        ("後輩田中", "後輩小林"),
        ("田中（後輩）", "小林（後輩）"),
        ("旁邊是後輩田中的頭像", "旁邊是後輩小林的頭像"),
        ("15 秒前田中還開著這個檔", "15 秒前小林還開著這個檔"),
        ("田中中午 14:32 還在編", "小林中午 14:32 還在編"),
        ("鈴木有跟他說", "陳小姐有跟他說"),
        ("田中對 Sheet", "小林對 Sheet"),
        ("田中 12:46:03 刪了 Sheet", "小林 12:46:03 刪了 Sheet"),
        ("「復原田中刪 Sheet」", "「復原小林刪 Sheet」"),
        ("田中的 delete", "小林的 delete"),
        ("v8（12:46，田中）", "v8（12:46，小林）"),
        ("鈴木傳 LINE 給田中", "陳小姐傳 LINE 給小林"),
        ("田中直接登入鈴木的電腦", "小林直接登入陳小姐的電腦"),
        # Suzuki -> 陳小姐
        ("鈴木打開「提案", "陳小姐打開「提案"),
        ("鈴木的電腦", "陳小姐的電腦"),
        ("鈴木看到的", "陳小姐看到的"),
        ("鈴木把 Sheet", "陳小姐把 Sheet"),
        ("鈴木開檔", "陳小姐開檔"),
        ("鈴木想搞清楚狀況", "陳小姐想搞清楚狀況"),
        ("鈴木一開檔", "陳小姐一開檔"),
        ("鈴木的（在辦公室", "陳小姐的（在辦公室"),
        ("鈴木的電腦（在辦公室", "陳小姐的電腦（在辦公室"),
        ("鈴木用瀏覽器打開", "陳小姐用瀏覽器打開"),
        ("鈴木放棄了", "陳小姐放棄了"),
        ("鈴木關檔那一秒", "陳小姐關檔那一秒"),
        ("鈴木想到", "陳小姐想到"),
        ("鈴木什麼都還沒救回來", "陳小姐什麼都還沒救回來"),
        ("鈴木的 Keeply", "陳小姐的 Keeply"),
        ("鈴木關檔後", "陳小姐關檔後"),
        ("鈴木開機", "陳小姐開機"),
        ("鈴木打開 Keeply", "陳小姐打開 Keeply"),
        ("如果，在平行宇宙裡，鈴木", "如果，在平行宇宙裡，陳小姐"),
        ("鈴木本機沒副本", "陳小姐本機沒副本"),
    ],
    "en": [
        ("Suzuki, a sales rep (**composite case**)", "Sarah, a sales rep (**composite case**)"),
        ("Suzuki, a sales rep", "Sarah, a sales rep"),
        ("Tanaka, the junior on the team", "Mike, the junior on the team"),
        ("Tanaka (junior)", "Mike (junior)"),
        ("Tanaka had been editing the file", "Mike had been editing the file"),
        ("Tanaka, had opened the file", "Mike, had opened the file"),
        ("Tanaka right-clicked", "Mike right-clicked"),
        ("Tanaka deleted the sheet", "Mike deleted the sheet"),
        ("Tanaka's avatar", "Mike's avatar"),
        ("Tanaka's lunchtime session", "Mike's lunchtime session"),
        ("Tanaka's sheet deletion", "Mike's sheet deletion"),
        ("Tanaka's delete", "Mike's delete"),
        ("v8 (12:46, Tanaka)", "v8 (12:46, Mike)"),
        ("Suzuki had pinged him", "Sarah had pinged him"),
        ("Suzuki LINEs Tanaka", "Sarah LINEs Mike"),
        ("Tanaka logs into Suzuki's PC", "Mike logs into Sarah's PC"),
        # Suzuki → Sarah
        ("Suzuki opened `proposal", "Sarah opened `proposal"),
        ("Suzuki's PC", "Sarah's PC"),
        ("What Suzuki was seeing", "What Sarah was seeing"),
        ("Suzuki entered 250 rows", "Sarah entered 250 rows"),
        ("Suzuki opened the file;", "Sarah opened the file;"),
        ("Suzuki tried to make sense", "Sarah tried to make sense"),
        ("Suzuki opened OneDrive", "Sarah opened OneDrive"),
        ("Suzuki gave up", "Sarah gave up"),
        ("Suzuki remembered", "Sarah remembered"),
        ("Suzuki has restored nothing", "Sarah has restored nothing"),
        ("Suzuki's vault", "Sarah's vault"),
        ("Suzuki's setup", "Sarah's setup"),
        ("Suzuki closed the file", "Sarah closed the file"),
        ("Suzuki turned on his PC", "Sarah turned on her PC"),
        ("Suzuki opens Keeply", "Sarah opens Keeply"),
        ("if Keeply were on Suzuki's PC", "if Keeply were on Sarah's PC"),
        # Pronoun fix for Sarah (Suzuki was 'he', Sarah is 'she')
        ("the file he'd been working on since Monday", "the file she'd been working on since Monday"),
        ("he went to close the file", "she went to close the file"),
        ("He clicked the", "She clicked the"),
        ("He opened OneDrive", "She opened OneDrive"),
        ("He clicked \"Restore", "She clicked \"Restore"),
        ("He checked", "She checked"),
        ("He reopened it", "She reopened it"),
        ("He noticed", "She noticed"),
        ("He opened yesterday's 3 PM snapshot", "She opened yesterday's 3 PM snapshot"),
        ("He opened \"Sales Records\"", "She opened \"Sales Records\""),
        ("He opens the file", "She opens the file"),
        ("Sarah had pinged him", "Sarah had pinged Mike"),
    ],
    "ko": [
        ("영업 스즈키 씨(**가공 사례**)", "영업 김 과장(**가공 사례**)"),
        ("영업 스즈키 씨", "영업 김 과장"),
        ("스즈키 씨", "김 과장"),
        ("후배 다나카 씨", "후배 박 대리"),
        ("다나카 씨", "박 대리"),
        ("다나카(후배)", "박 대리(후배)"),
        ("다나카가 점심에 편집", "박 대리가 점심에 편집"),
        ("다나카가 이 파일", "박 대리가 이 파일"),
        ("다나카, Sheet", "박 대리, Sheet"),
        ("다나카가 12:46:03에 Sheet", "박 대리가 12:46:03에 Sheet"),
        ("다나카의 delete", "박 대리의 delete"),
        ("다나카의 Sheet 삭제", "박 대리의 Sheet 삭제"),
        ("v8(12:46, 다나카)", "v8(12:46, 박 대리)"),
        ("스즈키가 「내일 제안」", "김 과장이 「내일 제안」"),
        ("스즈키가 다나카에게 LINE", "김 과장이 박 대리에게 LINE"),
        ("다나카가 스즈키 PC에", "박 대리가 김 과장 PC에"),
        ("다나카가 김 과장 PC에", "박 대리가 김 과장 PC에"),
        # 스즈키 → 김 과장
        ("스즈키가 「제안", "김 과장이 「제안"),
        ("스즈키 PC", "김 과장 PC"),
        ("스즈키가 보는", "김 과장이 보는"),
        ("스즈키, Sheet", "김 과장, Sheet"),
        ("스즈키가 엶", "김 과장이 엶"),
        ("스즈키 PC(사무실, 저녁까지", "김 과장 PC(사무실, 저녁까지"),
        ("스즈키가 상황을 파악", "김 과장이 상황을 파악"),
        ("스즈키가 브라우저", "김 과장이 브라우저"),
        ("스즈키가 포기하고", "김 과장이 포기하고"),
        ("스즈키가 「회사 Mac", "김 과장이 「회사 Mac"),
        ("스즈키는 아직 아무것도", "김 과장은 아직 아무것도"),
        ("스즈키 설정에서", "김 과장 설정에서"),
        ("스즈키가 파일을 닫은", "김 과장이 파일을 닫은"),
        ("스즈키가 PC를 켜고", "김 과장이 PC를 켜고"),
        ("스즈키가 Keeply", "김 과장이 Keeply"),
        ("Keeply가 깔려 있었다면, 14시 32분", "Keeply가 깔려 있었다면, 14시 32분"),
        ("스즈키 씨가 「판매 실적」", "김 과장이 「판매 실적」"),
        ("스즈키 씨가 다음 날", "김 과장이 다음 날"),
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
                count = text.count(old)
                if count > 0:
                    text = text.replace(old, new)
                    applied += count
            path.write_text(text, encoding="utf-8")
            print(f"  [{locale}] {path.relative_to(ROOT)}: {applied} replacements")


if __name__ == "__main__":
    main()
