---
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
description: SOC — Social Distribution Lifecycle Framework, 6-phase slash-command shape v0.2 (4 primary channel + 2 opportunistic; state schema 含 90/180-day milestones + 6 pivot triggers; v0.2 adds data feedback loop + pre-post diagnosis gate + template library + autonomous mode; canonical home = keeply-suite/apps/social)
version: v0.2.0
---

# /soc — Social Distribution Lifecycle (slash-command shape v0.1)

你是 SOC 框架執行器。使用者打 `/soc` 處理 keeply 海外英文社交渠道（distribution layer）週度 / 月度任務。

本 handler 把既有 `D:/tools/doing/keeply-workspace/0.idea/7.SOC.md` 研究結論
（LinkedIn personal long-form + Newsletter / Reddit comment-first / Facebook Groups lurk-then-contribute /
Hugo blog canonical home / 略過 Substack X Threads TikTok 獨立品牌頁；含 channel architecture / 90-day & 180-day milestones /
6 條 risk + pivot triggers）映射成 6-phase slash-command 結構：

```
INTENT → DRAFT → SELF-REVIEW → [HUMAN-CHANNEL-PUBLISH] → ARCHIVE → [PERIODIC-PIVOT-CHECK]
```

`[HUMAN-CHANNEL-PUBLISH]` 與 `[PERIODIC-PIVOT-CHECK]` 為條件 phase，方括號表示
「視 channel 與觸發決定是否進入」。完整 6 phase 與既有研究 §Channel Architecture 對應表見「Phase Mapping」段。

**scope 定位（必讀）**：`/soc` 是 **distribution layer**，**不是 production layer**。
- **內容權威 = `/blg` weekly note**（撰寫權 + content thesis 由 blg dept 持有）
- **資產權威 = `/web` Hugo blog**（canonical home / AI-citable URL / 多語言索引）
- `/soc` 從 `/blg` 取內容 → 重寫為平台 native 形式（LinkedIn long-form / Newsletter / Reddit comment / FB Groups answer），所有 backlink 一律指向 `/web` Hugo blog canonical URL
- `/soc` **不**自行撰寫 weekly note；**不**把 LinkedIn Newsletter / Substack / Reddit 等 platform-controlled URL 當 canonical home

---

## ABSOLUTE HARD RULES（必讀，handler 內任何 phase 都不可違反）

本 8 條 hard rule 對應 `ceo-intent.md §Explicit Constraints A1-A8`，逐條可 grep。

### A1. 4 channel only（until $20K MRR or content collaborator hired）

合法 active channel 只 4 條：
- **LinkedIn personal**（long-form post + Newsletter；不開獨立 LinkedIn company page）
- **Reddit**（comment-first，ICP-specific subs）
- **Facebook Groups**（lurk-then-contribute，US/UK/Canada/Australia/NZ 群組為主）
- **Hugo blog**（owned，canonical home）

opportunistic（一次性事件，非 weekly cadence）：
- **Hacker News Show HN**（v1 stable 時一次）
- **Product Hunt**（一次重大 launch，6-12 週準備期）

**永久排除清單（hard rule，不是「還沒建好」）**：
- YouTube primary（defer 至 content collaborator hired）
- X / Twitter primary（per research §X — case studies don't replicate；median engagement 0.03-0.12%；indie-hacker 泡沫不是 keeply 買家）
- **Substack**（per research §Skip — duplicates Hugo blog；Substack 只能出現在本 §排除清單，**不可進 active channel list**）
- Threads primary（per research §Threads — no B2B traction；25-34 為主要 cohort）
- TikTok（entertainment mode，無 B2B fit）
- 獨立 LinkedIn company / brand page（per research §LinkedIn personal vs company page — 0.28x algorithmic multiplier）
- Medium / Dev.to / Hashnode（wrong audience）

handler 任何 phase 偵測到使用者要求對外發到上述排除清單 → ESCALATE「{platform} 在 v0.1 hard rule 永久排除清單。請使用者確認是否要破例（破例需明示 + 寫進 review_note）；否則 abort」。

### A2. No separate brand page

LinkedIn personal account = keeply brand。**不開獨立 LinkedIn company page**。
理由（research §LinkedIn personal vs company page）：company-page text posts 算法乘數 0.28x，
等同隱形；solo-founder personal 比 company page 在相同內容上勝出 10-20x engagement。

handler 不為 keeply 產出對應 LinkedIn company page 的內容 / 設定 / 計畫。

### A3. Hugo blog 為 canonical home，不被 Substack 取代

每篇 weekly note 在 Hugo blog 有唯一 canonical URL。
- LinkedIn long-form post 結尾 backlink → Hugo blog canonical URL
- LinkedIn Newsletter 內文末段 backlink → Hugo blog canonical URL
- Reddit comment 末段（90/10 規則允許時）→ Hugo blog canonical URL
- Facebook Groups answer 引用 → Hugo blog canonical URL

**反向禁止**：
- LinkedIn Newsletter platform URL 不可取代 Hugo blog canonical
- Substack（permanently excluded per A1）不可取代 Hugo blog canonical
- 任何 platform-native URL 不可成為 backlink target

### A4. Content thesis 限縮句型

weekly content thesis **必為**：
```
this week I learned X about how [ICP role] handle file pain
```
其中 `[ICP role]` ∈ { designers / architects / interior designers / lawyers / accountants / CPAs / graphic designers / freelancers }。

**反例（hard rule 禁止復發，per research §Risk 1 documented failure mode）**：
- ❌ `this week with Claude Code` → 觸及 indie hackers / devs，不是 keeply ICP
- ❌ `Claude Code 紀錄` → 同上
- ❌ `building in public progress`（generic）→ 同上

handler DRAFT phase 任何重寫產出若包含上述反例字串作 active thesis → ESCALATE
「content thesis 觸發 Risk 1 documented failure mode（wrong audience）。
請使用者改為 ICP file-pain 視角，或確認破例（破例需明示且不應發生於 v0.1）」。

