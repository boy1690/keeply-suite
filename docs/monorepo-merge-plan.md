> ## ✅ Status: Phase 1–8 完成 (2026-05-19)
>
> | Phase | Done | Note |
> |---|:---:|---|
> | 1. Umbrella init | ✅ | `boy1690/keeply-suite` created |
> | 2. Subtree import | ✅ | blog + website history preserved (423 commits) |
> | 4. CLAUDE.md split | ✅ | root + apps/blog + apps/website |
> | 5. Memory consolidation | ✅ | 108 files in `~/.claude/projects/d--tools-doing-keeply-suite/memory/` |
> | 6. Path updates | ✅ | hooks + skill `BLOG_ROOT` + settings.json |
> | 7. Local validation | ✅ | both apps build clean |
> | 3A. CF Pages preview | ✅ | wrangler created projects + GH Actions auto-deploy + CF API token + GH secrets |
> | 8. DNS cutover | ✅ | blog.keeply.work + keeply.work apex → CF Pages |
> | 9. Archive old repos | ⏳ ~2026-06-18 | keep 30 days for rollback |
>
> **Live URLs**:
> - https://keeply.work/
> - https://blog.keeply.work/
>
> **Remaining decisions** (post-Phase-8):
> - `www.keeply.work` still → boy1690.github.io (decide: delete CNAME / redirect to apex / add CF Pages domain)
> - Old GH Actions in `keeply-blog` / `keeply-website` repos still cron-running; ported to suite — risk of duplicate run until Phase 9 archive
>
> The original plan body follows for historical reference.

---

# Migration Plan: keeply-blog + keeply-website → `keeply-suite` monorepo

> **Status**: draft 2026-05-19 — pending review (user + ChatGPT)
> **Author**: Claude (keeply-blog session)
> **Motivation**: user pain — `keeply.work` 和 `blog.keeply.work` 在使用者眼中是同一個產品的同一個網域，但 dev workflow 上分 2 個 repo / 2 個 Claude session，導致跨 repo coordination 漏抓（例：2026-05-19 article ship 後才發現 `keeply.work/about` 404）

---

## 0. 現況快照（base evidence）

| | keeply-blog | keeply-website |
|---|---|---|
| Engine | Hugo 0.160.1 extended (Go) | Vanilla HTML + Node build (Tailwind + 自寫 `_dev/build.js` + fingerprint + SRI) |
| Build cmd | `hugo --gc --minify` | `npm run build` (8-step pipeline) |
| Deploy target | GitHub Pages → `blog.keeply.work` | GitHub Pages → `keeply.work` (apex CNAME) |
| Branch | `main` | `master` |
| GitHub repo | boy1690/keeply-blog | boy1690/keeply-website |
| Cloudflare zone | shared `keeply.work` zone (CF_ZONE_ID 同) ✅ |
| i18n schema | Hugo `content/{locale}/post/{slug}/index.md` (+ TOML config) | `/i18n/{locale}.json` + `/{locale}/*.html` page bundles |
| Locale count | 19 (en/zh-tw/zh-cn/ja/ko/de/es/fr/it/pt/ru/nl/pl/tr/vi/th/id/ar/hi) | 19+ (cs/da/de/en/es/fi/fr/hu/it/ja/ko/nl/no/pl/pt/ro/ru/sv/th/tr/uk/vi/zh-cn/zh-tw) |
| Total pages | 30+ article × 19 ≈ 500+ | 8 page × 19 ≈ 150 |
| Specs dir | `specs/{slug}/` (BWF — intent.md / angle.md / skeleton.md / final.{locale}.md) | `specs/{number}-{name}.md` (numbered, e.g., `108-buy-success-page.md`) + `_archive/` + `infra/` + `website/` |
| Hook/skill infra | `.claude/hooks/keeply-mock-audit.py` etc. + `~/.claude/skills/keeply-mock-ui` + project memory `~/.claude/projects/d--tools-doing-keeply-blog/memory/` | 推測類似 + project memory `~/.claude/projects/d--tools-doing-keeply-website/memory/` |
| Project memory | `d--tools-doing-keeply-blog/` | `d--tools-doing-keeply-website/` + `d--tools-doing-keeply-workspace/` (existing umbrella attempt?) |

