#!/usr/bin/env node
/**
 * Fetch Bing Webmaster Tools data for both Keeply sites.
 *
 * Output: JSON to stdout.
 * Auth: BWT_API_KEY env var (single string, from BWT Settings → API access).
 *
 * BWT API docs: https://learn.microsoft.com/en-us/bingwebmaster/getting-access
 *
 * Endpoints used:
 *   GetRankAndTrafficStats  → daily clicks/impressions for the past period
 *   GetQueryStats           → top queries
 *   GetPageStats            → top pages
 *   GetCrawlStats           → daily crawl counts / errors
 */
'use strict';

const KEY = process.env.BWT_API_KEY;
if (!KEY) {
  console.error('BWT_API_KEY env not set');
  process.exit(1);
}

const SITES = ['https://keeply.work/', 'https://blog.keeply.work/'];

async function call(method, params = {}) {
  const qs = new URLSearchParams({ apikey: KEY, ...params }).toString();
  const url = `https://ssl.bing.com/webmaster/api.svc/json/${method}?${qs}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${method} HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return res.json();
}

async function querySite(siteUrl) {
  const result = { siteUrl };
  const safeCall = async (key, method) => {
    try {
      const r = await call(method, { siteUrl });
      // BWT wraps responses in { d: ... } — unwrap.
      result[key] = r.d ?? r;
    } catch (e) {
      result[`${key}Error`] = e.message;
    }
  };
  await safeCall('rankAndTraffic', 'GetRankAndTrafficStats');
  await safeCall('queries', 'GetQueryStats');
  await safeCall('pages', 'GetPageStats');
  await safeCall('crawl', 'GetCrawlStats');
  return result;
}

async function main() {
  const out = { sites: {} };
  for (const site of SITES) {
    const label = site.includes('blog.') ? 'blog' : 'main';
    out.sites[label] = await querySite(site);
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
