# Cover Redesign Brief — 2026-05-13 copy-paste leak repair

> Designer-ready brief for **redesigning 4 article covers** on blog.keeply.work that shipped wrong.
> Status: ready for handoff. Author: Ting-Wei Tsao (<boy1690@gmail.com>). Created: 2026-05-13.
>
> **Scope**: 4 slugs × 6 locales = **24 new `cover.svg` + 24 new `cover.png`** = 48 交付件.
>
> **Sister brief**: [`tier-sa-image-insertion-brief.md`](tier-sa-image-insertion-brief.md) — body images for 16 articles (40 images × 5-6 locales). 兩份 brief 互補：本份處理「首頁 OG 縮圖 = cover」，sister brief 處理「文章內容圖 = body image」，brand grammar 不同（cover 走 `design-system/covers/`，body image 走 sister brief 自帶 spec）。

---

## 1. Why this brief exists

2026-05-13 user 在 blog.keeply.work 首頁看到「最新文章」+「精選」共 4 張 article cover 全是同一張 `photoshop-autosave-not-version-history` 的 zh-TW master cover。

Audit script `_dev/design/audit_covers.py` 撈出根因：

- 3 篇 article 的 `cover.svg` 是 byte-identical 的 photoshop-autosave master（md5 `fed631858b6f5eb88e6381ad1a04a1aa`），跨 6 locale × 3 篇 = **18 個錯 cover**
- 1 篇 article 完全沒 cover（6 locale 缺檔）= **6 個缺 cover**
- 合計 **24 個 broken cover 同時上線**

事故影響：cover 是首頁 first impression + Twitter/FB/LinkedIn share preview 的 og:image。同圖 ship = 首頁專業度信號崩盤 + 社群分享連結用錯圖 + Google Discover thumbnail 認知混淆。

**已加 hard-stop 防線**（防再發）：

- `_dev/design/audit_covers.py` — F1 缺檔 / F2 md5 重複 / F3 identifier 含其他 slug
- `~/.claude/commands/blg.md` Touch 4 step 8.5 — content/ sync 前 hard-stop
- `~/.claude/bwf/gates.md` GATE-4 #11 — checklist 新增 Cover Uniqueness

但這 24 個已 shipped 的 broken cover 必須由 designer queue 補。**本 brief = 那份補設計工作的交付契約**。

---

## 2. 4 個重設計的 slug + 視覺概念

每篇 cover 必須與該文 hook 直接對應、視覺獨一、跑 `audit_covers.py` 通過。

### Slug 1: `cloud-version-history-cliff`

| 欄位 | 內容 |
|---|---|
| 文章 title (zh-TW) | 【2026 檔案管理】比 iCloud 跟 Dropbox 之前先看：4 家雲端共通的版本歷史天花板 |
| Hook concept | 4 家雲端（iCloud / Dropbox / OneDrive / Google Drive）共通的 version-history retention cap；3 個月後想找客戶要那版叫不出來 |
| 建議 recipe | **cost-hero** 變體（巨型數字 + cliff drop 視覺） |
| 視覺錨點建議 | 大字 "3 MONTHS" 或 "30 / 100 / 500" version cap 數字 + 一條時間線在第 N 版掉下「懸崖」（amber → indigo 漸層斷崖） |
| amber highlight | 「斷崖」/「天花板」/「retention cap」 |
| Keeply lockup | 右下角固定位 |

### Slug 2: `deleted-files-recovery-list`

| 欄位 | 內容 |
|---|---|
| 文章 title (zh-TW) | 【2026 檔案管理】你不需要救援軟體，你需要一份「最近刪除」清單 |
| Hook concept | iOS / iCloud Drive / 備忘錄 / Outlook 都有「最近刪除」清單；Finder / 檔案總管 / Dropbox 本機資料夾沒有——這個 UX 模式偏偏缺在最需要的工具裡 |
| 建議 recipe | **shared-conflict** 變體（左右對比：有「最近刪除」按鈕 vs 沒有） |
| 視覺錨點建議 | 左半邊：手機 iOS Photos「最近刪除」UI mockup（綠色 ✅）；右半邊：桌面 Finder/Explorer 視窗內找不到「最近刪除」項目（紅色 ❌）；中間斷裂線（amber 閃電） |
| amber highlight | 「最近刪除」清單 |
| Keeply lockup | 右下角固定位 |

