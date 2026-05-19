# P1.15 Pillar ↔ Cluster 互連 audit — 2026-05-14

Locale: zh-tw (master)
Total articles in corpus: 24

## Summary

| Check | Count |
|---|---|
| Pillars missing ≥3 in-body cluster links (P1.15 hard rule) | 0 |
| Clusters missing in-body link to pillar (P1.15 hard rule)  | 0 |
| Clusters with no pillar_parent set                          | 0 |
| Clusters whose pillar_parent slug doesn't exist             | 0 |
| Implicit pillars (≥3 incoming, role ≠ pillar)              | 0 |
| Articles with empty role + no pillar_parent                 | 5 |
| Mature tags (≥5 articles, candidate for pillar coverage)    | 6 |

## WARN — Articles with empty role + no `pillar_parent` (unclear positioning)

決定：標 `role: standalone` 或 `role: cluster` + 填 `pillar_parent`。

| Slug | Tags |
|---|---|
| `client-asked-which-version` | 檔案還原, 操作失誤 |
| `departing-employee-data-risk` | _(none)_ |
| `install-keeply-windows-mac` | Keeply 教學 |
| `photoshop-autosave-not-version-history` | 檔案版本管理, 設計, 還原 |
| `recover-overwritten-file` | 檔案還原, 操作失誤 |

## INFO — Mature tags (≥5 articles; candidate for new pillar)

Jerry「合併產文」乘數信號：同一 tag 累積 ≥5 article 後寫一篇 pillar 懶人包能拉整個 cluster 的搜尋權重。

### `版本控制` — 13 articles

已有 pillar 覆蓋: `file-version-management-complete-guide`

Articles:
- `3-2-1-backup-rule`
- `autocad-wrong-version-crew`
- `cloud-version-history-cliff`
- `deleted-files-recovery-list`
- `dropbox-conflicted-copy`
- `excel-version-history-limits`
- `file-version-management-complete-guide`
- `keeply-first-week-workflow`
- `restore-without-panic`
- `thesis-single-point-of-failure`
- `time-machine-vs-dropbox`
- `too-many-file-versions`
- `version-control-software-non-developer`

### `操作失誤` — 5 articles

**尚無 pillar 覆蓋** — 寫一個 pillar 收這 5 篇是高 ROI 動作。

Articles:
- `3-2-1-backup-rule`
- `client-asked-which-version`
- `hidden-cost-shared-folders`
- `recover-overwritten-file`
- `too-many-file-versions`

### `工具比較` — 7 articles

**尚無 pillar 覆蓋** — 寫一個 pillar 收這 7 篇是高 ROI 動作。

Articles:
- `3-2-1-backup-rule`
- `cloud-version-history-cliff`
- `deleted-files-recovery-list`
- `tax-document-retention`
- `time-machine-vs-dropbox`
- `version-control-software-non-developer`
- `what-keeply-saves-vs-backup-cloud`

### `檔案還原` — 7 articles

**尚無 pillar 覆蓋** — 寫一個 pillar 收這 7 篇是高 ROI 動作。

Articles:
- `autocad-wrong-version-crew`
- `client-asked-which-version`
- `dropbox-conflicted-copy`
- `excel-version-history-limits`
- `recover-overwritten-file`
- `restore-without-panic`
- `vibe-coding-rollback`

### `雲端同步` — 7 articles

已有 pillar 覆蓋: `file-version-management-complete-guide`

Articles:
- `cloud-version-history-cliff`
- `dropbox-conflicted-copy`
- `excel-version-history-limits`
- `file-version-management-complete-guide`
- `hidden-cost-shared-folders`
- `tax-document-retention`
- `time-machine-vs-dropbox`

### `Keeply 教學` — 5 articles

已有 pillar 覆蓋: `keeply-getting-started-from-zero`

Articles:
- `install-keeply-windows-mac`
- `keeply-first-week-workflow`
- `keeply-getting-started-from-zero`
- `vibe-coding-rollback`
- `what-keeply-saves-vs-backup-cloud`

## Issue codes

- **HARD** = 違反 P1.15 強制（pillar ≥3 cluster link / cluster ≥1 pillar link）
- **WARN** = 結構不清楚但不違反 hard rule
- **INFO** = 建議的 content roadmap 動作（不是違規）
