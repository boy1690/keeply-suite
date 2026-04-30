#!/usr/bin/env node
/**
 * External HTTP health probes for both Keeply sites.
 *
 * No auth required — these are all publicly fetchable. Catches drift in:
 *   - Sitemap availability + URL count (regression detection)
 *   - robots.txt declares Sitemap correctly
 *   - IndexNow ownership-proof file still served at root
 *   - Yandex DNS-method backup verification files still served (defence-in-depth)
 *   - Cloudflare CSP header hasn't lost any required origins
 *
 * Output: JSON to stdout.
 */
'use strict';

const SITES = {
  blog: {
    base: 'https://blog.keeply.work',
    indexNowKey: 'ae904ebe06616630b93d07cff2d64afb',
    yandexCode: '93bf441a67605176',
  },
  main: {
    base: 'https://keeply.work',
    indexNowKey: '65439d009e66d54f18da6c854ec6cb3a',
    yandexCode: 'f1396b4e752c6afc',
  },
};

async function probe(url, opts = {}) {
  const start = Date.now();
  try {
    const res = await fetch(url, { redirect: 'manual', ...opts });
    const headers = {};
    for (const [k, v] of res.headers) headers[k.toLowerCase()] = v;
    return {
      url,
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
      contentType: headers['content-type'],
      ms: Date.now() - start,
    };
  } catch (e) {
    return { url, error: e.message, ms: Date.now() - start };
  }
}

async function fetchText(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function checkSite(site, cfg) {
  const out = { site };
  out.sitemap = await probe(`${cfg.base}/sitemap.xml`);
  out.robotsTxt = await probe(`${cfg.base}/robots.txt`);
  out.indexNowKey = await probe(`${cfg.base}/${cfg.indexNowKey}.txt`);
  out.yandexFile = await probe(`${cfg.base}/yandex_${cfg.yandexCode}.html`);

  // Sitemap URL count (regression signal)
  const sitemapText = await fetchText(`${cfg.base}/sitemap.xml`);
  if (sitemapText) {
    out.sitemapUrlCount = (sitemapText.match(/<loc>/g) || []).length;
  }

  // robots.txt declares Sitemap line
  const robotsText = await fetchText(`${cfg.base}/robots.txt`);
  if (robotsText) {
    const sitemapDecls = (robotsText.match(/^Sitemap:\s+\S+/gm) || []);
    out.robotsHasSitemap = sitemapDecls.length > 0;
    out.robotsSitemaps = sitemapDecls;
  }

  // Cloudflare CSP — ensure GA4 origins still allowed
  const headRes = await fetch(`${cfg.base}/`, { redirect: 'manual' });
  const csp = headRes.headers.get('content-security-policy') || '';
  out.csp = {
    hasGooglesTagManager: csp.includes('googletagmanager.com'),
    hasGoogleAnalytics: csp.includes('google-analytics.com'),
    raw: csp.length > 0,
  };

  return out;
}

async function checkDns() {
  // Use Cloudflare DoH to verify Yandex TXT records still in DNS
  const out = {};
  for (const host of ['keeply.work', 'blog.keeply.work']) {
    try {
      const res = await fetch(
        `https://1.1.1.1/dns-query?name=${host}&type=TXT`,
        { headers: { accept: 'application/dns-json' } }
      );
      const j = await res.json();
      const records = (j.Answer || [])
        .map((a) => a.data)
        .filter((d) => /yandex-verification/i.test(d));
      out[host] = { yandexVerificationFound: records.length > 0, records };
    } catch (e) {
      out[host] = { error: e.message };
    }
  }
  return out;
}

async function main() {
  const out = { sites: {} };
  for (const [label, cfg] of Object.entries(SITES)) {
    out.sites[label] = await checkSite(label, cfg);
  }
  out.dns = await checkDns();
  out.checkedAt = new Date().toISOString();
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