### A5. Reddit 90/10 規則嚴格遵守

- **90% value / 10% product**（research §Reddit + Decision matrix）
- **comment-first**（不發 self-promo post；ICP-specific subs 優先）
- ICP-specific subs：r/architecture / r/AskArchitects / r/biglaw / r/Lawyertalk / r/Accounting /
  r/graphic_design / r/freelance / r/datahoarder / r/selfhosted / r/interior_design 等
- **不浪費時間在 r/SaaS / r/Entrepreneur**（受眾是其他 founder，不是 keeply 買家）
- 提及 keeply 僅在 genuinely correct answer to a specific pain post 時（90/10 內 10% 的部分）

handler 產 Reddit comment 重寫時必先確認：(1) target sub ∈ ICP subs；(2) comment 是 value-first
（不是 product-first）；(3) 末段提 keeply 是 optional（依 90/10 比例）。

### A6. Facebook Groups = 美國錨定假設

active 範圍限：**US / UK / Canada / Australia / NZ 群組**（per research §Risk 5）。

**不算入此 channel（v0.1）**：
- DE（德國）/ FR（法國）/ JP（日本）/ KR（韓國）/ BR（巴西）FB Groups
- 任何非英語為 primary language 的 FB Groups

candidate active groups（research 已點名，handler 可作參考清單）：
- QB Power User Community
- Tax Professionals of America
- CPA & Accountant Business Owners (USA)
- Bay Area Attorney Network
- Lawyer Marketing 🔥
- Ivy Designer Network
- Interior Architecture + Design (IA+D)
- Architects & Designers of NYC
- Graphic Designers Tip Lounge
- 各州 state-bar solo-firm groups

handler 在 channel = facebook-group-contribution sub-dispatch 時，必檢查 group 屬於 US/UK/CA/AU/NZ
錨定假設範圍。否則 ESCALATE。

### A7. Pivot trigger 監測義務

state schema 必持續量測 6 條 pivot trigger（見 §State Schema）。達標時 PERIODIC-PIVOT-CHECK phase
觸發回頭檢討。**不可**忽略量測；**不可**因短期波動就 pivot（required: 連續觀察期，例
「3 consecutive weeks」、「by month 6」等以 7.SOC.md 為準）。

### A8. Realistic milestones 不可作為 KPI 強制

90-day / 180-day milestone 數字（見 §State Schema）為 **mid-band realistic**，**不**對齊就 churn。

real metrics（per research §Realistic Milestones §closing）：
- weekly cadence consistency（**1/week**，與 /blg 訂頻對齊）
- comment response speed（**< 60 minutes** on own posts）
- Reddit comment quality

handler 在 SELF-REVIEW phase 提醒使用者：milestone 數字看作參考；**不**寫 OKR 也**不**對齊績效。

### A8a. （延伸 hard rule，非 INTENT 主編號內，但仍須 grep 為 hard rule）Legacy doc preservation

`D:/tools/doing/keeply-workspace/0.idea/7.SOC.md` 為 reference doc，**不刪不改**。
（對齊 create-law-slash-command-shape 既有 4 份法律文件 mtime 確認未動 pattern。）

handler 任何 phase **不可** 寫入 / 修改 / 刪除 `0.idea/7.SOC.md`。
若需引用，僅 read-only。

---

## v0.2 — Optimizations: data loop / diagnosis / templates / autonomy

> v0.2 turns SOC from a manual checklist into a **learning loop**. All v0.1 hard rules
> (A1–A8 + A8a) still bind. Loop:
> INTENT (reads past performance) → DRAFT (templates, `--auto`) → SELF-REVIEW (+ diagnosis)
> → PUBLISH → ARCHIVE → MEASURE → PATTERNS → back to INTENT.

### v0.2.0 — Canonical home repoint（這裡當正本）

SOC's source of truth is now **keeply-suite**, not keeply-workspace. Where v0.1 sections
below say `D:/tools/doing/keeply-workspace/apps/...`, read them as:

| v0.1 path | v0.2 canonical (keeply-suite) |
|---|---|
| `keeply-workspace/apps/soc/.claude/state/` | `D:/tools/doing/keeply-suite/apps/social/<channel>/state/` |
| `keeply-workspace/apps/blog/` (source blg note) | `D:/tools/doing/keeply-suite/apps/blog/` |
| `keeply-workspace/apps/web/` (canonical URL) | `https://keeply.work` (apps/website) |
| template library | `D:/tools/doing/keeply-suite/apps/social/soc-templates.md` |

`7.SOC.md` reference doc stays read-only (A8a). The Threads experiment (`apps/social/threads/`)
is **outside** these channels — Threads is A1-excluded; don't run `/soc` for it.

### §1 — Data feedback loop (closes SOC's biggest gap)

v0.1 only had lagging 90/180-day milestones. v0.2 adds **per-post learning**.

**New state fields** (append to §State Schema, items 13–14):
- `post_performance[]` — per post: `{slug, channel, hook_type, topic_atom, icp_angle,
  posted_at, measured:{impressions, engagement_rate, profile_clicks, canonical_clicks,
  attributable_signups}}`. **Lead metric = canonical_clicks + attributable_signups, NOT
  impressions/likes** (A8 + trust-first).
