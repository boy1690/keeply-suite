# Tier S + A + B/C/D Image Insertion Brief

> Designer-ready brief for inserting body images into 16 articles on blog.keeply.work.
> Status: ready for handoff. Author: Ting-Wei Tsao (<boy1690@gmail.com>). Created: 2026-05-13. Updated 2026-05-13 (Tier A + B/C/D appended).
>
> **Scope**: 3 Tier S (§4-6) + 4 Tier A (§13-16) + 4 Tier B (§20) + 4 Tier C (§21) + 1 Tier D (§22) = **40 new images** across 5-6 locales each (~228 SVG 交付件).

---

## 1. Why these 3 articles

Audit of 22 zh-TW articles (2026-05-13) found only 5 ship with body images. Of the 16 image-less articles, 3 score highest on **(視覺 ROI × 流量潛力 × 字數負擔)** = Tier S：

| Slug | 字數 | Why it's Tier S |
|---|---|---|
| `3-2-1-backup-rule` | 8.9K | 「3-2-1」本身是業界標準 diagram；沒圖讀者連概念都記不住，競品全有 |
| `cloud-version-history-cliff` | 10.3K | 標題 metaphor「cliff」就是 visual affordance；沒圖等於浪費 hook |
| `thesis-single-point-of-failure` | 12K | Pillar-adjacent，標題「單點故障 + 時間線」是兩個 systems 經典視覺概念 |

Total scope: **13 new images** across 3 articles (8 priority P1, 5 priority P2).

Reference style: see `content/zh-tw/post/what-keeply-saves-vs-backup-cloud/image-{1,2,3}.svg` for the established visual language—indigo + amber gradient with paper bg, grid overlay, drop shadow, CJK-friendly font stack.

---

## 2. Brand spec（取自 what-keeply-saves-vs-backup-cloud reference SVG）

### Color palette

| Role | Hex | Usage |
|---|---|---|
| Primary indigo (light) | `#4F46E5` | Gradient start, main brand |
| Primary indigo (dark) | `#4338CA` | Gradient end, mid text |
| Indigo deep | `#312E81` | Heading text, drop-shadow color |
| Indigo soft surface | `#E0E7FF` | Card bg secondary |
| Paper bg light | `#F8F7FF` | Canvas gradient start |
| Paper bg mid | `#EEF2FF` | Canvas gradient end |
| Amber (light) | `#FFB300` | Accent gradient start, timeline, callout |
| Amber (dark) | `#F59E0B` | Accent gradient end |
| Amber soft surface | `#FFFBEB` | Highlight card bg |
| Amber border | `#FDE68A` | Highlight card border |
| Success green | `#059669` | ✅ icon, "解什麼" callout |
| Success surface | `#D1FAE5` | Success card bg |
| Danger red | `#DC2626` | ❌ icon, "不解什麼" callout, cliff drop |
| Danger surface | `#FEE2E2` | Danger card bg |
| Accent purple | `#9C98FF` | Tertiary accent (sparingly) |
| White | `#ffffff` | Card surface |

### Standard SVG defs（複製進每張 image）

```svg
<defs>
  <linearGradient id="g-indigo" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#4F46E5"/><stop offset="1" stop-color="#4338CA"/>
  </linearGradient>
  <linearGradient id="g-amber" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFB300"/><stop offset="1" stop-color="#F59E0B"/>
  </linearGradient>
  <linearGradient id="g-paper" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#F8F7FF"/><stop offset="1" stop-color="#EEF2FF"/>
  </linearGradient>
  <pattern id="grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#4338CA" stroke-width="1" opacity="0.05"/>
  </pattern>
  <filter id="shadow">
    <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#312E81" flood-opacity="0.14"/>
  </filter>
</defs>
```

### Typography

- **Sans (default)**: `'Inter','Noto Sans TC',system-ui,sans-serif`
- **Mono (filenames / code / timestamp)**: `'JetBrains Mono',ui-monospace,monospace`
- **System sans (for plain UI mock)**: `system-ui,sans-serif`
- **Title size**: 13-14px, font-weight 800, letter-spacing 3
- **Body size**: 12-14px, font-weight 500-700
- **Mono size**: 12-14px, font-weight 700

### Canvas dimensions

- **Body images**: `viewBox="0 0 1200 600"` (2:1 aspect, fits Hugo `image-1.svg` standard)
- **Cover**: `viewBox="0 0 1600 900"` (16:9, not in scope here)

### Standard composition

1. Outer rect `1200×600 fill="url(#g-paper)"` + same rect `fill="url(#grid)"` overlay
2. Centered title at `y=48`, dark indigo, letter-spaced caps
3. Main content group(s) inside white cards with `filter="url(#shadow)"`, padding ≥ 40px
4. Card header bars use `fill="url(#g-indigo)"` with white text

---

## 3. File naming convention

```
content/{locale}/post/{slug}/image-{N}.svg
```

Where:
- `{locale}` ∈ `english, zh-tw, zh-cn, ja, ko, it`（en uses `english/`, not `en/`）
- `{slug}` = article slug (kebab-case)
- `{N}` = 1-based image index in article reading order

Each image is **per-locale** because text labels are translated. Source SVG (zh-TW) is master; other 5 locales are text-swap derivatives.

In the Markdown body, reference via Hugo standard image syntax:

```markdown
![{alt-text-per-locale}](image-{N}.svg)
```

Alt text: per-locale, ≤ 125 char, describes the data not the visuals (SEO + screen reader).

---

## 4. Article 1 — `3-2-1-backup-rule`

**File path target**: `content/{locale}/post/3-2-1-backup-rule/image-{N}.svg`

**Current state**: 2 IMAGE placeholders at L64 (`{{IMAGE-1}}`) and L113 (`{{IMAGE-2}}`) already in 5 locales (en / zh-tw / zh-cn / ja / ko). **No `it` locale exists yet** — confirm with author before locking IT design pass.

| # | Insertion point | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | L64 (existing `{{IMAGE-1}}`) | **P1** | Canonical 3-2-1 triangle | 等腰三角形三節點：**3 份檔案**（疊圖示）／**2 種媒介**（💾 NAS + ☁️ 雲）／**1 份異地**（📍 → 第二地點箭頭）。底註「Peter Krogh, 2005」。風格：白底 + indigo 主色 + amber 線條重點。 |
| 2 | New, after L81（H2 #2 結尾「3-2-1 沒處理檔案還在但變錯了」） | **P1** | 盾牌 vs 漏網 對偶圖 | 左欄 success 綠 ✅：硬碟摔壞／機房失火／勒索軟體；右欄 danger 紅 ❌：自己覆蓋／同事改錯／找 3 個月前舊版。中間分割線。L72 對照表的視覺化雙胞胎。 |
| 3 | New, after L89（「3 變成同一個錯誤被即時複製到 3 個位置」） | **P1** | 空間 vs 時間冗餘 對比圖 | 上半：3 個圓並排，每個都標「今天最新」← 空間冗餘但同一錯版本；下半：時間軸 ─●─●─●─●─，標今天／30 天前／90 天前／180 天前 ← 時間冗餘。對應 article 核心 insight。 |
| 4 | L113 (existing `{{IMAGE-2}}`) | P1 | Keeply 三層 stacked bar | 三層橫條：**位置層**（本機 ／ 正本 ／ 備援 3 icons）／**時間層**（時間軸 icon）／**凍結層**（🔒 發行版 icon）。每層用不同 indigo 飽和度區分。 |

**Action**: 替換 L64 / L113 既有 placeholder 為 `![alt](image-1.svg)` / `![alt](image-4.svg)`；L81 / L89 後新增 placeholder + 對應 image-2.svg / image-3.svg。

---

## 5. Article 2 — `cloud-version-history-cliff`

**File path target**: `content/{locale}/post/cloud-version-history-cliff/image-{N}.svg`

**Current state**: 1 對照表（L48-53）+ 1 ASCII timeline（L98-105）+ 0 placeholder + 0 image. Article has all 6 locales (en/zh-tw/zh-cn/ja/ko/it).