**Hard 技術限制**：
- GitHub Pages 限 1 repo = 1 Pages site → monorepo 不能直接共用 2 個 CNAME
- 必須選一：(a) 兩個都搬 Cloudflare Pages（CF Pages 支援 1 repo 多 project），或 (b) 一個留 GH Pages、一個搬 CF Pages
- Engine 不合（Hugo vs Vanilla HTML+Node）— 不嘗試統一 build

---

## 1. Goal / Non-goal

### Goal
1. 單一 git working tree、單一 Claude session 可看到兩邊 source
2. CLAUDE.md 共享：根規則（cross-app rules）+ 各 app 自己的 sub-CLAUDE.md
3. Memory 收斂：1 個 project memory 給 umbrella，知道兩邊文件 + 規則
4. cross-ref 寫死的 URL（例：`keeply.work/about`）在同 working tree 直接看得到
5. 兩邊各自的 deploy pipeline 維持獨立（不互相 block）
6. Cloudflare zone 共享狀態維持

### Non-goal（明確不做）
- ❌ 把 Hugo 轉成 vanilla HTML（或反過來）— engine 維持各自
- ❌ 統一 i18n schema — 兩邊 content model 完全不同，硬合 = 重寫整站
- ❌ 收斂成單一 CNAME / 單一 GitHub Pages site — 技術不允許
- ❌ 把 19 locale 對齊到完全一致集合（細微差異存在，比如 blog 沒 cs/da/fi，website 沒 ar/hi）
- ❌ 一次性 cutover — 採漸進式遷移

---

## 2. Target structure

```
keeply-suite/                          ← 新 umbrella repo (github.com/boy1690/keeply-suite)
├── CLAUDE.md                          ← root（cross-app rules：cross-ref URL lint、share Cloudflare zone、共用 memory 規則）
├── README.md                          ← 解釋兩個 app
├── .github/
│   └── workflows/
│       ├── deploy-blog.yml            ← paths: ['apps/blog/**']，deploys to {target tbd}
│       ├── deploy-website.yml         ← paths: ['apps/website/**']，deploys to {target tbd}
│       └── lint-cross-refs.yml        ← 跑 URL 200 lint 在 PR
├── .claude/
│   ├── hooks/                         ← 共用 hooks（keeply-mock-audit.py 等）
│   └── settings.json                  ← 共用權限
├── apps/
│   ├── blog/
│   │   ├── CLAUDE.md                  ← blog-specific 規則（保留現 keeply-blog/CLAUDE.md 內容）
│   │   ├── hugo.toml
│   │   ├── content/{locale}/post/
│   │   ├── specs/{slug}/              ← BWF artifacts
│   │   ├── _dev/                      ← blog 專用 scripts (cf-purge.js / language-consistency-audit.py 等)
│   │   ├── themes/
│   │   └── ...
│   └── website/
│       ├── CLAUDE.md                  ← website-specific 規則
│       ├── package.json
│       ├── _dev/                      ← website 專用 scripts
│       ├── i18n/
│       ├── {locale}/                  ← static page dirs (en/ja/zh-tw/...)
│       ├── specs/                     ← numbered specs (108-buy-success-page.md 等)
│       ├── cloudflare/
│       └── ...
├── shared/                            ← 兩邊共用的 SOP / 圖
│   ├── design/                        ← brand assets (logo / cover system / mascot)
│   ├── seo/                           ← 共用 seo lint / GSC fetcher
│   └── docs/                          ← cross-ref handoff briefs
└── _archive/                          ← 舊 keeply-blog / keeply-website repo 連結 + 遷移 log
```

---

## 3. Migration steps（漸進式，每步可獨立 rollback）

### Phase 1：準備（無破壞）

