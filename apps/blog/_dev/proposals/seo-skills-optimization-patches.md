# SEO/GEO Skills 優化 patch set（2026-05-24）

> **權威執行版 = 同目錄 [`apply-seo-skill-patches.js`](apply-seo-skill-patches.js)**（冪等、自動備份、dry-run 驗證；`node apply-seo-skill-patches.js`）。
> 最終範圍 **30 筆 / 6 檔**：seo-setup(13) · seo-watch(5) · gsc-index-audit(5) · seo-audit-retrofit(3) · seo-coach SKILL.md(2) · seo-coach `references/13-ai-search.md`(2)。
> 比下方初稿多出的：seo-coach AI-search 模組刷新（CF user-fetch/training 追蹤 + llms.txt）、3 筆 Tier-3 觸發調整（gsc `weekly SEO health`→`GSC 索引深掘`、retrofit `similar.ai` 名實對齊、seo-coach「只想修好就讓位」平衡句）。以腳本為準。

> 來源：對 5 個 core SEO/GEO skill 的全面盤點（seo-setup / seo-watch / gsc-index-audit / seo-audit-retrofit / seo-coach）。
> **為什麼是 patch 文件而非直接改**：`C:\Users\billi\.claude\skills\*/SKILL.md` 在 `.claude/` 底下，被 harness 硬擋為 self-modify（連 user 授權不解，重試無用 — 同 settings.json / hooks）。所以由你套用。
> Tier 1 = 補上剛上線的 AI 爬蟲 KPI（與本 session 直接相關）；Tier 2 = 事實性 bug；Tier 3 = 跨 skill 路由/一致性。
> seo-setup + seo-watch 給精確 before→after；其餘 3 個給定位指示（需要精確 diff 再跟我說，我讀檔產出）。

---

## A. `seo-setup` — `C:\Users\billi\.claude\skills\seo-setup\SKILL.md`

### A-T1.1 〔Tier1〕Phase 0 prereqs 表加 CF analytics token 列

在 CrUX API key 那列（`| **CrUX API key** | ... |`）後面加一列：

```
| **Cloudflare API token (Analytics:Read)** | dash.cloudflare.com → My Profile → API Tokens →「View Analytics and Logs」範本（read-only），限目標 zone | L1 AI-crawler 能見度 fetcher 的前提（**僅當網站在 Cloudflare proxy 後**才有；見 Phase 2 + G14）|
```

### A-T1.2 〔Tier1〕Phase 2「Files to copy + adapt」表加 fetcher 列

在 `fetch-crux.js` 那列後面加：

```
| `fetch-ai-crawlers.js` | `HOSTS` map + zone；**需站在 Cloudflare proxy 後** |
```

### A-T1.3 〔Tier1〕Phase 2「GitHub Secrets 要設」表加兩列

在 `CRUX_API_KEY` 那列後面加：

```
| `CF_ANALYTICS_TOKEN` | Cloudflare User API token，「View Analytics and Logs」範本（Zone Analytics:Read，read-only）|
| `CF_ZONE_ID` | Cloudflare zone overview 或 GraphQL `viewer{zones{zoneTag}}`；多 host 同 zone 時用 `clientRequestHTTPHost` 分流 |
```

### A-T1.4 〔Tier1〕Phase 2 新增子段（擺在「### CrUX 區塊在新站初期會空」之後、`## Phase 3` 之前）

```markdown
### L1 也含 AI 爬蟲能見度（GEO 領先訊號）

`fetch-ai-crawlers.js` 把 Cloudflare 上 AI 爬蟲命中**分流成兩類**（不是加總成一個虛榮數字）：

- **user-fetch（領先指標）**：`ChatGPT-User` / `OAI-SearchBot` / `PerplexityBot` / `Perplexity-User` / `Claude-User` / `Claude-SearchBot` — 因為某個 user 的**即時 query 引用了你的頁**才來抓 → 你很可能正被 AI 答案引用。
- **training（落後指標）**：`GPTBot` / `ClaudeBot` / `CCBot` / `Google-Extended` … — 語料收錄，基礎在場。

資料源 = Cloudflare AI Crawl Control GraphQL（`httpRequestsAdaptiveGroups` 節點，**非** Enterprise Bot Management），用 `userAgent` 維度分類 → **Free plan 可跑**。這補上「robots.txt 開放了 AI crawler，那它們真的有來抓嗎」這個 close-the-loop 訊號。詳見 G14 的 Free-plan 限制。Reference impl：`apps/blog/_dev/seo/fetch-ai-crawlers.js` + `build-report.js` 🤖 區塊（2026-05-24，spec `_dev/proposals/geo-ai-crawler-analytics-spec.md`）。
```

