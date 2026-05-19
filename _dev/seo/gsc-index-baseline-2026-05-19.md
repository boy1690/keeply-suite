# GSC Index Baseline — 2026-05-19

> Property: `sc-domain:keeply.work` (Domain 資源，含 apex + blog + www)
> GSC report last update: **2026/5/15** (4 天 stale)
> Context: 今天 2026-05-19 完成 DNS cutover (GH Pages → CF Pages)，
> 本 baseline 全是 **pre-migration snapshot**，下次 audit (~2026-06-02) 才能 diff 看 CF Pages 影響

---

## 8 分類 + host split (estimated)

| # | 分類 | 數量 | State | host split estimate |
|---|------|:---:|---|---|
| 1 | 已檢索 - 目前尚未建立索引 | 186 | 失敗 | 預估 blog 主導（13 auto-translate locale × N article + 廢棄 taxonomy 殘留） |
| 2 | 遭到「noindex」標記排除 | 134 | 失敗 | 預估 blog 主導（auto-translate locale 上 noindex,follow per BWF） |
| 3 | 已找到 - 目前尚未建立索引 | 79 | 已開始 | 混合 |
| 4 | 找不到網頁 (404) | 55 | 失敗 | 預估 blog tag rename 殘留 + 部分 apex retired path |
| 5 | 替代頁面 (有適當的標準標記) | 35 | 失敗 | 預估 blog hreflang cluster 非 canonical 變體 |
| 6 | 重複網頁；Google 選不同 canonical | 18 | 已開始 | 混合 |
| 7 | 頁面會重新導向 | 6 | 失敗 | apex .html 308 redirect 落入此桶 |
| 8 | 重複網頁；使用者未選取標準網頁 | 3 | 已開始 | — |
| 9 | 重新導向錯誤 | 1 | 尚未開始 | — |
| | **總計未索引** | **517** | | |

⚠️ Host split column 是「依路徑特徵推估」，**不是 GSC API 真實 break-down**。Domain property 本身不提供 host split — 要看 sub-property (URL-prefix) 才能精確拆。下次 audit 可從 GSC drilldown URL list 用 hostname 過濾抓真實分布。

---

## Sitemap 健康度（curl 2026-05-19）

| URL | HTTP | XML valid | 備註 |
|---|:---:|:---:|---|
| https://keeply.work/sitemap.xml | 200 | ✅ 174 entries | 主站 sitemap |
| https://blog.keeply.work/en/sitemap.xml | 200 | ✅ index (1 entry) | 6 個 per-locale sitemap 都是 sitemap index 結構 |
| https://blog.keeply.work/it/sitemap.xml | 200 | ✅ index | |
| https://blog.keeply.work/ja/sitemap.xml | 200 | ✅ index | |
| https://blog.keeply.work/ko/sitemap.xml | 200 | ✅ index | |
| https://blog.keeply.work/zh-cn/sitemap.xml | 200 | ✅ index | |
| https://blog.keeply.work/zh-tw/sitemap.xml | 200 | ✅ index | |

All 7 sitemap URL CF Pages 後端 200 ✓ — 沒 migration 引起的 sitemap 失效。

---

## robots.txt 健康度

| Host | HTTP | sitemap directive |
|---|:---:|---|
| https://keeply.work/robots.txt | 200 | `Sitemap: https://keeply.work/sitemap.xml` |
| https://blog.keeply.work/robots.txt | 200 | `Sitemap: https://blog.keeply.work/sitemap.xml` |

---

## Host status

| Host | HTTP | Backend |
|---|:---:|---|
| https://keeply.work/ | 200 | CF Pages (keeply-website) ✅ live |
| https://blog.keeply.work/ | 200 | CF Pages (keeply-blog) ✅ live |
| https://www.keeply.work/ | 301 | 仍指 GH Pages CNAME (Phase 9 archive 前未動，redirect 預期生效) |

---

## Live HTML head check — 8 sample URLs

| URL | HTTP | robots meta | canonical |
|---|:---:|---|---|
| https://keeply.work/en/ | 200 | (none) | `https://keeply.work/en/` |
| https://keeply.work/en/buy | 200 | (none) | **⚠️ `https://keeply.work/en/buy.html`** (CF Pages auto-strip .html，但 canonical 仍指 .html) |
| https://keeply.work/ja/install | 200 | (none) | **⚠️ `https://keeply.work/ja/install.html`** (同上) |
| https://blog.keeply.work/zh-tw/post/deleted-file-not-in-recycle-bin/ | 200 | (none) | **🚨 (none)** — Hugo theme 沒輸出 canonical |
| https://blog.keeply.work/ja/post/excel-data-vanished-postmortem/ | 200 | (none) | **🚨 (none)** |
| https://blog.keeply.work/en/post/3-2-1-backup-rule/ | 200 | (none) | **🚨 (none)** |
| https://blog.keeply.work/de/post/hidden-cost-shared-folders/ | **301** | — | — (R1 部分生效，de locale article 301 出去) |
| https://blog.keeply.work/tags/tools/ | 200 | (none) | (none) — 無 locale prefix 的 tag listing |