| # | Insertion point | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | New, after L55（「你想 apple-to-apple 比都比不了」H2 #1 末段） | **P1** | Cliff drop diagram (title metaphor) | 4 條水平時間軸並排（iCloud / Dropbox / OneDrive / Google Drive），每條標各自的 cliff 點（瞬間斷崖／30·180·365 天／500 versions／30 天+100 versions），下方標一個「客戶要的 60 天前那版 📍」位置——4 條全在 cliff 之外。Danger red 標 cliff，amber 標客戶 marker。 |
| 2 | New, after L69（「Cap 形狀不一樣。比較文從沒告訴你哪個形狀符合你的工作」H2 #2 末段） | **P1** | 三種 cap 形狀對比 | 三格並排：左格 **時間制**（時間軸切片 30/180/365 天）／中格 **計數制**（500 方格網格，舊的灰掉）／右格 **混合制**（時間軸 × 計數雙 cap）。每格頂部標品牌 logo 提示。 |
| 3 | New, after L96（「兩個月前的版本，回溯約 2 個點擊」L98 ASCII 之前） | P2 | 兩層 stack 架構圖 | 上層雲端同步層（iCloud / Dropbox / OneDrive / Google Drive 4 logo 並排）標「有 cap」(danger red border)；下層版本歷史層（Keeply 時間軸 icon）標「無 cap」(success green border)；兩層橋接箭頭標「每次存檔自動觸發」。 |

**Action**: 全部新增。ASCII timeline at L98-105 keep（BWF P1.21 trust signal，不替代）。

---

## 6. Article 3 — `thesis-single-point-of-failure`

**File path target**: `content/{locale}/post/thesis-single-point-of-failure/image-{N}.svg`

**Current state**: 1 對照表（L97-103）+ 0 ASCII + 0 placeholder + 0 image. Article has all 6 locales.

| # | Insertion point | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | New, after L51（hook 結尾「從這個下午開始，不是了」H2 #1 之前） | **P1** | Single Point of Failure 經典圖 | 中央 1 台筆電圖示，內標 `thesis_final_v7.docx`。8 條輸入線散射進來：☕ 咖啡潑／💾 SSD 壞／🎒 筆電遺失／👨‍🏫 教授要 v5／❓ v5 v6 差異忘了／📚 引用被質疑／📝 章節結構變更歷程／🎓 口試「為什麼這樣改」。標題「所有風險都匯集在這一份」。中央用 g-indigo，箭頭用 amber，risk label 用 danger surface 卡片。 |
| 2 | New, after L115（「PDF 是結果。時間線是過程。」H2 #3 中段） | **P1** | 文件 vs 時間線 對比圖 | 左半：📄 一張 PDF + 旁邊散落 `v1 v2 v3 真的最終.docx` 檔案圖示 → 標「**文件 = 結果**」。右半：橫向時間軸 ─●─●─●─●─●─，每個 ● 標「11/1 章節重組 / 12/15 補論證 / 1/8 教授退回 / 2/3 第三章重寫 / 4/23 口試提交」→ 標「**時間線 = 過程**」。 |
| 3 | New, after L133（「要做的其實不多。四件事：」H2 #4 開頭） | P2 | 4 步流程圖 | 橫向流程或 2×2 grid：Step 1 📅 每日收工 `論文-0423.docx`／Step 2 📤 交教授前 `論文-0423-交教授.docx`／Step 3 🤖 工具自動「時間線 icon」／Step 4 💾 異地一份「☁️+💾」。底註「Step 1-2 靠意志力／Step 3-4 靠工具」。 |
| 4 | New, after L139（「點兩下就打得開」H2 #4 中段） | P2 | Word 檔名清單 vs Keeply 差異視圖 mock | Side-by-side：左 = 6-8 個 `thesis_v*.docx` 檔名清單 + 紅問號「v5 跟 v6 差在哪？」；右 = Keeply 時間軸 panel + 差異視圖 panel 打開，第三章某段文字紅刪綠新 inline diff。BWF P1.21 trust signal — 學術受眾。 |

**Action**: 全部新增。

---

## 7. 跨 locale 翻譯清單

每張圖內所有 SVG `<text>` 字串都要逐 locale 換。Brand name 不翻（Keeply / iCloud / Dropbox / OneDrive / Google Drive / Word / Pages / Numbers / Keynote / NAS）。檔名 string（如 `thesis_final_v7.docx`）每 locale 可微調用詞但保留 v7 / final 等英數結構。

### Master locale = zh-TW（all text labels above are zh-TW reference）

### Per-locale text label matrix

