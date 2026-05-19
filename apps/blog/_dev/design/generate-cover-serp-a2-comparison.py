"""Generate cover-serp-A2.svg — SERP-mirror cover with Excel-failed vs Keeply-saved
comparison split layout. User asked: "A+B，但 keeply 也要可以納入做對比".

Layout (1600x900):
  Top:    Article title overlay band (full width)
  Middle: Left half = Excel #REF! broken state
          Right half = Keeply timeline saved state (with 18:00 evening close intact)
  Bottom: Verdict bar + Keeply lockup
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "content" / "ja" / "post" / "excel-data-vanished-postmortem"
JA_FONT = "'Noto Sans JP','Hiragino Sans','Yu Gothic',system-ui,sans-serif"


def cover_serp_a2() -> str:
    return f'''<!-- =============================================================
     Cover: excel-data-vanished-postmortem (ja master, SERP-mirror variant A2)
     Recipe: comparison split — Excel #REF! broken state | Keeply timeline saved
     ============================================================= -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" fill="none"
     font-family="{JA_FONT}">
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

  <!-- background -->
  <rect width="1600" height="900" fill="url(#paper)"/>

  <!-- Top title band -->
  <g transform="translate(0, 0)">
    <rect width="1600" height="170" fill="white"/>
    <text x="120" y="50" font-size="14" font-weight="700" fill="#217346" letter-spacing="3">EXCEL 復元 · 事故報告書</text>
    <text x="120" y="100" font-size="36" font-weight="900" fill="#0F172A" letter-spacing="-1">共同編集で消えたエクセルのデータを復元する方法と</text>
    <text x="120" y="146" font-size="36" font-weight="900" fill="#0F172A" letter-spacing="-1">4 層救援の <tspan fill="#DC2626">限界</tspan> ・ Keeply の <tspan fill="#10B981">補位</tspan></text>
  </g>
  <rect x="0" y="170" width="1600" height="1" fill="#E2E8F0"/>

  <!-- Comparison split: LEFT = Excel broken / RIGHT = Keeply saved -->

  <!-- LEFT PANEL: Excel broken state -->
  <g transform="translate(80, 210)">
    <rect width="700" height="540" fill="white" stroke="#E2E8F0" stroke-width="1" rx="12" filter="url(#card-shadow)"/>

    <!-- Excel ribbon header -->
    <rect x="0" y="0" width="700" height="44" fill="url(#excel-green)" rx="12"/>
    <rect x="0" y="36" width="700" height="8" fill="url(#excel-green)"/>
    <text x="20" y="28" font-size="13" font-weight="700" fill="white">EXCEL · 提案_クライアントA_v3.xlsx</text>
    <text x="680" y="28" font-size="12" font-weight="500" fill="white" opacity="0.85" text-anchor="end">14:32 ⚠</text>

    <!-- Formula bar -->
    <rect x="0" y="44" width="700" height="28" fill="#F8FAFC"/>
    <rect x="14" y="50" width="50" height="16" fill="white" stroke="#CBD5E1" stroke-width="0.5" rx="2"/>
    <text x="39" y="62" font-size="10" fill="#64748B" text-anchor="middle">B2</text>
    <rect x="74" y="50" width="612" height="16" fill="white" stroke="#CBD5E1" stroke-width="0.5" rx="2"/>
    <text x="84" y="62" font-size="10" fill="#DC2626" font-family="ui-monospace,monospace">fx: =VLOOKUP(A2,販売実績!A:B,2,FALSE) ← Sheet 削除</text>

    <!-- Column headers -->
    <rect x="0" y="72" width="700" height="20" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="0.5"/>
    <g font-size="10" font-weight="600" fill="#64748B">
      <text x="60" y="86" text-anchor="middle">A</text>
      <text x="160" y="86" text-anchor="middle">B</text>
      <text x="260" y="86" text-anchor="middle">C</text>
      <text x="360" y="86" text-anchor="middle">D</text>
      <text x="460" y="86" text-anchor="middle">E</text>
      <text x="560" y="86" text-anchor="middle">F</text>
    </g>

    <!-- Row header strip -->
    <rect x="0" y="92" width="20" height="380" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="0.5"/>
    <g font-size="10" font-weight="600" fill="#64748B">
      <text x="10" y="118" text-anchor="middle">1</text>
      <text x="10" y="158" text-anchor="middle">2</text>
      <text x="10" y="198" text-anchor="middle">3</text>
      <text x="10" y="238" text-anchor="middle">4</text>
      <text x="10" y="278" text-anchor="middle">5</text>
      <text x="10" y="318" text-anchor="middle">6</text>
    </g>

    <!-- Row 1: headers (intact) -->
    <g font-size="11" font-weight="700" fill="#1F2937">
      <text x="60" y="118" text-anchor="middle">クライアント</text>
      <text x="160" y="118" text-anchor="middle">売上</text>
      <text x="260" y="118" text-anchor="middle">手数料</text>
      <text x="360" y="118" text-anchor="middle">純利</text>
      <text x="460" y="118" text-anchor="middle">前年比</text>
      <text x="560" y="118" text-anchor="middle">予算</text>
    </g>

    <!-- A 列 (intact) -->
    <g font-size="11" fill="#1F2937">
      <text x="60" y="158" text-anchor="middle">A 商事</text>
      <text x="60" y="198" text-anchor="middle">B 工業</text>
      <text x="60" y="238" text-anchor="middle">C 製作</text>
      <text x="60" y="278" text-anchor="middle">D 商会</text>
      <text x="60" y="318" text-anchor="middle">E 開発</text>
    </g>

    <!-- #REF! cells (B-F columns, rows 2-6) -->
    <g font-size="11" font-weight="700" fill="#DC2626">
      <rect x="110" y="138" width="100" height="40" fill="url(#red-warn)"/>
      <text x="160" y="158" text-anchor="middle">#REF!</text>
      <rect x="110" y="178" width="100" height="40" fill="url(#red-warn)"/>
      <text x="160" y="198" text-anchor="middle">#REF!</text>
      <rect x="110" y="218" width="100" height="40" fill="url(#red-warn)"/>
      <text x="160" y="238" text-anchor="middle">#REF!</text>
      <rect x="110" y="258" width="100" height="40" fill="url(#red-warn)"/>
      <text x="160" y="278" text-anchor="middle">#REF!</text>
      <rect x="110" y="298" width="100" height="40" fill="url(#red-warn)"/>
      <text x="160" y="318" text-anchor="middle">#REF!</text>

      <rect x="210" y="138" width="100" height="40" fill="url(#red-warn)"/>
      <text x="260" y="158" text-anchor="middle">#REF!</text>
      <rect x="210" y="178" width="100" height="40" fill="url(#red-warn)"/>
      <text x="260" y="198" text-anchor="middle">#REF!</text>
      <rect x="210" y="218" width="100" height="40" fill="url(#red-warn)"/>
      <text x="260" y="238" text-anchor="middle">#REF!</text>

      <rect x="310" y="138" width="100" height="40" fill="url(#red-warn)"/>
      <text x="360" y="158" text-anchor="middle">#REF!</text>
      <rect x="310" y="178" width="100" height="40" fill="url(#red-warn)"/>
      <text x="360" y="198" text-anchor="middle">#REF!</text>

      <rect x="410" y="138" width="100" height="40" fill="url(#red-warn)"/>
      <text x="460" y="158" text-anchor="middle">#REF!</text>
    </g>

    <!-- Sheet tabs (販売実績 missing, 見積もり error) -->
    <rect x="0" y="472" width="700" height="36" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="0.5"/>
    <g font-size="11" font-weight="600">
      <rect x="14" y="476" width="100" height="28" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
      <text x="64" y="494" fill="#991B1B" text-anchor="middle">販売実績 ✗削除</text>
      <rect x="114" y="476" width="100" height="28" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
      <text x="164" y="494" fill="#991B1B" text-anchor="middle">見積もり ⚠ #REF!</text>
      <rect x="214" y="476" width="80" height="28" fill="white" stroke="#CBD5E1" stroke-width="0.5"/>
      <text x="254" y="494" fill="#64748B" text-anchor="middle">分析</text>
    </g>

    <!-- Verdict bar -->
    <rect x="0" y="508" width="700" height="32" fill="#7F1D1D"/>
    <text x="350" y="528" font-size="13" font-weight="700" fill="white" text-anchor="middle">4 層救援（OneDrive / SharePoint / Time Machine / 復元ソフト） 全滅</text>
  </g>

  <!-- Center divider with "vs" -->
  <g transform="translate(800, 480)">
    <circle cx="0" cy="0" r="36" fill="#0F172A"/>
    <text x="0" y="6" font-size="22" font-weight="900" fill="white" text-anchor="middle">vs</text>
  </g>

  <!-- RIGHT PANEL: Keeply saved state -->
  <g transform="translate(820, 210)">
    <rect width="700" height="540" fill="white" stroke="#E2E8F0" stroke-width="1" rx="12" filter="url(#card-shadow)"/>

    <!-- Keeply header -->
    <rect x="0" y="0" width="700" height="44" fill="url(#keeply-indigo)" rx="12"/>
    <rect x="0" y="36" width="700" height="8" fill="url(#keeply-indigo)"/>
    <text x="20" y="28" font-size="13" font-weight="700" fill="white">KEEPLY タイムライン · 提案_クライアントA_v3.xlsx</text>
    <text x="680" y="28" font-size="12" font-weight="500" fill="white" opacity="0.85" text-anchor="end">本機保管庫 ✓</text>

    <!-- Search/filter bar -->
    <rect x="0" y="44" width="700" height="28" fill="#F8FAFC"/>
    <text x="20" y="62" font-size="11" fill="#64748B">最終保存からの履歴を表示 · 15 分間隔自動保存</text>

    <!-- Timeline rows (saved versions) -->
    <g transform="translate(20, 88)" font-family="{JA_FONT}">
      <!-- evening close (highlighted) -->
      <rect x="0" y="0" width="660" height="56" fill="url(#green-ok)" rx="6"/>
      <circle cx="22" cy="28" r="8" fill="#10B981"/>
      <path d="M18 28 L22 32 L28 24" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="46" y="24" font-size="14" font-weight="700" fill="#065F46">evening close · 250 行入力 完了 (手動保存)</text>
      <text x="46" y="44" font-size="11" fill="#047857">「販売実績」250 行 ✓ ・「見積もり」formula ✓ ・ 提案準備済</text>
      <rect x="540" y="14" width="106" height="28" fill="#065F46" rx="4"/>
      <text x="593" y="33" font-size="12" font-weight="700" fill="white" text-anchor="middle">この版を復元</text>
      <text x="650" y="78" font-size="10" fill="#6B7280" text-anchor="end">昨日 18:00</text>

      <!-- Auto-saves 15 min -->
      <circle cx="22" cy="100" r="5" fill="#3B82F6"/>
      <text x="46" y="105" font-size="12" fill="#374151">自動保存 (15 分)</text>
      <text x="650" y="105" font-size="10" fill="#9CA3AF" text-anchor="end">昨日 17:45</text>

      <circle cx="22" cy="128" r="5" fill="#3B82F6"/>
      <text x="46" y="133" font-size="12" fill="#374151">自動保存 (15 分)</text>
      <text x="650" y="133" font-size="10" fill="#9CA3AF" text-anchor="end">昨日 17:30</text>

      <!-- baseline -->
      <rect x="0" y="148" width="660" height="40" fill="#DBEAFE" rx="4"/>
      <circle cx="22" cy="168" r="6" fill="#2563EB"/>
      <text x="46" y="172" font-size="12" font-weight="600" fill="#1E3A8A">月曜 baseline (手動保存)</text>
      <rect x="510" y="158" width="74" height="20" rx="10" fill="#DBEAFE" stroke="#BFDBFE" stroke-width="1"/>
      <text x="547" y="172" font-size="10" font-weight="600" fill="#1D4ED8" text-anchor="middle">Release</text>
      <text x="650" y="172" font-size="10" fill="#9CA3AF" text-anchor="end">月曜 09:00</text>

      <!-- More auto-saves -->
      <circle cx="22" cy="208" r="5" fill="#3B82F6"/>
      <text x="46" y="213" font-size="12" fill="#374151">自動保存 (15 分)</text>
      <text x="650" y="213" font-size="10" fill="#9CA3AF" text-anchor="end">月曜 08:45</text>

      <circle cx="22" cy="236" r="5" fill="#3B82F6"/>
      <text x="46" y="241" font-size="12" fill="#374151">自動保存 (15 分)</text>
      <text x="650" y="241" font-size="10" fill="#9CA3AF" text-anchor="end">月曜 08:30</text>

      <!-- Status message -->
      <rect x="0" y="270" width="660" height="50" fill="#FFFBEB" rx="6"/>
      <text x="20" y="295" font-size="12" font-weight="600" fill="#92400E">⚡ 共同編集や cloud sync を経由しない、本機 disk の別世界</text>
      <text x="20" y="312" font-size="11" fill="#92400E">同僚が cloud 側で Sheet 削除しても、Keeply 保管庫まで届かない</text>
    </g>

    <!-- Verdict bar -->
    <rect x="0" y="508" width="700" height="32" fill="#065F46"/>
    <text x="350" y="528" font-size="13" font-weight="700" fill="white" text-anchor="middle">30 秒で復元 ・ formula 含めて完全復活</text>
  </g>

  <!-- Bottom band: Keeply lockup + meta -->
  <rect x="0" y="780" width="1600" height="120" fill="#0F172A"/>
  <use href="#keeply-lockup-big" x="80" y="820" width="200" height="50"/>
  <text x="300" y="844" font-size="13" font-weight="500" fill="#94A3B8">keeply-blog · 事故報告書シリーズ</text>
  <text x="300" y="864" font-size="11" font-weight="400" fill="#64748B">Office 365 共同編集 / Sheet 誤削除 / cascade #REF! / 4 層救援の限界</text>
  <text x="1520" y="844" font-size="13" font-weight="500" fill="#94A3B8" text-anchor="end">blog.keeply.work</text>
  <text x="1520" y="864" font-size="11" font-weight="400" fill="#64748B" text-anchor="end">事故 14:32 火曜 / 営業 鈴木さん（合成例）</text>
</svg>
'''


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "cover-serp-A2.svg"
    path.write_text(cover_serp_a2(), encoding="utf-8")
    print(f"  [OK] {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
