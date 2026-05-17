"""Generate all SVG assets for dropbox-recover-deleted-30-days article (6 locales).

Outputs to each locale's content/.../post/dropbox-recover-deleted-30-days/ dir:
- file-history.svg (per FileHistoryPanel.tsx Keeply UI mock)
- retention-matrix.svg (body image: 4-plan retention bars)
- 4-paths-success.svg (body image: 4 recovery paths horizontal bars)
- cover.svg (hero: 30-day calendar with day 31 highlighted)
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# ─── per-locale text dicts ───────────────────────────────────────────────

# Filename + dir path stays universal across locales (file paths are not translated)
FILE_NAME = "proposal_v3.docx"
DIR_PATH = "/Client/Acme/2026/"

# file-history rows: 6 versions of proposal_v3.docx across 6 months
FILE_HISTORY = {
    "en": {
        "rows": [
            ("today 09:14", "Pricing revision applied", "you"),
            ("04/15 16:20", "Edits after first client review", "you"),
            ("03/31 17:00", "Q1 close — archived", "you"),
            ("03/15 09:30", "Note — pricing meeting prep", "you"),
            ("02/14 11:42", "Sent for first client review", "you"),
            ("02/14 09:14", "Initial pitch draft", "you"),
        ],
        "footer": "✓ 6 versions kept · permanent local layer (no 30-day clock)",
    },
    "zh-tw": {
        "rows": [
            ("今天 09:14", "套用客戶調整後的 pricing", "我"),
            ("04/15 16:20", "第一輪客戶回饋後修改", "我"),
            ("03/31 17:00", "Q1 結案 — 歸檔", "我"),
            ("03/15 09:30", "註記 — pricing 會議準備", "我"),
            ("02/14 11:42", "送出第一輪客戶 review", "我"),
            ("02/14 09:14", "最初提案草稿", "我"),
        ],
        "footer": "✓ 6 個版本已保留 · 本機永久層（無 30 天時鐘）",
    },
    "zh-cn": {
        "rows": [
            ("今天 09:14", "套用客户调整后的 pricing", "我"),
            ("04/15 16:20", "第一轮客户反馈后修改", "我"),
            ("03/31 17:00", "Q1 结案 — 归档", "我"),
            ("03/15 09:30", "备注 — pricing 会议准备", "我"),
            ("02/14 11:42", "送出第一轮客户 review", "我"),
            ("02/14 09:14", "最初提案草稿", "我"),
        ],
        "footer": "✓ 6 个版本已保留 · 本机永久层（无 30 天时钟）",
    },
    "ja": {
        "rows": [
            ("今日 09:14", "価格改定を反映", "自分"),
            ("04/15 16:20", "初回レビュー後の修正", "自分"),
            ("03/31 17:00", "Q1 締切 — アーカイブ", "自分"),
            ("03/15 09:30", "メモ — 価格会議の準備", "自分"),
            ("02/14 11:42", "初回レビューに送付", "自分"),
            ("02/14 09:14", "最初のドラフト", "自分"),
        ],
        "footer": "✓ 6 つのバージョンを保持 · ローカル永続層（30 日タイマーなし）",
    },
    "ko": {
        "rows": [
            ("오늘 09:14", "가격 수정 반영", "나"),
            ("04/15 16:20", "1차 검토 후 수정", "나"),
            ("03/31 17:00", "Q1 마감 — 아카이브", "나"),
            ("03/15 09:30", "메모 — 가격 회의 준비", "나"),
            ("02/14 11:42", "1차 검토 발송", "나"),
            ("02/14 09:14", "초기 초안", "나"),
        ],
        "footer": "✓ 6 개 버전 보관 · 로컬 영구 레이어 (30 일 타이머 없음)",
    },
    "it": {
        "rows": [
            ("oggi 09:14", "Revisione prezzi applicata", "io"),
            ("04/15 16:20", "Modifiche dopo prima revisione", "io"),
            ("03/31 17:00", "Q1 chiuso — archiviato", "io"),
            ("03/15 09:30", "Nota — prep riunione prezzi", "io"),
            ("02/14 11:42", "Inviato per prima revisione", "io"),
            ("02/14 09:14", "Bozza iniziale", "io"),
        ],
        "footer": "✓ 6 versioni conservate · livello locale permanente (nessun timer 30 giorni)",
    },
}

# 4-plan retention matrix bars
RETENTION_MATRIX = {
    "en": {
        "title": "Dropbox deletion retention by plan",
        "plans": [
            ("Basic / Plus / Family", "30 days", 30),
            ("Professional / Standard", "180 days", 180),
            ("Business Plus / Advanced", "365 days", 365),
            ("Enterprise", "365 days (configurable)", 365),
        ],
        "axis": "days",
        "annotation": "Your clock starts at deletion, not at upgrade.",
    },
    "zh-tw": {
        "title": "Dropbox 各方案刪除檔案保留期限",
        "plans": [
            ("Basic / Plus / Family", "30 天", 30),
            ("Professional / Standard", "180 天", 180),
            ("Business Plus / Advanced", "365 天", 365),
            ("Enterprise", "365 天（可調整）", 365),
        ],
        "axis": "天",
        "annotation": "時鐘從刪除那一刻啟動，升級無法回頭追加。",
    },
    "zh-cn": {
        "title": "Dropbox 各方案删除文件保留期限",
        "plans": [
            ("Basic / Plus / Family", "30 天", 30),
            ("Professional / Standard", "180 天", 180),
            ("Business Plus / Advanced", "365 天", 365),
            ("Enterprise", "365 天（可调整）", 365),
        ],
        "axis": "天",
        "annotation": "时钟从删除那一刻启动，升级无法回头追加。",
    },
    "ja": {
        "title": "Dropbox プラン別の削除ファイル保持期間",
        "plans": [
            ("Basic / Plus / Family", "30 日", 30),
            ("Professional / Standard", "180 日", 180),
            ("Business Plus / Advanced", "365 日", 365),
            ("Enterprise", "365 日（設定可）", 365),
        ],
        "axis": "日",
        "annotation": "タイマーは削除の瞬間から動き、アップグレードでは遡れません。",
    },
    "ko": {
        "title": "Dropbox 요금제별 삭제 파일 보관 기간",
        "plans": [
            ("Basic / Plus / Family", "30 일", 30),
            ("Professional / Standard", "180 일", 180),
            ("Business Plus / Advanced", "365 일", 365),
            ("Enterprise", "365 일 (조정 가능)", 365),
        ],
        "axis": "일",
        "annotation": "타이머는 삭제 순간부터 작동하며, 업그레이드로 되돌릴 수 없습니다.",
    },
    "it": {
        "title": "Dropbox: conservazione file eliminati per piano",
        "plans": [
            ("Basic / Plus / Family", "30 giorni", 30),
            ("Professional / Standard", "180 giorni", 180),
            ("Business Plus / Advanced", "365 giorni", 365),
            ("Enterprise", "365 giorni (configurabile)", 365),
        ],
        "axis": "giorni",
        "annotation": "Il timer parte alla cancellazione, l'upgrade non lo estende a ritroso.",
    },
}

# 4 recovery paths past day 30 (success rate qualitative bars)
FOUR_PATHS = {
    "en": {
        "title": "Past day 30: 4 recovery paths and realistic outcomes",
        "paths": [
            ("Time Machine / File History", "Best — if you set it up before", 0.85),
            ("Dropbox support escalation", "Sometimes works for Business/Enterprise", 0.35),
            ("Local sync cache scraping", "Depends on OS cache state", 0.20),
            ("Disk recovery software (SSD + TRIM)", "Near-impossible on modern SSDs", 0.05),
        ],
        "note": "Three of the four require setup before the incident. The fourth is luck.",
    },
    "zh-tw": {
        "title": "過了第 30 天：4 條救援路徑與真實成功率",
        "paths": [
            ("Time Machine / 檔案歷史記錄", "最佳 — 前提是你事先設好", 0.85),
            ("Dropbox 客服升級處理", "對 Business/Enterprise 偶爾管用", 0.35),
            ("本機 sync 快取殘檔", "看作業系統有沒有清", 0.20),
            ("磁碟救援軟體（SSD + TRIM）", "在現代 SSD 上幾乎不可能", 0.05),
        ],
        "note": "4 條路中 3 條要事先準備。第 4 條看運氣。",
    },
    "zh-cn": {
        "title": "过了第 30 天：4 条救援路径与真实成功率",
        "paths": [
            ("Time Machine / 文件历史记录", "最佳 — 前提是事先设好", 0.85),
            ("Dropbox 客服升级处理", "对 Business/Enterprise 偶尔管用", 0.35),
            ("本机 sync 缓存残档", "看操作系统有没有清", 0.20),
            ("磁盘救援软件（SSD + TRIM）", "在现代 SSD 上几乎不可能", 0.05),
        ],
        "note": "4 条路中 3 条要事先准备。第 4 条看运气。",
    },
    "ja": {
        "title": "30 日経過後：4 つの復元経路と現実的な成功率",
        "paths": [
            ("Time Machine / ファイル履歴", "最良 — 事前に設定済みの場合", 0.85),
            ("Dropbox サポートエスカレーション", "Business/Enterprise で稀に成功", 0.35),
            ("ローカル sync キャッシュの残骸", "OS のキャッシュ状態次第", 0.20),
            ("ディスク復元ソフト (SSD + TRIM)", "最新 SSD ではほぼ不可能", 0.05),
        ],
        "note": "4 つのうち 3 つは事前準備が必要。残り 1 つは運次第。",
    },
    "ko": {
        "title": "30 일 경과 후: 4 가지 복구 경로와 실제 성공률",
        "paths": [
            ("Time Machine / 파일 기록", "최선 — 사전 설정한 경우", 0.85),
            ("Dropbox 고객지원 에스컬레이션", "Business/Enterprise 에서 가끔 성공", 0.35),
            ("로컬 sync 캐시 잔여물", "OS 캐시 상태에 따라 다름", 0.20),
            ("디스크 복구 소프트웨어 (SSD + TRIM)", "최신 SSD 에서는 거의 불가능", 0.05),
        ],
        "note": "4 가지 중 3 가지는 사전 준비가 필요. 나머지 1 가지는 운에 달렸음.",
    },
    "it": {
        "title": "Oltre il 30° giorno: 4 percorsi di recupero e successi reali",
        "paths": [
            ("Time Machine / Cronologia file", "Migliore — se configurato prima", 0.85),
            ("Escalation supporto Dropbox", "A volte funziona su Business/Enterprise", 0.35),
            ("Cache sync locale residua", "Dipende dallo stato cache OS", 0.20),
            ("Software di recupero disco (SSD + TRIM)", "Quasi impossibile su SSD moderni", 0.05),
        ],
        "note": "3 dei 4 richiedono preparazione prima dell'incidente. Il quarto è fortuna.",
    },
}

# Cover hero text
COVER = {
    "en": {
        "tag": "2026 File Management",
        "headline": "Dropbox recovers deleted files",
        "subhead": "— until day 31.",
        "day31_label": "DAY 31",
        "footer": "Keeply · Local version history",
    },
    "zh-tw": {
        "tag": "2026 檔案管理",
        "headline": "Dropbox 救得回昨天的誤刪",
        "subhead": "—救不回 兩個月前那一版。",
        "day31_label": "第 31 天",
        "footer": "Keeply · 本機版本歷史",
    },
    "zh-cn": {
        "tag": "2026 文件管理",
        "headline": "Dropbox 救得回昨天的误删",
        "subhead": "—救不回 两个月前那一版。",
        "day31_label": "第 31 天",
        "footer": "Keeply · 本机版本历史",
    },
    "ja": {
        "tag": "2026 ファイル管理",
        "headline": "Dropbox は 30 日以内なら復元できる",
        "subhead": "— 60 日後の依頼には届かない。",
        "day31_label": "31 日目",
        "footer": "Keeply · ローカル版本履歴",
    },
    "ko": {
        "tag": "2026 파일 관리",
        "headline": "Dropbox 는 어제의 실수만 복구한다",
        "subhead": "— 30 일 뒤는 사라진다.",
        "day31_label": "31 일째",
        "footer": "Keeply · 로컬 버전 기록",
    },
    "it": {
        "tag": "2026 Gestione File",
        "headline": "Dropbox recupera i file cancellati",
        "subhead": "— fino al 31° giorno.",
        "day31_label": "GIORNO 31",
        "footer": "Keeply · Cronologia versioni locale",
    },
}


# ─── SVG generators ──────────────────────────────────────────────────────

def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


FONT_FAMILY = "'Inter','Noto Sans TC','PingFang TC','Noto Sans JP','Noto Sans KR',-apple-system,system-ui,sans-serif"


def file_history_svg(data) -> str:
    """File-history panel — single file 6 versions across 6 months."""
    rows = data["rows"]
    footer = data["footer"]
    h = 36 + len(rows) * 36 + 24
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 {h}" font-family="{FONT_FAMILY}">',
        f'<rect x="0" y="0" width="480" height="{h}" rx="8" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>',
        # header
        '<rect x="0" y="0" width="480" height="36" rx="8" fill="#F9FAFB"/>',
        '<rect x="0" y="28" width="480" height="9" fill="#F9FAFB"/>',
        '<line x1="0" y1="36" x2="480" y2="36" stroke="#E5E7EB" stroke-width="1"/>',
        '<text x="14" y="22" font-size="14">📄</text>',
        f'<text x="34" y="23" font-size="13" font-weight="700" fill="#374151">{esc(FILE_NAME)}</text>',
        f'<text x="200" y="23" font-size="11" fill="#9CA3AF">{esc(DIR_PATH)}</text>',
        '<text x="462" y="24" font-size="14" fill="#9CA3AF" text-anchor="end">✕</text>',
    ]
    for i, (time_str, msg, author) in enumerate(rows):
        y_top = 36 + i * 36
        if i == 0:
            parts.append(f'<rect x="0" y="{y_top}" width="480" height="36" fill="#EEF2FF" opacity="0.5"/>')
        else:
            parts.append(f'<line x1="0" y1="{y_top}" x2="480" y2="{y_top}" stroke="#F3F4F6" stroke-width="1"/>')
        y_text = y_top + 22
        fill_time = "#6B7280" if i == 0 else "#9CA3AF"
        parts.append(f'<text x="14" y="{y_text}" font-size="11" fill="{fill_time}">{esc(time_str)}</text>')
        parts.append(f'<text x="110" y="{y_text}" font-size="13" fill="#374151">{esc(msg)}</text>')
        parts.append(f'<text x="468" y="{y_text}" font-size="11" fill="#D1D5DB" text-anchor="end">{esc(author)}</text>')
    # footer
    y_foot = 36 + len(rows) * 36
    parts.append(f'<line x1="0" y1="{y_foot}" x2="480" y2="{y_foot}" stroke="#F3F4F6" stroke-width="1"/>')
    parts.append(f'<text x="14" y="{y_foot + 16}" font-size="10" fill="#10B981">{esc(footer)}</text>')
    parts.append("</svg>")
    return "\n".join(parts)


def retention_matrix_svg(data) -> str:
    """4-plan retention horizontal bars."""
    title = data["title"]
    plans = data["plans"]
    axis = data["axis"]
    annotation = data["annotation"]
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" font-family="{FONT_FAMILY}">',
        '<rect x="0" y="0" width="600" height="320" rx="8" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>',
        f'<text x="20" y="30" font-size="15" font-weight="700" fill="#111827">{esc(title)}</text>',
    ]
    # max value for scaling
    max_val = max(p[2] for p in plans)  # 365
    bar_max_w = 320
    bar_x = 200
    colors = ["#FECACA", "#FDE68A", "#A7F3D0", "#A5F3FC"]  # red, amber, emerald, cyan (severity)
    border = ["#F87171", "#FBBF24", "#34D399", "#22D3EE"]
    text_colors = ["#7F1D1D", "#78350F", "#065F46", "#0E7490"]
    for i, (plan, days_text, days_val) in enumerate(plans):
        y = 60 + i * 50
        bar_w = int(bar_max_w * days_val / max_val)
        parts.append(f'<text x="20" y="{y + 14}" font-size="12" font-weight="600" fill="#374151">{esc(plan)}</text>')
        parts.append(f'<rect x="{bar_x}" y="{y}" width="{bar_w}" height="22" rx="3" fill="{colors[i]}" stroke="{border[i]}" stroke-width="1"/>')
        parts.append(f'<text x="{bar_x + 8}" y="{y + 15}" font-size="11" font-weight="600" fill="{text_colors[i]}">{esc(days_text)}</text>')
    # axis hint
    parts.append(f'<text x="{bar_x}" y="270" font-size="10" fill="#9CA3AF">0 {axis}</text>')
    parts.append(f'<text x="{bar_x + bar_max_w}" y="270" font-size="10" fill="#9CA3AF" text-anchor="end">365 {axis}</text>')
    # annotation
    parts.append(f'<text x="20" y="300" font-size="11" font-style="italic" fill="#6B7280">⚠ {esc(annotation)}</text>')
    parts.append("</svg>")
    return "\n".join(parts)


def four_paths_svg(data) -> str:
    """4 recovery paths horizontal bar chart."""
    title = data["title"]
    paths = data["paths"]
    note = data["note"]
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 340" font-family="{FONT_FAMILY}">',
        '<rect x="0" y="0" width="640" height="340" rx="8" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>',
        f'<text x="20" y="30" font-size="15" font-weight="700" fill="#111827">{esc(title)}</text>',
    ]
    bar_max_w = 240
    bar_x = 340
    # color severity green → red as success rate decreases
    colors = ["#34D399", "#FBBF24", "#FB923C", "#F87171"]
    bg = ["#D1FAE5", "#FEF3C7", "#FFEDD5", "#FEE2E2"]
    for i, (path_name, desc, rate) in enumerate(paths):
        y = 60 + i * 56
        bar_w = max(8, int(bar_max_w * rate))
        parts.append(f'<text x="20" y="{y + 12}" font-size="12" font-weight="600" fill="#374151">{esc(path_name)}</text>')
        parts.append(f'<text x="20" y="{y + 28}" font-size="10" fill="#6B7280">{esc(desc)}</text>')
        # bg track
        parts.append(f'<rect x="{bar_x}" y="{y + 6}" width="{bar_max_w}" height="20" rx="3" fill="#F3F4F6"/>')
        # filled bar
        parts.append(f'<rect x="{bar_x}" y="{y + 6}" width="{bar_w}" height="20" rx="3" fill="{colors[i]}" opacity="0.85"/>')
        # rate label
        parts.append(f'<text x="{bar_x + bar_max_w + 8}" y="{y + 20}" font-size="11" font-weight="600" fill="{colors[i]}">~{int(rate * 100)}%</text>')
    parts.append(f'<text x="20" y="320" font-size="11" font-style="italic" fill="#6B7280">⚠ {esc(note)}</text>')
    parts.append("</svg>")
    return "\n".join(parts)


def cover_svg(data) -> str:
    """Hero cover: 30-day calendar with day 31 highlighted in red."""
    tag = data["tag"]
    headline = data["headline"]
    subhead = data["subhead"]
    day31 = data["day31_label"]
    footer = data["footer"]
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" font-family="{FONT_FAMILY}">',
        # background gradient
        '<defs>',
        '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">',
        '<stop offset="0" stop-color="#F0F9FF"/><stop offset="1" stop-color="#E0E7FF"/>',
        '</linearGradient>',
        '</defs>',
        '<rect x="0" y="0" width="1200" height="630" fill="url(#bg)"/>',
        # tag pill
        '<rect x="80" y="80" width="280" height="36" rx="18" fill="#1E40AF"/>',
        f'<text x="220" y="104" font-size="14" font-weight="600" fill="#FFFFFF" text-anchor="middle">{esc(tag)}</text>',
        # headline
        f'<text x="80" y="200" font-size="44" font-weight="800" fill="#111827">{esc(headline)}</text>',
        f'<text x="80" y="260" font-size="44" font-weight="800" fill="#DC2626">{esc(subhead)}</text>',
    ]
    # Calendar grid on RIGHT side, day 31 callout + Keeply band on LEFT
    cal_x = 560
    cal_y = 300
    cell_w = 50
    cell_h = 40
    cols = 7
    for d in range(1, 32):
        col = (d - 1) % cols
        row = (d - 1) // cols
        x = cal_x + col * (cell_w + 5)
        y = cal_y + row * (cell_h + 5)
        if d <= 30:
            fill = "#3B82F6"
            text_fill = "#FFFFFF"
        else:
            fill = "#DC2626"
            text_fill = "#FFFFFF"
        parts.append(f'<rect x="{x}" y="{y}" width="{cell_w}" height="{cell_h}" rx="5" fill="{fill}"/>')
        parts.append(f'<text x="{x + cell_w // 2}" y="{y + cell_h // 2 + 5}" font-size="16" font-weight="700" fill="{text_fill}" text-anchor="middle">{d}</text>')
    # Day 31 callout arrow pointing at the red cell (col 2 row 4 in 5-row layout)
    day31_x = cal_x + 2 * (cell_w + 5)
    day31_y = cal_y + 4 * (cell_h + 5)
    arrow_text_y = day31_y + cell_h + 30
    parts.append(f'<text x="{day31_x + cell_w // 2}" y="{arrow_text_y}" font-size="16" font-weight="700" fill="#DC2626" text-anchor="middle">↑ {esc(day31)}</text>')
    # Keeply layer band — LEFT column under headline, wider
    layer_y = 340
    parts.append(f'<rect x="80" y="{layer_y}" width="440" height="50" rx="25" fill="#10B981" opacity="0.15"/>')
    parts.append(f'<rect x="80" y="{layer_y}" width="440" height="50" rx="25" fill="none" stroke="#10B981" stroke-width="2" stroke-dasharray="6 4"/>')
    parts.append(f'<text x="300" y="{layer_y + 32}" font-size="16" font-weight="600" fill="#065F46" text-anchor="middle">{esc(footer)}</text>')
    # subtle annotation under Keeply band
    parts.append(f'<text x="300" y="{layer_y + 86}" font-size="14" fill="#6B7280" text-anchor="middle" font-style="italic">— no 30-day clock, no day 31 cliff</text>')
    parts.append("</svg>")
    return "\n".join(parts)


# ─── main ────────────────────────────────────────────────────────────────

LOCALES = ["en", "zh-tw", "zh-cn", "ja", "ko", "it"]


def locale_to_dir(locale: str) -> str:
    return "english" if locale == "en" else locale


def main():
    slug = "dropbox-recover-deleted-30-days"
    for loc in LOCALES:
        out_dir = ROOT / f"content/{locale_to_dir(loc)}/post/{slug}"
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "file-history.svg").write_text(file_history_svg(FILE_HISTORY[loc]), encoding="utf-8")
        (out_dir / "retention-matrix.svg").write_text(retention_matrix_svg(RETENTION_MATRIX[loc]), encoding="utf-8")
        (out_dir / "4-paths-success.svg").write_text(four_paths_svg(FOUR_PATHS[loc]), encoding="utf-8")
        (out_dir / "cover.svg").write_text(cover_svg(COVER[loc]), encoding="utf-8")
        print(f"  [OK] {loc}: 4 SVG written to {out_dir}")


if __name__ == "__main__":
    main()
