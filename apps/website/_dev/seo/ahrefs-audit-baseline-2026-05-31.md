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

## Resolved follow-ups
- **de/es home 301→/en/ — investigated 2026-06-02: INTENTIONAL, not a bug.** The de/es/fr/pl/tr (and pt-br) locale homes are thin `noindex` pages (1-2 posts each); 301→/en/ is a sensible consolidation of thin noindex homes. "core locale" = has hand-written *articles* (real indexable pages) ≠ home should be 200. RC-10 (hreflang skip on `.IsHome`) is the correct fix; no CF change. See memory `reference_blog_pilot_locale_homes_noindex_redirect_intentional`.
- RC-4 cdn-cgi residual: build:clean-email scans root + 21 locale dirs; `npm run audit:seo` now guards 0-mailto every build.

## Prevention added (spec 115 follow-up)
- `apps/website` `npm run audit:seo` (wired into `npm run build`) — fails the build on .html-in-sitemap / mailto / hreflang-asymmetry / tool-page schema+outlink regressions.
- `apps/blog` `_dev/seo/audit-seo.js` (wired into deploy-blog.yml) — fails the deploy if a home hreflangs at a redirecting locale (RC-10).

## Post-push checklist
1. `npm run seo:purge` (website) + confirm CF deploy headSha matches the pushed commit (don't trust "latest run green").
2. blog: GitHub Actions Hugo deploy (head.html/alias.html change) → verify a home `curl -s | grep hreflang` excludes de/es/fr/pl/tr.
3. Re-run Ahrefs crawl → diff this baseline.