| Article × Image | zh-TW (master) | en | zh-CN | ja | ko | it |
|---|---|---|---|---|---|---|
| 3-2-1 #1 title | `3-2-1 備份原則` | `The 3-2-1 backup rule` | `3-2-1 备份原则` | `3-2-1 バックアップルール` | `3-2-1 백업 규칙` | `Regola di backup 3-2-1` |
| 3-2-1 #1 nodes | `3 份檔案 / 2 種媒介 / 1 份異地` | `3 copies / 2 media / 1 offsite` | `3 份文件 / 2 种媒介 / 1 份异地` | `3 つのコピー / 2 種類のメディア / 1 つのオフサイト` | `사본 3 / 매체 2 / 오프사이트 1` | `3 copie / 2 supporti / 1 fuori sede` |
| 3-2-1 #2 left header | `防得了 ✅` | `Covered ✅` | `防得了 ✅` | `カバー ✅` | `방어 가능 ✅` | `Coperto ✅` |
| 3-2-1 #2 right header | `防不了 ❌` | `Not covered ❌` | `防不了 ❌` | `カバー外 ❌` | `방어 불가 ❌` | `Non coperto ❌` |
| 3-2-1 #3 上半 label | `空間冗餘 — 3 份都最新` | `Spatial redundancy — all 3 are latest` | `空间冗余 — 3 份都最新` | `空間冗長性 — 3 つとも最新` | `공간 중복 — 3 부 모두 최신` | `Ridondanza spaziale — tutti e 3 sono l'ultima versione` |
| 3-2-1 #3 下半 label | `時間冗餘 — 過去每一刻都留版` | `Temporal redundancy — every past moment kept` | `时间冗余 — 过去每一刻都留版` | `時間冗長性 — 過去のあらゆる瞬間を保持` | `시간 중복 — 과거의 모든 순간 보존` | `Ridondanza temporale — ogni momento del passato salvato` |
| 3-2-1 #4 三層 label | `位置層 / 時間層 / 凍結層` | `Location / Time / Freeze layer` | `位置层 / 时间层 / 冻结层` | `位置層 / 時間層 / 凍結層` | `위치 층 / 시간 층 / 동결 층` | `Posizione / Tempo / Snapshot` |
| ─ | ─ | ─ | ─ | ─ | ─ | ─ |
| Cliff #1 title | `4 家雲端 retention 對比` | `Retention across 4 cloud services` | `4 家云端 retention 对比` | `4 つのクラウドの保持期間比較` | `클라우드 4 곳 보존 비교` | `Confronto retention 4 cloud` |
| Cliff #1 marker | `客戶要的 60 天前那版` | `The 60-days-ago version the client asks for` | `客户要的 60 天前那版` | `クライアントが求める 60 日前の版` | `클라이언트가 요청하는 60일 전 버전` | `La versione di 60 giorni fa richiesta dal cliente` |
| Cliff #1 cliff labels | `瞬間斷崖 / 30 天 / 180 天 / 365 天 / 500 versions / 30 天+100 versions` | `Instant cliff / 30 days / 180 days / 365 days / 500 versions / 30 days+100 versions` | `瞬间断崖 / 30 天 / 180 天 / 365 天 / 500 versions / 30 天+100 versions` | `即時崖 / 30 日 / 180 日 / 365 日 / 500 バージョン / 30 日+100 バージョン` | `즉시 절벽 / 30 일 / 180 일 / 365 일 / 500 버전 / 30 일+100 버전` | `Cliff istantaneo / 30 giorni / 180 giorni / 365 giorni / 500 versioni / 30 giorni+100 versioni` |
| Cliff #2 三格 header | `時間制 / 計數制 / 混合制` | `Time-based / Count-based / Hybrid` | `时间制 / 计数制 / 混合制` | `時間ベース / カウントベース / ハイブリッド` | `시간 기반 / 카운트 기반 / 하이브리드` | `Tempo / Conteggio / Ibrido` |
| Cliff #3 上層 label | `雲端同步層 — 有 cap` | `Cloud sync layer — has cap` | `云端同步层 — 有 cap` | `クラウド同期層 — cap あり` | `클라우드 동기화 층 — cap 있음` | `Livello sync cloud — con cap` |
| Cliff #3 下層 label | `版本歷史層 — 無 cap` | `Version history layer — no cap` | `版本历史层 — 无 cap` | `バージョン履歴層 — cap なし` | `버전 기록 층 — cap 없음` | `Livello version history — senza cap` |
| Cliff #3 橋接 label | `每次存檔自動觸發` | `Triggered on every save` | `每次存档自动触发` | `保存ごとに自動発火` | `저장할 때마다 자동 트리거` | `Si attiva ad ogni salvataggio` |
| ─ | ─ | ─ | ─ | ─ | ─ | ─ |
| Thesis #1 center file | `thesis_final_v7.docx` | `thesis_final_v7.docx` | `论文_final_v7.docx` | `thesis_final_v7.docx` | `thesis_final_v7.docx` | `tesi_final_v7.docx` |
| Thesis #1 title | `所有風險都匯集在這一份` | `All risks converge on this one file` | `所有风险都汇集在这一份` | `すべてのリスクがこの 1 つに集中` | `모든 리스크가 이 한 파일에 모임` | `Tutti i rischi convergono su questo file` |
| Thesis #1 8 risks | `咖啡潑 / SSD 壞 / 筆電遺失 / 教授要 v5 / v5 v6 差異忘了 / 引用被質疑 / 章節變更歷程 / 口試「為什麼這樣改」` | `Coffee spill / SSD failure / Laptop lost / Advisor wants v5 / Forgot v5 vs v6 diff / Citation challenged / Chapter restructure history / Defense "why did you change this"` | `咖啡泼 / SSD 坏 / 笔记本丢失 / 教授要 v5 / v5 v6 差异忘了 / 引用被质疑 / 章节变更历程 / 答辩「为什么这样改」` | `コーヒーこぼし / SSD 故障 / ノート PC 紛失 / 指導教員が v5 を要求 / v5 v6 の違いを忘れた / 引用への疑問 / 章構成の変更履歴 / 口頭試問「なぜこう変えた」` | `커피 쏟음 / SSD 고장 / 노트북 분실 / 지도교수가 v5 요청 / v5 v6 차이 잊음 / 인용 의문 / 챕터 변경 이력 / 구두시험 "왜 이렇게 바꿨나"` | `Caffè versato / Guasto SSD / Laptop perso / Relatore vuole v5 / Dimenticato diff v5 v6 / Citazione contestata / Cronologia revisione capitoli / Discussione "perché hai cambiato"` |
| Thesis #2 左 label | `文件 = 結果` | `Document = Result` | `文件 = 结果` | `文書 = 結果` | `문서 = 결과` | `Documento = Risultato` |
| Thesis #2 右 label | `時間線 = 過程` | `Timeline = Process` | `时间线 = 过程` | `タイムライン = プロセス` | `타임라인 = 과정` | `Timeline = Processo` |
| Thesis #2 軌跡節點 | `11/1 章節重組 / 12/15 補論證 / 1/8 教授退回 / 2/3 第三章重寫 / 4/23 口試提交` | `11/1 Restructure / 12/15 Add argument / 1/8 Advisor rejection / 2/3 Ch.3 rewrite / 4/23 Defense submission` | `11/1 章节重组 / 12/15 补论证 / 1/8 教授退回 / 2/3 第三章重写 / 4/23 答辩提交` | `11/1 章再構成 / 12/15 論拠追加 / 1/8 指導教員差し戻し / 2/3 第 3 章書き直し / 4/23 口頭試問提出` | `11/1 챕터 재구성 / 12/15 논거 추가 / 1/8 지도교수 반려 / 2/3 3 장 재작성 / 4/23 구두시험 제출` | `1/11 Ristrutturazione / 15/12 Argomento aggiuntivo / 8/1 Relatore rifiuta / 3/2 Riscrittura cap.3 / 23/4 Discussione finale` |
| Thesis #3 4 steps | `每日收工 / 交教授前 / 工具自動 / 異地一份` | `Daily wrap / Before advisor / Tool auto / One offsite` | `每日收工 / 交教授前 / 工具自动 / 异地一份` | `日次終了 / 指導教員提出前 / ツール自動 / オフサイト 1 部` | `매일 마감 / 지도교수 제출 전 / 도구 자동 / 오프사이트 1 부` | `Fine giornata / Prima del relatore / Auto da tool / Una fuori sede` |
| Thesis #3 底註 | `Step 1-2 靠意志力 / Step 3-4 靠工具` | `Steps 1-2 by willpower / Steps 3-4 by tool` | `Step 1-2 靠意志力 / Step 3-4 靠工具` | `Step 1-2 は意志力 / Step 3-4 はツール` | `Step 1-2 의지력 / Step 3-4 도구` | `Step 1-2 con forza di volontà / Step 3-4 con il tool` |
| Thesis #4 左 question | `v5 跟 v6 差在哪？` | `What's different between v5 and v6?` | `v5 跟 v6 差在哪？` | `v5 と v6、どこが違う？` | `v5 와 v6, 어디가 달라?` | `Qual è la differenza tra v5 e v6?` |

**Translation acceptance**: en / zh-CN 文案直接照表用。**ja / ko / it 建議走 native polish pass**（同 cover.svg per-locale 翻譯 SOP，memory `feedback_cover_per_locale.md`）。

---

## 8. Alt-text matrix（per image, per locale）

Alt-text 規則：≤ 125 char，描述「圖表呈現的資料」非「視覺要素」（SEO + a11y）。

| Image | zh-TW alt |
|---|---|
| 3-2-1 #1 | `3-2-1 備份原則三角形圖示：3 份檔案、2 種儲存媒介、1 份異地，Peter Krogh 2005 訂下的攝影師備份規則` |
| 3-2-1 #2 | `3-2-1 規則防得了硬碟摔壞、機房失火、勒索軟體，防不了你自己覆蓋、同事改錯、找 3 個月前舊版` |
| 3-2-1 #3 | `3 份備份是空間冗餘（同一錯誤被複製 3 次），不是時間冗餘（每一刻都留版）—— 2026 年的核心盲點` |
| 3-2-1 #4 | `Keeply 三層保護：位置層（本機 + 正本 + 備援）、時間層（自動版本歷史）、凍結層（Release 發行版）` |
| Cliff #1 | `iCloud / Dropbox / OneDrive / Google Drive 4 家雲端 retention cliff 並排比較，60 天前的客戶版本在 4 條 cliff 之外` |
| Cliff #2 | `Dropbox 時間制 30/180/365 天、OneDrive 計數制 500 版本、Google Drive 混合制 30 天 OR 100 版本，3 種 cap 形狀對比` |
| Cliff #3 | `雲端同步層（4 家 logo）負責 sync 但有 cap；版本歷史層（Keeply）負責每次存檔留版、無 cap；兩層疊加架構` |
| Thesis #1 | `碩士論文單點故障：thesis_final_v7.docx 一檔承擔咖啡、SSD、教授要舊版、引用質疑、口試問答等 8 個風險` |
| Thesis #2 | `論文不是一份 PDF 文件（結果），是一條從章節重組到口試提交的時間線（過程）` |
| Thesis #3 | `論文版本管理 4 步：每日收工存日期檔、交教授前獨立留檔、工具自動每次留版、異地至少一份不在筆電` |
| Thesis #4 | `傳統檔名 thesis_v1/v2/v3 看不出 v5 跟 v6 差在哪；Keeply 時間軸 + 差異視圖兩下打開逐字 diff` |

**Hugo frontmatter sync**：`image_alt_data` 欄位是 cover 用，不是 body image alt。Body image alt 寫在 markdown `![alt](image-N.svg)` 的 `[alt]` 槽，per-locale 各自寫。

---

## 9. Production checklist (per image)

每張圖交付前 designer 跑：

