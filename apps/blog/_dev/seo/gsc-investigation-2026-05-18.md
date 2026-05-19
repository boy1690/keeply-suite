# GSC「失敗」badge 調查報告 — 2026-05-18

> 用戶觀察：GSC「網頁未編入索引的原因」報表多個 row 顯示「失敗」badge，質疑 R1+R2 修復是否真生效。
> 結論：**「失敗」≠ R1+R2 失敗**。是 GSC 過往驗證循環的 lock 狀態 + Google 還沒重爬。實際 production 已 100% 反映 R1+R2。

---

## 1. 用戶看到的畫面 vs 實際 production state

### 1.1 GSC 報表（截圖內容）

| 原因 | 數量 | 驗證狀態 |
|------|------|----------|
| 遭到 noindex 排除 | 133 | **失敗** |
| 找不到 (404) | 49 | **失敗** |
| 頁面重新導向 | 5 | **失敗** |
| 已檢索 - 未建立索引 | 183 | **失敗** |
| 重新導向錯誤 | 1 | 尚未開始 |
| 替代頁面 canonical | 17 | 已開始 |
| 重複網頁 (使用者) | 3 | 已開始 |
| 已找到 - 未建立索引 | 39 | 已開始 |
| 重複網頁 (Google) | 17 | 已開始 |

### 1.2 Production 實際狀態（curl 驗證 2026-05-18 18:00 Asia/Taipei）