- `pattern_intelligence` — `{updated_at, top_hook_types[], top_topic_atoms[],
  top_icp_angles[], dead_patterns[], sample_size, confidence}`. `confidence` stays `low`
  until ≥8 measured posts (don't over-fit early).

**New subcommands:**
- `/soc measure <slug>` — capture a post's metrics into `post_performance[].measured`
  (run 48h + 1 week after publish).
- `/soc patterns` — synthesize `post_performance` → refresh `pattern_intelligence`
  (which hook / topic / icp correlate with clicks+signups; flag dead_patterns).

**INTENT reads patterns (new Step I-4.5):** before choosing channels, read
`pattern_intelligence`; if `confidence ≥ medium`, bias this week's topic_atom / icp_angle
toward what drove canonical_clicks, avoid dead_patterns. If `low`, say so and keep
exploring (don't over-steer on <8 posts).

### §2 — Pre-post DIAGNOSIS gate (new SELF-REVIEW Step SR-1.5)

Before the hard-rule checklist, per channel draft:
- [ ] **HOOK STRENGTH** — first 200 chars carry a concrete scene/reversal, not a warm-up.
  Read cold: would the ICP stop scrolling? Weak → rewrite.
- [ ] **吸客非吸讚 (trust-first)** — attracts a CUSTOMER (specific ICP file-pain → could
  become a trial) or just a VIEWER (generic-relatable → likes, no signups)? Viewer-bait →
  reframe. **Blocking.**
- [ ] **AI-TELL** — no "in today's fast-paced world" / "let's dive in" / em-dash spam /
  tidy tricolons.
- [ ] **STANDALONE VALUE** — posts 1..n-1 give value with ZERO product mention; product
  only in the last beat (A5 90/10).
- [ ] **PREDICTION** — per `pattern_intelligence`, note expected band → baseline to MEASURE against.
- [ ] **CTA** — exactly one backlink → `keeply.work` canonical (A3). **Blocking if missing/wrong.**

Fail → back to DRAFT (max 3 rounds → ESCALATE). Blocking only on 吸客非吸讚 viewer-bait or
a bad/missing backlink; the rest is informational.

### §3 — Template library

DRAFT Step D-3 pulls proven structures from `apps/social/soc-templates.md` (LinkedIn
long-form structures / Reddit 90/10 comment / FB Groups answer / hook patterns) instead
of drafting cold each week.

### §4 — Autonomous mode (`--auto`)

`/soc weekly --auto [--channels linkedin-longform,reddit-comment]` — runs the cadence with
minimal prompting, stopping only at the 2 real gates:
1. **source blg note:** auto-pick the most recent `/blg` weekly note (ask only if none / >1 ambiguous)
2. **ICP role:** infer from the blg note (ask only if absent)
3. **channels:** default to last week's set (or `[linkedin-longform, reddit-comment]` first
   run); `--channels` overrides
4. **DRAFT:** apply §3 templates + `pattern_intelligence` automatically
5. **STOP only at:** (a) PRE-POST DIAGNOSIS gate (§2) — show drafts + diagnosis, get one
   "ship it"; (b) HUMAN-CHANNEL-PUBLISH (manual, unchanged)
6. Hard rules A1–A8 still enforced; any violation → ESCALATE (never silently override)

Non-auto interactive flow stays the v0.1 default; `--auto` is opt-in.

---

## Phase Mapping（既有 7.SOC.md §Channel Architecture ↔ slash-command 6-phase）

| slash-command phase | 既有 research 對應 | 動作摘要 | 條件 |
|---|---|---|---|
| `INTENT` | weekly trigger 前置（取 blg weekly note + 設 ICP role + 選 channels） | 確認 source weekly note（從 /blg）、ICP role、本週要重寫到的 channel 子集；確認 hard rule 不違反 | 必 |
| `DRAFT` | 4-channel 重寫 | per channel sub-dispatch fork blg weekly note → 平台 native 形式（LinkedIn long-form / Newsletter / Reddit comment opportunities / FB Groups observation log）；frontmatter `status: draft` | 必 |
| `SELF-REVIEW` | 對照清單檢查 | 跑 8 條 hard rule checklist（A1-A8）；確認 backlink 全指向 Hugo blog canonical；status 改 `internal-review` | 必 |
| `HUMAN-CHANNEL-PUBLISH` | 使用者手動發布 | handler **不**自動發布到任何平台（無 mail / API tool）；產出每 channel 草稿與 publish 指南，使用者複製貼上手動發；status 改 `awaiting-publish` | optional（若無 channel 要發 → SKIP） |
| `ARCHIVE` | 收尾 + state 量測 | status 改 `published`；state.json 更新 publish 時刻 + 各 channel 量測初值；soc-status.md cleanup | 必 |
| `PERIODIC-PIVOT-CHECK` | 持續監測 + pivot trigger | 與單週發布工作流 **解耦**；獨立 trigger（手動 `/soc periodic` 或月度排程）；本 v0.1 僅實作觸發進入回頭檢討入口；自動 schedule 監控留 v0.2 | optional, recurring |

HUMAN-CHANNEL-PUBLISH 觸發規則：
- **進**：本週至少有 1 channel 要發布（即 INTENT phase 使用者選了 ≥ 1 channel）
- **不進**：本週只跑 observation / signal 蒐集（read-only），不重寫對外發布

---

## Channel Sub-Dispatch（單 handler + 第二 arg 分發）

`/soc` 第一個 arg 為**子命令** / **動作**，第二個 arg 為 channel：

| channel arg | 用途 | 類型 | 對齊 research § |
|---|---|---|---|
| `linkedin-longform` | LinkedIn personal long-form post（800-1,200 chars，single-line breaks） | primary | §LinkedIn personal vs company page |
| `linkedin-newsletter` | LinkedIn Newsletter weekly issue | primary | §LinkedIn — Newsletter 段 |
| `reddit-comment` | Reddit ICP-specific sub comment opportunity 標記與草稿 | primary | §Reddit |
| `facebook-group-contribution` | FB Groups answer / observation log 條目（US/UK/CA/AU/NZ 錨定） | primary | §Facebook §Risk 5 |
| `hn-show-hn` | Hacker News Show HN 一次性 launch（v1 stable） | opportunistic | §Decision matrix HN row |
| `product-hunt` | Product Hunt 一次性 launch（6-12 週準備） | opportunistic | §Decision matrix PH row |

呼叫格式：

```
/soc {action} [channel] [--source-blg <blg-note-slug>] [--icp <role>]
```

範例：
- `/soc weekly` — 啟動本週 weekly cadence（會問 source blg note / ICP role / 本週要發的 channel 子集）
- `/soc weekly linkedin-longform --source-blg 2026-04-26-sketchup-version --icp interior-designers` — 直接重寫指定 blg note 為 LinkedIn long-form
- `/soc weekly reddit-comment` — 標記本週 Reddit comment opportunity 並草擬
- `/soc weekly facebook-group-contribution` — 更新 FB Groups observation log + 草擬本週 contribution
- `/soc launch hn-show-hn` — 啟動一次性 HN Show HN（opportunistic）
- `/soc launch product-hunt` — 啟動一次性 Product Hunt launch

特殊子命令（非 channel）：
- `/soc status [<slug>]` — 顯示本週任務目前 phase 與 awaiting 狀態（讀 state 檔）
- `/soc continue [<slug>]` — 續跑暫停在 HUMAN-CHANNEL-PUBLISH 等使用者手動發布的 task
- `/soc periodic` — 觸發 PERIODIC-PIVOT-CHECK phase（v0.1 僅觸發回頭檢討入口）
- `/soc observe [<channel>]` — read-only signal 蒐集（不重寫不發布；Reddit thread 觀察 / FB Group question 紀錄 / LinkedIn comment 趨勢 → 寫入 `state/soc-observations.md`）

---

## State 持久化

state 檔位置（local repo）：

```
D:/tools/doing/keeply-workspace/apps/soc/.claude/state/{slug}-state.json
```

詳細 schema 見 `D:/tools/doing/keeply-workspace/apps/soc/.claude/state/SCHEMA.md`。
摘要欄：

| # | 欄位 | 類型 | baseline? | 說明 |
|---|---|---|---|---|
| 1 | `slug` | string | **baseline** | task slug，例 `soc-2026-04-26-sketchup-version-week17` |
| 2 | `current_phase` | string | **baseline** | 6 phase 之一 |
| 3 | `awaiting` | string | **baseline** | `user-publish` / `user-action` / `none` |
| 4 | `awaiting_since` | ISO8601 | **baseline** | 進入當前 awaiting 狀態的時刻 |
| 5 | `source_blg_slug` | string | — | 來源 blg weekly note slug（內容權威來源） |
| 6 | `canonical_url` | string | — | Hugo blog canonical URL（資產權威 backlink target） |
| 7 | `icp_role` | string | — | designers / architects / interior-designers / lawyers / accountants / CPAs / graphic-designers / freelancers |
| 8 | `channels_targeted` | array | — | 本週要發的 channel 子集，例 `["linkedin-longform", "linkedin-newsletter"]` |
| 9 | `created_via` | string | — | `/soc-v0.1`，新流程必填 |
| 10 | `milestone_90day` | object | — | 90-day milestone 量測（見下方 schema） |
| 11 | `milestone_180day` | object | — | 180-day milestone 量測（見下方 schema） |
| 12 | `pivot_triggers` | array | — | 6 條 pivot trigger 量測值（見下方 schema） |

### `milestone_90day` 結構

逐字對應 7.SOC.md §Day 0-90 (foundation phase) 數字：

```yaml
milestone_90day:
  linkedin_followers_delta: { target_band: "+800 to +1,500", measured: null }
  newsletter_subscribers: { target_band: "150-400", measured: null }
  reddit_comment_karma: { target_band: "2,000-5,000", measured: null }
  facebook_groups_status: { target_state: "lurking only — measure pain-pattern themes, no posting yet", measured_state: null }
  blog_email_list: { target_band: "50-150", measured: null }
  trial_signups_attributable_to_social: { target_band: "20-60", measured: null }
  paid_customers: { target_band: "2-8", measured: null }
  engagement_rate_per_post: { target_band: "3-6% on first 30 posts", measured: null }
```

### `milestone_180day` 結構

逐字對應 7.SOC.md §Day 90-180 (compounding phase) 數字：

```yaml
milestone_180day:
  linkedin_followers_delta: { target_band: "+1,500 to +3,500", measured: null }
  newsletter_subscribers: { target_band: "500-1,200", measured: null }
  reddit_driven_trial_signups: { target_band: "20-80", measured: null }
  facebook_groups_inbound_dms: { target_band: "5-15", measured: null }
  hugo_blog_organic_traffic_multiplier: { target_band: "3-5x", measured: null }
  cumulative_trials_90day_total: { target_band: "80-200", measured: null }
  paid_customers: { target_band: "15-40", measured: null }
```

### `pivot_triggers` 結構（6 條，逐字對應 7.SOC.md §Honest risk assessment）

```yaml
pivot_triggers:
  - id: risk-1-reframe-doesnt-take
    threshold: "average LinkedIn post engagement is below 2% by day 60"
    action_if_triggered: "content thesis is wrong, not the platform — fix by booking 5-8 customer interviews/week and writing directly from those quotes"
    measured: null
    triggered_at: null
  - id: risk-2-linkedin-algo-shift
    threshold: "LinkedIn impressions drop below 500 per post for 3 consecutive weeks despite consistent quality"
    action_if_triggered: "lean harder into native vertical video (+69% boost in 2025 data) and document carousels — not into a new platform"
    measured: null
    triggered_at: null
  - id: risk-3-icp-not-on-linkedin
    threshold: "6-month customer-source data shows >40% of paid customers came from Instagram or Facebook Groups"
    action_if_triggered: "reweight time accordingly. Test this explicitly — every Keeply signup should ask 'where did you hear about us?'"
    measured: null
    triggered_at: null
  - id: risk-4-build-in-public-fragmentation
    threshold: "blog email list is below 500 by month 6"
    action_if_triggered: "increase capture aggression on the blog itself — without an owned list, every platform shift is existential"
    measured: null
    triggered_at: null
  - id: risk-5-fb-groups-globalization
    threshold: "FB Groups channel applied beyond US/UK/Canada/Australia/NZ anchoring (e.g. DE/FR/JP/KR/BR FB Groups treated as part of this channel)"
    action_if_triggered: "treat Facebook Groups as US-anchored, not global. Do NOT include DE/FR/JP/KR/BR FB Groups in this channel."
    measured: null
    triggered_at: null
  - id: risk-6-time-creep
    threshold: "addition of YouTube primary / X-as-primary / Substack / Threads-as-primary before either Keeply has $20K MRR or a content collaborator is hired"
    action_if_triggered: "do not add YouTube, X-as-primary, Substack, or Threads-as-primary until either Keeply has $20K MRR or a content collaborator is hired. The marginal cost of a new platform is 3-5 hours/week of unique time even with cross-posters; that's the entire weekly content budget."
    measured: null
    triggered_at: null
```

`awaiting` 合法值：`user-publish` / `user-action` / `none`。
DRAFT phase 結束時若預期會進 HUMAN-CHANNEL-PUBLISH，handler 即建立 state 檔；
ARCHIVE 完成後 state 檔改 `awaiting: none`、可保留供 PERIODIC-PIVOT-CHECK 月度比對。

---

## Intermediate artifact lifecycle（soc-status.md）

對齊 ceo-status.md 模式：

- **位置**：`D:/tools/doing/keeply-workspace/apps/soc/.claude/state/soc-status.md`
- **Size budget**：≤ 50 KB per task
- **Truncation 策略**：超過 → drop oldest entries from observation log，保留 Active Context Checkpoint + 最近 30 條 decision
- **Retention 規則**：task 收斂前保留至 ARCHIVE phase 結束（即 SOC-REVIEW 對應的最後一步）
- **Cleanup path**：ARCHIVE phase 最後一步刪除（對齊 CEO STATUS R-7 PERSIST 順序）
- **Handler abort 行為**：handler abort（ctrl-c / error halt）時 **保留 soc-status.md 不主動刪**，
  等下次 `/soc` Router v0.2 讀為斷點資料源；v0.1 Router 不讀，形同懸置（對齊 ceo-status lifecycle）

---

## Phase Detection（檔案 + state 即狀態機）

`/soc` 不帶任何 arg 時：
1. 掃 `D:/tools/doing/keeply-workspace/apps/soc/.claude/state/*.json`，列出所有 `awaiting != "none"` 的 task
2. 若有 → 顯示清單問使用者「要 continue 哪個？」
3. 若無 → 詢問「要啟動本週 weekly cadence 嗎？」（提示 `/soc weekly`）

帶 arg 時：
1. 第一 arg = `weekly` → 走 weekly cadence 流程（INTENT phase 開始）
2. 第一 arg = `launch` → 走 opportunistic launch 流程（HN / Product Hunt 一次性）
3. 第一 arg = `status` / `continue` / `periodic` / `observe` → 走特殊子命令
4. 否則 → 提示語法 + 合法子命令清單

---

## 各 phase 細節

### INTENT phase

**Goal**：確認 source weekly note（從 /blg）、ICP role、本週要重寫到的 channel 子集；確認 hard rule 不違反。

**Step I-1: Parse args**

從 `/soc {action} [channel] [--flags]` 解出 action / channel / source-blg / icp。
- action 不在 {weekly, launch, status, continue, periodic, observe} → 提示語法、停止
- 若 action = weekly 且無 source-blg → 問使用者「本週 source blg weekly note slug？」
- 若 action = weekly 且無 icp → 問使用者「本週 ICP role？（designers / architects / interior-designers / lawyers / accountants / CPAs / graphic-designers / freelancers）」

**Step I-2: 確認 source blg note 存在**

掃 `D:/tools/doing/keeply-workspace/apps/blog/`（symlink → keeply-blog repo）找對應 slug。
- 缺 → ESCALATE「source blg weekly note 不存在。/soc 是 distribution layer 不撰寫 weekly note；請先 /blg 完成本週 note」
- 找到 → 讀進記憶體供 DRAFT phase 重寫

**Step I-3: 確認 Hugo blog canonical URL**

從 source blg note frontmatter / web dept registry 取 canonical URL。
- 缺 → ESCALATE「Hugo blog canonical URL 未就緒。soc 對外所有 backlink 必指向 canonical URL，
  請先 /web 確認 Hugo blog email-capture form / Open Graph meta / canonical link header 就緒」
- 找到 → 寫入 state `canonical_url`

**Step I-4: 問本週要發的 channel 子集**

逐題問（per BWF style）：
- 「本週要發到哪些 channel？（可複選；options: linkedin-longform / linkedin-newsletter / reddit-comment / facebook-group-contribution）」
- 若使用者答含排除清單（YouTube / X primary / Substack / Threads primary / TikTok / 獨立 LinkedIn page / Medium / Dev.to / Hashnode）→ ESCALATE per A1
- 若使用者答 `[]`（本週只 observe，不重寫）→ 跳到 `/soc observe` 流程

**Step I-5: hard rule pre-flight check**

跑 A1-A8 + A8a 對照清單：
- A1：channel 子集 ⊆ {linkedin-longform, linkedin-newsletter, reddit-comment, facebook-group-contribution}（opportunistic 走 launch 不走 weekly）
- A2：handler 不為 keeply 產出 LinkedIn company page 內容
- A3：state.canonical_url 為 Hugo blog URL（不是 platform-native）
- A4：source blg note thesis 為 ICP file-pain 視角；若仍是 `Claude Code 紀錄` 風格 → ESCALATE per A4
- A5（若 channel 含 reddit-comment）：target sub ∈ ICP subs，不是 r/SaaS / r/Entrepreneur
- A6（若 channel 含 facebook-group-contribution）：target group ∈ US/UK/CA/AU/NZ
- A7：state.pivot_triggers 已就位
- A8：milestone 數字看作參考，不寫 OKR
- A8a：handler 在本 task 不寫 / 改 / 刪 `0.idea/7.SOC.md`

**Step I-6: 產出 INTENT 摘要、進 DRAFT**

呈現「我即將為本週 weekly cadence 把 {source-blg-slug} 重寫為 {channels-targeted}（ICP = {icp-role}），
所有 backlink 指向 {canonical_url}」給使用者確認。
使用者「對」→ 進 DRAFT。否則回 Step I-4 重問。

---

### DRAFT phase

**Goal**：per channel sub-dispatch 重寫 source blg weekly note 為平台 native 形式；frontmatter `status: draft`、`created_via: /soc-v0.1`。

**Step D-1: 計算 task slug**

格式：`soc-{YYYY-MM-DD}-{source-blg-slug-snippet}-week{ISO-week-number}`

範例：`soc-2026-04-26-sketchup-version-week17`

**Step D-2: 衝突檢查**

```bash
ls D:/tools/doing/keeply-workspace/apps/soc/drafts/{slug}*.md 2>/dev/null
```

- 任何匹配 → 自動加 channel suffix 避開（同 slug 跨 channel 各自獨立檔）
- 完全相同 + 同 channel → 詢問「覆寫 / 重命名 / abort」

**Step D-3: per channel sub-dispatch**

依 state.channels_targeted 逐 channel 跑 sub-handler：

#### linkedin-longform sub-handler

- 範圍：800-1,200 chars，single-line breaks（per research §LinkedIn — Format winners 2025）
- 開頭：強 hook（前 200 chars 是 LinkedIn truncate 線）
- 結構：故事 + 學習 + ICP 受眾 echo + 末段 backlink 至 Hugo blog canonical
- 發布建議：Tue/Wed 8-10am ET（per research）
- 外部 link 處理（per research §LinkedIn — Format winners）：
  - 安全策略：post 時不放外部 link；60-120 min Golden Hour 後 edit 加 link（Justin Welsh tactic）
  - 2025 update：external link 不再 fatal（~5% lift if used with strong opening）
- 寫到 `apps/soc/drafts/{slug}-linkedin-longform.md`

#### linkedin-newsletter sub-handler

- 範圍：完整 weekly issue，包含 LinkedIn Newsletter platform-specific 結構（subject line / preview / body / CTA）
- backlink：內文末段必含 Hugo blog canonical URL（per A3）
- 訂閱推送：LinkedIn Newsletter platform 自動推 push notification + email distribution to followers
- 寫到 `apps/soc/drafts/{slug}-linkedin-newsletter.md`

#### reddit-comment sub-handler

- **不**自動發 comment（無 reddit API tool；handler 是 distribution-prep 不是 distribution-execute）
- 範圍：標記本週 Reddit comment opportunities：
  1. 掃 ICP-specific subs（r/architecture / r/AskArchitects / r/biglaw / r/Lawyertalk / r/Accounting /
     r/graphic_design / r/freelance / r/datahoarder / r/selfhosted / r/interior_design 等）
     找未答 / answered-low-quality 的 pain post
  2. 為每條 opportunity 草擬 90/10 規則 comment（90% value + 10% keeply mention only if genuinely correct answer）
  3. 提醒使用者：comment-first；不發 self-promo post；ICP-specific subs 優先；不在 r/SaaS / r/Entrepreneur 浪費時間（per A5）
- 寫到 `apps/soc/drafts/{slug}-reddit-comment-opportunities.md`

#### facebook-group-contribution sub-handler

- **不**自動發 contribution（無 FB API tool；handler 是 distribution-prep）
- 範圍：
  1. 確認 target group ∈ US/UK/CA/AU/NZ（per A6）
  2. lurk-then-contribute 模式（research §Facebook §Groups）：
     - 0-4 週：lurk only，update `state/soc-observations.md` 觀察 pain-pattern themes
     - 4 週後：contribute 為 named-founder providing answers，never product pitches
  3. 草擬本週 contribution（如進 contribute 階段）
- 寫到 `apps/soc/drafts/{slug}-facebook-group-contribution.md`

**Step D-4: 填 frontmatter（每 channel draft 檔）**

```yaml
---
slug: "{slug}"
channel: "{channel}"
source_blg_slug: "{source_blg_slug}"
canonical_url: "{canonical_url}"
icp_role: "{icp_role}"
status: "draft"
created: "{YYYY-MM-DD}"
last_updated: "{YYYY-MM-DD}"
created_via: "/soc-v0.1"
---
```

**Step D-5: thesis 檢查（A4 hard rule landing）**

對每 channel draft 跑 grep 檢查：
- 不含 `Claude Code 紀錄`、`this week with Claude Code`、`building in public progress`（generic）作 active thesis
- 含限縮句型 `this week I learned X about how [ICP role] handle file pain` 或衍生變體
- 違反 → 回 D-3 重寫；3 rounds 不收斂 → ESCALATE per A4

**Step D-6: 預判 HUMAN-CHANNEL-PUBLISH 路徑、初始化 state 檔**

若 channels_targeted ≠ [] → 預期會進 HUMAN-CHANNEL-PUBLISH：

```bash
mkdir -p D:/tools/doing/keeply-workspace/apps/soc/.claude/state
# 寫 state 檔（JSON），current_phase: "DRAFT", awaiting: "user-action"（等 SELF-REVIEW 回收）
```

若 channels_targeted = []（observe-only）→ 不需 HUMAN-CHANNEL-PUBLISH，直接 ARCHIVE。

**Step D-7: 進 SELF-REVIEW**

呈現所有 channel draft 給使用者，告知「DRAFT 完成，下一步 SELF-REVIEW」。

---

### SELF-REVIEW phase

**Goal**：跑 8 條 hard rule checklist + per-channel quality checklist；status bump 為 `internal-review`。

**Step SR-1: 產出 self-review checklist**

8 條 hard rule + per-channel：

```
HARD RULES (A1-A8 + A8a):
- [ ] A1: channels_targeted ⊆ {linkedin-longform, linkedin-newsletter, reddit-comment, facebook-group-contribution}（無 YouTube / X primary / Substack / Threads primary / TikTok / LinkedIn brand page / Medium / Dev.to / Hashnode）
- [ ] A2: 無 LinkedIn company page 內容
- [ ] A3: 所有 channel draft 末段 backlink 指向 {canonical_url}（Hugo blog）
- [ ] A4: 所有 thesis 為 ICP file-pain 視角；無 `Claude Code 紀錄` / `this week with Claude Code` 風格
- [ ] A5（若含 reddit-comment）: target sub ∈ ICP subs，90/10 規則遵守，comment-first
- [ ] A6（若含 facebook-group-contribution）: target group ∈ US/UK/CA/AU/NZ
- [ ] A7: state.pivot_triggers 6 條已就位
- [ ] A8: milestone 數字當參考，不寫 OKR
- [ ] A8a: 0.idea/7.SOC.md 未動

PER-CHANNEL QUALITY:
- [ ] linkedin-longform: 800-1,200 chars，single-line breaks，hook 在前 200 chars
- [ ] linkedin-newsletter: subject line + preview + body + CTA + canonical backlink
- [ ] reddit-comment: 90/10 比例，comment-first，未答 pain post
- [ ] facebook-group-contribution: lurk-stage 或 contribute-stage 明確標示
- [ ] frontmatter `created_via: /soc-v0.1` 已標
- [ ] 所有 `[PLACEHOLDER]` 已填
```

呈現給使用者勾選。

**Step SR-2: 處理回饋**

- 使用者勾全 → 進 Step SR-3
- 使用者指出問題 → 回 DRAFT 補（max 3 rounds，超過 ESCALATE）

**Step SR-3: status bump**

修改檔案 frontmatter：`status: draft` → `status: internal-review`、`last_updated: {today}`。

**Step SR-4: 路由下一 phase**

- channels_targeted ≠ [] → 進 HUMAN-CHANNEL-PUBLISH
- channels_targeted = [] → 直接進 ARCHIVE（observe-only branch）

---

### HUMAN-CHANNEL-PUBLISH phase（optional）

**Goal**：產出每 channel publish 指南（複製貼上版）；持久化 awaiting state；handler 暫停。

**Step HCP-1: 產 publish 指南**

per channel：

#### linkedin-longform publish 指南

```
TARGET: LinkedIn personal account（不是 company page，per A2）
TIMING: Tue/Wed 8-10am ET（research §LinkedIn 2025 timing）
STEPS:
1. 複製 apps/soc/drafts/{slug}-linkedin-longform.md 內文
2. 貼到 LinkedIn personal account post composer
3. **第一版 post 不放外部 link**（Golden Hour 60-120 min）
4. 60-120 min 後 edit post 加 backlink: {canonical_url}
5. 60 min 內回所有 comment（research: 最高 correlation 與 LinkedIn growth 的 metric）
```

#### linkedin-newsletter publish 指南

```
TARGET: LinkedIn Newsletter（同 personal account）
TIMING: weekly cadence（與 /blg 訂頻 1/week 對齊，per A8 real metric）
STEPS:
1. 複製 apps/soc/drafts/{slug}-linkedin-newsletter.md 內文
2. 貼到 LinkedIn Newsletter editor（subject / preview / body 對應段落）
3. 確認內文末段含 {canonical_url} backlink
4. publish → LinkedIn 自動推送 push notification + email 給 followers
```

#### reddit-comment publish 指南

```
TARGET: ICP-specific subs（per A5）
RULES: 90/10 規則嚴格遵守；comment-first；不發 self-promo post
STEPS:
1. 開 apps/soc/drafts/{slug}-reddit-comment-opportunities.md
2. 逐條 opportunity：
   a. 重新確認 thread 仍未答 / answered-low-quality
   b. 確認 sub 屬 ICP-specific subs（不是 r/SaaS / r/Entrepreneur）
   c. 複製對應 90/10 comment 草稿
   d. 提交 comment（手動）
   e. < 60 min 內回所有 reply
```

#### facebook-group-contribution publish 指南

```
TARGET: US/UK/CA/AU/NZ FB Groups（per A6；DE/FR/JP/KR/BR 不算入）
RULES: lurk-then-contribute；named-founder providing answers，never product pitches
STEPS（依當前階段）:
- LURK STAGE（0-4 週）: 不發任何 contribution；只 update apps/soc/.claude/state/soc-observations.md 觀察 pain-pattern themes
- CONTRIBUTE STAGE（4 週後）:
  1. 開 apps/soc/drafts/{slug}-facebook-group-contribution.md
  2. 確認 target group ∈ US/UK/CA/AU/NZ
  3. 複製 contribution 草稿
  4. 提交 answer（手動），不放 product pitch
  5. < 60 min 內回 reply
```

**Step HCP-2: 持久化 state、handler 暫停**

更新 state 檔：

```json
{
  "current_phase": "HUMAN-CHANNEL-PUBLISH",
  "awaiting": "user-publish",
  "awaiting_since": "{ISO timestamp}"
}
```

修改各 channel draft frontmatter：`status: internal-review` → `status: awaiting-publish`。

handler 告知使用者：「HUMAN-CHANNEL-PUBLISH 指南已產出。各 channel 手動發布完成後請打 `/soc continue {slug}`。」**停止**，不自動往下。

**Step HCP-3: `/soc continue` 入口**

由 `/soc continue {slug}` 子命令路由進來：
1. 讀 state 檔，確認 `awaiting: user-publish`
2. 問使用者「各 channel 都發完了嗎？(y/partial/n)」
3. y → 進 ARCHIVE，state `awaiting: none`
4. partial → 問「哪些 channel 已發 / 哪些未發？」更新 state，留 awaiting
5. n → 留 state、告知「發布完再 /soc continue」、handler 停止

---

### ARCHIVE phase

**Goal**：status 改 `published`、state 量測初值寫入、soc-status.md cleanup。

**Step A-1: status bump**

修改各 channel draft frontmatter：
- `status: awaiting-publish`（或 `internal-review` if observe-only）→ `status: published`
- `last_updated: {today}`
- `published_at: {ISO timestamp}`

**Step A-2: 初始 metric 量測寫入 state**

per channel 量測初值（24h / 48h / 1 week 後 measured 由使用者另跑 `/soc measure {slug}` 更新；v0.1 不自動排程）：

```json
{
  "current_phase": "ARCHIVE",
  "awaiting": "none",
  "approved_at": "{ISO timestamp}",
  "milestone_90day": { /* 上方 schema, measured 欄留 null 待週度 update */ },
  "milestone_180day": { /* 同上 */ },
  "pivot_triggers": [ /* 6 條 schema, measured 欄留 null */ ]
}
```

**Step A-3: soc-status.md cleanup**

- task 收斂 → ARCHIVE phase 最後一步刪除 `apps/soc/.claude/state/soc-status.md`
- 若 handler abort（ctrl-c / error halt）→ 不主動刪，保留供 v0.2 Router 斷點

**Step A-4: HARD STOP — 不跨界**

呈現給使用者：

```
ARCHIVE 完成 ✅
- 各 channel draft：status: published
- state.json 已更新（milestone / pivot_trigger schema 就位）
- soc-status.md 已 cleanup

⚠️ 本 handler **不**自動觸發 /web render / /blg 修訂 / /ibv 改動。
   soc 是 distribution layer：本 task 範圍 = 本週 weekly cadence 重寫 + 手動發布；
   若揭露 web canonical-home 問題（email-capture form 不足 / Open Graph meta 缺）
   → 請另起 /web follow-up task（不在本 handler 範圍）。
```

handler **STOP**。

---

### PERIODIC-PIVOT-CHECK phase（optional, recurring）

**Goal**（v0.1 範疇）：僅實作觸發回頭檢討入口。完整自動 schedule 監控留 v0.2。

**入口**：`/soc periodic`

**Step P-1: 偵測**

掃 `apps/soc/.claude/state/*.json`，跑 6 條 pivot trigger 比對：

```
For each state file:
  For each pivot_trigger in state.pivot_triggers:
    if measured 達 threshold:
      mark triggered
      列給使用者
```

**Step P-2: 觸發回頭檢討**

呈現觸發 pivot trigger 給使用者：

```
PIVOT TRIGGER FIRED ⚠️
- ID: {risk-X-...}
- Threshold: {threshold from 7.SOC.md}
- Measured: {state.measured}
- Recommended action: {action_if_triggered from 7.SOC.md}

下一步建議：
- 若 risk-1: 重評 content thesis（回 /blg 補 ICP 訪談）
- 若 risk-2: lean into native vertical video / document carousels
- 若 risk-3: reweight time to Instagram / FB Groups
- 若 risk-4: increase blog email-capture aggression（/web follow-up）
- 若 risk-5: re-anchor FB Groups to US/UK/CA/AU/NZ
- 若 risk-6: do not add new platform until $20K MRR or content collaborator hired
```

handler 不自動執行 action；僅標 state.pivot_triggers[i].triggered_at = now，列出建議。

**Step P-3: v0.2 留口**

v0.1 不實作 schedule 監控、不自動觸發。
v0.2 預期加 cron-like trigger 或 hook 監控 pivot_triggers measured 欄位。

---

## ESCALATE Protocol

當任何 phase 撞到無解情況（3 rounds 不收斂、source blg note 缺、Hugo blog canonical URL 缺、
hard rule 違反、使用者拒絕推進但又不 abort 等）：

1. 明說「我遇到了需要你決定的問題」
2. 用非技術語言解釋具體狀況
3. 提供 2-3 個選項與 AI recommendation
4. 等使用者輸入
5. 解決後 resume flow

---

## 溝通原則

- 每個 phase 開始前明確告知：「現在在 Phase N: [名稱]」
- 每個 phase 完成後明確告知：「Phase N 完成。下一步是 Phase N+1」
- 碰到不清楚就問，不要假設
- 寫檔前先說「我要建立/修改 [檔名]，內容 [摘要]，可以嗎？」
- 4 channel sub-handler 流程互相獨立，不混講
- soc 是 distribution layer 不是 production layer：碰到「要不要直接寫一篇新 weekly note」→ 一律 ESCALATE 回 /blg

---

## 對齊既有資產確認清單（handler 啟動時自我檢查）

handler 第一次跑時 grep 確認以下路徑存在；缺則 ESCALATE：

- [ ] `D:/tools/doing/keeply-workspace/0.idea/7.SOC.md`（read-only reference doc，不刪不改 per A8a）
- [ ] `D:/tools/doing/keeply-workspace/apps/soc/.claude/state/SCHEMA.md`（state schema 定義）
- [ ] `D:/tools/doing/keeply-workspace/apps/blog/`（symlink → keeply-blog；source blg weekly note 來源）
- [ ] `D:/tools/doing/keeply-workspace/apps/web/`（symlink → keeply-website；Hugo blog canonical URL 來源）

---

*Template version: v0.1.0 | SOC slash-command shape | Created: 2026-04-26 (v0.1) | Maps 7.SOC.md research findings (LinkedIn personal long-form + Newsletter / Reddit comment-first / Facebook Groups lurk-then-contribute / Hugo blog canonical home; skip Substack X Threads TikTok independent brand page) to 6-phase slash-command shape with single-handler channel-type dispatch over 4 primary channels (linkedin-longform / linkedin-newsletter / reddit-comment / facebook-group-contribution) + 2 opportunistic (hn-show-hn / product-hunt). 8 hard rules A1-A8 + A8a derived from ceo-intent.md Explicit Constraints + 7.SOC.md research-derived hard rules. v0.1 builds framework + state schema + hard rules only; actual weekly cadence execution / LinkedIn post template library / Reddit comment script library / FB Group tracker cron / pivot trigger auto-alert / follow-up task spawn automation deferred to v0.2.*
