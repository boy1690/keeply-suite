# LinkedIn Company Page — ready-to-paste content (Keeply)

> Prepared 2026-05-22 (backlog G3 brand-disambiguation). Recon: `/company/keeply` is
> **taken** by an unrelated French "Keeply" → use an alternative vanity slug below.
> Crunchbase came back clear but is **low value** for a bootstrapped solo SaaS → skip for now.
> Creation needs YOU logged into LinkedIn (personal account → "Create a Company Page");
> once you're in, I can drive the form. Copy avoids the P0.2 "Git for non-developers" framing.

## Create flow
LinkedIn → top-right **For Business** (grid icon) → **Create a Company Page** → **Company**.

## Fields

| Field | Value |
|---|---|
| **Name** | `Keeply` |
| **Public URL** (`linkedin.com/company/…`) | `keeply-work`  (1st choice; `keeply` is taken). Fallbacks: `keeplyapp`, `getkeeply`, `keeply-hq` |
| **Website** | `https://keeply.work` |
| **Industry** | Software Development |
| **Company size** | 0–1 employees (Myself only) |
| **Company type** | Self-employed / Privately Held |
| **Logo** | 300×300 PNG of the Keeply mark (convert `keeply.work/logo.svg` → PNG; or reuse the favicon/og asset). LinkedIn needs raster, not SVG. |
| **Tagline** (≤120 char) | `Automatic version history + delivery tracking for your files — answer "which version did I send?" in seconds.` |

## Description (paste into "About")

```
Keeply is a file-version guardian for project teams. It keeps an automatic, always-on
version history of the files on your computer, NAS, or shared drive — and tags every
delivery — so months later you can answer "which version did I send the client?" and
roll back to any past save in seconds.

No manual "_v7_FINAL" file names, no relying on an app's short-lived built-in history.
Keeply runs quietly on Windows and macOS and protects the files you already work in.

Built for designers, consultants, engineers, accountants, and anyone who delivers files
to clients and can't afford to lose track of which version went out.

Learn more at https://keeply.work
```

## Specialties (add as tags)
file version control · version history · delivery tracking · file backup · document version management · version protection

## After creating
1. Add the new page URL to `Organization.sameAs` in
   [apps/website/_dev/inject-schema.js](../../website/_dev/inject-schema.js#L50) (alongside the
   founder fix), then build + push.
2. Post 2–3 updates so the page isn't empty (empty pages hurt more than help entity trust).
3. This becomes a Bing Knowledge Panel driver + a Google entity `sameAs` signal.
