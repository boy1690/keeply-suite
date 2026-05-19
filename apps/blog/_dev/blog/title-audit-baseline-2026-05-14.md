# P1.11 標題公式 audit — 2026-05-13

Total: 69 articles × 3 locale(s)

- 完全通過: 8
- 只有 WARN: 51
- 含 HARD 違規: **10**

## Issue frequency

| Severity | Code | Count |
|---|---|---|
| HARD | LEN_TOO_LONG | 6 |
| HARD | NO_DIVIDER | 4 |
| WARN | NO_INTENT_WORD | 45 |
| WARN | NO_DIGIT_IN_BODY | 28 |
| WARN | PK_NOT_IN_HEAD | 10 |
| WARN | LEN_LONG | 10 |
| WARN | LEN_SHORT | 2 |

## HARD 違規（必修）

| Locale | Slug | Title | HARD | WARN |
|---|---|---|---|---|
| en | `3-2-1-backup-rule` | 【2026 File Management】What the 3-2-1 backup rule d… | NO_DIVIDER | NO_INTENT_WORD |
| en | `autocad-wrong-version-crew` | 【2026 File Management】AutoCAD drawing version cont… | LEN_TOO_LONG(107) | — |
| en | `cloud-version-history-cliff` | 【2026 File Management】Before comparing iCloud vs D… | LEN_TOO_LONG(107) | — |
| en | `dropbox-conflicted-copy` | 【2026 File Management】Dropbox Conflicted Copy: Why… | LEN_TOO_LONG(113) | — |
| en | `excel-version-history-limits` | 【2026 File Management】Excel Version History Only G… | LEN_TOO_LONG(108) | NO_INTENT_WORD |
| en | `install-keeply-windows-mac` | 【2026 File Management】How to install Keeply on Win… | NO_DIVIDER | — |
| en | `photoshop-autosave-not-version-history` | 【2026 File Management】Why Photoshop's Autosave Won… | NO_DIVIDER | NO_DIGIT_IN_BODY |
| en | `thesis-single-point-of-failure` | 【2026 File Management】Masters thesis version contr… | LEN_TOO_LONG(106) | — |
| en | `too-many-file-versions` | 【2026 File Management】The Document Version Control… | NO_DIVIDER | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| en | `version-control-software-non-developer` | 【2026 File Management】Why "Version Control Softwar… | LEN_TOO_LONG(115) | — |

## 只有 WARN（建議優化但可保留 voice-driven 選擇）

