---
name: Reddit A5 — 48h category-naming reception probe
description: SOC channel A5（Reddit comment-first, 個人帳號）的第一個具體執行 = 48h「品類命名答案」接受度探針。測單則答案的即時接受度（非通路 ROI——那要幾週）；GREEN 才升級成 2-4 週持續參與走 /soc。源自 2026-05-24 citability 根因診斷：站內內容打不過老站 ranking → AI 不引用 → 槓桿在 off-site（Reddit/Quora 本就被 AI 重度引用）。
status: ready-to-execute
created: 2026-05-24
channel: A5 reddit (comment-first, personal account — SOC foundation.md)
related: ../foundation.md（A5 rule）· ../soc.md（scale path）· memory reference_aeo_citability_needs_ranking / feedback_channel_signal_before_ranking / project_keeply_content_strategy_landing_2026_05_21
---

<!-- markdownlint-disable MD013 MD041 -->

# Reddit A5 — 48h 品類命名「接受度探針」

## 為什麼是這個實驗（根因連結）
2026-05-24 citability 診斷：既有品類消歧文 **indexed 但不 ranking**（連自己核心 query 都排不上）→ Google AIO/Perplexity 只引用排得上的頁面 → Keeply 全缺席。binding constraint = domain authority，站內手段動不了。**唯一碰得到的槓桿 = off-site**：Reddit/Quora 本就是 AI 引擎重度引用的高權威來源 → 一則被認可的答案 = referral + 直接成為 AI 可引用來源（雙重命中），繞過低-DA blog。守 `feedback_channel_signal_before_ranking`：先拿訊號再 scale。

## 這個 48h 能/不能測
- ✅ **能**：單則「命名品類 + 真幫忙」答案的**即時接受度**（upvote / pull 回覆「什麼工具」/ 被刪）。
- ❌ **不能**：通路 ROI / 長期 referral（solo 48h 2-3 則留言，量必小，需幾週）。
- **決策用途**：接受度好 → 投 2-4 週持續 A5 參與（真通路測試，走 /soc）；被噓/刪 → message/通路不 fit。