### 🚨 finding 1 — Blog 所有 article 都缺 `<link rel="canonical">`
- Hugo `hugo-theme-stack` theme 或 head.html partial 沒輸出 canonical link
- 對 SEO 影響：Google 自己會猜 canonical，但失去主動 hint
- 對 GSC「重複網頁」桶可能有貢獻
- **不是 migration 造成的**，是 pre-existing
- → Phase 4 candidate（次要優先 — Google 自選 canonical 通常會猜對）

### ⚠️ finding 2 — Website canonical 指 .html 但 URL 已 strip .html
- `/en/buy` 200 + canonical `/en/buy.html`
- CF Pages auto-strip .html (308 redirect)
- 同個 page 兩條 URL 都 200 但 canonical 指向「會 308 的那條」
- 對 SEO 影響：輕微 — Google 可能跟 308 一次找到正確 page
- → 修法：build 時把 canonical 改成 no-.html 版本（apps/website `_dev/build.js` 或 inject-schema.js 改）

### finding 3 — `/de/post/X` 301
- R1 部分生效（11 auto-translate locale 已被結構性處理）
- 不是今天動的：keeply-blog 2026-05-18 session 已部分 disable locale
- 對 GSC 134 noindex 桶可能正在自然縮小

---

## 404 candidates 分類（GSC stale vs 真 404）

| URL | live HTTP | redirect target | classification |
|---|:---:|---|---|
| https://blog.keeply.work/zh-tw/tags/onedrive/ | 301 | `/zh-tw/post/dropbox-conflicted-copy/` | **B GSC stale** ✓ — P1.16.a tag rename SOP 工作中 |
| https://blog.keeply.work/en/categories/ | 404 | — | **A 設計** — disableKinds + 無 categories root redirect rule（可接受 / 或加 redirect to /en/） |
| https://blog.keeply.work/zh-cn/tags/ | 404 | — | **A 設計** — 同上，tag listing root 沒 redirect |

---

## 下次 audit 預期 diff（~2026-06-02）

| 桶 | 現在 | 預期 14 天後 | 為什麼 |
|---|:---:|:---:|---|
| 134 noindex | 134 | **可能降到 ~80-100** | Google 重 crawl 看到 11 個 auto-translate locale 已從 build 移除 → 從 noindex 桶 drop |
| 55 404 | 55 | **可能降到 ~30-40** | tag rename 301 已生效，GSC 重 crawl 後 drop stale |
| 186 crawled-not-indexed | 186 | **可能降到 ~120-150** | 部分 stale URL 被 drop；剩下是真 content quality issue |
| 79 discovered | 79 | **可能 ~80-110** | 新文章 deleted-file-not-in-recycle-bin 還沒 crawl 會進此桶；舊 stale 會 drop |
| 35 替代頁面 | 35 | **基本不變** | hreflang cluster 是 by-design |

---

## 下次 audit 要看的 metrics

1. 8 分類數字 vs baseline diff
2. 「上次更新日期」確認 GSC 已 re-crawl post-migration
3. Drilldown 抽樣：noindex 桶是否還是 13 locale path（vs 已縮小）
4. 「Crawled - not indexed」核心 article（zh-TW / en / ja / ko / it）vs auto-translate locale 比例
5. Sitemap submitted vs indexed 比例

---

## Pending decisions (post-baseline)

| Question | When to decide |
|---|---|
| R1 砍多少 locale（11 / 4 / 0） | Need GA4 90-day organic visits + GSC 90-day clicks per locale; ~2026-06-02 |
| R2 disable taxonomy fully | 看 baseline diff 後 tag/category URL 真實 click signal |
| Website canonical .html mismatch | 不急 — Google 跟 308 通常處理得來；下次 audit 看是否真進 GSC 重複桶 |
| Blog article 缺 canonical | Phase 4 candidate；Google 自選通常準；觀察是否進 GSC「重複網頁；Google 選不同」桶 |

---

## Skill used

[`~/.claude/skills/gsc-index-audit/SKILL.md`](C:\Users\billi\.claude\skills\gsc-index-audit\SKILL.md) v2026-05-18

Discussion doc: [`docs/gsc-audit-discussion-2026-05-19.md`](../../docs/gsc-audit-discussion-2026-05-19.md)
