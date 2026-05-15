"""Generate Keeply 「變更狀態」側邊面板 (ChangesView) as SVG.

Verified against actual UI: src/components/history/ChangesView.tsx + FileChangeItem.tsx.
- Side panel layout (NOT modal dialog)
- Light mode default
- Single full-width blue save button (no cancel)
- File rows: checkbox + path + status badge (已修改/新增/已刪除)
- Textarea + placeholder + example hint below
- Save button shows count + Cmd+S/Ctrl+S kbd hint
"""
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("kmu", Path(__file__).parent / "keeply-mock-ui.py")
kmu = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kmu)

ROOT = Path(__file__).resolve().parents[2]

# Tailwind-aligned palette (light mode)
BG = "#FFFFFF"
PANEL_BORDER = "#E5E7EB"        # gray-200
TEXT = "#374151"                # gray-700
TEXT_MUTED = "#9CA3AF"          # gray-400
TEXT_DIMMER = "#D1D5DB"         # gray-300
HEADER_TEXT = "#6B7280"         # gray-500
SAVE_BTN = "#2563EB"            # blue-600
SAVE_BTN_TEXT = "#FFFFFF"
TEXTAREA_BORDER = "#D1D5DB"     # gray-300
KBD_BG = "rgba(255,255,255,0.2)"

# Status badge colors
BADGE_MODIFIED_BG = "#DBEAFE"   # blue-100
BADGE_MODIFIED_TX = "#1D4ED8"   # blue-700
BADGE_NEW_BG = "#D1FAE5"        # green-100
BADGE_NEW_TX = "#047857"        # green-700
BADGE_DELETED_BG = "#FEE2E2"    # red-100
BADGE_DELETED_TX = "#B91C1C"    # red-700

W = 360
PAD = 12


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def badge_colors(status: str):
    s = status.upper()
    if s == "M":
        return BADGE_MODIFIED_BG, BADGE_MODIFIED_TX, "已修改"
    if s == "A":
        return BADGE_NEW_BG, BADGE_NEW_TX, "新增"
    if s == "D":
        return BADGE_DELETED_BG, BADGE_DELETED_TX, "已刪除"
    return BADGE_MODIFIED_BG, BADGE_MODIFIED_TX, status


def badge_colors_cn(status: str):
    bg, tx, label = badge_colors(status)
    if label == "已修改":
        label = "已修改"
    elif label == "新增":
        label = "新增"
    elif label == "已刪除":
        label = "已删除"
    return bg, tx, label


