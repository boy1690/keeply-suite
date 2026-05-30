---
title: "Removal of ipapi.co IP Geolocation from keeply.work"
product: "keeply"
doc-type: "governance"
version: "v1.0"
status: "approved"
created: "2026-04-23"
last_updated: "2026-04-23"
approvers: ["WEIWEI"]
supersedes: null
language: "en"
effective_date: "2026-04-23"
---

# Removal of ipapi.co IP Geolocation from keeply.work

## 1. Purpose

This document records the decision to **remove the third-party IP geolocation
dependency (`ipapi.co`) from the Keeply marketing website** and replace it
with a browser-local language detection mechanism. It exists as a
contemporaneous written record of the legal analysis, the technical
alternatives considered, and the effective cutover date.

The removal eliminates a direct GDPR non-compliance exposure and brings the
website into alignment with the privacy representations made in the Keeply
Privacy Policy.

## 2. Context

Until 2026-04-23, every page load on `keeply.work` issued a fetch request to
`https://ipapi.co/json/`. The response was used to infer a visitor's
country, which was then mapped to a preferred UI language via a
country-to-language lookup table. The request was asynchronous and, if
successful, would "upgrade" the language from the browser-detected fallback.

This behaviour was surfaced during an internal security audit
(`keeply-website:idea/12.Security audit.md`, audit items #2, #3, #14) and
escalated because:

- **The third party is a registered US data broker.** `ipapi.co` is operated
  by Kloudend, Inc., which self-identifies as a data broker under Texas law.
  Its public privacy policy discloses use of Google Ads Remarketing,
  behavioural targeting, and analytics — processing purposes well beyond
  what is necessary for language detection.
- **IP addresses are personal data under GDPR.** The CJEU held unambiguously
  in **Breyer v Germany (Case C-582/14, 19 Oct 2016)** that dynamic IP
  addresses held by an online service provider constitute personal data.
- **Transmission to a US data broker without consent is a GDPR violation
  where a privacy-preserving alternative exists.** The **Landgericht
  München I ruling of 20 January 2022 (Az. 3 O 17493/20)** found that
  transmitting IPs to Google Fonts (a US service) without consent violated
  GDPR where self-hosting was trivially available; the court awarded €100
  and threatened €250,000 for continued infringement. The reasoning applies
  identically here because `navigator.language` is a trivial, privacy-
  preserving substitute.
- **The Privacy Policy represented "no tracking".** Website i18n string
  `privacy.website.p1` stated the site "does not use any analytics or
  tracking tools" — directly contradicted by the `ipapi.co` request.
  This created a concurrent GDPR Article 13 transparency violation.

## 3. Decision

Effective **2026-04-23**:

- The `fetch('https://ipapi.co/json/')` call, the supporting
  `COUNTRY_LANG_MAP` lookup table, and the `detectLangFromIP()` function
  are **removed in full** from `keeply-website:i18n.js`.
- Language detection is performed entirely in the visitor's browser using
  `navigator.language` (plus existing URL-locale and localStorage paths).
- The `keeply-lang` local-storage key is written **only** when the visitor
  takes an explicit action (clicks the language menu or visits a
  locale-specific URL). First-visit auto-detection does not persist.
- Privacy Policy §2.4 is added (zh-TW and en source-of-truth documents) to
  accurately describe the new behaviour.
- Website i18n string `privacy.website.p1` is rewritten across all 19
  supported locales to remove the "no tracking" wording and describe the
  actual browser-local mechanism.

## 4. Legal basis for the change

- **GDPR Article 5(1)(c) — data minimisation.** Language detection does not
  require transmission of the visitor's IP to a third-party service when an
  equivalent mechanism exists entirely in the browser.
- **GDPR Article 13 — transparency.** Representations in the Privacy
  Policy must match actual processing. Continuing the `ipapi.co` call
  while stating "no tracking" was an independent Article 13 exposure.
- **Breyer v Germany (CJEU C-582/14)** — IP addresses are personal data.
- **Landgericht München I, Urt. v. 20.01.2022 – 3 O 17493/20** — applied
  directly: transfer of IPs to a US service without consent is unlawful
  where a privacy-preserving alternative exists.
- **Datenschutzbehörde (Austria) decision of September 2022** — reinforced
  the Munich reasoning in the Google Fonts / Google Analytics context.

## 5. Alternatives considered

| Alternative | Outcome | Reason |
|---|---|---|
| Keep `ipapi.co` but add consent banner | **Rejected** | Adds a blocking UI step for every visitor purely to preserve a non-essential feature. The cost-benefit is negative given that `navigator.language` delivers equivalent accuracy for the typical case. |
| Self-hosted GeoIP database (MaxMind, IP2Location) | **Rejected** | Requires a server-side component. `keeply.work` is a static site on GitHub Pages; introducing a server endpoint expands the operational surface without proportionate benefit. |
| Cloudflare Workers reading `CF-IPCountry` header | **Rejected (for now)** | Viable but requires migrating the site behind a Cloudflare proxy. This is on the roadmap for security headers (audit item #8) but is out of scope for this narrower fix. If adopted later, language detection via `CF-IPCountry` may be reconsidered under GDPR Article 6(1)(f) legitimate interests, with a Legitimate Interest Assessment. |
| `Accept-Language` header server-side | **Not applicable** | GitHub Pages serves static HTML without access to request headers at render time. |
| Drop automatic language detection entirely | **Rejected** | Harms first-visit experience for non-English visitors. `navigator.language` achieves the goal without any privacy trade-off. |
| Replace `ipapi.co` with another free geolocation API (e.g., `ip-api.com`, `ipwhois.io`) | **Rejected** | Substitutes one data-broker dependency for another without addressing the underlying GDPR issue. |

**Chosen alternative**: `navigator.language` (plus existing URL-locale and
localStorage paths). This is Tailwind-free, no-dependency, zero-network,
and aligns with the `data minimisation` principle.

## 6. Residual risk and mitigation

- **Visitor whose browser language differs from geographic preference**
  (e.g., a German visitor whose browser is set to English). Mitigation:
  the globe-icon language menu is prominent in the nav; the URL-locale
  scheme (`/de/`, `/zh-TW/`, etc.) allows direct sharing of a
  locale-specific version.
- **Translation quality gap in 17 non-authoritative locales.** The legal
  source of truth covers `en` and `zh-TW` only; the other 17 locales
  (de, nl, ja, ko, fr, es, pt, it, pl, cs, hu, tr, fi, sv, no, da, zh-CN)
  are maintained as website-only translations derived from the English
  source. This is recorded in `/law/registry.json` under
  `products.keeply.documents.privacy.notes`. If a GDPR Representative
  engagement or DPA inquiry requires locale-authoritative versions,
  backlog item will be raised.
- **Historical localStorage values.** Visitors who had previously been
  auto-written a `keeply-lang` value via the IP path retain that value;
  it continues to function as a stored preference. We do not clear it,
  because doing so would be a worse UX surprise than leaving it in place,
  and the value itself contains no personal data — only a locale code.

## 7. Review trigger

This document is reviewed, and the decision re-examined, when any of the
following occurs:

- The site migrates behind a Cloudflare proxy (reopens the
  `CF-IPCountry`-based detection option).
- A GDPR Representative is appointed for Keeply, or a DPA inquiry is
  received requiring locale-authoritative privacy documents in additional
  languages.
- Substantive change in CJEU case law on IP addresses as personal data, or
  in German/Austrian DPA guidance on browser-local alternatives.
- Architectural change that makes server-side locale detection viable
  without a new third-party dependency.

Annual review is otherwise the default cadence (next: 2027-04-23).

## 8. Implementation cross-reference

| Artefact | Location |
|---|---|
| Website JS change | `keeply-website:i18n.js` (removal of `COUNTRY_LANG_MAP`, `detectLangFromIP`, and the `init()` call-site) |
| Website Privacy-§Website-Data copy | `keeply-website:i18n/*.js` + `keeply-website:i18n/*.json` (key `privacy.website.p1`, 19 locales × 2 formats = 38 files) |
| Privacy policy source | `/law/products/keeply/privacy-2026-04-21.md` §2.4 (zh-TW) and `.en.md` §2.4 (en) |
| Implementing spec | `keeply-website:specs/website/016-gdpr-privacy-fix/` |
| Originating audit | `keeply-website:idea/12.Security audit.md` items #2, #3, #14 |

## 9. Sign-off

- Author: WEIWEI
- Approver: WEIWEI
- Date: 2026-04-23
- Effective: 2026-04-23
- Status: approved (internal governance document; privacy-policy update
  accompanying this decision is released under the same approval scope
  per `/law/docs/legal-review-process.md`)