| Step | 動作 | Validation |
|---|---|---|
| 1.1 | 在 GitHub 開 `boy1690/keeply-suite` 空 repo（main branch） | repo 可 clone |
| 1.2 | local `git clone https://github.com/boy1690/keeply-suite.git D:/tools/doing/keeply-suite` | 目錄存在 |
| 1.3 | 在 umbrella 加 root `CLAUDE.md` + `README.md` + `.gitignore`（合併兩邊 .gitignore） | git status clean |

### Phase 2：用 git subtree 把兩邊匯入（保留 history）

| Step | 動作 | Command |
|---|---|---|
| 2.1 | 匯入 keeply-blog 到 `apps/blog/`（保留完整 git history） | `cd D:/tools/doing/keeply-suite && git subtree add --prefix=apps/blog https://github.com/boy1690/keeply-blog.git main` |
| 2.2 | 匯入 keeply-website 到 `apps/website/`（保留完整 git history） | `git subtree add --prefix=apps/website https://github.com/boy1690/keeply-website.git master` |
| 2.3 | 驗證 history：`git log apps/blog/CLAUDE.md` 應能看到歷次 keeply-blog 改動 | git log non-empty |

> **subtree vs submodule**：subtree 把 commits 整個寫入 umbrella，optimised for single working tree。submodule 留指針，每次 clone 要 `--recursive`。Monorepo 目標下 subtree 較適合。

### Phase 3：deploy plumbing（最有爭議的一步）

兩個選項：

**Option 3A — 兩邊都遷 Cloudflare Pages**
- CF Pages 支援 1 repo 多 project（per-project build cmd + output dir + CNAME）
- Project A：`build cmd: cd apps/blog && hugo --gc --minify`，output `apps/blog/public`，CNAME `blog.keeply.work`
- Project B：`build cmd: cd apps/website && npm ci && npm run build`，output `apps/website/`，CNAME `keeply.work`
- 優點：原生支援 monorepo subdir build / 同 CDN provider / 一致 cache rule
- 缺點：要重新接 DNS（A → CNAME）+ 重設 Cloudflare Pages 環境變數 + 學 CF Pages secret 管理

**Option 3B — 保留 GitHub Pages，用 publish split repo**
- Umbrella build → push build artifact 到兩個 publish repo（boy1690/keeply-blog-pub / boy1690/keeply-website-pub）
- 各 publish repo 連自己的 GitHub Pages + CNAME
- 優點：DNS 不動、CNAME 不動、Pages 設定不動
- 缺點：每次 deploy 多一次 push artifact 步驟，複雜度高

**Recommend：Option 3A**（CF Pages monorepo 原生支援更乾淨；現在 Cloudflare zone 已經 shared，加 2 個 CF Pages project 就好）

### Phase 4：CLAUDE.md 拆解

| 檔案 | 內容主旨 |
|---|---|
| `keeply-suite/CLAUDE.md`（root） | 共用規則：(a) cross-app URL 200 lint 必跑 (b) Cloudflare zone shared (c) 一個 working tree 一個 Claude session 規則 (d) 共用 memory 規則 (e) commit message convention（scope: blog or website）(f) Push policy（仍要 user authorization） |
| `keeply-suite/apps/blog/CLAUDE.md` | 保留現 keeply-blog CLAUDE.md 大部分內容（BWF / P0 / P1 / Hugo / Locale Policy / Deploy SOP 等），刪掉「Cross-Repo Boundary」一節（不再 cross-repo）|
| `keeply-suite/apps/website/CLAUDE.md` | 新建 — 抄現 keeply-website 規則（如果有），補上：build cmd / fingerprint / SRI / Cloudflare _headers 規則 |

### Phase 5：Memory 收斂