def gen_svg(
    *,
    files: list,
    note: str,
    placeholder_example: str,
    save_btn_text: str,
    kbd_hint: str = "⌘ S",
    is_cn: bool = False,
) -> str:
    """Build the side-panel SVG matching actual ChangesView UI."""
    y = 0

    # Header row: select-all toggle + count + refresh
    header_h = 28
    y += header_h

    # File list rows
    row_h = 32
    list_y = y
    list_h = len(files) * row_h
    y += list_h + 8  # +8 padding before bottom section

    # Bottom section: textarea + example + save button
    textarea_h = 60
    example_h = 18
    save_btn_h = 38
    bottom_h = 12 + textarea_h + 4 + example_h + 12 + save_btn_h + 12  # padding
    y += bottom_h

    height = y

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {height}" font-family="\'Noto Sans TC\',\'PingFang TC\',\'Microsoft JhengHei\',-apple-system,system-ui,sans-serif">',
        # Panel background
        f'<rect x="0" y="0" width="{W}" height="{height}" rx="8" fill="{BG}" stroke="{PANEL_BORDER}" stroke-width="1"/>',
    ]

    # Header row content
    total = len(files)
    select_all_text = "全部勾選" if not is_cn else "全部勾选"
    refresh_text = "重新整理" if not is_cn else "刷新"
    parts.append(f'<text x="{PAD}" y="18" font-size="12" fill="{HEADER_TEXT}">{esc(select_all_text)}</text>')
    parts.append(f'<text x="{PAD + 70}" y="18" font-size="12" fill="{TEXT_MUTED}">{total}/{total}</text>')
    # refresh icon (simplified circle arrow) + text
    parts.append(f'<text x="{W - PAD}" y="18" font-size="12" fill="{TEXT_MUTED}" text-anchor="end">⟳ {esc(refresh_text)}</text>')
    # divider under header
    parts.append(f'<rect x="0" y="{header_h}" width="{W}" height="1" fill="{PANEL_BORDER}"/>')

    # File rows
    for i, (status, name, _label_ignored) in enumerate(files):
        ry = list_y + i * row_h
        cy = ry + row_h // 2

        # Checkbox (checked)
        cb_x = PAD
        cb_size = 14
        parts.append(f'<rect x="{cb_x}" y="{cy - cb_size // 2}" width="{cb_size}" height="{cb_size}" rx="3" fill="{SAVE_BTN}" stroke="{SAVE_BTN}" stroke-width="1"/>')
        # checkmark
        parts.append(f'<path d="M {cb_x + 3} {cy} L {cb_x + 6} {cy + 3} L {cb_x + 11} {cy - 3}" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')

        # File path
        fx = cb_x + cb_size + 8
        parts.append(f'<text x="{fx}" y="{cy + 4}" font-size="13" fill="{TEXT}" font-family="\'JetBrains Mono\',ui-monospace,monospace">{esc(name)}</text>')

        # Status badge (right-aligned)
        bg_c, tx_c, label = badge_colors_cn(status) if is_cn else badge_colors(status)
        # Badge width based on label
        badge_w = 44
        badge_h = 18
        bx = W - PAD - badge_w
        by = cy - badge_h // 2
        parts.append(f'<rect x="{bx}" y="{by}" width="{badge_w}" height="{badge_h}" rx="3" fill="{bg_c}"/>')
        parts.append(f'<text x="{bx + badge_w // 2}" y="{by + 13}" font-size="11" font-weight="600" fill="{tx_c}" text-anchor="middle">{esc(label)}</text>')

    # Divider above bottom section
    bottom_y = list_y + list_h + 4
    parts.append(f'<rect x="0" y="{bottom_y}" width="{W}" height="1" fill="{PANEL_BORDER}"/>')

    # Textarea
    ta_y = bottom_y + 12
    parts.append(f'<rect x="{PAD}" y="{ta_y}" width="{W - 2 * PAD}" height="{textarea_h}" rx="6" fill="white" stroke="{TEXTAREA_BORDER}" stroke-width="1"/>')
    # Note text
    parts.append(f'<text x="{PAD + 10}" y="{ta_y + 22}" font-size="13" fill="{TEXT}">{esc(note)}</text>')

    # Example hint
    ex_y = ta_y + textarea_h + 14
    parts.append(f'<text x="{PAD + 4}" y="{ex_y}" font-size="11" fill="{TEXT_MUTED}">{esc(placeholder_example)}</text>')

    # Save button (full-width blue)
    sb_y = ex_y + 14
    sb_x = PAD
    sb_w = W - 2 * PAD
    parts.append(f'<rect x="{sb_x}" y="{sb_y}" width="{sb_w}" height="{save_btn_h}" rx="6" fill="{SAVE_BTN}"/>')
    # Button text
    btn_label = save_btn_text
    btn_text_x = sb_x + sb_w // 2 - 20
    parts.append(f'<text x="{btn_text_x}" y="{sb_y + 25}" font-size="13" font-weight="600" fill="{SAVE_BTN_TEXT}" text-anchor="middle">{esc(btn_label)}</text>')
    # kbd hint (right side of button)
    kbd_x = sb_x + sb_w - 50
    kbd_w = 36
    kbd_h = 18
    kbd_y = sb_y + (save_btn_h - kbd_h) // 2
    parts.append(f'<rect x="{kbd_x}" y="{kbd_y}" width="{kbd_w}" height="{kbd_h}" rx="3" fill="rgba(255,255,255,0.2)"/>')
    parts.append(f'<text x="{kbd_x + kbd_w // 2}" y="{kbd_y + 13}" font-size="11" font-weight="600" fill="white" font-family="ui-monospace,monospace" text-anchor="middle">{esc(kbd_hint)}</text>')

    parts.append("</svg>")
    return "\n".join(parts)