| Locale | Slug | WARN |
|---|---|---|
| zh-tw | `client-asked-which-version` | LEN_SHORT(27.5), NO_INTENT_WORD |
| zh-tw | `cloud-version-history-cliff` | NO_INTENT_WORD |
| zh-tw | `deleted-files-recovery-list` | PK_NOT_IN_HEAD("誤刪檔案 找回"), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-tw | `departing-employee-data-risk` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-tw | `dropbox-conflicted-copy` | PK_NOT_IN_HEAD("dropbox 衝突的副本") |
| zh-tw | `file-version-management-complete-guide` | NO_DIGIT_IN_BODY |
| zh-tw | `hidden-cost-shared-folders` | NO_INTENT_WORD |
| zh-tw | `install-keeply-windows-mac` | NO_DIGIT_IN_BODY |
| zh-tw | `photoshop-autosave-not-version-history` | PK_NOT_IN_HEAD("photoshop 自動儲存"), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-tw | `recover-overwritten-file` | PK_NOT_IN_HEAD("找回被覆蓋的檔案"), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-tw | `restore-without-panic` | NO_INTENT_WORD |
| zh-tw | `thesis-single-point-of-failure` | NO_INTENT_WORD |
| zh-tw | `time-machine-vs-dropbox` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-tw | `too-many-file-versions` | NO_INTENT_WORD |
| zh-tw | `vibe-coding-rollback` | PK_NOT_IN_HEAD("vibe coding 失控"), NO_INTENT_WORD |
| zh-tw | `what-keeply-saves-vs-backup-cloud` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-tw | `why-i-built-keeply` | NO_DIGIT_IN_BODY |
| zh-cn | `3-2-1-backup-rule` | NO_INTENT_WORD |
| zh-cn | `autocad-wrong-version-crew` | NO_INTENT_WORD |
| zh-cn | `client-asked-which-version` | LEN_SHORT(27.5), NO_INTENT_WORD |
| zh-cn | `cloud-version-history-cliff` | NO_INTENT_WORD |
| zh-cn | `deleted-files-recovery-list` | PK_NOT_IN_HEAD("误删文件 找回"), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `departing-employee-data-risk` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `dropbox-conflicted-copy` | PK_NOT_IN_HEAD("dropbox 冲突的副本"), NO_INTENT_WORD |
| zh-cn | `file-version-management-complete-guide` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `hidden-cost-shared-folders` | NO_INTENT_WORD |
| zh-cn | `install-keeply-windows-mac` | NO_DIGIT_IN_BODY |
| zh-cn | `keeply-first-week-workflow` | NO_INTENT_WORD |
| zh-cn | `keeply-getting-started-from-zero` | NO_INTENT_WORD |
| zh-cn | `photoshop-autosave-not-version-history` | PK_NOT_IN_HEAD("photoshop 自动保存"), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `recover-overwritten-file` | PK_NOT_IN_HEAD("找回被覆盖的文件"), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `restore-without-panic` | NO_INTENT_WORD |
| zh-cn | `thesis-single-point-of-failure` | NO_INTENT_WORD |
| zh-cn | `time-machine-vs-dropbox` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `too-many-file-versions` | NO_INTENT_WORD |
| zh-cn | `version-control-software-non-developer` | NO_INTENT_WORD |
| zh-cn | `vibe-coding-rollback` | PK_NOT_IN_HEAD("vibe coding 失控"), NO_INTENT_WORD |
| zh-cn | `what-keeply-saves-vs-backup-cloud` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `why-i-built-keeply` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| en | `client-asked-which-version` | LEN_LONG(92), NO_INTENT_WORD |
| en | `deleted-files-recovery-list` | LEN_LONG(88), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| en | `departing-employee-data-risk` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| en | `file-version-management-complete-guide` | NO_DIGIT_IN_BODY |
| en | `hidden-cost-shared-folders` | LEN_LONG(100), NO_INTENT_WORD |
| en | `keeply-first-week-workflow` | LEN_LONG(95) |
| en | `recover-overwritten-file` | LEN_LONG(91), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| en | `restore-without-panic` | LEN_LONG(91), NO_INTENT_WORD |
| en | `time-machine-vs-dropbox` | LEN_LONG(98), NO_DIGIT_IN_BODY |
| en | `vibe-coding-rollback` | LEN_LONG(93), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| en | `what-keeply-saves-vs-backup-cloud` | LEN_LONG(100), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| en | `why-i-built-keeply` | LEN_LONG(95), NO_DIGIT_IN_BODY |

## Issue codes

### HARD（硬違規必修）
- `NO_TITLE` — title 空白
- `NO_TAG_PREFIX` — 缺【…】prefix（P1.21 contrast frame template 強制）
- `NO_PRIMARY_KEYWORD` — frontmatter primary_keyword 欄位空白
- `PK_LOOKS_LIKE_NOTE` — primary_keyword 夾雜 baseline / master / 引號 註記，不是純 keyword
- `NO_YEAR` — title 不含 20XX 年份（P1.21 強制）
- `NO_DIVIDER` — title 主體不含 ：｜？/ 等分段符號（無分段易被 SERP 截斷）
- `LEN_TOO_LONG` — zh > 50 全形 / en > 70 char（過長會被 Google rewrite）

### WARN（建議優化但 P1.20 voice-driven mode 合法）
- `LEN_SHORT` / `LEN_LONG` — zh 28-42 / en 40-60 為甜蜜帶
- `PK_NOT_IN_HEAD` — primary_keyword 任一 token (≥2 char) 沒落在【】後 12 字內
- `NO_DIGIT_IN_BODY` — title 主體（去年份後）不含任何阿拉伯數字
- `NO_INTENT_WORD` — title 主體不含搜尋意圖詞（推薦/比較/教學等）

