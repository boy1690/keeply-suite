# Spec — AI 爬蟲能見度，接進 seo-weekly 當 GEO 量測層

> Status: **Phase 0 ✅ DONE · Phase 1 code ✅ built + locally verified · 待 push 上線**  ·  2026-05-24
> Lineage: 起於 GEOFlow（`yaojingang/GEOFlow`）evaluation —「AI crawler identification and trending」是它唯一值得借鏡的點；正好補上我們 [`_dev/hooks/geo-backlog.md`](../hooks/geo-backlog.md) **G2** 卡住時提過、卻一直沒做的「`geo-crawlers` 領先訊號」。
> 不抄 GEOFlow 的核心（素材庫量產 + 多域 syndication）——那跟 BWF P0 + `reference_google_ai_detection_research` 相剋。本 spec 只取「把 AI 爬蟲命中當可量測指標」這一塊，且改寫成我們靜態站 + Cloudflare 的 stack。

---

## 0. Phase 0 實測結果（2026-05-24 — 已執行）

跑了真實探測（token 已建 + 已存 GH secret），結論比預期好：

- **可行性 ✅**：CF AI Crawl Control GraphQL 在 Free plan 用 `userAgent` 維度分類完全可行。
- **Zone**：共用 zone `9bffb03ecc2c61baaff4c689ed18e17b`（同時含 `keeply.work` + `blog.keeply.work` + `www`）。已存 `CF_ZONE_ID` secret。
- **Token**：建了 read-only「查看分析與記錄」User API token（含 Zone Analytics:Read），存為 `CF_ANALYTICS_TOKEN` secret + 本機 `_dev/seo/.env`（gitignored）。
- **Free plan 兩個硬限制（實測）**：
  1. **單次查詢跨度 ≤ 1 天**（"cannot request a time range wider than 1d"）→ 改成**逐日切片**：一天一個 ~24h query，迴圈 7 天再彙總。
  2. **保留期 ~8 天**（"cannot request data older than 1w1d"）→ **CF 本身做不出 week-over-week**。v1 報當週絕對值；WoW 留 v1.1 用自存週快照（不需 daily cron）。
  - ⇒ **原 §7 Plan-B（daily-append）不需要了** — retention 撐得住 weekly job 內跑 7 個日切查詢。
- **KPI 現在就有真實訊號**（trailing 7d，實跑數據）：

  | Host | 🟢 user-fetch（領先） | 🌀 training（落後） |
  |---|---|---|
  | blog.keeply.work | 202 | 2,360 |
  | keeply.work | 249 | 373 |

  user-fetch 細項：blog = OAI-SearchBot 116 / ChatGPT-User 67 / PerplexityBot 15；main = OAI-SearchBot 142 / PerplexityBot 66 / ChatGPT-User 32 / Claude-User 2。被 AI 抓最多的內容：blog `/en/post/hwp-file-recovery/`、`/ja/post/sharepoint-version-history/`；main `/cs/`、`/compare/dropbox`。

- **Phase 1 程式碼狀態**：`fetch-ai-crawlers.js`（逐日切片 + UA 分類 + 非內容路徑過濾）+ `seo-weekly.yml` step + `build-report.js` 🤖 區塊**全部寫好且本機端到端驗證通過**。**只差 push 上線**（push gate 待你授權）。

---

## 1. 問題（我們現在量測不到的東西）

現有 weekly（[`.github/workflows/seo-weekly.yml`](../../../../.github/workflows/seo-weekly.yml)）量的全是**搜尋引擎需求面**：GSC / BWT / Yandex（曝光點擊排名）+ GA4（人類 session）+ CrUX（真人 Web Vitals）。

**完全沒有量到「AI 引擎有沒有來抓我們、抓多勤、抓哪些頁」。** 在答案引擎時代這是個洞：

