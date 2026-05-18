"""Generate A (SERP-mirror cover) + B (3 inline Excel UI mock SVGs) for
excel-data-vanished-postmortem ja master, so user can compare visual variants.

Output:
  content/ja/post/excel-data-vanished-postmortem/cover-serp-A.svg (1600x900)
  content/ja/post/excel-data-vanished-postmortem/sharepoint-version-history.svg
  content/ja/post/excel-data-vanished-postmortem/excel-ref-error-grid.svg
  content/ja/post/excel-data-vanished-postmortem/onedrive-sync-popup.svg
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "content" / "ja" / "post" / "excel-data-vanished-postmortem"
JA_FONT = "'Noto Sans JP','Hiragino Sans','Yu Gothic',system-ui,sans-serif"


# =============================================================================
# A. SERP-mirror cover (Excel UI-themed with article title overlay)
# =============================================================================

def cover_serp_a() -> str:
    return f'''<!-- =============================================================
     Cover: excel-data-vanished-postmortem (ja master, SERP-mirror variant A)
     Recipe: SERP-procedural — Excel cell grid background + large article
     title overlay + Excel sheet tabs + small Keeply badge corner
     ============================================================= -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" fill="none"
     font-family="{JA_FONT}">
  <defs>
    <linearGradient id="excel-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F1F5F9"/>
    </linearGradient>
    <linearGradient id="excel-green" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#217346"/><stop offset="1" stop-color="#1A5E38"/>
    </linearGradient>
    <linearGradient id="keeply-indigo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4F46E5"/><stop offset="1" stop-color="#312E81"/>
    </linearGradient>
    <pattern id="excel-grid" x="0" y="0" width="80" height="30" patternUnits="userSpaceOnUse">
      <rect width="80" height="30" fill="none"/>
      <path d="M0 30 L80 30 M80 0 L80 30" stroke="#D1D5DB" stroke-width="0.5" opacity="0.4"/>
    </pattern>
    <symbol id="keeply-badge" viewBox="0 0 100 30">
      <circle cx="14" cy="15" r="10" fill="url(#keeply-indigo)"/>
      <path d="M10 11 L10 19 M10 15 L16 11 M10 15 L16 19" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <text x="30" y="20" font-size="13" font-weight="700" fill="#312E81">Keeply</text>
    </symbol>
  </defs>

  <!-- Excel ribbon-like top bar -->
  <rect x="0" y="0" width="1600" height="60" fill="url(#excel-green)"/>
  <text x="40" y="38" font-size="16" font-weight="600" fill="white" letter-spacing="1">EXCEL · 提案_クライアントA_v3.xlsx</text>
  <text x="1560" y="38" font-size="14" font-weight="500" fill="white" opacity="0.85" text-anchor="end">他 1 人が編集中 · OneDrive ✓</text>

  <!-- Formula bar -->
  <rect x="0" y="60" width="1600" height="36" fill="#F8FAFC"/>
  <rect x="40" y="68" width="60" height="20" fill="white" stroke="#CBD5E1" stroke-width="1" rx="2"/>
  <text x="70" y="82" font-size="11" fill="#64748B" text-anchor="middle">A1</text>
  <rect x="120" y="68" width="1440" height="20" fill="white" stroke="#CBD5E1" stroke-width="1" rx="2"/>
  <text x="135" y="82" font-size="11" fill="#9CA3AF" font-family="ui-monospace,monospace">fx: =SUM(販売実績!B2:B250)</text>

  <!-- Excel cell grid background -->
  <rect x="0" y="96" width="1600" height="660" fill="url(#excel-bg)"/>
  <rect x="0" y="96" width="1600" height="660" fill="url(#excel-grid)"/>

  <!-- Column headers (A B C D E F) -->
  <rect x="0" y="96" width="1600" height="22" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
  <g font-size="11" font-weight="600" fill="#64748B">
    <text x="80" y="112" text-anchor="middle">A</text>
    <text x="160" y="112" text-anchor="middle">B</text>
    <text x="240" y="112" text-anchor="middle">C</text>
    <text x="320" y="112" text-anchor="middle">D</text>
    <text x="400" y="112" text-anchor="middle">E</text>
    <text x="480" y="112" text-anchor="middle">F</text>
  </g>

  <!-- Row headers (1 2 3 4 5 6 7 8) with empty cells showing "deleted" state -->
  <rect x="0" y="118" width="40" height="660" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
  <g font-size="11" font-weight="600" fill="#64748B">
    <text x="20" y="138" text-anchor="middle">1</text>
    <text x="20" y="168" text-anchor="middle">2</text>
    <text x="20" y="198" text-anchor="middle">3</text>
    <text x="20" y="228" text-anchor="middle">4</text>
  </g>

  <!-- Article title (SERP-style large overlay) -->
  <g transform="translate(120, 280)">
    <rect width="1360" height="320" fill="white" stroke="#E2E8F0" stroke-width="1" rx="12" filter="drop-shadow(0 14px 28px rgba(30,41,59,0.12))"/>
    <text x="40" y="60" font-size="14" font-weight="700" fill="#217346" letter-spacing="3">EXCEL 復元 · 事故報告書</text>
    <text x="40" y="130" font-size="42" font-weight="900" fill="#0F172A" letter-spacing="-1">共同編集で消えたエクセルのデータを</text>
    <text x="40" y="186" font-size="42" font-weight="900" fill="#0F172A" letter-spacing="-1">復元する方法と <tspan fill="#217346">4 層救援の限界</tspan></text>
    <text x="40" y="240" font-size="20" font-weight="500" fill="#475569">昼休み明けに開いたら Sheet が空。同僚が cloud で誤って削除。</text>
    <text x="40" y="272" font-size="20" font-weight="500" fill="#475569">OneDrive 同期 / SharePoint バージョン履歴 / Time Machine / 復元ソフトを分単位で検証。</text>
  </g>

  <!-- Excel sheet tabs at bottom -->
  <rect x="0" y="756" width="1600" height="40" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1"/>
  <g font-size="13" font-weight="600">
    <rect x="40" y="760" width="120" height="32" fill="white" stroke="#CBD5E1" stroke-width="1"/>
    <text x="100" y="780" fill="#0F172A" text-anchor="middle">販売実績</text>
    <rect x="160" y="760" width="100" height="32" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
    <text x="210" y="780" fill="#991B1B" text-anchor="middle">見積もり ⚠</text>
    <rect x="260" y="760" width="80" height="32" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
    <text x="300" y="780" fill="#64748B" text-anchor="middle">分析</text>
  </g>

  <!-- Bottom bar with Keeply badge + meta -->
  <rect x="0" y="796" width="1600" height="104" fill="#0F172A"/>
  <use href="#keeply-badge" x="40" y="828" width="140" height="40"/>
  <text x="200" y="852" font-size="13" font-weight="500" fill="#94A3B8">keeply-blog · 事故報告書シリーズ</text>
  <text x="1560" y="852" font-size="13" font-weight="500" fill="#94A3B8" text-anchor="end">blog.keeply.work</text>
</svg>
'''


# =============================================================================
# B.1 SharePoint version history list mock
# =============================================================================

def sharepoint_version_history() -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" font-family="{JA_FONT}">
<rect x="0" y="0" width="480" height="300" rx="8" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>
<text x="20" y="28" font-size="14" font-weight="700" fill="#1F2937">バージョン履歴 · 提案_クライアントA_v3.xlsx</text>
<rect x="0" y="42" width="480" height="1" fill="#E5E7EB"/>

<!-- v8: Tanaka deletion (red) -->
<rect x="12" y="54" width="456" height="48" fill="#FEE2E2" rx="4"/>
<rect x="12" y="54" width="4" height="48" fill="#DC2626" rx="2"/>
<text x="28" y="74" font-size="13" font-weight="600" fill="#7F1D1D">v8 · 12:46 田中（後輩）</text>
<text x="28" y="92" font-size="11" fill="#991B1B">Sheet「販売実績」を削除（major version 記録）</text>
<rect x="380" y="64" width="76" height="28" fill="white" stroke="#DC2626" stroke-width="1" rx="4"/>
<text x="418" y="83" font-size="12" font-weight="600" fill="#DC2626" text-anchor="middle">注意: 削除</text>

<!-- v7: Suzuki evening (blue) -->
<rect x="12" y="112" width="456" height="48" fill="#DBEAFE" rx="4"/>
<rect x="12" y="112" width="4" height="48" fill="#2563EB" rx="2"/>
<text x="28" y="132" font-size="13" font-weight="600" fill="#1E3A8A">v7 · 昨日 17:50 鈴木</text>
<text x="28" y="150" font-size="11" fill="#1E40AF">250 行入力 → ファイル閉じる</text>
<rect x="380" y="122" width="76" height="28" fill="#2563EB" rx="4"/>
<text x="418" y="141" font-size="12" font-weight="600" fill="white" text-anchor="middle">復元する</text>

<!-- v6 -->
<rect x="12" y="170" width="456" height="40" fill="#F3F4F6" rx="4"/>
<text x="28" y="190" font-size="13" fill="#374151">v6 · 昨日 17:30 鈴木</text>
<text x="28" y="204" font-size="11" fill="#6B7280">作業中（自動保存）</text>

<!-- v5 (collapsed) -->
<rect x="12" y="218" width="456" height="32" fill="#F9FAFB" rx="4"/>
<text x="28" y="238" font-size="12" fill="#6B7280">v5 · 昨日 17:15 ...</text>

<text x="240" y="278" font-size="11" fill="#9CA3AF" text-anchor="middle" font-style="italic">⚠ v8 → v7 復元しても、削除 Sheet を参照する formula は #REF! のまま</text>
</svg>
'''


# =============================================================================
# B.2 Excel #REF! cell error grid mock
# =============================================================================

def excel_ref_error_grid() -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" font-family="{JA_FONT}">
<!-- Excel formula bar -->
<rect x="0" y="0" width="480" height="32" fill="#F8FAFC"/>
<rect x="12" y="6" width="60" height="20" fill="white" stroke="#CBD5E1" stroke-width="1" rx="2"/>
<text x="42" y="20" font-size="11" fill="#64748B" text-anchor="middle">B2</text>
<rect x="80" y="6" width="388" height="20" fill="white" stroke="#CBD5E1" stroke-width="1" rx="2"/>
<text x="92" y="20" font-size="11" fill="#DC2626" font-family="ui-monospace,monospace">fx: =VLOOKUP(A2,販売実績!A:B,2,FALSE)  ← 参照 Sheet 削除</text>

<!-- Column headers A B C D E -->
<rect x="0" y="32" width="480" height="22" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
<g font-size="11" font-weight="600" fill="#64748B">
  <text x="48" y="48" text-anchor="middle">A</text>
  <text x="128" y="48" text-anchor="middle">B</text>
  <text x="208" y="48" text-anchor="middle">C</text>
  <text x="288" y="48" text-anchor="middle">D</text>
  <text x="368" y="48" text-anchor="middle">E</text>
</g>

<!-- Row headers + cells -->
<rect x="0" y="54" width="22" height="240" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
<g font-size="11" font-weight="600" fill="#64748B">
  <text x="11" y="74" text-anchor="middle">1</text>
  <text x="11" y="104" text-anchor="middle">2</text>
  <text x="11" y="134" text-anchor="middle">3</text>
  <text x="11" y="164" text-anchor="middle">4</text>
  <text x="11" y="194" text-anchor="middle">5</text>
  <text x="11" y="224" text-anchor="middle">6</text>
  <text x="11" y="254" text-anchor="middle">7</text>
  <text x="11" y="284" text-anchor="middle">8</text>
</g>

<!-- Cell grid lines + values -->
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

<!-- Row 1: headers -->
<g font-size="11" font-weight="600" fill="#1F2937">
  <text x="48" y="74" text-anchor="middle">クライアント</text>
  <text x="128" y="74" text-anchor="middle">売上</text>
  <text x="208" y="74" text-anchor="middle">手数料</text>
  <text x="288" y="74" text-anchor="middle">純利</text>
</g>

<!-- Row 2-7: data cells with #REF! highlighted -->
<g font-size="11" fill="#1F2937">
  <text x="48" y="104" text-anchor="middle">A 商事</text>
  <text x="48" y="134" text-anchor="middle">B 工業</text>
  <text x="48" y="164" text-anchor="middle">C 製作所</text>
  <text x="48" y="194" text-anchor="middle">D 商会</text>
  <text x="48" y="224" text-anchor="middle">E 開発</text>
  <text x="48" y="254" text-anchor="middle">F 流通</text>
</g>

<!-- #REF! cells in red -->
<g font-size="11" font-weight="700" fill="#DC2626">
  <rect x="88" y="84" width="80" height="30" fill="#FEE2E2"/>
  <text x="128" y="104" text-anchor="middle">#REF!</text>
  <rect x="88" y="114" width="80" height="30" fill="#FEE2E2"/>
  <text x="128" y="134" text-anchor="middle">#REF!</text>
  <rect x="88" y="144" width="80" height="30" fill="#FEE2E2"/>
  <text x="128" y="164" text-anchor="middle">#REF!</text>
  <rect x="88" y="174" width="80" height="30" fill="#FEE2E2"/>
  <text x="128" y="194" text-anchor="middle">#REF!</text>
  <rect x="88" y="204" width="80" height="30" fill="#FEE2E2"/>
  <text x="128" y="224" text-anchor="middle">#REF!</text>
  <rect x="88" y="234" width="80" height="30" fill="#FEE2E2"/>
  <text x="128" y="254" text-anchor="middle">#REF!</text>
</g>

<!-- Other cells: similar pattern -->
<g font-size="11" font-weight="700" fill="#DC2626">
  <rect x="168" y="84" width="80" height="30" fill="#FEE2E2"/>
  <text x="208" y="104" text-anchor="middle">#REF!</text>
  <rect x="168" y="114" width="80" height="30" fill="#FEE2E2"/>
  <text x="208" y="134" text-anchor="middle">#REF!</text>
  <rect x="168" y="144" width="80" height="30" fill="#FEE2E2"/>
  <text x="208" y="164" text-anchor="middle">#REF!</text>
  <rect x="248" y="84" width="80" height="30" fill="#FEE2E2"/>
  <text x="288" y="104" text-anchor="middle">#REF!</text>
  <rect x="248" y="114" width="80" height="30" fill="#FEE2E2"/>
  <text x="288" y="134" text-anchor="middle">#REF!</text>
</g>
</svg>
'''


# =============================================================================
# B.3 OneDrive sync popup mock
# =============================================================================

def onedrive_sync_popup() -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 200" font-family="{JA_FONT}">
<rect x="0" y="0" width="360" height="200" rx="8" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1" filter="drop-shadow(0 6px 16px rgba(15,23,42,0.12))"/>

<!-- Header -->
<rect x="0" y="0" width="360" height="44" fill="#0078D4" rx="8"/>
<rect x="0" y="36" width="360" height="8" fill="#0078D4"/>
<circle cx="22" cy="22" r="12" fill="white"/>
<path d="M14 22 Q14 16 20 16 Q22 14 26 14 Q32 14 32 22 Q32 26 28 28 L18 28 Q14 26 14 22 Z" fill="#0078D4"/>
<text x="44" y="28" font-size="14" font-weight="700" fill="white">OneDrive</text>
<text x="338" y="28" font-size="12" fill="white" opacity="0.85" text-anchor="end">✕</text>

<!-- Status -->
<g transform="translate(20, 64)">
  <circle cx="14" cy="14" r="12" fill="#10B981"/>
  <path d="M9 14 L13 18 L20 11" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="38" y="14" font-size="14" font-weight="600" fill="#0F172A">全て最新の状態です</text>
  <text x="38" y="32" font-size="11" fill="#64748B">最終同期: 14:32:47</text>
</g>

<!-- File row -->
<rect x="0" y="116" width="360" height="1" fill="#E5E7EB"/>
<g transform="translate(20, 130)">
  <rect width="14" height="18" fill="#107C41" rx="2"/>
  <text x="7" y="13" font-size="9" font-weight="700" fill="white" text-anchor="middle">X</text>
  <text x="26" y="14" font-size="12" font-weight="500" fill="#0F172A">提案_クライアントA_v3.xlsx</text>
  <text x="320" y="14" font-size="11" fill="#10B981" text-anchor="end">✓ 同期済</text>
</g>

<!-- Warning footer -->
<rect x="0" y="168" width="360" height="32" fill="#FEF3C7"/>
<text x="180" y="188" font-size="11" font-weight="500" fill="#92400E" text-anchor="middle">⚠ 「同期済」≠「あなたのデータが安全」</text>
</svg>
'''


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    files = {
        "cover-serp-A.svg": cover_serp_a(),
        "sharepoint-version-history.svg": sharepoint_version_history(),
        "excel-ref-error-grid.svg": excel_ref_error_grid(),
        "onedrive-sync-popup.svg": onedrive_sync_popup(),
    }
    for fname, content in files.items():
        path = OUT / fname
        path.write_text(content, encoding="utf-8")
        print(f"  [OK] {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
