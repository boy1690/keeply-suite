#!/usr/bin/env node
/**
 * Combine fetched JSON from all four platforms + health checks into a
 * markdown report. Designed to be the body of a GitHub Issue.
 *
 * Reads JSON from /tmp/seo-data/{gsc,bwt,yandex,ga4,health}.json (paths
 * configurable via SEO_DATA_DIR env). Missing files are tolerated —
 * the corresponding section just notes the failure.
 *
 * Output: markdown to stdout.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.SEO_DATA_DIR || '/tmp/seo-data';
const load = (name) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8'));
  } catch (e) {
    return { __loadError: e.message };
  }
};

const gsc = load('gsc.json');
const bwt = load('bwt.json');
const yandex = load('yandex.json');
const ga4 = load('ga4.json');
const health = load('health.json');

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const weekStart = fmt(new Date(today.getTime() - 7 * 86400000));
const weekEnd = fmt(today);

const lines = [];
const p = (s = '') => lines.push(s);

const num = (n) => (typeof n === 'number' ? n.toLocaleString() : n ?? '—');
const pct = (n) => (typeof n === 'number' ? (n * 100).toFixed(2) + '%' : '—');
const delta = (curr, prev) => {
  if (!prev) return curr ? '🆕' : '—';
  const d = ((curr - prev) / prev) * 100;
  if (Math.abs(d) < 1) return '~';
  const sign = d > 0 ? '↑' : '↓';
  return `${sign}${Math.abs(d).toFixed(0)}%`;
};

// ─── Header ──────────────────────────────────────────────────────────
p(`# SEO Weekly Report — ${fmt(today)}`);
p();
p(`**Window:** ${weekStart} → ${weekEnd}  (vs previous 7 days)`);
p(`**Properties:** \`keeply.work\`, \`blog.keeply.work\``);
p();
p('---');
p();

// ─── Executive summary (GSC totals across both sites) ────────────────
p('## 📊 Executive summary');
p();
if (gsc.__loadError || !gsc.sites) {
  p(`⚠️ GSC data unavailable: ${gsc.__loadError || gsc.error || 'no sites'}`);
} else {
  p('| Site | Clicks | Impressions | CTR | Avg position |');
  p('|---|---|---|---|---|');
  for (const [label, data] of Object.entries(gsc.sites)) {
    if (data.error) {
      p(`| ${label} | _error: ${data.error}_ |  |  |  |`);
      continue;
    }
    const c = data.current?.agg || {};
    const pr = data.previous?.agg || {};
    p(
      `| **${label}** | ${num(c.clicks)} (${delta(c.clicks, pr.clicks)}) | ${num(
        c.impressions
      )} (${delta(c.impressions, pr.impressions)}) | ${pct(c.ctr)} | ${
        c.position?.toFixed(1) ?? '—'
      } |`
    );
  }
}
p();

// ─── GSC details ─────────────────────────────────────────────────────
p('## 🔎 Google Search Console');
p();
if (!gsc.sites) {
  p('_(skipped — fetch failed)_');
} else {
  for (const [label, data] of Object.entries(gsc.sites)) {
    p(`### ${label} (\`${data.siteUrl || ''}\`)`);
    p();
    if (data.error) {
      p(`⚠️ ${data.error}`);
      p();
      continue;
    }

    if (data.current?.queries?.length) {
      p('**Top queries this week**');
      p();
      p('| Query | Clicks | Impressions | CTR | Position |');
      p('|---|---|---|---|---|');
      for (const r of data.current.queries.slice(0, 10)) {
        p(
          `| ${r.keys?.[0] || '—'} | ${num(r.clicks)} | ${num(
            r.impressions
          )} | ${pct(r.ctr)} | ${r.position?.toFixed(1) ?? '—'} |`
        );
      }
      p();
    }

    // High-impression-low-CTR opportunities
    const opportunities = (data.current?.queries || [])
      .filter((r) => r.impressions > 50 && (r.ctr || 0) < 0.02)
      .slice(0, 5);
    if (opportunities.length) {
      p('**Low-CTR opportunities** (impressions > 50, CTR < 2% — title rewrite candidates)');
      p();
      p('| Query | Impressions | CTR | Position |');
      p('|---|---|---|---|');
      for (const r of opportunities) {
        p(
          `| ${r.keys?.[0] || '—'} | ${num(r.impressions)} | ${pct(
            r.ctr
          )} | ${r.position?.toFixed(1) ?? '—'} |`
        );
      }
      p();
    }

    if (data.current?.pages?.length) {
      p('**Top pages this week**');
      p();
      p('| Page | Clicks | Impressions |');
      p('|---|---|---|');
      for (const r of data.current.pages.slice(0, 10)) {
        const url = r.keys?.[0] || '—';
        p(`| ${url} | ${num(r.clicks)} | ${num(r.impressions)} |`);
      }
      p();
    }

    if (data.sitemaps?.length) {
      p('**Sitemaps**');
      p();
      p('| Path | Submitted URLs | Errors | Warnings |');
      p('|---|---|---|---|');
      for (const s of data.sitemaps) {
        p(`| ${s.path} | ${num(s.contents)} | ${s.errors ?? 0} | ${s.warnings ?? 0} |`);
      }
      p();
    }
  }
}

// ─── GA4 ─────────────────────────────────────────────────────────────
p('## 🚦 Google Analytics 4');
p();
if (ga4.__loadError) {
  p(`⚠️ GA4 unavailable: ${ga4.__loadError}`);
} else {
  if (ga4.byHost?.length) {
    p('**Sessions by host (current vs previous 7d)**');
    p();
    // GA4 returns rows with dateRange dimension when 2 ranges given
    const hostMap = {};
    for (const r of ga4.byHost) {
      const dims = r.dimensionValues || [];
      const host = dims[0]?.value || '';
      const dateRange = r.dimensionValues?.find?.((d, i) => i === 1)?.value;
      // GA4 puts dateRange last when multiple ranges
      const rangeName = r.dimensionValues?.slice(-1)[0]?.value;
      hostMap[host] = hostMap[host] || {};
      const metrics = r.metricValues?.map((m) => Number(m.value)) || [];
      hostMap[host][rangeName] = {
        sessions: metrics[0],
        users: metrics[1],
        engaged: metrics[2],
        pageViews: metrics[3],
      };
    }
    p('| Host | Sessions | Users | Page views |');
    p('|---|---|---|---|');
    for (const [host, ranges] of Object.entries(hostMap)) {
      const c = ranges.current || {};
      const pr = ranges.previous || {};
      p(
        `| ${host} | ${num(c.sessions)} (${delta(
          c.sessions,
          pr.sessions
        )}) | ${num(c.users)} (${delta(c.users, pr.users)}) | ${num(c.pageViews)} (${delta(c.pageViews, pr.pageViews)}) |`
      );
    }
    p();
  } else if (ga4.byHostError) {
    p(`⚠️ byHost: ${ga4.byHostError}`);
    p();
  }

  if (ga4.organic?.length) {
    p('**Organic Search sessions by host**');
    p();
    p('| Host | Sessions (current) | Users (current) |');
    p('|---|---|---|');
    for (const r of ga4.organic) {
      const dims = r.dimensionValues?.map((d) => d.value) || [];
      const metrics = r.metricValues?.map((m) => Number(m.value)) || [];
      p(`| ${dims[1] || dims[0]} | ${num(metrics[0])} | ${num(metrics[1])} |`);
    }
    p();
  }

  if (ga4.topPages?.length) {
    p('**Top pages this week**');
    p();
    p('| Host | Path | Sessions | Page views |');
    p('|---|---|---|---|');
    for (const r of ga4.topPages.slice(0, 10)) {
      const dims = r.dimensionValues?.map((d) => d.value) || [];
      const metrics = r.metricValues?.map((m) => Number(m.value)) || [];
      p(`| ${dims[0]} | ${dims[1]} | ${num(metrics[0])} | ${num(metrics[1])} |`);
    }
    p();
  }
}

// ─── Bing ────────────────────────────────────────────────────────────
p('## 🟧 Bing Webmaster');
p();
if (bwt.__loadError || !bwt.sites) {
  p(`⚠️ BWT unavailable: ${bwt.__loadError || 'no sites'}`);
} else {
  for (const [label, data] of Object.entries(bwt.sites)) {
    p(`### ${label}`);
    p();
    const queries = Array.isArray(data.queries) ? data.queries.slice(0, 10) : [];
    if (queries.length) {
      p('**Top queries**');
      p();
      p('| Query | Clicks | Impressions | Avg position |');
      p('|---|---|---|---|');
      for (const q of queries) {
        p(
          `| ${q.Query || '—'} | ${num(q.Clicks)} | ${num(q.Impressions)} | ${q.AvgImpressionPosition?.toFixed?.(1) ?? '—'} |`
        );
      }
      p();
    }
    if (data.queriesError) {
      p(`⚠️ queries: ${data.queriesError}`);
      p();
    }
    if (Array.isArray(data.crawl) && data.crawl.length) {
      const total = data.crawl.reduce((sum, d) => sum + (d.CrawledPages || 0), 0);
      p(`**Crawl activity (recent window):** ${num(total)} pages crawled`);
      p();
    }
  }
}

// ─── Yandex ──────────────────────────────────────────────────────────
p('## 🟪 Yandex Webmaster');
p();
if (yandex.__loadError || yandex.error) {
  p(`⚠️ Yandex unavailable: ${yandex.__loadError || yandex.error}`);
} else if (!yandex.hosts) {
  p('_(no hosts returned — verify token scope)_');
} else {
  for (const [host, data] of Object.entries(yandex.hosts)) {
    p(`### ${host}`);
    p();
    if (data.summary) {
      const s = data.summary;
      p(`**SQI**: ${s.sqi ?? '—'}  |  **Verified**: ${data.verified ?? '?'}`);
      p();
    }
    const queries = data.queries?.queries || [];
    if (queries.length) {
      p('**Popular queries**');
      p();
      p('| Query | Demand | Clicks | Impressions |');
      p('|---|---|---|---|');
      for (const q of queries.slice(0, 10)) {
        p(`| ${q.query_text || q.text || '—'} | ${num(q.demand?.value)} | ${num(q.indicators?.TOTAL_CLICKS)} | ${num(q.indicators?.TOTAL_SHOWS)} |`);
      }
      p();
    }
    if (data.queriesError) {
      p(`⚠️ queries: ${data.queriesError}`);
      p();
    }
  }
}

// ─── External health ─────────────────────────────────────────────────
p('## 🩺 External health');
p();
if (health.__loadError || !health.sites) {
  p(`⚠️ Health checks unavailable: ${health.__loadError || 'no sites'}`);
} else {
  p('| Site | Sitemap | Type | URLs | robots.txt | IndexNow key | Yandex file | DNS TXT |');
  p('|---|---|---|---|---|---|---|---|');
  for (const [label, h] of Object.entries(health.sites)) {
    const ok = (probe) => (probe?.ok ? '✅' : `❌ ${probe?.status ?? probe?.error ?? '?'}`);
    const dnsHost = label === 'blog' ? 'blog.keeply.work' : 'keeply.work';
    const dns = health.dns?.[dnsHost];
    const dnsOk = dns?.yandexVerificationFound ? '✅' : '❌';
    const typeLabel = h.sitemapType === 'index'
      ? `index (${h.childSitemapCount} children)`
      : (h.sitemapType || '—');
    p(
      `| ${label} | ${ok(h.sitemap)} | ${typeLabel} | ${num(h.sitemapUrlCount)} | ${ok(h.robotsTxt)} | ${ok(h.indexNowKey)} | ${ok(h.yandexFile)} | ${dnsOk} |`
    );
  }
  p();

  // CSP drift detection
  for (const [label, h] of Object.entries(health.sites)) {
    if (h.csp && (!h.csp.hasGooglesTagManager || !h.csp.hasGoogleAnalytics)) {
      p(`⚠️ ${label} CSP missing GA origins — googletagmanager: ${h.csp.hasGooglesTagManager}, google-analytics: ${h.csp.hasGoogleAnalytics}`);
    }
  }
}
p();

// ─── Action items (synthesized) ───────────────────────────────────────
p('## 🎯 Suggested actions this week');
p();
const actions = [];

// Action: low-CTR opportunities
for (const [label, data] of Object.entries(gsc.sites || {})) {
  const opps = (data.current?.queries || []).filter(
    (r) => r.impressions > 100 && (r.ctr || 0) < 0.015
  );
  if (opps.length) {
    actions.push(
      `- **[${label}]** ${opps.length} query/-ies with > 100 impressions but < 1.5% CTR. Consider rewriting matching page titles.`
    );
  }
}

// Action: sitemap URL drift. health-check.js sums URLs across sitemap-index
// children, so these counts reflect real submitted-URL volume regardless
// of whether the sitemap is flat or an index.
const blogHealth = health.sites?.blog || {};
const mainHealth = health.sites?.main || {};
const blogCount = blogHealth.sitemapUrlCount;
const mainCount = mainHealth.sitemapUrlCount;
if (blogCount && blogCount < 50) {
  actions.push(`- ⚠️ blog sitemap dropped to ${blogCount} URLs — investigate broken build`);
}
if (mainCount && mainCount < 100) {
  actions.push(`- ⚠️ main site sitemap dropped to ${mainCount} URLs — investigate`);
}

// Structural integrity: blog sitemap-index should list all 6 core locales.
// Per layouts/sitemapindex.xml — drift here means a locale was dropped from
// the core publishing set or the template regressed.
const EXPECTED_CORE = 6;
if (blogHealth.sitemapType === 'index' && blogHealth.childSitemapCount != null
    && blogHealth.childSitemapCount < EXPECTED_CORE) {
  actions.push(
    `- ⚠️ blog sitemap-index lists ${blogHealth.childSitemapCount}/${EXPECTED_CORE} core locales — check layouts/sitemapindex.xml`
  );
}

// Action: organic search trend
const organic = ga4.organic || [];
const organicTotal = organic.reduce((s, r) => s + Number(r.metricValues?.[0]?.value || 0), 0);
if (organicTotal === 0) {
  actions.push('- ℹ️ Organic Search sessions still 0 — expected for new property; sitemap submitted, IndexNow pinging.');
}

if (actions.length) {
  for (const a of actions) p(a);
} else {
  p('_No urgent items detected._');
}
p();
p('---');
p();
p(
  `_Generated ${today.toISOString()} by \`_dev/seo/build-report.js\`. Sources: GSC + GA4 (service account), BWT (API key), Yandex (OAuth), external HTTP probes._`
);

process.stdout.write(lines.join('\n'));