- 我們做了一整層 GEO 投入（`llms.txt` + 15-locale `llms-full.txt` + `ai.txt` + P1.22~P1.24 citability + G5 scorer），卻沒有任何**回授訊號**證明 AI 引擎真的在消費這些內容。
- geo-backlog **G2**（AI-Overview-recovery）卡在「GSC 不暴露 per-query AIO 訊號」。AI 爬蟲命中正是那個**互補的領先訊號**——AI 引擎來抓 = 它把我們納入候選；被 user-觸發的引擎來抓 = 我們很可能正被某個 AI 答案引用。

## 2. 關鍵設計洞：不是所有 AI 爬蟲都等值

GEO 量測的價值全在這個分類上。AI bot 分兩類，KPI 必須**分流**而不是加總成一個虛榮數字：

| 類別 | 代表 User-Agent | 訊號意義 | 量測權重 |
|---|---|---|---|
| **Training / Index**（語料收錄，落後指標）| `GPTBot`、`ClaudeBot`、`CCBot`、`Google-Extended`、`Applebot-Extended`、`Amazonbot`、`Meta-ExternalAgent` | 「我們在訓練語料裡」——基礎在場，但不代表被引用 | 次要 |
| **User / Search-fetch**（即時引用，**領先指標**）| `ChatGPT-User`、`OAI-SearchBot`、`PerplexityBot`、`Perplexity-User`、`Claude-User`、`Claude-SearchBot` | 這些是**因為某個 user 的即時 query 指向我們**才來抓頁 → 我們很可能正被 AI 答案引用 | **主要 KPI** |

> 頭條 KPI = **User/Search-fetch 類命中的週對週趨勢**，按 host（blog vs apex）+ 按 path（哪些文章被 AI 引用最多）。Training 類放次要欄位。
> 注意：Google AI Overviews 用 `Googlebot`、Bing AI 用 `Bingbot`，無法從 UA 乾淨切出 AI 用途 → 這兩家不納入本 KPI（誠實標註 limitation）。

## 3. 可行性裁決 — Cloudflare Free plan 拿不拿得到？

**結論：拿得到，但有 2 個必須先驗證/繞過的點。** 兩個 property（`blog.keeply.work` + `keeply.work`）同屬一個 `keeply.work` zone 且都走 Cloudflare proxy，所以一支 token + 一個 zone 全涵蓋，用 `clientRequestHTTPHost` 分流。

資料源：Cloudflare **AI Crawl Control GraphQL API** = GraphQL Analytics 的 `httpRequestsAdaptiveGroups` 節點（**不是** Enterprise-only 的 Bot Management）。

可用維度 / 指標（文件確認）：`datetimeHour`、`userAgent`、`clientRequestHTTPHost`、`clientRequestPath`、`clientRefererHost`、`count`、`edgeResponseBytes`。

| 點 | 狀態 | 對策 |
|---|---|---|
| `httpRequestsAdaptiveGroups` 節點本身 | ✅ Free plan 可查（zone HTTP analytics 走 GraphQL，Free 有 sampling + 較短保留）| — |
| 多數 filter | ✅ "available on all plans" | 直接用 |
| `userAgent` 維度 | ✅ all plans | **用它做分類**（substring match 我們維護的 AI UA 清單）|
| `botDetectionIds` **filter** | ⚠️ 需 Bot Management（Enterprise add-on）| **不依賴它**。改用 `userAgent` 維度自行分類；犧牲 = 拿不到 Cloudflare 官方 verified-bot 判定，可能混入偽裝 UA（可接受，weekly 量趨勢非安全用途）|
| `clientRefererHost_like` filter | ⚠️ paid only | 不需要，略過 |
| **Free plan 保留期** | ❓ **未知 — 這是 #1 風險** | 見 §4 Phase 0 探測；若 < 7 天 → 走 Plan-B 每日 append |

### 風險 #1（gating）：Free plan 的 adaptive-groups 保留期

