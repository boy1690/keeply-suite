# P1.11 標題公式 audit — 2026-05-15

Total: 75 articles × 3 locale(s)

- 完全通過: 8
- 只有 WARN: 63
- 含 HARD 違規: **4**

## Issue frequency

| Severity | Code | Count |
|---|---|---|
| HARD | NO_DIVIDER | 4 |
| HARD | LEN_TOO_LONG | 1 |
| WARN | NO_INTENT_WORD | 48 |
| WARN | NO_DIGIT_IN_BODY | 33 |
| WARN | LEN_LONG | 28 |
| WARN | PK_NOT_IN_HEAD | 11 |

## HARD 違規（必修）

| Locale | Slug | Title | HARD | WARN |
|---|---|---|---|---|
| zh-tw | `windows-file-history-vs-backup` | 【2026 檔案管理】Windows 有 3 種「備份」、卻沒一個能找回「會議後加結論」那版 | NO_DIVIDER | NO_INTENT_WORD |
| zh-cn | `windows-file-history-vs-backup` | 【2026 文件管理】Windows 有 3 种「备份」、却没一个能找回「会议后加结论」那版 | NO_DIVIDER | NO_INTENT_WORD |
| en | `windows-file-history-vs-backup` | 【2026 File Management】You think you're backed up. … | NO_DIVIDER | LEN_LONG(99), PK_NOT_IN_HEAD("windows file history vs backup"), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| en | `windows-file-history-wrong-version` | 【2026 File Management】I asked Windows File History… | LEN_TOO_LONG(102), NO_DIVIDER | NO_DIGIT_IN_BODY, NO_INTENT_WORD |

## 只有 WARN（建議優化但可保留 voice-driven 選擇）

| Locale | Slug | WARN |
|---|---|---|
| zh-tw | `cloud-version-history-cliff` | NO_INTENT_WORD |
| zh-tw | `deleted-files-recovery-list` | PK_NOT_IN_HEAD("誤刪檔案 找回"), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-tw | `departing-employee-data-risk` | LEN_LONG(46.0), NO_DIGIT_IN_BODY |
| zh-tw | `dropbox-conflicted-copy` | PK_NOT_IN_HEAD("dropbox 衝突的副本") |
| zh-tw | `excel-version-history-limits` | LEN_LONG(47.0) |
| zh-tw | `file-version-management-complete-guide` | NO_DIGIT_IN_BODY |
| zh-tw | `hidden-cost-shared-folders` | LEN_LONG(42.5), NO_INTENT_WORD |
| zh-tw | `install-keeply-windows-mac` | NO_DIGIT_IN_BODY |
| zh-tw | `photoshop-autosave-not-version-history` | LEN_LONG(45.0), PK_NOT_IN_HEAD("photoshop 自動儲存"), NO_DIGIT_IN_BODY |
| zh-tw | `recover-overwritten-file` | LEN_LONG(50.0), PK_NOT_IN_HEAD("找回被覆蓋的檔案"), NO_DIGIT_IN_BODY |
| zh-tw | `restore-without-panic` | NO_INTENT_WORD |
| zh-tw | `thesis-single-point-of-failure` | NO_INTENT_WORD |
| zh-tw | `time-machine-vs-dropbox` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-tw | `too-many-file-versions` | LEN_LONG(48.0) |
| zh-tw | `version-control-software-non-developer` | LEN_LONG(46.0) |
| zh-tw | `vibe-coding-rollback` | PK_NOT_IN_HEAD("vibe coding 失控"), NO_INTENT_WORD |
| zh-tw | `what-keeply-saves-vs-backup-cloud` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-tw | `why-i-built-keeply` | NO_DIGIT_IN_BODY |
| zh-tw | `windows-file-history-wrong-version` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `3-2-1-backup-rule` | NO_INTENT_WORD |
| zh-cn | `autocad-wrong-version-crew` | NO_INTENT_WORD |
| zh-cn | `client-asked-which-version` | NO_INTENT_WORD |
| zh-cn | `cloud-version-history-cliff` | NO_INTENT_WORD |
| zh-cn | `deleted-files-recovery-list` | PK_NOT_IN_HEAD("误删文件 找回"), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `departing-employee-data-risk` | LEN_LONG(46.0), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `dropbox-conflicted-copy` | PK_NOT_IN_HEAD("dropbox 冲突的副本"), NO_INTENT_WORD |
| zh-cn | `excel-version-history-limits` | LEN_LONG(47.0) |
| zh-cn | `file-version-management-complete-guide` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `hidden-cost-shared-folders` | LEN_LONG(42.5), NO_INTENT_WORD |
| zh-cn | `install-keeply-windows-mac` | NO_DIGIT_IN_BODY |
| zh-cn | `keeply-first-week-workflow` | NO_INTENT_WORD |
| zh-cn | `keeply-getting-started-from-zero` | NO_INTENT_WORD |
| zh-cn | `photoshop-autosave-not-version-history` | LEN_LONG(45.0), PK_NOT_IN_HEAD("photoshop 自动保存"), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `recover-overwritten-file` | LEN_LONG(50.0), PK_NOT_IN_HEAD("找回被覆盖的文件"), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `restore-without-panic` | NO_INTENT_WORD |
| zh-cn | `thesis-single-point-of-failure` | NO_INTENT_WORD |
| zh-cn | `time-machine-vs-dropbox` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `too-many-file-versions` | LEN_LONG(48.0), NO_INTENT_WORD |
| zh-cn | `version-control-software-non-developer` | LEN_LONG(45.0), NO_INTENT_WORD |
| zh-cn | `vibe-coding-rollback` | PK_NOT_IN_HEAD("vibe coding 失控"), NO_INTENT_WORD |
| zh-cn | `what-keeply-saves-vs-backup-cloud` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `why-i-built-keeply` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| zh-cn | `windows-file-history-wrong-version` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| en | `3-2-1-backup-rule` | NO_INTENT_WORD |
| en | `autocad-wrong-version-crew` | LEN_LONG(92), NO_DIGIT_IN_BODY |
| en | `client-asked-which-version` | LEN_LONG(92), NO_INTENT_WORD |
| en | `deleted-files-recovery-list` | LEN_LONG(88), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| en | `departing-employee-data-risk` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| en | `dropbox-conflicted-copy` | LEN_LONG(93) |
| en | `excel-version-history-limits` | NO_INTENT_WORD |
| en | `file-version-management-complete-guide` | NO_DIGIT_IN_BODY |
| en | `hidden-cost-shared-folders` | LEN_LONG(100), NO_INTENT_WORD |
| en | `install-keeply-windows-mac` | NO_INTENT_WORD |
| en | `keeply-first-week-workflow` | LEN_LONG(95) |
| en | `photoshop-autosave-not-version-history` | NO_DIGIT_IN_BODY |
| en | `recover-overwritten-file` | LEN_LONG(91), NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| en | `restore-without-panic` | LEN_LONG(91), NO_INTENT_WORD |
| en | `time-machine-vs-dropbox` | LEN_LONG(98), NO_DIGIT_IN_BODY |
| en | `too-many-file-versions` | NO_DIGIT_IN_BODY, NO_INTENT_WORD |
| en | `version-control-software-non-developer` | LEN_LONG(91), NO_INTENT_WORD |
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

