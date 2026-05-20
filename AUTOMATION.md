# AUTOMATION.md — keeply-suite 自動化防護層

> 這個 monorepo 的「防呆 + 幫手」清單。建立於 2026-05-20。
>
> **心法**：守門員＝你不用叫，它自己跑（防呆）；指令 / agent＝你主動叫（幫手）。

---

## A. 自動守門員（編輯 / 存檔時自己跳出來擋）

> 攔的是「**透過 Claude 做的**編輯 / commit」。你在外部編輯器手改、或 `--no-verify`，它們管不到 —— 那是 CI 後盾（B 區）的工作。
> 位置：`.claude/hooks/*.js`（gitignored，本機）。註冊在 `.claude/settings.json` 的 PreToolUse。

### 1. download-url-guard
- **功能**：把網站檔案（`.html/.js/.json`）寫進私人 repo 下載連結（`boy1690/Keeply`）時當場擋下。
- **專長**：保護下載漏斗 —— 私人 repo 連結會讓沒登入的訪客看到 404 + 登入牆。
- **時機**：自動。編輯 `apps/website/` 上線檔案時（docs / `_dev` / `specs` 例外）。

### 2. app-boundary-guard
- **功能**：從 keeply-suite session 想寫進別的產品 repo（Keeply 桌面 app、Ocular…）時擋下。
- **專長**：防跨 repo 誤寫（2026-05-02 出過事：翻譯模板被寫進 Keeply 桌面 app）。
- **時機**：自動。只擋 `d:/tools/doing/` 底下非 `keeply-*` 的 repo；記憶 / 暫存 / keeply-suite 都放行。

### 3. i18n-parity-gate
- **功能**：commit 時若 staged 含 `apps/website/i18n/*.json`，檢查 19 語言 key 是否全對齊 `en.json`，沒齊就擋 commit。
- **專長**：防翻譯漏字 / 對不齊（en 加了 key 但別的語言沒跟上）。
- **時機**：自動。`git commit` 且動到 i18n 檔時。手動驗證：`node .claude/hooks/i18n-parity-gate.js --check`。

### 4. blog-content-gate
- **功能**：commit 時若 staged 含 `apps/blog/content/`，跑封面重複 + 跨語言英文殘留 audit，有違規就擋 commit。
- **專長**：防封面複製貼上沒改、該翻成中文的英文字漏翻。
- **時機**：自動。`git commit` 且動到部落格內文時。基礎建設出錯（python 缺）一律放行不擋。手動：`node .claude/hooks/blog-content-gate.js --check`。

---

## B. CI 後盾（push 時雲端自動跑，不可繞過）

> 位置：`.github/workflows/content-lint.yml`（tracked）+ tracked 檢查腳本 `apps/website/_dev/check-*.js`、`apps/blog/_dev/seo/check-cross-refs.js`、既有 `apps/blog/_dev/` audit。

### 5. content-lint workflow（3 個 job）
- **功能**：每次 push 到 main / 開 PR，在 GitHub 雲端重跑：① i18n 對齊 ② 下載網址 ③ 封面 + 語言一致性 ④ blog → keeply.work cross-ref 200。
- **專長**：守門員（A 區）只在「Claude 編輯時」有效；這個連手改、直接 push、`--no-verify` 都躲不掉 —— 最後一道防線。
- **時機**：自動。push / PR 觸發，動到 `apps/**` 才跑。亮紅燈 = 有東西沒過。

---

## C. 你主動叫的幫手（指令 + agent）

> 位置：`.claude/commands/*.md`、`.claude/agents/*.md`（gitignored，本機）。

### 6. `/release-bump <版本>`
- **功能**：發新版 Keeply 時改 `release-config.json` 版號 + 清空 checksums，列出 commit/push/驗證步驟。
- **專長**：把 `apps/website/RELEASE_BUMP_SOP.md` 變一鍵 —— 避免漏改網站版號（下載按鈕失效）。
- **時機**：keeply-releases 有新 tag、要同步 keeply.work 時。例：`/release-bump 1.0.13`。

### 7. `/blog-ship <slug>`
- **功能**：文章上線前依序跑封面 / 語言 / 標題 / 內鏈 audit + Hugo build + 6 語言完整性，最後給 200 驗證清單。
- **專長**：Touch 4 DELIVER 的上線檢查關 —— `/blg` 負責**寫**，這個負責**確認能不能 ship**。
- **時機**：文章寫完、準備 push 前。例：`/blog-ship excel-data-vanished-postmortem`。

### 8. `bwf-voice-reviewer`（subagent）
- **功能**：審查草稿裡機器抓不到的判斷題 —— Keeply 定位（P0.2）、lead with killshot、答案白話優先、翻譯腔、Keeply 是不是主角。只審不改、給清單。
- **專長**：補 Python audit 的空缺 —— audit 抓死規則（封面 / 英文字 / 標題公式），它抓語感題（像不像真人寫的、像不像廣告）。
- **時機**：deterministic audit 都過了、ship 之前。對它說要審哪篇 slug。

---

## 一張表記住

| 想做什麼 | 用誰 | 要不要動手 |
|---|---|---|
| 防寫錯下載網址 / 寫錯 repo | 守門員 1、2 | ❌ 自動 |
| 防翻譯漏字 / 封面重複 / 英文殘留 | 守門員 3、4 | ❌ 自動（commit 時）|
| 直接 push 也想被擋 | CI content-lint | ❌ 自動（push 時）|
| 發 Keeply 新版 | `/release-bump` | ✅ 你叫 |
| 文章上線前檢查 | `/blog-ship` | ✅ 你叫 |
| 文章語感 / 定位審查 | `bwf-voice-reviewer` | ✅ 你叫 |

---

## 東西放哪 / 重裝

| 類別 | 位置 | 進 git? |
|---|---|---|
| 4 個守門員 hook | `.claude/hooks/*.js` | ❌ gitignored（本機）|
| hook 註冊 | `.claude/settings.json` PreToolUse | ❌ gitignored |
| 2 指令 + 1 agent | `.claude/commands/`、`.claude/agents/` | ❌ gitignored |
| CI workflow + 檢查腳本 | `.github/workflows/content-lint.yml`、`apps/*/_dev/check-*.js` | ✅ tracked |

> `.claude/` 是 gitignored（本機 only）。換機器要重建守門員 / 指令時：hook 與 settings 註冊需「跑 merge 腳本」（AI 不能自改 agent 設定，這是 harness 鐵則），CI 那層 clone 下來就在。
