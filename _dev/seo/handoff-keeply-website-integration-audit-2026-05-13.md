# Handoff: Main site `keeply.work` SEO integration audit

> Created 2026-05-13. Read-only audit of `D:\tools\doing\keeply-website`
> looking for parity gaps vs. blog.keeply.work's 2026-level SEO stack.
> CLAUDE.md P0 forbids writing to keeply-website from this repo —
> handoff is a punch list for the keeply-website team.

## TL;DR

| Area | Status |
|---|---|
| Schema.org JSON-LD | ✅ Better than blog (SoftwareApplication + Offer + FAQPage; my earlier handoff was incorrect) |
| robots.txt + AI bot policy | ✅ Matches blog |
| llms.txt | ✅ Present + curated |
| OG + Twitter cards | ✅ Full coverage |
| hreflang × 19 locales | ✅ Matches blog |
| Site verification (GSC / BWT / Yandex / Bing) | ✅ Yandex file present, others implicit via sitemap |
| Sitemap | ✅ 267 KB, last mod 2026-05-13 |
| IndexNow on deploy | ✅ Configured (manual-trigger) |
| Compare pages | ✅ Per-page schema + breadcrumbs |
| **Font preload** | ❌ **CRITICAL** — confirms blog handoff `handoff-keeply-website-cls-2026-05-13.md` |
| **Header-level security** | ⚠️ HSTS / X-Frame-Options not deployed (meta CSP only; GitHub Pages can't set headers) |
| **Per-locale install page** | ❌ Missing; users land on blog article instead of main site |
| **Compare page localization** | ⚠️ `/compare/*.html` is EN-only; non-EN markets see EN content |

---

## 1. 🔴 Critical — Font preload (overlap with existing CLS handoff)

**Already covered in** `_dev/seo/handoff-keeply-website-cls-2026-05-13.md`.
Audit confirms zero `<link rel=preload as=font crossorigin>` tags
across index.html, buy.html, compare/index.html. Same fix applies.

Estimated time: 10 min.

---

## 2. 🟡 Header-level security headers (GitHub Pages limitation)

### Finding

`keeply-website` deploys via **GitHub Pages**, which can't set custom HTTP
response headers. Only `<meta http-equiv="Content-Security-Policy">` is
in effect; `frame-ancestors`, HSTS, Permissions-Policy, X-Frame-Options
require real headers.

A `cloudflare/_headers` file IS configured in repo (per spec 022) but
"GitHub Pages does not [support _headers]; use Worker or Transform
Rules instead" — comment in source.

### Cost of inaction

- Cannot enforce HSTS preload (blog handoff `handoff-hsts-preload-2026-05-13.md`
  applies once headers move to Cloudflare)
- `frame-ancestors` can't block embedding via meta — `<iframe>` of
  keeply.work pages is allowed by anyone for now
- Permissions-Policy can't restrict device API surface

### Two fix paths

**Option A — Add Cloudflare Transform Rule on `keeply.work` zone**

The blog already has Transform Rule "Keeply Security Headers" on the
shared Cloudflare zone (memory `reference_cloudflare_csp_rule.md`).
The rule currently scopes to `blog.keeply.work` (per memory
`reference_cloudflare_cross_zone_redirect_gotcha.md`'s lesson — zone
rules must explicitly scope `http.host`).

Add a second Transform Rule for `keeply.work` apex:

```
Expression: (http.host eq "keeply.work")
Action: Modify Response Header
  Strict-Transport-Security: max-age=600; includeSubDomains
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: <copy from blog's rule, swap origins>
```

15-30 min in the Cloudflare dashboard.

**Option B — Migrate to Cloudflare Pages**

`cloudflare/_headers` is already in the repo. Migrating from GH Pages
to CF Pages activates the header file natively. Bigger change (DNS
re-pointing, CI workflow update, deploy verification). 1-2 hours.

Recommendation: **Option A** for speed; revisit B if Workers/edge logic
is needed later.

---

## 3. 🔴 Per-locale install page missing

### Finding

Main site has `/buy.html` (license purchase) but **no per-locale install
page** like `/en/install.html` / `/ja/install.html` / etc. The blog has
`https://blog.keeply.work/en/post/install-keeply-windows-mac/` shipped
in 6 locales, but that's an article, not a tool surface.

SoftwareApplication schema's `downloadUrl` on the main site points to
`https://github.com/boy1690/keeply-releases/releases/latest` — external,
no per-OS / per-locale routing, no install guide context.

### Cost of inaction

Users searching "Keeply 安裝", "Keeply 下載", "Keeply Mac install" etc.
land on the **blog article** (informational), not the main site
(commercial / authority).

- Blog article has commercial CTA but no native download experience
- Main site's `keeply.work` apex domain has stronger SEO authority for
  brand+intent searches but isn't using it
- Confused user journey: "Where do I actually get it? GitHub releases?
  Blog? Buy page?"

### Fix

Add `/<locale>/install.html` × 6 core locales (en, zh-tw, zh-cn, ja,
ko, it). Each:

- Detect OS via JS, surface relevant `.dmg` / `.msi` / installer link
- Render same content as blog's install article (Windows SmartScreen
  workaround, macOS Gatekeeper consent, etc.) — link blog article as
  "deeper reading"
