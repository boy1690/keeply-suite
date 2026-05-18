"""Add Keeply presence to FAQ section across 4 locales.

1. Add 1 dedicated Keeply Q at top of FAQ: "Keeply 怎麼補上這 4 層救援的破口？"
2. Append 1-sentence Keeply closing to 3 existing A:
   - AutoRecover Q → "...要救覆蓋前的版本，需要事故發生之前就有版本保管庫（Keeply 就是這層）"
   - Recovery software Q → "...Keeply 把版本層放在 SSD 寫入之前的應用層，避開這個物理限制"
   - Time Machine Q → "...Keeply 自動儲存間隔最短 15 分鐘，比 Time Machine 預設 1 小時細"
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-overwrite-postmortem"
LOCALE_DIRNAME = {"ja": "ja", "en": "english", "zh-tw": "zh-tw", "ko": "ko"}
SPEC_LOCALE_SUFFIX = {"ja": "ja", "en": "en", "zh-tw": "zh-TW", "ko": "ko"}


# Edits: each entry is (old_text, new_text) -- applied in order
RULES = {
    "zh-tw": [
        # 1. Add dedicated Keeply Q at top of FAQ
        ("## 常見問題 {#faq}\n\n**Q. Excel 覆蓋儲存後，還能救回前一版嗎？**",
         "## 常見問題 {#faq}\n\n**Q. Keeply 怎麼補上這 4 層救援的破口？**\n\n"
         "A. 把版本歷史層放在事故發生之前。Keeply 在背景自動儲存（15 / 30 / 60 分鐘間隔可選）+ 重要節點你主動按「儲存版本」+ 每張快照保留在獨立保管庫不互相覆蓋。事故當下你開 Keeply、挑前一版、按「還原此版本」，30 秒搞定。前面四層（自動回復 / OneDrive 版本歷史 / Time Machine / 還原軟體）全部都是事後救援，本質上都會在某個間隔窗口失效；Keeply 是事前防禦，不是另一個事後選項。\n\n"
         "**Q. Excel 覆蓋儲存後，還能救回前一版嗎？**"),
        # 2. AutoRecover A append
        ("A. 不能。自動回復是救 Excel 當機用的。檔案正常關掉的那一秒，自動回復暫存檔自動刪除。覆蓋後再關閉的檔案，自動回復救不到。",
         "A. 不能。自動回復是救 Excel 當機用的。檔案正常關掉的那一秒，自動回復暫存檔自動刪除。覆蓋後再關閉的檔案，自動回復救不到。要救覆蓋前的版本，需要事故發生之前就有獨立的版本保管庫；Keeply 就是補這層用的。"),
        # 3. Recovery software A append
        ("A. SSD 上幾乎不行（NIST SP 800-88r1）。要同時湊齊「HDD + 覆蓋剛發生 + 檔案系統還沒覆蓋」三個條件才有機會。公司工作 PC 主流是 SSD，實際上很難期待。",
         "A. SSD 上幾乎不行（NIST SP 800-88r1）。要同時湊齊「HDD + 覆蓋剛發生 + 檔案系統還沒覆蓋」三個條件才有機會。公司工作 PC 主流是 SSD，實際上很難期待。Keeply 把版本層放在 SSD 寫入之前的應用層，避開 TRIM 物理限制 — 上一版的位元一直好好地在保管庫裡。"),
        # 4. Time Machine A append
        ("A. 預設不行。1 小時拍一次的間隔下，事故跟下一張快照之間的覆蓋會被吃掉。除非你把 Time Machine 改成更頻繁，或自己有手動拍快照的習慣。公司配的 Mac 多半是預設。",
         "A. 預設不行。1 小時拍一次的間隔下，事故跟下一張快照之間的覆蓋會被吃掉。除非你把 Time Machine 改成更頻繁，或自己有手動拍快照的習慣。公司配的 Mac 多半是預設。Keeply 自動儲存間隔最短 15 分鐘，比 Time Machine 預設 1 小時細很多 — 9:14 出事、9:00 那張快照還在，Keeply 抓得到。"),
    ],
    "ja": [
        ("## よくある質問 {#faq}\n\n**Q. Excel で上書き保存した後、元に戻せますか？**",
         "## よくある質問 {#faq}\n\n**Q. Keeply はこの 4 層救援の隙間をどう埋めますか？**\n\n"
         "A. バージョン履歴層を事故発生の前に置く。Keeply はバックグラウンドで自動保存（15 / 30 / 60 分から選択）+ 節目で「儲存版本」ボタンを手動で押す + 各スナップショットは独立した保管庫に互いに上書きせず保存。事故時に Keeply を開き、前のバージョンを選び、「このバージョンを復元」を押す、30 秒で完了。前述の 4 層（オートリカバリ / OneDrive バージョン履歴 / Time Machine / 復元ソフト）は全部事後救援であり、本質的にどこかの間隔窓で失敗する；Keeply は事前防御、もう一つの事後選択肢ではない。\n\n"
         "**Q. Excel で上書き保存した後、元に戻せますか？**"),
        ("A. オートリカバリは「Excel がクラッシュ中の救援」用。正常終了したファイルでは オートリカバリ ファイルが自動削除される。上書き保存して閉じた後の復元はできない。",
         "A. オートリカバリは「Excel がクラッシュ中の救援」用。正常終了したファイルでは オートリカバリ ファイルが自動削除される。上書き保存して閉じた後の復元はできない。上書き前のバージョンを救うには、事故発生前にバージョン保管庫があることが必要；Keeply はこの層を補うためのものだ。"),
        ("A. SSD + TRIM 環境では物理的に困難（NIST SP 800-88r1 参照）。HDD 環境 + 上書き直後 + ファイルシステム未上書きの 3 条件揃った場合のみ可能性がある。業務 PC は SSD が主流のため、現実的には期待できない。",
         "A. SSD + TRIM 環境では物理的に困難（NIST SP 800-88r1 参照）。HDD 環境 + 上書き直後 + ファイルシステム未上書きの 3 条件揃った場合のみ可能性がある。業務 PC は SSD が主流のため、現実的には期待できない。Keeply はバージョン層を SSD 書き込みの前の応用層に置くことで、TRIM 物理限界を回避する — 前のバージョンのバイトは保管庫にちゃんと残っている。"),
        ("A. Default 1 時間 snapshot interval では救えない。Time Machine 設定を「Local snapshot more frequent」にカスタマイズするか、手動 snapshot を撮る習慣がある場合のみ可能。多くの企業配布 Mac は default 設定のまま。",
         "A. Default 1 時間 snapshot interval では救えない。Time Machine 設定を「Local snapshot more frequent」にカスタマイズするか、手動 snapshot を撮る習慣がある場合のみ可能。多くの企業配布 Mac は default 設定のまま。Keeply の自動保存間隔は最短 15 分、Time Machine デフォルトの 1 時間よりずっと細かい — 9:14 に事故、9:00 のスナップショットがまだ残っている、Keeply は捕まえられる。"),
    ],
    "ko": [
        ("## 자주 묻는 질문 {#faq}\n\n**Q. Excel을 덮어쓴 후 이전 버전을 복구할 수 있나요?**",
         "## 자주 묻는 질문 {#faq}\n\n**Q. Keeply는 이 4개 계층 복구의 빈틈을 어떻게 메우나요?**\n\n"
         "A. 버전 기록 계층을 사고 발생 전에 둔다. Keeply는 백그라운드 자동 저장(15 / 30 / 60분 중 선택) + 중요 순간에 「버전 저장」 버튼 수동 누름 + 각 스냅숏을 독립 보관소에 서로 덮어쓰지 않고 저장. 사고 시 Keeply를 열고, 이전 버전을 선택하고, 「이 버전으로 복원」을 누른다, 30초면 끝. 앞의 4개 계층(자동 복구 / OneDrive 버전 기록 / Time Machine / 복구 소프트웨어)은 모두 사후 구조이고, 본질적으로 어딘가의 간격 창에서 실패한다; Keeply는 사전 방어이지, 또 하나의 사후 선택지가 아니다.\n\n"
         "**Q. Excel을 덮어쓴 후 이전 버전을 복구할 수 있나요?**"),
        ("A. 안 됩니다. 자동 복구는 「Excel이 실행 중 충돌」 상황을 위한 것입니다. 파일이 정상 종료되는 그 순간 자동 복구 임시 파일이 자동 삭제됩니다. 덮어쓴 후 닫은 파일은 자동 복구로 복구할 수 없습니다.",
         "A. 안 됩니다. 자동 복구는 「Excel이 실행 중 충돌」 상황을 위한 것입니다. 파일이 정상 종료되는 그 순간 자동 복구 임시 파일이 자동 삭제됩니다. 덮어쓴 후 닫은 파일은 자동 복구로 복구할 수 없습니다. 덮어쓰기 전 버전을 살리려면, 사고 발생 전에 독립된 버전 보관소가 필요합니다; Keeply가 바로 이 계층을 메우는 도구입니다."),
        ("A. SSD + TRIM 환경에서는 물리적으로 매우 어렵습니다(NIST SP 800-88r1 참조). 「HDD + 덮어쓰기 직후 + 파일 시스템 미덮어쓰기」 세 조건이 동시에 맞아야 가능성이 있습니다. 회사 업무 PC는 주로 SSD라 현실적으로 기대하기 어렵습니다.",
         "A. SSD + TRIM 환경에서는 물리적으로 매우 어렵습니다(NIST SP 800-88r1 참조). 「HDD + 덮어쓰기 직후 + 파일 시스템 미덮어쓰기」 세 조건이 동시에 맞아야 가능성이 있습니다. 회사 업무 PC는 주로 SSD라 현실적으로 기대하기 어렵습니다. Keeply는 버전 계층을 SSD 쓰기 이전의 응용 계층에 두어 TRIM 물리적 한계를 피합니다 — 이전 버전의 비트가 보관소에 그대로 남아 있습니다."),
        ("A. 기본 1시간 간격으로는 안 됩니다. 사고와 다음 스냅숏 사이의 덮어쓰기는 이미 덮인 파일이 잡힙니다. Time Machine을 로컬 스냅숏 고빈도 설정으로 바꾸거나 수동으로 찍는 습관이 있어야 가능합니다. 회사에서 지급한 Mac은 대부분 기본 설정입니다.",
         "A. 기본 1시간 간격으로는 안 됩니다. 사고와 다음 스냅숏 사이의 덮어쓰기는 이미 덮인 파일이 잡힙니다. Time Machine을 로컬 스냅숏 고빈도 설정으로 바꾸거나 수동으로 찍는 습관이 있어야 가능합니다. 회사에서 지급한 Mac은 대부분 기본 설정입니다. Keeply 자동 저장 간격은 최소 15분, Time Machine 기본 1시간보다 훨씬 세밀합니다 — 9:14에 사고, 9:00 스냅숏이 그대로 있어서 Keeply가 잡습니다."),
    ],
    "en": [
        ("## FAQ {#faq}\n\n**Q. Can I recover the previous version after overwriting an Excel file?**",
         "## FAQ {#faq}\n\n**Q. How does Keeply close the gap these 4 recovery layers leave?**\n\n"
         "A. By putting the version history layer in place before the incident, not after. Keeply auto-saves in the background (15 / 30 / 60 minute interval, your choice) + you can hit \"Save Version\" manually at important moments + each snapshot lives in its own vault without overwriting the others. When an incident happens, open Keeply, pick the previous version, hit \"Restore this version\" — 30 seconds. The four layers above (AutoRecover / OneDrive Version History / Time Machine / recovery software) are all post-event rescue; each fails in its own interval gap by design. Keeply is pre-event defense, not another post-event option.\n\n"
         "**Q. Can I recover the previous version after overwriting an Excel file?**"),
        ("A. No. AutoRecover is designed for Excel crashes. The moment a file closes normally, AutoRecover temp files are deleted. AutoRecover does not help after an overwrite-then-close.",
         "A. No. AutoRecover is designed for Excel crashes. The moment a file closes normally, AutoRecover temp files are deleted. AutoRecover does not help after an overwrite-then-close. To rescue the pre-overwrite version, you need an independent version vault in place before the incident; that's the layer Keeply fills."),
        ("A. Very unlikely on SSDs (per NIST SP 800-88r1). You need \"HDD + just overwritten + filesystem not yet overwritten\" simultaneously. Most work PCs are SSD, so in practice, don't count on it.",
         "A. Very unlikely on SSDs (per NIST SP 800-88r1). You need \"HDD + just overwritten + filesystem not yet overwritten\" simultaneously. Most work PCs are SSD, so in practice, don't count on it. Keeply keeps the version layer at the application level, above the SSD-write path — sidestepping the TRIM physical limit, so the previous version's bytes stay intact in the vault."),
        ("A. Not at the default 1-hour interval. The overwrite happens between the incident and the next snapshot, which captures the already-clobbered file. Unless you set Time Machine to local snapshots at high frequency, or you take manual snapshots, default Macs from IT won't help.",
         "A. Not at the default 1-hour interval. The overwrite happens between the incident and the next snapshot, which captures the already-clobbered file. Unless you set Time Machine to local snapshots at high frequency, or you take manual snapshots, default Macs from IT won't help. Keeply's auto-save interval goes as short as 15 minutes — much tighter than Time Machine's default 1-hour. The 9:14 incident has a 9:00 snapshot sitting right there in the Keeply vault."),
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
                    print(f"  [WARN miss] {locale}: {old[:50]!r}")
            path.write_text(text, encoding="utf-8")
            print(f"  [OK] {path.relative_to(ROOT)}: {applied}/{len(rules)} rules")


if __name__ == "__main__":
    main()
