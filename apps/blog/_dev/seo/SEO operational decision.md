# SEO Operational Decisions — keeply-blog (Hugo Multilingual), 2026-05-18

## TL;DR
- **Q2: Don't run Removal Tool** — Google's own docs explicitly say it does not clean the Page Indexing report, and the 301 will denoise SERPs naturally; running it batch-wise risks hiding the canonical /en/ target via URL-pattern matching.
- **Q3: Cut pt/es (Option B)** — auto-translated content remains a documented site-quality risk (Mueller still flags low-quality MT) and 1 click/90d is below noise; a 301 to /en/ preserves any residual link equity at zero ongoing build cost.
- **Q4: Skip the ~187 direct redirects** — a 2-hop chain is trivially within Mueller's documented 5-hop tolerance, 301s pass full PageRank since Illyes' July 2016 confirmation, and the maintenance burden vastly outweighs the marginal SEO gain.

---

## Q2 — GSC Removal Tool

- **Action: 不跑 (Skip)**
- **Confidence: 85%**
- **Reason:** The Removal Tool is a 6-month SERP-visibility filter only — Google's docs explicitly tell site owners not to use it for "cruft cleanup," and the 301 will consolidate signals naturally on next recrawl.

### Evidence Notes (Q2)

- **Google Search Console Help (Removals report, support.google.com/webmasters/answer/9689846):** "Blocking a URL does not prevent Google from crawling your page, only from showing it in Search results." The Help page explicitly lists "To clean up cruft" as a reason **NOT** to use the tool: "Google's crawlers will see this as we recrawl your URLs, and those pages will naturally drop out of our search results. There's no need to request an urgent update." This directly contradicts the user's stated GSC-denoising goal.
- **John Mueller (Twitter/X, Aug 8, 2018, reaffirmed in 2024 coverage):** "the removal tool just hides the URLs in search, they still get crawled (& indexed, if allowed) normally" (via Search Engine Roundtable #26183). Translation: the 301 keeps being processed during the 6-month hide window — there is no signal-consolidation conflict in either direction.
- **Mueller on LinkedIn, 2024 (Search Engine Roundtable #37676):** Direct quote on a 301'd URL — "If you want to remove it, I'd use the removal tools. If you want to nudge canonicalization one way or the other, I'd work to get more of the other canonicalization elements lined up better." → SERP suppression and canonical consolidation are independent operations; one does not interfere with the other.
- **The decisive caveat — URL-pattern matching:** GSC Help confirms the tool matches across http/https, www/non-www, and prefix patterns. Because Google places 301 source + target into a shared canonical cluster (Mueller, Search Engine Roundtable #30425), submitting `/de/post/X/` at batch risks the consolidated `/en/post/X/` SERP listing being affected. Mueller repeatedly warned HTTPS-migration site owners against using the tool to wipe HTTP URLs for this exact reason (Search Engine Roundtable #18500).
- **SEO Gets blog ("Clean Up Page Indexing Report in Google Search Console"):** "the Temporary Removals tool... it'll still be in the Pages Indexing Report and eventually it'll be back in the search results... This report serves as a historical record of all pages known to Google."
- **Operational verdict:** The two stated goals (SERP cleanup + GSC denoising) are EITHER auto-handled by the 301 (SERP) OR not addressable by this tool (Page Indexing report). Running it on 133 URLs adds zero benefit and non-zero downside risk.

---

## Q3 — pt/es Residual Locale Strategy

- **Action: B (Cut + 301 to /en/)**
- **Confidence: 75%**
- **Reason:** Auto-translated, near-zero-traffic content carries documented quality risk and crawl-budget drag; consolidating to /en/ via 301 preserves any backlink equity at zero ongoing cost.

### Evidence Notes (Q3)

- **Google's March 2024 spam-policy update** removed the long-standing language recommending site owners block auto-translated pages via robots.txt (covered by Search Engine Roundtable's "Google Softens Its Stance" #39579, June 2025), and Reddit's bulk AI-translation strategy was described as "sanctioned" during their earnings call. So auto-translation is no longer per-se forbidden.
- **John Mueller, Google SEO Office Hours (per Wolfestone Group summary):** "If the auto-translation is of low quality, [it may affect a website's ranking]. You should ensure that a human native in those languages reviews (and perhaps fixes) the translations to ensure that the content is actually helpful for users." → Unedited MT remains a quality risk. The user explicitly states this content was machine-translated without human review.
- **Google's official Helpful Content FAQ (developers.google.com/search/help/helpful-content-faq):** "Having some good site-wide signals does not mean that all content from a site will always rank highly, just as having some poor site-wide signals does not mean all the content from a site will rank poorly." → Google's own language is more nuanced than third-party "drags down whole site" framing, but the site-level dimension exists. For a 180-article blog, ~60 unedited MT pages = roughly one-third of crawlable content as a poor-quality signal cluster.
- **Glenn Gabe (GSQI), "Managing quality indexation":** "Focus on having your best content indexed, since every page will be evaluated from a quality standpoint... If you can boost the content, then do that. If you can't improve it... 404 it." — textbook removal case for this scenario.
- **Ahrefs ("Google Is Stealing Your International Search Traffic With Automated Translations," June 2025):** Google now auto-translates English content via Google-owned subdomains in markets where AI Overviews lack native content (the "200 countries / 40+ languages" figure refers to AI Overviews' March 2025 Core-update rollout). The article quotes Patrick Stox on hreflang implications. Practical consequence: marginal traffic upside of poor /pt/ or /es/ content is being eaten by Google's own translation proxy anyway.
- **CF 301 preserves the click:** Illyes' July 26, 2016 tweet ("30x redirects don't lose PageRank anymore") and Mueller's repeated reaffirmations support full PageRank flow for 1:1 same-slug redirects like `/pt/post/X/` → `/en/post/X/`.
- **Why not 95% confidence:** Option C (human translation) is defensible IF pt/es markets are strategic for the user, but 1 click/90d is below organic-discovery-noise — there is no market demand signal to invest against. Option A (status quo) leaves crawlable MT pages perpetuating the quality drag without any traffic upside.

---

## Q4 — CF Redirect Chain Depth (Subpath × Tag Deletion)

- **Action: 不做 (Skip — accept the 2-hop chain)**
- **Confidence: 90%**
- **Reason:** Mueller's documented 5-hop tolerance covers 2 hops comfortably, 301s pass full PageRank, and ~187 extra CF rules deliver near-zero SEO gain.

### Evidence Notes (Q4)

- **John Mueller (Reddit thread, reported by Search Engine Journal #344664):** "It doesn't matter. The only thing I'd watch out for is that you have less than 5 hops for URLs that are frequently crawled. With multiple hops, the main effect is that it's a bit slower for users. Search engines just follow the redirect chain (for Google: up to 5 hops in the chain per crawl attempt)." → 2 hops is trivially safe. (Source clarification: this was a Reddit reply, not Google Webmaster Office Hours.)
- **Gary Illyes (@methode, Twitter, July 26, 2016, 5:59 AM):** "30x redirects don't lose PageRank anymore." Mueller (2019) reaffirmed: "301s don't lose value." For 1:1 canonical replacements (which tag→pillar 301s qualify as when the pillar covers the tag topic), full link equity flows.
- **Mueller (Google Webmaster Hangout on redirect chains, via SEJ #275503):** "We can forward PageRank through 301 and 302 redirects. Essentially what happens there is we use these redirects to pick a canonical." → No per-hop PageRank dilution; the destination canonical receives the consolidated signal regardless of chain length within the 5-hop limit.
- **Cloudflare Changelog, February 12, 2025 (developers.cloudflare.com/changelog/post/2025-02-12-rules-upgraded-limits/):** "Free: 20 → 10,000 URL redirects across lists." Same page warns: "Limits are updated gradually. Some customers may still see previous limits until the rollout is fully completed in the first half of 2025." → ~187 additional rules is ~1.87% of the upgraded free quota, but verify your account dashboard shows the new limit (multiple 2025-2026 community threads document accounts still capped at 20).
- **CF mechanics:** Bulk Redirects evaluate sequentially; the subpath rule (/de/* → /en/*) fires first, returning a 301, after which the client follows up with a fresh request matching the second rule (/en/tags/X/ → /en/post/Y/). Cloudflare does NOT auto-merge chained rules — confirmed in the Bulk Redirects FAQ and rule-priority docs.
- **User-experience argument is weak here:** Each CF-edge 301 adds roughly 60–100ms (CF edge is geo-distributed, fast). For ~17 affected pillar tags × 11 cut locales = ~187 URLs that historically had effectively zero direct traffic (they were tag listings nobody bookmarked), perceptible latency is moot.
- **Counter-consideration:** If a specific `/[locale]/tags/X/` URL surfaces a high-value backlink in Ahrefs/Search Console, create a one-off direct redirect just for that URL — but a blanket 187-rule build-out is over-engineering.

---

## Recommendations (Staged, Concrete)

1. **Today / this week:**
   - Do NOT submit any URLs to GSC Removal Tool.
   - In Cloudflare, verify both rule layers (subpath /de/* → /en/* AND the 17 tag-to-pillar rules) are live and returning HTTP 301 (not 302). Test with `curl -I` on 2–3 sample chained URLs to confirm both hops resolve.
   - Confirm your CF account has the upgraded Bulk Redirects limit (Account → Lists → quota indicator); if still capped at 20, open a support ticket citing the Feb 2025 changelog.
   - Log the deployment date so you can mark a Day-0 baseline on GSC's "Excluded by 'noindex' tag" count.

2. **Within 7 days (Q3 execution):**
   - Disable Hugo build for `pt` and `es` locales.
   - Add CF Bulk Redirect entries: `/pt/post/* → /en/post/*` and `/es/post/* → /en/post/*` (same pattern used for the 11 already-cut locales).
   - Remove `pt` and `es` hreflang annotations from `/en/` page heads.
   - Submit updated sitemap to GSC; let it reflect only the 6 core locales.

3. **30 days post-deployment:**
   - Check GSC Page Indexing report. Expected behavior: "Excluded by 'noindex' tag" bucket begins shrinking as Googlebot recrawls and processes the 301s. Bucket will not zero out — those URLs persist as historical records (SEO Gets), but the active count should decline.
   - Check GSC Crawl Stats for a transient spike in 301 responses — this confirms Googlebot is processing the migration.

4. **90 days:**
   - Re-evaluate. Benchmark: if the "Excluded by 'noindex' tag" active-URL count has not dropped by ≥60% by Day 90, investigate (a) lingering internal links to dead locale URLs in older /en/ posts, or (b) external backlinks still pointing at /de/, /fr/, etc.
   - Spot-check 5–10 random /en/post/X/ canonical URLs via GSC URL Inspection — confirm Google-selected canonical is the /en/ version.

### Benchmarks That Would Change These Recommendations

- **Reverse Q2 → run Removal Tool only if:** A specific old-locale URL surfaces as a damaging SERP listing for a brand-name query (reputational urgency). Even then, submit single URLs only, never use prefix removal, and never submit a URL whose canonical cluster includes a live /en/ page you want indexed.
- **Reverse Q3 to Option C (promote) only if:** Either `pt` or `es` shows ≥50 clicks/90d organically OR you have a concrete business reason (named partnership, paid campaign, identified target market) to invest in human-edited translation for that locale.
- **Reverse Q4 to "build direct redirects" only if:** Server logs reveal a 3rd hop landing in the chain (misconfiguration), OR Ahrefs surfaces a high-authority external backlink (DR ≥40 referring page) pointing at a specific `/[locale]/tags/X/` URL — and even then, create a single direct redirect just for that URL, not the blanket 187.

---

## Caveats

- **Q2 confidence is 85%**, not higher, because the Removal Tool's URL-pattern-matching behavior is documented but its real-world failure rate on canonical clusters is not quantified in any case study I located. A single-URL submission for one isolated /de/ URL is documented as safe by Mueller; the recommendation against batch use reflects the risk-vs-reward at scale (133 URLs × non-zero pattern-collision probability vs. zero upside since the tool can't clean the GSC report anyway).
- **Q3 confidence is 75%** because Google's 2024–2025 stance on AI-translated content has explicitly softened: the robots.txt anti-MT guidance was removed (March 2024), Reddit's auto-translations were described as "sanctioned," and Mueller's current framing is quality-focused rather than method-focused. The 1-click/90d traffic data is the deciding factor — these aren't real markets — not that auto-translation is forbidden.
- **Q4 confidence is 90%** — this is the most settled-doctrine of the three (Mueller's 5-hop limit from Reddit; Illyes' July 26, 2016 PageRank statement). The reserved 10% acknowledges that for a specific high-value backlinked URL, a direct redirect can be worthwhile case-by-case.
- **Source-attribution corrections incorporated:** Mueller's 5-hop quote originated in a Reddit thread, not Office Hours (Search Engine Journal clarification). The "200 countries / 40+ languages" figure in the Ahrefs piece refers specifically to AI Overviews' March 2025 rollout, not the translation-proxy footprint per se. Google's actual Helpful Content FAQ uses nuanced two-way language ("does not mean all content will rank highly... does not mean all content will rank poorly") rather than the absolutist "drags down whole site" framing common in third-party SEO writing.
- **Verify CF quota before assuming headroom:** Multiple 2025–2026 community threads document Free-plan accounts still seeing the old 20-rule cap despite the Feb 2025 changelog. The 10,000 limit is being rolled out gradually.

---

## Completion Table

| Plan Item | Covered |
|---|---|
| Q2: Removal Tool mechanics (6-month temporary SERP hide) | ✅ GSC Help docs |
| Q2: Effect on Page Indexing report buckets | ✅ GSC Help "don't use for cruft" + SEO Gets |
| Q2: Interference with 301 signal consolidation | ✅ Mueller 2018 tweet + 2024 LinkedIn |
| Q2: Mueller-specific guidance on 301'd URLs | ✅ Search Engine Roundtable #37676 |
| Q3: Auto-translated content 2024–2026 stance | ✅ March 2024 spam-policy update, Reddit case |
| Q3: Site-quality / HCU signal | ✅ Google HCU FAQ + Glenn Gabe |
| Q3: 1:1 redirect equity preservation | ✅ Illyes 2016 + Mueller |
| Q4: 5-hop tolerance (named source) | ✅ Mueller via SEJ #344664 |
| Q4: PageRank per hop (modern guidance) | ✅ Illyes Jul 26, 2016 + Mueller 2019 |
| Q4: Cloudflare Bulk Redirect limits & mechanics | ✅ CF docs + Feb 12, 2025 changelog |
| Required output format (Action/Confidence/Reason) | ✅ |
| Trade-offs for <60% confidence | N/A — all answers ≥75% |
| Evidence Notes per question | ✅ |