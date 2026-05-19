#!/usr/bin/env node
/*
 * Schema coverage audit for keeply-blog corpus.
 *
 * Walks `content/{locale}/post/*\/index.md` and reports:
 *   - faq_schema:  per locale present / missing counts + missing slugs
 *   - howto_schema: per locale present / missing slugs (heuristic flag for
 *                  tutorial / onboarding / how-to slugs that SHOULD have one)
 *
 * Why: 2026-05-17 av8d-levelup scan revealed blog.keeply.work homepage scored
 * AEO 5 / 100 partly because list/homepage has no FAQ schema, and many article
 * pages may still ship without faq_schema in frontmatter. This script gives a
 * weekly snapshot to track coverage % across the 6 core locales + 13 auto.
 *
 * Usage:
 *   node _dev/seo/audit-schema-coverage.js                 # summary table
 *   node _dev/seo/audit-schema-coverage.js --missing       # list missing slugs
 *   node _dev/seo/audit-schema-coverage.js --locale zh-tw  # one locale only
 *   node _dev/seo/audit-schema-coverage.js --json          # JSON output
 *
 * Exit codes:
 *   0 = all core locales (en/zh-tw/zh-cn/ja/ko/it) have faq_schema on ≥90% of articles
 *   1 = any core locale below 90% threshold
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, basename } from 'path';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'content');
const CORE_LOCALES = ['english', 'zh-tw', 'zh-cn', 'ja', 'ko', 'it'];
const LOCALE_DISPLAY = {
  english: 'en', 'zh-tw': 'zh-tw', 'zh-cn': 'zh-cn', ja: 'ja', ko: 'ko', it: 'it',
};

// Heuristic: slugs whose names suggest tutorial / how-to / onboarding content
// — these SHOULD carry howto_schema. False-positives OK (warns, not enforces).
const HOWTO_SLUG_PATTERNS = [
  /^install-/, /^how-to-/, /-getting-started/, /-first-week/, /-onboarding/,
  /-tutorial/, /-walkthrough/, /-step-by-step/, /-from-zero/, /^setup-/,
];

function isHowToCandidate(slug) {
  return HOWTO_SLUG_PATTERNS.some(p => p.test(slug));
}

function parseFrontmatter(md) {
  if (!md.startsWith('---')) return {};
  const end = md.indexOf('\n---', 4);
  if (end < 0) return {};
  const fm = md.slice(4, end);
  return {
    hasFaq: /^faq_schema:\s*$/m.test(fm) || /^faq_schema:\s*\n\s+-/m.test(fm),
    hasHowto: /^howto_schema:\s*$/m.test(fm) || /^howto_schema:\s*\n\s+/m.test(fm),
    isDraft: /^draft:\s*true/m.test(fm),
    pillarRole: (fm.match(/^role:\s*(\S+)/m) || [])[1] || null,
  };
}

function scanLocale(localeDir) {
  const postDir = join(CONTENT_DIR, localeDir, 'post');
  let dirs = [];
  try {
    dirs = readdirSync(postDir).filter(d => {
      const p = join(postDir, d);
      try { return statSync(p).isDirectory(); } catch { return false; }
    });
  } catch {
    return null;  // locale dir doesn't exist
  }
  const articles = [];
  for (const slug of dirs) {
    const mdPath = join(postDir, slug, 'index.md');
    let md = '';
    try { md = readFileSync(mdPath, 'utf8'); } catch { continue; }
    const fm = parseFrontmatter(md);
    if (fm.isDraft) continue;
    articles.push({ slug, ...fm });
  }
  return articles;
}

function reportSummary(allData) {
  const rows = [];
  for (const locale of CORE_LOCALES) {
    const articles = allData[locale];
    if (!articles) { rows.push({ locale: LOCALE_DISPLAY[locale], status: 'MISSING DIR' }); continue; }
    const total = articles.length;
    const withFaq = articles.filter(a => a.hasFaq).length;
    const withHowto = articles.filter(a => a.hasHowto).length;
    const howtoCandidates = articles.filter(a => isHowToCandidate(a.slug));
    const howtoCandidatesMissing = howtoCandidates.filter(a => !a.hasHowto).length;
    rows.push({
      locale: LOCALE_DISPLAY[locale],
      total,
      faq: `${withFaq}/${total} (${total ? Math.round(withFaq / total * 100) : 0}%)`,
      howto: `${withHowto}/${total}`,
      howto_candidates_missing: howtoCandidatesMissing,
    });
  }
  return rows;
}

function listMissing(allData) {
  const out = {};
  for (const locale of CORE_LOCALES) {
    const articles = allData[locale];
    if (!articles) continue;
    const display = LOCALE_DISPLAY[locale];
    out[display] = {
      missing_faq: articles.filter(a => !a.hasFaq).map(a => a.slug),
      missing_howto_when_likely: articles
        .filter(a => isHowToCandidate(a.slug) && !a.hasHowto)
        .map(a => a.slug),
    };
  }
  return out;
}

// ─── main ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const json = args.includes('--json');
const showMissing = args.includes('--missing');
const localeArg = args.find(a => a.startsWith('--locale='))?.split('=')[1]
  || (args.indexOf('--locale') >= 0 ? args[args.indexOf('--locale') + 1] : null);
const localesToScan = localeArg
  ? (localeArg === 'en' ? ['english'] : [localeArg]).filter(l => CORE_LOCALES.includes(l))
  : CORE_LOCALES;

const allData = {};
for (const loc of localesToScan) allData[loc] = scanLocale(loc);

const rows = reportSummary(allData);

if (json) {
  console.log(JSON.stringify({
    generated_at: new Date().toISOString(),
    summary: rows,
    missing: showMissing ? listMissing(allData) : null,
  }, null, 2));
} else {
  console.log('# Schema coverage audit\n');
  console.log(`Generated: ${new Date().toISOString()}`);
  console.log(`Scanned: ${localesToScan.length} locales\n`);
  console.log('| Locale | Articles | faq_schema % | howto_schema | Likely-HowTo missing |');
  console.log('|--------|---------:|:-------------|:-------------|---------------------:|');
  for (const r of rows) {
    if (r.status) { console.log(`| ${r.locale} | — | ${r.status} | — | — |`); continue; }
    console.log(`| ${r.locale} | ${r.total} | ${r.faq} | ${r.howto} | ${r.howto_candidates_missing} |`);
  }
  if (showMissing) {
    const m = listMissing(allData);
    console.log('\n## Missing details\n');
    for (const [locale, lists] of Object.entries(m)) {
      if (lists.missing_faq.length === 0 && lists.missing_howto_when_likely.length === 0) continue;
      console.log(`### ${locale}`);
      if (lists.missing_faq.length) {
        console.log(`\n**Missing \`faq_schema:\` (${lists.missing_faq.length})**\n`);
        lists.missing_faq.forEach(s => console.log(`- ${s}`));
      }
      if (lists.missing_howto_when_likely.length) {
        console.log(`\n**Likely-HowTo slugs missing \`howto_schema:\` (${lists.missing_howto_when_likely.length})**\n`);
        lists.missing_howto_when_likely.forEach(s => console.log(`- ${s}`));
      }
      console.log('');
    }
  }
}

// Exit-code threshold: core locale faq coverage < 90% = fail (CI signal).
const fail = rows.some(r => {
  if (r.status || !r.total) return false;
  const pct = parseInt(r.faq.match(/(\d+)%/)?.[1] || '0', 10);
  return pct < 90;
});
process.exit(fail ? 1 : 0);