| Step | 動作 |
|---|---|
| 5.1 | Working dir 改成 `D:/tools/doing/keeply-suite` 後，Claude project memory 路徑會變成 `~/.claude/projects/d--tools-doing-keeply-suite/memory/` |
| 5.2 | 從 `~/.claude/projects/d--tools-doing-keeply-blog/memory/` 複製所有 memory 檔案到新 suite memory dir |
| 5.3 | 從 `~/.claude/projects/d--tools-doing-keeply-website/memory/` 補充 memory（衝突手動 review） |
| 5.4 | 整合 MEMORY.md 索引（兩邊 entry 合到一個 index） |
| 5.5 | 保留舊 memory dir 30 天作 archive |

> **既有 `d--tools-doing-keeply-workspace/` 是什麼？** 需要先 check — 可能是過去 umbrella 嘗試的殘留。

### Phase 6：Hooks / Skills / scripts 路徑更新

| 影響範圍 | 動作 |
|---|---|
| `.claude/hooks/keeply-mock-audit.py` | 路徑 hardcode 從 `content/{locale}/post/` → `apps/blog/content/{locale}/post/`，或讓 hook 自動 detect 是 blog or website scope |
| `~/.claude/skills/keeply-mock-ui/generate.py` | `BLOG_ROOT` env var 從 `D:/tools/doing/keeply-blog` → `D:/tools/doing/keeply-suite/apps/blog` |
| `~/.claude/skills/keeply-mock-ui/cases/*.py` | 不用改（pure data） |
| `_dev/seo/cf-purge.js` (兩邊都有) | 各自保留在 `apps/blog/_dev/seo/` 和 `apps/website/_dev/seo/`，腳本內部 path 是相對所以 OK |
| `_dev/blog/title-audit.js` 等 | 路徑相對 `apps/blog/` |
| GH Actions secrets | CF_PURGE_TOKEN / CF_ZONE_ID 從 2 個 repo secret 搬到 1 個 umbrella repo secret |

### Phase 7：Validation cycle

每邊獨立驗證：

```bash
# Blog
cd D:/tools/doing/keeply-suite/apps/blog
hugo --gc --minify  # exit 0
for loc in zh-tw en zh-cn ja ko it; do
  test -f public/${loc}/post/{any-shipped-slug}/index.html || echo "FAIL ${loc}"
done

# Website
cd D:/tools/doing/keeply-suite/apps/website
npm ci && npm run build  # exit 0
test -f index.html && test -f en/index.html || echo "FAIL"
```

接 CI（Option 3A）：
- `git push origin main` → CF Pages 兩 project 並行 build → 兩個 CNAME 都 200

### Phase 8：DNS 切換（如果走 Option 3A）

| Step | 動作 | Rollback |
|---|---|---|
| 8.1 | CF Pages project A 建好，custom domain 設 `blog.keeply.work`，**不切 DNS** | n/a |
| 8.2 | CF Pages project B 建好，custom domain 設 `keeply.work`，**不切 DNS** | n/a |
| 8.3 | 等 CF Pages build 成功，預覽 URL（`xxx.pages.dev`）內容正確 | 不對則 fix |
| 8.4 | 切 DNS：`blog.keeply.work` 從 GitHub Pages IP → CF Pages CNAME | TTL 5 min，回切即可 |
| 8.5 | 等 5 min，curl 驗證 | 不對切回 |
| 8.6 | 切 DNS：`keeply.work` 從 GitHub Pages IP → CF Pages CNAME | 同上 |
| 8.7 | 監測 24 hr，無異狀 → archive 舊 GH Pages 設定 | n/a |

### Phase 9：清理

| Step | 動作 |
|---|---|
| 9.1 | 舊 `boy1690/keeply-blog` repo archive（GitHub setting → Archive），不刪 |
| 9.2 | 舊 `boy1690/keeply-website` repo archive |
| 9.3 | 舊本機 dir 改名 `D:/tools/doing/keeply-blog.archived-2026-05-19` |
| 9.4 | 30 天後若無 rollback 需求，可考慮刪舊 dir / 本機 archive |

---

## 4. 風險 + Rollback

