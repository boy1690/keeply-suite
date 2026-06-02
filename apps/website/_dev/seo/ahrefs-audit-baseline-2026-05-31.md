# Ahrefs Site Audit baseline — crawl 2026-05-31T11:56:18Z

> Project 9870945 (keeply.work). Diff vs 2026-05-25. Builds on RC-1~5 (baseline 2026-05-25, spec 114).
> Fixes shipped in spec 115 — commits `55608ffe` (website) + `a030119b` (blog). **Not yet pushed at time of writing.**

## Root causes this crawl (4 real + 1 known-noise + buckets)

| RC | Ahrefs issue | affected | bucket | fix | expected re-crawl |
|----|------|------|------|------|------|
| RC-6 | 3XX redirect in sitemap | 2 (New) | C bug | build.js tool sitemap → clean URL | → 0 |
| RC-7 | Structured data schema.org validation error | 2 (New) | C bug | tool JSON-LD isPartOf→WebSite + strip .html | → 0 |
| RC-8 | Page has no outgoing links | 2 (New) | C bug | tool pages static outgoing links | → 0 |
| RC-9 | Missing reciprocal hreflang (no return-tag) | 170 | C bug | root-page hreflang rebuilt to 21+x-default→page-root; per-locale x-default page-specific; static buy/refund/activate rebuilt | → ~0 |
| RC-9 | Page referenced for >1 language in hreflang | 3 | C bug | (same — root `/` no longer lists every lang →self) | → 0 |
| RC-4 | Page has links to broken page | 115 | A noise→fixed | build:clean-email reroutes mailto→/contact (no more CF /cdn-cgi/ 404) | → ~0 |
| RC-10 | Hreflang to redirect or broken page | 7 | C bug (blog) | head.html/alias.html skip de/es/fr/pl/tr homes (301) on .IsHome | → 0 |

## Bucket B — stale, self-cleared (no fix; verified 200 live 2026-06-02)
- `404 page` / `4XX page` ×4: `keeply.work/zh-TW/privacy` (now 200), 3 blog posts `install-keeply-windows-mac` + `excel-unsaved-recovery`×2 (now 200). Crawl-window staleness. → clears at re-crawl.

## Bucket A — by-design / low-priority (no action)
- Warnings: meta description too long/short (138/79), title too long/short (83/27), Multiple H1 (148, hero+section by design), low word count (6).
- Notices: IndexNow queue (291), indexable-not-in-sitemap (226, mostly compare/legal/tool variants), title/desc "changed" (diff noise).

## Unresolved / flagged for follow-up
- **de/es core-locale home 301→/en/**: de/es are documented core locales (hand-written articles) yet their homes redirect — likely a STALE rule from the auto-translate-removal era. RC-10 defensively stops hreflang pointing at them, but the proper fix is to un-redirect de/es homes (CF dashboard Redirect Rule, not in repo) so they serve 200, then re-add their hreflang. Needs CF-dashboard Playwright + product intent. fr/pl/tr pilot homes may legitimately redirect.
- RC-4 cdn-cgi residual: if any mailto exists outside the build:clean-email scan scope (it scans root + 21 locale dirs), re-crawl will surface it.

## Post-push checklist
1. `npm run seo:purge` (website) + confirm CF deploy headSha matches the pushed commit (don't trust "latest run green").
2. blog: GitHub Actions Hugo deploy (head.html/alias.html change) → verify a home `curl -s | grep hreflang` excludes de/es/fr/pl/tr.
3. Re-run Ahrefs crawl → diff this baseline.