`httpRequestsAdaptiveGroups` 在 Free plan 的保留期可能短於 7 天（常見說法 ~3 天，paid 較長；官方文件未明列）。若 < 7 天，**weekly 單次快照會漏資料**。這必須在動工前用一個探測 query 驗證（§4），不能用猜的。

### 風險 #2：token 建立需 user 手動

依 memory `reference_cloudflare_token_setup`：wrangler 不能建 token，須 Playwright dashboard flow + `gh secret set`。所以需要 user 建一支 **`CF_ANALYTICS_TOKEN`**（scope：Zone → `Analytics:Read`，限 `keeply.work` zone）存成 GH secret。`CF_ZONE_ID` 已有。

## 4. Phase 0 — 動工前必跑的可行性探測（不寫任何上線 code）

> 這一步決定整個 design 走 weekly 還是 daily-append。**必須先過再進 Phase 1。**

1. **[USER]** 建 `CF_ANALYTICS_TOKEN`（Playwright dashboard → Zone Analytics:Read on keeply.work → `gh secret set CF_ANALYTICS_TOKEN`）。
2. **[CLAUDE]** 跑一支 one-off 探測 query（本機，不進 repo）：對 `httpRequestsAdaptiveGroups` 各要 `datetime_geq` = 今天 / 3 天前 / 7 天前 的資料，看哪一個還回得到資料。
   - 7 天前仍有資料 → **保留期 ≥ 7 天** → 走 weekly 單次快照（最簡單）。
   - 只有近 3 天有 → **保留期 < 7 天** → 走 **Plan-B 每日 append**（§7）。
3. **[CLAUDE]** 同時確認 AI UA 真的出現在 `userAgent` 維度（抓一週 top userAgent，肉眼確認有 `GPTBot` / `ChatGPT-User` / `ClaudeBot` 等字串；若一個都沒有 = 我們站根本還沒被 AI 爬，那這個 KPI 現在價值低、可延後）。

**Phase 0 輸出**：一份 3-5 行的 feasibility note（保留期 N 天 / AI UA 是否出現 / 走 weekly 還 daily）回報 user，再決定要不要進 Phase 1。

## 5. Design（Phase 1，Phase 0 通過後才動）

完全沿用現有 fetcher 慣例（對照 [`fetch-crux.js`](../seo/fetch-crux.js) + [`build-report.js`](../seo/build-report.js)）：

### 5.1 新 fetcher：`apps/blog/_dev/seo/fetch-ai-crawlers.js`
- Auth：`CF_ANALYTICS_TOKEN` + `CF_ZONE_ID`（env；沿用 fetch-crux 的 `bootstrapKey()` 容錯：env 沒有就讀 `_dev/seo/serpbear/.env`）。
- 查 `httpRequestsAdaptiveGroups`，group by `userAgent` + `clientRequestHTTPHost`（+ 視保留期決定 current 7d / previous 7d 兩段）。
- 內建 **UA → class map**（§2 的兩類清單），把每個 UA 歸成 `user_fetch` / `training` / `other`，per-host 加總。
- 額外：user_fetch 類的 top `clientRequestPath`（哪些文章正被 AI 引用）。
- Output：JSON to stdout（同 fetch-crux 風格），失敗回 `{"error":...}`。

### 5.2 workflow step（[`seo-weekly.yml`](../../../../.github/workflows/seo-weekly.yml)）
在 "Fetch CrUX" 與 "External health check" 之間插一步，沿用容錯 pattern：
```yaml
- name: Fetch AI crawler analytics (Cloudflare)
  env:
    CF_ANALYTICS_TOKEN: ${{ secrets.CF_ANALYTICS_TOKEN }}
    CF_ZONE_ID: ${{ secrets.CF_ZONE_ID }}
  run: node _dev/seo/fetch-ai-crawlers.js > "$SEO_DATA_DIR/ai-crawlers.json" || echo '{"error":"fetch-ai-crawlers failed"}' > "$SEO_DATA_DIR/ai-crawlers.json"
```