| 風險 | 機率 | 影響 | Rollback |
|---|---|---|---|
| Git subtree merge 漏 commit | 低 | 歷史不全（但內容齊） | 回去舊 repo 補 |
| CF Pages build 失敗（環境差異） | 中 | Deploy 不出去 | 留 GH Pages 設定不刪，DNS 切回 |
| DNS TTL 卡 cache | 低 | 24hr 內部分 user 看舊版 | 等 TTL 過 |
| Hook 路徑漏改 | 中 | Audit / commit 行為亂 | grep + fix |
| Memory 衝突 / 漏移 | 低 | 部分上下文遺失 | 從舊 dir 補 |
| CI secrets 漏設 | 中 | Deploy 失敗 | 補 secret 重跑 |

整體 rollback 路徑：所有舊 repo + 本機 dir + GH Pages 設定都保留 30 天，任何步驟發現問題都可回退。

---

## 5. 給 ChatGPT 討論的 open questions

1. **Deploy 平台選擇**：Option 3A (CF Pages 兩 project) vs Option 3B (GH Pages + publish split repo) — 你會選哪個？理由？
2. **Specs 結構**：blog 用 BWF `specs/{slug}/` 多檔；website 用 numbered `specs/{number}-{name}.md` 單檔。要不要趁機統一？還是各保各的？
3. **Branch naming**：blog=main、website=master，umbrella 該 main 還 master？
4. **i18n 集合差異**：blog 19 = (en/zh-tw/zh-cn/ja/ko/de/es/fr/it/pt/ru/nl/pl/tr/vi/th/id/ar/hi)、website 19+ = (cs/da/de/en/es/fi/fr/hu/it/ja/ko/nl/no/pl/pt/ro/ru/sv/th/tr/uk/vi/zh-cn/zh-tw)。要對齊嗎？對齊到誰的集合？
5. **shared/ dir 內容**：brand asset / common SEO script / cross-ref handoff brief — 這層該存在嗎？還是各 app 自帶？
6. **`d--tools-doing-keeply-workspace/`**：這 memory dir 已存在，是過去 umbrella 嘗試？要接續它還是新開？
7. **Push policy**：current global policy 是「每次 push 都要 user 授權」，monorepo 後一個 push 同時觸發 2 deploy。要不要 deploy gate 拆成 per-app？
8. **Phase ordering**：Phase 1-2（沒破壞）可以先做。Phase 3 deploy 切平台是大改，要等 ChatGPT 確認後才動。Phase 7-8 是 cutover 點。整個遷移建議在「沒在 ship 文章 / 沒在發 product release」的時段做。

---

## 6. 預估工時

| Phase | 時間 |
|---|---|
| Phase 1（umbrella repo 準備） | 30 min |
| Phase 2（subtree 匯入） | 30 min |
| Phase 3（deploy 平台選 + 接 CF Pages） | 2-4 hr |
| Phase 4（CLAUDE.md 拆） | 1 hr |
| Phase 5（memory 收斂） | 30 min |
| Phase 6（hooks/skills 路徑更新） | 1-2 hr |
| Phase 7（validation cycle） | 1 hr |
| Phase 8（DNS cutover） | 30 min（含監測 = +24 hr 觀察） |
| Phase 9（清理） | 30 min |
| **總計** | **半天～1 天主動工時**（不含 24 hr DNS 監測） |

---

## 7. 不會碰的事

- 兩邊 build engine（Hugo / Vanilla HTML+Node）維持各自
- 兩邊 i18n schema 維持各自
- 兩邊現有的 article / page 內容不動（除了 CLAUDE.md cross-repo boundary 規則改寫）
- 兩邊現有的 _dev script / hook / skill 邏輯不動（只動路徑）
- Cloudflare zone 不換
- Domain 不換（blog.keeply.work + keeply.work 維持）

---

## 8. 下一步

1. ChatGPT review 此 plan，特別 Open question 8 項
2. user decide deploy platform (Option 3A vs 3B)
3. user decide 遷移時段（避開 ship 期 + product release）
4. user 給 green light → 我從 Phase 1 開始執行
