# GSC Index Audit — 現況 + 改善計畫 (討論版 for ChatGPT)

> Date: 2026-05-19
> Property: `sc-domain:keeply.work`（Domain 資源，含 apex + blog + www + 所有 subdomain）
> Used skill: [`~/.claude/skills/gsc-index-audit/SKILL.md`](C:\Users\billi\.claude\skills\gsc-index-audit\SKILL.md)（v2026-05-18 含 fact-checked caveats 1-6 + R1/R2/R3 結構性根因）

---

## 📊 GSC 現況（2026/5/15 GSC last update — 4 天 stale）

| # | 分類 | 數量 | GSC validation state |
|---|------|:---:|---|
| 1 | 已檢索 - 目前尚未建立索引 | **186** | 失敗 |
| 2 | 遭到「noindex」標記排除 | **134** | 失敗 |
| 3 | 已找到 - 目前尚未建立索引 | **79** | 已開始 |
| 4 | 找不到網頁 (404) | **55** | 失敗 |
| 5 | 替代頁面 (有適當的標準標記) | **35** | 失敗 |
| 6 | 這是重複網頁；Google 選擇的標準網頁和使用者的選擇不同 | **18** | 已開始 |
| 7 | 頁面會重新導向 | **6** | 失敗 |
| 8 | 這是重複網頁；使用者未選取標準網頁 | **3** | 已開始 |
| 9 | 重新導向錯誤 | **1** | 尚未開始 |
| | **總計未索引** | **517** | |

Sitemap 來源（GSC 認得的 7 個）：
- `https://blog.keeply.work/{en,it,ja,ko,zh-cn,zh-tw}/sitemap.xml`
- `https://keeply.work/sitemap.xml`

> ⚠️ Domain property `sc-domain:keeply.work` **混 apex + blog + www + 任何 subdomain 的數字**。下次 audit 要拆 host split 才能精確歸因 — 從 GSC drilldown URL list 用 hostname 過濾抓真實分布。本表第一欄目前是「整體 Domain property」視角。

---

## ⚠️ Timing context — 最關鍵

| 事件 | 日期 | 影響 |
|------|------|------|
| 2026-05-19 **今天** | DNS cutover：blog.keeply.work + keeply.work 從 GH Pages → CF Pages | 後端基礎設施徹底換 |
| 2026-05-15 | GSC 報表 last update | **數據都是 PRE-migration 狀態** |
| 預期 ~2026-06-02 | GSC 下一次 full re-crawl 完成 | 那時數字才會反映 CF Pages 後的真實 |

**換句話說：上方 517 全是「以前 GH Pages 時代的快照」**，不能用來判斷 CF Pages 部署成敗。Google 仍會帶著舊 URL 記憶重抓，所以「快照」跟「現在的真實後端」不是完全脫鉤，但無法直接讀出 migration 影響。

---

## 🔬 Online research 結論（2026-05 latest posture）

