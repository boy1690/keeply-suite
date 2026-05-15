"""Generate aligned Keeply Mock UI box for ASCII rendering in markdown code blocks.

Handles CJK (2 cells) + ASCII (1 cell) + full-width punctuation (2 cells) correctly.
Box-drawing chars (│ ─ ┌ ┐ └ ┘ ├ ┤) = 1 cell each.
"""
from unicodedata import east_asian_width

# Box-drawing chars are East Asian Width "A" (Ambiguous) but rendered as 1 cell
# in browser monospace. Whitelist them as narrow.
NARROW_AMBIGUOUS = set("┌┐└┘├┤┬┴┼─│")


def width(s: str) -> int:
    """Return display cells for string in CJK-aware browser monospace.

    Rules:
    - Wide (W) / Full-width (F): 2 cells
    - Ambiguous (A) in CJK context: 2 cells (em-dash ★ ← ⚠ etc.)
    - Box-drawing Ambiguous chars: 1 cell (whitelisted)
    - Narrow / Neutral / Halfwidth: 1 cell
    """
    w = 0
    for c in s:
        if c in NARROW_AMBIGUOUS:
            w += 1
        elif east_asian_width(c) in ("W", "F", "A"):
            w += 2
        else:
            w += 1
    return w


def pad_right(s: str, target: int) -> str:
    """Pad string with trailing spaces to fill `target` cells."""
    return s + " " * (target - width(s))


def line(content: str, total: int) -> str:
    """Wrap content with │ and pad to `total` inner cells."""
    padded = pad_right(content, total)
    return f"│{padded}│"


def hline(left: str, right: str, total: int) -> str:
    """Horizontal divider: left + N dashes + right."""
    return left + "─" * total + right


def dialog(
    *,
    title: str = "儲存版本",
    file_count_text: str,  # e.g. "這次改了 3 個檔案"
    files: list[tuple[str, str, str]],  # [(status, name, label)]
    note: str,
    placeholder: str = "例如：「業主要求加大柱斷面」",
    cancel_text: str = "取消",
    save_text: str = "儲存版本",
    inner_width: int = 54,
    note_box_width: int = 46,
    note_box_left_offset: int = 2,
) -> str:
    """Generate the full dialog as a multi-line string."""
    W = inner_width
    NW = note_box_width
    NL = note_box_left_offset
    note_box_right_offset = W - NL - NW - 2  # for left │, right │

    lines = []
    # top
    lines.append(hline("┌", "┐", W))
    # title row: 2sp + title + trailing... + ✕ + 2sp
    title_content = "  " + title
    cells_before_x = width(title_content)
    cells_after_x = 2  # 2 trailing spaces
    mid_x = W - cells_before_x - 1 - cells_after_x  # 1 for ✕
    lines.append(f"│{title_content}{' ' * mid_x}✕{' ' * cells_after_x}│")
    # divider
    lines.append(hline("├", "┤", W))
    # empty
    lines.append(line("", W))
    # file count
    lines.append(line(f"  {file_count_text}", W))
    # mid divider (33 dashes inside content)
    lines.append(line("  " + "─" * 33, W))
    # file rows — align label column to col 35 (1-indexed inside content)
    label_col_start = 34  # 0-indexed cell position
    for status, name, label in files:
        prefix = f"   {status}  {name}"
        prefix_w = width(prefix)
        mid_sp = max(1, label_col_start - prefix_w)
        content = prefix + " " * mid_sp + label
        lines.append(line(content, W))
    # empty
    lines.append(line("", W))
    # 筆記 label
    lines.append(line("  筆記（可選但建議寫）", W))
    # note box top
    note_inner_top = " " * NL + "┌" + "─" * NW + "┐" + " " * note_box_right_offset
    lines.append(f"│{note_inner_top}│")
    # note content row
    note_inner = " " + note  # 1 leading space inside box
    note_inner_padded = pad_right(note_inner, NW)
    note_row = " " * NL + "│" + note_inner_padded + "│" + " " * note_box_right_offset
    lines.append(f"│{note_row}│")
    # note empty row
    note_empty = " " * NL + "│" + " " * NW + "│" + " " * note_box_right_offset
    lines.append(f"│{note_empty}│")
    # note box bottom
    note_inner_bot = " " * NL + "└" + "─" * NW + "┘" + " " * note_box_right_offset
    lines.append(f"│{note_inner_bot}│")
    # placeholder
    lines.append(line("  " + placeholder, W))
    # empty
    lines.append(line("", W))
    # button row
    btn_left = f"[ {cancel_text} ]"
    btn_right = f"[  {save_text}  ]"
    gap = "   "  # 3 spaces between buttons
    btn_content_w = width(btn_left) + width(gap) + width(btn_right)
    btn_lead = (W - btn_content_w) // 2
    btn_trail = W - btn_lead - btn_content_w
    lines.append(f"│{' ' * btn_lead}{btn_left}{gap}{btn_right}{' ' * btn_trail}│")
    # bottom
    lines.append(hline("└", "┘", W))
    return "\n".join(lines)


