# CLAUDE.md — apps/website (keeply.work)

> Vanilla HTML + Node build for `keeply.work` (apex). Part of the `keeply-suite` monorepo.
> Root rules: [../../CLAUDE.md](../../CLAUDE.md). Cross-app rules (push policy, Cloudflare zone, URL refs, commit scope) live at root.

---

## Stack

- **Source**: vanilla HTML in repo root (`index.html`, `buy.html`, `install.html`, `activate.html`, `contact.html`, `privacy.html`, `refund.html`, `terms.html`, `404.html`) + per-locale subdirs (`en/`, `ja/`, `zh-tw/`, `zh-cn/`, `ko/`, `de/`, `es/`, `fr/`, `it/`, `pt/`, `nl/`, `pl/`, `tr/`, `vi/`, `th/`, `cs/`, `da/`, `fi/`, `hu/`, `no/`, `ro/`, `ru/`, `sv/`, `uk/`)
- **Build**: Node-based 8-step pipeline (`npm run build`)
- **CSS**: Tailwind 3.4 via `_dev/tailwind.config.js` → `style.css`
- **i18n**: `/i18n/{locale}.json` translation tables loaded by `i18n-loader.{hash}.js` at runtime
- **Asset fingerprinting**: hash-based filenames via `_dev/build-fingerprint.js` (e.g., `i18n-loader.60a9511617.js`)
- **SRI hashes**: integrity attrs auto-injected by `_dev/build-sri.js`
- **JSON-LD schema**: injected by `_dev/inject-schema.js`
- **Font preload**: injected by `_dev/inject-font-preload.js`

---

## Build

```bash
cd apps/website
npm ci
npm run build        # 8-step: checksums + css + pages + comparisons + schema + fingerprint + SRI + font-preload
```

| Sub-step | Script | Purpose |
|----------|--------|---------|
| `build:checksums` | `_dev/build-checksums.js` | Fetch latest SHA-256s from GitHub releases of `boy1690/keeply-releases` |
| `build:css` | tailwindcss | Minified Tailwind output → `style.css` |
| `build:pages` | `_dev/build.js` | Regenerate localized `{locale}/*.html` from `i18n/*.json` |
| `build:comparisons` | `_dev/build-comparisons.js` | Build `/compare/` competitor pages |
| `build:schema` | `_dev/inject-schema.js` | Inject JSON-LD on each page |
| `build:fingerprint` | `_dev/build-fingerprint.js` | Hash-name JS bundles for cache busting |
| `build:sri` | `_dev/build-sri.js` | Compute SRI hashes for `<script integrity>` |
| `build:font-preload` | `_dev/inject-font-preload.js` | Inject `<link rel=preload>` for fonts |

---

## Deploy

- **Target**: Cloudflare Pages (post-Phase-3A migration — see root CLAUDE.md migration status)
  - **Pre-migration**: GitHub Pages → `keeply.work` via apex `CNAME`
  - **Post-migration**: Cloudflare Pages project `keeply-website`, watch paths: `apps/website/**`
- **Cloudflare config**:
  - `cloudflare/_headers` — HTTP headers (CSP, X-Frame-Options, etc.)
  - `cloudflare/worker.js` — edge worker logic
- **IndexNow**: manual workflow trigger (`_dev/ping-indexnow.js`) — NOT on every build (throttled by Bing/Yandex)

---

## P0 — 硬規則（零容忍）

### P0.1 — Download URL **必須**指 `boy1690/keeply-releases`
- ❌ 禁指 `github.com/boy1690/Keeply/...`（private repo，無登入訪客看到 404 + sign-in 頁，conversion 漏斗斷頭）
- ✅ 必用 `github.com/boy1690/keeply-releases/releases/...`（public mirror with .exe / .msi / .dmg / .tar.gz assets）
- See [KEEPLY_DOWNLOAD_URL_POLICY.md](KEEPLY_DOWNLOAD_URL_POLICY.md) for full policy
- See [KEEPLY_DOWNLOAD_URL_MIGRATION_BRIEF.md](KEEPLY_DOWNLOAD_URL_MIGRATION_BRIEF.md) for migration history

### P0.2 — Per-release bump SOP
- New Keeply release published → edit **one** file `_dev/release-config.json`：
  - bump `version` + `versionTag`
  - **empty** `checksums: {}` (CI re-fetches on build)
- Push to `master` → CI auto-rebuilds 19 locales in ~3 min
- See [RELEASE_BUMP_SOP.md](RELEASE_BUMP_SOP.md)

### P0.3 — SRI hashes auto-managed
- `sri-manifest.json` + `fingerprint-manifest.json` are CI-generated
- Manual edits will be overwritten on next build
- If 3rd-party CDN URL added, must re-run `build:sri` locally to update SRI hash

### P0.4 — Locale parity (19)
- Adding new page must ship 19 locale versions before merge (`audit:orphans` script catches missing)
- Run `npm run audit:orphans` before commit on any page-structure change

---

## i18n schema

| Path | Purpose |
|------|---------|
| `i18n/en.json` (and 18 others) | Translation key-value tables |
| `i18n-loader.{hash}.js` | Runtime loader, fingerprinted |
| `i18n.{hash}.js` | Core i18n logic |
| `{locale}/*.html` | Pre-rendered locale-specific page (built from i18n + base HTML) |

Adding a new key to `i18n/en.json` → must add to all 18 other `*.json` files → re-run `npm run build:pages`.

---

## Specs

- `specs/` is **gitignored** (not tracked) — local dev artifacts only
- Numbered spec convention: `{NNN}-{topic}.md` (e.g., `108-buy-success-page.md`)
- Each spec corresponds to a deliverable feature / page

---

## Common operations

| Task | Command |
|------|---------|
| Local preview | `npm run build && python -m http.server 8000` then visit `localhost:8000` |
| Add new page | (1) create `page.html` template (2) add i18n keys to all 19 `i18n/*.json` (3) `npm run build` (4) `npm run audit:orphans` to verify 19 locale produced |
| Cloudflare cache purge | `npm run seo:purge` (uses `CF_ZONE_ID` + `CF_PURGE_TOKEN`) |
| Trigger IndexNow ping | GH Actions → `Deploy Website` workflow → `Run workflow` (manual dispatch) |
| Bump for new Keeply release | Edit `_dev/release-config.json` version + empty checksums → commit → push |

---

## Cross-app coordination (with apps/blog)

- When blog articles link to `keeply.work/<path>`, that path **must exist** in this app — root CLAUDE.md `Cross-app URL refs` rule applies
- New page (e.g., `/about`) requested by blog → coordinate via root `shared/docs/cross-ref-requests.md` (TBD Phase 4 next step)
- Cloudflare cache purge for shared assets: blog purges via `apps/blog/_dev/seo/cf-purge.js`, website purges via `apps/website/npm run seo:purge` — both use same token