## 目標 threads（已驗證真實 ICP 主場痛點）
| Thread | 類型 | 用途 |
|---|---|---|
| [r/Design「Can we go back to version 2?」](https://www.reddit.com/r/Design/comments/1ovdc57/) Nov-2025 · 留言全手動 `V1a/V1b` | 品類命名金礦 | AI 種子（長線）|
| [r/AutoCAD「Accidentally wrote over an existing file」](https://www.reddit.com/r/AutoCAD/comments/1qtk2sp/) Feb-2026 score 4 · 有人手動 Z1/Z2 | 救援+prevention pivot | 種子 |
| [r/architecture「manage your drawing revision files?」](https://www.reddit.com/r/architecture/comments/15izayc/) · [r/graphic_design「version control」](https://www.reddit.com/r/graphic_design/comments/16l5ken/) | 主場版本痛 | 種子 |

> ⚠️ 上列多為數月前帖（Google `site:` 只撈已 index 舊帖）→ 適合長線 AI 種子。**48h 即時訊號**需在 r/AutoCAD、r/Revit、r/graphic_design、r/Design **sort by New** 找近幾天的版本/覆寫痛帖（1-2 篇）。

## 答案模板（非 spam）
**結構**：① 先真幫忙（native/手動解法，建可信）→ ② **命名品類**（核心資產，種 AI 引用）→ ③ 品牌 **0 或 1 次 + disclosure**。

> ⚠️ Reddit 鐵律（= SOC A5）：用**既有個人帳號**、9:1 純幫忙、品牌最多 1 次且寫 disclosure。**純命名品類、不提 Keeply 也成立**——AI 引用要的是「品類被清楚命名」。禁 founder 個人故事（comment 只需輕 disclosure，不講 origin 敘事）。

**範例草稿（r/Design「can we go back to version 2」）：**
> Most of us end up doing what this thread shows — `V1a/V1b/V2a` by hand. That works until the project gets big or someone else touches the files, then the naming scheme is the thing that breaks.
>
> Worth separating three things that get lumped together:
> - **Backup** = a copy so you don't lose the file (disaster).
> - **Cloud sync** (Drive/Dropbox) = latest copy everywhere, with version history — but capped (Dropbox 30 days), and it's the cloud's copy, not your local working file.
> - **Local automatic version history** = every save of *your own* file kept with a note, so "go back to version 2" is one click, no manual naming. This is the category people here actually want — and the one with no common name, which is why everyone reinvents `_v2_final`.
>
> If your files already live in the cloud, lean on its version history. If they're local/NAS working files (most design/CAD/video), there are dedicated tools for automatic local history. *(disclosure: I work on one — but the category matters more than the tool.)*

**範例草稿 2（r/AutoCAD「Accidentally wrote over an existing file」— reactive，先救援後 pivot）：**
> A few things to try right now, in order — and stop saving in that folder until you've checked, because AutoCAD will overwrite the `.bak` on your next save:
> - The `.bak` is the *previous* save of that drawing — rename `drawing.bak` → `drawing.dwg` and open it. Heads-up: it only holds **one** step back, so if you've saved twice since, it's already gone.
> - Autosave `.sv$` — type `%temp%` in Explorer, sort by date, find `drawingname_*.sv$`, rename to `.dwg`.
> - If both are gone and the file sits on a synced/NAS drive, check that drive's own version history (Dropbox/OneDrive "previous versions", or NAS snapshots).
>
> The real issue is the one the "I save Z1/Z2/Z3" commenter already solved by hand: AutoCAD's `.bak` keeps a single step back, so one wrong overwrite = gone. What that habit is reaching for is *automatic local version history* — every save of the .dwg kept as a restorable point, separate from the live file, no renaming. It's its own category (not backup, not git). *(disclosure: I work on a tool in that space — but even the manual Z1/Z2 habit beats relying on .bak.)*

**範例草稿 3（r/architecture「manage your drawing revision files?」— proactive 組織）：**
> Most answers here are variants of manual naming (`A-101_rev_C`, date prefixes, `_ISSUE`) — works until the project's big or someone else opens the file, then the scheme is the thing that breaks.
>
> Worth separating three things that get lumped into "managing revisions":
> - **Issue / transmittal control** — the formal record of what you sent and when. This one you *do* want named and logged on purpose.
> - **Backup** — a copy so a drive failure doesn't lose the set.
> - **Working version history** — every save of your *own* in-progress file kept as a restorable point, so "go back to how this sheet looked Tuesday" is one click, no `_rev_C_FINAL_v2`.
>
> The third is the one everyone reinvents with filenames because it has no common name — *automatic local version history*, separate from backup and from heavier CAD-management systems (Vault/BIM360, which target multi-user coordination). For solo/small-team local or NAS files there are lightweight tools that just do the version-history part. *(disclosure: I build one — happy to name it, but the category distinction is the useful bit.)*

> 💡 citability tip（2026-05-25 研究）：每則塞 ≥1 個**帶來源的硬數據點**（.bak 只留 1 版 / Dropbox 30 天上限）顯著提高被 AI 引用機率；且 branded mention 與 AIO 出現相關 0.664（>backlinks 0.218）→ 一則被 upvote 的留言含一次「Keeply」品牌提及，正是現在最強的 AI-citation 槓桿。Reddit = Google 第二可見站。

## 量測（baseline 已抓 2026-05-24, GA4 property 534326745）
| 指標 | baseline 28d | 48h 看 |
|---|---|---|
| **on-thread 接受度（主）** | — | 該則 upvotes / 回覆 / 是否被刪 |
| reddit→keeply referral（次）| **0 sessions** | GA4 `sessionSource contains reddit` delta |
| 站台規模參照 | 全站 ~197/28d · organic search 僅 13 | 任何 ≥3-5 reddit session 相對有感 |

## 預先講定判準（防事後合理化）
- 🟢 **GREEN**（投 2-4 週 /soc A5）：≥1 則 upvote 淨正 + ≥1 則「怎麼用/什麼工具」pull 回覆 + 0 被刪。
- 🟡 **MIXED**：被讀無互動（0 upvote / 無回覆 / 沒被刪）→ 換 thread 鮮度/角度再 1 輪。
- 🔴 **KILL**：被噓到負 / mod 刪 / 被指 spam → message/通路不 fit，回根因重想。

## Solo 執行清單（~2h，user 發文 — identity-gated）
1. 既有 Reddit 帳號，2-3 目標（1-2 新鮮帖 + 1 上列種子帖）。
2. 每則照模板**手寫不同內容**（Reddit 偵測同文）。
3. 記 permalink + 發文時間 → 寫進 `state/`。
4. 48h 後回報 permalink → 拉 GA4 referral delta + upvote/回覆 → 對判準下 GREEN/MIXED/KILL。

## ⛔ BLOCKER（2026-05-25）+ 養帳號前置
查 Reddit 登入帳號 = `keeply_work`（品牌、1 天大、post1/comment0、"New User"）→ **不能跑探針**（新帳號留言被 spam filter 秒隱 = 訊號失真；且品牌帳號下場違反 A5）。user 個人帳號也是新的。

**前置 = 養帳號 1-2 週**（在**目標 sub 內**真誠參與，一石二鳥：解 spam filter + 帳號變眼熟參與者）：
- **主場 sub**（user=土木工程師，留言不用裝）：r/AutoCAD · r/civilengineering · r/architecture · r/Revit · r/bim
- **cadence**：~2-3 則真誠一般留言/天（自己的話、真經驗、**零品牌、零連結**）；目標合計 karma ~30-50 + 帳號 ≥1-2 週
- **首批暖身目標（r/AutoCAD, 2026-05-25 撈）**：
  - [Advice for getting into the field?](https://old.reddit.com/r/AutoCAD/comments/1tkj1c1/)（分享土木入行真經驗）
  - [Does all the bugs in AutoCAD drive anyone else to near madness?](https://old.reddit.com/r/AutoCAD/comments/1tjpd9w/)（63 留言高互動；「對，最煩的是 X」relatable 留言易拿 upvote）
- **養成後**才回到本 spec 的 reception-probe（3 則品類命名答案）。
- ⚠️ 不是 karma farming spam——必須真誠、具體、有幫助；假留言被偵測反傷帳號。

## Scale path
GREEN → `/soc` A5 channel，2-4 週持續 comment-first（state schema 量 6 pivot trigger）。KILL → 不投 Reddit，回 demand-creation 其他通路（1600 客戶 advocacy）。