- [ ] viewBox `0 0 1200 600`
- [ ] `<defs>` 標準 block 已貼（g-indigo / g-amber / g-paper / grid / shadow）
- [ ] 背景 = paper gradient + grid pattern
- [ ] 主內容卡片 `filter="url(#shadow)"`
- [ ] 標題用 `#312E81` + `font-weight=800` + `letter-spacing=3`
- [ ] 檔名 / 時間戳用 mono 字型
- [ ] **無 hard-coded English label**（zh-TW 版除品牌名外全中文）
- [ ] 對應 alt-text 已寫進 markdown `![alt](image-N.svg)` 槽
- [ ] 6 locale × image count = N 份 SVG 全部交付（en / zh-cn / ja / ko / it 文字 swap）
- [ ] 檔案大小 < 50 KB（純向量、無嵌入點陣）
- [ ] 在 macOS Safari + Chrome + iOS Safari 三處檢視 render 一致

---

## 10. Insertion checklist (per article, per locale)

Article-level acceptance：

- [ ] 6 個 locale 對應 article 目錄都收到 N 張 image SVG
- [ ] markdown 插入點與 brief 第 4 / 5 / 6 節對齊（行數可能因 voice refactor 略動，以 H2 + 段落 anchor 為準，不依賴行號）
- [ ] 既有 `{{IMAGE-N}}` placeholder（僅 3-2-1）已替換為 `![alt](image-N.svg)`
- [ ] Hugo `hugo --gc --minify` exit 0
- [ ] 本機 `hugo server` 開 6 locale × 3 article = 18 URL 視覺檢查
- [ ] Lighthouse mobile：LCP image 不應是 body image-1（cover.svg 仍應優先），確認 `loading="lazy"` 自動加上（Hugo render-image hook）
- [ ] 提交 commit：`feat(content): tier-s image insertions × 3 articles × 6 locales`
- [ ] Push 後跑 N×6 URL HTTP 200 矩陣（CLAUDE.md Deploy SOP 第 e 段）

---

## 11. Out of scope（this brief 不處理）

- Cover.svg 更新（已 ship，per-locale 已完成）
- Tier A / B / C 12 篇文章（後續另起 brief）
- Image 點陣化 fallback（純 SVG inline，現代瀏覽器全支援）
- Dark mode variant（hugo-theme-stack 目前無 dark mode toggle）
- Animation / interactive SVG（純靜態）
- 真實 product screenshot 截圖（這份 brief 全部是 mock / diagram；真 UI 截圖屬於另一類資產）

---

## 12. Open questions（before kickoff）

1. **`3-2-1-backup-rule` 是否擴展 it locale？** 目前該 article 只有 5 locale，其他 Tier S 兩篇都已有 6 locale。確認後 it 一起做 / 一起跳。
2. **Designer 端是手繪 SVG 還是用工具（Figma / Illustrator）匯出？** 影響 `<defs>` 重用方式 — 如果走 Figma export，Brand defs 可能要做成 Symbol component。
3. **`thesis-single-point-of-failure` #1 SPOF 圖的 8 個 risk emoji 是否可接受？** 替代方案：每個 risk 改用 minimal line icon（Lucide / Tabler 風格）。
4. **Image 命名是否要含 slug prefix？** 例如 `image-1.svg` vs `3-2-1-image-1.svg`。Hugo page bundle 內 image 是 scoped 不會衝突，建議 keep 簡潔 `image-1.svg`（對齊 reference article what-keeply-saves-vs-backup-cloud）。

---

---

# Part 2 — Tier A append (2026-05-13)

Tier A 是 4 篇 high-traffic-intent 文章，視覺 ROI 略低於 Tier S（標題沒直接 metaphor 化），但搜尋意圖強、how-to / 比較 / mock UI 角色明確。共 14 張新圖。

| Slug | 字數 | 角色 | 圖數 | 既有視覺資產 |
|---|---|---|---|---|
| `hidden-cost-shared-folders` | 10.2K | Pillar cluster | 4 | 5 工具對照表（L85-90） + ✅❌ trust signal（L94-95） |
| `recover-overwritten-file` | 9.3K | Cluster | 3 | 5 機制對照表（L70-76） |
| `deleted-files-recovery-list` | 9.8K | Cluster | 3 | 11 row 工具表（L50-62） + ASCII 刪除清單 mock（L92-103） |
| `photoshop-autosave-not-version-history` | 11.4K | Cluster (designer) | 4 | 2 機制對照表（L45-48） |

---

## 13. Article 4 — `hidden-cost-shared-folders`

**File path target**: `content/{locale}/post/hidden-cost-shared-folders/image-{N}.svg`

**Current state**: 0 placeholder + 0 image + 1 對照表 + ✅❌ checklist。Article has all 6 locales.

| # | Insertion point | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | New, after L42（hook 結尾「你是在買保險」H2 #1 之前） | **P1** | 「v7 FINAL 千萬別動」資料夾 mock 截圖 | Mock macOS Finder / Windows Explorer 資料夾畫面，列 8-10 個 .dwg 檔：`Floorplan_v6.dwg` / `Floorplan_v7_Client.dwg` / `Floorplan_v7_FINAL_千萬別動.dwg` / `Floorplan_v8_送審版_0423.dwg` / `Floorplan_v8_真的最終.dwg` / `Floorplan_v8_FINAL_NEW.dwg` / `Floorplan_v8_老闆改完.dwg` 等。Iconic pain visual — article hook 一張就懂。 |
| 2 | New, after L61（「保護心血的責任全推到脆弱記憶力」H2 #1 中段） | P2 | 83 小時防禦稅 breakdown 圖 | 圓環圖或橫條圖：1 年 52 週 × 1.6 hr/week = 83 hr。標 Asana 來源。視覺對比「83 hr ≈ 兩週工作時間」or「83 hr = 你可以多畫 10 個案子」。 |
| 3 | New, after L74（命名規則一定崩潰結尾 H2 #2 末段） | P2 | 命名規則崩潰 timeline | 6 週時間軸：Week 1「全部門很乖」（綠）→ Week 2-5（綠變黃）→ Week 6「有人趕件存 `_NEW`」（橙）→ Week 12「資料夾變回垃圾山」（紅）。底註「紀律會被趕件擊穿，機制不會」。 |
| 4 | New, after L81（「3 秒鐘把版本拉回原狀」H2 #3 中段） | **P1** | Before/After 資料夾對比 | 左：垃圾山 8-10 個 v8_FINAL 檔；右：乾淨 `Floorplan.dwg` `Brand_Brief.psd` `Budget.xlsx` 3 檔 + Keeply 時間軸 panel 在側邊顯示 8+ 版本快照。對應 article solution 段最強 share 視覺。 |

**Action**: 全部新增。對照表 L85-90 keep。✅❌ trust signal L94-95 keep（BWF P1.21 not in image scope）。

---

## 14. Article 5 — `recover-overwritten-file`

**File path target**: `content/{locale}/post/recover-overwritten-file/image-{N}.svg`

**Current state**: 0 placeholder + 0 image + 1 對照表（5 機制 × 4 col）。Article has 5 locales（it 未列）— 確認是否擴 6 locale。

| # | Insertion point | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | New, after L78（5 機制對照表「沒有一個能結構性救到正常關閉後覆蓋」H2 #2 末段） | **P1** | 5 機制邊界 視覺對偶圖 | 5 機制橫向卡片：AutoRecover / OneDrive 版本歷史 / Windows 以前的版本 / 資料復原軟體 / Time Machine。每張卡上半綠色「✅ 救得到」/ 下半紅色「❌ 救不到」。對應 L70-76 對照表的圖像版（表是資料、圖是 mental model）。 |
| 2 | New, after L90（「事後救援依賴發現時機」H2 #3 末段） | **P1** | 發現時機 decay 曲線 | X 軸：覆蓋後時間（0 sec / 5 min / 30 min / 1 hr / 1 day / 1 week）；Y 軸：救回成功率（100% → 0%）。多條曲線：AutoRecover（檔案關閉瞬間掉到 0）/ 資料復原軟體 HDD（緩降）/ 資料復原軟體 SSD TRIM（陡降）。最下方一條 Keeply 平直 100% 線 + 標「事前防禦不依賴發現」。 |
| 3 | New, after L98（「3 秒回到 19:00 版本」H2 #4 中段） | P2 | A 先生 vs B 小姐 場景對比 | 左半「沒事前防禦」：A 先生週五 19:30 覆蓋 → 試 AutoRecover ❌ → 試 Recuva ❌ → 週一前剩 60 hr → 焦慮 timeline；右半「有事前防禦」：B 小姐週一發現覆蓋 → 開 Keeply → 看到 19:00 / 19:15 / 19:30 三版本 → 點 19:00 → 3 秒還原 ✅。 |

