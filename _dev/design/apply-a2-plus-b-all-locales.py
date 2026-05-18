"""Apply A2 cover (SERP-mirror + Keeply comparison split) + B 3 inline mocks
across 4 locales for excel-data-vanished-postmortem.

Output per locale (content/{locale_dir}/post/{slug}/):
  cover.svg              (replaces existing — A2 design with localized strings)
  sharepoint-version-history.svg
  excel-ref-error-grid.svg
  onedrive-sync-popup.svg

Persona names align with v7 localization:
  ja: 鈴木 / 田中, file 提案_クライアントA_v3.xlsx
  zh-tw: 陳小姐 / 小林, file 提案_客戶A_v3.xlsx
  en: Sarah / Mike, file proposal_clientA_v3.xlsx
  ko: 김 과장 / 박 대리, file 제안_고객A_v3.xlsx
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "excel-data-vanished-postmortem"

LOCALE_DIRNAME = {"ja": "ja", "en": "english", "zh-tw": "zh-tw", "ko": "ko"}

FONT_FAMILY = {
    "ja": "'Noto Sans JP','Hiragino Sans','Yu Gothic',system-ui,sans-serif",
    "en": "'Inter','Helvetica Neue','Arial',system-ui,sans-serif",
    "zh-tw": "'Noto Sans TC','PingFang TC','Microsoft JhengHei',system-ui,sans-serif",
    "ko": "'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif",
}


# Per-locale string dictionary
L = {
    "ja": {
        # Persona + file
        "filename": "提案_クライアントA_v3.xlsx",
        "filename_short": "提案_クライアントA_v3.xlsx",
        "persona": "鈴木さん（合成例）",
        "junior": "田中（後輩）",
        # Cover
        "eyebrow": "EXCEL 復元 · 事故報告書",
        "title_l1": "共同編集で消えたエクセルのデータを復元する方法と",
        "title_l2_pre": "4 層救援の ",
        "title_l2_limits": "限界",
        "title_l2_mid": " ・ Keeply の ",
        "title_l2_ok": "補位",
        "excel_header": "EXCEL · {file}",
        "excel_status": "14:32 ⚠",
        "formula_label": "fx: =VLOOKUP(A2,販売実績!A:B,2,FALSE) ← Sheet 削除",
        "col_headers": ["クライアント", "売上", "手数料", "純利", "前年比", "予算"],
        "clients": ["A 商事", "B 工業", "C 製作", "D 商会", "E 開発"],
        "sheet_tab_del": "販売実績 ✗削除",
        "sheet_tab_err": "見積もり ⚠ #REF!",
        "sheet_tab_ok": "分析",
        "verdict_left": "4 層救援（OneDrive / SharePoint / Time Machine / 復元ソフト）全滅",
        "verdict_right": "30 秒で復元 ・ formula 含めて完全復活",
        "keeply_header": "KEEPLY タイムライン · {file}",
        "keeply_status": "本機保管庫 ✓",
        "keeply_filter": "最終保存からの履歴を表示 · 15 分間隔自動保存",
        "evening_close": "evening close · 250 行入力 完了 (手動保存)",
        "evening_close_desc": "「販売実績」250 行 ✓ ・「見積もり」formula ✓ ・ 提案準備済",
        "restore_btn": "この版を復元",
        "auto_save": "自動保存 (15 分)",
        "monday_baseline": "月曜 baseline (手動保存)",
        "release": "Release",
        "callout_l1": "⚡ 共同編集や cloud sync を経由しない、本機 disk の別世界",
        "callout_l2": "同僚が cloud 側で Sheet 削除しても、Keeply 保管庫まで届かない",
        "footer_label": "keeply-blog · 事故報告書シリーズ",
        "footer_meta": "Office 365 共同編集 / Sheet 誤削除 / cascade #REF! / 4 層救援の限界",
        "footer_right": "事故 14:32 火曜 / 営業 鈴木さん（合成例）",
        # SharePoint history
        "sph_title": "バージョン履歴 · {file}",
        "sph_v8_meta": "v8 · 12:46 田中（後輩）",
        "sph_v8_desc": "Sheet「販売実績」を削除（major version 記録）",
        "sph_v8_btn": "注意: 削除",
        "sph_v7_meta": "v7 · 昨日 17:50 鈴木",
        "sph_v7_desc": "250 行入力 → ファイル閉じる",
        "sph_v7_btn": "復元する",
        "sph_v6_meta": "v6 · 昨日 17:30 鈴木",
        "sph_v6_desc": "作業中（自動保存）",
        "sph_v5_meta": "v5 · 昨日 17:15 ...",
        "sph_warning": "⚠ v8 → v7 復元しても、削除 Sheet を参照する formula は #REF! のまま",
        # Excel #REF! grid (column headers already in cover)
        "ref_formula": "fx: =VLOOKUP(A2,販売実績!A:B,2,FALSE) ← 参照 Sheet 削除",
        # OneDrive popup
        "od_title": "OneDrive",
        "od_status": "全て最新の状態です",
        "od_synced": "最終同期: 14:32:47",
        "od_check": "✓ 同期済",
        "od_warning": "⚠ 「同期済」≠「あなたのデータが安全」",
    },
    "en": {
        "filename": "proposal_clientA_v3.xlsx",
        "filename_short": "proposal_clientA_v3.xlsx",
        "persona": "Sarah (composite case)",
        "junior": "Mike (junior)",
        "eyebrow": "EXCEL RECOVERY · FORENSIC REPORT",
        "title_l1": "How to recover Excel data lost after collaborative editing",
        "title_l2_pre": "4 recovery layers' ",
        "title_l2_limits": "limits",
        "title_l2_mid": " · Keeply's ",
        "title_l2_ok": "save",
        "excel_header": "EXCEL · {file}",
        "excel_status": "2:32 PM ⚠",
        "formula_label": "fx: =VLOOKUP(A2,SalesRecords!A:B,2,FALSE) ← Sheet deleted",
        "col_headers": ["Client", "Revenue", "Fee", "Profit", "YoY", "Budget"],
        "clients": ["A Trading", "B Industries", "C Mfg.", "D Co.", "E Holdings"],
        "sheet_tab_del": "Sales Records ✗ Deleted",
        "sheet_tab_err": "Quotes ⚠ #REF!",
        "sheet_tab_ok": "Analysis",
        "verdict_left": "4 layers (OneDrive / SharePoint / Time Machine / Recovery SW) all failed",
        "verdict_right": "30-second restore · Formulas included",
        "keeply_header": "KEEPLY TIMELINE · {file}",
        "keeply_status": "Local vault ✓",
        "keeply_filter": "Showing history from last save · 15-min auto-save interval",
        "evening_close": "evening close · 250 rows entered (manual save)",
        "evening_close_desc": "Sales Records 250 rows ✓ · Quotes formulas ✓ · Pitch-ready",
        "restore_btn": "Restore this version",
        "auto_save": "Auto-save (15 min)",
        "monday_baseline": "Monday baseline (manual save)",
        "release": "Release",
        "callout_l1": "⚡ Bypasses co-authoring + cloud sync · separate world on local disk",
        "callout_l2": "Colleague deletes Sheet on cloud side → Keeply vault unaffected",
        "footer_label": "keeply-blog · Forensic report series",
        "footer_meta": "Office 365 co-authoring / Sheet deletion / cascade #REF! / 4 layers' limits",
        "footer_right": "Incident 14:32 Tuesday / Sales rep Sarah (composite)",
        "sph_title": "Version History · {file}",
        "sph_v8_meta": "v8 · 12:46 Mike (junior)",
        "sph_v8_desc": "Deleted 'Sales Records' sheet (logged as major version)",
        "sph_v8_btn": "Caution: Delete",
        "sph_v7_meta": "v7 · Yesterday 17:50 Sarah",
        "sph_v7_desc": "250 rows entered → file closed",
        "sph_v7_btn": "Restore",
        "sph_v6_meta": "v6 · Yesterday 17:30 Sarah",
        "sph_v6_desc": "Working (auto-save)",
        "sph_v5_meta": "v5 · Yesterday 17:15 ...",
        "sph_warning": "⚠ Restoring v8 → v7: formulas pointing to deleted Sheet still return #REF!",
        "ref_formula": "fx: =VLOOKUP(A2,SalesRecords!A:B,2,FALSE) ← Referenced sheet deleted",
        "od_title": "OneDrive",
        "od_status": "All up to date",
        "od_synced": "Last sync: 14:32:47",
        "od_check": "✓ Synced",
        "od_warning": "⚠ 'Synced' ≠ 'Your data is safe'",
    },
    "zh-tw": {
        "filename": "提案_客戶A_v3.xlsx",
        "filename_short": "提案_客戶A_v3.xlsx",
        "persona": "陳小姐（合成案例）",
        "junior": "小林（後輩）",
        "eyebrow": "EXCEL 復原 · 事故報告書",
        "title_l1": "共同編輯後消失的 Excel 資料怎麼救回",
        "title_l2_pre": "4 層救援的 ",
        "title_l2_limits": "極限",
        "title_l2_mid": " · Keeply 的 ",
        "title_l2_ok": "補位",
        "excel_header": "EXCEL · {file}",
        "excel_status": "14:32 ⚠",
        "formula_label": "fx: =VLOOKUP(A2,業績實績!A:B,2,FALSE) ← Sheet 已刪",
        "col_headers": ["客戶", "業績", "手續費", "淨利", "年增率", "預算"],
        "clients": ["A 商事", "B 工業", "C 製作", "D 商會", "E 開發"],
        "sheet_tab_del": "業績實績 ✗ 已刪",
        "sheet_tab_err": "報價 ⚠ #REF!",
        "sheet_tab_ok": "分析",
        "verdict_left": "4 層救援（OneDrive / SharePoint / Time Machine / 還原軟體）全滅",
        "verdict_right": "30 秒救回 · 公式完整復活",
        "keeply_header": "KEEPLY 時間軸 · {file}",
        "keeply_status": "本機保管庫 ✓",
        "keeply_filter": "顯示最後儲存後的歷史 · 15 分鐘間隔自動儲存",
        "evening_close": "evening close · 250 筆輸入完成（手動儲存）",
        "evening_close_desc": "「業績實績」250 筆 ✓ ·「報價」公式 ✓ · 提案準備好",
        "restore_btn": "還原此版本",
        "auto_save": "自動儲存（15 分鐘）",
        "monday_baseline": "星期一 baseline（手動儲存）",
        "release": "Release",
        "callout_l1": "⚡ 不經過共同編輯 / 不經過雲端同步，是本機磁碟上的另一個世界",
        "callout_l2": "同事在雲端側刪 Sheet 也傳不到 Keeply 保管庫",
        "footer_label": "keeply-blog · 事故報告書系列",
        "footer_meta": "Office 365 共同編輯 / Sheet 誤刪 / cascade #REF! / 4 層救援極限",
        "footer_right": "事故 14:32 星期二 / 業務陳小姐（合成案例）",
        "sph_title": "版本歷史 · {file}",
        "sph_v8_meta": "v8 · 12:46 小林（後輩）",
        "sph_v8_desc": "刪除 Sheet「業績實績」（記成 major version）",
        "sph_v8_btn": "注意：已刪",
        "sph_v7_meta": "v7 · 昨天 17:50 陳小姐",
        "sph_v7_desc": "輸入 250 筆 → 關檔",
        "sph_v7_btn": "還原",
        "sph_v6_meta": "v6 · 昨天 17:30 陳小姐",
        "sph_v6_desc": "編輯中（自動儲存）",
        "sph_v5_meta": "v5 · 昨天 17:15 ...",
        "sph_warning": "⚠ v8 → v7 還原後，指向已刪 Sheet 的公式還是 #REF!",
        "ref_formula": "fx: =VLOOKUP(A2,業績實績!A:B,2,FALSE) ← 參照 Sheet 已刪",
        "od_title": "OneDrive",
        "od_status": "全部都是最新狀態",
        "od_synced": "最後同步: 14:32:47",
        "od_check": "✓ 已同步",
        "od_warning": "⚠「已同步」≠「你的資料安全」",
    },
    "ko": {
        "filename": "제안_고객A_v3.xlsx",
        "filename_short": "제안_고객A_v3.xlsx",
        "persona": "김 과장(가공 사례)",
        "junior": "박 대리(후배)",
        "eyebrow": "EXCEL 복구 · 사고 보고서",
        "title_l1": "공동 편집 후 사라진 Excel 데이터를 복구하는 방법과",
        "title_l2_pre": "4 개 계층의 ",
        "title_l2_limits": "한계",
        "title_l2_mid": " · Keeply의 ",
        "title_l2_ok": "보완",
        "excel_header": "EXCEL · {file}",
        "excel_status": "14:32 ⚠",
        "formula_label": "fx: =VLOOKUP(A2,판매실적!A:B,2,FALSE) ← Sheet 삭제됨",
        "col_headers": ["고객", "매출", "수수료", "순익", "전년비", "예산"],
        "clients": ["A 상사", "B 공업", "C 제작", "D 상회", "E 개발"],
        "sheet_tab_del": "판매 실적 ✗ 삭제",
        "sheet_tab_err": "견적 ⚠ #REF!",
        "sheet_tab_ok": "분석",
        "verdict_left": "4 계층(OneDrive / SharePoint / Time Machine / 복구 SW) 모두 실패",
        "verdict_right": "30 초 복원 · 수식 포함 완전 복구",
        "keeply_header": "KEEPLY 타임라인 · {file}",
        "keeply_status": "로컬 보관소 ✓",
        "keeply_filter": "최종 저장 이후 기록 표시 · 15분 간격 자동 저장",
        "evening_close": "evening close · 250행 입력 완료 (수동 저장)",
        "evening_close_desc": "판매 실적 250행 ✓ · 견적 수식 ✓ · 제안 준비 완료",
        "restore_btn": "이 버전으로 복원",
        "auto_save": "자동 저장 (15분)",
        "monday_baseline": "월요일 baseline (수동 저장)",
        "release": "Release",
        "callout_l1": "⚡ 공동 편집 / 클라우드 동기화를 거치지 않는다 · 로컬 disk 위의 다른 세계",
        "callout_l2": "동료가 클라우드 측에서 Sheet를 삭제해도 Keeply 보관소까지 도달하지 않음",
        "footer_label": "keeply-blog · 사고 보고서 시리즈",
        "footer_meta": "Office 365 공동 편집 / Sheet 오삭제 / cascade #REF! / 4 계층의 한계",
        "footer_right": "사고 14:32 화요일 / 영업 김 과장(가공 사례)",
        "sph_title": "버전 기록 · {file}",
        "sph_v8_meta": "v8 · 12:46 박 대리(후배)",
        "sph_v8_desc": "「판매 실적」 Sheet 삭제 (major version 기록)",
        "sph_v8_btn": "주의: 삭제",
        "sph_v7_meta": "v7 · 어제 17:50 김 과장",
        "sph_v7_desc": "250행 입력 → 파일 닫음",
        "sph_v7_btn": "복원",
        "sph_v6_meta": "v6 · 어제 17:30 김 과장",
        "sph_v6_desc": "작업 중 (자동 저장)",
        "sph_v5_meta": "v5 · 어제 17:15 ...",
        "sph_warning": "⚠ v8 → v7 복원해도, 삭제된 Sheet를 참조하는 수식은 #REF! 상태 유지",
        "ref_formula": "fx: =VLOOKUP(A2,판매실적!A:B,2,FALSE) ← 참조 Sheet 삭제됨",
        "od_title": "OneDrive",
        "od_status": "모두 최신 상태입니다",
        "od_synced": "마지막 동기화: 14:32:47",
        "od_check": "✓ 동기화 완료",
        "od_warning": "⚠ 「동기화됨」 ≠ 「데이터가 안전」",
    },
}


def cover_svg(locale: str) -> str:
    s = L[locale]
    font = FONT_FAMILY[locale]
    excel_header = s["excel_header"].format(file=s["filename"])
    keeply_header = s["keeply_header"].format(file=s["filename"])
    cols = s["col_headers"]
    clients = s["clients"]

    # Column header texts at x=60,160,260,360,460,560
    col_text = "".join(
        f'<text x="{60 + i*100}" y="118" text-anchor="middle">{col}</text>'
        for i, col in enumerate(cols)
    )
    # Client column (A 列) at x=60, y=158,198,238,278,318
    client_text = "".join(
        f'<text x="60" y="{158 + i*40}" text-anchor="middle">{clients[i]}</text>'
        for i in range(5)
    )
    # #REF! cells (B-F columns rows 2-6) — simplified
    ref_cells = ""
    for ci in range(1, 5):  # B-E columns (4 cols)
        for ri in range(5):  # rows 2-6
            x = 110 + ci * 100
            y = 138 + ri * 40
            ref_cells += (
                f'<rect x="{x}" y="{y}" width="100" height="40" fill="url(#red-warn)"/>'
                f'<text x="{x+50}" y="{y+20}" text-anchor="middle">#REF!</text>'
            )

    return f'''<!-- =============================================================
     Cover: {SLUG} ({locale}, A2 SERP-mirror + Keeply comparison)
     ============================================================= -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" fill="none"
     font-family="{font}">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F1F5F9"/>
    </linearGradient>
    <linearGradient id="excel-green" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#217346"/><stop offset="1" stop-color="#1A5E38"/>
    </linearGradient>
    <linearGradient id="keeply-indigo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4F46E5"/><stop offset="1" stop-color="#312E81"/>
    </linearGradient>
    <linearGradient id="red-warn" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FEE2E2"/><stop offset="1" stop-color="#FCA5A5"/>
    </linearGradient>
    <linearGradient id="green-ok" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#D1FAE5"/><stop offset="1" stop-color="#6EE7B7"/>
    </linearGradient>
    <symbol id="keeply-lockup-big" viewBox="0 0 200 50">
      <circle cx="22" cy="25" r="16" fill="url(#keeply-indigo)"/>
      <path d="M16 18 L16 32 M16 25 L26 18 M16 25 L26 32" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <text x="48" y="33" font-size="22" font-weight="800" fill="#312E81">Keeply</text>
    </symbol>
    <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#0F172A" flood-opacity="0.12"/>
    </filter>
  </defs>

  <rect width="1600" height="900" fill="url(#paper)"/>

  <g transform="translate(0, 0)">
    <rect width="1600" height="170" fill="white"/>
    <text x="120" y="50" font-size="14" font-weight="700" fill="#217346" letter-spacing="3">{s["eyebrow"]}</text>
    <text x="120" y="100" font-size="36" font-weight="900" fill="#0F172A" letter-spacing="-1">{s["title_l1"]}</text>
    <text x="120" y="146" font-size="36" font-weight="900" fill="#0F172A" letter-spacing="-1">{s["title_l2_pre"]}<tspan fill="#DC2626">{s["title_l2_limits"]}</tspan>{s["title_l2_mid"]}<tspan fill="#10B981">{s["title_l2_ok"]}</tspan></text>
  </g>
  <rect x="0" y="170" width="1600" height="1" fill="#E2E8F0"/>

  <g transform="translate(80, 210)">
    <rect width="700" height="540" fill="white" stroke="#E2E8F0" stroke-width="1" rx="12" filter="url(#card-shadow)"/>
    <rect x="0" y="0" width="700" height="44" fill="url(#excel-green)" rx="12"/>
    <rect x="0" y="36" width="700" height="8" fill="url(#excel-green)"/>
    <text x="20" y="28" font-size="13" font-weight="700" fill="white">{excel_header}</text>
    <text x="680" y="28" font-size="12" font-weight="500" fill="white" opacity="0.85" text-anchor="end">{s["excel_status"]}</text>
    <rect x="0" y="44" width="700" height="28" fill="#F8FAFC"/>
    <rect x="14" y="50" width="50" height="16" fill="white" stroke="#CBD5E1" stroke-width="0.5" rx="2"/>
    <text x="39" y="62" font-size="10" fill="#64748B" text-anchor="middle">B2</text>
    <rect x="74" y="50" width="612" height="16" fill="white" stroke="#CBD5E1" stroke-width="0.5" rx="2"/>
    <text x="84" y="62" font-size="10" fill="#DC2626" font-family="ui-monospace,monospace">{s["formula_label"]}</text>
    <rect x="0" y="72" width="700" height="20" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="0.5"/>
    <g font-size="10" font-weight="600" fill="#64748B">
      <text x="60" y="86" text-anchor="middle">A</text>
      <text x="160" y="86" text-anchor="middle">B</text>
      <text x="260" y="86" text-anchor="middle">C</text>
      <text x="360" y="86" text-anchor="middle">D</text>
      <text x="460" y="86" text-anchor="middle">E</text>
      <text x="560" y="86" text-anchor="middle">F</text>
    </g>
    <rect x="0" y="92" width="20" height="380" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="0.5"/>
    <g font-size="10" font-weight="600" fill="#64748B">
      <text x="10" y="118" text-anchor="middle">1</text>
      <text x="10" y="158" text-anchor="middle">2</text>
      <text x="10" y="198" text-anchor="middle">3</text>
      <text x="10" y="238" text-anchor="middle">4</text>
      <text x="10" y="278" text-anchor="middle">5</text>
      <text x="10" y="318" text-anchor="middle">6</text>
    </g>
    <g font-size="11" font-weight="700" fill="#1F2937">{col_text}</g>
    <g font-size="11" fill="#1F2937">{client_text}</g>
    <g font-size="11" font-weight="700" fill="#DC2626">{ref_cells}</g>
    <rect x="0" y="472" width="700" height="36" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="0.5"/>
    <g font-size="11" font-weight="600">
      <rect x="14" y="476" width="112" height="28" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
      <text x="70" y="494" fill="#991B1B" text-anchor="middle">{s["sheet_tab_del"]}</text>
      <rect x="126" y="476" width="112" height="28" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
      <text x="182" y="494" fill="#991B1B" text-anchor="middle">{s["sheet_tab_err"]}</text>
      <rect x="238" y="476" width="80" height="28" fill="white" stroke="#CBD5E1" stroke-width="0.5"/>
      <text x="278" y="494" fill="#64748B" text-anchor="middle">{s["sheet_tab_ok"]}</text>
    </g>
    <rect x="0" y="508" width="700" height="32" fill="#7F1D1D"/>
    <text x="350" y="528" font-size="12" font-weight="700" fill="white" text-anchor="middle">{s["verdict_left"]}</text>
  </g>

  <g transform="translate(800, 480)">
    <circle cx="0" cy="0" r="36" fill="#0F172A"/>
    <text x="0" y="6" font-size="22" font-weight="900" fill="white" text-anchor="middle">vs</text>
  </g>

  <g transform="translate(820, 210)">
    <rect width="700" height="540" fill="white" stroke="#E2E8F0" stroke-width="1" rx="12" filter="url(#card-shadow)"/>
    <rect x="0" y="0" width="700" height="44" fill="url(#keeply-indigo)" rx="12"/>
    <rect x="0" y="36" width="700" height="8" fill="url(#keeply-indigo)"/>
    <text x="20" y="28" font-size="13" font-weight="700" fill="white">{keeply_header}</text>
    <text x="680" y="28" font-size="12" font-weight="500" fill="white" opacity="0.85" text-anchor="end">{s["keeply_status"]}</text>
    <rect x="0" y="44" width="700" height="28" fill="#F8FAFC"/>
    <text x="20" y="62" font-size="11" fill="#64748B">{s["keeply_filter"]}</text>
    <g transform="translate(20, 88)" font-family="{font}">
      <rect x="0" y="0" width="660" height="56" fill="url(#green-ok)" rx="6"/>
      <circle cx="22" cy="28" r="8" fill="#10B981"/>
      <path d="M18 28 L22 32 L28 24" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="46" y="24" font-size="13" font-weight="700" fill="#065F46">{s["evening_close"]}</text>
      <text x="46" y="44" font-size="11" fill="#047857">{s["evening_close_desc"]}</text>
      <rect x="540" y="14" width="106" height="28" fill="#065F46" rx="4"/>
      <text x="593" y="33" font-size="12" font-weight="700" fill="white" text-anchor="middle">{s["restore_btn"]}</text>
      <text x="650" y="78" font-size="10" fill="#6B7280" text-anchor="end">17:50</text>
      <circle cx="22" cy="100" r="5" fill="#3B82F6"/>
      <text x="46" y="105" font-size="12" fill="#374151">{s["auto_save"]}</text>
      <text x="650" y="105" font-size="10" fill="#9CA3AF" text-anchor="end">17:45</text>
      <circle cx="22" cy="128" r="5" fill="#3B82F6"/>
      <text x="46" y="133" font-size="12" fill="#374151">{s["auto_save"]}</text>
      <text x="650" y="133" font-size="10" fill="#9CA3AF" text-anchor="end">17:30</text>
      <rect x="0" y="148" width="660" height="40" fill="#DBEAFE" rx="4"/>
      <circle cx="22" cy="168" r="6" fill="#2563EB"/>
      <text x="46" y="172" font-size="12" font-weight="600" fill="#1E3A8A">{s["monday_baseline"]}</text>
      <rect x="510" y="158" width="74" height="20" rx="10" fill="#DBEAFE" stroke="#BFDBFE" stroke-width="1"/>
      <text x="547" y="172" font-size="10" font-weight="600" fill="#1D4ED8" text-anchor="middle">{s["release"]}</text>
      <text x="650" y="172" font-size="10" fill="#9CA3AF" text-anchor="end">09:00</text>
      <circle cx="22" cy="208" r="5" fill="#3B82F6"/>
      <text x="46" y="213" font-size="12" fill="#374151">{s["auto_save"]}</text>
      <text x="650" y="213" font-size="10" fill="#9CA3AF" text-anchor="end">08:45</text>
      <circle cx="22" cy="236" r="5" fill="#3B82F6"/>
      <text x="46" y="241" font-size="12" fill="#374151">{s["auto_save"]}</text>
      <text x="650" y="241" font-size="10" fill="#9CA3AF" text-anchor="end">08:30</text>
      <rect x="0" y="270" width="660" height="50" fill="#FFFBEB" rx="6"/>
      <text x="20" y="292" font-size="11" font-weight="600" fill="#92400E">{s["callout_l1"]}</text>
      <text x="20" y="310" font-size="11" fill="#92400E">{s["callout_l2"]}</text>
    </g>
    <rect x="0" y="508" width="700" height="32" fill="#065F46"/>
    <text x="350" y="528" font-size="13" font-weight="700" fill="white" text-anchor="middle">{s["verdict_right"]}</text>
  </g>

  <rect x="0" y="780" width="1600" height="120" fill="#0F172A"/>
  <use href="#keeply-lockup-big" x="80" y="820" width="200" height="50"/>
  <text x="300" y="844" font-size="13" font-weight="500" fill="#94A3B8">{s["footer_label"]}</text>
  <text x="300" y="864" font-size="11" font-weight="400" fill="#64748B">{s["footer_meta"]}</text>
  <text x="1520" y="844" font-size="13" font-weight="500" fill="#94A3B8" text-anchor="end">blog.keeply.work</text>
  <text x="1520" y="864" font-size="11" font-weight="400" fill="#64748B" text-anchor="end">{s["footer_right"]}</text>
</svg>
'''


def sharepoint_svg(locale: str) -> str:
    s = L[locale]
    font = FONT_FAMILY[locale]
    title = s["sph_title"].format(file=s["filename_short"])
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" font-family="{font}">
<rect x="0" y="0" width="480" height="300" rx="8" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>
<text x="20" y="28" font-size="13" font-weight="700" fill="#1F2937">{title}</text>
<rect x="0" y="42" width="480" height="1" fill="#E5E7EB"/>
<rect x="12" y="54" width="456" height="48" fill="#FEE2E2" rx="4"/>
<rect x="12" y="54" width="4" height="48" fill="#DC2626" rx="2"/>
<text x="28" y="74" font-size="13" font-weight="600" fill="#7F1D1D">{s["sph_v8_meta"]}</text>
<text x="28" y="92" font-size="11" fill="#991B1B">{s["sph_v8_desc"]}</text>
<rect x="380" y="64" width="76" height="28" fill="white" stroke="#DC2626" stroke-width="1" rx="4"/>
<text x="418" y="83" font-size="11" font-weight="600" fill="#DC2626" text-anchor="middle">{s["sph_v8_btn"]}</text>
<rect x="12" y="112" width="456" height="48" fill="#DBEAFE" rx="4"/>
<rect x="12" y="112" width="4" height="48" fill="#2563EB" rx="2"/>
<text x="28" y="132" font-size="13" font-weight="600" fill="#1E3A8A">{s["sph_v7_meta"]}</text>
<text x="28" y="150" font-size="11" fill="#1E40AF">{s["sph_v7_desc"]}</text>
<rect x="380" y="122" width="76" height="28" fill="#2563EB" rx="4"/>
<text x="418" y="141" font-size="12" font-weight="600" fill="white" text-anchor="middle">{s["sph_v7_btn"]}</text>
<rect x="12" y="170" width="456" height="40" fill="#F3F4F6" rx="4"/>
<text x="28" y="190" font-size="13" fill="#374151">{s["sph_v6_meta"]}</text>
<text x="28" y="204" font-size="11" fill="#6B7280">{s["sph_v6_desc"]}</text>
<rect x="12" y="218" width="456" height="32" fill="#F9FAFB" rx="4"/>
<text x="28" y="238" font-size="12" fill="#6B7280">{s["sph_v5_meta"]}</text>
<text x="240" y="278" font-size="10" fill="#9CA3AF" text-anchor="middle" font-style="italic">{s["sph_warning"]}</text>
</svg>
'''


def excel_ref_grid_svg(locale: str) -> str:
    s = L[locale]
    font = FONT_FAMILY[locale]
    cols = s["col_headers"][:5]
    clients = s["clients"]

    col_text = "".join(
        f'<text x="{48 + i*80}" y="74" text-anchor="middle">{col}</text>'
        for i, col in enumerate(cols)
    )
    client_text = "".join(
        f'<text x="48" y="{104 + i*30}" text-anchor="middle">{clients[i]}</text>'
        for i in range(6) if i < len(clients)
    )
    # #REF! cells in B-D cols, rows 2-7
    ref_cells = ""
    for ci in range(1, 4):
        for ri in range(6):
            x = 88 + (ci-1) * 80
            y = 84 + ri * 30
            ref_cells += (
                f'<rect x="{x}" y="{y}" width="80" height="30" fill="#FEE2E2"/>'
                f'<text x="{x+40}" y="{y+20}" text-anchor="middle">#REF!</text>'
            )

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" font-family="{font}">
<rect x="0" y="0" width="480" height="32" fill="#F8FAFC"/>
<rect x="12" y="6" width="60" height="20" fill="white" stroke="#CBD5E1" stroke-width="1" rx="2"/>
<text x="42" y="20" font-size="11" fill="#64748B" text-anchor="middle">B2</text>
<rect x="80" y="6" width="388" height="20" fill="white" stroke="#CBD5E1" stroke-width="1" rx="2"/>
<text x="92" y="20" font-size="10" fill="#DC2626" font-family="ui-monospace,monospace">{s["ref_formula"]}</text>
<rect x="0" y="32" width="480" height="22" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
<g font-size="11" font-weight="600" fill="#64748B">
  <text x="48" y="48" text-anchor="middle">A</text>
  <text x="128" y="48" text-anchor="middle">B</text>
  <text x="208" y="48" text-anchor="middle">C</text>
  <text x="288" y="48" text-anchor="middle">D</text>
  <text x="368" y="48" text-anchor="middle">E</text>
</g>
<rect x="0" y="54" width="22" height="260" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
<g font-size="11" font-weight="600" fill="#64748B">
  <text x="11" y="74" text-anchor="middle">1</text>
  <text x="11" y="104" text-anchor="middle">2</text>
  <text x="11" y="134" text-anchor="middle">3</text>
  <text x="11" y="164" text-anchor="middle">4</text>
  <text x="11" y="194" text-anchor="middle">5</text>
  <text x="11" y="224" text-anchor="middle">6</text>
  <text x="11" y="254" text-anchor="middle">7</text>
</g>
<g stroke="#CBD5E1" stroke-width="0.5">
  <line x1="22" y1="84" x2="480" y2="84"/>
  <line x1="22" y1="114" x2="480" y2="114"/>
  <line x1="22" y1="144" x2="480" y2="144"/>
  <line x1="22" y1="174" x2="480" y2="174"/>
  <line x1="22" y1="204" x2="480" y2="204"/>
  <line x1="22" y1="234" x2="480" y2="234"/>
  <line x1="22" y1="264" x2="480" y2="264"/>
  <line x1="88" y1="54" x2="88" y2="294"/>
  <line x1="168" y1="54" x2="168" y2="294"/>
  <line x1="248" y1="54" x2="248" y2="294"/>
  <line x1="328" y1="54" x2="328" y2="294"/>
  <line x1="408" y1="54" x2="408" y2="294"/>
</g>
<g font-size="10" font-weight="600" fill="#1F2937">{col_text}</g>
<g font-size="10" fill="#1F2937">{client_text}</g>
<g font-size="10" font-weight="700" fill="#DC2626">{ref_cells}</g>
</svg>
'''


def onedrive_popup_svg(locale: str) -> str:
    s = L[locale]
    font = FONT_FAMILY[locale]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 200" font-family="{font}">
<rect x="0" y="0" width="360" height="200" rx="8" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1" filter="drop-shadow(0 6px 16px rgba(15,23,42,0.12))"/>
<rect x="0" y="0" width="360" height="44" fill="#0078D4" rx="8"/>
<rect x="0" y="36" width="360" height="8" fill="#0078D4"/>
<circle cx="22" cy="22" r="12" fill="white"/>
<path d="M14 22 Q14 16 20 16 Q22 14 26 14 Q32 14 32 22 Q32 26 28 28 L18 28 Q14 26 14 22 Z" fill="#0078D4"/>
<text x="44" y="28" font-size="14" font-weight="700" fill="white">{s["od_title"]}</text>
<text x="338" y="28" font-size="12" fill="white" opacity="0.85" text-anchor="end">✕</text>
<g transform="translate(20, 64)">
  <circle cx="14" cy="14" r="12" fill="#10B981"/>
  <path d="M9 14 L13 18 L20 11" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="38" y="14" font-size="14" font-weight="600" fill="#0F172A">{s["od_status"]}</text>
  <text x="38" y="32" font-size="11" fill="#64748B">{s["od_synced"]}</text>
</g>
<rect x="0" y="116" width="360" height="1" fill="#E5E7EB"/>
<g transform="translate(20, 130)">
  <rect width="14" height="18" fill="#107C41" rx="2"/>
  <text x="7" y="13" font-size="9" font-weight="700" fill="white" text-anchor="middle">X</text>
  <text x="26" y="14" font-size="11" font-weight="500" fill="#0F172A">{s["filename_short"]}</text>
  <text x="320" y="14" font-size="11" fill="#10B981" text-anchor="end">{s["od_check"]}</text>
</g>
<rect x="0" y="168" width="360" height="32" fill="#FEF3C7"/>
<text x="180" y="188" font-size="11" font-weight="500" fill="#92400E" text-anchor="middle">{s["od_warning"]}</text>
</svg>
'''


def main():
    for locale, dirname in LOCALE_DIRNAME.items():
        out = ROOT / "content" / dirname / "post" / SLUG
        out.mkdir(parents=True, exist_ok=True)
        files = {
            "cover.svg": cover_svg(locale),
            "sharepoint-version-history.svg": sharepoint_svg(locale),
            "excel-ref-error-grid.svg": excel_ref_grid_svg(locale),
            "onedrive-sync-popup.svg": onedrive_popup_svg(locale),
        }
        for fname, content in files.items():
            (out / fname).write_text(content, encoding="utf-8")
        print(f"  [OK {locale}] {out.relative_to(ROOT)}: 4 SVG written")


if __name__ == "__main__":
    main()
