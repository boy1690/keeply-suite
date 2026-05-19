#!/usr/bin/env node
/**
 * Content staleness audit — flag articles whose dateModified (or date,
 * if dateModified absent) is more than STALE_DAYS old.
 *
 * SEO motivation: Google rewards fresh content within the article's
 * "fresh window" — for evergreen topics that's ~12 months. Stale
 * articles silently lose rankings to competitors. Surfacing them
 * lets us triage: refresh (update dateModified + minor content edit)
 * vs retire (move to /archive/ or noindex).
 *
 * Output: JSON to stdout, sorted by stalest-first.
 * Exit code 0 always (informational, not a CI gate).
 *
 * Env:
 *   STALE_DAYS    default 365
 *
 * Run:
 *   node _dev/seo/audit-content-staleness.js
 *   STALE_DAYS=180 node _dev/seo/audit-content-staleness.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const STALE_DAYS = parseInt(process.env.STALE_DAYS || '365', 10);
const STALE_MS = STALE_DAYS * 86400000;

const LOCALES = {
  en: 'content/english/post',
  'zh-tw': 'content/zh-tw/post',
  'zh-cn': 'content/zh-cn/post',
  ja: 'content/ja/post',
  ko: 'content/ko/post',
  it: 'content/it/post',
};

function readFrontmatter(md) {
  md = md.replace(/\r\n/g, '\n');
  const m = md.match(/^---\n([\s\S]+?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    out[kv[1]] = v;
  }
  return out;
}

function* walkArticles(localeDir, locale) {
  if (!fs.existsSync(localeDir)) return;
  const now = Date.now();
  for (const slug of fs.readdirSync(localeDir)) {
    const dir = path.join(localeDir, slug);
    const md = path.join(dir, 'index.md');
    if (!fs.existsSync(md) || !fs.statSync(dir).isDirectory()) continue;
    const fm = readFrontmatter(fs.readFileSync(md, 'utf8'));
    if (fm.draft === 'true') continue;
    if (fm.date) {
      const t = Date.parse(fm.date);
      if (!Number.isNaN(t) && t > now) continue;
    }
    yield { slug, locale, fm };
  }
}

function main() {
  const now = Date.now();
  const results = [];
  for (const [locale, dir] of Object.entries(LOCALES)) {
    for (const a of walkArticles(dir, locale)) {
      const lastTouched = a.fm.lastmod || a.fm.dateModified || a.fm.date;
      const t = lastTouched ? Date.parse(lastTouched) : null;
      if (!t || Number.isNaN(t)) continue;
      const ageDays = Math.round((now - t) / 86400000);
      if (ageDays >= STALE_DAYS) {
        results.push({
          locale,
          slug: a.slug,
          last_touched: lastTouched,
          age_days: ageDays,
          title: a.fm.title?.slice(0, 80),
        });
      }
    }
  }
  results.sort((a, b) => b.age_days - a.age_days);

  // Group by slug across locales for action planning
  const bySlug = {};
  for (const r of results) {
    if (!bySlug[r.slug]) bySlug[r.slug] = { slug: r.slug, locales: [], max_age_days: 0, title: r.title };
    bySlug[r.slug].locales.push(r.locale);
    bySlug[r.slug].max_age_days = Math.max(bySlug[r.slug].max_age_days, r.age_days);
  }

  const out = {
    generated_at: new Date().toISOString(),
    threshold_days: STALE_DAYS,
    stale_count: results.length,
    stale_slugs: Object.keys(bySlug).length,
    by_slug: Object.values(bySlug).sort((a, b) => b.max_age_days - a.max_age_days),
  };
  console.log(JSON.stringify(out, null, 2));
}

main();