### A-T1.5 〔Tier1〕新增 Gotcha G14（擺在 G13 之後、`## Validation tools` 之前）

```markdown
### G14 — Cloudflare Free plan AI-crawler analytics 的三個限制

**前提**：站要在 Cloudflare proxy 後（orange cloud）CF 才看得到 bot 流量。

1. **`botDetectionIds` filter 需付費 Bot Management** → 別依賴它；改用 `userAgent` 維度（all plans 可用）自行 substring 分類。
2. **單次查詢跨度 ≤ 1 天**（"cannot request a time range wider than 1d"）→ 一天一個 ~24h query，迴圈 7 天再彙總（不能一次拉一週）。
3. **保留期 ~8 天**（"cannot request data older than 1w1d"）→ **CF 本身做不出 week-over-week**。v1 報當週絕對值，跨週趨勢靠 weekly Issue 歷史；要程式化 WoW 得自存週快照（v1.1，不需 daily cron）。

**對策落點**：fetcher 內建 UA→class map + 逐日切片，weekly job 在報表時跑 7 個日切查詢。
```

### A-T1.6 〔Tier1〕月維護 checklist 加一行

在「每月一次」清單第一個 bullet 後加：

```
- [ ] 開最新 `seo-weekly` Issue → 看 🤖 **AI 爬蟲能見度**：user-fetch（被 AI 引用）有沒有掉、被抓最多的內容是哪幾篇（amplify 候選）
```

### A-T1.7 〔Tier1〕Reference index 區塊加一行

在 `├── fetch-crux.js              ← L1 CrUX (INP)` 後加：

```
│   ├── fetch-ai-crawlers.js       ← L1 AI 爬蟲能見度 (GEO 領先訊號)
```

### A-T2.1 〔Tier2〕修矛盾：reference 表「split AI policy」→「open-all」

```
- | robots.txt with split AI policy | `static/robots.txt` |
+ | robots.txt with open-all AI policy | `static/robots.txt` |
```

### A-T2.2 〔Tier2〕修重複的 `## Phase 3` heading

目前 L2（unlighthouse）與 L3（SerpBear）兩個 heading 都叫 `## Phase 3 — …`，且 Phase 0 表內 `[Phase 3](#phase-3-serpbear-rank-tracker)` 的 anchor 早已對不上。建議：

```
- ## Phase 3 — L2 Monthly unlighthouse audit
+ ## Phase 3a — L2 Monthly unlighthouse audit

- ## Phase 3 — L3 SerpBear rank tracker
+ ## Phase 3b — L3 SerpBear rank tracker
```
並把 Phase 0 表 line 39 的 `[Phase 3](#phase-3-serpbear-rank-tracker)` 改成 `[Phase 3b](#phase-3b--l3-serpbear-rank-tracker)`。

### A-T3.1 〔Tier3〕「觸發其他 skills」補後續路由

在該段現有 3 個 bullet 後加（seo-setup 是基礎 skill，設定完該告訴 user 下一步去哪）：

```
- **設定完之後的日常**：site 出狀況 / traffic 掉 → **seo-watch**（incident triage）；GSC 索引噪音 / 一堆未索引 → **gsc-index-audit**；手上有第三方 scanner 分數要補 → **seo-audit-retrofit**；想自己學/懂原因 → **seo-coach**
```

### A-T3.2 〔Tier3〕G7 加交叉引用（與 gsc-index-audit 重複的 taxonomy 內容）

