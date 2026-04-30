# SEO weekly auto-monitoring system

> Built 2026-04-30. Pulls live data from Google Search Console + Bing Webmaster
> Tools + Yandex Webmaster + GA4 every Monday morning, opens a GitHub Issue
> with the combined report.

## What it does

Every Monday 09:00 Asia/Taipei (cron `0 1 * * 1` UTC) — and on demand via
`workflow_dispatch` — `.github/workflows/seo-weekly.yml` runs five fetch
scripts in parallel-ish, combines their JSON output into a markdown
report, and opens a GitHub Issue labelled `seo-weekly` for review.

The reports cover both `keeply.work` (apex) and `blog.keeply.work`
(subdomain). They're sibling properties — see
`~/.claude/projects/d--tools-doing-keeply-blog/memory/feedback_main_site_parity.md`
for why we treat them together.

## Output

- **GitHub Issue** — labelled `seo-weekly`, title `SEO weekly — YYYY-MM-DD`,
  body is the full markdown report. First test issue: #1.
- **Workflow artifact** — `seo-weekly-report` contains `report.md` plus
  the raw JSON from each platform. 90-day retention by default.

## Architecture

```
.github/workflows/seo-weekly.yml
  ├─ fetch-gsc.js    ─→ /tmp/seo-data/gsc.json    (clicks, queries, sitemaps × 2 sites)
  ├─ fetch-bwt.js    ─→ /tmp/seo-data/bwt.json    (rank/traffic, queries, crawl × 2 sites)
  ├─ fetch-yandex.js ─→ /tmp/seo-data/yandex.json (popular queries, SQI, indexing × 2 sites)
  ├─ fetch-ga4.js    ─→ /tmp/seo-data/ga4.json    (sessions, organic, top pages, by-host)
  ├─ health-check.js ─→ /tmp/seo-data/health.json (sitemap/robots/CSP/IndexNow/DNS probes)
  └─ build-report.js ─→ report.md                 (combines all five into markdown)
```

Each fetcher tolerates partial failure: if Yandex's API hits a
`HOST_NOT_LOADED`, the corresponding section in the report shows the
error string while the rest of the report still generates.

## Secrets (in `boy1690/keeply-blog` repo settings)

| Name | What | Source |
|---|---|---|
| `GOOGLE_ADC_JSON` | OAuth user-account credentials in ADC format (`{type, client_id, client_secret, refresh_token}`). Used by both GSC + GA4 fetchers. | OAuth Playground with custom OAuth client `keeply-seo-playground` (Web app type, redirect `https://developers.google.com/oauthplayground`); see "Why OAuth user creds" below. |
| `BWT_API_KEY` | Bing Webmaster Tools API key (single string). | BWT Settings → API access → Generate / Show. |
| `YANDEX_OAUTH_TOKEN` | Yandex API OAuth access token. | Yandex OAuth implicit flow with client created at oauth.yandex.com. |

