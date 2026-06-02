#!/usr/bin/env node
/**
 * Clean-URL + hreflang normalizer for STATIC per-locale pages
 * (Ahrefs RC-3 Phase 1b + RC-9).
 *
 * buy.html / refund.html / activate.html are hand-maintained static per-locale
 * copies that build.js does NOT regenerate. Two problems this step fixes in the
 * build output (never the source):
 *
 *  (1) RC-3 Phase 1b — <head> hard-codes the `.html` form
 *      (https://keeply.work/en/buy.html) that Cloudflare 308-redirects. Strip the
 *      `.html` off absolute keeply.work URLs inside <link rel="canonical"> and
 *      <meta property="og:url">.
 *
 *  (2) RC-9 — hreflang reciprocity. The root copies listed every locale pointing
 *      at themselves (all → /buy), the locale copies omitted vi/th and pinned
 *      x-default to the home (`/`) instead of the page root. Both broke the
 *      cluster → "missing reciprocal hreflang (no return-tag)". This step
 *      REBUILDS the whole hreflang block on every static copy to the canonical,
 *      self-consistent set — 21 per-locale + x-default→page-root — identical to
 *      what build.js emits for the template-driven pages. Every member of a
 *      cluster then carries the same set and reciprocates.
 *
 * Deliberately scoped to head tags only — body links are handled by
 * build:clean-links, body mailto by build:clean-email. Idempotent. Run after
 * build:pages / build:comparisons, before build:schema.
 * Spec: specs/115-ahrefs-hreflang-tool-email-fixes.md (was 114 for RC-3).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://keeply.work';
const STATIC_PAGES = ['buy.html', 'refund.html', 'activate.html'];

// Must mirror build.js LOCALES (21 build locales).
const LOCALES = [
  'zh-TW', 'zh-CN', 'en', 'ja', 'ko',
  'de', 'fr', 'es', 'pt', 'it',
  'nl', 'pl', 'cs', 'hu', 'tr',
  'fi', 'sv', 'no', 'da',
  'vi', 'th'
];

const HEAD_TAG_RE = /rel="canonical"|property="og:url"/;
const URL_HTML_RE = /(https:\/\/keeply\.work\/[^"']*?)\.html(["'])/g;
const HREFLANG_LINE_RE = /<link\s+rel="alternate"\s+hreflang=/;

function collectFiles() {
  const files = [];
  for (const page of STATIC_PAGES) {
    const rootFile = path.join(ROOT, page);
    if (fs.existsSync(rootFile)) files.push(rootFile);
  }
  for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    for (const page of STATIC_PAGES) {
      const f = path.join(ROOT, entry.name, page);
      if (fs.existsSync(f)) files.push(f);
    }
  }
  return files;
}

// (1) strip .html off canonical/og absolute URLs (line-scoped).
function stripHtml(html, counter) {
  return html
    .split('\n')
    .map((line) => {
      if (!HEAD_TAG_RE.test(line)) return line;
      return line.replace(URL_HTML_RE, (_m, base, quote) => {
        counter.stripped++;
        return base + quote;
      });
    })
    .join('\n');
}

// (2) rebuild the hreflang block to the canonical reciprocal set for `page`.
function hreflangBlock(page, indent) {
  let out = '';
  for (const loc of LOCALES) {
    out += `${indent}<link rel="alternate" hreflang="${loc}" href="${BASE}/${loc}/${page}" />\n`;
  }
  out += `${indent}<link rel="alternate" hreflang="x-default" href="${BASE}/${page}" />`;
  return out;
}

function rebuildHreflang(html, page, counter) {
  const lines = html.split('\n');
  let first = -1;
  let last = -1;
  for (let i = 0; i < lines.length; i++) {
    if (HREFLANG_LINE_RE.test(lines[i])) {
      if (first === -1) first = i;
      last = i;
    }
  }
  if (first === -1) return html; // no hreflang block to normalize
  const indent = (lines[first].match(/^(\s*)/) || [, '  '])[1];
  const block = hreflangBlock(page, indent);
  const rebuilt = lines.slice(0, first).concat(block.split('\n')).concat(lines.slice(last + 1)).join('\n');
  if (rebuilt !== html) counter.rebuilt++;
  return rebuilt;
}

console.log('=== build:clean-static (RC-3 Phase 1b + RC-9) ===');
const counter = { stripped: 0, rebuilt: 0 };
let changedFiles = 0;
for (const file of collectFiles()) {
  const before = fs.readFileSync(file, 'utf8');
  const page = path.basename(file, '.html'); // buy | refund | activate
  let out = stripHtml(before, counter);
  out = rebuildHreflang(out, page, counter);
  if (out !== before) {
    fs.writeFileSync(file, out, 'utf8');
    changedFiles++;
  }
}
console.log(
  `[clean-static] stripped ${counter.stripped} .html ref(s) + rebuilt hreflang on ${counter.rebuilt} page(s) across ${changedFiles} file(s)`
);
