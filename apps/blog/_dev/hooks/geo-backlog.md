# GEO backlog — additive items from the seo-geo harvests

Sources: `aaron-he-zhu/seo-geo-claude-skills` (2026-05-22) + `zubair-trabzada/geo-seo-claude`
(2026-05-22 eval). Reference files vendored under [geo-ref/](geo-ref/) so this survives
`D:\tmp` cleanup. BWF prose edits go through the `~/.claude/bwf/` junction.

| # | item | status |
|---|---|---|
| G1 | AI-engine targeting in skeleton | ✅ **DONE** 2026-05-22 |
| G2 | AI-Overview-recovery retrofit branch | ⛔ blocked (needs AIO detection) |
| G3 | Keeply brand as knowledge-graph entity | 🔄 **REFRAMED** 2026-05-22 — apex schema already live; founder fixed; real gap = brand disambiguation (see geo-recon-report.md) |
| G4 | schema decision tree + validation | ✅ **DONE** 2026-05-22 |
| G5 | citability scorer at measure-time | 🆕 new (from zubair repo) — not started |
| G6 | AI-crawler visibility KPI in seo-weekly | 🚧 **Phase 0 ✅ / Phase 1 code ✅ built+verified / 待 push** 2026-05-24 |

---

## G1 — AI-engine targeting line in the skeleton step  ·  ✅ DONE 2026-05-22

Added a "GEO 引擎定向" block to `~/.claude/bwf/templates/t1.pillar.md` (after the
AEO-driven H2 section, v0.3.4): a per-engine lever table (Perplexity → structure/
tables/quotable; AI Overviews → authority/declarative; ChatGPT → factual density)
+ a `geo_target:` skeleton frontmatter declaration. Non-blocking guidance, not a gate.

---

## G2 — AI-Overview-recovery branch in the weekly retrofit  ·  ⛔ blocked

Playbook: [geo-ref/ai-overview-recovery.md](geo-ref/ai-overview-recovery.md) (4-phase:
measure → diagnose → rewrite → monitor). Add an `AIO_RECOVERY` action to
[apps/blog/_dev/seo/gsc-retrofit-queue.js](../seo/gsc-retrofit-queue.js).

**Blocker (unchanged):** no per-query AI-Overview-presence signal — GSC doesn't expose it.
Resolve first (manual SERP check, or scraper, or the `geo-crawlers` idea). Until then this
can't be executed. GATE-5 #11/#12 (v0.3.2) already reason about rank×AIO-cite manually;
this would automate the retrofit side.

---

## G3 — Keeply brand as a knowledge-graph entity  ·  🔄 REFRAMED 2026-05-22

The 2026-05-22 Playwright recon (**[geo-recon-report.md](geo-recon-report.md)**) changed this
item. The keeply.work apex **already** emits a rich `@graph` (Organization + WebSite +
SoftwareApplication + Person + HowTo + FAQPage, real price $599) via
[apps/website/_dev/inject-schema.js](../../../website/_dev/inject-schema.js). So G3 is no longer
"build + deploy schema" — that's done. The staged `keeply-organization.STAGED.json` is
**superseded** (kept as shape reference only).

What's actually left:
1. ✅ **`Organization.founder`** was absent → **fixed in source** (inject-schema.js). Needs
   build + push (apps/website always-create-spec rule).
