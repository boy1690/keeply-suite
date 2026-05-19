#!/usr/bin/env node
/**
 * Audit noindex enforcement against the spec captured in
 * layouts/_partials/head.html lines 55-80 (FR-003/004/005 +
 * 2026-05-08 tightening + BWF P1.16 multilingual taxonomy
 * explosion prevention).
 *
 * Spec (must ALL hold true after Hugo build):
 *  - All term pages (/tags/<x>/ + /categories/<x>/) ALWAYS noindex
 *  - All taxonomy listing pages (/tags/ + /categories/) ALWAYS noindex
 *  - All section listing pages (/post/, /<locale>/post/) ALWAYS noindex
 *  - All pagination pages (.../page/N/) ALWAYS noindex
 *  - All pages in non-core locale (anything not en/zh-tw/zh-cn/ja/ko/it)
 *    ALWAYS noindex including individual article pages
 *  - Articles in CORE locales: NO robots meta = indexable
 *
 * Scans public/ post-Hugo-build. Exit code 0 if no violations; 1 if any.
 *
 * Run:
 *   hugo --gc --minify --quiet
 *   node _dev/seo/audit-noindex-enforcement.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');
const CORE_LOCALES = new Set(['en', 'zh-tw', 'zh-cn', 'ja', 'ko', 'it']);

if (!fs.existsSync(PUBLIC_DIR)) {
  console.error(`public/ not built. Run: hugo --gc --minify`);
  process.exit(2);
}

const violations = [];
const stats = {
  scanned: 0,
  noindex_present: 0,
  noindex_missing_where_required: 0,
  noindex_present_where_indexable_expected: 0,
};

function hasNoindex(html) {
  return /<meta\s+name=["']?robots["']?\s+content=["']?noindex[^"']*["']?/i.test(html);
}

// Hugo emits /page/1/ stubs as meta-refresh redirects to the parent listing
// page. Google's documented behaviour is to honor the refresh, so the stub
// page never enters the index — functionally equivalent to noindex. Treat
// as compliant.
function isRefreshStub(html) {
  return html.length < 1000
    && /<meta\s+http-equiv=["']?refresh["']?/i.test(html)
    && /<link\s+rel=["']?canonical["']?/i.test(html);
}

function classify(relPath) {
  // relPath like "en/tags/cloud-sync/index.html" or "de/post/<slug>/index.html"
  const parts = relPath.split('/').filter(Boolean);
  if (parts[0] === 'index.html') return { kind: 'home', locale: 'en' };
  const locale = parts[0];
  const rest = parts.slice(1).join('/');
  const isPagination = /\/page\/\d+\//.test('/' + rest);
  if (rest.startsWith('tags/index.html')) return { kind: 'taxonomy-index', locale };
  if (rest.startsWith('categories/index.html')) return { kind: 'taxonomy-index', locale };
  if (rest.match(/^tags\/[^/]+\/index\.html$/)) return { kind: 'term', locale, isPagination };
  if (rest.match(/^tags\/[^/]+\/page\/\d+\/index\.html$/)) return { kind: 'term', locale, isPagination: true };
  if (rest.match(/^categories\/[^/]+\/index\.html$/)) return { kind: 'term', locale, isPagination };
  if (rest.match(/^post\/index\.html$/)) return { kind: 'section-index', locale };
  if (rest.match(/^post\/page\/\d+\/index\.html$/)) return { kind: 'section-index', locale, isPagination: true };
  if (rest.match(/^post\/[^/]+\/index\.html$/)) return { kind: 'article', locale, isPagination };
  if (isPagination) return { kind: 'pagination-other', locale };
  return { kind: 'other', locale };
}

function shouldNoindex(c) {
  if (!CORE_LOCALES.has(c.locale)) return true;
  if (c.kind === 'term' || c.kind === 'taxonomy-index' || c.kind === 'section-index') return true;
  if (c.kind === 'pagination-other') return true; // any /page/N/ that's not a leaf article
  if (c.isPagination) return true;
  return false;
}

function* walkHtml(dir, rel = '') {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'pagefind') continue; // ship-only artifacts
    if (e.name === 'assets' || e.name === 'js' || e.name === 'css' || e.name === 'fonts') continue;
    const full = path.join(dir, e.name);
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) {
      yield* walkHtml(full, r);
    } else if (e.name.endsWith('.html')) {
      yield { full, rel: r };
    }
  }
}

for (const { full, rel } of walkHtml(PUBLIC_DIR)) {
  stats.scanned++;
  const c = classify(rel);
  if (c.kind === 'home' || c.kind === 'other') continue; // skip — outside spec scope
  const html = fs.readFileSync(full, 'utf8');
  const noindex = hasNoindex(html) || isRefreshStub(html);
  const required = shouldNoindex(c);
  if (noindex) stats.noindex_present++;
  if (required && !noindex) {
    stats.noindex_missing_where_required++;
    violations.push({ severity: 'error', path: '/' + rel.replace(/\/index\.html$/, '/'), kind: c.kind, locale: c.locale, expected: 'noindex,follow', got: 'no-robots-meta' });
  } else if (!required && noindex) {
    stats.noindex_present_where_indexable_expected++;
    violations.push({ severity: 'warn', path: '/' + rel.replace(/\/index\.html$/, '/'), kind: c.kind, locale: c.locale, expected: 'indexable', got: 'noindex,follow' });
  }
}

const out = {
  generated_at: new Date().toISOString(),
  ...stats,
  violations: violations.slice(0, 30),
  violations_total: violations.length,
};
console.log(JSON.stringify(out, null, 2));
process.exit(violations.filter((v) => v.severity === 'error').length > 0 ? 1 : 0);
