#!/usr/bin/env node
/**
 * Surface "retrofit candidates" by joining 28-day GSC data with shipped
 * article content. Implements the post-publish optimization loop that
 * Jerry's SEO playbook (`0.idea/SEO逐字稿整理.md`) and BWF Touch 5 MEASURE
 * both prescribe but neither automate.
 *
 * Logic (per page × query row from GSC):
 *   - position 5..15 AND impressions >= MIN_IMP   → retrofit candidate
 *   - position 1..3                                → good (kept for context)
 *   - position 16..30                              → on-radar (logged)
 *   - position > 30                                → skipped
 *
 * For each retrofit candidate, the script loads the corresponding
 * `content/{locale}/post/{slug}/index.md` and checks whether the query
 * substring appears in:
 *   - frontmatter title  → strongest signal
 *   - any H2 heading     → second-strongest
 *   - body (count)       → third
 *
 * Then classifies action:
 *   - TITLE_ADD       : missing from title + H2 + body → highest-leverage
 *   - H2_ADD          : in body but not title/H2 → medium-leverage
 *   - AMPLIFY         : in title or H2 but body count <= 1 → expand coverage
 *   - SATURATED       : already in title + H2 + body >= 2 → likely competitor
 *                       gap (different problem; skip retrofit, flag for
 *                       backlink / dwell-time work)
 *
 * Output: JSON to stdout. Markdown report is built downstream by
 * `build-retrofit-report.js` (separate from `build-report.js`).
 *
 * Auth: GOOGLE_ADC_JSON same as fetch-gsc.js.
 *
 * Env knobs:
 *   RETROFIT_WINDOW_DAYS   default 28
 *   RETROFIT_MIN_IMP       default 20 (per query, over the window)
 *   RETROFIT_MIN_POS       default 5
 *   RETROFIT_MAX_POS       default 15
 *   RETROFIT_TOP_N         default 10 candidate queries per article
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const ADC_JSON = process.env.GOOGLE_ADC_JSON;
if (!ADC_JSON) {
  console.error('GOOGLE_ADC_JSON env not set');
  process.exit(1);
}

const adc = JSON.parse(ADC_JSON);
const auth = new google.auth.OAuth2(adc.client_id, adc.client_secret);
auth.setCredentials({ refresh_token: adc.refresh_token });
// gcloud-issued ADC (type=authorized_user) requires a quota project on the
// request; OAuth-Playground-issued ADC has no quota_project_id and the API
// accepts it without. Set when present so the same script runs locally and
// in CI without divergence.
if (adc.quota_project_id) auth.quotaProjectId = adc.quota_project_id;

const SITE_URL = 'https://blog.keeply.work/';
// Defaults sized for a young 20-article blog. Tighten (MIN_IMP=20,
// WINDOW=28) once coverage grows and the report becomes noisy.
const WINDOW_DAYS = parseInt(process.env.RETROFIT_WINDOW_DAYS || '90', 10);
const MIN_IMP = parseInt(process.env.RETROFIT_MIN_IMP || '3', 10);
const MIN_POS = parseFloat(process.env.RETROFIT_MIN_POS || '5');
const MAX_POS = parseFloat(process.env.RETROFIT_MAX_POS || '30');
const TOP_N = parseInt(process.env.RETROFIT_TOP_N || '10', 10);

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const daysAgo = (n) => fmt(new Date(today.getTime() - n * 86400000));
const RANGE = { startDate: daysAgo(WINDOW_DAYS + 1), endDate: daysAgo(1) };

// URL locale slug → content directory name. en is the only mismatch.
const LOCALE_DIR = {
  'zh-tw': 'zh-tw',
  'en': 'english',
  'zh-cn': 'zh-cn',
  'ja': 'ja',
  'ko': 'ko',
  'it': 'it',
};

// Parse "https://blog.keeply.work/zh-tw/post/foo-bar/" → {locale, slug}
function parsePageUrl(url) {
  const m = url.match(/^https:\/\/blog\.keeply\.work\/([a-z-]+)\/post\/([^/]+)\/?$/);
  if (!m) return null;
  const [, locale, slug] = m;
  if (!LOCALE_DIR[locale]) return null;
  return { locale, slug };
}

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const contentPath = (locale, slug) =>
  path.join(REPO_ROOT, 'content', LOCALE_DIR[locale], 'post', slug, 'index.md');

const articleCache = new Map();
function loadArticle(locale, slug) {
  const key = `${locale}/${slug}`;
  if (articleCache.has(key)) return articleCache.get(key);
  const fp = contentPath(locale, slug);
  if (!fs.existsSync(fp)) {
    articleCache.set(key, null);
    return null;
  }
  const raw = fs.readFileSync(fp, 'utf8');
  const fmEnd = raw.indexOf('\n---', 4);
  const frontmatter = fmEnd > 0 ? raw.slice(4, fmEnd) : '';
  const body = fmEnd > 0 ? raw.slice(fmEnd + 4) : raw;
  const titleMatch = frontmatter.match(/^title:\s*"?([^"\n]+)"?/m);
  const title = titleMatch ? titleMatch[1] : '';
  const h2s = [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  const article = { title, h2s, body, fp };
  articleCache.set(key, article);
  return article;
}

// Case-insensitive substring count. For zh queries the case-folding is
// a no-op but doesn't hurt.
function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  let count = 0, i = 0;
  while ((i = h.indexOf(n, i)) !== -1) { count++; i += n.length; }
  return count;
}

function classifyQuery(query, article) {
  if (!article) return { action: 'NO_ARTICLE', evidence: {} };
  const inTitle = countOccurrences(article.title, query) > 0;
  const inH2 = article.h2s.some((h) => countOccurrences(h, query) > 0);
  const bodyCount = countOccurrences(article.body, query);
  const evidence = { inTitle, inH2, bodyCount };
  if (!inTitle && !inH2 && bodyCount === 0) return { action: 'TITLE_ADD', evidence };
  if (!inTitle && !inH2 && bodyCount >= 1) return { action: 'H2_ADD', evidence };
  if ((inTitle || inH2) && bodyCount <= 1) return { action: 'AMPLIFY', evidence };
  return { action: 'SATURATED', evidence };
}

async function fetchPageQueryRows(searchconsole) {
  // GSC caps single response at 25,000 rows. For a 23-article × 6-locale
  // site that's well under. If we ever cross, paginate via startRow.
  const r = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      ...RANGE,
      dimensions: ['page', 'query'],
      rowLimit: 25000,
    },
  });
  return r.data.rows || [];
}

function summarize(rows) {
  // Group by article → collect queries → classify each.
  const byArticle = new Map();
  let skippedNoMatch = 0;
  let skippedNoArticle = 0;
  for (const row of rows) {
    const [pageUrl, query] = row.keys;
    const parsed = parsePageUrl(pageUrl);
    if (!parsed) { skippedNoMatch++; continue; }
    const { locale, slug } = parsed;
    const key = `${locale}/${slug}`;
    if (!byArticle.has(key)) {
      byArticle.set(key, {
        locale, slug, pageUrl,
        article: loadArticle(locale, slug),
        candidates: [], good: [], onRadar: [], saturated: [],
      });
    }
    const bucket = byArticle.get(key);
    if (!bucket.article) skippedNoArticle++;
    const pos = row.position;
    const imp = row.impressions;
    const clicks = row.clicks;
    const ctr = row.ctr;
    const item = { query, position: pos, impressions: imp, clicks, ctr };

    if (pos <= 3 && imp >= MIN_IMP) {
      bucket.good.push(item);
    } else if (pos >= MIN_POS && pos <= MAX_POS && imp >= MIN_IMP) {
      const { action, evidence } = classifyQuery(query, bucket.article);
      item.action = action;
      item.evidence = evidence;
      if (action === 'SATURATED') bucket.saturated.push(item);
      else bucket.candidates.push(item);
    } else if (pos > MAX_POS && pos <= 30 && imp >= MIN_IMP) {
      bucket.onRadar.push(item);
    }
  }

  // Sort candidates within each article by impressions desc, cap to TOP_N.
  const articles = [];
  for (const bucket of byArticle.values()) {
    bucket.candidates.sort((a, b) => b.impressions - a.impressions);
    bucket.candidates = bucket.candidates.slice(0, TOP_N);
    bucket.good.sort((a, b) => b.impressions - a.impressions);
    bucket.good = bucket.good.slice(0, 5);
    bucket.onRadar.sort((a, b) => b.impressions - a.impressions);
    bucket.onRadar = bucket.onRadar.slice(0, 5);
    if (bucket.article) delete bucket.article;
    articles.push(bucket);
  }

  // Site-level ranking of articles by retrofit leverage:
  // sum of impressions of TITLE_ADD + H2_ADD candidates.
  const score = (a) => a.candidates
    .filter((c) => c.action === 'TITLE_ADD' || c.action === 'H2_ADD')
    .reduce((s, c) => s + c.impressions, 0);
  articles.sort((a, b) => score(b) - score(a));

  return {
    window: RANGE,
    thresholds: { MIN_IMP, MIN_POS, MAX_POS, TOP_N },
    totals: {
      rowsFromGsc: rows.length,
      articlesWithData: articles.length,
      skippedNoUrlMatch: skippedNoMatch,
      articlesMissingContent: skippedNoArticle,
    },
    articles,
  };
}

async function main() {
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const rows = await fetchPageQueryRows(searchconsole);
  const summary = summarize(rows);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