**Action**: 全部新增。對照表 L70-76 keep。

---

## 15. Article 6 — `deleted-files-recovery-list`

**File path target**: `content/{locale}/post/deleted-files-recovery-list/image-{N}.svg`

**Current state**: 0 placeholder + 0 image + 11 row 工具表（L50-62）+ ASCII 刪除清單 mock（L92-103）。Article has all 6 locales。

| # | Insertion point | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | New, after L64（11 row 工具表「下半部就是你日常保存真實工作的地方」H2 #1 末段） | **P1** | 「最近刪除」UX pattern split | 上下兩半：上半「**有清單** ✅」6 個 app card（iOS 照片 / iCloud Drive / 備忘錄 / Outlook / Gmail / Slack），下半「**沒有清單** ❌」4 個 app card（Finder / 檔案總管 / Dropbox 本機 / Google Drive 本機同步）。視覺強化 article thesis: 「pattern 偏偏缺在你最需要的地方」。 |
| 2 | New, after L76（「鑑識軟體訂價頁面」H2 #2 末段） | **P1** | Curated vs File-system mirror mental model 對比 | 左半「Curated app」：📷 內容 → 你跟內容互動 → 「最近刪除」是內容管理基本元件；右半「File-system mirror」：📁 磁碟內容 → 透明反映 → 加面板會違反透明契約。橋接箭頭顯示「設計選擇 → 救援摩擦差異」。 |
| 3 | New, after L88（「不需要鑑識」H2 #3 中段，在 L92 ASCII mock 之前） | P2 | 救援路徑長度對比圖 | 3 條時間軸 / 路徑：A 路徑「有清單一鍵還原」5 sec ✅；B 路徑「時間軸翻找」5 min ⚠️；C 路徑「Google → Disk Drill $89 → 2 hr 掃描 → SSD TRIM 可能失敗」⏰❌。對應 L80「救援大約 5 秒 vs 5 分鐘 vs 89 美金 2 小時」。 |

**Action**: 全部新增。對照表 L50-62 keep。ASCII mock L92-103 keep（BWF P1.21 trust signal — 工程受眾不替代）。

---

## 16. Article 7 — `photoshop-autosave-not-version-history`

**File path target**: `content/{locale}/post/photoshop-autosave-not-version-history/image-{N}.svg`

**Current state**: 0 placeholder + 0 image + 1 機制對照表（L45-48，2 row 自動儲存 vs 版本歷史）。Article has all 6 locales。

| # | Insertion point | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | New, after L23（hook 結尾「打開資料夾什麼都沒有」H2 #1 之前） | **P1** | Photoshop AutoRecover 資料夾 mock 截圖 | Mock macOS Finder 視窗，路徑顯示 `~/Documents/Adobe/AutoRecover/`，內容**空的**（或只有上週二一個舊 `.psb`，灰階）。底註「今天的工作從來沒被寫進去」。Iconic visual — article hook 視覺化。 |
| 2 | New, after L54（「上千篇文章答另一個容易答的問題」H2 #2 末段） | **P1** | 3 種 Photoshop 機制邊界圖 | 3 個橫向卡片：**自動儲存**（💥 觸發=當機 / 救=記憶體狀態 / 內建=✅ / 救蓋掉版本=❌）／**歷史紀錄面板**（🖱️ 觸發=每動作 / 救=session undo / 內建=✅ / 跨檔案關閉=❌）／**檔案層級版本歷史**（💾 觸發=每 Cmd+S / 救=每存檔快照 / 內建=❌ / 救蓋掉版本=✅）。最後一張紅 X 是 article 的 information gain。 |
| 3 | New, after L70（歷史紀錄面板「動作序列」結尾 H2 #3 末段） | P2 | 歷史紀錄面板 vs Keeply 對比 mock UI | 左：Photoshop 歷史紀錄面板 panel mock，列 20 個今早動作步驟 + 標「檔案一關就蒸發」；右：Keeply 時間軸 panel mock，列 6 個 Cmd+S 留版本 + 標「永久保留 / 跨 session」。BWF P1.21 trust signal — 設計師受眾。 |
| 4 | New, after L88（「30 秒結束」H2 #4 末段） | P2 | Cmd+S 時間軸對比 | 同一個 PSD 檔案，兩條時間軸並排：上「Adobe 內建層」每次 Cmd+S 覆蓋同一個磁碟位置（標「無歷史」）；下「Keeply 補的層」每次 Cmd+S 各留一份快照（5-6 個時間點），客戶要的 v2 在 30 分鐘前可還原。橋接箭頭「兩層各管一段，並排運作」。 |

**Action**: 全部新增。對照表 L45-48 keep。

---

## 17. Tier A 跨 locale 翻譯清單

延續第 7 節 master 規則：zh-TW master，en / zh-CN 表內直填，ja / ko / it 走 native polish pass。