- Schema.org `HowTo` with `HowToStep` per locale
- Canonical to itself, hreflang to other locales
- Link from main site footer + nav so it becomes part of the standard
  user path

Estimated: half day for the 6 core locale pages.

---

## 4. 🟡 Compare pages locale-gap

### Finding

`/compare/dropbox.html`, `/compare/google-drive.html`, etc. (7 pages)
are **EN-only**. Non-EN markets see English content with `lang="en"`
on the HTML tag — no hreflang alternates for compare pages.

### Cost of inaction

- TW / JP / KR / IT markets searching "Keeply vs Dropbox" / "Keeply vs
  Google Drive" don't get localized landing
- Schema's `ItemList` + breadcrumbs are EN-only

### Fix

Two options:

**A. Translate all 7 × 6 locales** = 42 pages total. Highest authority
gain but content workload (each compare page is ~1500 words).

**B. Translate only the most-trafficked locales** by checking
GSC top-impressions queries for `/compare/*` paths:

```bash
# After this lands, query the weekly seo-weekly report for
# /compare/ path impressions to prioritize:
gh run download $(gh run list --workflow=seo-weekly.yml --limit=1 --json databaseId -q '.[0].databaseId') --name seo-weekly-report -D /tmp/sw
jq '.sites.main.current.pages[] | select(.keys[0] | contains("/compare/"))' /tmp/sw/gsc.json
```

Top 2-3 locales by GSC impressions for compare → translate those first.

**C. Don't translate** — accept EN-only for compare pages, link to
locale-specific cluster articles from blog instead. Cheaper but loses
the SEO authority of the main domain.

Recommendation: **B** after waiting 1-2 GSC reporting cycles for data.

---

## 5. ✅ Resolved — Schema.org JSON-LD

My earlier handoff `handoff-keeply-website-schema-2026-05-13.md` was
**incorrect**. The grep probe used to check
(`grep '"@type":"[A-Za-z]+"'`) missed schema because the production
HTML uses pretty-printed JSON with a space after `:`. The schema HAS
been present all along — verified 2026-05-13 with corrected probe:

```bash
$ curl -s --compressed https://keeply.work/ | grep -A 30 'application/ld+json' | head
"@type":"Organization"
"@type":"WebSite"
"@type":"SoftwareApplication" (with price 599 USD, downloadUrl, OS)
"@type":"FAQPage" (8 Q&As)
```

That handoff doc has been superseded by this audit; recommend marking
it as obsolete in any tracker.

---

## Cross-references

- `_dev/seo/handoff-keeply-website-schema-2026-05-13.md` — supersedes (resolved)
- `_dev/seo/handoff-keeply-website-cls-2026-05-13.md` — same font preload finding (still valid)
- `_dev/seo/handoff-hsts-preload-2026-05-13.md` — applies once main-site headers move to Cloudflare
- Memory `reference_cloudflare_csp_rule.md` — where blog headers live
- Memory `reference_cloudflare_cross_zone_redirect_gotcha.md` — why new rules must scope `http.host`

## Status

- [ ] Audit reviewed by keeply-website maintainer
- [ ] Font preload fix landed (item 1)
- [ ] HSTS / security headers migrated (item 2 — Option A or B)
- [ ] Per-locale install pages added (item 3)
- [ ] Compare-page locale prioritization decided (item 4)
- [ ] Old schema handoff marked obsolete (item 5)