Property IDs hardcoded in workflow (not secrets — semi-public IDs):
- `GA4_PROPERTY_ID = 534326745` (single property, both sites' streams under it)

The fetchers self-discover other identifiers (Yandex `user_id`,
GSC site URLs are in code, GA4 host split by `hostName` dimension).

## Why OAuth user creds (not service account)

We initially used a service account (`keeply-seo-bot@keeply-seo.iam.gserviceaccount.com`),
but **both GSC and GA4's UIs hard-block service account email
addresses**. The only ways past:

- **GA4**: API call to Analytics Admin API `userLinks.create` (works,
  but requires elevated OAuth scope on the user's gcloud session that
  Google's default gcloud client ID is no longer allowed to request).
- **GSC**: no API for permission management exists.

Switching to OAuth user-account credentials sidesteps both blocks: the
fetchers run as the property owner (`boy1690@gmail.com`) directly, no
permission grant needed. Trade-off: the refresh token is tied to a
single user; if that user loses access to either property, the system
breaks.

## How to refresh OAuth credentials

Refresh tokens issued by an OAuth app in **Testing** mode expire after
7 days. The `keeply-seo-fetcher` consent screen is currently in Testing.
If the workflow starts failing with `invalid_grant` errors:

1. Open https://developers.google.com/oauthplayground/
2. Settings (⚙) → "Use your own OAuth credentials" → paste client_id +
   client_secret (find them at
   https://console.cloud.google.com/apis/credentials?project=keeply-seo).
3. Step 1 — paste both scopes (space-separated):
   `https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly`
4. Authorize APIs → login as `boy1690@gmail.com` → consent.
5. Step 2 — Exchange authorization code for tokens → copy the new
   `refresh_token`.
6. Build the ADC JSON:
   ```json
   {
     "type": "authorized_user",
     "client_id": "<your client_id>",
     "client_secret": "<your client_secret>",
     "refresh_token": "<the new one>"
   }
   ```
7. Update `GOOGLE_ADC_JSON` in the repo settings (paste the whole JSON).

To make refresh tokens live indefinitely, push the OAuth consent screen
to **In production** (no verification needed for `readonly` scopes).
Worth doing if the 7-day refresh becomes annoying.

## Manual trigger

```bash
gh workflow run "SEO Weekly Report" --repo boy1690/keeply-blog
gh run list --workflow seo-weekly.yml --repo boy1690/keeply-blog --limit 1
```

Or web: https://github.com/boy1690/keeply-blog/actions/workflows/seo-weekly.yml
→ Run workflow → main → Run.

## Local testing

Each fetcher runs as a normal Node script. To debug locally without
GitHub Actions:

```bash
# Health check needs no auth at all:
node _dev/seo/health-check.js | jq .

# The auth-required fetchers need their env vars set. Easiest:
export GOOGLE_ADC_JSON="$(cat ~/.config/gcloud/application_default_credentials.json)"
export GA4_PROPERTY_ID=534326745
node _dev/seo/fetch-gsc.js | jq .sites.main.current.agg
node _dev/seo/fetch-ga4.js | jq .byHost
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| GSC `User does not have sufficient permission` | The OAuth user's account lost GSC role | Re-add `boy1690@gmail.com` to the GSC property as Owner, regenerate refresh token. |
| GA4 `User does not have sufficient permissions for this property` | Same as above for GA4 | Re-add to GA4 property access management as Admin. |
| GSC/GA4 `invalid_grant` | OAuth refresh token expired | Re-run the OAuth Playground flow above; update `GOOGLE_ADC_JSON`. |
| Yandex `HOST_NOT_LOADED` | The property was added too recently | Wait 1–3 days for Yandex to ingest the host. Not a script bug. |
| BWT empty `queries` array but `rankAndTraffic` populated | Bing hasn't crawled the site enough | Wait. Force `Request indexing` for key URLs in BWT UI. |
| Issue not opened | `seo-weekly` label was deleted | `gh label create seo-weekly --repo boy1690/keeply-blog --color 0e8a16` |
| Sitemap URL count drops sharply | Hugo build broke or config regression | Check the latest `Deploy Hugo site to Pages` run; investigate before merging. |

## Related infrastructure (not in this folder)

- **GA4 install** — blog: `layouts/_partials/head.html` + `assets/js/ga-init.js`. Main site: `keeply-website/ga4-loader.js`.
- **IndexNow** — blog: cron in `.github/workflows/deploy.yml` (auto on schedule). Main site: `keeply-website/.github/workflows/deploy.yml` `indexnow` job (manual via workflow_dispatch).
- **Yandex DNS verification** — TXT records on both `keeply.work` and `blog.keeply.work` zones in Cloudflare DNS.
- **Cloudflare CSP** — authoritative `Content-Security-Policy` header set by Transform Rule "Keeply Security Headers" on `keeply.work` zone (covers both apex + blog subdomain).

## Memory pointers

- `~/.claude/projects/d--tools-doing-keeply-blog/memory/reference_yandex_verification.md` — Yandex verification gotchas
- `~/.claude/projects/d--tools-doing-keeply-blog/memory/reference_cloudflare_csp_rule.md` — CSP authoritative source
- `~/.claude/projects/d--tools-doing-keeply-blog/memory/feedback_main_site_parity.md` — handle blog + main as siblings
- `~/.claude/projects/d--tools-doing-keeply-blog/memory/reference_gsc_sop.md` — GSC sitemap troubleshooting
