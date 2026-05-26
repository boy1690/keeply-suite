# GEO recon + schema validation report — 2026-05-22 (Playwright, real Google session)

Ran on the user's signed-in Google session (Taiwan). Screenshots:
`.playwright-mcp/keeply-recon-aio-misattribution.png`, `…-richresults-apex.png`.

## 1. Entity footprint — the headline finding 🚨

**"Keeply" is a badly crowded brand name, and keeply.work loses the category query.**

- **Query `Keeply file version history`** (literally our category): keeply.work does
  **not appear at all** — not in the AI Overview sources, not in the 10 organic results.
  Every "Keeply" hit is a *different* entity:
  - `addons.mozilla.org/Keeply` (Firefox add-on)
  - `KEEPLY DEFESR LIMITED` (UK company, Companies House)
  - **`Keeply – Hide photos & notes`** (iOS privacy app, App Store)
  - `github.com/appleNY/Keeply` (a student archiving project)
  - **The AI Overview actively misattributes**: its section "Keeply App Version History"
    pulls the *photo-hiding iOS app's* changelog. Google's AI conflates your brand with it.
- **Query `Keeply`** (plain brand): keeply.work *does* rank (8 links), but shares the SERP
  with ~7 competing Keeplys — `keeply.com`, `getkeeply.io`, `keeply.se`, `keeply.odoo.com`,
  the iOS app, GitHub, IndiaMart/TradeIndia. A knowledge panel shows, almost certainly **not
  ours**.

**Implication:** the GEO problem is **entity disambiguation + brand SEO**, NOT missing schema.
This *confirms* the earlier "don't rush Wikidata" call — with `keeply.com` etc. already
holding the name, a self-created Wikidata item for a solo SaaS is both notability-risky and
disambiguation-hard. The leverage is: (a) consistent entity signals so Google separates
keeply.work as its own entity, (b) get keeply.work to actually rank for category queries
(blog's job), (c) own profiles (LinkedIn company / Crunchbase) before Wikidata.

## 2. Schema validation (backlog G4) ✅ healthy

| Page | JSON-LD blocks | Types | Valid? |
|---|---|---|---|
| keeply.work apex | 1 `@graph` | Organization, WebSite, **SoftwareApplication**, Person, HowTo, **FAQPage** | ✅ parses, no `$N` breakage |
| blog post (en) | 3 | BlogPosting, BreadcrumbList, FAQPage | ✅ all valid |

- **Google Rich Results Test (apex): 2 valid rich-result-eligible items — FAQ + Software Apps**,
  crawled OK, only non-critical warnings. (Organization/WebSite/Person feed the knowledge
  graph; HowTo isn't counted — Google deprecated HowTo rich results in 2023.)
- `$599` price string is intact — the V8 `$N` trap is **not** triggered (inject-schema.js
  already uses function-form `.replace`, see its comment at `insertJsonLd`).
- So the schema-decision doc (G4) matches reality: blog auto-emits BlogPosting/Breadcrumb,
  FAQ/HowTo are per-page-optional, apex carries the entity graph.

## 3. Two real schema bugs found (one fixed)

1. **`Organization.founder` was absent** (showed as `null`). The `#founder` Person node exists
   and even points back via `worksFor`, but the Organization had no forward `founder` link —
   so the E-E-A-T link was one-directional. **FIXED in source**: added
   `founder: { '@id': '…/#founder' }` to the `ORG` const in
   [apps/website/_dev/inject-schema.js](../../../website/_dev/inject-schema.js#L44).
   ⚠️ Not yet built/deployed — see "your actions".
2. **No `foundingDate`** on the Organization. I did **not** add one (no verified date — would
   violate P0.4 no-fabrication). You know the real date; add it to `ORG` when convenient.

## 4. What this does to backlog G3

G3 was "build Keeply as a knowledge-graph entity + deploy Organization schema." Recon shows
the **apex already deploys** Organization + Person + SoftwareApplication with real data
(price $599, LinkedIn, GitHub, logo). So G3 shrinks to:
- ✅ founder link (done in source, needs build+push)
- ⬜ `foundingDate` (you add real value)
- ⬜ brand disambiguation is the *actual* hard problem (collision above), not schema
- ⬜ Wikidata stays **low priority / deferred** (crowded name + notability)

The earlier staged `keeply-organization.STAGED.json` is now **superseded** by the live apex
graph — kept only as the "target shape" reference; don't deploy it as-is.

## 5. Your actions
1. **Build + ship the founder fix** (per apps/website always-create-spec rule): create a
   small spec, `npm run build:schema` (or full `npm run build`), review the 196-file diff,
   then push (your authorization). I did the source edit only.
2. **Add real `foundingDate`** to `ORG` in inject-schema.js (optional, same build).
3. **Brand strategy** (the real lever): decide whether to (a) push keeply.work up the
   category SERP via blog/brand SEO, (b) claim a LinkedIn company page + Crunchbase for
   `sameAs`, (c) revisit Wikidata only after there's a third-party authoritative mention.
