"""Fix Keeply auto-save terminology + interval flexibility across 4 locales.

Per Keeply canonical i18n (D:/tools/doing/Keeply/src/locales/*.json):
- zh-TW: 自動儲存
- ja: 自動保存
- ko: 자동 저장
- en: Auto-save

INTERVAL_OPTIONS per source (D:/tools/doing/Keeply/src/components/ui/AutoSaveIndicator.tsx):
[15, 30, 60] minutes (default 30).

Updates:
1. timeline.svg per locale: change "自動取樣 (30 分鐘)" to "自動儲存 (15 分鐘)" +
   tighter narrative rows (evening close baseline + intra-evening auto-saves)
2. Body text per locale: "Keeply ... 30 分鐘" mentions reframed as
   "Keeply 背景自動儲存（15 / 30 / 60 分鐘可選，預設 30）"
3. timeline.svg image alt text: 「30 分鐘自動取樣紀錄」 -> 「15 分鐘自動儲存紀錄」
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-overwrite-postmortem"
LOCALE_DIRNAME = {"ja": "ja", "en": "english", "zh-tw": "zh-tw", "ko": "ko"}
SPEC_LOCALE_SUFFIX = {"ja": "ja", "en": "en", "zh-tw": "zh-TW", "ko": "ko"}
FONT_FAMILY = {
    "ja": "'Noto Sans JP','Hiragino Sans','Yu Gothic',system-ui,sans-serif",
    "en": "'Inter','Helvetica Neue','Arial',system-ui,sans-serif",
    "zh-tw": "'Noto Sans TC','PingFang TC','Microsoft JhengHei',system-ui,sans-serif",
    "ko": "'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif",
}

# ----- New timeline rows (tighter narrative: evening close + 15-min auto-saves) -----
TIMELINE_STRINGS = {
    "ja": {
        "filename": "月次決算_2026年5月.xlsx",
        "rows": [
            ("evening close · 手動保存", "Release", "昨日 18:00"),
            ("自動保存 (15 分)", None, "昨日 17:45"),
            ("自動保存 (15 分)", None, "昨日 17:30"),
            ("月初 baseline · 手動保存", "Release", "5/1 09:00"),
            ("自動保存 (15 分)", None, "4/30 18:30"),
        ],
    },
    "en": {
        "filename": "month_end_close_2026_05.xlsx",
        "rows": [
            ("evening close · Save Version", "Release", "Yesterday 6:00 PM"),
            ("Auto-save (15 min)", None, "Yesterday 5:45 PM"),
            ("Auto-save (15 min)", None, "Yesterday 5:30 PM"),
            ("month-start baseline · Save Version", "Release", "May 1, 9:00 AM"),
            ("Auto-save (15 min)", None, "Apr 30, 6:30 PM"),
        ],
    },
    "zh-tw": {
        "filename": "月底結算_2026年5月.xlsx",
        "rows": [
            ("evening close · 手動儲存", "Release", "昨天 18:00"),
            ("自動儲存 (15 分鐘)", None, "昨天 17:45"),
            ("自動儲存 (15 分鐘)", None, "昨天 17:30"),
            ("月初 baseline · 手動儲存", "Release", "5/1 09:00"),
            ("自動儲存 (15 分鐘)", None, "4/30 18:30"),
        ],
    },
    "ko": {
        "filename": "월말결산_2026년5월.xlsx",
        "rows": [
            ("evening close · 수동 저장", "Release", "어제 18:00"),
            ("자동 저장 (15분)", None, "어제 17:45"),
            ("자동 저장 (15분)", None, "어제 17:30"),
            ("월초 baseline · 수동 저장", "Release", "5/1 09:00"),
            ("자동 저장 (15분)", None, "4/30 18:30"),
        ],
    },
}


def timeline_svg(locale: str) -> str:
    data = TIMELINE_STRINGS[locale]
    font = FONT_FAMILY[locale]
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
<text x="20" y="28" font-size="13" font-weight="700" fill="#1F2937" font-family="'JetBrains Mono',ui-monospace,monospace">{data["filename"]}</text>
<rect x="0" y="40" width="480" height="1" fill="#E5E7EB"/>
{body}
</svg>
'''


# ----- Body text replacements per locale -----
BODY_REPLACE = {
    "zh-tw": [
        ("如果陳小姐電腦裡裝了 Keeply，9:14 事故那一刻，Keeply 的保管庫裡已經有一份叫「2026/05/17 18:00 morning baseline」的快照。",
         "如果陳小姐電腦裡裝了 Keeply，9:14 事故那一刻，Keeply 的保管庫裡已經有一份叫「2026/05/17 18:00 evening close」的快照。"),
        ("1. 每 30 分鐘背景自動拍一張快照",
         "1. 背景自動儲存（間隔可選 15 / 30 / 60 分鐘，預設 30 分鐘；陳小姐這台設 15 分鐘）"),
        ("![Keeply 時間軸 月底結算_2026年5月.xlsx：昨天 18:00 morning baseline + 30 分鐘自動取樣紀錄](timeline.svg)",
         "![Keeply 時間軸 月底結算_2026年5月.xlsx：昨天 18:00 evening close + 15 分鐘自動儲存紀錄](timeline.svg)"),
        ("介面上你不會看到任何 git 術語。記得兩件事就夠了：30 分鐘背景拍一張、重要時刻你自己也可以按「儲存版本」。",
         "介面上你不會看到任何 git 術語。記得兩件事就夠了：背景每隔 15-60 分鐘會自動存、重要時刻你自己也可以按「儲存版本」。"),
        ("1. **剛裝 Keeply 不到 30 分鐘就出事**。第一張自動快照還沒拍。剛裝那天，開工前手動按一下「儲存版本」當基線，這個盲區就補上了。",
         "1. **剛裝 Keeply、第一次自動儲存還沒跑就出事**（間隔看你的設定，15-60 分鐘）。剛裝那天，開工前手動按一下「儲存版本」當基線，這個盲區就補上了。"),
        ("左邊時間軸點開「月底結算_2026年5月.xlsx」前一天 18:00 那一版",
         "左邊時間軸點開「月底結算_2026年5月.xlsx」前一天 18:00 的 evening close 那一版"),
        # Restore filename suffix consistency: 5-17 ok, just match
    ],
    "ja": [
        ("既にローカルに「2026/05/17 18:00 morning baseline」というバージョン名のスナップショットが存在していた。Keeply は 30 分ごとの自動取り込みと、ユーザーが Excel を閉じる前に「儲存版本」ボタンを押した手動スナップショットを、ローカルの隔離保管庫に重ね書きせず保存する。",
         "既にローカルに「2026/05/17 18:00 evening close」というバージョン名のスナップショットが存在していた。Keeply はバックグラウンドで自動保存（間隔は 15 / 30 / 60 分から選択、デフォルト 30 分；田中さんの PC は 15 分設定）と、ユーザーが Excel を閉じる前に「儲存版本」ボタンを押した手動スナップショットを、ローカルの隔離保管庫に重ね書きせず保存する。"),
        ("2. 左タイムラインで「月次決算_2026年5月.xlsx」の前日 18:00 バージョンを選ぶ",
         "2. 左タイムラインで「月次決算_2026年5月.xlsx」の前日 18:00 evening close バージョンを選ぶ"),
        ("![Keeply タイムライン month_end_close_2026_05.xlsx：昨日 18:00 の morning baseline + 30 分自動取り込み履歴](timeline.svg)",
         "![Keeply タイムライン month_end_close_2026_05.xlsx：昨日 18:00 の evening close + 15 分自動保存履歴](timeline.svg)"),
        ("UI は「バージョン履歴」「儲存版本」「復元」のみ。あなたが理解する必要があるのは「30 分おきに勝手にスナップショットが取られている」と「節目では自分でも『儲存版本』ボタンを押せる」の 2 つだけだ。",
         "UI は「バージョン履歴」「儲存版本」「復元」のみ。あなたが理解する必要があるのは「バックグラウンドで 15-60 分おきに自動保存されている」と「節目では自分でも『儲存版本』ボタンを押せる」の 2 つだけだ。"),
        ("1. **Keeply 導入から 30 分未満で起きた事故**。最初の自動取り込みがまだ動いていない。導入直後は朝イチで手動「儲存版本」を一度押す習慣で防げる。",
         "1. **Keeply 導入後、最初の自動保存がまだ走る前に起きた事故**（間隔は設定次第で 15〜60 分）。導入直後は朝イチで手動「儲存版本」を一度押す習慣で防げる。"),
    ],
    "ko": [
        ("Keeply 보관소에는 이미 「2026/05/17 18:00 morning baseline」이라는 이름의 스냅숏이 있었다.",
         "Keeply 보관소에는 이미 「2026/05/17 18:00 evening close」라는 이름의 스냅숏이 있었다."),
        ("1. 백그라운드에서 30분에 한 번씩 자동으로 스냅숏을 찍는다.",
         "1. 백그라운드에서 자동 저장 (간격은 15 / 30 / 60분 중 선택, 기본 30분; 김 과장 PC는 15분 설정)"),
        ("2. 왼쪽 타임라인에서 「월말결산_2026년5월.xlsx」 어제 오후 6시 버전을 클릭한다.",
         "2. 왼쪽 타임라인에서 「월말결산_2026년5월.xlsx」 어제 오후 6시 evening close 버전을 클릭한다."),
        ("![Keeply 타임라인 월말결산_2026년5월.xlsx: 어제 18:00 morning baseline + 30분 자동 스냅숏 기록](timeline.svg)",
         "![Keeply 타임라인 월말결산_2026년5월.xlsx: 어제 18:00 evening close + 15분 자동 저장 기록](timeline.svg)"),
        ("화면에는 git 용어가 하나도 안 나온다. 두 가지만 기억하면 된다. 30분마다 백그라운드에서 한 장 찍는다, 중요한 순간엔 직접 「버전 저장」을 눌러도 된다.",
         "화면에는 git 용어가 하나도 안 나온다. 두 가지만 기억하면 된다. 백그라운드에서 15-60분 간격으로 자동 저장이 된다, 중요한 순간엔 직접 「버전 저장」을 눌러도 된다."),
        ("1. **Keeply 설치 30분 이내에 사고 발생**. 첫 자동 스냅숏이 아직 안 찍혔다. 설치 당일은 일 시작 전에 「버전 저장」을 한 번 눌러 기준선을 잡으면 이 사각지대가 메워진다.",
         "1. **Keeply 설치 후 첫 자동 저장이 돌기 전에 사고 발생** (간격은 설정에 따라 15-60분). 설치 당일은 일 시작 전에 「버전 저장」을 한 번 눌러 기준선을 잡으면 이 사각지대가 메워진다."),
    ],
    "en": [
        ('the Keeply vault would already contain a snapshot named "2026/05/17 18:00 morning baseline" at the moment of the 9:14 incident.',
         'the Keeply vault would already contain a snapshot named "2026/05/17 18:00 evening close" at the moment of the 9:14 incident.'),
        ("1. Takes a snapshot automatically every 30 minutes in the background",
         "1. Auto-saves in the background (you choose the interval: 15, 30, or 60 minutes; default 30; Chen's machine is set to 15)"),
        ("2. In the left timeline, click yesterday's 6 PM version of `month_end_close_2026_05.xlsx`.",
         "2. In the left timeline, click yesterday's 6 PM evening close version of `month_end_close_2026_05.xlsx`."),
        ("![Keeply timeline for month_end_close_2026_05.xlsx: yesterday's 6 PM morning baseline + 30-min auto snapshots](timeline.svg)",
         "![Keeply timeline for month_end_close_2026_05.xlsx: yesterday's 6 PM evening close + 15-min auto-saves](timeline.svg)"),
        ('The interface uses no git terminology. Two things to remember: a snapshot is taken in the background every 30 minutes, and you can hit "Save Version" yourself at important moments.',
         'The interface uses no git terminology. Two things to remember: it auto-saves in the background every 15 to 60 minutes (you choose), and you can hit "Save Version" yourself at important moments.'),
        ("1. **Incident happens within 30 minutes of installing Keeply**. The first automatic snapshot hasn't run yet. On install day, manually hit \"Save Version\" once at the start of work as a baseline. This blind spot closes.",
         "1. **Incident happens before Keeply's first auto-save runs after install** (your interval setting: 15 to 60 min). On install day, manually hit \"Save Version\" once at the start of work as a baseline. This blind spot closes."),
    ],
}


def main():
    for locale, dirname in LOCALE_DIRNAME.items():
        # 1. Rebuild timeline.svg
        svg = timeline_svg(locale)
        svg_path = ROOT / "content" / dirname / "post" / SLUG / "timeline.svg"
        svg_path.write_text(svg, encoding="utf-8")
        print(f"  [SVG] {svg_path.relative_to(ROOT)}")

        # 2. Apply body text replacements to content + spec
        rules = BODY_REPLACE.get(locale, [])
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
            path.write_text(text, encoding="utf-8")
            print(f"  [MD ] {path.relative_to(ROOT)}: {applied}/{len(rules)} rules")


if __name__ == "__main__":
    main()