G7 對策末尾加一行：`> GSC 端的同一問題診斷（R2 disableKinds）見 skill **gsc-index-audit** Phase 4.5 — 那是單一真相源，本處只列 setup 預防。`

---

## B. `seo-watch` — `C:\Users\billi\.claude\skills\seo-watch\SKILL.md`

### B-T1.1 〔Tier1〕frontmatter description 加 AI-search 觸發詞

在 `「為什麼 backlink 沒效果」` 後、`時觸發。` 前插入：

```
「AI 不抓我們了」「ChatGPT / Perplexity 不引用了」「AI 搜尋引用掉了」「AI crawler hits 降了」
```

### B-T1.2 〔Tier1〕Phase 1 symptom 表加一列

在 backlink 那列後加：

```
| 「AI 不抓了 / AI 搜尋引用掉 / GPTBot·ChatGPT-User 命中降」 | AI-search visibility regression | Phase 2G |
```

### B-T1.3 〔Tier1〕新增 Phase 2G 段（擺在 Phase 2F 之後、`## Phase 3` 之前）

```markdown
## Phase 2G — AI-search visibility regression triage ⚠️ 2026 新增

> 前提：站在 Cloudflare proxy 後。資料源 = `_dev/seo/fetch-ai-crawlers.js`（weekly Issue 🤖 區塊）。

### Step 1：對比 user-fetch 趨勢
讀最近 1-2 期 `seo-weekly` Issue 的 🤖 區塊，看 **user-fetch**（ChatGPT-User / OAI-SearchBot / PerplexityBot / Claude-User）命中 per-host 是否明顯下滑。training 類掉不急（落後指標）；**user-fetch 掉才是領先警訊**（可能正在被 AI 答案除名）。

### Step 2：Hypothesis ladder

| Hypothesis | Diagnose | Action |
|------------|----------|--------|
| H1：robots.txt 誤擋了 AI UA | curl /robots.txt vs git log；查 Google-Extended/Applebot-Extended reverse-default trap（seo-setup G14/Phase1）| 修 robots Allow → 重 deploy |
| H2：CF / WAF / Bot Fight Mode 開始擋 AI UA | CF dashboard Security events 過濾該 UA；看 challenge/block | 加 WAF skip rule 放行已知 AI UA |
| H3：被引用的內容頁 404 / 改名沒 redirect | 比對 🤖 區塊 top cited paths 是否變 404 | 301 → topic-matching pillar（feedback_redirect_to_pillar_not_home）|
| H4：內容不再被 AI 選用（AEO 退化）| 對該主題在 Perplexity/ChatGPT 實測查詢看有沒有引用我們 | 走 **seo-audit-retrofit** 補 Executive Answer / 問題式 H2 / schema |
| H5：CF 取樣雜訊 / 單週波動 | 看是否只是 ±1 週抖動（Free plan 取樣 + 8d retention）| 不動，下一期再看 |

對 H1-H3（技術故障）→ auto-fix（不受 Phase 0 核更閘門限制）。對 H4（內容）→ propose 走 seo-audit-retrofit。
```

### B-T1.4 〔Tier1〕Phase 3 battery 加 Test 10

在 `# Test 9: …` 後加：

```
# Test 10: AI crawler hits（fetch-ai-crawlers.js）— user-fetch 類 vs 上期 baseline 沒崩；被引用 top paths 仍 200
```

### B-T2.1 〔Tier2〕修 Phase 1 表的死連結（不存在的「專屬 perf skill」）

```
- | 「網站變慢 / Core Web Vitals 出狀況」 | Performance regression | Phase 2E（一般跳過，建議 user 用專屬 perf skill） |
+ | 「網站變慢 / Core Web Vitals 出狀況」 | Performance regression | Phase 2E（一般跳過 → 走 PSI / Lighthouse 手動，目前無專屬 perf skill）|
```

### B-T2.2 〔Tier2〕Phase 3 battery Test 9 過時的「11 removed locale」字面值

```
- # Test 9: 11 removed locale (or whatever locale-policy is) 全 301 to designated target
+ # Test 9: 已移除的 locale（依當下 locale-policy，數量會變 — 對照 CLAUDE.md / market-pilot-deploy）全 301 to designated target
```

