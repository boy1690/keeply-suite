# CLAUDE.md — apps/social/threads (Keeply Threads distribution)

> **Fresh start in keeply-suite** (2026-05-23). The earlier SOC project under
> `D:/tools/doing/keeply-workspace/apps/soc/` never launched; this is a clean
> beginning, scoped to **Threads**, living in the keeply-suite monorepo.
> Root rules: [../../../CLAUDE.md](../../../CLAUDE.md).

---

## ⚠️ Conscious override — read first

The canonical **SOC framework** (`~/.claude/commands/soc.md`, research in
`keeply-workspace/0.idea/7.SOC.md`) puts **Threads on its permanent-exclusion hard
rule**:

- **A1** — Threads listed under「永久排除清單（hard rule，不是還沒建好）」, reason:
  *"no B2B traction; 25-34 為主要 cohort."*
- **pivot risk-6** — *"do not add Threads-as-primary until Keeply has $20K MRR or a
  content collaborator is hired"* — a new platform costs **3-5 hrs/week = the entire
  weekly content budget**.

This project **consciously overrides that** to *test* Threads. That's a legitimate
choice, but it's on record so we don't forget the reasoning we're betting against.

**This project is NOT under `/soc`.** Running `/soc … threads` will ESCALATE/abort by
design (Threads is excluded there). This is a standalone experiment.

## Validation gate (honor the SOC evidence ethos)

Because we're overriding a researched exclusion, this experiment is **kill-gated**:

- **Window:** ~6–8 weeks of consistent posting (1–2/week).
- **Kill criterion:** if Threads drives **< 5 attributable trial signups** AND shows
  **no B2B/ICP engagement** in the window → **stop**, return the 3–5 hrs/week to the 4
  real SOC channels (LinkedIn / Reddit / FB Groups / blog).
- **Attribution:** every Keeply signup should ask *"where did you hear about us?"*
  (mirrors SOC risk-3). Without this, we can't judge the experiment — set it up first.
- Log results in `state/` and revisit at the window end. No sunk-cost continuation.

## Scope & boundaries (inherited SOC discipline)

- **Distribution layer, not production.** Content theses come from **`/blg`** weekly
  notes — don't write original theses here.
- **Backlinks** point to the **keeply.work / blog.keeply.work canonical URL**, never a
  Threads-native permalink as canonical.
- **ICP framing** (SOC A4): *"how [designers / architects / consultants / accountants /
  freelancers] handle file pain"* — NOT「building in public / Claude Code 紀錄」(wrong
  audience, documented failure mode).
- Writes stay inside `apps/social/threads/`. Path must start with
  `D:/tools/doing/keeply-suite/`.

## Candidate engine — AK-Threads-booster

`akseolabs-seo/AK-Threads-booster` (data-driven Threads writing advisor; **legit, not a
bot**) is a candidate drafting/diagnosis engine. Full evaluation +
install-vs-reference decision: [booster-eval.md](booster-eval.md).

## Structure

```
apps/social/threads/
├── CLAUDE.md          # this file
├── booster-eval.md    # AK-Threads-booster evaluation
├── drafts/            # per-post drafts (pull from /blg, rewrite Threads-native)
└── state/             # experiment state + attribution log + kill-gate tracking
```

## TODO before first post
1. Register `apps/social/` in root [CLAUDE.md](../../../CLAUDE.md) Apps table (new app area).
2. Decide AK-Threads-booster: install as engine vs reference its knowledge (see booster-eval.md).
3. Set up signup attribution ("where did you hear about us?") — the kill-gate needs it.
4. First post = rewrite an existing `/blg` note into Threads-native form, backlink to keeply.work.
