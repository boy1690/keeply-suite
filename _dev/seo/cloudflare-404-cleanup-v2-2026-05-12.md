# 404 cleanup v2 — 重寫 redirect 策略避免 soft 404

> 2026-05-12 GSC 報告 27 個 404 / 上一版 v1 ([cloudflare-bulk-redirects-2026-05-11.csv](cloudflare-bulk-redirects-2026-05-11.csv)) 全部 301 → locale 首頁，**這違反 Google 官方建議**：「Don't redirect a deleted page to irrelevant content or your homepage, as Google could see this as a soft 404, providing no SEO benefit」([Intero Digital](https://www.interodigital.com/blog/the-complete-guide-to-redirecting-deleted-pages-301-404-or-410/))。

## v1 vs v2 對照

| 項目 | v1 (2026-05-11) | v2 (2026-05-12) |
|---|---|---|
| 規則數 | 20 | 19（合併兩條 typo dup） |
| 301 → 首頁 | ✅ 20 條 ❌ soft 404 風險 | ❌ 0 條 |
| 301 → 相關 pillar article | 0 條 | ✅ 19 條 |
| 410 Gone | 0 條 | 0 條（每條失效 tag 都有 topic-matching article） |
| SEO link equity 流向 | 全部稀釋進首頁 | 集中灌進 9 個 cluster pillar |

## 分類方法

每條失效 tag URL 對應一個 topic — 找該 locale 已 ship 的最相關 article 作為 301 target。20 篇 article × 6 locale parity 已確認，每篇 target URL 都 live HTTP 200。

## 19 條 redirect 對照表

| # | 失效 URL（解碼後） | Topic | 301 target | 對應 Keeply cluster |
|---|---|---|---|---|
| 1 | `en/tags/data-backup/` | data backup | `/en/post/3-2-1-backup-rule/` | backup-strategy pillar |
| 2 | `en/categories/backup-strategy/` | backup category | `/en/post/3-2-1-backup-rule/` | backup-strategy pillar |
| 3 | `zh-tw/tags/onedrive/` | OneDrive 同步 | `/zh-tw/post/dropbox-conflicted-copy/` | cloud-sync cluster |
| 4 | `zh-tw/tags/工地管理/` | 工地 / 營造 | `/zh-tw/post/autocad-wrong-version-crew/` | construction cluster |
| 5 | `zh-tw/tags/delivery-note/` | 送貨單 / 出貨單 | `/zh-tw/post/client-asked-which-version/` | client-deliverable cluster |
| 6 | `zh-tw/tags/time-machine/` | macOS Time Machine | `/zh-tw/post/file-version-management-complete-guide/` | version-management pillar |
| 7 | `zh-cn/tags/onedrive/` | OneDrive 同步 | `/zh-cn/post/dropbox-conflicted-copy/` | cloud-sync cluster |
| 8 | `zh-cn/tags/keeply/` | Keeply 品牌 | `/zh-cn/post/keeply-getting-started-from-zero/` | onboarding pillar |
| 9 | `zh-cn/tags/excel/` | Excel | `/zh-cn/post/excel-version-history-limits/` | excel cluster |
| 10 | `zh-cn/tags/delivery-note/` | 送货单 | `/zh-cn/post/client-asked-which-version/` | client-deliverable |
| 11 | `ja/tags/版数履歴/` | 版本歷史 | `/ja/post/file-version-management-complete-guide/` | version-management pillar |
| 12 | `ja/tags/データバックアップ/` | data backup | `/ja/post/3-2-1-backup-rule/` | backup-strategy pillar |
| 13 | `ja/tags/autosave/` | autosave | `/ja/post/photoshop-autosave-not-version-history/` | photoshop cluster |
| 14 | `ja/tags/autocad/` | AutoCAD | `/ja/post/autocad-wrong-version-crew/` | construction cluster |
| 15 | `ja/tags/delivery-note/` | 送り状 | `/ja/post/client-asked-which-version/` | client-deliverable |
| 16 | `ko/tags/현장-관리/` | 현장 관리 | `/ko/post/autocad-wrong-version-crew/` | construction cluster |
| 17 | `ko/tags/delivery-note/` | 거래 명세서 | `/ko/post/client-asked-which-version/` | client-deliverable |
| 18 | `ko/tags/macos/` | macOS | `/ko/post/install-keeply-windows-mac/` | onboarding pillar |
| 19 | `it/tags/software-per-note-sui-file/` | file note software | `/it/post/file-version-management-complete-guide/` | version-management pillar |

## Cloudflare 上傳步驟（user 手動）

1. 登入 Cloudflare → keeply.work zone → **Rules → Redirect Rules → Bulk Redirects**
2. 找 list `blog_keeply_tag_404_redirects_2026_05_11`（v1 上傳目的地）
3. **Delete** 現存 v1 entries（如果有）— 或建新 list `blog_keeply_tag_404_redirects_2026_05_12`
4. Import 本目錄下的 [cloudflare-bulk-redirects-2026-05-12.csv](cloudflare-bulk-redirects-2026-05-12.csv)
5. 確認 19 條 rule status = **Active**
6. 驗證：`curl -I https://blog.keeply.work/en/tags/data-backup/` → 預期 `HTTP/2 301` + `location: https://blog.keeply.work/en/post/3-2-1-backup-rule/`

## v1 CSV 處置

[cloudflare-bulk-redirects-2026-05-11.csv](cloudflare-bulk-redirects-2026-05-11.csv) 留在 repo 作歷史紀錄（commit `abbe3e1`），檔名加註 `-deprecated`？暫時保留原檔名 — README 已 link。等 v2 部署生效 1 週後可改名或刪除。

## GSC 驗證流程

部署 24 小時後：
1. GSC → 索引 → 網頁 → 「找不到網頁 (404)」分類
2. 點「驗證修正」(Validate Fix)
3. 通常 2-3 週內 27 個 404 會從報告消失（Google 重新爬取確認 301 後）

## P1.16.a SOP 更新提示

CLAUDE.md `P1.16.a Tag 改名 / 移除 SOP` 目前寫：「把舊 URL 加進 CSV → 301 → 該 locale 首頁」。下次 SOP revise 時應改為：
> 把舊 URL 加進 CSV → 301 → **該 tag 主題對應的 cluster pillar article**（不是 locale 首頁）。若該 tag 無對應 article，才走 410 Gone。

理由：避免 Google 視為 soft 404。