def dialog_cn(**kwargs) -> str:
    """Same as dialog() but with zh-CN labels."""
    kwargs.setdefault("title", "保存版本")
    kwargs.setdefault("save_text", "保存版本")
    kwargs.setdefault("cancel_text", "取消")
    # 筆記 → 笔记 must be done in caller via overriding line builder — but we can post-process
    out = dialog(**kwargs)
    return (
        out.replace("筆記（可選但建議寫）", "笔记（可选但建议写）")
        .replace("例如：「業主要求加大柱斷面」", "例如：「业主要求加大柱断面」")
    )


def timeline(
    *,
    filename: str,
    days: list[tuple[str, list[tuple[str, str, str | None]]]],
    # days = [(date_label, [(time, filename, note_or_None), ...]), ...]
) -> str:
    """Generate a Keeply timeline mock UI."""
    lines = [f"Keeply 時間軸 — {filename}", ""]
    for i, (date_label, entries) in enumerate(days):
        if i > 0:
            lines.append("")
        lines.append(date_label)
        lines.append("─" * 33)
        for time, name, note in entries:
            if note:
                lines.append(f"● {time}   {name}   ★「{note}」 ← 你親手存的")
            else:
                lines.append(f"● {time}   {name}   （自動儲存）")
    return "\n".join(lines)


# === Generate dialogs for each article ===

