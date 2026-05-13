#!/usr/bin/env node
/**
 * Sync top GSC queries into self-hosted SerpBear as tracked keywords.
 *
 * Why this exists: SerpBear's built-in GSC integration requires the
 * service-account email to be added as a GSC user — which Google's UI
 * blocks for *.iam.gserviceaccount.com addresses (see
 * .claude/skills/serpbear-deploy/SKILL.md T1). Instead of fighting
 * that, we pull GSC data via the same user-OAuth credentials that
 * fetch-gsc.js already uses, then POST keywords into SerpBear via its
 * local cookie-auth session.
 *
 * Inputs (env vars):
 *   GOOGLE_ADC_JSON       OAuth user creds {client_id, client_secret, refresh_token}
 *   SERPBEAR_URL          default http://localhost:3010
 *   SERPBEAR_USER         SerpBear login username
 *   SERPBEAR_PASSWORD     SerpBear login password
 *   SYNC_TOP_N            top N queries per property (default 30)
 *   SYNC_MIN_IMPRESSIONS  skip queries below this 28-day impression count (default 10)
 *   SYNC_DRY_RUN          if set, log what would be added, don't POST
 *
 * Output: JSON summary on stdout.
 *
 * Run: node _dev/seo/sync-gsc-to-serpbear.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// --- Self-bootstrap creds (env → gcloud ADC → serpbear/.env) ---
function bootstrapAdc() {
  if (process.env.GOOGLE_ADC_JSON) return;
  const candidates = [
    process.env.APPDATA && path.join(process.env.APPDATA, 'gcloud', 'application_default_credentials.json'),
    process.env.HOME && path.join(process.env.HOME, '.config', 'gcloud', 'application_default_credentials.json'),
  ].filter(Boolean);
  for (const p of candidates) {
    if (fs.existsSync(p)) { process.env.GOOGLE_ADC_JSON = fs.readFileSync(p, 'utf8'); return; }
  }
}

function bootstrapSerpBearEnv() {
  if (process.env.SERPBEAR_USER && process.env.SERPBEAR_PASSWORD) return;
  const envPath = path.join(__dirname, 'serpbear', '.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  const grab = (k) => (text.match(new RegExp(`^${k}=(.+)$`, 'm')) || [])[1];
  if (!process.env.SERPBEAR_USER) process.env.SERPBEAR_USER = grab('SERPBEAR_USER');
  if (!process.env.SERPBEAR_PASSWORD) process.env.SERPBEAR_PASSWORD = grab('SERPBEAR_PASSWORD');
  if (!process.env.SERPBEAR_URL) {
    const pubUrl = grab('SERPBEAR_PUBLIC_URL');
    if (pubUrl) process.env.SERPBEAR_URL = pubUrl;
  }
}

bootstrapAdc();
bootstrapSerpBearEnv();

const ADC_JSON = process.env.GOOGLE_ADC_JSON;
if (!ADC_JSON) {
  console.error('No GOOGLE_ADC_JSON env and no gcloud ADC at default location.');
  console.error('Fix: gcloud auth application-default login --scopes=openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/webmasters.readonly');
  process.exit(1);
}
const SERPBEAR_URL = (process.env.SERPBEAR_URL || 'http://localhost:3010').replace(/\/$/, '');
const SERPBEAR_USER = process.env.SERPBEAR_USER;
const SERPBEAR_PASSWORD = process.env.SERPBEAR_PASSWORD;
if (!SERPBEAR_USER || !SERPBEAR_PASSWORD) {
  console.error('SERPBEAR_USER / SERPBEAR_PASSWORD not set and not found in _dev/seo/serpbear/.env');
  process.exit(1);
}
const TOP_N = parseInt(process.env.SYNC_TOP_N || '30', 10);
const MIN_IMPRESSIONS = parseInt(process.env.SYNC_MIN_IMPRESSIONS || '10', 10);
const DRY_RUN = !!process.env.SYNC_DRY_RUN;

const adc = JSON.parse(ADC_JSON);
const auth = new google.auth.OAuth2(adc.client_id, adc.client_secret);
auth.setCredentials({ refresh_token: adc.refresh_token });

const SITES = [
  { gscUrl: 'https://blog.keeply.work/', serpbearDomain: 'blog.keeply.work', tag: 'site:blog' },
  { gscUrl: 'sc-domain:keeply.work',     serpbearDomain: 'keeply.work',      tag: 'site:main' },
];

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const daysAgo = (n) => fmt(new Date(today.getTime() - n * 86400000));
const RANGE = { startDate: daysAgo(29), endDate: daysAgo(1) };

async function fetchTopQueries(siteUrl) {
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const r = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: { ...RANGE, dimensions: ['query', 'country'], rowLimit: TOP_N * 4 },
  });
  return (r.data.rows || []).map((row) => ({
    query: row.keys[0],
    country: row.keys[1].toUpperCase(),
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}

async function sbFetch(path, opts = {}) {
  const url = SERPBEAR_URL + path;
  const r = await fetch(url, opts);
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!r.ok) throw new Error(`${opts.method || 'GET'} ${path} → ${r.status}: ${text.slice(0, 200)}`);
  return { res: r, json };
}

async function loginSerpBear() {
  const r = await fetch(SERPBEAR_URL + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: SERPBEAR_USER, password: SERPBEAR_PASSWORD }),
  });
  if (!r.ok) throw new Error(`SerpBear login failed: ${r.status}`);
  const setCookie = r.headers.getSetCookie?.() || [r.headers.get('set-cookie')].filter(Boolean);
  const cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
  if (!cookie) throw new Error('SerpBear returned no session cookie');
  return cookie;
}

async function listExistingKeywords(cookie, domain) {
  const r = await fetch(`${SERPBEAR_URL}/api/keywords?domain=${encodeURIComponent(domain)}`, {
    headers: { Cookie: cookie },
  });
  if (!r.ok) throw new Error(`list keywords failed: ${r.status}`);
  const j = await r.json();
  return new Set((j.keywords || []).map((k) => `${k.keyword.toLowerCase()}|${k.country}|${k.device}`));
}

async function addKeyword(cookie, payload) {
  const r = await fetch(SERPBEAR_URL + '/api/keywords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ keywords: [payload] }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`add keyword failed (${r.status}): ${text.slice(0, 200)}`);
  return JSON.parse(text);
}

async function syncSite(cookie, site) {
  const queries = await fetchTopQueries(site.gscUrl);
  const filtered = queries
    .filter((q) => q.impressions >= MIN_IMPRESSIONS)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, TOP_N);

  const existing = await listExistingKeywords(cookie, site.serpbearDomain);
  const added = [];
  const skipped = [];

  for (const q of filtered) {
    const fp = `${q.query.toLowerCase()}|${q.country}|desktop`;
    if (existing.has(fp)) {
      skipped.push({ ...q, reason: 'already-tracked' });
      continue;
    }
    const payload = {
      keyword: q.query,
      device: 'desktop',
      country: q.country,
      domain: site.serpbearDomain,
      tags: `${site.tag},gsc-auto`,
      city: '',
    };
    if (DRY_RUN) {
      added.push({ ...q, dryRun: true });
      continue;
    }
    try {
      await addKeyword(cookie, payload);
      added.push(q);
    } catch (e) {
      skipped.push({ ...q, reason: `add-failed: ${e.message}` });
    }
  }

  return {
    domain: site.serpbearDomain,
    pulled: queries.length,
    after_filter: filtered.length,
    added: added.length,
    skipped: skipped.length,
    samples: { added: added.slice(0, 5), skipped: skipped.slice(0, 5) },
  };
}

async function main() {
  const cookie = await loginSerpBear();
  const out = { window: RANGE, top_n: TOP_N, min_impressions: MIN_IMPRESSIONS, dry_run: DRY_RUN, sites: {} };
  for (const site of SITES) {
    try {
      out.sites[site.serpbearDomain] = await syncSite(cookie, site);
    } catch (e) {
      out.sites[site.serpbearDomain] = { error: e.message };
    }
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
