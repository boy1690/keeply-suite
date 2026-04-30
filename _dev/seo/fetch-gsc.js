#!/usr/bin/env node
/**
 * Fetch Google Search Console data for both Keeply properties.
 *
 * Output: JSON to stdout. Each site key contains current + previous 7-day
 * windows so the report can show week-over-week deltas.
 *
 * Auth: GOOGLE_SERVICE_ACCOUNT_JSON env var (full JSON of the service account
 * key). The service account must be granted "Restricted" or higher on each
 * GSC property.
 *
 * Properties queried:
 *   - sc-domain:keeply.work       (covers keeply.work + all subdomains)
 *   - https://blog.keeply.work/   (URL-prefix property, narrower)
 *
 * The two overlap on blog.keeply.work URLs. We keep both because each
 * surfaces slightly different metrics in their own dashboard reports.
 */
'use strict';

const { google } = require('googleapis');

const SVC_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if (!SVC_JSON) {
  console.error('GOOGLE_SERVICE_ACCOUNT_JSON env not set');
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(SVC_JSON),
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});

const SITES = [
  { url: 'sc-domain:keeply.work', label: 'main' },
  { url: 'https://blog.keeply.work/', label: 'blog' },
];

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const daysAgo = (n) => fmt(new Date(today.getTime() - n * 86400000));

const RANGES = {
  current: { startDate: daysAgo(8), endDate: daysAgo(1) },
  previous: { startDate: daysAgo(15), endDate: daysAgo(8) },
};

async function queryRange(searchconsole, siteUrl, range) {
  const base = { ...range, rowLimit: 10 };
  const [agg, queries, pages] = await Promise.all([
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: { ...range, dimensions: [], rowLimit: 1 },
    }),
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: { ...base, dimensions: ['query'] },
    }),
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: { ...base, dimensions: ['page'] },
    }),
  ]);
  return {
    agg: agg.data.rows?.[0] || {},
    queries: queries.data.rows || [],
    pages: pages.data.rows || [],
  };
}

async function querySitemaps(searchconsole, siteUrl) {
  try {
    const r = await searchconsole.sitemaps.list({ siteUrl });
    return (r.data.sitemap || []).map((s) => ({
      path: s.path,
      lastSubmitted: s.lastSubmitted,
      isPending: s.isPending,
      errors: s.errors,
      warnings: s.warnings,
      contents: s.contents?.[0]?.submitted || 0,
    }));
  } catch (e) {
    return { error: e.message };
  }
}

async function querySite(searchconsole, site) {
  const out = { siteUrl: site.url };
  try {
    const [current, previous, sitemaps] = await Promise.all([
      queryRange(searchconsole, site.url, RANGES.current),
      queryRange(searchconsole, site.url, RANGES.previous),
      querySitemaps(searchconsole, site.url),
    ]);
    out.current = current;
    out.previous = previous;
    out.sitemaps = sitemaps;
  } catch (e) {
    out.error = e.message;
  }
  return out;
}

async function main() {
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const out = { window: RANGES, sites: {} };
  for (const site of SITES) {
    out.sites[site.label] = await querySite(searchconsole, site);
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
