# AK-Threads-booster — evaluation (2026-05-23)

Repo: `akseolabs-seo/AK-Threads-booster` · 219★ · MIT · Python · Claude Code plugin/skill.
Topics: claude-code, claude-plugin, content-strategy, social-media, threads, writing-assistant.

## What it actually is (not what the name suggests)

Despite "booster," it is **NOT a bot / fake-engagement / follow-churn tool**. It's a
**data-driven Threads writing-decision system**: uses *your own post history* +
algorithm/psychology knowledge to do **topic selection → drafting (in your voice) →
pre-post diagnosis → performance prediction → review**. No fake accounts, no automated
engagement, no ToS-violating automation. ✅ Legit.

Notable contents:
- `knowledge/` — `algorithm.md`, `psychology.md`, `ai-detection.md`, `cards/ai-tone-card.md`
  (these are the reusable gold even if the tool isn't installed wholesale).
- `scripts/` — `fetch_threads.py`, `parse_export.py`, voice-distillation, freshness.
- `panel/` — a local web UI. `evals/` — eval fixtures + rubric.
- Disclaimer: *"doesn't guarantee viral posts; helps you use your own historical data to
  improve each posting decision."*

## Fit for Keeply

| Dimension | Read |
|---|---|
| Quality / safety | ✅ Legit, well-built, evidence-driven (mirrors BWF's ethos) |
| Channel fit | ⚠️ Threads itself is the question — your SOC research says **no B2B traction** for Keeply's ICP (see [CLAUDE.md](CLAUDE.md) override notice). The *tool* is fine; the *channel* is the bet. |
| Overlap | Conceptually duplicates your **BWF** (voice, anti-AI-tells, topic selection, red-team, retrofit-from-history) — but Threads-short-form instead of SEO blog. |

## Recommendation

- **If this Threads experiment proceeds** (it is — per the override decision): the
  booster is the **best-fit drafting/diagnosis engine** for it — far better than
  hand-writing, and it's the rare "data-driven not bot" tool in this space.
- **Install vs reference:** start by **referencing its knowledge cards**
  (`algorithm.md` / `psychology.md` / `ai-detection.md` / `ai-tone-card.md`) to inform
  drafts; only **install the full plugin** if/when the kill-gate (CLAUDE.md) shows
  Threads is earning its 3–5 hrs/week. Don't install a second writing framework before
  the channel proves itself.
- **Don't let it replace `/blg`** as content authority — it's a Threads-native rewriter,
  same role `/soc` plays for LinkedIn/Reddit/FB.

## Verdict
Tool: ✅ adopt as the engine **if** Threads survives the kill-gate. Channel: ⚠️ unproven
for B2B — that's exactly what the [CLAUDE.md](CLAUDE.md) validation window is testing.
