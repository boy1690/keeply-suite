# GSC Index Audit Baseline — 2026-05-18

GSC 上次更新：2026-05-15 (per drilldown 顯示)
Account: boy1690@gmail.com
Properties audited: `https://blog.keeply.work/` (url-prefix) + `sc-domain:keeply.work` (Domain, apex remains after filtering blog)

## 全域數字快照

| Property | 已建立索引 | 未建立索引 |
|----------|-----------|------------|
| blog.keeply.work | (n/a — 看 sc-domain) | **446** |
| sc-domain:keeply.work | 517 | 726 |
| → 純 apex (keeply.work, 非 blog) | (n/a) | **~280** |

## blog.keeply.work — 9 分類細項

| # | 分類 | 數量 | 驗證狀態 | Bucket | 主因 |
|---|------|------|---------|--------|------|
| 1 | 遭到 noindex 標記排除 | 133 | 失敗 (2026-05-16) | **A 設計** | 69 tag + 9 cat + 49 auto-translate post + 5 auto-translate home |
| 2 | 找不到網頁 (404) | 49 | 失敗 | **B stale** | 23/49 已 CF 301 stale，25 真 404 待補 redirect |
| 3 | 替代頁面 canonical | 17 | 已開始 | A 設計 | 17 tag 變體 (hreflang alternate) |
| 4 | 頁面會重新導向 | 5 | 失敗 | B stale | 5 tag URL 已 301，等 GSC 收 |
| 5 | 已檢索 - 未建立索引 | 183 | 失敗 | **A 設計** | 143 tag + 27 cat + 13 sitemap/RSS XML |
| 6 | 重新導向錯誤 | 1 | 尚未開始 | 查 | 1 URL，未細追 |
| 7 | 重複網頁；使用者未選 | 3 | 已開始 | A 設計 | 3 cat |
| 8 | 已找到 - 未建立索引 | 39 | 已開始 | **C 真 bug** | **33 核心 locale post** + 5 search/ + 1 cat |
| 9 | 重複網頁；Google 選不同 | 17 | 已開始 | A 設計 | 17 cat |

**Bucket 分布**：
- A 設計（GSC 自會收）：133 + 17 + 183 + 3 + 17 = **353 / 446 (79%)**
- B stale（要 fix CF + validate）：49 + 5 = **54 (12%)**
- C 真 bug（要 push index）：39 (含 5 search/ + 1 cat) = **39 (9%)**

## sc-domain (apex keeply.work) — 大噪音

| 分類 | apex 數量 | 主因 / Bucket |
|------|-----------|--------------|
| 已找到 - 未建立索引 | **40** | 10 `/compare/*.html` indexable + 16 `/activate.html` noindex(會自然轉) + 14 privacy/terms |
| 找不到網頁 | 6 | 5 `/compare/{contact,buy,activate,refund,terms}.html` + 1 cdn-cgi noise |
| 其他類別 | ~234 | 未細究 (替代頁面 18 / dup 1) |

## 已執行的修復

### Code-side（commit pending）
- ✅ **[layouts/_partials/head.html](layouts/_partials/head.html)** — 加 `.Params.robots` honor 優先級
  - **影響**：`/{6 locale}/search/` 6 個 pagefind 搜尋頁終於輸出 `<meta name=robots content="noindex,follow">`
  - 之前 frontmatter `robots: noindex,follow` 寫了但模板沒讀，搜尋頁全 indexable = Google 抓 thin-content
  - 本機 build verified：搜尋頁 noindex 出來，其他 page type 行為不變

### Auto-fix（pending user）
- 📝 **[_dev/seo/cloudflare-bulk-redirects-2026-05-18.csv](_dev/seo/cloudflare-bulk-redirects-2026-05-18.csv)** — 25 真 404 URL → `/{locale}/` 301
  - 對應 blog property Bucket B 25 真 404
  - Upload to CF list `blog_keeply_tag_404_redirects_2026_05_11` via dashboard or API
- ❌ **GSC 點驗證 button 全鎖**：5 個 noindex/crawled-not-indexed/redirect/dup 類別都已 "驗證失敗" (Google 2026-05-12→05-16 跑過上一輪)，目前不能再 trigger（需冷卻）

## 待 user 拍板

### CF redirects（兩個 CSV）
1. blog: 25 真 404 → `/{locale}/` (`_dev/seo/cloudflare-bulk-redirects-2026-05-18.csv`)
2. apex (待 keeply-website session 開新 CSV): 6 個 `/compare/{contact,buy,activate,refund,terms}.html` → `/{name}.html`

### Bucket C URL Inspection (rate-limit ~10/day)
建議優先序：
1. `https://blog.keeply.work/en/post/{deleted-files-recovery-list, onedrive-version-history, time-machine-vs-dropbox, windows-file-history-vs-backup, windows-file-history-wrong-version}/` (5 EN flagship)
2. apex `/compare/{email-usb, filename-chaos, google-drive, snowtrack, time-machine}.html` (5 EN compare landings)
3. apex `/zh-TW/compare/*.html` (5 zh-TW compare)
4. blog `/ja/post/`、`/ko/post/`、`/zh-cn/post/` (剩餘 28 ≈ 3 天分批)

### keeply-website code-side
- 確認 `/{locale}/activate.html` noindex 是有意設計（看似是 — 16 個 locale 全 noindex）
- 6 個 apex 404 `/compare/{contact,buy,...}.html` 不在當前 keeply-website source（href 全絕對），可能是舊版本 stale 殘留 → CF redirect 處理

## 下次 audit 預期 (1-2 週後 GSC 報表更新)

| 指標 | 現在 | 預期 |
|------|------|------|
| blog 未建立索引 | 446 | ~350 (search page 6 出 indexable bucket、CF 25 redirect 收效 → 移到 B "redirect" 暫態) |
| blog 已建立索引 | (含 search 6) | 持平或微降（search 6 移走但 35 個自動翻譯 post 應該慢慢被 noindex,nofollow drop） |
| apex discovered | 40 | 期望 < 20 (URL Inspection 10 + 自然 crawl 部分) |

## Fact-checked caveat 觀察

- **Caveat 1 過度樂觀**：實測「點驗證 noindex 類別 → Other state」不總是發生。本 audit blog noindex 類別「驗證失敗」狀態 = Google 確認 noindex 仍在 → 沒進 Other = 報表沒清。需修 skill 描述。
- **Caveat 4 印證**：head.html 2026-05-15 `noindex,follow → nofollow` 已 ship，但本 audit 仍見 35+ 自動翻譯 post 卡在 noindex 類別 — long-term 收斂中。
- **新發現**：GSC drilldown 頁面 size 必須點選 500 才看全 sample；預設 10 看不到任何 URL 的 lazy-load 狀況。Skill 要加 hard rule。
- **新發現**：URL 從 `td.textContent` 抓會混入 Private-Use Area Unicode 字元（U+E20D 等），需清洗才能 curl。Skill 要加 helper。
- **新發現**：item_key 在不同 GSC session 會 reuse —— CAMYDSAC 一次是 404、一次是 noindex。**不可緩存 mapping 跨 session**，必每次重抓。
