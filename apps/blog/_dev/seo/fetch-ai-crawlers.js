#!/usr/bin/env node
/**
 * Fetch AI-crawler activity from Cloudflare for both Keeply properties, as a
 * GEO (Generative Engine Optimization) measurement layer for the weekly report.
 *
 * WHY: GSC/BWT/Yandex measure search-engine demand; GA4 measures humans. None
 * of them tell us whether AI engines are fetching our content. This closes that
 * gap and supplies the leading signal geo-backlog G2 lacked — see
 * _dev/proposals/geo-ai-crawler-analytics-spec.md.
 *
 * SOURCE: Cloudflare AI Crawl Control GraphQL = the `httpRequestsAdaptiveGroups`
 * node on the GraphQL Analytics API (NOT Enterprise Bot Management). We classify
 * by the `userAgent` dimension (available on all plans) rather than the
 * `botDetectionIds` filter (which requires the paid Bot Management product).
 *
 * FREE-PLAN CONSTRAINT (verified 2026-05-24): a single query may span AT MOST
 * 1 day ("cannot request a time range wider than 1d"). Retention is >= 8 days.
 * So we issue ONE ~24h query PER DAY and aggregate locally — no daily cron and
 * no history file needed; the weekly job loops the days at report time.
 *
 * KEY DESIGN — two crawler classes, NOT one vanity total:
 *   - user_fetch (LEADING GEO signal): a live user query in ChatGPT/Perplexity/
 *     Claude triggered a fetch of our page -> we're likely being cited right now.
 *   - training      (lagging): corpus ingestion -> we're in the training set.
 * Headline KPI = user_fetch WoW trend per host + top cited paths.
 *
 * AUTH: a Cloudflare API token with Zone -> Analytics:Read on the keeply.work
 * zone. Read from CF_ANALYTICS_TOKEN (fallback CLOUDFLARE_API_TOKEN); zone via
 * CF_ZONE_ID (fallback CLOUDFLARE_ZONE_ID). The shared keeply.work zone serves
 * both keeply.work apex AND blog.keeply.work; we split by clientRequestHTTPHost.
 *
 * OUTPUT: JSON to stdout (same convention as fetch-crux.js). Failures are
 * non-fatal to the weekly run — the workflow wraps this in `|| echo '{error}'`.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// ── env bootstrap (mirror fetch-crux.js: env first, then local .env files) ──
function bootstrapEnv() {
  const candidates = [
    path.join(__dirname, '.env'),
    path.join(__dirname, 'serpbear', '.env'),
  ];
  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.+)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
}
bootstrapEnv();

const TOKEN = process.env.CF_ANALYTICS_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
const ZONE = process.env.CF_ZONE_ID || process.env.CLOUDFLARE_ZONE_ID;
if (!TOKEN || !ZONE) {
  console.error(
    'Missing token or zone. Need CF_ANALYTICS_TOKEN (or CLOUDFLARE_API_TOKEN) ' +
      'and CF_ZONE_ID (or CLOUDFLARE_ZONE_ID), via env or _dev/seo/.env.'
  );
  process.exit(1);
}

const GQL = 'https://api.cloudflare.com/client/v4/graphql';
const HOUR = 3600000;
const DAY = 86400000;
const SPAN = DAY - 60000; // ~23h59m, safely under the 1-day cap
const WEEK_DAYS = 7;
const at = (msAgo) => new Date(Date.now() - msAgo).toISOString();

// Hosts we care about on the shared zone (others -> ignored).
const HOSTS = {
  'blog.keeply.work': 'blog',
  'keeply.work': 'main',
  'www.keeply.work': 'main',
};

// ── crawler classification (UA substring, case-insensitive) ─────────────────
// user_fetch checked first (more specific) so "Claude-User" never falls through
// to the "ClaudeBot" training bucket.
const USER_FETCH_UAS = [
  'ChatGPT-User', 'OAI-SearchBot', 'PerplexityBot', 'Perplexity-User',
  'Claude-User', 'Claude-SearchBot', 'Claude-Web', 'Gemini-User',
];
const TRAINING_UAS = [
  'GPTBot', 'ClaudeBot', 'anthropic-ai', 'CCBot', 'Google-Extended',
  'Applebot-Extended', 'Amazonbot', 'Meta-ExternalAgent', 'FacebookBot',
  'cohere-ai', 'Bytespider', 'Diffbot', 'ImagesiftBot', 'Timpibot',
  'Omgilibot', 'YouBot', 'DuckAssistBot',
];
function classify(ua) {
  const u = (ua || '').toLowerCase();
  if (USER_FETCH_UAS.some((s) => u.includes(s.toLowerCase()))) return 'user_fetch';
  if (TRAINING_UAS.some((s) => u.includes(s.toLowerCase()))) return 'training';
  return 'other';
}
function matchedUa(ua) {
  const u = (ua || '').toLowerCase();
  return (
    USER_FETCH_UAS.find((s) => u.includes(s.toLowerCase())) ||
    TRAINING_UAS.find((s) => u.includes(s.toLowerCase())) ||
    ua
  );
}

async function gql(query) {
  const r = await fetch(GQL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await r.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${r.status}: non-JSON ${text.slice(0, 160)}`);
  }
  if (json.errors && json.errors.length) {
    throw new Error(`GraphQL: ${json.errors[0].message.slice(0, 200)}`);
  }
  return json.data;
}

// One ~24h slice ending `dBack` days ago, grouped by the given dimensions.
async function fetchDay(dBack, dims, limit = 2500) {
  const since = at(dBack * DAY);
  const until = at(dBack * DAY - SPAN);
  const q = `{viewer{zones(filter:{zoneTag:"${ZONE}"}){httpRequestsAdaptiveGroups(limit:${limit},filter:{datetime_geq:"${since}",datetime_leq:"${until}"},orderBy:[count_DESC]){count dimensions{${dims}}}}}}`;
  const d = await gql(q);
  return d?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || [];
}

function emptyBucket() {
  return { user_fetch: 0, training: 0, byUa: {} };
}

// Aggregate a list of {count, dimensions:{userAgent, clientRequestHTTPHost}} rows.
function foldRows(rows, acc) {
  for (const row of rows) {
    const ua = row.dimensions?.userAgent || '';
    const host = HOSTS[row.dimensions?.clientRequestHTTPHost || ''];
    if (!host) continue;
    const klass = classify(ua);
    if (klass === 'other') continue;
    const c = row.count || 0;
    acc[host] = acc[host] || emptyBucket();
    acc[host][klass] += c;
    const key = matchedUa(ua);
    acc[host].byUa[key] = (acc[host].byUa[key] || 0) + c;
  }
}

async function collectWeek(startDayBack) {
  // days [startDayBack .. startDayBack+6], one query each
  const acc = {};
  for (let i = 0; i < WEEK_DAYS; i++) {
    const rows = await fetchDay(startDayBack + i, 'userAgent clientRequestHTTPHost');
    foldRows(rows, acc);
  }
  return acc;
}

// Infra/asset paths AI bots hit but that aren't "content being cited".
const NON_CONTENT = /^\/(robots\.txt|sitemap.*\.xml|.*manifest\.json|favicon|\.well-known|index\.xml)/i;

async function collectTopPaths(startDayBack) {
  // current-week user_fetch hits by content path, per host (ranking approximate)
  const byHost = {};
  for (let i = 0; i < WEEK_DAYS; i++) {
    const rows = await fetchDay(
      startDayBack + i,
      'userAgent clientRequestHTTPHost clientRequestPath'
    );
    for (const row of rows) {
      if (classify(row.dimensions?.userAgent) !== 'user_fetch') continue;
      const host = HOSTS[row.dimensions?.clientRequestHTTPHost || ''];
      if (!host) continue;
      const p = row.dimensions?.clientRequestPath || '/';
      if (NON_CONTENT.test(p)) continue;
      byHost[host] = byHost[host] || {};
      byHost[host][p] = (byHost[host][p] || 0) + (row.count || 0);
    }
  }
  const top = {};
  for (const [host, paths] of Object.entries(byHost)) {
    top[host] = Object.entries(paths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([p, c]) => ({ path: p, count: c }));
  }
  return top;
}

async function main() {
  const out = {
    generatedAt: new Date().toISOString(),
    zone: ZONE,
    windowDays: WEEK_DAYS,
    note:
      'Cloudflare-sampled counts (adaptive); absolute volume is an estimate. ' +
      'Free plan caps each query at 1 day AND retains only ~8 days, so we report ' +
      'the trailing 7 days (days 1-7) only — week-over-week is not derivable from ' +
      'Cloudflare and is tracked across weekly Issues (v1.1: snapshot history). ' +
      'Google AI Overviews (Googlebot) and Bing AI (Bingbot) cannot be isolated ' +
      'by UA and are NOT counted.',
    current: {},
    topPaths: {},
  };
  // current = trailing 7 days (days 1..7 back); retention can't reach further.
  out.current = await collectWeek(1);
  try {
    out.topPaths = await collectTopPaths(1);
  } catch (e) {
    out.topPathsError = e.message;
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