---

## C. `gsc-index-audit`（定位指示；需精確 diff 再跟我說）

- **〔Tier2〕Phase 4 候選編號亂序**：目前是 Candidate 1 → 2 → 3 → **5** → **4**。把第 4 個（現標 5）與第 5 個（現標 4）對調編號，或統一重編 1–5。
- **〔Tier2〕R1 locale 清單過時**：Phase 4.5 / R1 寫「砍 13 auto-translate locale … de/es/fr/pt/ru/nl/pl/tr/vi/th/id/ar/hi」，但 **vi + th 已重新上線為 native locale**（commits `cecba8d1` / `b4a87080`；market-pilot-deploy 也列 de/es/pt-br/pl 為 live pilot）。把 vi/th（及任何已轉 native 的）從「砍」清單移除，改註「auto-translate 清單會隨 market-pilot 變動 — 對照 CLAUDE.md locale-policy」。
- **〔Tier2〕baseline 數字**：446（TL;DR）vs 517（Phase 1.5 / Phase 6）並存且無「不同 snapshot」框架 → 各 baseline 標日期。
- **〔Tier3〕反向引用缺失**：seo-watch 指向此 skill，但此 skill 不指回 seo-watch。在 header off-ramp 或 cadence 段加：「快速 incident triage（單一症狀、要趕快修）→ 走 **seo-watch**；本 skill 是全 8 分類深掘。」
- **〔Tier3〕weekly-health 觸發三方撞**：description 列「weekly SEO health」與 seo-setup L1 + seo-watch 半週期 check-in 撞。建議把此 skill 的「weekly SEO health」觸發收斂為「GSC 索引狀態 deep audit」，把泛泛的 weekly health 讓給 seo-watch/seo-setup。

## D. `seo-audit-retrofit`（定位指示）

- **〔Tier2〕locale 數自相矛盾**：§i18n 範例列 ~20 locale、§對照表寫「全 19 locale」、GR8 寫「20 locale × 12 keys = 240」。全部早於 19→12→14 trim。統一改成「以當下 locale-policy 為準（對照 CLAUDE.md）」+ 範例標「示意」。
- **〔Tier2/Tier3〕`similar.ai` 名實不符**：description + intro 說支援 similar.ai，但全文只有 av8d-levelup 的對照表。要嘛補 similar.ai 的維度對照，要嘛把 description 改成「av8d-levelup（其他 scanner 同法類推）」。
- **〔Tier1 補強〕**：§verify「deploy 後 5 件事」可加一條「AI-bot Allow 有沒有產生實際命中」→ 指向 seo-watch Phase 2G / seo-setup 的 AI 爬蟲 KPI（per-deploy 驗證，不是長期 KPI）。

## E. `seo-coach`（定位指示）

- **〔Tier3〕反向 off-ramp 缺失**：gsc-index-audit + seo-watch 都指向 seo-coach（想學/懂原因），但 seo-coach 的負向觸發只指向 seo-audit / seo-audit-retrofit / blg / seo-setup。加一條：「想要**直接修好**（不只是學）→ 索引問題走 **gsc-index-audit**、site 出狀況走 **seo-watch**。」
- **〔Tier2/低〕metadata 一致性**：5 個 skill 只有 seo-coach 有 `version:` 欄。要嘛全加版本、要嘛拿掉（統一慣例）。
- **〔Tier1 補強，可選〕**：description 已列「AI 搜尋準備度」為涵蓋主題，但 SKILL.md 本體零 AI-search 內容（全在未讀的 `references/*.md`）。若要教 GEO，可在 references 加一個 AI-search 模組，帶到 user-fetch vs training 的概念 + llms.txt。

---

## 套用建議順序

1. **Tier 1 先**（A-T1.* + B-T1.*）：把剛上線的 AI 爬蟲 KPI 編進 seo-setup（建/監測）+ seo-watch（訊號/triage）——這是 KPI 不被孤立的關鍵。
2. **Tier 2**（事實 bug）：低風險、可一次清。
3. **Tier 3**（路由/觸發收斂）：會影響 skill 啟動行為，建議逐條確認後再套。