| Article × Image | zh-TW (master) | en |
|---|---|---|
| Shared-folders #1 file names | `Floorplan_v6.dwg / Floorplan_v7_Client.dwg / Floorplan_v7_FINAL_千萬別動.dwg / Floorplan_v8_送審版_0423.dwg / Floorplan_v8_真的最終.dwg / Floorplan_v8_FINAL_NEW.dwg / Floorplan_v8_老闆改完.dwg` | `Floorplan_v6.dwg / Floorplan_v7_Client.dwg / Floorplan_v7_FINAL_DO_NOT_TOUCH.dwg / Floorplan_v8_submission_0423.dwg / Floorplan_v8_really_final.dwg / Floorplan_v8_FINAL_NEW.dwg / Floorplan_v8_boss_edited.dwg` |
| Shared-folders #2 title | `知識工作者 1 年花在「關於工作的工作」` | `Hours/year spent on "work about work"` |
| Shared-folders #2 callout | `83 小時 ≈ 2 個工作週` | `83 hours ≈ 2 work weeks` |
| Shared-folders #3 timeline | `Week 1 全部門很乖 / Week 6 有人趕件存 _NEW / Week 12 資料夾變回垃圾山` | `Week 1 Team disciplined / Week 6 Someone rushed, saves _NEW / Week 12 Folder back to garbage mountain` |
| Shared-folders #3 底註 | `紀律會被趕件擊穿，機制不會` | `Discipline buckles under deadline pressure. Mechanism doesn't.` |
| Shared-folders #4 左欄 | `Floorplan_v8_FINAL_千萬別動 ×8` | `Floorplan_v8_FINAL_DO_NOT_TOUCH ×8` |
| Shared-folders #4 右欄 | `Floorplan.dwg + Keeply 時間軸 8 版本` | `Floorplan.dwg + Keeply timeline 8 versions` |
| ─ | ─ | ─ |
| Recover #1 5 cards | `AutoRecover / OneDrive 版本歷史 / Windows 以前的版本 / 資料復原軟體 / Time Machine` | `AutoRecover / OneDrive Version History / Windows Previous Versions / Data Recovery Software / Time Machine` |
| Recover #1 ✅❌ label | `救得到 ✅ / 救不到 ❌` | `Covers ✅ / Doesn't ❌` |
| Recover #2 X 軸 | `覆蓋後時間 — 0 / 5 min / 30 min / 1 hr / 1 day / 1 week` | `Time after overwrite — 0 / 5 min / 30 min / 1 hr / 1 day / 1 week` |
| Recover #2 Y 軸 | `救回成功率` | `Recovery success rate` |
| Recover #2 曲線 label | `AutoRecover（關檔即 0）/ Recovery SW HDD（緩降）/ Recovery SW SSD TRIM（陡降）/ Keeply 事前防禦（持平 100%）` | `AutoRecover (drops to 0 on close) / Recovery SW HDD (gradual) / Recovery SW SSD TRIM (steep drop) / Keeply pre-emptive (flat 100%)` |
| Recover #2 底註 | `事前防禦不依賴發現的時機` | `Pre-emptive protection doesn't depend on when you notice` |
| Recover #3 左欄 | `A 先生（沒事前防禦）— 19:30 覆蓋 → AutoRecover ❌ → Recuva ❌ → 剩 60 hr 焦慮` | `Mr. A (no pre-emptive) — 19:30 overwrite → AutoRecover ❌ → Recuva ❌ → 60 hr panic` |
| Recover #3 右欄 | `B 小姐（用 Keeply）— 週一發現 → 開 Keeply → 19:00/19:15/19:30 三版本 → 點 19:00 → 3 秒還原 ✅` | `Ms. B (with Keeply) — Monday notice → Open Keeply → 19:00/19:15/19:30 three versions → click 19:00 → 3 sec restore ✅` |
| ─ | ─ | ─ |
| Deleted-list #1 上半 | `有清單 ✅ — iOS 照片 / iCloud Drive / 備忘錄 / Outlook / Gmail / Slack` | `Has list ✅ — iOS Photos / iCloud Drive / Notes / Outlook / Gmail / Slack` |
| Deleted-list #1 下半 | `沒有清單 ❌ — Finder / 檔案總管 / Dropbox 本機 / Google Drive 本機` | `No list ❌ — Finder / File Explorer / Dropbox local / Google Drive local` |
| Deleted-list #1 底註 | `Pattern 偏偏缺在你最需要的地方` | `The pattern is missing exactly where you need it most` |
| Deleted-list #2 左欄 | `Curated app — 跟內容互動 — 「最近刪除」= 基本元件` | `Curated app — interacting with content — "Recently Deleted" = essential element` |
| Deleted-list #2 右欄 | `File-system mirror — 透明反映磁碟 — 加面板違反契約` | `File-system mirror — transparent disk reflection — adding panel breaks contract` |
| Deleted-list #2 橋接 | `設計選擇 → 救援摩擦差異` | `Design choice → recovery friction gap` |
| Deleted-list #3 三路徑 | `A: 有清單 → 1 鍵 → 5 秒 ✅ / B: 時間軸翻找 → 5 分鐘 ⚠️ / C: Disk Drill $89 → 2 小時 → SSD TRIM 可能失敗 ⏰❌` | `A: Has list → 1-click → 5 sec ✅ / B: Timeline search → 5 min ⚠️ / C: Disk Drill $89 → 2 hr → SSD TRIM might fail ⏰❌` |
| ─ | ─ | ─ |
| Photoshop #1 path | `~/Documents/Adobe/AutoRecover/` | `~/Documents/Adobe/AutoRecover/` |
| Photoshop #1 底註 | `今天的工作從來沒被寫進去` | `Today's work was never written here` |
| Photoshop #2 3 機制 title | `自動儲存 / 歷史紀錄面板 / 檔案層級版本歷史` | `Auto-Save / History Panel / File-level Version History` |
| Photoshop #2 觸發 label | `當機 / 每動作 / 每 Cmd+S` | `On crash / On each action / On each Cmd+S` |
| Photoshop #2 內建 label | `內建 ✅ ✅ ❌` | `Built-in ✅ ✅ ❌` |
| Photoshop #2 救蓋掉版本 label | `救蓋掉版本 ❌ ❌ ✅` | `Saves overwritten versions ❌ ❌ ✅` |
| Photoshop #3 左 | `Photoshop 歷史紀錄面板 — 20 個今早動作 — 檔案一關就蒸發` | `Photoshop History Panel — 20 actions this morning — vanishes when file closes` |
| Photoshop #3 右 | `Keeply 時間軸 — 6 個 Cmd+S 快照 — 永久保留 / 跨 session` | `Keeply timeline — 6 Cmd+S snapshots — persistent / cross-session` |
| Photoshop #4 上層 | `Adobe 內建層 — 每次 Cmd+S 覆蓋同一位置 — 無歷史` | `Adobe built-in — each Cmd+S overwrites same location — no history` |
| Photoshop #4 下層 | `Keeply 補的層 — 每次 Cmd+S 各留快照 — 30 分鐘前可還原` | `Keeply complement — each Cmd+S keeps a snapshot — restorable to 30 min ago` |
| Photoshop #4 橋接 | `兩層各管一段，並排運作` | `Two layers, each handling its own segment, side-by-side` |

**Translation acceptance**: ja / ko / it 走 native polish pass。檔名字串例外：`Floorplan_*.dwg` 在每 locale 可微調用詞（`平面図_v6.dwg` / `평면도_v6.dwg` / `Pianta_v6.dwg`）但保留 v6/v7/FINAL 等英數結構。

---

## 18. Tier A Alt-text matrix

| Image | zh-TW alt |
|---|---|
| Shared-folders #1 | `共用資料夾現況：Floorplan_v6 到 Floorplan_v8_FINAL_NEW 等 8 個版本檔案堆積，無法分辨哪個是真正最新版` |
| Shared-folders #2 | `知識工作者一年花 83 小時做防禦性命名動作，約等於 2 個工作週，根據 Asana Anatomy of Work 研究` |
| Shared-folders #3 | `命名規則導入 6 週後一定崩潰：W1 全員配合、W6 趕件偷懶、W12 資料夾回到垃圾山——紀律敗給趕件壓力` |
| Shared-folders #4 | `Before：8 個 _FINAL 後綴檔；After：只剩主檔名 Floorplan.dwg + Keeply 時間軸 8 版本，3 秒還原任一版` |
| Recover #1 | `5 種事後救援機制邊界圖：AutoRecover / OneDrive / Windows 以前的版本 / 資料復原軟體 / Time Machine 各自救得到與救不到的場景` |
| Recover #2 | `事後救援成功率隨時間 decay：HDD 緩降、SSD TRIM 陡降、Keeply 事前防禦持平 100%——關鍵在發現時機` |
| Recover #3 | `A 先生（無事前防禦）週末 60 小時焦慮 vs B 小姐（用 Keeply）3 秒還原至 19:00 版本——差別在覆蓋發生前是否啟動` |
| Deleted-list #1 | `iOS 照片、iCloud Drive、Outlook 等 curated app 有「最近刪除」清單；Finder、檔案總管、Dropbox 本機沒有——缺在最需要的地方` |
| Deleted-list #2 | `Curated app 跟 file-system mirror 的設計目標不同——前者把內容當主角，後者把磁碟內容當主角，「最近刪除」這個 UX 元件只在前者出現` |
| Deleted-list #3 | `刪錯救援 3 條路徑：有清單 5 秒、時間軸翻找 5 分鐘、Disk Drill 鑑識掃描 2 小時且 SSD TRIM 可能失敗` |
| Photoshop #1 | `Photoshop AutoRecover 資料夾畫面：今天工作中沒當機，所以資料夾從頭到尾是空的——這是設計使然不是 bug` |
| Photoshop #2 | `Photoshop 3 種機制邊界：自動儲存為當機而生、歷史紀錄面板為 session undo 而生、檔案層級版本歷史 Photoshop 沒內建` |
| Photoshop #3 | `Photoshop 歷史紀錄面板檔案一關就蒸發 vs Keeply 時間軸永久保留每次 Cmd+S——session 內 vs 跨 session 的根本差別` |
| Photoshop #4 | `Cmd+S 之後：Adobe 內建層覆蓋同一磁碟位置（無歷史）；Keeply 補的層每次 Cmd+S 各留快照（30 分鐘前可還原）——兩層並排運作` |

---

## 19. Tier S + A 合計

| Tier | Articles | New images | Existing visual assets |
|---|---|---|---|
| S | 3 | 13 (P1 = 8 / P2 = 5) | 2 表 + 1 ASCII |
| A | 4 | 14 (P1 = 7 / P2 = 7) | 4 表 + 1 ASCII + 1 ✅❌ |
| **Total** | **7** | **27** | **5 表 + 2 ASCII + 1 ✅❌** |

Cross-locale multiplier: 27 images × 5-6 locales = **135-162 SVG 交付件**（master zh-TW + text-swap 5 locales）。

---

---

# Part 3 — Tier B / C / D append (2026-05-13)