### 5.3 報表區塊（`build-report.js`）
新增一個 `load('ai-crawlers.json')` + 一個 section（建議擺在 CrUX 之後、Bing 之前）：
```
## 🤖 AI 爬蟲能見度（GEO）
- 主表：per-host，User/Search-fetch 命中數 + 週對週 delta（用既有 delta() helper）
- 次表：Training/Index 命中數（次要）
- top paths：被 user-fetch 類抓最多的文章（= 最可能被 AI 引用的內容）
- 一行 limitation 註：Google/Bing AI 用途無法從 UA 分離，未計入
```

### 5.4 （選配）action synthesis
在 "🎯 Suggested actions" 加一條：user_fetch 類週對週 ↑ ≥ X% → 「這些文章正被 AI 引用增加，考慮 amplify / 內鏈強化」。

## 6. Scope / 非目標（防 scope creep）

- ❌ 不做任何「多域名 syndication」「素材庫量產」「RAG 自動生文」（GEOFlow 的 content-farm 核心，我們明確拒絕）。
- ❌ 不裝 Cloudflare 的 AI 管理/封鎖功能（那需 paid plan，且我們 robots 政策已定 = 全開主流、只擋 Bytespider/Diffbot/ImagesiftBot，見 `project_ai_crawler_policy`）。
- ❌ 不引入 blocking gate——這是**量測**，純報表，失敗不擋 CI（沿用 weekly 全程 non-blocking 慣例）。
- ❌ 不碰 `.claude/` 設定 / hooks（harness 擋 self-modify）。
- ✅ 只增量：1 支 fetcher + 1 個 workflow step + 1 個 report section + 1 個 user-建的 secret。

## 7. Plan-B（若 Phase 0 測出保留期 < 7 天）

改成輕量 daily cron（或在現有每日 deploy cron 搭一步）跑 `fetch-ai-crawlers.js --window 1d`，把每天的 user_fetch/training 計數 append 進一個 rolling JSON（commit 進 repo `_dev/seo/ai-crawlers-history.json` 或存 artifact）。weekly build-report 改讀這個 rolling store 算 7d 加總 + WoW。多一點 plumbing，但繞開 Free 保留期上限（每天只要近 24h 資料，永遠在保留窗內）。

## 8. 驗收標準（Phase 1 完成定義）
- [ ] Phase 0 feasibility note 已產出且 user 同意走哪條路（weekly / daily-append）。
- [ ] `fetch-ai-crawlers.js` 本機跑得出兩 host 的分類 JSON（user_fetch / training / other + top paths）。
- [ ] `seo-weekly.yml` 加 step，手動 `workflow_dispatch` 觸發一次，artifact 含 `ai-crawlers.json` 且非 error。
- [ ] weekly Issue 報表出現「🤖 AI 爬蟲能見度（GEO）」區塊，數字合理、delta 正確、limitation 註present。
- [ ] fetcher 失敗時 weekly 其餘區塊照常產出（容錯驗證）。

## 9. 工時 / 風險
- 工時：Phase 0 探測 S（~30 min，主要等 user 建 token）；Phase 1 fetcher + report M（半天內，沿用既有 pattern）；Plan-B 再 +S。
- 最大風險：Free 保留期（§4 先測）+ 我們站目前 AI 爬蟲量可能還很低（Phase 0 step 3 先確認，量太低就延後，不浪費工）。

## 10. 待 user 決定
1. **先跑 Phase 0 探測**（含 user 建 `CF_ANALYTICS_TOKEN`）再決定要不要 Phase 1 —— 同意？
2. spec 落點放這裡（`apps/blog/_dev/proposals/`）OK 嗎？要不要同步把它登記成 geo-backlog 的 **G6**（我可改 geo-backlog.md，但那需你點頭）？
3. Plan-B（daily-append）若需要，現在就授權我一起做，還是等測出保留期再回來問？
