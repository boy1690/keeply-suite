"""Replace ASCII timeline code blocks with SVG image references."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

TARGETS = [
    ("zh-tw", "windows-file-history-vs-backup", "Keeply 時間軸 meeting-notes.docx：自動儲存 + 親手存的版本（會議後加結論 / 早上的草稿 / 業主第一次回饋後）"),
    ("zh-cn", "windows-file-history-vs-backup", "Keeply 时间轴 meeting-notes.docx：自动保存 + 亲手存的版本（会议后加结论 / 早上的草稿 / 业主第一次反馈后）"),
    ("zh-tw", "windows-file-history-wrong-version", "Keeply 時間軸 meeting-notes.docx：跨 2 天的版本史 + 親手存的筆記"),
    ("zh-cn", "windows-file-history-wrong-version", "Keeply 时间轴 meeting-notes.docx：跨 2 天的版本史 + 亲手存的笔记"),
    ("zh-tw", "what-keeply-saves-vs-backup-cloud", "Keeply 時間軸 proposal.docx：4 個版本含 2 個親手存的筆記"),
    ("zh-cn", "what-keeply-saves-vs-backup-cloud", "Keeply 时间轴 proposal.docx：4 个版本含 2 个亲手存的笔记"),
    ("zh-tw", "3-2-1-backup-rule", "Keeply 時間軸 proposal.psd：3 個月前的簽約版發行版 + 上禮拜的工作版"),
    ("zh-cn", "3-2-1-backup-rule", "Keeply 时间轴 proposal.psd：3 个月前的签约版发行版 + 上礼拜的工作版"),
    ("zh-tw", "hidden-cost-shared-folders", "Keeply 時間軸 Floorplan.dwg：昨天親手存的「中庭平面 — 業主簽約版 v2.3」+ 今天下包覆蓋後的自動儲存"),
    ("zh-cn", "hidden-cost-shared-folders", "Keeply 时间轴 Floorplan.dwg：昨天亲手存的「中庭平面 — 业主签约版 v2.3」+ 今天下包覆盖后的自动保存"),
]

# Match code fence with Keeply 時間軸 or Keeply 时间轴
PATTERN = re.compile(
    r"```\nKeeply (時間軸|时间轴) — [^\n]+\n[\s\S]*?\n```",
)


def main():
    for locale, slug, alt_text in TARGETS:
        path = ROOT / f"content/{locale}/post/{slug}/index.md"
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        replaced = 0

        def repl(m):
            nonlocal replaced
            replaced += 1
            return f"![{alt_text}](timeline.svg)"

        new_text = PATTERN.sub(repl, text)
        if replaced == 0:
            print(f"  [WARN] no timeline found: {path}")
            continue
        path.write_text(new_text, encoding="utf-8")
        print(f"  [OK {replaced} replaced] {path}")


if __name__ == "__main__":
    main()
