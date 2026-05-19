# Handoff: Main site `keeply.work` CLS 0.27-0.38 → < 0.05

> Created 2026-05-13 during cross-repo CLS investigation. This spec
> belongs in **`keeply-website`** repo, not here. CLAUDE.md P0 cross-
> repo boundary forbids writing to that repo from keeply-blog —
> handoff via this doc, same pattern as `handoff-keeply-website-schema-2026-05-13.md`.

## Severity

🔴 **Google Web Vitals red zone on every measured page.** Real, ongoing
SEO penalty.

| Page | CLS (Lighthouse mobile, slow 4G) | Web Vitals tier |
|---|---|---|
| `/` | 0.275 | 🔴 Poor (red) |
| `/compare/dropbox.html` | 0.286 | 🔴 |
| `/compare/email-usb.html` | 0.370 | 🔴 |
| `/compare/filename-chaos.html` | **0.384** ★ worst | 🔴 |
| `/compare/google-drive.html` | 0.286 | 🔴 |
| `/compare/snowtrack.html` | 0.155 | 🟡 Needs improvement |
| `/compare/time-machine.html` | 0.376 | 🔴 |

Web Vitals thresholds: 🟢 ≤ 0.10  ·  🟡 ≤ 0.25  ·  🔴 > 0.25

Source: `keeply-blog/.github/workflows/seo-audit.yml` → matrix `main`
leg → artifact `seo-audit-report-main` (run #25788374473, 2026-05-13).

## Root cause — single line summary

**`MPLUSRounded1c-Regular-v2.woff2` 字體 swap 觸發 hero `<section>` 重排，每頁 ~0.27 + 額外 ~0.11 = 0.38。**

Lighthouse details from `layout-shifts` audit:

```text
Item 0: score 0.271  (selector: body.bg-white > section.relative)
  subItem cause: "Web font loaded"
  extra.url:    https://keeply.work/fonts/MPLUSRounded1c-Regular-v2.woff2

Item 1: score 0.113  (same selector)
  cause: same web-font-loaded chain
```

100% of `/compare/*.html` pages and `/` show the same `cause: "Web font loaded"`.

## Why blog.keeply.work doesn't have this problem

Same font, same `font-display: swap`, same Tailwind setup. Difference:

```html
<!-- blog.keeply.work head — does this -->
<link rel="preload" href="/fonts/MPLUSRounded1c-Regular-v2.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/MPLUSRounded1c-Bold-v2.woff2" as="font" type="font/woff2" crossorigin />

<!-- keeply.work head — has NONE of this -->
```

Without `<link rel=preload>`, the browser discovers the font URL only after parsing CSS. By then layout has rendered with fallback font. Font arrives → swap → text remetrics → adjacent elements shift.

Blog's CLS on the same Lighthouse audit = **0.000** (root) and 0.041 (article pages). All 🟢 Good zone.

## Fix (estimated 10 minutes work in `keeply-website`)

Add to the `<head>` of every page, before stylesheets:

```html
<link rel="preload" href="/fonts/MPLUSRounded1c-Regular-v2.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/MPLUSRounded1c-Bold-v2.woff2"    as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/MPLUSRounded1c-Medium-v2.woff2"  as="font" type="font/woff2" crossorigin />
```

### Notes / gotchas

- **`crossorigin` is required** even for same-origin font preload (per spec; without it the preload doesn't satisfy the `<link>` font-fetch and the browser refetches).
- **Place ABOVE** the stylesheet `<link>` so the font fetch starts in parallel with CSS download.
- Drop the Medium weight preload if it's not used above the fold (currently unclear from spec, audit only fingered Regular). Keeping it conservative is fine — one extra preload is ~50KB.
- **Watch hero image bandwidth competition.** Blog comment notes: "After Round B-1.3 inlined cover SVG, there's no longer image-bandwidth competition; Bold preload restored". If main site has a heavy hero image, preloading 3 fonts might delay LCP. Suggest:
  1. First deploy with just Regular preload
  2. Verify CLS drops + LCP doesn't regress
  3. Add Bold + Medium one at a time, re-verify

### What NOT to do (we tried these mentally)

| Alternative | Why we don't recommend |
|---|---|
| `font-display: optional` (no swap, fallback if not cached) | First-time visitors never see brand font — usability regression |
| `font-display: block` | Worse — invisible text up to 3s while font loads (FOIT) |
| `@font-face` `size-adjust` / `ascent-override` / `descent-override` | Effective but tunable — needs careful metric matching; preload is simpler + sufficient given evidence |
| Drop the web font entirely | Loses brand typography; not the right trade-off for 0.05-0.10 CLS gain over preload |
| Self-host vs CDN | Already self-hosted on `keeply.work/fonts/...` — not the bottleneck |

## Verification

After deploy:

```bash
# Trigger the monthly audit workflow against keeply.work (matrix already covers it)
gh workflow run "SEO Site Audit (crawl + Lighthouse)" --repo boy1690/keeply-blog --ref main -f max_routes=30

# Wait ~3 min, then check the auto-opened Issue
gh issue list --label seo-audit --repo boy1690/keeply-blog --limit 2
```

Expected after fix:
- `/` CLS: 0.275 → ≤ 0.05
- `/compare/filename-chaos.html` CLS: 0.384 → ≤ 0.10
- Lighthouse Performance score: 81 → ≥ 90
- Lighthouse SEO score: stays 92 (separate concern, see schema handoff)

## CrUX field-data follow-up

Real-user CLS is the metric Google actually uses for ranking signals.
Our CrUX fetcher (`_dev/seo/fetch-crux.js`) currently returns `no-crux-data`
for both origins — insufficient Chrome traffic for Google to publish a
dataset. After this fix ships AND traffic crosses Google's threshold
(weeks-months for a new site), the weekly report's "Core Web Vitals —
real user (CrUX)" section will start showing field-data CLS. That's
the real proof the fix landed.

## Status

- [ ] Spec reviewed by keeply-website maintainer
- [ ] Font preload tags added to keeply-website head template (all locales)
- [ ] Deployed
- [ ] Verified via `gh workflow run "SEO Site Audit"` — CLS p75 < 0.10 across all `/compare/*` + `/`
- [ ] (Optional, weeks later) CrUX dashboard shows CLS in 🟢 zone

## Cross-reference

- Root-cause investigation reproduced in `keeply-blog` session 2026-05-13 — full trace:
  - `gh run download 25788374473 --repo boy1690/keeply-blog --name seo-audit-report-main`
  - `reports/compare/filename-chaos/lighthouse.html` — `audits.layout-shifts.details.items[].subItems.items[].cause`
- Sibling handoff: `_dev/seo/handoff-keeply-website-schema-2026-05-13.md` (main-site Schema.org JSON-LD missing)