CASES = {
    "windows-file-history-vs-backup_tw": {
        "file_count_text": "這次改了 2 個檔案",
        "files": [
            ("M", "meeting-notes.docx", "已修改"),
            ("M", "action-items.xlsx", "已修改"),
        ],
        "note": "會議後加結論",
    },
    "windows-file-history-vs-backup_cn": {
        "file_count_text": "这次改了 2 个文件",
        "files": [
            ("M", "meeting-notes.docx", "已修改"),
            ("M", "action-items.xlsx", "已修改"),
        ],
        "note": "会议后加结论",
    },
    "windows-file-history-wrong-version_tw": {
        "file_count_text": "這次改了 1 個檔案",
        "files": [("M", "meeting-notes.docx", "已修改")],
        "note": "會議後加結論",
    },
    "windows-file-history-wrong-version_cn": {
        "file_count_text": "这次改了 1 个文件",
        "files": [("M", "meeting-notes.docx", "已修改")],
        "note": "会议后加结论",
    },
    "what-keeply-saves-vs-backup-cloud_tw": {
        "file_count_text": "這次改了 1 個檔案",
        "files": [("M", "proposal.docx", "已修改")],
        "note": "會議後加結論",
    },
    "what-keeply-saves-vs-backup-cloud_cn": {
        "file_count_text": "这次改了 1 个文件",
        "files": [("M", "proposal.docx", "已修改")],
        "note": "会议后加结论",
    },
    "3-2-1-backup-rule_tw": {
        "file_count_text": "這次改了 1 個檔案",
        "files": [("M", "proposal.psd", "已修改")],
        "note": "給客戶 v2.3 — 簽約版",
    },
    "3-2-1-backup-rule_cn": {
        "file_count_text": "这次改了 1 个文件",
        "files": [("M", "proposal.psd", "已修改")],
        "note": "给客户 v2.3 — 签约版",
    },
    "hidden-cost-shared-folders_tw": {
        "file_count_text": "這次改了 3 個檔案",
        "files": [
            ("M", "Floorplan.dwg", "已修改"),
            ("M", "Brand_Brief.psd", "已修改"),
            ("A", "Sections_E.dwg", "新增"),
        ],
        "note": "中庭平面 — 業主簽約版 v2.3",
    },
    "hidden-cost-shared-folders_cn": {
        "file_count_text": "这次改了 3 个文件",
        "files": [
            ("M", "Floorplan.dwg", "已修改"),
            ("M", "Brand_Brief.psd", "已修改"),
            ("A", "Sections_E.dwg", "新增"),
        ],
        "note": "中庭平面 — 业主签约版 v2.3",
    },
    "thesis-single-point-of-failure_tw": {
        "file_count_text": "這次改了 2 個檔案",
        "files": [
            ("M", "thesis.docx", "已修改"),
            ("M", "references.bib", "已修改"),
        ],
        "note": "3.2 節重寫 — 教授第三輪回饋後",
    },
    "thesis-single-point-of-failure_cn": {
        "file_count_text": "这次改了 2 个文件",
        "files": [
            ("M", "thesis.docx", "已修改"),
            ("M", "references.bib", "已修改"),
        ],
        "note": "3.2 节重写 — 教授第三轮反馈后",
    },
    "autocad-wrong-version-crew_tw": {
        "file_count_text": "這次改了 2 個檔案",
        "files": [
            ("M", "A-05_水溝.dwg", "已修改"),
            ("M", "A-05_水溝.pdf", "已修改"),
        ],
        "note": "蓋板規格改 — 設計第 4 版",
    },
    "autocad-wrong-version-crew_cn": {
        "file_count_text": "这次改了 2 个文件",
        "files": [
            ("M", "A-05_水沟.dwg", "已修改"),
            ("M", "A-05_水沟.pdf", "已修改"),
        ],
        "note": "盖板规格改 — 设计第 4 版",
    },
    "dropbox-conflicted-copy_tw": {
        "file_count_text": "這次改了 1 個檔案",
        "files": [
            ("M", "proposal.docx", "已修改"),
        ],
        "note": "加完結尾 CTA — 等 Anna 那邊合進來",
    },
    "dropbox-conflicted-copy_cn": {
        "file_count_text": "这次改了 1 个文件",
        "files": [
            ("M", "proposal.docx", "已修改"),
        ],
        "note": "加完结尾 CTA — 等 Anna 那边合进来",
    },
    "excel-version-history-limits_tw": {
        "file_count_text": "這次改了 1 個檔案",
        "files": [
            ("M", "monthly_close.xlsx", "已修改"),
        ],
        "note": "Q2 結算 — 改完應收帳款公式",
    },
    "excel-version-history-limits_cn": {
        "file_count_text": "这次改了 1 个文件",
        "files": [
            ("M", "monthly_close.xlsx", "已修改"),
        ],
        "note": "Q2 结算 — 改完应收账款公式",
    },
    "client-asked-which-version_tw": {
        "file_count_text": "這次改了 2 個檔案",
        "files": [
            ("M", "proposal.docx", "已修改"),
            ("A", "proposal_v3.pdf", "新增"),
        ],
        "note": "4/12 業主核定版 — 給客戶 v3 簡報",
    },
    "client-asked-which-version_cn": {
        "file_count_text": "这次改了 2 个文件",
        "files": [
            ("M", "proposal.docx", "已修改"),
            ("A", "proposal_v3.pdf", "新增"),
        ],
        "note": "4/12 业主核定版 — 给客户 v3 简报",
    },
}


if __name__ == "__main__":
    for key, kwargs in CASES.items():
        is_cn = key.endswith("_cn")
        gen = dialog_cn if is_cn else dialog
        print(f"=== {key} ===")
        print(gen(**kwargs))
        print()
