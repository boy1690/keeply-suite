# D45 法遵債 — 簽核清單（出口 gate）

> 2026-06-10 起草 / 2026-06-11 完成驗證 | spec 122 | 來源交接：Keeply repo `idea/42`
> **本檔為 *.md，deploy pipeline 排除（不會外發）。簽核前不得 push、不得部署。**
> 本機 preview server：`cd apps/website && python -m http.server 8123`（驗證時開啟）

---

## 0. 狀態總覽

| 工作包 | 範圍 | 狀態 |
|--------|------|------|
| A — G0-1 | privacy 絕對承諾改條件式（21 locale） | ✅ 完成，待簽核 |
| B — C-G3 | terms §14 AI 條款 + FAQ + EULA fragments（21 locale） | ✅ 完成，待簽核（含 2 段 DRAFT 待法務） |
| C — G0-2 | GDPR controllership 一頁事實 memo | ✅ DRAFT 完成，待法務 |

驗證：本地 `npm run build` 通過、`audit:seo` OK、殘留絕對承諾 grep 部署面歸零、21 locale i18n parity（667→692 keys 一致）、翻譯品質紅隊全 4 類別 CLEAN（零 blocker）。

---

## 1. G0-1 privacy 改寫 — diff 摘要（每 locale 同一組 key 變動）

**全 21 locale 套用同一改寫**（zh-TW/en 為源，19 locale fan-out 翻譯，machine-check + 紅隊雙驗）。每 locale 變動：
- `privacy.meta.description` / `privacy.highlight`：絕對句「檔案絕不離開你的電腦」→「版本管理在你電腦運作 + Keeply 本身不收集任何資料 + AI 為 opt-in 條件」。
- `privacy.files.title` / `toc.files`：「你的檔案留在你的裝置上」→「**預設情況下**，你的檔案留在你的裝置上」。
- `privacy.files.p1`：絕對「不上傳/傳輸/讀取」→加「除選用 AI 助理外」限定。
- `privacy.files.li3`：原「使用統計」項 → 改「AI 助理（選用，預設關閉）」項。
- `privacy.files.p3`：絕對「絕不傳輸」+「確實送出的統計」→ AI 例外 + 「目前不送任何統計」。
- **新增 section `#ai-assistant`**〈當你選擇使用 AI 助理時〉= `privacy.ai.{title,p1..p5}` 6 keys：直送服務商不經 Keeply / 本機模式不離機 / 金鑰只存 OS 保管庫 / 服務商條款（附 OpenAI·Anthropic·Google 連結）/ 觀測零內容 + 版本歷史標示。
- §2.5（`#section-2-5` 錨點保留）：刪 tier1/tier2 主動收集敘述 → 改「目前零收集（程式碼惰性、無端點）」+ 未來啟用前先改 policy。刪 4 個 telemetry key。
- `privacy.notcollect`：新增第 7 列「使用統計/遙測 ❌ 目前無」+ 表下 AI 註記。
- `privacy.thirdparty`：表下 AI 註記（服務商非 Keeply 處理者、你直接與其建立關係 — 紅隊修正後撤除 processor 法律定性）。
- `privacy.retention.r4`：「12 個月」→「不適用，目前不蒐集」。
- `privacy.updated`：→ 2026-06-10。

**Preview（簽核時逐 locale 點開）**：`http://localhost:8123/{locale}/privacy.html`
全 22 頁（21 locale + root）確認含 `id="ai-assistant"`、無 tier1/tier2 殘留、AI 段非英文殘留（ja/ko/de 已抽查落地）。
- 重點看：`/zh-TW/privacy.html`、`/en/privacy.html`、`/privacy.html`（root=zh-TW）

## 2. C-G3 terms / FAQ / EULA — diff 摘要

**terms（21 locale）**：
- 新增 **§14 AI 助理（自帶金鑰）** = `terms.s14.*` 14 keys，anchor `#s14`，置於 §13 之後（不重編號）。
  - 14.1 金鑰所有權/責任、14.2 合法來源、14.3 不支援訂閱登入 = **交接 §3 定稿**（語意忠實，紅隊 D 軸確認）。
  - **14.4 AI 輸出免責 + 責任上限**〔DRAFT 待法務〕、**14.5 已送出內容刪除限制**〔DRAFT 待法務，附服務商刪除入口連結〕。
  - 14.6 AI 編輯標示（EU AI Act Art 50 揭露，只寫「版本歷史標示」既存事實，不宣稱機器可讀標記）。
- `terms.s7.p1`：補進 21 JSON（修 latent leak：原 DOM 有 hook、JSON 全缺）+ AI 條件句。
- `terms.s10.p3`：存續清單加第 14 條。
- `terms.updated`：→ 2026-06-10。
- 刪孤兒 key `terms.s7.20_1~4`（8 keys，無 DOM hook、含過時 telemetry + 絕對句）。
- Preview：`http://localhost:8123/{locale}/terms.html`（§14 in 22 頁全建出）。

