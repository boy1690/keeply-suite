#!/usr/bin/env node
/**
 * Pre-publish SEO lint for keeply.work (Ahrefs RC prevention).
 *
 * Runs on the BUILT output and fails (exit 1) if any of the root causes from
 * the 2026-05 Ahrefs crawls could reappear. Wire into `npm run build` tail or
 * CI so a regression can never be published. Companion to the build
 * normalizers (clean-static / clean-links / clean-email) — those FIX, this
 * GUARDS (catches new page types / locales that slip past the normalizers).
 *
 * Checks:
 *   1. RC-3/6  — no `.html` in any sitemap <loc>.
 *   2. RC-4    — no `href="mailto:"` in any built page (route to /contact).
 *   3. RC-9    — every standard page (root + 21 locales) carries the canonical,
 *                reciprocal hreflang set: 21 per-locale + x-default→page-root.
 *   4. RC-7/8  — tool/standalone pages: JSON-LD has no `.html` and isPartOf→
 *                #website (not #organization); page has ≥1 static <a href>.
 *
 * Spec: specs/115-ahrefs-hreflang-tool-email-fixes.md
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://keeply.work';
const LOCALES = [
  'zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'de', 'fr', 'es', 'pt', 'it',
  'nl', 'pl', 'cs', 'hu', 'tr', 'fi', 'sv', 'no', 'da', 'vi', 'th'
];
// Standard template/static page types that share one hreflang cluster each.
const STANDARD_PAGES = ['index', 'privacy', 'terms', 'contact', 'install', 'about', 'buy', 'refund', 'activate'];
// Standalone pages (own scoped hreflang cluster; checked for schema + outlinks).
const TOOL_GLOBS = ['tools/can-i-recover-my-file.html', 'zh-TW/tools/can-i-recover-my-file.html'];

const errors = [];
const fail = (msg) => errors.push(msg);

function read(p) { return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; }
function hreflangSet(html) {
  const re = /<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g;
  const out = []; let m;
  while ((m = re.exec(html))) out.push(`${m[1]}|${m[2]}`);
  return out.sort();
}
function canonicalSet(pagePath) {
  const set = LOCALES.map((loc) => `${loc}|${BASE}/${loc}/${pagePath}`);
  set.push(`x-default|${BASE}/${pagePath}`);
  return set.sort();
}

// ── 1. sitemap clean URLs ────────────────────────────────────────────────────
const sitemap = read(path.join(ROOT, 'sitemap.xml'));
if (!sitemap) fail('sitemap.xml not found — build first');
else {
  const bad = (sitemap.match(/<loc>[^<]*\.html<\/loc>/g) || []);
  if (bad.length) fail(`RC-6: ${bad.length} .html URL(s) in sitemap <loc> (CF 308-redirects): ${bad.slice(0, 3).join(', ')}`);
}

// ── 2. no mailto in built pages ──────────────────────────────────────────────
function walkHtml(dir, depth) {
  let files = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '_dev' || e.name === 'specs' || e.name === 'node_modules' || e.name === 'demo') continue;
    const fp = path.join(dir, e.name);
    if (e.isDirectory() && depth > 0) files = files.concat(walkHtml(fp, depth - 1));
    else if (e.isFile() && e.name.endsWith('.html')) files.push(fp);
  }
  return files;
}
const allHtml = walkHtml(ROOT, 2);
const mailtoHits = allHtml.filter((f) => /href="mailto:/.test(fs.readFileSync(f, 'utf8')));
if (mailtoHits.length) fail(`RC-4: ${mailtoHits.length} page(s) still have <a href="mailto:"> (CF turns these into /cdn-cgi/ 404s): ${mailtoHits.slice(0, 3).map((f) => path.relative(ROOT, f)).join(', ')}`);

// ── 3. hreflang reciprocity on standard pages ────────────────────────────────
for (const type of STANDARD_PAGES) {
  const file = type === 'index' ? 'index.html' : `${type}.html`;
  const pagePath = type === 'index' ? '' : type;
  const expected = canonicalSet(pagePath).join('\n');
  const variants = [path.join(ROOT, file), ...LOCALES.map((loc) => path.join(ROOT, loc, file))];
  for (const v of variants) {
    const html = read(v);
    if (!html) continue; // missing locale handled by audit:orphans
    const got = hreflangSet(html).join('\n');
    if (got !== expected) {
      const rel = path.relative(ROOT, v);
      const gotN = got ? got.split('\n').length : 0;
      fail(`RC-9: ${rel} hreflang set is not the canonical 21+x-default for "${pagePath || '/'}" (got ${gotN} tags)`);
    }
  }
}

// ── 4. tool/standalone page schema + outlinks ────────────────────────────────
for (const rel of TOOL_GLOBS) {
  const html = read(path.join(ROOT, rel));
  if (!html) continue;
  const ld = (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [, ''])[1];
  if (/\.html["#]/.test(ld)) fail(`RC-7: ${rel} JSON-LD still contains a .html URL (CF 308 / canonical mismatch)`);
  if (/"isPartOf"\s*:\s*\{\s*"@id"\s*:\s*"[^"]*#organization"/.test(ld)) fail(`RC-7: ${rel} WebPage.isPartOf → #organization (schema.org domain is CreativeWork; use #website)`);
  const staticLinks = (html.match(/<a\s+[^>]*href="(\/[^"]*|https?:\/\/[^"]*)"/g) || []).filter((a) => !/mailto:/.test(a));
  if (staticLinks.length === 0) fail(`RC-8: ${rel} has 0 static <a href> (crawlers see "no outgoing links"; JS-injected nav doesn't count)`);
}

// ── report ───────────────────────────────────────────────────────────────────
console.log('=== audit:seo (Ahrefs RC guard) ===');
if (errors.length) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`\n[audit:seo] FAILED — ${errors.length} issue(s). Fix before publishing.`);
  process.exit(1);
}
console.log('[audit:seo] OK — sitemap clean, no mailto, hreflang reciprocal, tool pages valid.');
