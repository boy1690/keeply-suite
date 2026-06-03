# GSC Index Audit Baseline — 2026-06-03

> Property: **`sc-domain:keeply.work`**（Domain property，apex + blog 合併）
> GSC 索引報表更新：2026/5/29 ・ 已索引 **765** / 未索引 **608**（9 原因）
> 取數：**Playwright MCP 驅動 user 已登入 Chrome** + **URL Inspection API（gcloud ADC）**。
> ⚠️ 本檔結論**只收經權威查證的事實**；先前的 pattern 推論（已標「臆測，已推翻」）不採信。

## 9 分類（總數，來自 GSC 報表 — 注意此報表是 stale 快照）

| # | 原因 | 數量 | 桶 |
|---|------|------|----|
| 1 | 已檢索-目前未建立索引 | 212 | 大半 ⚪(180 feed/sitemap)+ A(21 tag)+ 少數待查 |
| 2 | 遭 noindex 排除 | 148 | A（pilot/tag/search） |
| 3 | 找不到網頁 404 | 100 | B（~92 tag 殘留,curl 實證 404）+ 7 apex compare.html 真404 + 1 cdn-cgi 假陽性 |
| 4 | 頁面會重新導向 | 55 | A（我們的 301） |
| 5 | 替代頁面 canonical | 40 | A（hreflang 去重） |
| 6 | 已找到-未建立索引 | 28 | B |
| 7 | 重複 Google 選不同 canonical | 21 | B |
| 8 | 重複 未選 canonical | 3 | B |
| 9 | 重新導向錯誤 | 1 | 待查 |

## 經權威查證的事實（非推論）

1. **R2（`disableKinds=["taxonomy","term"]`）已上線**（hugo.toml line 20，2026-05-18）。curl 實證 `/{locale}/tags/X/` + `/tags/X/index.xml` = **404**。→ GSC 的 tag 噪音是**上線前 stale 殘留**,非 live 問題。
2. **「4 篇核心文章未收」是臆測,已被 URL Inspection API 推翻**（2026-06-03 inspect，siteUrl=sc-domain:keeply.work）:
   | URL | API verdict | coverageState | canonical |
   |-----|-------------|---------------|-----------|
   | zh-cn/hidden-cost-shared-folders | **PASS** | **已索引** | self |
   | it/windows-file-history-wrong-version | **PASS** | **已索引** | self |
   | ko/deleted-file-not-in-recycle-bin | NEUTRAL | crawled-not-indexed | self |
   | zh-tw/3-2-1-backup-rule | NEUTRAL | crawled-not-indexed | self |
   - **2 篇早已索引**（GSC 索引報表 stale，落後實際）。
   - 另 2 篇 = crawled-not-indexed,但 **self-canonical + INDEXING_ALLOWED + fetch SUCCESSFUL**：非重複、非技術問題。**Google 官方:no need to resubmit, may index later → 無需動作**。
   - ✗ 我先前「多語重複 / Google 選別的 canonical / 該 BWF retrofit」**全錯**。
3. `/ja/install.html` → **308**（已導向乾淨 URL，非重複，免處理，curl 實證）。
4. `keeply.work/compare/*.html` → **404**（真,屬 **apps/website** 非 blog）。

## 結論（verified）

**本次 blog 程式改動 = 0。** index 健康:R2 已在、真實問題不存在、Google 官方對殘餘 crawled-not-indexed 明文「不用動」。GSC 數字會隨 stale 殘留被 drop 自然下降。

## 🔬 查證軌跡（觀察 — 對 BWF 寫作有用）

- **GSC「索引報表」是 stale 快照,「URL Inspection API」才是 Google 即時判定** — 兩者會差數天/數狀態。下任何「某頁沒收」結論前,必逐 URL inspect,別信報表 row。
- **別猜 UI deep-link**：2026-06-03 我猜 GSC inspect URL → 回 404。文件化 API 才可靠。
- **權威來源層級**：逐 URL = Inspection API > 一般行為/定義 = Google 官方 doc > SEO blog 轉述 > 記憶/pattern 推論。
- **對 BWF**：每個「Google 會怎樣」的 claim 要附官方 URL 引用（= P0.4/P0.8/P1.12 的 E-E-A-T 紀律）。寫 SEO/技術文時,把「查證軌跡」當寫作素材:先引官方定義原文,再給操作。

## 下次（~2026-06-13 對照）
- 404(100) / 已檢索-未索引(212) → 預期隨 stale tag 殘留 drop 而降;ko + zh-tw 2 篇看是否被收（不主動 resubmit，官方建議等）。
