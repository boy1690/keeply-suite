# GEO harvest notes — what's worth taking from seo-geo-claude-skills

Source clone: `D:\tmp\seo-geo-claude-skills`. Focus: the GEO (AI-citation) material,
since that's the one area BWF is thinner than this repo. Honest read below — most of
their GEO advice **BWF already encodes**; only 4 things are genuinely additive.

## Already covered by BWF (no action — confirms our rules)

| seo-geo technique | BWF equivalent |
|---|---|
| Q&A pairs: exact question as H2, 40-60w answer | **P1.22** AEO question-based H2 |
| "answer first, then elaborate" chunk | **P1.23** Executive Answer inverted-pyramid |
| Standalone/unambiguous chunks (no dangling "this") | **P1.24** Standalone Context |
| Definition blocks "**X** is [category] that…" | P1.23 + skeleton "重點" cite block |
| Statistic blocks w/ source + timeframe | **P0.4 / P1.12** citation rules |
| Authority: byline, credentials, citations | **P1.13** author byline + E-E-A-T |
| Comparison tables w/ "best for" | already standard in our cluster skeletons |

## Genuinely additive — worth pulling in

1. **AI-engine targeting table** (`build/geo-content-optimizer/references/ai-citation-patterns.md`).
   Per-engine bias: *Perplexity* = very-high structure + freshness + quotable;
   *AI Overviews* = very-high authority + domain-trust; *ChatGPT* = medium structure.
   → Use at angle/skeleton time to pick which lever to push for the target surface.

2. **AI-Overview-recovery 4-phase playbook** (`.../references/ai-overview-recovery.md`):
   measure → diagnose → rewrite → monitor, for "AI Overview is eating clicks on N
   head queries." → Slots into our **Touch 5 retrofit queue** as a GEO-specific branch
   (today the weekly retrofit only reasons about classic SERP position).

3. **entity-optimizer + knowledge-panel-wikidata-guide** (`cross-cutting/entity-optimizer/`):
   making the **Keeply brand** resolvable as a knowledge-graph entity (Wikidata,
   consistent description_short, disambiguation). BWF has nothing here — this is a
   brand-level E-E-A-T play, not per-article. Candidate for a one-off task.

4. **schema-decision-tree** (`build/schema-markup-generator/references/schema-decision-tree.md`)
   + validation-guide. We ship FAQ/HowTo schema ad hoc; their decision tree (which
   schema type per page intent) + validation checklist could tighten our schema gate.
   Cross-check against `reference_v8_replace_dollar_backref_trap` (our FAQ JSON-LD `$N` bug).

## Deliberately skipped

- Their `keyword-research`, `serp-analysis`, `content-quality-auditor`,
  `rank-tracker`, `backlink-analyzer` skills — we have stronger, MCP-wired
  equivalents (ubersuggest-mcp-flow, serp_analysis, bwf-voice-reviewer, SerpBear,
  GSC weekly). No reason to adopt.
- Their memory system (HOT/WARM/COLD wiki) — we already have the file-based memory dir.

## If you want these as BWF changes (not done — needs your go-ahead)

- Add item 1's engine table as a one-liner picker in `~/.claude/bwf/` skeleton step.
- Add item 2 as a branch in `apps/blog/_dev/seo/gsc-retrofit-queue.js` (AI-Overview
  action type) — but that needs a way to detect AIO presence per query first.
- Items 3 & 4 are standalone tasks, not framework edits.
