"""Generate cover.svg + timeline.svg + save-dialog.svg for excel-overwrite-postmortem
across 4 launch locales (ja master + en + zh-TW + ko).

Run from repo root:
    python _dev/design/excel-overwrite-postmortem-assets.py

Writes to content/{locale}/post/excel-overwrite-postmortem/.
For en locale, target dir is content/english/post/excel-overwrite-postmortem/ (Hugo quirk).
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-overwrite-postmortem"


LOCALE_DIRNAME = {
    "ja": "ja",
    "en": "english",  # Hugo quirk
    "zh-tw": "zh-tw",
    "ko": "ko",
}


FONT_FAMILY = {
    "ja": "'Noto Sans JP','Hiragino Sans','Yu Gothic',system-ui,sans-serif",
    "en": "'Inter','Helvetica Neue','Arial',system-ui,sans-serif",
    "zh-tw": "'Noto Sans TC','PingFang TC','Microsoft JhengHei',system-ui,sans-serif",
    "ko": "'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif",
}


# ============================================================
# COVER
# ============================================================

COVER_STRINGS = {
    "ja": {
        "eyebrow": "Excel 上書き 復元 · 事故報告書",
        "subtitle1": "9:14 火曜、Excel が消えた。",
        "subtitle2": "4 つの救援層、いつ閉じた。",
        "card_label_lost": "失われた",
        "card_label_caught": "救えた",
        "card_4_layers": "4 層検証",
        "card_30_days": "T+30日まで追跡",
        "bottom": "AutoSave · 以前のバージョン · Time Machine · 復元ソフト · Keeply",
    },
    "en": {
        "eyebrow": "Excel overwrite recovery · Forensic report",
        "subtitle1": "9:14 Tuesday, the Excel vanished.",
        "subtitle2": "4 recovery layers — when each closed.",
        "card_label_lost": "Lost",
        "card_label_caught": "Caught",
        "card_4_layers": "4 layers",
        "card_30_days": "T+30 day trace",
        "bottom": "AutoSave · Previous Versions · Time Machine · Recovery Software · Keeply",
    },
    "zh-tw": {
        "eyebrow": "Excel 覆蓋還原 · 事故報告書",
        "subtitle1": "星期二 9:14，Excel 不見了。",
        "subtitle2": "4 層救援，分別在哪一刻關上窗口。",
        "card_label_lost": "失守",
        "card_label_caught": "搶回",
        "card_4_layers": "4 層檢驗",
        "card_30_days": "追到 T+30 天",
        "bottom": "自動儲存 · 以前的版本 · Time Machine · 還原軟體 · Keeply",
    },
    "ko": {
        "eyebrow": "Excel 덮어쓴 파일 복구 · 사고 보고서",
        "subtitle1": "화요일 9:14, Excel이 사라졌다.",
        "subtitle2": "4개 계층, 언제 닫혔나.",
        "card_label_lost": "놓침",
        "card_label_caught": "건짐",
        "card_4_layers": "4개 계층 검증",
        "card_30_days": "T+30일까지 추적",
        "bottom": "자동 저장 · 이전 버전 · Time Machine · 복구 소프트웨어 · Keeply",
    },
}


def cover_svg(locale: str) -> str:
    s = COVER_STRINGS[locale]
    font = FONT_FAMILY[locale]
    return f'''<!-- =============================================================
     Cover: {SLUG} ({locale} master)
     Recipe: time-stakes-hero — hero "9:14" for the moment of overwrite incident
     ============================================================= -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" fill="none"
     font-family="{font}">
  <defs>
    <linearGradient id="grad-indigo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4F46E5"/><stop offset="1" stop-color="#312E81"/>
    </linearGradient>
    <linearGradient id="grad-amber" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFB300"/><stop offset="1" stop-color="#F59E0B"/>
    </linearGradient>
    <linearGradient id="grad-paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F8F7FF"/><stop offset="1" stop-color="#E4E3FF"/>
    </linearGradient>
    <linearGradient id="grad-red" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#DC2626"/><stop offset="1" stop-color="#991B1B"/>
    </linearGradient>
    <symbol id="keeply-lockup" viewBox="0 0 200 50">
      <circle cx="22" cy="25" r="16" fill="url(#grad-indigo)"/>
      <path d="M16 18 L16 32 M16 25 L26 18 M16 25 L26 32" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <text x="48" y="33" font-size="22" font-weight="800" fill="#312E81">Keeply</text>
    </symbol>
    <filter id="hero-shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="14" stdDeviation="20" flood-color="#312E81" flood-opacity="0.15"/>
    </filter>
    <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#312E81" flood-opacity="0.15"/>
    </filter>
  </defs>

  <rect width="1600" height="900" fill="url(#grad-paper)"/>

  <g transform="translate(120, 100)">
    <text x="0" y="0" font-size="15" font-weight="700" fill="#4338CA" letter-spacing="3">{s["eyebrow"]}</text>
  </g>

  <g transform="translate(120, 410)" filter="url(#hero-shadow)">
    <text x="0" y="0" font-size="280" font-weight="900" fill="url(#grad-indigo)" letter-spacing="-12">9:14</text>
  </g>

  <g transform="translate(120, 520)">
    <text x="0" y="0" font-size="30" font-weight="800" fill="#312E81" letter-spacing="0.5">{s["subtitle1"]}</text>
    <text x="0" y="46" font-size="30" font-weight="800" fill="#312E81" letter-spacing="0.5">{s["subtitle2"]}</text>
  </g>

  <g transform="translate(960, 230)">
    <g transform="translate(0, 0)" filter="url(#soft-shadow)">
      <rect width="500" height="100" fill="#FFE4E6" rx="8"/>
      <rect x="0" y="0" width="6" height="100" fill="url(#grad-red)" rx="2"/>
      <text x="28" y="42" font-size="18" font-weight="700" fill="#7F1D1D">AutoSave / Previous Versions</text>
      <text x="28" y="68" font-size="18" font-weight="700" fill="#7F1D1D">Time Machine / Recovery SW</text>
      <text x="470" y="82" font-size="13" font-weight="700" fill="#DC2626" letter-spacing="1.5" text-anchor="end">{s["card_label_lost"]}</text>
    </g>
    <g transform="translate(0, 120)" filter="url(#soft-shadow)">
      <rect width="500" height="100" fill="#ECFDF5" rx="8"/>
      <rect x="0" y="0" width="6" height="100" fill="#10B981" rx="2"/>
      <text x="28" y="55" font-size="22" font-weight="800" fill="#065F46">Keeply</text>
      <text x="120" y="55" font-size="14" font-weight="500" fill="#065F46">+ 30 min snapshot</text>
      <text x="28" y="82" font-size="14" font-weight="500" fill="#065F46">+ manual save version</text>
      <text x="470" y="82" font-size="13" font-weight="700" fill="#059669" letter-spacing="1.5" text-anchor="end">{s["card_label_caught"]}</text>
    </g>
    <g transform="translate(0, 250)">
      <text x="0" y="0" font-size="15" font-weight="600" fill="#4338CA" opacity="0.75" letter-spacing="0.5">{s["card_4_layers"]} · {s["card_30_days"]}</text>
    </g>
  </g>

  <use href="#keeply-lockup" x="1350" y="800" width="200" height="50"/>

  <g transform="translate(120, 820)">
    <text x="0" y="0" font-size="13" font-weight="500" fill="#4338CA" opacity="0.65" letter-spacing="0.3">{s["bottom"]}</text>
  </g>
</svg>
'''


# ============================================================
# TIMELINE (Keeply timeline panel)
# ============================================================

TIMELINE_STRINGS = {
    "ja": {
        "filename": "月次決算_2026年5月.xlsx",
        "rows": [
            ("morning baseline · 手動保存", "Release", "昨日 18:00"),
            ("自動取り込み (30分)", None, "昨日 17:30"),
            ("自動取り込み (30分)", None, "昨日 17:00"),
            ("月初 baseline · 手動保存", "Release", "5/1 09:00"),
            ("自動取り込み (30分)", None, "4/30 18:30"),
        ],
    },
    "en": {
        "filename": "month_end_close_2026_05.xlsx",
        "rows": [
            ("morning baseline · manual save", "Release", "Yesterday 6:00 PM"),
            ("auto snapshot (30 min)", None, "Yesterday 5:30 PM"),
            ("auto snapshot (30 min)", None, "Yesterday 5:00 PM"),
            ("month-start baseline · manual save", "Release", "May 1, 9:00 AM"),
            ("auto snapshot (30 min)", None, "Apr 30, 6:30 PM"),
        ],
    },
    "zh-tw": {
        "filename": "月底結算_2026年5月.xlsx",
        "rows": [
            ("morning baseline · 手動儲存", "Release", "昨天 18:00"),
            ("自動取樣 (30 分鐘)", None, "昨天 17:30"),
            ("自動取樣 (30 分鐘)", None, "昨天 17:00"),
            ("月初 baseline · 手動儲存", "Release", "5/1 09:00"),
            ("自動取樣 (30 分鐘)", None, "4/30 18:30"),
        ],
    },
    "ko": {
        "filename": "월말결산_2026년5월.xlsx",
        "rows": [
            ("morning baseline · 수동 저장", "Release", "어제 18:00"),
            ("자동 스냅숏 (30분)", None, "어제 17:30"),
            ("자동 스냅숏 (30분)", None, "어제 17:00"),
            ("월초 baseline · 수동 저장", "Release", "5/1 09:00"),
            ("자동 스냅숏 (30분)", None, "4/30 18:30"),
        ],
    },
}


def timeline_svg(locale: str) -> str:
    data = TIMELINE_STRINGS[locale]
    font = FONT_FAMILY[locale]
    header = data["filename"]
    rows_svg = []
    for i, (label, badge, time) in enumerate(data["rows"]):
        y = 64 + i * 32
        circle = f'<circle cx="20" cy="{y - 5}" r="4" fill="#3B82F6"/>'
        text = f'<text x="32" y="{y}" font-size="13" fill="#374151">{label}</text>'
        time_text = f'<text x="464" y="{y - 1}" font-size="11" fill="#9CA3AF" text-anchor="end">{time}</text>'
        badge_svg = ""
        if badge:
            badge_svg = (
                f'<rect x="306" y="{y - 14}" width="86" height="18" rx="9" fill="#DBEAFE" stroke="#BFDBFE" stroke-width="1"/>'
                f'<text x="349" y="{y - 1}" font-size="11" font-weight="500" fill="#1D4ED8" text-anchor="middle">{badge}</text>'
            )
        rows_svg.append(circle + text + badge_svg + time_text)
    body = "\n".join(rows_svg)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 240" font-family="{font}">
<rect x="0" y="0" width="480" height="240" rx="8" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>
<text x="20" y="28" font-size="13" font-weight="700" fill="#1F2937" font-family="'JetBrains Mono',ui-monospace,monospace">{header}</text>
<rect x="0" y="40" width="480" height="1" fill="#E5E7EB"/>
{body}
</svg>
'''


# ============================================================
# SAVE-DIALOG (Keeply "Save Version" dialog)
# ============================================================

DIALOG_STRINGS = {
    "ja": {
        "title_label": "全選択",
        "count": "1/1",
        "refresh": "⟳ 更新",
        "filename": "month_end_close.xlsx",
        "modified": "変更済",
        "note": "月末締め 売上集計の morning baseline",
        "placeholder": "例：「営業 Q1 集計まで完了」",
        "button": "1 ファイルを保存",
    },
    "en": {
        "title_label": "Select all",
        "count": "1/1",
        "refresh": "⟳ Refresh",
        "filename": "month_end_close.xlsx",
        "modified": "Modified",
        "note": "Month-end close sales rollup morning baseline",
        "placeholder": 'e.g., "Q1 sales rollup complete"',
        "button": "Save 1 file",
    },
    "zh-tw": {
        "title_label": "全部勾選",
        "count": "1/1",
        "refresh": "⟳ 重新整理",
        "filename": "month_end_close.xlsx",
        "modified": "已修改",
        "note": "月底結算 業績匯總 morning baseline",
        "placeholder": "例如：「Q1 業績匯總已完成」",
        "button": "儲存 1 個檔案",
    },
    "ko": {
        "title_label": "전체 선택",
        "count": "1/1",
        "refresh": "⟳ 새로고침",
        "filename": "month_end_close.xlsx",
        "modified": "변경됨",
        "note": "월말 결산 매출 집계 morning baseline",
        "placeholder": "예: 「Q1 매출 집계 완료」",
        "button": "1 개 파일 저장",
    },
}


def save_dialog_svg(locale: str) -> str:
    s = DIALOG_STRINGS[locale]
    font = FONT_FAMILY[locale]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 224" font-family="{font}">
<rect x="0" y="0" width="360" height="224" rx="8" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>
<text x="12" y="18" font-size="12" fill="#6B7280">{s["title_label"]}</text>
<text x="82" y="18" font-size="12" fill="#9CA3AF">{s["count"]}</text>
<text x="348" y="18" font-size="12" fill="#9CA3AF" text-anchor="end">{s["refresh"]}</text>
<rect x="0" y="28" width="360" height="1" fill="#E5E7EB"/>
<rect x="12" y="37" width="14" height="14" rx="3" fill="#2563EB" stroke="#2563EB" stroke-width="1"/>
<path d="M 15 44 L 18 47 L 23 41" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<text x="34" y="48" font-size="13" fill="#374151" font-family="'JetBrains Mono',ui-monospace,monospace">{s["filename"]}</text>
<rect x="304" y="35" width="44" height="18" rx="3" fill="#DBEAFE"/>
<text x="326" y="48" font-size="11" font-weight="600" fill="#1D4ED8" text-anchor="middle">{s["modified"]}</text>
<rect x="0" y="64" width="360" height="1" fill="#E5E7EB"/>
<rect x="12" y="76" width="336" height="60" rx="6" fill="white" stroke="#D1D5DB" stroke-width="1"/>
<text x="22" y="98" font-size="13" fill="#374151">{s["note"]}</text>
<text x="16" y="150" font-size="11" fill="#9CA3AF">{s["placeholder"]}</text>
<rect x="12" y="164" width="336" height="38" rx="6" fill="#2563EB"/>
<text x="180" y="189" font-size="13" font-weight="600" fill="#FFFFFF" text-anchor="middle">{s["button"]}</text>
</svg>
'''


def main():
    for locale in ["ja", "en", "zh-tw", "ko"]:
        out_dir = ROOT / "content" / LOCALE_DIRNAME[locale] / "post" / SLUG
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "cover.svg").write_text(cover_svg(locale), encoding="utf-8")
        (out_dir / "timeline.svg").write_text(timeline_svg(locale), encoding="utf-8")
        (out_dir / "save-dialog.svg").write_text(save_dialog_svg(locale), encoding="utf-8")
        print(f"  [OK] {out_dir.relative_to(ROOT)} — cover + timeline + save-dialog")


if __name__ == "__main__":
    main()
