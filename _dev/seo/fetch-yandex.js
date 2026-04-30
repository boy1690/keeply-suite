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
 */
'use strict';

const TOKEN = process.env.YANDEX_OAUTH_TOKEN;
if (!TOKEN) {
  console.error('YANDEX_OAUTH_TOKEN env not set');
  process.exit(1);
}

const BASE = 'https://api.webmaster.yandex.net/v4';
const HEADERS = { Authorization: `OAuth ${TOKEN}` };

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
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

async function queryHost(userId, host) {
  const hostId = host.host_id;
  const out = {
    hostId,
    displayUrl: host.unicode_host_url || host.ascii_host_url,
    verified: host.main_mirror?.verified ?? host.verified,
  };
  const safe = async (key, path) => {
    try {
      out[key] = await get(path);
    } catch (e) {
      out[`${key}Error`] = e.message;
    }
  };
  await safe('queries', `/user/${userId}/hosts/${hostId}/search-queries/popular/`);
  await safe('sqi', `/user/${userId}/hosts/${hostId}/sqi-history/`);
  await safe('indexing', `/user/${userId}/hosts/${hostId}/indexing/insearch/history/`);
  await safe('summary', `/user/${userId}/hosts/${hostId}/summary/`);
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
