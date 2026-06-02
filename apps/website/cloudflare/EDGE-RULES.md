# Cloudflare edge config — SOURCE OF TRUTH (keeply.work zone)

> **Why this file exists**: the live edge security headers + caching are configured
> in the **Cloudflare dashboard (Rules)**, NOT in any deployed code in this repo.
> `cloudflare/worker.js` and `cloudflare/_headers` are **orphaned Path-2 alternatives**
> that are *not deployed* (and `cloudflare/` is `--exclude`d from the deploy staging).
> This doc captures the ACTUAL running config so future header/cache edits go to the
> right place.
>
> Inventoried live from the dashboard 2026-06-02 (spec 120 follow-up). Account
> `b1a8a42f2d5a3865fca1009cd3f028ce`, zone `keeply.work` (Free plan). Re-verify before
> relying on exact values — dashboard config can change outside git.

---

## ⚠️ What is NOT the source of truth

| Repo file | Status |
|-----------|--------|
| `cloudflare/worker.js` | **NOT deployed.** The un-chosen "Path 2" (bind a Worker). Header comment still says origin = "GitHub Pages" (pre-CF-Pages migration) and only decorates `text/html` — neither matches the live setup. Kept for reference only. |
| `cloudflare/_headers` | **NOT deployed.** Old comprehensive `_headers` template (`max-age=3600` etc.). The deploy root `_headers` (`apps/website/_headers`) only carries `/legal/*` + `/demo/*` rules. |
| `apps/website/_headers` (root) | **Deployed.** Only `/legal/* → X-Robots-Tag: noindex` and `/demo/* → iframe CSP override`. Everything else (global security headers, caching) is dashboard Rules below. |

---

## Live dashboard Rules (the real config)

### 1. Response Header Transform Rule — "Keeply Security Headers"  ← global security headers
- **Match** (verbatim):
  ```
  ((http.host eq "keeply.work") or (http.host eq "www.keeply.work") or (http.host eq "blog.keeply.work"))
  and not starts_with(http.request.uri.path, "/demo/")
  ```
  (`/demo/` is excluded so the deployed root `_headers` `/demo/*` rule can relax `frame-ancestors` for the homepage iframe — spec 119.)
- **Action**: 8 × "Set static" response headers (values observed live 2026-06-02):
  1. `Content-Security-Policy` = `default-src 'self'; script-src 'self' https://analytics.ahrefs.com https://www.googletagmanager.com https://static.cloudflareinsights.com https://*.clarity.ms https://cdn.paddle.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com https://*.clarity.ms https://c.bing.com; font-src 'self'; connect-src 'self' https://analytics.ahrefs.com https://docs.google.com https://*.google-analytics.com https://*.analytics.google.com https://cloudflareinsights.com https://*.clarity.ms; form-action 'self' https://docs.google.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests`
  2. `Strict-Transport-Security` = `max-age=31536000; includeSubDomains`
  3. `X-Frame-Options` = `DENY`
  4. `X-Content-Type-Options` = `nosniff`
  5. `Referrer-Policy` = `strict-origin-when-cross-origin`
  6. `Permissions-Policy` = `camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), autoplay=(), fullscreen=(self)`
  7. `Cross-Origin-Opener-Policy` = `same-origin`
  8. `Cross-Origin-Resource-Policy` = `same-origin`

> **To change a security header on keeply.work → edit THIS rule** (Rules → Overview →
> 回應標頭轉換規則 → "Keeply Security Headers"). Editing `worker.js` does nothing.

There is also a second active response-header rule setting `Content-Type: text/markdown; charset=utf-8` (scope not fully captured — likely for `/legal/*.md` raw governance docs so browsers render them as markdown).

### 2. Cache Rules
- **"Long cache for fingerprinted assets"** — match: host ∈ {keeply.work, blog.keeply.work} AND path starts_with `/js/` OR `/css/` OR `/fonts/` OR ends_with `.woff` → sets Browser TTL + Edge TTL (long; the `s-maxage` seen on assets).
- **"HTML cache (5min edge TTL)"** — match: host ∈ {keeply.work, blog.keeply.work} AND path ends_with `/` OR `.html` → Edge TTL 5 min.

> Note: these rules are why a zone "Custom Purge by URL" sometimes fails to evict an
> asset (the cached object's key vs the purge key) — see spec 120. Per-URL purge did
> not evict the leaked `/docs/*`; only "Purge Everything" or natural TTL expiry does.

### 3. Redirect Rules (URL 改寫 / 重新導向)
- `/zh-tw/*` → 301 `/zh-TW/*` (locale case fix)
- `/zh-cn/*` → 301 `/zh-CN/*` (locale case fix)
- (the `_redirects` file at deploy root carries additional `.html`→clean-URL redirects)

---

## If you ever want code-managed edge config
The Free-plan Transform/Cache Rules are dashboard-only here. To version them, either
(a) keep this doc in sync by hand after dashboard edits, or (b) migrate to Terraform
(`cloudflare_ruleset`) — out of scope as of 2026-06-02.
