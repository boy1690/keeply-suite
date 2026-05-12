# GSC indexing fix — 2026-05-12 baseline

> 釘住今日修復觸發後的狀態，供 1-2 週後複盤比對。對應 [cloudflare-404-cleanup-v2-2026-05-12.md](cloudflare-404-cleanup-v2-2026-05-12.md) + commit `080db36` (kill /categories/ taxonomy) + commit `d07f7a5` (404 cleanup v2 CSV)。

## 修前 GSC 數據（user 報告原文 5/12）

| # | 分類 | 影響頁數 | 來源 |
|---|---|---|---|
| 1 | 遭到「noindex」標記排除 | 94 | 設計使然（不修） |
| 2 | 找不到網頁 (404) | 27 | tag 改名殘骸（v1 CSV 已 redirect → home，v2 改 → pillar） |
| 3 | 替代頁面（有適當的標準標記） | 17 | hreflang 正常（不修） |
| 4 | 重複網頁；使用者未選取標準網頁 | 3 | `/categories/X/index.xml` RSS（已斷源） |
| 5 | 已檢索 - 目前尚未建立索引 | 181 | auto-translate locale lag（不修，自然衰減） |
| 6 | 已找到 - 目前尚未建立索引 | 69 | 同 #5 |
| 7 | 重複網頁；Google 選擇的標準網頁和使用者的選擇不同 | 14 | `/categories/X/` vs `/tags/X/`（已斷源） |

## 修復行動清單

| 行動 | 修哪個分類 | 部署時間 | 狀態 |
|---|---|---|---|
| Cloudflare bulk redirect v1 (→ locale home) | #2 | 2026-05-11 03:34 UTC | ❌ soft 404 風險（已替換） |
| Hugo head.html noindex gate (auto-translate + term/taxonomy/section) | #1 維持 | 2026-05-08 | ✅ 上線 |
| Sitemap.xml exclude listing kinds | #1 配對 | 2026-05-08 | ✅ 上線 |
| **Cloudflare bulk redirect v2 (→ cluster pillar)** | #2 | **2026-05-12 15:08 UTC** | ✅ live (API atomic PUT) |
| **hugo.toml `[taxonomies] tag = "tags"` (kill categories)** | #7 | **2026-05-12 15:15 UTC** (CI deploy) | ✅ live |
| **hugo.toml `[outputs]` (strip RSS from listing kinds)** | #4 | **2026-05-12 15:15 UTC** | ✅ live |
| **layouts/single.html breadcrumb fix** | 配套 (避免內部 404 連結) | 2026-05-12 15:15 UTC | ✅ live |

## 修後 live verification @ 2026-05-12 23:20 UTC+8

### URL 狀態矩陣

| 樣本 URL | curl result | 預期 GSC 行為 |
|---|---|---|
| `/en/categories/tutorial/` | 404 | #7 entry 消失 |
| `/zh-tw/categories/教學/` | 404 | #7 entry 消失 |
| `/it/categories/tutorial/` | 404 | #7 entry 消失 |
| `/hi/categories/.../index.xml` | 404 | #4 entry 消失 |
| `/en/categories/backup-strategy/` | 301 → `/en/post/3-2-1-backup-rule/` | #2 entry 消失（Cloudflare 攔截早於 Hugo 404） |
| `/en/tags/data-backup/` | 301 → `/en/post/3-2-1-backup-rule/` | #2 entry 消失 |
| `/zh-tw/tags/time-machine/` | 301 → `/zh-tw/post/file-version-management-complete-guide/` | #2 entry 消失 |
| `/ja/tags/autosave/` | 301 → `/ja/post/photoshop-autosave-not-version-history/` | #2 entry 消失 |
| `/en/post/3-2-1-backup-rule/` | 200 indexable | sitemap 內、繼續被索引 |

19 locale × `/categories/tutorial/` 全 404 ✅
3 個 `/categories/X/index.xml` spot-check 全 404 ✅
30 個 article URL × 6 core locale 全 200 ✅

### GSC validation 觸發紀錄

| 分類 | 「驗證修正」狀態 | 觸發時間 |
|---|---|---|
| #2 找不到網頁 (404) | ⏱ 驗證已開始 | 2026-05-12 |
| #7 Google 選不同 canonical | ⏱ 驗證已開始 | 2026-05-12 |
| #4 重複未選 canonical | ⏱ 驗證已開始 | 2026-05-12 |

### URL Inspection / Request Indexing 紀錄

| URL | GSC 快取（修前） | Request Indexing | 即時測試結果 |
|---|---|---|---|
| `/en/categories/tutorial/` | 索引中（舊快取） | 拒（404） | 404 ✅ 信號送出 |
| `/zh-tw/categories/教學/` | 不在（dup canonical, 上爬 5/5） | 拒（404） | 404 ✅ |
| `/hi/categories/.../index.xml` | 不在（dup without canonical, 上爬 5/5） | 拒（404） | 404 ✅ |
| `/en/tags/data-backup/` | 不在（404, 上爬 5/10 — v1 redirect 5/11 才上線） | ✅ 已要求 | 301 → pillar |
| `/en/post/3-2-1-backup-rule/` | 索引中、健康 | ✅ 已要求（優先佇列） | 200 |

配額使用 5/5。

## 預期衰減曲線

通常 GSC「驗證修正」觸發後：

| 時間點 | 預期觀察 |
|---|---|
| +24-48h | URL Inspection 對應 5 個 URL 應顯示「Google 已重爬」latest crawl date |
| +3-7 天 | #2 / #4 / #7 三類數字開始下降 |
| +1-2 週 | 修復目標：#2 → 0~5、#4 → 0、#7 → 0 |
| +2-3 週 | #5 / #6（auto-translate lag）也應同步下降，因 categories URL 不再進 crawl queue |
| +4 週 | 「Validation passed」通知 email 應從 GSC 寄達 |

## 1-2 週後複盤檢查清單

回到 GSC `https://search.google.com/search-console/index?resource_id=sc-domain:keeply.work` →「索引」→「網頁」：

- [ ] #2 找不到網頁 (404): 從 27 → ?（目標 ≤ 5）
- [ ] #4 重複未選 canonical: 從 3 → ?（目標 0）
- [ ] #7 Google 選不同 canonical: 從 14 → ?（目標 0）
- [ ] #5 已檢索未索引: 從 181 → ?（軟目標 ≤ 130）
- [ ] #6 已找到未索引: 從 69 → ?（軟目標 ≤ 50）
- [ ] 三個「驗證進行中」chip 是否變成「驗證通過」或數字歸零

## 後續可能跟進項

不阻塞，但記下：

1. **CLAUDE.md P1.16.a SOP drift** — 仍寫「301 → 該 locale 首頁」，下次 edit CLAUDE.md 順手改成「301 → topic-matching pillar」（memory `feedback_redirect_to_pillar_not_home.md` 已 flag）
2. **218 篇 article 的 `categories:` frontmatter 殘留** — Hugo 現在會 silently ignore，不影響功能，但 BWF revise 可以一併清除 frontmatter 殘留欄位
3. **`tag-inventory.js --diff` 顯示 19 ADDED tags** — Pending P1.16 audit（≥3 篇 article 才能新增 tag 規則檢查）