**FAQ（index，21 locale）**：
- `index.faq.1.a` 改寫（加 AI opt-in 例外 + 「可關閉更新檢查」）。
- 新增 4 題 `index.faq.8~11`：訂閱為何不行 / 金鑰安全 / 費用 / 完全離線。`inject-schema.js` FAQ_COUNT 7→11，FAQPage JSON-LD 已含 11 items。
- Preview：`http://localhost:8123/en/#faq`、`/zh-TW/#faq`。

**app EULA fragments**：`docs/legal/app-eula-fragments.md`（zh-TW + en，6 段，供 app repo 後續 spec 取用）。

## 3. G0-2 GDPR memo

- 路徑：`docs/legal/gdpr-positioning-draft.md`（標 **DRAFT — pending legal review**，deploy 排除 docs/ + *.md 雙保險）。
- 定性：使用者＝唯一 controller、Keeply＝純工具；核心證據＝零收集＋零中繼；含 Fashion ID 反面分析 + 團隊版附註 + 5 條律師開放問題。

## 4. 連帶清掃（同批，非 privacy/terms 主體）

- `compare/snowtrack.html`（en L155 JSON-LD + L419 可見 + zh-TW）：「we only receive hashed device id」exhaustive 句補 AI 例外括號。源：`_dev/comparisons/snowtrack.json`。
- 免費工具 `/tools/can-i-recover-my-file`（en+zh-TW badge + 診斷 faded 字串）：「nothing uploaded / 不上傳」→「runs in your browser / 在你的瀏覽器裡執行」。**根因**：該頁 `tool_complete` GA4 event 送出作答衍生值（storage_locus/verdict），「nothing uploaded」現在進行式不實。源：`_dev/src/file-recovery-diagnostic.js`。

---

## 5. 簽字欄（簽核前不得 push、不得部署）

- [ ] **法務** 已審 terms §14.4 / §14.5 兩段 DRAFT + GDPR memo 定性 ＿＿＿＿＿＿＿ 日期 ＿＿＿
- [ ] **owner** 已逐 locale preview privacy + terms ＿＿＿＿＿＿＿ 日期 ＿＿＿
- [ ] owner 授權 push（明確口頭/文字「push」後才動）＿＿＿＿＿＿＿

---

## 6. 待法務確認 / 上線前須解決（open items）

1. **§14.5 服務商刪除入口 URL**：目前用 `privacy.openai.com` / `privacy.anthropic.com` / `policies.google.com/privacy`。請法務確認為最新且確為刪除請求入口（Google 用的是總政策頁，非刪除專頁 — 建議換刪除專頁）。
2. **FAQ 1 連網面事實**：文案寫「預設只在授權驗證與檢查更新（可關閉）時連網」。請 owner 確認實際行為（授權驗證時機＝啟動時/一次性 activation？更新檢查是否真可關？）— §1 八條事實未涵蓋連網面，此句為對齊現行 snowtrack 既有表述而寫。
3. **about「我們無從得知你今天用了什麼」**：原句「不知道你今天有沒有開過 Keeply」已改為可守版本（授權驗證 ping 理論上會落 Keygen log）。若 owner 確認驗證僅一次性 activation、之後零 ping，可考慮回復更強表述。
4. **terms §14 排序**：§14 置於 §13 Contact 之後（Contact 不再收尾）。刻意為之（避免重編 21 locale 號碼）；法務若要求 Contact 收尾，需另案調整。

## 7. 長期條款（務必執行 — 抄進 Keeply repo `RELEASE_CHECKLIST.md`）

- ⚠️ privacy 現宣稱「Keeply 不收集任何使用資料」+「出貨版未注入回報端點」。**未來任何版本若啟用匿名計數/telemetry（注入 build flag），必須先改 privacy 再出貨**，且以版本化方式重新呈現給既有使用者同意（spec-177 紀律的法遵版）。
- privacy `§2.5 future.body` 已預告此機制；啟用時需同步把該段改為實際收集敘述 + 回填 retention 表。

## 8. 上線後回填（push + 部署完成後）

- [ ] Keeply app repo `idea/41` 盤點對應項標 done；雪球設計文件 §20.4 法遵債列更新。
- [ ] **法遵 follow-up（本批未動，列待辦）**：`legal/index.html` 法務透明 portal 仍把 two-tier telemetry 描述為運作中機制、且連到 deploy 排除的 `*.md`（prod 404）；`legal/art-30-processing-records.md` P-06 把 opt-in 統計登記為 active processing。零收集定性下這些應更新/標 superseded — 屬 law repo 投影，需 owner 以 `sync-legal.js` 流程處理，不在本 repo agent 權限內。
- [ ] CF cache purge：`npm run seo:purge`（privacy/terms/index/compare/tools 全 locale）。