TARGETS = [
    ("zh-tw", "windows-file-history-vs-backup", "windows-file-history-vs-backup_tw"),
    ("zh-cn", "windows-file-history-vs-backup", "windows-file-history-vs-backup_cn"),
    ("zh-tw", "windows-file-history-wrong-version", "windows-file-history-wrong-version_tw"),
    ("zh-cn", "windows-file-history-wrong-version", "windows-file-history-wrong-version_cn"),
    ("zh-tw", "what-keeply-saves-vs-backup-cloud", "what-keeply-saves-vs-backup-cloud_tw"),
    ("zh-cn", "what-keeply-saves-vs-backup-cloud", "what-keeply-saves-vs-backup-cloud_cn"),
    ("zh-tw", "3-2-1-backup-rule", "3-2-1-backup-rule_tw"),
    ("zh-cn", "3-2-1-backup-rule", "3-2-1-backup-rule_cn"),
    ("zh-tw", "hidden-cost-shared-folders", "hidden-cost-shared-folders_tw"),
    ("zh-cn", "hidden-cost-shared-folders", "hidden-cost-shared-folders_cn"),
    ("zh-tw", "thesis-single-point-of-failure", "thesis-single-point-of-failure_tw"),
    ("zh-cn", "thesis-single-point-of-failure", "thesis-single-point-of-failure_cn"),
    ("zh-tw", "autocad-wrong-version-crew", "autocad-wrong-version-crew_tw"),
    ("zh-cn", "autocad-wrong-version-crew", "autocad-wrong-version-crew_cn"),
    ("zh-tw", "dropbox-conflicted-copy", "dropbox-conflicted-copy_tw"),
    ("zh-cn", "dropbox-conflicted-copy", "dropbox-conflicted-copy_cn"),
    ("zh-tw", "excel-version-history-limits", "excel-version-history-limits_tw"),
    ("zh-cn", "excel-version-history-limits", "excel-version-history-limits_cn"),
    ("zh-tw", "client-asked-which-version", "client-asked-which-version_tw"),
    ("zh-cn", "client-asked-which-version", "client-asked-which-version_cn"),
    ("zh-tw", "recover-overwritten-file", "recover-overwritten-file_tw"),
    ("zh-cn", "recover-overwritten-file", "recover-overwritten-file_cn"),
    ("zh-tw", "photoshop-autosave-not-version-history", "photoshop-autosave-not-version-history_tw"),
    ("zh-cn", "photoshop-autosave-not-version-history", "photoshop-autosave-not-version-history_cn"),
    ("zh-tw", "departing-employee-data-risk", "departing-employee-data-risk_tw"),
    ("zh-cn", "departing-employee-data-risk", "departing-employee-data-risk_cn"),
    ("zh-tw", "too-many-file-versions", "too-many-file-versions_tw"),
    ("zh-cn", "too-many-file-versions", "too-many-file-versions_cn"),
    ("zh-tw", "version-control-software-non-developer", "version-control-software-non-developer_tw"),
    ("zh-cn", "version-control-software-non-developer", "version-control-software-non-developer_cn"),
]


def main():
    for locale, slug, case_key in TARGETS:
        case = kmu.CASES[case_key]
        is_cn = locale == "zh-cn"
        n_files = len(case["files"])
        save_btn = f"儲存全部 {n_files} 個檔案" if not is_cn else f"保存全部 {n_files} 个文件"
        placeholder_ex = "例如：「業主要求加大柱斷面」" if not is_cn else "例如：「业主要求加大柱断面」"
        kbd = "⌘ S"  # Mac default; could vary per OS

        svg = gen_svg(
            files=case["files"],
            note=case["note"],
            placeholder_example=placeholder_ex,
            save_btn_text=save_btn,
            kbd_hint=kbd,
            is_cn=is_cn,
        )
        out_path = ROOT / f"content/{locale}/post/{slug}/save-dialog.svg"
        out_path.write_text(svg, encoding="utf-8")
        print(f"  [OK] {out_path}")


if __name__ == "__main__":
    main()