### 1. 「Crawled - not indexed」(186) — 2026 Google 變極挑剔
- Cause：[content quality / E-E-A-T / orphan pages / poor internal linking / AI noise](https://www.onely.com/blog/how-to-fix-crawled-currently-not-indexed-in-google-search-console/)
- 2026 變化：Google 對 indexing budget 緊縮，AI-generated noise 被 deprioritize
- Fix：improve content + internal links + structured data + URL Inspection request recrawl

### 2. 「Discovered - not indexed」(79) — crawl budget 排隊
- Cause：Google 知道存在但「不值得用一個 slot」
- 對 multilingual site：13 auto-translate locale 很可能就是這桶主力

### 3. CF Pages migration 後該等的時間
- [SEO migration SOP](https://www.influize.com/blog/seo-migration-strategy)：**最少等 1-2 週看新數據，完整影響要 3-4 個月**
- 立即動結構（R1/R2/R3）= 失去「migration 前後 diff」的觀察能力

### 4. GSC 2026 報表本身的 delay
- [Google 官方確認](https://support.google.com/webmasters/answer/7440203)：Page indexing report 已知 delay
- **URL Inspection tool 比較接近 real-time 但有 caveat**：「indexed result」是上次 crawl 的 cached state，**Live Test 才是真正即時抓取**。但 Live Test 只證明「可達 + 可索引性」，**不保證會被收錄**，也不完整判斷 duplicate / canonical 類問題。

---

## 🎯 3 個改善計畫選項

### 🟢 Option A — 保守（推薦）
**現在做**：
1. ✅ 寫 baseline snapshot (`_dev/seo/gsc-index-baseline-2026-05-19.md`)，記下今天 517 數字 + 8 分類 + 樣本 URL
2. ✅ 驗證新 CF Pages 後端的 sitemap 都 200（curl 確認 7 個 sitemap URL 可達 + valid XML）
3. ✅ Submit 新 sitemap 到 GSC（如果路徑變了；目前看路徑沒變所以可能跳過）
4. ✅ URL Inspection 抽 5-10 個 sample（核心文章 + 一個 auto-translate locale + 一個 404 樣本）看 Live Test

**14 天後（~2026-06-02）做**：
- 重新跑 GSC audit，diff 看 migration 後數字變化
- 此時才開始談動結構（R1/R2/R3）

**為什麼推薦**：
- 不會「動」任何東西就清不出乾淨 diff
- 14 天通常足夠 GSC 把 stale 部分 drop 一波
- 真實 bug vs 設計 vs stale 比例只有 post-migration 才看得清

---

### 🟡 Option B — 中等
**現在做 Option A 全部** + 加：
5. **動 R2（disable taxonomy）**：blog 的 `apps/blog/hugo.toml` 加 `disableKinds = ["taxonomy", "term"]` → 一次砍掉所有 `/tags/*` `/categories/*` URL
   - 預期清掉「404 (55) + 重複網頁 (18+3)」中很大比例
   - 風險：blog 內現有 `/tags/*` 內鏈會變死連結，需同步移除 theme template 內的 tag rendering

**為什麼選 B**：
- R2 跟 [Google crawl-budget docs](https://developers.google.com/crawling/docs/crawl-budget)「管理 URL inventory、減少 duplicate/unimportant URLs」方向一致 — 但是否關閉 taxonomy 仍要 evidence-based：看 GSC 過去 90 天 tag/category URL 的 clicks/impressions/backlink，全 0 才砍
- 可以跟 migration cleanup 一起做，反正 GSC 也要重 crawl

**風險點**：
- 跟 migration diff 混在一起難拆解
- 萬一 build break 影響 production 時間敏感

---

### 🔴 Option C — 激進（不推薦現在做）
**Option A + B + 加 R1**：
6. **R1: 砍 13 auto-translate locale 從 build**
   - hugo.toml `[languages]` 移除 13 個 locale entry
   - 加 Cloudflare bulk redirect 把 `/{locale}/*` 全 301 → `/en/*`（per slug 對應）

**為什麼不推薦現在做**：
- R1 需要 GA4 traffic data 支持「這 13 locale 真的沒人看」(per Skill R1 verification step)
- migration 後 GA4 數據也要 refresh，現在判斷不準
- 一次動 3 件大事（migration + R2 + R1）回滾路徑複雜

---

## ❓ 給 ChatGPT 拍板的 open questions

1. **時機選擇**：Option A 保守等 14 天 vs Option B 趁 migration 一起動 R2，哪個 SEO migration SOP 更標準？
2. **186「Crawled - not indexed」**：在 CF Pages migration 前後，這數字大概率會自己消嗎？還是非要 content quality 動手？
3. **134 noindex**：13 auto-translate locale 是「故意 noindex」設計（per CLAUDE.md P0），到底要不要為了「GSC 報表乾淨」砍掉？還是留著當 hreflang anchor（雖然 per Caveat 5 Google 也 verify 不到）
4. **R1 砍 locale 是雙刃**：
   - Pro：GSC 噪音降 / build size 縮 / crawl budget 釋出
   - Con：失去 13 個 country 的「我們存在」signal / 影響未來 expand 那些市場
   - 你會怎麼權衡？
5. **DNS 剛切完當天動 GSC**：標準 SOP 建議「先觀察」還是「migration window 一起動」？
6. **是否該先用 GA4 看每 locale 的 organic visits / conversions 才能判斷 R1**？目前盲掉。

---

## 📁 相關檔案 / 參考

- Skill used: `C:\Users\billi\.claude\skills\gsc-index-audit\SKILL.md`
- Working tree: `D:\tools\doing\keeply-suite\` (post-merge umbrella)
- 監控 production URLs:
  - https://keeply.work/
  - https://blog.keeply.work/
- 舊 GH Pages backend（30 天後 archive）：
  - https://github.com/boy1690/keeply-blog
  - https://github.com/boy1690/keeply-website

### Skill SKILL.md 主結構
- 7-step TL;DR：Pull → Classify → Auto-fix → Code-fix → R1/R2/R3 → Snapshot → Schedule
- Phase 1：Playwright scrape GSC dashboard
- Phase 2：Classify into 3 buckets (A 設計 / B GSC stale / C 真 bug) — **必抽樣 ≥10 URL 對照實際 head meta**
- Phase 3：Auto-fix (CF purge / GSC sitemap removal / GSC validation triggers)
- Phase 4：Code-side fix candidates (per-site decision)
- **Phase 4.5：Structural root-cause R1+R2+R3**（research-backed 2026-05）
- Phase 5：Baseline snapshot (markdown)
- Phase 6：Cadence + 半自動提醒
- 6 個 fact-checked caveats（共同誤解 + Google 官方姿態 cross-check）

### Reference impl 對照
- keeply-blog 2026-05-18 session: 446 URL 分桶 → A 79% / B 12% / C 9%
- 已啟用 R2 + 部分 R1（4 個 locale 留核心）+ R3 N/A
- 這套 SOP 在 keeply-blog 跑過 1 輪，本次 keeply-suite (Domain property scope) 是第一次跑全 site 視角

---

## 我的個人推薦

**Option A 保守等 14 天**。理由：
1. 今天剛切完 DNS，GSC 數字 4 天 stale，動了看不出 diff
2. 寫 baseline 是 zero-risk + future-proof 的事
3. URL Inspection 抽樣是 informative + zero-risk
4. R2/R1 等 post-migration 數字穩定再動 ROI 高

但如果你跟 ChatGPT 討論後決定 Option B（趁機一起動 R2），技術上完全做得到，需要：
- `apps/blog/hugo.toml` 加 disableKinds
- 移除 theme template 的 `.Site.Taxonomies` iterate block
- 跑 `hugo --gc --minify --cleanDestinationDir` 本機驗證 sitemap 不再含 tag URL
- Push 觸發 CF Pages 自動 deploy
- 加 Cloudflare bulk redirect `/{locale}/tags/*` → `/{locale}/`

決定後告訴我。