### Slug 3: `time-machine-vs-dropbox`

| 欄位 | 內容 |
|---|---|
| 文章 title (zh-TW) | 【2026 檔案管理】Time Machine vs Dropbox：backup、sync，跟兩者都不是的第三軸 |
| Hook concept | Time Machine = 空間冗餘；Dropbox = 同步冗餘；兩者都漏了第三軸——時間維度的故意存檔版本歷史 |
| 建議 recipe | **workflow-steps** 變體（3 軸圖示） |
| 視覺錨點建議 | 三條軸並列：(1) Time Machine 圖示 + 「空間」軸（indigo）／(2) Dropbox 圖示 + 「同步」軸（indigo）／(3) 留白的第三軸 + 「時間（版本）」標籤（amber 強調）+ Keeply lockup 對齊第三軸暗示「這軸是 Keeply 的位置」 |
| amber highlight | 「第三軸」/「故意存檔」 |
| Keeply lockup | 右下角固定位（也可與第三軸視覺對齊） |

### Slug 4: `keeply-first-week-workflow`

| 欄位 | 內容 |
|---|---|
| 文章 title (zh-TW) | 【2026 檔案管理】Keeply 教學：第一週什麼都不用做，用 7 天觀察日記驗證 3 個真實信號 |
| Hook concept | First-week trial diary — 不衝去設 wizard、用 7 天真實工作日驗證 3 個信號（自動版本追蹤 / 修改節奏 / 刪除復原） |
| 建議 recipe | **workflow-steps**（trial diary 時序 7 格 calendar） |
| 視覺錨點建議 | 大字 "DAY 1 → DAY 7" 或 7-day calendar grid，3 個 amber 圓點標在 Day 1（自動版本追蹤）/ Day 3-4（修改節奏）/ Day 7（刪除復原）；底部一行「裝完什麼都不用做」 |
| amber highlight | 「什麼都不用做」/「7 天觀察」 |
| Keeply lockup | 右下角固定位 |

---

## 3. Brand spec（canonical source）

**權威來源**：[`design-system/covers/README.md`](../../design-system/covers/README.md) + [`design-system/covers/symbols.svg`](../../design-system/covers/symbols.svg)。本 brief 不重複定義 brand grammar，照那兩個檔案走。

關鍵硬規則摘錄：

| 項目 | 規則 |
|---|---|
| Canvas | **1600 × 900**（16:9，Hugo stack theme 卡片同比例） |
| 色票 | indigo-900 / 700 / 600 / 400、lavender-100、amber-500 / 400（hex 在 README §色票） |
| 必有元素 | eyebrow（含分類 + EDITORIAL）／大字視覺錨點／subtitle（2 行含 amber tspan 強調詞）／檔名卡或角色群／Keeply lockup 右下／bottom note |
| Symbol 來源 | 從 `design-system/covers/symbols.svg` 複製 `<defs>` 和需要的 `<symbol>` 到新 SVG（inline 自包含，不跨檔 `<use>`） |
| SVG header comment | 第二行必有 `Cover: {slug} (zh-TW master / en / zh-CN / ja / ko / it)` — audit_covers.py 抓 identifier 用 |
| Brand 顏色不可變動 | 不准引入新顏色；新視覺概念全用既有色票組合 |

---

## 4. Per-locale i18n 規則

每個 launch locale 一份獨立 cover.svg，**文字翻成當地語言** + font-family 換成該 locale 對應字型鏈。

