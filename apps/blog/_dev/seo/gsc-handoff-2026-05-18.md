# GSC Audit 2026-05-18 — Handoff for user manual steps

> Session 已自動執行 1-5。剩 6-8 是需要 CF dashboard 登入 / 跨 repo decision 的事項。

## ✅ Done autonomously

1. **`/search/` noindex code fix** — [layouts/_partials/head.html](../../layouts/_partials/head.html) 加 `.Params.robots` 優先級 → 6 個 pagefind 搜尋頁終於 noindex
2. **GH Pages deploy** — commit `53edf67` pushed 已 live (build 47s)
3. **URL Inspection batch (11)** — 透過 Playwright auto submit 給 Google：

   | Property | URL | Action |
   |----------|-----|--------|
   | blog (url-prefix) | en/post/deleted-files-recovery-list/ | already INDEXED ✅ |
   | blog | en/post/windows-file-history-vs-backup/ | requested ⏳ |
   | blog | en/post/onedrive-version-history/ | requested ⏳ |
   | blog | en/post/time-machine-vs-dropbox/ | requested ⏳ |
   | blog | en/post/windows-file-history-wrong-version/ | requested ⏳ |
   | sc-domain | keeply.work/compare/email-usb.html | requested ⏳ |
   | sc-domain | keeply.work/compare/filename-chaos.html | requested ⏳ |
   | sc-domain | keeply.work/compare/google-drive.html | requested ⏳ |
   | sc-domain | keeply.work/compare/snowtrack.html | requested ⏳ |
   | sc-domain | keeply.work/compare/time-machine.html | requested ⏳ |
   | sc-domain | keeply.work/zh-TW/compare/email-usb.html | requested ⏳ |

   通常 1-7 天內 Google crawl + index。下次 audit 查 Bucket C 應降 ~10-12 URL。
4. **Baseline + 25 redirect CSV + skill 修正** — commit `53edf67` 已 push

## 🔧 To do — user manual (3 件 CF dashboard 操作)

### 步驟 A — blog.keeply.work 25 個真 404 → pillar/locale redirect

**為什麼需要 user**：CF List API 需 `Account.Account Filter Lists Edit` token，目前只有 Zone/Cache/Purge token。

1. 登入 Cloudflare → 切到 **keeply.work zone**
2. 左側 → **Rules** → **Bulk Redirects**
3. 找既有 list `blog_keeply_tag_404_redirects_2026_05_11`
4. **Import CSV** → upload [`_dev/seo/cloudflare-bulk-redirects-2026-05-18.csv`](cloudflare-bulk-redirects-2026-05-18.csv) (25 條：17→pillar / 8→locale 首頁)
5. 確認 25 條 rule status = Active
6. 驗證範例：
   ```bash
   curl -I "https://blog.keeply.work/zh-cn/tags/winget/"
   # 預期: 301 → /zh-cn/post/install-keeply-windows-mac/
   curl -I "https://blog.keeply.work/zh-cn/tags/救回文件/"
   # 預期: 301 → /zh-cn/post/deleted-files-recovery-list/
   ```

### 步驟 B — keeply.work apex 6 個 `/compare/{X}.html` 404 → CF Redirect Rule

apex `/compare/{contact,buy,activate,refund,terms}.html` 全 404（推測 Google 從舊版 cache 殘留發現）。CSV 在 keeply-website session 處理較合適，但這裡先給 spec：

**CF Redirect Rule (keeply.work zone, NOT Bulk List — 用 Single Redirect)**:

```
Rule name: /compare/X.html stale 404 → /X.html
When incoming requests match:
  (http.request.uri.path matches "^/compare/(contact|buy|activate|refund|terms)\.html$")
Then:
  Type: Static
  URL: concat("https://keeply.work/", regex_replace(http.request.uri.path, "^/compare/", ""))
  Status code: 301
```

注：CF Free 不支援 regex `matches`（[memory ref](../../CLAUDE.md#cloudflare-free-plan-limits)）— 改用 6 條獨立 Static rule：
```
http.request.uri.path eq "/compare/contact.html" → "https://keeply.work/contact.html" 301
http.request.uri.path eq "/compare/buy.html" → "https://keeply.work/buy.html" 301
http.request.uri.path eq "/compare/activate.html" → "https://keeply.work/activate.html" 301
http.request.uri.path eq "/compare/refund.html" → "https://keeply.work/refund.html" 301
http.request.uri.path eq "/compare/terms.html" → "https://keeply.work/terms.html" 301
```
(`/compare/contact.html` 不確定 `/contact.html` 是否存在 — 若 404 改 → `/`)

### 步驟 C — GSC 驗證觸發（24h 後 CF redirect 已 propagate）

1. GSC → blog property → 「網頁索引狀態」
2. 點「找不到網頁 (404)」row → drilldown
3. 點「驗證修正後的項目」(若 button 可用)
4. 2-3 週內 49 條 404 應 GSC 報表消失（25 條走新 redirect，24 條既有 redirect 已生效）

## 📊 預期下次 audit (1-2 週後)

| 指標 | 現在 | 步驟 A+B+C 後預期 |
|------|------|---------------------|
| blog 未建立索引 | 446 | ~370（步驟 A 拿掉 49 個 404，URL Inspection 10 收 5-8 進 indexed） |
| blog 已建立索引 | (含 search 6) | -6（search 出列）+ 5~8 = ~+0 |
| apex discovered | 40 | -10 URL Inspection -6 步驟 B + 自然 = ~ 20 |

## 🔒 未解 — 16 個 apex /{locale}/activate.html

全 16 個 locale activate.html 已 `noindex,follow` 設計，但卡在「已找到 - 未建立索引」。Google 還沒 crawl，crawl 後會自動轉到「noindex 排除」桶 → Bucket A，不需動作。

## 📝 Skill 已更新

`~/.claude/skills/gsc-index-audit/SKILL.md` 加 5 個 lesson learned（item_key rotate / page-size 500 / Unicode pollution / subprocess CJK / Caveat 1 鎖死 reality）+ Candidate 5 (theme template `.Params.robots` 漏讀)。下次 audit 直接走 skill。