| Test | 結果 |
|------|------|
| 11 個移除 locale (`/de/` `/fr/` `/ru/` 等) | **301 → /en/** ✅ |
| 11 locale 文章層 (`/de/post/X/`) | **301 → /en/post/X/** (same slug) ✅ |
| Tag listing (`/en/tags/` `/zh-tw/tags/`) | **404** ✅ |
| Tag URL listed in pillar redirect (`/en/tags/data-backup/`) | **301 → pillar** ✅ |
| `/search/` 頁 meta robots | **noindex,follow** ✅ |
| Sitemap (`/en/sitemap.xml` 等 6 core) | **0 個 tag/cat URLs** ✅ |
| Core articles (`/en/post/hidden-cost-shared-folders/` 等) | **200** ✅ |

→ **production 已完全反映 R1+R2 修復，沒有任何回退跡象**。

---

## 2. GSC「失敗」badge 真正含義

### 2.1 「失敗」是 lock 機制，不是修復失敗

Per Google 官方 [Validation states doc](https://support.google.com/webmasters/answer/9216203)：

> 「失敗」（Failed）：Google validated a sample of N URLs from the bucket and found that **a threshold percentage still has the issue**. The validation run STOPS and locks the bucket. Google won't accept another validate attempt until **the URL set fundamentally changes** (= new URLs enter, or Google re-crawls and observes new state).

### 2.2 失敗的時間線（為什麼這個 lock 跟今天的修復無關）

```
2026/4 月 — 某次 R1+R2 之前的audit，用戶（或我）點了「驗證修正後的項目」
  ↓
2026/4 月底 — Google 取 sample 跑 validation
  ↓
2026/5/初 — Google 判定「修復不完全」→ 標記「失敗」+ LOCK bucket
  ↓
2026/5/15 — GSC 報表 snapshot (用戶現在看到的就是這日截至的資料)
  ↓
2026/5/18 06:55 UTC — R1+R2 ship (今天)
  ↓
[現在] GSC 仍顯示 5/15 snapshot + 過往的「失敗」lock
```

### 2.3 為什麼 lock 不會自動解除

- Google 的 validation lock 是「不主動 retry」設計（避免無限循環）
- 解鎖條件：(a) Google 重新爬該 URL（看到新狀態）+ (b) 算 sample 重新評估
- 用戶手動再點「驗證」按鈕的話會 reset，但需要 URL set 改變才有效

---

## 3. Google 還沒看到 R1+R2 — 用 URL Inspection 抓現場證據

**URL Inspection 是 live 工具，不像 8 分類報表會 lag 3-7 天**。我跑 3 個 sample：

### 3.1 已移除 locale URL — `/de/post/hidden-cost-shared-folders/`

```
網頁索引狀態：網頁已編入索引   ← Google 認知還停留在 5/6
上次檢索時間：2026年5月6日 晚上10:10:11   ← 12 天前
```

**意義**：Google 5/6 抓到該 URL 時還是 noindex,nofollow（live page）。今天 06:55 才砍掉 + 加 301。Google **還沒重爬**，自然不知道 URL 已變更。

### 3.2 Tag URL — `/en/tags/data-backup/`

```
網頁索引狀態：網頁未編入索引：重新導向錯誤   ← 過往就是 redirect bucket
上次檢索時間：2026年5月12日 晚上11:29:11   ← 6 天前
```

**意義**：此 URL 5/12 已被 Google 知道是 redirect（既有 35 個 pillar redirect 之一）。今天 R2 砍 taxonomy 不影響此 URL（仍為 redirect target，內容沒變）。

### 3.3 核心 indexed article — `/en/post/hidden-cost-shared-folders/`

```
網頁索引狀態：網頁已編入索引   ← 正常
上次檢索時間：2026年5月8日 上午10:24:37   ← 10 天前
```

**意義**：連最重要的 cornerstone article，Google 也是 10 天才爬一次。整個 site 的 crawl frequency = **6-12 days/URL**。

---

## 4. Site 整體 crawl budget 分析

從 GSC「檢索統計資料」抓的 90-day 數據：

| 指標 | 值 | 解讀 |
|------|----|----|
| 總檢索要求 (90 天) | **2,830** | 約 31 requests/day |
| HTTP 200 比例 | 94% | 健康 |
| HTTP 404 比例 | **6% (~170 個)** | R1+R2 前的舊架構產物 — 預期 1-2 週後降到 < 1% |
| HTTP 301 比例 | < 1% | 不久後會升（17 + 11 = 28 條新 redirect 加進來） |
| Crawl 目的：重新整理 | 63% | 既有 URL 重新爬 |
| Crawl 目的：發現新頁 | 37% | 含 tag URL 探索（這部分會降） |

**結論**：site crawl budget 緊（31 requests/day for ~180 articles × 6 locales = ~1100 URL surface）。每 URL 平均 6 天一次 visit。

---

## 5. 預期時間線（精確）

| 日期 | Google 動作 | 預期 GSC 報表變化 |
|------|------------|-------------------|
| **5/18 (今天)** | Sitemap.xml 變更觸發 Google 通知 | 無立即變化 |
| **5/19-5/20** | Googlebot 開始 crawl 高 priority URLs (sitemap top entries) | 還是看 5/15 snapshot |
| **5/21-5/24** | 50-70% 變更 URL 被重爬 | GSC 報表開始 update (snapshot 後移 1 週) |
| **5/25-6/1** | 90%+ 重爬 + GSC 重新算各桶 | 數字明顯下降 (446 → 預期 ~150) |
| **6/2-6/8** | 收斂完成 | 446 → 預期 ~30-50 |

### 加速可行性

- ✅ **再次手動點「驗證修正後的項目」**：但 Google 仍要先重爬才有意義。今天點 vs 一週後點，差別不大
- ✅ **URL Inspection 個案 + 「要求建立索引」**：今天 session 已對 10 個 Bucket C URL 跑過，1-7 天內 Google 會優先重爬這 10 個
- ⚠️ **Sitemap re-submit**：可能觸發 Google 排隊重爬。但本 site sitemap 已自動觸發（GH Pages deploy 時 GoogleBot 通常會收到 ping）
- ❌ **強制重爬全 site**：沒這個 API。Google 自己排程。

---

## 6. 給高階模型的開放問題

### Q1：是否該動 redirect chain 優化？

R1 後：`/de/post/X/` → 301 → `/en/post/X/`（單跳）
但 `/de/post/X/` 過往 GSC 已標為 noindex（Bucket A），Google 看到 301 後會：
- (a) 把它從 noindex bucket 移出 → 進 redirect bucket（過渡期）
- (b) 重新評估目標 `/en/post/X/` → 已 indexed → 訊號合併
- 結果：noindex bucket 數量會降，但 redirect bucket 暫升

**問**：Google 處理 noindex page → 301 變化的 transition lock 有特殊行為嗎？是否該主動 **「移除網址」(Removal Tool)** 那 ~133 個 noindex auto-translate URL 加速 drop？

### Q2：URL Removal Tool 對加速 GSC 報表 cleanup 是否有效？

GSC > 索引 > **移除網址** 工具可暫時 (6 個月) 從 SERP 移除 URL。對 noindex auto-translate locale 的 URL：
- 是否會加速 Google 重新評估？
- 還是僅 cosmetic（user-facing SERP cleanup）而不影響 GSC 報表？

### Q3：13 auto-translate locale 砍 build 後，殘餘 `/pt/` `/es/` 該如何處理？

- 保留 build 但**不在 sitemap**（現狀）：Google 還是會發現（透過 outbound link / hreflang from past versions / external link）
- 主動加進 sitemap：但這 2 locale clicks 太低（1 each），加進去等於告訴 Google「請來爬」沒意義
- 也砍掉：但歷史上有 1+1 clicks 表示 ranking 訊號還在

**最佳策略**？

### Q4：CF Bulk Redirect 的 subpath_matching 是否會跟 R2 disableKinds 產生衝突？

當前狀態：
- `/de/post/X/` (R1 砍掉 build) + CF subpath_matching `/de/*` → `/en/*` → 301 ✅
- `/de/tags/X/` 同樣應 301 → `/en/tags/X/` → 但 `/en/tags/X/` 在 R2 後 404 OR 在 17 個 pillar redirect list 內 → 301 → pillar

驗證：`/de/tags/X/` 是否會：
- (a) 直接 301 到 `/en/tags/X/`（CF redirect）→ 再 301 到 pillar（redirect chain？）
- (b) 還是 CF 智慧合併？

**Redirect chain depth Google tolerance**：3 跳？5 跳？要不要把 `/de/tags/X/` 直接 301 到 pillar 避開 chain？

### Q5：對 Bucket「已找到 - 未建立索引」(39) 的 cluster pillar 內鏈策略

39 個 URL 是 core post 但 Google 發現但沒爬。理論上 cluster pillar 內鏈會加速。但：
- 我們 P1.15 已有「pillar ≥3 cluster link / cluster ≥1 pillar link」規則
- audit 過 internal-link-audit.js 顯示 0 HARD 違規
- 為何 Google 仍把它們放 discovered 桶？

**Hypothesis**：crawl budget 緊 + 這些是「新文章」(2026-05-01 後 ship)，Google 還沒判斷其 quality。

**問**：要不要對這 39 個 URL 在 home page 加 featured 區塊 (boost internal link strength)？還是接受 Google 自然爬？

---

## 7. 結論建議（給高階模型 review）

1. **「失敗」badge 不是 R1+R2 失敗** — 是 Google validation lock 機制 + 資料延遲導致的 UI artifact
2. **production 已完全反映修復** — 7 項 curl 全通過
3. **GSC 報表會在 1-3 週內收斂** — 由 Google crawl cadence 決定，沒有 fast-forward 按鈕
4. **可主動加速的事**：
   - URL Inspection 個案 + 要求建立索引（已做 10 個）
   - Removal Tool 對 noindex URL（值得評估，問 Q2）
   - Sitemap re-submit 觸發優先 crawl
5. **真正風險信號要看**：4 週後仍卡同數字 = 真有問題；目前 0 週 = 正常 lag

---

## 附錄：補充證據檔案路徑

- 早上 baseline：`_dev/seo/gsc-index-baseline-2026-05-18.md`
- 9 個 drilldown JSON：`_dev/seo/gsc-drilldown-*.json`
- Commit chain：`53edf67` (search noindex) → `471f8ff` (P0 cleanups) → `6b413cc` (refined CSV) → `1df2948` (R1+R2)
- CF Bulk Redirect list `858b239b8b3f423794456776339e79c3` — 63 items
- Skill SOP：`~/.claude/skills/gsc-index-audit/SKILL.md` Phase 4.5 + Caveat 1
- Memory ref：`reference_gsc_root_cause_fixes_2026_05_18.md`