Tier B (4 篇)、Tier C (4 篇)、Tier D (1 篇) 共 9 篇文章的圖補強 spec。視覺密度比 S/A 低，每篇 1-2 張即可——核心是「補關鍵 scene / mechanism / mock UI」，不是高密度圖文並茂。

| Tier | Articles | New images | 規則 |
|---|---|---|---|
| B | 4 | 8 (P1 = 4 / P2 = 4) | 1-2 imgs / article，補 hook scene + 1 個 mechanism 圖 |
| C | 4 | 4 (P2 only) | 1 img / article，補 1 個核心 mechanism |
| D | 1 | 1 (P3, optional) | 標 optional——founder note 散文性強，可純文字 |
| **合計** | **9** | **13** | — |

格式採縮減版：直接給 (locale 數 / insertion / type / spec) 表，跨 locale 翻譯走「文章內取自原文」原則（標籤 90% 已在文章 H2 或對照表內），下方只列**圖內 unique label 跟 1-line spec**，不重複完整翻譯矩陣。

---

## 20. Tier B specs（4 articles × 2 imgs）

### 20.1 `dropbox-conflicted-copy`（10.2K，6 locale，1 對照表 L46-51）

| # | Insertion | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | After L31（hook 結尾「30 分鐘檢查有沒有漏」H1 之前） | **P1** | `(conflicted copy)` 資料夾 mock 截圖 | Mac Finder mock 視窗，列 `提案.docx` + `提案 (Anna 的 conflicted copy 2026-05-02).docx` + `提案 (Bill 的 conflicted copy 2026-05-04).docx` 等 5-6 個衝突副本。底註「不是 bug，是設計」 |
| 2 | After L95（4 種場景結束 H2 #4 末段） | P2 | 3 種同步設計對比圖 | 3 個橫向卡片：**設計 A 偵測+提示**（兩端 → ⚠️ → 選擇）／**設計 B 檔案鎖定**（A 開 → 鎖🔒 → B 等）／**設計 C 本機+推送**（本機 → 推送鍵 → 雲端）。各標例子（Keeply A / SharePoint B / Keeply C） |

### 20.2 `excel-version-history-limits`（8.4K，6 locale，1 對照表 L52-57）

| # | Insertion | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | After L30（hook「按鈕是灰的」H1 之前） | **P1** | Excel「版本歷史」按鈕變灰 mock UI | Excel 桌面版「檔案 > 資訊」面板 mock，「版本歷史」按鈕**灰階 disabled**狀態，旁邊紅色 callout「需要 4 個條件全成立——你一個都沒中」 |
| 2 | After L46（4 條件 H2 #1 末段） | P2 | 4 條件 Venn 交集圖 | 4 個圓相交：① OneDrive / SharePoint ② AutoSave 開 ③ 商業版授權 ④ 桌面版（非網頁版）。中央交集標「✅ 按鈕亮」、外圍標「❌ 多數人都在這裡」 |

### 20.3 `autocad-wrong-version-crew`（12.6K，6 locale，1 ASCII L117-136）

| # | Insertion | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | After L101（H2 #3「辦公室跟現場那條最容易斷」末段） | **P1** | 三方時間軸 斷線圖 | 3 條平行時間軸：**設計**（出 v3 / v4 / v5）／**辦公室**（收 v3 / 漏收 v4 / 漏收 v5）／**工地**（用 v2 → 混凝土灌錯）。三條間用 ⚡ 標斷點：「辦公室→工地 斷」。對應 article core thesis |

**Action**: ASCII L117-136 保留（BWF P1.21 trust signal），新增此圖在 H2 #3 末段，視覺化「三方斷線」。

### 20.4 `client-asked-which-version`（10.2K，5 locale，1 對照表 L72-78；market hybrid en+ko primary）

| # | Insertion | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | After L42（hook「Keeply 用戶聊過最多次的」H1 之前） | **P1** | 11:23 客戶 LINE 訊息 mock + 檔案夾 | 上半：手機 LINE 對話泡泡 mock「3 月那版你寄我的提案可以再傳一份嗎？」（不寫真實人名，用「客戶」）；下半：桌面資料夾 mock 列 7 個 `_v3_FINAL` / `_v3_FINAL_v2` / `_v3_真的最終` 等檔，全部修改日期 ≥ 4 月。底註「3 月那版不在這裡」 |
| 2 | After L92（A 先生「3 個月後客戶問」H2 #3 末段） | P2 | 儲存層 vs 工具層 timeline 對比 | 兩條時間軸：上「儲存層」標 AutoRecover ●（檔案關閉清除）/ OneDrive ●●●●（30 天 / 500 版 cap）；下「工具層」標 Keeply ●●●●●●●●（無 cap，3 月那版仍在）。標客戶 LINE 來那一刻 📍 |

---

## 21. Tier C specs（4 articles × 1 img）

### 21.1 `version-control-software-non-developer`（8.5K，6 locale，1 對照表 L54-59）

| # | Insertion | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | After L61（H2 #2「git 是為文字程式碼設計」末段） | P2 | 4 要件 vs git/工具 grid | 4 行 × 4 列 grid：行 = 4 要件（檔案層 UI / 免 CLI / 大檔支援 / 直覺還原）；列 = git / Time Machine / Dropbox / Keeply。Cell 標 ✅❌⚠️ |

### 21.2 `too-many-file-versions`（8.3K，6 locale，1 對照表 L52-57）

| # | Insertion | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | After L87（H2 #4「4 種痛點 + 3 種設計」末段） | P2 | 痛點 → 設計 mapping 圖 | 左半 4 個 pain bubbles（誤覆蓋 / 客戶反饋輪 / 同步衝突 / autosave 殘留）→ 連線 → 右半 3 個 design bubbles（自動存檔點 / 里程碑凍結 / 單檔還原 / 工具教學）。Pain #4 連到「不在版本管理範圍」標灰色 |

### 21.3 `restore-without-panic`（7.7K，6 locale，0 對照表 0 ASCII）

| # | Insertion | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | After L58（H2 #1 「BitLocker 機率為零」末段） | **P1** | SSD + TRIM 機制動畫圖 | 3 階段橫向流程：(1) 你按 Delete → (2) OS 發送 TRIM 指令 → (3) SSD 區塊**立即標記空白可重用**（顯示磁區 grid，刪除位置變灰）。底註「救援軟體掃描看到的只剩一片零」。對應 article 唯一 mechanism insight |

### 21.4 `departing-employee-data-risk`（4.8K，5 locale，0 對照表 0 ASCII，short article）

| # | Insertion | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | After L41（hook「交不出東西給客戶」H2 #1 末段） | **P1** | 員工離職時間軸 incident timeline | 橫向時間軸 4 個節點：**週六 23:03** Tina 拖 `brand-book/` 進垃圾桶 + 清空 → **23:04** Dropbox 同步刪除動作到雲端 → **週一 09:00** 客戶來電要原稿 → **09:14** 你打開資料夾空的。每節點配 icon + 時間戳。底註「Dropbox 是同步不是備份」 |

---

## 22. Tier D specs（1 article × 1 img optional）

### 22.1 `why-i-built-keeply`（3.3K，6 locale，0 對照表 0 ASCII，founder note T6）

| # | Insertion | Priority | Image type | Spec |
|---|---|---|---|---|
| 1 | After L20（hook「混凝土打掉、工期延兩天」H2 #1 之前） | **P3 (optional)** | 工地 → 辦公室 → NAS 斷線 origin scene 圖 | 簡約 isometric 插畫：3 個場景並列——**工地**（師傅看舊圖施作）／**辦公室**（小李存進 NAS）／**設計師桌**（剛出新版寄出）。3 個場景之間用虛線連起來，標 ❌ 在「辦公室 → 工地」那段。風格用 Keeply brand color 線條 illustration（不要照片擬真） |

**Note**: T6 founder note 散文性強，圖**完全可選**——若資源不足或設計師時間緊，這篇可純文字 ship，不影響 article quality。但若做，#1 origin scene 視覺對「我為什麼做 Keeply」有 narrative leverage。

---

## 23. Tier B/C/D 跨 locale 翻譯註記

延續第 7 + 17 節 master 規則。Tier B/C/D 的圖內 text label **90% 直接從原文 H2 / 對照表 / 句子取詞**——designer 不用獨立翻譯，直接從每 locale article markdown 抓對應字串。

