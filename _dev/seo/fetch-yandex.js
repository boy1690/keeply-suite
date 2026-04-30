#!/usr/bin/env node
/**
 * Fetch Yandex Webmaster data for both Keeply sites.
 *
 * Output: JSON to stdout.
 * Auth: YANDEX_OAUTH_TOKEN env var. The script self-discovers user_id via
 * the /user/ endpoint, so no separate Yandex User ID secret is needed.
 *
 * API base: https://api.webmaster.yandex.net/v4
 * Docs: https://yandex.com/dev/webmaster/
 *
 * Two API quirks worth knowing:
 *   - host_id has format `https:blog.keeply.work:443` — the colons need
 *     URL-encoding when placed in the path.
 *   - /search-queries/popular/ requires `order_by` AND `query_indicator`
 *     query params; without them you get a 400 FIELD_VALIDATION_ERROR.
 */
'use strict';

const TOKEN = process.env.YANDEX_OAUTH_TOKEN;
if (!TOKEN) {
  console.error('YANDEX_OAUTH_TOKEN env not set');
  process.exit(1);
}

const BASE = 'https://api.webmaster.yandex.net/v4';
const HEADERS = { Authorization: `OAuth ${TOKEN}` };

async function get(path, params) {
  let url = `${BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += (path.includes('?') ? '&' : '?') + qs;
  }
  const res = await fetch(url, { headers: HEADERS });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GET ${path} HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`GET ${path} non-JSON: ${text.slice(0, 200)}`);
  }
}

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const daysAgo = (n) => fmt(new Date(today.getTime() - n * 86400000));

async function queryHost(userId, host) {
  const hostId = host.host_id;
  const hostIdEnc = encodeURIComponent(hostId);
  const out = {
    hostId,
    displayUrl: host.unicode_host_url || host.ascii_host_url,
    verified: host.main_mirror?.verified ?? host.verified,
  };
  const safe = async (key, path, params) => {
    try {
      out[key] = await get(path, params);
    } catch (e) {
      out[`${key}Error`] = e.message;
    }
  };

  // Popular search queries — TOTAL_SHOWS dimension required.
  await safe(
    'queries',
    `/user/${userId}/hosts/${hostIdEnc}/search-queries/popular/`,
    { order_by: 'TOTAL_SHOWS', query_indicator: 'TOTAL_SHOWS' }
  );

  // SQI history needs a date range; default last 30 days.
  await safe(
    'sqi',
    `/user/${userId}/hosts/${hostIdEnc}/sqi-history/`,
    { date_from: daysAgo(30), date_to: daysAgo(0) }
  );

  // Indexing-in-search history: same date pattern.
  await safe(
    'indexing',
    `/user/${userId}/hosts/${hostIdEnc}/indexing/insearch/history/`,
    { date_from: daysAgo(30), date_to: daysAgo(0) }
  );

  await safe('summary', `/user/${userId}/hosts/${hostIdEnc}/summary/`);
  return out;
}

async function main() {
  const out = {};
  try {
    const user = await get('/user/');
    out.userId = user.user_id;
    const hostsResp = await get(`/user/${out.userId}/hosts/`);
    const hosts = hostsResp.hosts || [];
    out.hosts = {};
    for (const h of hosts) {
      const display = h.unicode_host_url || h.ascii_host_url;
      out.hosts[display] = await queryHost(out.userId, h);
    }
  } catch (e) {
    out.error = e.message;
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