| Locale | font-family | 資料夾 |
|---|---|---|
| zh-TW（master）| `'Noto Sans TC','PingFang TC','Microsoft JhengHei',system-ui,sans-serif` | `content/zh-tw/post/{slug}/` |
| en | `'Inter','SF Pro Display',-apple-system,system-ui,sans-serif` | `content/english/post/{slug}/`（注意：是 `english/` 非 `en/`） |
| zh-CN | `'Noto Sans SC','PingFang SC','Microsoft YaHei',system-ui,sans-serif` | `content/zh-cn/post/{slug}/` |
| ja | `'Noto Sans JP','Hiragino Sans','Yu Gothic','Meiryo',system-ui,sans-serif` | `content/ja/post/{slug}/` |
| ko | `'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif` | `content/ko/post/{slug}/` |
| it | `'Inter','Segoe UI',system-ui,sans-serif` | `content/it/post/{slug}/` |

**翻譯範圍**（規則出自 `design-system/covers/README.md` §⚠️ Per-locale 翻譯強制規則）：

| 元素 | 是否翻譯 |
|---|---|
| eyebrow 分類前綴 | 翻譯。「EDITORIAL」可保留作品牌錨 |
| Hero subtitle（含 amber highlight）| 翻譯 |
| File card 標籤（LATEST / 最新）| 翻譯 |
| Cards caption | 翻譯 |
| Bottom subtitle（含 amber）| 翻譯 |
| Bottom note 末段 | 翻譯 |
| 內部 metadata（P1 CLUSTER / 6 LOCALES）| 可保留 universal English |
| Filename strings（如 `proposal_v7_FINAL.psd`）| 保留 universal（檔名跨文化都認得）|
| font-family | 換成 locale 對應字型鏈（見上表）|

**實作建議**：先做 zh-TW master，跑 i18n-apply.py（既有 pattern in `design-system/covers/i18n-apply.py`）對應 i18n.json schema 套字串產 5 locale variant，不要 6 份 SVG 手寫。每篇 cover 一份 per-slug i18n schema 條目（schema 8 欄位在 `i18n.json` `_fields` 區）。

---

## 5. File naming convention

```text
content/{locale}/post/{slug}/cover.svg
content/{locale}/post/{slug}/cover.png
```

注意：`en` locale 資料夾是 `english/`（非 `en/`），其餘 5 locale 為 BCP-47 lowercase（`zh-tw`, `zh-cn`, `ja`, `ko`, `it`）。

每個 post 是 Hugo page bundle — `index.md` + `cover.svg` + `cover.png` 同一資料夾。

---

## 6. Deliverable list（24 cover.svg + 24 cover.png = 48 檔）

| Slug | Locale | cover.svg 路徑 | cover.png 路徑 |
|---|---|---|---|
| `cloud-version-history-cliff` | zh-TW | `content/zh-tw/post/cloud-version-history-cliff/cover.svg` | `cover.png` 同目錄 |
| `cloud-version-history-cliff` | en | `content/english/post/cloud-version-history-cliff/cover.svg` | ↑ |
| `cloud-version-history-cliff` | zh-CN | `content/zh-cn/post/cloud-version-history-cliff/cover.svg` | ↑ |
| `cloud-version-history-cliff` | ja | `content/ja/post/cloud-version-history-cliff/cover.svg` | ↑ |
| `cloud-version-history-cliff` | ko | `content/ko/post/cloud-version-history-cliff/cover.svg` | ↑ |
| `cloud-version-history-cliff` | it | `content/it/post/cloud-version-history-cliff/cover.svg` | ↑ |
| `deleted-files-recovery-list` | × 6 locale | 同上 pattern | ↑ |
| `time-machine-vs-dropbox` | × 6 locale | 同上 pattern | ↑ |
| `keeply-first-week-workflow` | × 6 locale | 同上 pattern | ↑ |

---

## 7. Production checklist (per slug)

