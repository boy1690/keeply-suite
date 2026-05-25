# Ahrefs Site Audit baseline — 2026-05-25

> Project: Keeply (keeply.work), project_id **9870945**. Source crawl: **2026-05-24T12:39:00Z** (37 issues).
> All fixes below shipped + LIVE-verified 2026-05-25. Re-crawl to confirm the affected counts drop.
> Triage method + reusable catalog: skill `ahrefs-site-audit`.

## Root-cause clusters (37 flat issues → 5 root causes + 1 non-issue)

| RC | Ahrefs issue(s) (crawl 05-24) | affected | root cause | fix (commit) | live status 05-25 |
|----|------|---------|------------|--------------|-------------------|
| RC-1 | 404 page / 4XX page; Page has links to broken page | 137 / 137; 203+128 | blog posts link `/{loc}/tags/{tag}/` but Hugo `disableKinds=["taxonomy","term"]` → 404 | `single.html` tag chips → non-link `<span>` (`671bcb20`) | ✅ 0 `/tags/` anchors live |
| RC-2 | Page has broken JavaScript | 7 pages / 42 links | `build-fingerprint.js` prefix regex `(?:\.\.\/\|\/)?` (zero-or-ONE) matched `../` but not `../../` → `{loc}/compare/*` shipped UNHASHED JS (404). Regex fix `(?:\.\.\/)*` was sitting **uncommitted** in the tree. | commit the `*` regex + drop untracked spec-052 ride-along (`c978d186`+`4346ad90`) | ✅ zh-TW/compare JS hashed, 200 |
| RC-3 | Canonical points to redirect; 3XX in sitemap; Page has links to redirect; Indexable not in sitemap; 3XX redirect | 183;181;245;221;218 | CF Pages 308-redirects `.html`→clean; build emitted `.html` in canonical/sitemap/hreflang/og + internal links | P1a generators (`d82f36df`) + P1b static-page head normalizer `build:clean-static` (`e1d5c1f6`) + P2 `components.js` nav/footer + body-link normalizer `build:clean-links` (`b657d12b`) | ✅ sitemap 0 `.html`; canonical/og/hreflang/body/nav clean; links 200 |
| RC-5 | Missing reciprocal hreflang (no return-tag) | 21 | 19 older static buy/refund/activate copies omit vi+th (predate spec-051 vi/th launch); vi/th copies list all 21 → asymmetry | inject vi/th alternates in `build:clean-static` (`843c3a2b`) | ✅ en/buy 20→22, reciprocal with vi/buy |
| — | Page referenced for >1 language in hreflang | 1 | unknown single page; likely a mixed `.html`/clean form now unified by RC-3 | (none — recheck after re-crawl) | pending re-crawl |
| — | (spec-052) /tools/can-i-recover-my-file 404 | — | tool built-but-not-deployed (parked); untracked + `generateToolsSitemapEntries` uncommitted WIP | none — 0 inlinks + not in live sitemap = non-issue | n/a |

## Expected-by-design / noise (do NOT chase)
- Noindex page 58 / Noindex follow 58 → `/activate` etc. intentional (`noindex,follow`).
- `*/cdn-cgi/l/email-protection` 404 → Cloudflare Email Obfuscation false-positive.
- Pages to submit to IndexNow 245; Multiple H1; Title/Meta length → low-priority / multiply by locale count.

## Build pipeline added this round (keeps URLs clean going forward)
`npm run build` order: …pages → comparisons → **build:clean-static** (`_dev/normalize-static-canonical.js`: static-page head .html-strip + vi/th hreflang) → **build:clean-links** (`_dev/normalize-body-links.js`: body `<a href>` .html→clean, index→`./`) → schema → fingerprint → sri → font-preload.

## Notes for next diff
- Re-run Ahrefs crawl; the 5 RCs' affected counts should drop to ~0.
- Project crawl seed is `http://keeply.work/` — consider switching to https to cut http→https redirect noise.
- If "referenced for >1 language" =1 persists, pull its "Copy for AI" for the exact URL.