**唯一需要獨立翻譯的標籤**（不在原文內、是 designer 補的圖框框文字）：

| 標籤 | zh-TW master | en |
|---|---|---|
| Dropbox #1 底註 | `不是 bug，是設計` | `Not a bug, by design` |
| Excel #1 callout | `需要 4 個條件全成立——你一個都沒中` | `Requires all 4 conditions—you meet none` |
| Excel #2 中央 / 外圍 | `✅ 按鈕亮 / ❌ 多數人都在這裡` | `✅ Button enabled / ❌ Most people land here` |
| AutoCAD #1 斷點標籤 | `辦公室→工地 斷` | `Office → Site BROKEN` |
| Client-Word #1 底註 | `3 月那版不在這裡` | `The March version isn't here` |
| Restore #1 底註 | `救援軟體掃描看到的只剩一片零` | `Recovery software scans see only zeros` |
| Departing #1 底註 | `Dropbox 是同步不是備份` | `Dropbox is sync, not backup` |
| Why-built #1 ❌ 標籤 | `（這條線最容易斷）` | `(this link breaks most often)` |

ja / ko / it 走 native polish pass（同 §7 + §17 SOP）。

---

## 24. Tier B/C/D Alt-text matrix

| Image | zh-TW alt |
|---|---|
| Dropbox #1 | `Dropbox 資料夾出現 (Anna 的 conflicted copy) / (Bill 的 conflicted copy) 5-6 個衝突副本——不是 bug，是 Dropbox 設計上沒做衝突偵測的結果` |
| Dropbox #2 | `3 種同步設計對比：偵測+提示（Git-style）/ 檔案鎖定（SharePoint）/ 本機+推送（Keeply）——各自解掉的衝突場景不同` |
| Excel #1 | `Excel「檔案 > 資訊」面板的「版本歷史」按鈕變灰無法點擊——需要 4 個條件同時成立（OneDrive、AutoSave、商業版、桌面版）` |
| Excel #2 | `Excel 版本歷史 4 條件 Venn 交集圖——多數人的工作模式 4 個條件一個都沒中，按鈕灰是預設情況不是錯誤` |
| AutoCAD #1 | `設計 / 辦公室 / 工地三方時間軸——設計出 v5、辦公室漏收 v4 v5、工地仍按 v2 施工，斷點發生在「辦公室 → 工地」傳遞缺口` |
| Client-Word #1 | `週六 23:23 客戶 LINE 訊息「3 月那版可以再傳一份嗎」，搭配 7 個 _v3_FINAL 變體檔案全部 4 月後修改——3 月那版不在這裡` |
| Client-Word #2 | `儲存層（AutoRecover / OneDrive 30 天 / 500 版）vs 工具層（Keeply 無 cap）對 3 個月後客戶詢問的回應能力對比` |
| VCS-non-dev #1 | `4 要件 × 4 工具 grid：檔案層 UI / 免 CLI / 大檔支援 / 直覺還原——git / Time Machine / Dropbox / Keeply 各自滿足與不滿足` |
| Too-many #1 | `4 種版本痛點 → 3 種工具設計 mapping：誤覆蓋對應自動存檔點、客戶反饋輪對應里程碑凍結、同步衝突對應單檔還原、autosave 殘留不在版本管理範圍` |
| Restore #1 | `SSD TRIM 機制 3 階段：按 Delete → OS 發送 TRIM 指令 → SSD 區塊立即標記空白可重用——救援軟體掃描看到的只剩一片零` |
| Departing #1 | `員工離職 incident timeline：週六 23:03 拖垃圾桶清空 → 23:04 Dropbox 同步刪除 → 週一 09:00 客戶來電 → 09:14 資料夾是空的` |
| Why-built #1 | `Keeply 起源 scene：工地 / 辦公室 / 設計師桌 3 場景並列，斷線發生在「辦公室 → 工地」傳遞缺口——這是 Keeply 想補的 gap` |

---

## 25. Tier S + A + B + C + D 合計（最終 scope）

| Tier | Articles | New images | Priority distribution |
|---|---|---|---|
| S | 3 | 13 | P1 = 8 / P2 = 5 |
| A | 4 | 14 | P1 = 7 / P2 = 7 |
| B | 4 | 8 | P1 = 4 / P2 = 4 |
| C | 4 | 4 | P1 = 1 / P2 = 3 |
| D | 1 | 1 | P3 = 1 (optional) |
| **Total** | **16 articles** | **40 new images** | **P1 = 20 / P2 = 19 / P3 = 1** |

**Cross-locale multiplier**: 40 images × 5-6 locales (avg ~5.7) = **~228 SVG 交付件**（master zh-TW + text-swap 4-5 locales each）。

### 建議交付排程（取決於 designer 頻寬）

| 階段 | 範圍 | 圖數 | 估計工 |
|---|---|---|---|
| Sprint 1 | Tier S P1 (8 imgs × 6 locale = 48 SVG) | 48 | 1-2 週 |
| Sprint 2 | Tier A P1 (7 imgs × 5.5 locale ≈ 39 SVG) | 39 | 1-2 週 |
| Sprint 3 | Tier S+A P2 (12 imgs × 5.5 locale ≈ 66 SVG) | 66 | 2 週 |
| Sprint 4 | Tier B P1 + C P1 (5 imgs × 5.5 locale ≈ 28 SVG) | 28 | 1 週 |
| Sprint 5 | Tier B P2 + C P2 (7 imgs × 5.5 locale ≈ 39 SVG) | 39 | 1 週 |
| Sprint 6（optional） | Tier D (1 img × 6 locale = 6 SVG) | 6 | 半週 |

**MVP 路徑**（資源最緊）：只做 Sprint 1 = Tier S P1 = 48 SVG，能解掉 article hook + thesis 視覺化最強的 8 張。其餘可分階段補。

---

## 26. Final open questions (Tier B/C/D round)

延續 §12 既有 Q1-4，本輪新增：

1. **`client-asked-which-version` 與 `recover-overwritten-file` 都是 5 locale (無 it)** — 兩篇都是 single-market 策略文（前者 ko/en hybrid，後者 ja-primary）。要 6 locale 補圖、還是維持 5 locale？影響 designer scope 約 -4 SVG。
2. **`departing-employee-data-risk` 4.8K 是 Tier S+A+B+C+D 全集裡最短的** — 1 張時間軸圖視覺份量已過半，是否反而失衡？替代：跳過此篇圖，純文字 ship。
3. **`why-i-built-keeply` Tier D 圖標 P3 optional** — 若資源緊，這篇是第一個 cut 的候選。Confirm 你是否接受 founder note 無 body image。
4. **40 張圖 ~228 SVG 是 quarter-scale 工作量** — 是否分批執行（先 Sprint 1 MVP → 評估 → 再 Sprint 2-6）、還是一次發 full brief 給 designer？影響合作節奏與報價。

---

> 文件版本：v3（2026-05-13）。改動：append Tier B/C/D 9 articles × 13 new images + final scope + sprint schedule + 8 open questions。
> v2：append Tier A 4 articles × 14 new images（2026-05-13）。
> v1：初版 Tier S 3 articles × 13 images（2026-05-13）。
>
> **BWF v0.2.24 同步（2026-05-13）**：本 brief 為 keeply-blog 專案 reference implementation。User-level BWF 已加入：
>
> - **T1 template GATE checklist** 新增 2 項：Touch 3 SKELETON `body_images:` block + Touch 4 DELIVER per-locale image-{N}.svg 交付
> - **traps.md T23** Body-image-less ship pattern（4 條強規則 80-83 + audit pattern + 跟 P1.21 / P1.18 關係）
> - **traps.md pre-ship audit checklist** 新增 T23-80/81/82/83 4 項
> - **keeply-blog/CLAUDE.md P1.26** Body image 計劃必填，反向引用本 brief 作為 schema reference
>
> 影響：之後新文章走 `/blg` 流程在 Touch 3 SKELETON 階段會被 BWF 強制要求填 `body_images:` block，不會再出現只 ship 純文字 + cover 的情況。已 shipped 16 篇 backlog 走本 brief 補圖。
