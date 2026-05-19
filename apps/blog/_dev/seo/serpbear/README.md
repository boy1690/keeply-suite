# SerpBear — self-hosted rank tracker

> Daily Google SERP position tracking for keeply.work + blog.keeply.work
> keywords. Open-source alternative to Ahrefs / Semrush rank-tracking
> modules. Upstream: [towfiqi/serpbear](https://github.com/towfiqi/serpbear).

## What you get

- **Daily auto-crawl** of Google SERPs for tracked keywords (desktop + mobile, country-scoped).
- **Position history** charts per keyword, with email notifications on big jumps.
- **GSC integration** — auto-import keywords your site already ranks for.
- **API** for piping data into the existing `_dev/seo/build-report.js` weekly Issue.

## Why this exists

The existing `seo-weekly.yml` flow pulls *aggregate* GSC clicks / impressions
once a week. It can't tell you "the keyword `檔案版本管理` dropped from #4 to
#11 yesterday". SerpBear runs its own SERP crawl, so position changes show up
within a day instead of waiting for GSC's 2–3 day lag.

This sits **alongside** the existing stack — not a replacement:

| Tool                                     | Cadence  | Strength                                    |
| ---------------------------------------- | -------- | ------------------------------------------- |
| `seo-weekly.yml` (GSC / BWT / GA4)       | Weekly   | Aggregate traffic, top queries, audience    |
| `seo-audit.yml` (site-audit-seo)         | Monthly  | Technical crawl, Lighthouse per page        |
| **SerpBear (this stack)**                | Daily    | Per-keyword position tracking, alerts       |
| Ubersuggest MCP                          | On-demand | Keyword research, SD/volume during Phase A/B |

## Where to host it

Pick one — all work the same way once `docker compose up -d` runs:

1. **Local NAS (`Z:\`)** — copy this folder there, `docker compose up -d`. Cheap, no extra cost; needs the NAS to stay up.
2. **Railway / Fly.io / Hetzner VPS** — paste the compose file, set env vars in the dashboard. ~$5/month, public URL.
3. **Local dev box** — fine for trial, stops tracking when machine sleeps.

Recommendation: NAS first (you already maintain `Z:\keeply-blog\` there). Move to a VPS only if you start sharing the UI with others.

## Setup

```bash
cd _dev/seo/serpbear/
cp .env.example .env

# Generate random secrets (Linux/macOS/Git Bash)
echo "SERPBEAR_SECRET=$(openssl rand -hex 32)"   >> .env
echo "SERPBEAR_APIKEY=$(openssl rand -hex 32)"   >> .env

# Edit USER / PASSWORD / PUBLIC_URL in .env, then:
docker compose up -d
docker compose logs -f         # watch first boot, ctrl-C when "Ready" appears
```

Open `http://localhost:3001`, log in with the `SERPBEAR_USER` / `SERPBEAR_PASSWORD` from `.env`.

## Suggested initial keyword set

Start with one domain × ~30 keywords (free tier of SerpBear's scraper has no hard cap, but more keywords = slower daily run):

- `blog.keeply.work` — top 20 keywords from `_dev/seo/` GSC report, plus the `primary_keyword` of every shipped article.
- `keeply.work` — brand keyword set (Keeply, keeply.work, 檔案管理 軟體, 版本管理 工具…) + the 5 main competitor brand names you care about.

Tag-set conventions inside SerpBear:

- `country` — pick one per market (TW / US / CN / JP / KR / IT for the 6 core locales).
- `device` — desktop / mobile; track both for any keyword where mobile share > 40% in GA4.
- `tag` — `pillar` / `cluster:<slug>` / `competitor-brand` / `commercial-intent` / `site:blog` / `site:main`.

### Sibling property parity (`blog.keeply.work` + `keeply.work`)

Both domains live in the same SerpBear instance — they're sibling properties (see memory `feedback_main_site_parity.md`). Add **both** domains under SerpBear → Domains, then split keyword strategy by intent:

| Domain               | Primary keyword class                        | Why                                                  |
| -------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `blog.keeply.work`   | TOFU / informational (long-tail, `+how`)     | Pillar / cluster articles intercept research stage   |
| `keeply.work`        | BOFU / brand + commercial (`+download`, `+vs`) | Main site converts evaluation-stage searches         |

When a keyword starts ranking blog-side but the searcher's intent is commercial, that's a signal to write a comparison/eval piece on the main site (or add a CTA on the blog post). SerpBear's per-domain dashboards make this gap visible.

## GSC integration (recommended)

Without GSC, SerpBear only tracks keywords you add manually. With GSC, it can auto-pull keywords your site already ranks for and back-fill historical positions.

1. **Create a service account** in any GCP project: IAM & Admin → Service Accounts → Create.
2. Download the **JSON key** for that service account.
3. In GSC for both properties (`sc-domain:keeply.work` and `https://blog.keeply.work/`), add the service-account email as a **User** with at least Restricted access.
4. Paste `client_email` into `SERPBEAR_GSC_CLIENT_EMAIL` and the `private_key` string (including the `\n`) into `SERPBEAR_GSC_PRIVATE_KEY` in `.env`.
5. `docker compose up -d --force-recreate`.
6. In the SerpBear UI: Settings → Search Console → toggle on.

## API access (for stitching into weekly report)

SerpBear exposes a REST API gated by `SERPBEAR_APIKEY`. The minimum useful call:

```bash
curl -H "Authorization: Bearer $SERPBEAR_APIKEY" \
  "http://localhost:3001/api/keywords?domain=blog.keeply.work"
```

Future: a `_dev/seo/fetch-serpbear.js` can be added later to merge this into
`build-report.js`, mirroring the existing `fetch-gsc.js` / `fetch-bwt.js`
shape. Not in scope for this initial drop — verify the manual UI first, then
automate.

## Stopping / data location

```bash
docker compose down                 # stop, keep data
docker compose down -v && rm -rf data/   # nuke everything
```

The SQLite DB + logs live in `./data/` (host-side), gitignored.

## Troubleshooting

- **"Failed to fetch SERP" repeatedly** — SerpBear scrapes Google directly; some IPs get rate-limited. The container has built-in proxy support; see upstream docs if you trip the cap.
- **GSC auth fails** — most common cause: service account email not added to the GSC property. Add it via GSC → Settings → Users → Add user.
- **Port 3001 already in use** — change `SERPBEAR_PORT` in `.env`, `docker compose up -d`.
