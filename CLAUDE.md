<!-- BWF: v0.1 -->
# CLAUDE.md — keeply-blog

> Hugo-based multilingual blog (19 languages) for keeply.work, deployed via GitHub Pages.
> 寫作框架：BWF v0.1 minimum viable（`~/.claude/bwf/`）。

---

## Architecture

- **Source code**: this repo (`d:\tools\doing\keeply-blog\`)
- **BWF specs（寫作產物）**: 本地 `specs/{slug}/`（gitignored；推送目的地 `Z:\keeply-blog\`，使用者手動同步）
- **IBV specs（工程產物，保留）**: `Z:\keeply-blog\` (NAS，IBV hooks 讀 `IBV_SPECS_DIR` 或 `ibv-config.json`)
- **BWF framework**: `~/.claude/bwf/`（user-level，跨寫作專案共享）
- **IBV framework**: `~/.claude/` + `~/.specify/`（user-level）

Note：`Z:\keeply-blog\` 需要 `git config --global --add safe.directory '%(prefix)///192.168.0.7/Projects/keeply-blog'` 才能從本機操作。

## Cross-Repo Boundary（P0 — 不准跨 repo 寫檔）

本 repo（`d:\tools\doing\keeply-blog\`）**只能寫自己**。三個外部 repo 一律 OFF-LIMITS：

| Repo                              | 用途                              | 規則                                                       |
| --------------------------------- | --------------------------------- | ---------------------------------------------------------- |
| `d:\tools\doing\Keeply\`          | Tauri desktop app（產品本體）     | **絕對禁寫**。Keeply 自帶的 `website/` 是舊 landing page，不要碰 |
| `d:\tools\doing\keeply-website\`  | keeply.work 主站（行銷+下載+授權） | **絕對禁寫**。任何網站文案 / i18n / 法律條款屬於該 repo 自己 |
| `d:\tools\doing\Ocular\` 等其他   | 不相干專案                        | **絕對禁寫**                                               |

**事故紀錄**：2026-05-02 keeply-blog 的某 session 把 `translation-template.md` 翻譯模板寫進了 `d:\tools\doing\Keeply\website\i18n\`（已加入 Keeply 的 `.gitignore` 排除）。這是 cross-repo 越界 — 翻譯模板若是給網站用的，應該寫進 `keeply-website` repo，不該流到 Keeply 桌面 app repo。

**自我檢查**：寫檔前確認 path 開頭是 `d:\tools\doing\keeply-blog\` 或 `~/.claude/bwf/`（user-level framework）。其他絕對 path 的寫入都要先停下來問 user。

## Hugo / IBV Verification Commands

| Command              | Purpose                |
| -------------------- | ---------------------- |
| `hugo server -D`     | Dev server with drafts |
| `hugo --gc --minify` | Production build       |
| `hugo config`        | Validate config syntax |

## Publishing schedule

- Each post's front-matter sets `date: YYYY-MM-DDT09:00:00+08:00` to its target publish moment
- Cadence: 週二 / 週五 09:00 Asia/Taipei（Mode A — 穩健）
- `.github/workflows/deploy.yml` runs `cron: "0 1 * * *"` (daily 01:00 UTC = 09:00 Asia/Taipei). Hugo skips posts whose `date` is in the future, so a future-dated post first appears in the build that runs on/after that timestamp — native scheduled publishing, no extra tooling
- During Touch 4 DELIVER, fill `date` for every `final.{locale}.md` to the same target timestamp across locales (don't stagger by language)
- Cron timing is best-effort — GitHub may delay the run by up to ~30 min on busy public-runner queues. Acceptable for blog publishing; not acceptable for hard deadlines

---

## BWF PROJECT_CONSTRAINTS

## P0 — 絕對規則（零容忍）

- **P0.1** 禁用 Git 術語。永不。散文、隱喻、類比都不行。
  禁用詞：commit、branch、rebase、merge、HEAD、diff、push、pull、stash、repository、checkout、master、main、origin
  - **P0.1 dev-audience SOP**（v0.2.12，從 vibe-coding-rollback cluster 抽出）：當文章針對 dev / vibe coder / AI-pair programmer 受眾時，**作者 + 翻譯 agent 都必須**：
    1. **替代詞表**：commit → 存檔點 / 自動儲存點 / "save point"；diff → 變動內容 / 變更內容 / "changes"；revert / checkout → 還原 / "restore"；stash → 暫存區（避免使用）；branch → 分支（避免）；merge（version-control 意義）→ 合併（避免）
    2. **Keeply 定位句**：「**任何檔案的 history 守護網**」（含 code / config / data / AI 生成輸出，比一般 dev tool 範圍更廣），**不是**「給非開發者的 Git」
    3. **翻譯 agent 必加**：dispatch 翻譯 dev-audience cluster 時，agent prompt 必含 forbidden term list（locale-specific：en + zh-CN 簡體 + ja 含 katakana 形式），agent self-audit 0 violations 才能 finalize
    4. **驗證**：finalize 前跑 `grep -i "commit\|branch\|rebase\|stash\|repository\|checkout"` 對 final 文件，必須 0 命中
- **P0.2** 永不把 Keeply 定位為「給非開發者的 Git」。Keeply 不是 Git-derived，是為了讓不學 Git 的人也能管檔案歷史。
  - **事故紀錄 2026-05-11**：shipped `hidden-cost-shared-folders` v1 line 57「軟體工程師幾十年前就用 **Git** 享受著這種平靜；但在營建、建築與設計產業，我們卻還在用手動加 `_v7` 對抗災難」直接踩 P0.2 + T7 #26。Audit 沒抓到。修復方向：v2 改寫為「軟體業早就靠版本控制工具解決；但這層工具一直沒被搬到營建、設計、研究產業」（描述 category gap，不點 Git 名）。BWF v0.2.20 加入 T7 enforcement grep + T19 MT-glitch trap，防止此類事故再次無聲流出。
- **P0.3** 禁寫競品 hit-piece。比較文必須事實、具體、承認對方何時是對的選擇。
- **P0.4** 禁捏造統計。每個數字必須有外部可訪問 URL 引用（學術、機構、大廠公開調查）。內部估算不得作為論證主幹；只能在已有外部引用旁做補充運算（例：外部研究顯示 X → 本文換算 Y）。若找不到外部引用，刪掉數字用定性論述。
- **P0.5** 客戶姓名/引言：必須能在 `specs/{slug}/sources.md` 追到具體人+日期+同意紀錄，或用「【合成範例】」前綴明確標記。未經書面同意禁用真實姓名。
- **P0.6** AI-tell phrases 零命中（對照 `~/.claude/bwf/traps.md`）。
- **P0.7** 原文用英文。文化中立——無美式慣用語、運動比喻、流行文化引用。
- **P0.8** 禁宣稱未做過的研究 / 訪談 / 實測。E-E-A-T 的 Experience 訊號只能來自 (a) 創辦人真實親身經歷，可由作者具名負責；(b) 可追到外部 URL 的公開來源（學術論文、媒體報導、論壇討論串、官方 SDK 文件）。禁止「我們實測了」「我訪問了 N 位 X」「根據內部統計」等無外部佐證的句式。

## P0 — Hugo / Infra 硬規則（承接 Phase 1）

- Static output only — no server-side rendering, no JS frameworks
- 19-language parity: en, zh-tw, zh-cn, ja, ko, de, es, fr, it, pt, ru, nl, pl, tr, vi, th, id, ar, hi
- baseURL must be `https://blog.keeply.work/`
- Theme: hugo-theme-stack (git submodule, not vendored)

## P1 — 強偏好（覆寫需註記）

- **P1.1** 段落 ≤3 行桌面顯示（≤75 字）。
- **P1.2** 子標題使用 sentence case，前 2 字要資訊承載。
- **P1.3** H1 下方必有 Deck（1 句 ≤45 字）。
- **P1.4** 文章 ≥800 字要有連結 TOC。
- **P1.5** 每 ~600 字一個 bucket brigade。
- **P1.6** D-voice：反骨溫暖第二人稱。預設 address: 「你」。
- **P1.7** 每大區段至少一個具體軼事或具體數字。
- **P1.8** Flesch Reading Ease ≥60（ICP：設計師/建築師/律師/會計師）。
- **P1.9** 文章 1,200–2,200 字，除 T6 Founder Note（300–800）。
- **P1.10** Hugo front-matter 必有：title、description、date、tags、draft、primary_keyword、locales。
- **P1.11** SEO 標題規則：primary_keyword 出現在標題前半（zh 前 3-5 字；en 前 30 char）；標題含具體數字或 hook；長度 zh 28-35 全形字、en 50-60 char。寫完後做「雙版本檢查」：一版為 voice 寫、一版為 SEO 寫，合併較好部分。
- **P1.12** 引用格式：每個統計數字 inline markdown link 到原始來源；來源優先序：學術/大型機構 > 大廠公開調查 > 媒體二手（後者要再追到原始）。所有引用同步登錄 `specs/{slug}/sources.md`。
- **P1.13** 每篇文末強制帶作者卡：真名（或一致 pen name）+ Keeply 角色 + 連到 about / LinkedIn / 創辦人公開頁。E-E-A-T Expertise 訊號透明的代價是放棄匿名 PR 寫作的選項——這是有意識的取捨。
- **P1.14** 每篇至少 1 處 admit limitation：「Keeply 不解決 X」「對 Y 場景 Keeply 不是最佳選擇」。Trustworthiness 訊號 + P0.3 競品承認規則的反向延伸。寫在「For when Keeply isn't the right tool」或「Limitations」小節，明白寫進文章本體，不是腳註。
- **P1.15** 每篇 `intent.md` 必須宣告 `pillar` / `cluster` / `standalone` 角色 + 對應 pillar slug（若為 cluster）。對應 `specs/_roadmap/2026-q2-content-queue.md`。Cluster 在 Touch 4 DELIVER 必須含 ≥1 in-body link 連回 pillar；pillar 必須含 ≥3 cluster 連結。
- **P1.16** Tag 必須 reusable，從 `specs/_roadmap/tag-pool-ledger.md` 既有 pool 中選。新增 tag 的條件：當下有 ≥3 篇文章可掛上去；否則該詞下沉進 title / description / 文章本體，不開 tag。Reason：每加一個 1-post tag = Hugo 自動生 19 locale × 1 = 19 個 thin-content URL，稀釋整域 SEO quality signal（2026-05-08 SEO L2 spec）。How to apply：寫 frontmatter 時對照 ledger；要新增 pool 必須同時宣告 ≥3 篇現有 slug + 更新 ledger + GATE-2 通過。
  - **P1.16.a Tag 改名 / 移除 SOP**（v0.1，2026-05-11 GSC audit 後加入）：移除或改名既有 tag **必須**同步：(a) 把舊 `/{locale}/tags/{old-tag}/` URL 加進 `_dev/seo/cloudflare-bulk-redirects-*.csv`（301 → `/{locale}/` 首頁）並上傳到 Cloudflare list `blog_keeply_tag_404_redirects_2026_05_11`；(b) PR 跑 `node _dev/seo/tag-inventory.js --diff` 必須 exit 0（若有 REMOVED → 走 (a) → 再 `--snapshot` 更新 baseline）。Reason：2026-05-11 GSC 報告 27 個 404 中 ~15 個是 tag 改名沒留 redirect 殘骸，污染 GSC 訊號 + PageRank 從死連結流失。How to apply：tag 更動的 PR review 時對照 `_dev/seo/tag-inventory.json` baseline 看 diff。
- **P1.17** 章節層篇幅與作者真實觀點強度成正比，不是均等覆蓋（對應 BWF traps.md T18 #67-#70）。Why：均等篇幅 = 顧問簡報味（AI 預設 balanced）；不均等 = E-E-A-T Experience 訊號（真實人類有強弱觀點）。事故紀錄：2026-05-11 `departing-employee-data-risk` voice refactor session — user 點名「下意識追求結構完美與對稱」是 AI 味洩底（原 shipped 版踩「第一派/第二派」+ 4-bullet 對 4-bullet + Keeply 三道防線 1/2/3）。How to apply：(a) 拒絕替代方案 section 字數差 ≥30%（真正看不慣的競品 4-5 句帶實務細節；只是路過的領域 1-2 句結論）；(b) 1/2/3 編號列表只用於各 item 真等重的場景，主從關係明確 → 散文化；(c) H2 / 子標題不准「第一 X／第二 X」結構鏡像；(d) scene 時間戳用非整點（11:03 / 9:14，不是 9:00 / 12:00）。GATE-PRE-SHIP-AI-RESILIENCE #13-#16 hard-stop。
- **P1.18** Lead with the killshot：第一個 H2 必須是這篇最強的事實 / 反直覺證據 / 硬核機制揭露，不是最溫和的 overview（對應 BWF traps.md T18 #71 + t1.pillar.md LEAD WITH THE KILLSHOT 段）。Why：讀者第 1 個 H2 就決定要不要繼續讀，把 high info-gain 的點擺 #1 = 用最強子彈開第一槍；把 overview 擺 #1 = AI 預設「先鋪陳再 reveal」灌水節奏。事故紀錄：2026-05-11 `restore-without-panic` voice refactor — user 把 SSD/TRIM「磁碟救援軟體的三個盲區」從 H2 #2 拉到 H2 #1（「救援軟體不敢說的致命傷：SSD + TRIM」），同時刪掉原開場 4-點 preview（T18 #71 preview-then-elaborate）+ 原 H2 #1 elaborate 同 4 點的雙倍重複。How to apply：寫完 skeleton 後問「讀者只讀 #1 H2 就走人，留下的最值得 share 的事實是什麼？」答案不是當前 #1 → 重排。Preview-then-elaborate 是子陷阱（T18 #71）：開場列項 ≥80% 與後續 H2 小標重疊 → 合併。
- **P1.19** Chronological / Trial Diary 格式例外（對應 BWF t1.pillar.md TRIAL DIARY PATTERN + LEAD-WITH-KILLSHOT 例外段 + traps.md T18 #71 例外段）。當文章是 first-week trial / N-day onboarding / 觀察評估指南時，**時序 = 結構 = killshot**，P1.18 不適用。判斷依據：article information_gain_statement 是否本身就是「watching X happen over N time units」？是 → 走 Trial Diary Pattern。Trial Diary 必含：(a) chronological event H2 / H3（不准把後段事件拉前面）；(b) 每事件段末附 **✅ 信任信號 + ❌ 失敗點** 對偶 checklist（各 1 行，不 elaborate 成段落）；(c) 限制段 P1.14 升 H2 不留 H3（trial guide 必須把限制 visible 化加 trustworthiness）；(d) 開場 TOC-style preview「Day 1 / Day 3 / Day 5」對應後續 H2 elaborate 不算 T18 #71 違規。事故紀錄：2026-05-11 `keeply-first-week-workflow` draft optimization — 識別出 trial diary 與 ranking pillar 是不同 frame，硬套 P1.18 / T18 #71 會破壞文章 information gain。
- **P1.20** H2 NAMING STRATEGY：Voice-driven vs SEO-driven 兩 mode 可混用（對應 BWF t1.pillar.md H2 NAMING STRATEGY 段）。**Voice-driven H2**：metaphor / scene anchor / counter-narrative reframe，追求 information gain 而非 keyword 命中（例：「論文不是一份文件，是一條時間線」）。**SEO-driven H2**：primary_keyword + 搜尋意圖詞直接 land 進 H2，追求 Google snippet capture（例：「雲端同步、Word 版本歷史為什麼救不了論文」）。Why：純 voice 全 H2 浪費 ranking opportunity；純 SEO 全 H2 變 listicle 失去 voice。How to apply：(a) 看 keywords.md primary_keyword 搜尋量；(b) Hook H2 通常 voice-driven，Solution / N-step H2 通常 SEO-driven，Limit / 收尾 H2 通常 voice-driven；(c) 在 skeleton.md 標記每個 H2 的 mode；(d) 大多數 T1 articles 是 hybrid，全 voice 或全 SEO 是 anti-pattern。事故紀錄：2026-05-11 `thesis-single-point-of-failure` v2 refactor — shipped v1 全 H2 voice-driven，primary_keyword「碩士論文 備份 版本」沒任何 H2 land；v2 改 2 個 solution-focused H2 為 SEO-driven，hook + limit 保留 voice-driven。
- **P1.21** 兩個正面 Trust-building patterns（對應 BWF t1.pillar.md TRUST BUILDING PATTERNS 段，v0.2.21）：**Mock UI Block** + **Compatibility Paragraph**。**Mock UI Block**：對 dev / engineer / construction PM / sysadmin audience 在 solution H2 內嵌一塊模擬該工具介面的 ASCII / pseudo-screenshot / log excerpt block（CJK 工程文章用 box-drawing characters ─┌┘●；dev 文章用 markdown code fence；通用用 markdown table）。8-15 行最佳，一篇 article 1 個 block。Why：工程受眾「看 ASCII / log / code 比看 prose 更信」，比 200 字文字描述更建立信任。事故紀錄正面範例：`autocad-wrong-version-crew` shipped v1 ASCII timeline（line 89-108）被 user 親口稱「信任建立區塊」。**Compatibility Paragraph**：在 solution H2 後 / CTA 段前加單行 / 短段落明確列舉「跟你現有 stack 相容」清單，主動拆「我要換掉整套系統嗎」objection。必須列**真實可驗證**的 brand / product name（NAS / SharePoint / OneDrive Business / Synology / QNAP），不寫「相容所有系統」空話。Anti-pattern：放在 hook 段 / 開場太早 = 行銷 pitch 味。事故紀錄：`autocad-wrong-version-crew` v2 refactor 加「相容於公司現有的 NAS / SharePoint / OneDrive Business」單行，直接拆「換系統」objection。
- Prefer Hugo built-in features over custom code
- Content in markdown only, no HTML templates unless necessary

---

## Locale Policy

**發布時必有**（核心 6 locale）：en, zh-TW, zh-CN, ja, ko, **it**（2026-05-03 從 auto 升核心 — SEO 監測累積真實義大利搜尋訊號 + native query 位置 10 雙重證據）
**自動翻譯**：es, pt (pt-BR 翻譯後映射), de, fr, vi, th, id, tr, ar, ru, nl, pl, hi（共 13 語言；it 已升為核心）
**特殊處理**：

- 阿拉伯文（ar）需要 RTL 審查
- 德文（de）+30% 字元寬度緩衝

所有 locales 都要跑 GATE-4 翻譯安全 + SEO 檢查。

## Voice Corpus

未來放 `voice_corpus/` 的典範文章（寫過 3-5 篇後建立）。

目前：第一篇文章 `specs/hidden-cost-shared-folders/` 作為 back-filled 範例。

## 目錄結構

```text
keeply-blog/
├── CLAUDE.md                  # 本檔
├── hugo.toml                   # Hugo 設定
├── content/{locale}/posts/     # 發布內容
├── specs/                      # BWF 設計產物（gitignored；同步到 Z:\keeply-blog\）
│   └── {slug}/
│       ├── intent.md
│       ├── angle.md
│       ├── skeleton.md
│       ├── draft.en.md
│       ├── final.{locale}.md
│       └── learnings.md
└── voice_corpus/               # 典範文章（暫空）
```

## BWF 版本

v0.1 最小可跑版。已實作：T1 Pillar 模板、4 個 GATE、TRAP 列表、hooks/titles/ctas library、`/blg` slash command。

未實作（v0.2+）：T2-T6 模板、Python lint 腳本、LoopGuard 自動化、feedforward.xml、learnings.md 彙整 job、`specs/` 同步到 `Z:\keeply-blog\` 自動化。

---

## Deploy Pipeline SOP

> v0.1 新增（2026-04-28）— 從既有 working pipeline reverse-engineer 出的文件化 SOP。本章節**描述**早已運作的 deploy 鏈條（spec → keeply-blog content/ sync → push → GitHub Actions Hugo build → GitHub Pages → blog.keeply.work），**不引入**新依賴。
>
> **2026-05-03 verification baseline: 9 articles × 5 locales = 45/45 URL HTTP 200 ✅** (hidden-cost-shared-folders / install-keeply-windows-mac / thesis-single-point-of-failure / autocad-wrong-version-crew / file-version-management-complete-guide / keeply-getting-started-from-zero / vibe-coding-rollback / what-keeply-saves-vs-backup-cloud / client-asked-which-version × zh-tw/en/zh-cn/ja/ko). Restored after Cloudflare zh-tw/zh-cn cross-zone redirect bug fix — `keeply.work` zone 的 BCP-47 normalization rule 沒 scope `http.host`，劫持了整個 blog 子域 zh-TW + zh-CN locale 到 main-site 404；fix = expression 加 `and http.host eq "keeply.work"`. 詳見 memory `reference_cloudflare_cross_zone_redirect_gotcha.md`。
>
> 早期 baselines（已過時，留作歷史參考）：
> - 2026-04-28: 4 articles × 4 locales = 16/16 (zh-tw/en/zh-cn/ja).
> - 2026-05-01: ko 從「自動翻譯」升級為「核心發布必有」，新 baseline 目標 N articles × 5 locales。
>
> 本 SOP 為 DELIVER 觸點（Touch 4）step 9-12 的展開。CI/CD 自動化 + 19-locale parity + retraction protocol 為 v0.2_deferred。

### a. Spec → Content sync 步驟（路徑映射）

**權威方向**：spec 為內容權威，keeply-blog content/ 向 spec 對齊（**Alignment Direction**，不可反向）。

**路徑映射規則**（6 必要 locale 同步全上線）：

| Spec source（authoritative）            | keeply-blog content target                            | Hugo URL                                       |
| --------------------------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| `apps/blog/specs/{slug}/final.zh-TW.md` | `../keeply-blog/content/zh-tw/post/{slug}/index.md`   | `https://blog.keeply.work/zh-tw/post/{slug}/`  |
| `apps/blog/specs/{slug}/final.en.md`    | `../keeply-blog/content/english/post/{slug}/index.md` | `https://blog.keeply.work/en/post/{slug}/`     |
| `apps/blog/specs/{slug}/final.zh-CN.md` | `../keeply-blog/content/zh-cn/post/{slug}/index.md`   | `https://blog.keeply.work/zh-cn/post/{slug}/`  |
| `apps/blog/specs/{slug}/final.ja.md`    | `../keeply-blog/content/ja/post/{slug}/index.md`      | `https://blog.keeply.work/ja/post/{slug}/`     |
| `apps/blog/specs/{slug}/final.ko.md`    | `../keeply-blog/content/ko/post/{slug}/index.md`      | `https://blog.keeply.work/ko/post/{slug}/`     |
| `apps/blog/specs/{slug}/final.it.md`    | `../keeply-blog/content/it/post/{slug}/index.md`      | `https://blog.keeply.work/it/post/{slug}/`     |

**注意 quirk**：

- `en` locale 的 contentDir 為 `content/english/`（**非** `content/en/`），但 URL prefix 為 `/en/`（hugo.toml `defaultContentLanguageInSubdir = true` + `[languages.en] contentDir = "content/english"`）。其他 5 個核心 locale 的目錄名與 URL prefix 一致（zh-tw / zh-cn / ja / ko / it）。
- 每個 post 為 Hugo **page bundle**：`{slug}/index.md` + `{slug}/cover.svg` + `{slug}/cover.png` 三檔同目錄。
- 內容 byte-identical：`final.{locale}.md` 文章本體 = `index.md` 文章本體（轉檔時只動 frontmatter，**不改文字**）。

### b. Hugo frontmatter 補強規則（spec 缺欄位回填 spec，不雙寫）

`final.{locale}.md` 與 Hugo `index.md` 的 frontmatter 差異欄位（Hugo 必要、BWF spec 可能未含）：

| Hugo 必要欄位         | 來源                                                          |
| --------------------- | ------------------------------------------------------------- |
| `title`               | spec frontmatter（必有，BWF GATE-2）                          |
| `description`         | spec frontmatter（必有，BWF P1.10）                           |
| `slug`                | spec 目錄名（kebab-case）                                     |
| `date`                | spec frontmatter（DELIVER 時填寫，**6 locale 同 timestamp**） |
| `image: cover.svg`    | DELIVER step 8 cover 必有                                     |
| `og_image: cover.png` | DELIVER step 8 cover 必有                                     |
| `categories`          | spec frontmatter（locale-specific 翻譯）                      |
| `tags`                | spec frontmatter（locale-specific 翻譯）                      |
| `draft`（可選）       | 預設 false；spec 未指定即 published                           |

**補強規則（重要）**：

1. **Spec 缺欄位 → 回填 spec**（authoritative direction）。**禁止**只在 keeply-blog `index.md` 加欄位而不同步回 `apps/blog/specs/{slug}/final.{locale}.md`。
2. **不雙寫**：avoid 在兩處各自維護一套 frontmatter；轉檔（spec → content）為單向 sync，spec 為唯一 source of truth。
3. **6 locale frontmatter 必齊**：6 個 `final.{locale}.md` 同時更新後再一次 sync 到 6 個 content target；不允許單 locale 偷跑。

### c. Hugo build 本機驗證

**前置**：在 `keeply-blog/` 目錄（`D:/tools/doing/keeply-blog/`）執行；hugo.toml `baseURL = "https://blog.keeply.work/"`、`defaultContentLanguageInSubdir = true`、theme `hugo-theme-stack`（git submodule，未 vendored）。

**命令**：

```bash
cd D:/tools/doing/keeply-blog/
hugo --gc --minify
```

**Exit 條件**：必須 exit 0（DELIVER step 10 hard rule）。

**6 必要 locale 完整性檢查**（build 後本機驗證 public/ 產出齊全）：

```bash
# build 完成後：
test -f public/zh-tw/post/{slug}/index.html && \
test -f public/en/post/{slug}/index.html && \
test -f public/zh-cn/post/{slug}/index.html && \
test -f public/ja/post/{slug}/index.html && \
test -f public/ko/post/{slug}/index.html && \
test -f public/it/post/{slug}/index.html && \
echo "6-locale local build OK" || echo "MISSING locale build"
```

任一 locale 缺檔 → halt，不要 push；先回頭檢查該 locale 的 content/ 子目錄是否齊備。

### d. GitHub push + GitHub Actions deploy.yml 觸發鏈條

**鏈條描述**（reverse-engineered from `D:/tools/doing/keeply-blog/.github/workflows/deploy.yml`）：

```text
local hugo --gc --minify exit 0
        │
        ▼
git commit (conventional commits + Co-Authored-By footer)
        │
        ▼
git push origin main
        │
        ▼ (trigger: on.push.branches=["main"])
GitHub Actions: Deploy Hugo site to Pages
        │
        ├─ build job (ubuntu-latest, HUGO_VERSION=0.160.1 extended)
        │  ├─ Checkout (submodules: recursive — theme 拉齊)
        │  ├─ Setup Node 20 + npm ci + npm run css:build (Tailwind)
        │  ├─ Setup Pages (actions/configure-pages@v4)
        │  ├─ hugo --gc --minify --baseURL "https://blog.keeply.work/"
        │  └─ Upload artifact (./public)
        │
        ▼
        deploy job (needs: build)
        └─ actions/deploy-pages@v4 → environment: github-pages → live
```

**附加 trigger**：

- `workflow_dispatch`（手動）：用於不 push code 但要強制 rebuild 的場景。
- `schedule: cron "0 1 * * *"`（每日 UTC 01:00 = Asia/Taipei 09:00）：native scheduled publishing。Hugo 跳過 `date` 在未來的 post，cron 跑到後該 post 才出現於 build。發文 cadence（週二 / 週五 09:00）依賴此 cron；GitHub 公共 runner 可能延遲 ~30 min，blog 發布可接受、硬截止場合不適用。

**concurrency**：`group: "pages"` + `cancel-in-progress: false`（同時 push 多次不會互相 cancel，依序排隊）。

**push 權限**：已在 user settings 解鎖；**但** sub-agent 預設 `sub_agent_git_capability=read_only`，sub-agent 不得自行 git push（必經使用者授權；參考 global policy `~/.claude/CLAUDE.md`「Every git push requires explicit user authorization」）。

### e. N×6 URL HTTP 200 完整性檢查 procedure

**Trigger 時機**：deploy job 完成後（GitHub Actions 顯示綠勾）→ 等 GitHub Pages CDN propagation（通常 < 60 sec）→ 跑下列 curl 矩陣。

**Canonical URL 結構**（trailing slash 必有）：

```text
https://blog.keeply.work/{locale}/post/{slug}/
```

其中 `{locale}` ∈ `{zh-tw, en, zh-cn, ja, ko, it}`（6 必要 locale；其餘 13 自動翻譯 locale 為 v0.2_deferred）。

**curl 模板**（單一 URL）：

```bash
curl -s -o /dev/null -w "%{http_code}" "https://blog.keeply.work/{locale}/post/{slug}/"
```

期望輸出：`200`。

**6-locale × N-article 矩陣腳本**（bash）：

```bash
SLUGS=(hidden-cost-shared-folders install-keeply-windows-mac thesis-single-point-of-failure autocad-wrong-version-crew file-version-management-complete-guide keeply-getting-started-from-zero vibe-coding-rollback what-keeply-saves-vs-backup-cloud)
LOCALES=(zh-tw en zh-cn ja ko it)
PASS=0; FAIL=0
for slug in "${SLUGS[@]}"; do
  for loc in "${LOCALES[@]}"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "https://blog.keeply.work/${loc}/post/${slug}/")
    if [ "$code" = "200" ]; then
      echo "OK   ${loc}/${slug} → $code"; PASS=$((PASS+1))
    else
      echo "FAIL ${loc}/${slug} → $code"; FAIL=$((FAIL+1))
    fi
  done
done
echo "Result: ${PASS}/$((${#SLUGS[@]}*${#LOCALES[@]}))"
```

**Pass 條件**：N articles × 6 locales 全部 200。任一 URL 非 200 → halt，回頭檢查 content/ 該 locale 子目錄是否 push 進 main、Actions log 該次 build 是否該 locale build 出 `public/{locale}/post/{slug}/index.html`。

**Baseline reference**：
- 2026-04-28: 4 articles × 4 locales = 16/16 URL HTTP 200 ✅ (hidden-cost-shared-folders / install-keeply-windows-mac / thesis-single-point-of-failure / autocad-wrong-version-crew × zh-tw/en/zh-cn/ja).
- 2026-05-01: 5-locale 升級 — 8 articles × 5 locales (en/zh-tw/zh-cn/ja/ko) = 40/40 為新 baseline 目標。
- **2026-05-03: 9 articles × 5 locales = 45/45 URL HTTP 200 ✅ confirmed via curl** — 修復 Cloudflare cross-zone redirect bug 後重驗。9 個 slug：上述 8 + `client-asked-which-version`。RSS feeds 5/5 同步恢復 200（`/{locale}/index.xml`）。後續新文章 slug 加入上述 `SLUGS` 陣列即可。
- **2026-05-03 it 升核心後新 baseline 目標：9 articles × 6 locales = 54/54**（既有 9 篇 it 版本是 auto-translated baseline，URL HTTP 200 應已成立；human polish backfill 為獨立 quality 任務、不影響 URL completeness check）。