1. 讀 `design-system/covers/README.md` recipe 區 → 對照 §2 視覺概念挑 recipe
2. 從 `design-system/covers/symbols.svg` 複製需要的 `<defs>` + `<symbol>` 區塊
3. 設計 zh-TW master cover.svg（1600 × 900，brand 色票，含 §3 必有元素）
4. SVG 第二行加 `Cover: {slug} (zh-TW master)` header comment
5. 寫 per-slug i18n schema 條目（8 欄位）到 `design-system/covers/i18n.json`
6. 跑 `python design-system/covers/i18n-apply.py {slug}` 產 5 locale variant SVG
7. 跑 `bash design-system/covers/generate-png.sh {slug}` 產 6 locale × cover.png
8. 跑 `python _dev/design/audit_covers.py --slug {slug}` 必須 exit 0
9. 跑 `hugo --gc --minify` 必須 exit 0
10. 截圖 6 locale × 1 thumbnail 給 user 視覺驗收

---

## 8. Definition of Done

- [ ] 4 slug × 6 locale × 2 file = **48 個檔案全到位**
- [ ] `python _dev/design/audit_covers.py` 全 repo exit 0（不只 --slug 模式）
- [ ] `hugo --gc --minify` exit 0
- [ ] `public/{locale}/post/{slug}/index.html` × 24 個本地 build 出來、`<meta property="og:image">` 指向新 cover.png
- [ ] User 視覺驗收 4 個 zh-TW master 的設計概念對應 §2 narrative
- [ ] 部署到 production 後 OG 快取刷新：`bash scripts/refresh-og-cache.sh {slug} --open` × 4 slug

---

## 9. Out of scope

| 不處理 | 原因 |
|---|---|
| Body images for these 4 slugs | 走 sister brief `tier-sa-image-insertion-brief.md` |
| 既有 19 篇 cover audit | F1/F2/F3 都過了的不重做（audit script 不會 flag） |
| 新增 symbols.svg 零件 | 若 4 個新 cover 設計過程中要新元素，加進 symbols.svg 是延伸工作，不算 brief scope |
| Frontmatter / index.md 更動 | 4 篇 index.md 已有 `image: cover.svg` + `og_image: cover.png`，cover 檔案 swap 即可 |
| 第 5+ locale（de / fr / es 等 13 auto-translate locale）| 6-locale core publish baseline 之外是 v0.2_deferred |

---

## 10. Open questions（before kickoff）

1. **Recipe / 視覺概念可否 push back**？§2 的 recipe 建議基於 hook narrative，designer 若有更強視覺方案歡迎 propose。Push back 走 GitHub issue 或本 brief PR comment。
2. **i18n.json schema 是否要重構為 per-slug 檔**？目前 i18n.json 是 single shared file（schema for one cover-concept），4 篇新 cover 加進去後會塞滿、難維護。建議 designer 第一篇做完前提案 schema 重構（例：`i18n/{slug}.json` per file）。延伸工作不算本 brief scope，但會影響交付路徑。
3. **`generate-png.sh` 需不需要升級**？目前 script 是 batch 全站，4 個 slug 用 `--slug` 模式跑會比較快——若 script 還不支援 single-slug mode，先請 designer 確認、本 brief 結束後加 patch。
4. **MVP path?** 4 篇全做 = 48 檔，估 1 sprint（1-2 週 designer 時間）。若要先 ship 1 篇驗證流程，建議優先做 `deleted-files-recovery-list`（精選 + 最新都被它佔，最痛）。
5. **Audit script 是否要進 CI**？目前 `audit_covers.py` 是手動 / `/blg` Touch 4 step 8.5 hard-stop；可加進 GitHub Actions pre-deploy step 永久 enforcement，避免未來再有人手動 git push 帶 broken cover。

---

> 文件版本：v1（2026-05-13）。Sister to `tier-sa-image-insertion-brief.md` v3.
>
> **更新觸發**：4 slug 全部 ship 後，append 「Closeout」section 記錄實際工時 / push-back / recipe 變動，供下次有類似事故時 reference。