2. ⬜ **`foundingDate`** — add a real value (don't fabricate).
3. ⬜ **Brand disambiguation is the real problem**, not schema: "Keeply" is held by
   keeply.com / getkeeply.io / keeply.se / an iOS photo app / a UK company; keeply.work is
   invisible for the category query and the AI Overview misattributes to the iOS app. Lever =
   brand SEO + own profiles (LinkedIn company / Crunchbase) **before** Wikidata.
   - ✅ **2026-05-23: LinkedIn Company Page created** → https://www.linkedin.com/company/keeply-work/
     (English tagline "Your files have stories. Keeply remembers them all.", official concept-b
     logo from spec 063). Added to `Organization.sameAs` in inject-schema.js. **Page hygiene TODO**:
     add English About + post 2–3 updates (empty pages hurt entity trust); banner = full-lockup.
   - ⬜ Crunchbase: name free but skipped (thin for a bootstrapped solo SaaS).
4. ⬜ **Wikidata** stays deferred (crowded name + notability risk for a solo SaaS).

---

## G4 — schema decision tree + validation  ·  ✅ DONE 2026-05-22

Wrote **`~/.claude/bwf/library/schema-decision.md`** (decision tree grounded in what
`apps/blog/layouts/_partials/head.html` actually emits — BlogPosting/Breadcrumb/@graph
auto, FAQPage/HowTo per-article-optional — + a Touch-4 validation step + the V8 `$N`
build-trap warning). Pointer added in `t1.pillar.md` above the `faq_schema:` rule.

---

## G5 — citability scorer at measure-time  ·  🆕 from zubair repo

[geo-ref/citability_scorer.py](geo-ref/citability_scorer.py) (copy below if vendored)
scores a passage 0-100 on 5 dims (answer-block quality / self-containment / structural
readability / statistical density / uniqueness). Maps directly to **P1.22 / P1.23 / P1.24**
and the G1 134-167-word sweet spot.

**Do:** wire as an optional **Touch 5 / pre-ship** report (never a gate) over
`final.{locale}.md` H2 chunks, flagging low-citability answer blocks. Needs
`pip install requests beautifulsoup4`. Effort: S–M. No blocker.
**Why new:** the only genuinely useful, runnable harvest from `zubair-trabzada/geo-seo-claude`
(that repo has **no hooks** — see eval). Decide vendor-vs-reference before wiring.

---

## G6 — AI-crawler visibility KPI in seo-weekly  ·  🚧 IN PROGRESS 2026-05-24

Full spec: **[../proposals/geo-ai-crawler-analytics-spec.md](../proposals/geo-ai-crawler-analytics-spec.md)**.
Origin: the one genuinely useful idea from the `yaojingang/GEOFlow` eval — "AI crawler
identification and trending" — rebuilt for our static + Cloudflare stack (we reject GEOFlow's
content-farm core). Directly supplies the **leading signal G2 lacks**: AI engines fetching our
pages because a live user query cited them.

**Source:** Cloudflare AI Crawl Control GraphQL (`httpRequestsAdaptiveGroups`, NOT Enterprise
Bot Management). Free plan OK via `userAgent` dimension; `botDetectionIds` filter is paid → we
classify by UA string instead. **Key design:** segment **user/search-fetch** UAs (`ChatGPT-User`,
`PerplexityBot`, `Perplexity-User`, `Claude-User`, `OAI-SearchBot` = leading GEO signal) vs
**training** UAs (`GPTBot`, `ClaudeBot`, `CCBot`, `Google-Extended` = lagging). Headline KPI =
user-fetch WoW trend per host + top cited paths.

**Phase 0 ✅ DONE 2026-05-24:** token built (read-only Analytics:Read) + stored as
`CF_ANALYTICS_TOKEN`/`CF_ZONE_ID` GH secrets + local `.env`. Zone = `9bff…` (shared, both hosts).
Free-plan limits found: query span ≤ 1d + retention ~8d → **daily-sliced weekly job (7 queries),
no daily cron, no WoW from CF (v1 absolute; v1.1 self-stored snapshot)**. AI signal is live now:
trailing-7d user-fetch = blog 202 / main 249 (OAI-SearchBot + ChatGPT-User + PerplexityBot).

**Phase 1 ✅ code built + locally verified, ⏳ pending push:** `fetch-ai-crawlers.js` +
`seo-weekly.yml` step + `build-report.js` 🤖 section all done; end-to-end render confirmed.

---

### Pick-up note for next session

Done: **G1, G4**. Prepped: **G3** (needs your Wikidata + website deploy). Open & cheap:
**G5** (citability scorer, no blocker). In progress: **G6** (AI-crawler KPI — Phase 0 probe;
needs `CF_ANALYTICS_TOKEN`). Still blocked: **G2** (needs AIO detection first).
