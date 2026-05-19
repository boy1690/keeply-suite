"""Rewrite H2 to mirror SERP top 10 convention (scenario-first + 動詞-方法/理由 ending).
T+N forensic time anchor moved from H2 heading to body section's first sentence.

Applies to 4 locales (ja master + en + zh-TW + ko). H2 derivation:
- ja: from SERP top 5 study on `エクセル 復元 データ` (rank 4 / 5 / 6 / 8 dominant pattern)
- other locales: translated mirror of ja H2 (translation-only locales per intent.md)
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-data-vanished-postmortem"
LOCALE_DIRNAME = {"ja": "ja", "en": "english", "zh-tw": "zh-tw", "ko": "ko"}
SPEC_LOCALE_SUFFIX = {"ja": "ja", "en": "en", "zh-tw": "zh-TW", "ko": "ko"}


# Each rule: (old_H2_line, new_H2_line)
H2_REWRITE = {
    "ja": [
        ("## 14:32:その瞬間に画面で起きたこと",
         "## 共同編集で Sheet が消えた瞬間に画面で起きたこと"),
        ("## T+30秒:OneDrive が緑チェックを出した理由",
         "## OneDrive 同期マークが緑のままだった理由"),
        ("## T+5分:SharePoint バージョン履歴を開いて見つからなかったもの",
         "## SharePoint バージョン履歴で復元しても #REF! が残る理由"),
        ("## T+1時間:Excel を一度閉じた瞬間に消えた undo stack",
         "## Excel を閉じると Ctrl+Z で undo できなくなる仕様"),
        ("## T+24時間:Time Machine が cloud-state を撮っていた",
         "## Time Machine で前日のバージョンを救えなかった理由"),
        ("## 別の世界線:鈴木さんの PC に Keeply が入っていたら 14:32 に何が起きていたか",
         "## Keeply で共同編集データ消失から復元する方法"),
        ("## 限界:Keeply も救えない 3 種類の共同編集データ消失",
         "## Keeply でも救えない 3 種類の共同編集データ消失"),
    ],
    "zh-tw": [
        ("## 14:32:那一秒畫面上發生了什麼",
         "## 共同編輯把 Sheet 吃掉時 Excel 畫面上的徵兆"),
        ("## T+30 秒:OneDrive 為什麼顯示綠色勾",
         "## OneDrive 同步勾為什麼維持綠色不報錯"),
        ("## T+5 分鐘:SharePoint 版本歷史打開來,找不到的東西",
         "## SharePoint 版本歷史復原後 `#REF!` 為什麼還在"),
        ("## T+1 小時:Excel 一關掉,undo stack 就消失",
         "## Excel 關掉那一秒 Ctrl+Z 為什麼就失效"),
        ("## T+24 小時:Time Machine 拍到的是雲端狀態",
         "## Time Machine 為什麼救不回前一天的 Sheet"),
        ("## 平行宇宙:鈴木的電腦裡裝了 Keeply,14:32 會怎樣",
         "## 用 Keeply 救回共同編輯誤刪的 Excel 資料的方法"),
        ("## 極限:Keeply 也救不到的 3 種共同編輯資料消失",
         "## Keeply 也救不回的 3 種共同編輯資料消失"),
    ],
    "en": [
        ("## 14:32: what happened on screen in that second",
         "## What appears on screen when collaborative editing eats your sheet"),
        ("## T+30 seconds: why OneDrive showed a green check",
         "## Why OneDrive's sync indicator stayed green"),
        ("## T+5 minutes: what SharePoint version history didn't bring back",
         "## Why SharePoint version history restore still leaves `#REF!`"),
        ("## T+1 hour: closing Excel wipes the undo stack",
         "## Why closing Excel disables Ctrl+Z (per-session undo stack)"),
        ("## T+24 hours: Time Machine captured the cloud state",
         "## Why Time Machine can't save yesterday's sheet version"),
        ("## Parallel timeline: what would happen at 14:32 if Keeply were on Suzuki's PC",
         "## How to recover collaborative-edit data loss with Keeply"),
        ("## Limits: three collaborative-edit losses Keeply also can't save",
         "## Three collaborative-edit losses Keeply also can't recover"),
    ],
    "ko": [
        ("## 14:32: 그 1초에 화면에서 일어난 일",
         "## 공동 편집이 Sheet를 삼킨 순간 Excel 화면에서 일어난 일"),
        ("## T+30초: OneDrive가 초록 체크를 표시한 이유",
         "## OneDrive 동기화 표시가 초록색을 유지한 이유"),
        ("## T+5분: SharePoint 버전 기록을 열고 못 찾은 것",
         "## SharePoint 버전 기록으로 복원해도 `#REF!`가 남는 이유"),
        ("## T+1시간: Excel을 한 번 닫는 순간 사라진 undo stack",
         "## Excel을 닫으면 Ctrl+Z가 작동하지 않는 이유 (per-session undo stack)"),
        ("## T+24시간: Time Machine이 클라우드 상태를 찍고 있었다",
         "## Time Machine으로 어제 Sheet 버전을 구할 수 없었던 이유"),
        ("## 평행 우주: 스즈키 PC에 Keeply가 깔려 있었다면 14:32에 어떻게 됐을까",
         "## Keeply로 공동 편집 데이터 소실을 복구하는 방법"),
        ("## 한계: Keeply도 못 구하는 3가지 공동 편집 데이터 소실",
         "## Keeply도 복구할 수 없는 3가지 공동 편집 데이터 소실"),
    ],
}


def apply_to_file(path: Path, rules: list) -> int:
    text = path.read_text(encoding="utf-8")
    n = 0
    for old, new in rules:
        # Try both half-width (:) and full-width (：) colon variants
        for old_variant in [old, old.replace(":", "：")]:
            if old_variant in text:
                text = text.replace(old_variant, new, 1)
                n += 1
                break
        else:
            print(f"    [MISS] {old[:50]!r}")
    path.write_text(text, encoding="utf-8")
    return n


def main():
    for locale, dirname in LOCALE_DIRNAME.items():
        rules = H2_REWRITE.get(locale, [])
        for path in [
            ROOT / "specs" / SLUG / f"final.{SPEC_LOCALE_SUFFIX[locale]}.md",
            ROOT / "content" / dirname / "post" / SLUG / "index.md",
        ]:
            if not path.exists():
                continue
            n = apply_to_file(path, rules)
            print(f"  [{locale}] {path.relative_to(ROOT)}: {n}/{len(rules)} H2 rewritten")


if __name__ == "__main__":
    main()
