"""Generate Keeply 時間軸 (TimelineView) as SVG.

Verified against actual UI: src/components/history/VersionRow.tsx + TimelineView.tsx.
- Blue dot + version message + optional tag pills + relative time
- No date headers, no per-row filenames
- Auto-save and manual-save look identical visually (only message differs)
- Tag pills: blue rounded pills (52 spec: 業主簽約版 / 客戶確認 / 等)
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# Tailwind palette
BG = "#FFFFFF"
PANEL_BORDER = "#E5E7EB"
TEXT = "#374151"                # gray-700
TEXT_MUTED = "#9CA3AF"          # gray-400
DOT_BLUE = "#3B82F6"            # blue-500
TAG_BG = "#DBEAFE"              # blue-100
TAG_BORDER = "#BFDBFE"          # blue-200
TAG_TEXT = "#1D4ED8"            # blue-700
ROW_HOVER_BG = "#F9FAFB"        # gray-50

W = 480
PAD = 16
ROW_H = 32


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def gen_timeline(*, entries: list) -> str:
    """Build timeline SVG.

    entries = [(message, [tag_str, ...], rel_time), ...]
    Newest first (top).
    """
    height = PAD + len(entries) * ROW_H + PAD

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {height}" font-family="\'Noto Sans TC\',\'PingFang TC\',\'Microsoft JhengHei\',-apple-system,system-ui,sans-serif">',
        f'<rect x="0" y="0" width="{W}" height="{height}" rx="8" fill="{BG}" stroke="{PANEL_BORDER}" stroke-width="1"/>',
    ]

    for i, (message, tags, rel_time) in enumerate(entries):
        y = PAD + i * ROW_H
        cy = y + ROW_H // 2

        # Blue dot
        parts.append(f'<circle cx="{PAD + 4}" cy="{cy}" r="4" fill="{DOT_BLUE}"/>')

        # Message (left-aligned)
        msg_x = PAD + 16
        parts.append(f'<text x="{msg_x}" y="{cy + 5}" font-size="13" fill="{TEXT}">{esc(message)}</text>')

        # Tag pills (right side, before relative time)
        time_w = 60
        tag_x = W - PAD - time_w - 8
        for tag in reversed(tags):
            tag_w = max(54, len(tag) * 14 + 16)
            tag_x -= tag_w + 4
            parts.append(f'<rect x="{tag_x}" y="{cy - 9}" width="{tag_w}" height="18" rx="9" fill="{TAG_BG}" stroke="{TAG_BORDER}" stroke-width="1"/>')
            parts.append(f'<text x="{tag_x + tag_w // 2}" y="{cy + 4}" font-size="11" font-weight="500" fill="{TAG_TEXT}" text-anchor="middle">{esc(tag)}</text>')

        # Relative time (rightmost)
        parts.append(f'<text x="{W - PAD}" y="{cy + 4}" font-size="11" fill="{TEXT_MUTED}" text-anchor="end">{esc(rel_time)}</text>')

    parts.append("</svg>")
    return "\n".join(parts)


# Timeline cases (matches actual UI: just message + tags + rel time, no filenames/dates)
TIMELINES = {
    ("zh-tw", "windows-file-history-vs-backup"): [
        ("自動儲存 — meeting-notes.docx", [], "30 分鐘前"),
        ("會議後加結論", ["業主確認"], "2 小時前"),
        ("自動儲存 — meeting-notes.docx", [], "3 小時前"),
        ("早上的草稿", [], "8 小時前"),
        ("自動儲存", [], "昨天"),
        ("業主第一次回饋後", ["客戶版"], "昨天"),
    ],
    ("zh-tw", "windows-file-history-wrong-version"): [
        ("自動儲存 — meeting-notes.docx", [], "30 分鐘前"),
        ("會議後加結論", ["業主確認"], "2 小時前"),
        ("自動儲存 — meeting-notes.docx", [], "3 小時前"),
        ("早上的草稿", [], "8 小時前"),
        ("自動儲存", [], "昨天"),
        ("業主第一次回饋後", ["客戶版"], "昨天"),
    ],
    ("zh-tw", "what-keeply-saves-vs-backup-cloud"): [
        ("會議後加結論", ["業主確認"], "2 小時前"),
        ("自動儲存 — proposal.docx", [], "3 小時前"),
        ("業主第一次回饋後", ["客戶版"], "5 小時前"),
        ("自動儲存", [], "昨天"),
    ],
    ("zh-tw", "3-2-1-backup-rule"): [
        ("自動儲存", [], "上禮拜"),
        ("給客戶 v2.3 — 簽約版", ["發行版"], "3 個月前"),
        ("修完客戶第二輪回饋", ["客戶確認"], "3 個月前"),
        ("自動儲存 — proposal.psd", [], "3 個月前"),
    ],
    ("zh-tw", "hidden-cost-shared-folders"): [
        ("自動儲存 — Floorplan.dwg", [], "1 小時前"),
        ("自動儲存", [], "2 小時前"),
        ("中庭平面 — 業主簽約版 v2.3", ["業主簽約版"], "昨天"),
        ("自動儲存", [], "昨天"),
        ("自動儲存", [], "昨天"),
    ],
    ("zh-tw", "thesis-single-point-of-failure"): [
        ("自動儲存 — thesis.docx", [], "30 分鐘前"),
        ("3.2 節重寫 — 教授第三輪回饋後", ["教授確認"], "2 小時前"),
        ("自動儲存", [], "上午"),
        ("第二輪完稿 — 送教授前", ["送教授"], "昨天"),
        ("自動儲存", [], "昨天"),
        ("第一輪完稿 — 含緒論+第二章", ["第一輪"], "2 週前"),
    ],
    ("zh-tw", "autocad-wrong-version-crew"): [
        ("修改蓋板規格 — 設計第 5 版", ["最新版"], "今天 15:30"),
        ("避開老舊雨水管", [], "04/20"),
        ("甲方審閱後正式版", ["定版"], "04/18"),
        ("斷面調整", [], "04/15"),
        ("第一次交付", ["初版"], "03/15"),
    ],
    ("zh-tw", "dropbox-conflicted-copy"): [
        ("加完結尾 CTA — 等 Anna 合進來", ["你的"], "10:35"),
        ("加 3 段背景 — by Anna", ["Anna 的"], "10:30"),
        ("自動儲存", [], "10:00"),
        ("業主第一輪回饋後", ["定稿"], "昨天"),
        ("初稿完成", ["v1"], "上週五"),
    ],
    ("zh-tw", "excel-version-history-limits"): [
        ("Q2 結算 — 改完應收帳款公式", ["Q2 結算"], "今天 17:30"),
        ("自動儲存", [], "今天 17:00"),
        ("Q1 結算定版", ["定版", "凍結"], "3 個月前"),
        ("自動儲存", [], "Q1 期間"),
        ("月底結算 — 1 月", ["月底"], "4 個月前"),
    ],
    ("zh-tw", "client-asked-which-version"): [
        ("提案修改 — 加新章節", [], "今天"),
        ("自動儲存", [], "上週"),
        ("4/12 業主核定版 — 給客戶 v3 簡報", ["業主核定版", "PDF 收執"], "3 個月前"),
        ("自動儲存", [], "3 個月前"),
        ("第一版提案 — 給業主初審", ["初版"], "3.5 個月前"),
    ],
    ("zh-tw", "recover-overwritten-file"): [
        ("自動儲存 — 覆蓋後", [], "週五 19:30"),
        ("月底結算 — 應收應付對帳完成", ["月底結算"], "週五 19:00"),
        ("自動儲存", [], "週五 18:30"),
        ("應收科目細項補完", [], "週五 17:00"),
        ("Q2 結算 — 初版", ["Q2 結算"], "上禮拜"),
    ],
    ("zh-tw", "photoshop-autosave-not-version-history"): [
        ("自動儲存 — 主色改 v3 後", [], "30 分鐘前"),
        ("客戶確認版 — v2 主色完稿", ["客戶確認"], "1 小時前"),
        ("自動儲存", [], "2 小時前"),
        ("圖層調整 — 主視覺", [], "今天上午"),
        ("初稿提案版 — 給客戶選色", ["初稿"], "昨天"),
    ],
    ("zh-tw", "departing-employee-data-risk"): [
        ("Tina 刪除 brand-book/（管理員權限）", ["⚠ 已刪"], "週六 23:03"),
        ("自動儲存", [], "週六 22:50"),
        ("4 月 brand-book 交付 — 完整集", ["業主交付", "凍結"], "4 月 12 日"),
        ("自動儲存", [], "4 月 10 日"),
        ("brand-book 初版", ["初版"], "3 月 5 日"),
    ],
    ("zh-tw", "too-many-file-versions"): [
        ("自動儲存 — 收尾修飾", [], "今天 14:30"),
        ("客戶簽約版 — 5/4 業主確認", ["客戶簽", "定版"], "5/4 11:00"),
        ("自動儲存", [], "5/3 晚上"),
        ("老闆第三輪修改", ["老闆改"], "5/2"),
        ("客戶第一輪回饋後", ["客戶回饋"], "4/28"),
        ("初稿提案", ["初稿"], "4/20"),
    ],
    ("zh-tw", "version-control-software-non-developer"): [
        ("自動儲存 — 加結語頁", [], "1 小時前"),
        ("客戶簡報定版 — 不打一行 git 指令", ["定版"], "今天上午"),
        ("自動儲存", [], "昨天"),
        ("圖表第二輪修改", [], "昨天"),
        ("初稿 — 從零開始", ["初稿"], "上禮拜"),
    ],
    ("ja", "version-control-software-non-developer"): [
        ("自動保存 — 結びページ追加", [], "1 時間前"),
        ("クライアント承認版 — コマンド入力ゼロ", ["最終版"], "今日午前"),
        ("自動保存", [], "昨日"),
        ("図表の二度目の修正", [], "昨日"),
        ("初稿 — ゼロから", ["初稿"], "先週"),
    ],
    ("en", "version-control-software-non-developer"): [
        ("Auto-save — added closing page", [], "1 hour ago"),
        ("Client-approved version — no CLI required", ["Final"], "today AM"),
        ("Auto-save", [], "yesterday"),
        ("Diagram second revision", [], "yesterday"),
        ("First draft — from scratch", ["Draft"], "last week"),
    ],
    ("en", "3-2-1-backup-rule"): [
        ("Auto-save — last week's working revision", [], "last week"),
        ("Auto-save", [], "1 month ago"),
        ("Client-approved v2.3 — signed contract version", ["Release"], "3 months ago"),
        ("Auto-save — pre-client review", [], "3 months ago"),
        ("First draft to client", ["Draft v1"], "4 months ago"),
    ],
    ("en", "too-many-file-versions"): [
        ("Auto-save — last revision", [], "1 hour ago"),
        ("Client-approved v2.3 — signed contract version", ["Release"], "Tue PM"),
        ("Auto-save — pre-client-call", [], "Tue AM"),
        ("Boss third round edits", ["Boss"], "Mon"),
        ("Client first feedback round", ["Client"], "last Thu"),
        ("First draft", ["Draft"], "2 weeks ago"),
    ],
    ("zh-tw", "onedrive-version-history"): [
        ("自動儲存 — 加入執行摘要", [], "30 分鐘前"),
        ("Client signed v2.3 — board approved", ["Release"], "今天下午"),
        ("自動儲存", [], "昨天"),
        ("CFO 第三輪修改", [], "週一"),
        ("給董事會的初稿", ["Draft"], "2 週前"),
        ("董事會前準備", [], "1 個月前"),
    ],
    ("en", "onedrive-version-history"): [
        ("Auto-save — exec summary added", [], "30 min ago"),
        ("Client signed v2.3 — board approved", ["Release"], "today PM"),
        ("Auto-save", [], "yesterday"),
        ("CFO third-round edits", [], "Mon"),
        ("First draft to board", ["Draft"], "2 weeks ago"),
        ("Pre-board prep", [], "1 month ago"),
    ],
    ("ja", "onedrive-version-history"): [
        ("自動保存 — エグゼクティブサマリー追加", [], "30 分前"),
        ("Client signed v2.3 — board approved", ["Release"], "今日午後"),
        ("自動保存", [], "昨日"),
        ("CFO 第 3 ラウンド修正", [], "月曜"),
        ("取締役会初稿", ["Draft"], "2 週間前"),
        ("取締役会準備", [], "1 ヶ月前"),
    ],
    ("ko", "onedrive-version-history"): [
        ("자동 저장 — 요약 추가", [], "30분 전"),
        ("Client signed v2.3 — board approved", ["Release"], "오늘 오후"),
        ("자동 저장", [], "어제"),
        ("CFO 3차 수정", [], "월요일"),
        ("이사회 초안", ["Draft"], "2주 전"),
        ("이사회 준비", [], "1개월 전"),
    ],
    ("it", "onedrive-version-history"): [
        ("Salvataggio auto — sommario aggiunto", [], "30 min fa"),
        ("Client signed v2.3 — board approved", ["Release"], "oggi pom."),
        ("Salvataggio auto", [], "ieri"),
        ("CFO terza revisione", [], "lunedì"),
        ("Bozza per il CdA", ["Draft"], "2 settimane fa"),
        ("Preparazione CdA", [], "1 mese fa"),
    ],
}


def cn_convert(entries):
    out = []
    for msg, tags, rel in entries:
        msg = (msg.replace("自動儲存", "自动保存")
                  .replace("會議後加結論", "会议后加结论")
                  .replace("早上的草稿", "早上的草稿")
                  .replace("業主第一次回饋後", "业主第一次反馈后")
                  .replace("給客戶 v2.3 — 簽約版", "给客户 v2.3 — 签约版")
                  .replace("修完客戶第二輪回饋", "修完客户第二轮反馈")
                  .replace("中庭平面 — 業主簽約版 v2.3", "中庭平面 — 业主签约版 v2.3"))
        tags = [t.replace("業主確認", "业主确认")
                 .replace("客戶版", "客户版")
                 .replace("發行版", "发行版")
                 .replace("客戶確認", "客户确认")
                 .replace("業主簽約版", "业主签约版")
                for t in tags]
        rel = (rel.replace("分鐘前", "分钟前")
                  .replace("小時前", "小时前")
                  .replace("個月前", "个月前")
                  .replace("上禮拜", "上礼拜"))
        out.append((msg, tags, rel))
    return out


def locale_to_dir(locale: str) -> str:
    return "english" if locale == "en" else locale


def main():
    for (locale, slug), entries in TIMELINES.items():
        # direct write for this locale
        svg = gen_timeline(entries=entries)
        out = ROOT / f"content/{locale_to_dir(locale)}/post/{slug}/timeline.svg"
        out.write_text(svg, encoding="utf-8")
        print(f"  [OK] {out}")
        # zh-CN mirror only when source is zh-TW
        if locale == "zh-tw":
            svg_cn = gen_timeline(entries=cn_convert(entries))
            out_cn = ROOT / f"content/zh-cn/post/{slug}/timeline.svg"
            out_cn.write_text(svg_cn, encoding="utf-8")
            print(f"  [OK] {out_cn}")


if __name__ == "__main__":
    main()
