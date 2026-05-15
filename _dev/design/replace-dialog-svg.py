"""Replace ASCII dialog code blocks with SVG image references in 10 articles."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

TARGETS = [
    ("zh-tw", "windows-file-history-vs-backup", "Keeply 儲存版本對話框：變更檔案清單 + 筆記欄位 + 取消/儲存版本按鈕"),
    ("zh-cn", "windows-file-history-vs-backup", "Keeply 保存版本对话框：变更文件清单 + 笔记字段 + 取消/保存版本按钮"),
    ("zh-tw", "windows-file-history-wrong-version", "Keeply 儲存版本對話框：變更檔案清單 + 筆記欄位 + 取消/儲存版本按鈕"),
    ("zh-cn", "windows-file-history-wrong-version", "Keeply 保存版本对话框：变更文件清单 + 笔记字段 + 取消/保存版本按钮"),
    ("zh-tw", "what-keeply-saves-vs-backup-cloud", "Keeply 儲存版本對話框：變更檔案清單 + 筆記欄位 + 取消/儲存版本按鈕"),
    ("zh-cn", "what-keeply-saves-vs-backup-cloud", "Keeply 保存版本对话框：变更文件清单 + 笔记字段 + 取消/保存版本按钮"),
    ("zh-tw", "3-2-1-backup-rule", "Keeply 儲存版本對話框：簽約版筆記 + 取消/儲存版本按鈕"),
    ("zh-cn", "3-2-1-backup-rule", "Keeply 保存版本对话框：签约版笔记 + 取消/保存版本按钮"),
    ("zh-tw", "hidden-cost-shared-folders", "Keeply 儲存版本對話框：3 個檔案變更（Floorplan.dwg / Brand_Brief.psd / Sections_E.dwg）+ 筆記「中庭平面 業主簽約版 v2.3」"),
    ("zh-cn", "hidden-cost-shared-folders", "Keeply 保存版本对话框：3 个文件变更 + 笔记「中庭平面 业主签约版 v2.3」"),
]

# Match code fence containing 儲存版本 or 保存版本 with ASCII box
PATTERN = re.compile(
    r"```\n┌─+┐\n(?:.+\n)*?└─+┘\n```",
    re.MULTILINE,
)


def is_save_dialog(block: str) -> bool:
    return "儲存版本" in block or "保存版本" in block


def main():
    for locale, slug, alt_text in TARGETS:
        path = ROOT / f"content/{locale}/post/{slug}/index.md"
        if not path.exists():
            print(f"  [SKIP] missing: {path}")
            continue

        text = path.read_text(encoding="utf-8")
        replaced = 0

        def repl(m):
            nonlocal replaced
            block = m.group(0)
            if is_save_dialog(block) and replaced == 0:
                replaced += 1
                return f"![{alt_text}](save-dialog.svg)"
            return block

        new_text = PATTERN.sub(repl, text)
        if replaced == 0:
            print(f"  [WARN] no dialog found: {path}")
            continue
        path.write_text(new_text, encoding="utf-8")
        print(f"  [OK] {path}")


if __name__ == "__main__":
    main()
