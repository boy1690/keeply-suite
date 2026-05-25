#!/usr/bin/env node
/**
 * Clean-URL normalizer for STATIC per-locale pages (Ahrefs RC-3, Phase 1b).
 *
 * build.js regenerates the template-driven pages (index/privacy/terms/contact/
 * install/about) with clean canonical/hreflang/og:url. But buy.html / refund.html
 * / activate.html are hand-maintained static per-locale copies that build.js does
 * NOT touch, so their <head> still hard-codes the `.html` form
 * (https://keeply.work/en/buy.html), which Cloudflare Pages 308-redirects to the
 * clean URL — Ahrefs flags "canonical points to redirect" / "hreflang to redirect".
 *
 * This step rewrites, IN THE BUILD OUTPUT ONLY, the `.html` suffix off absolute
 * keeply.work URLs inside <link rel="canonical">, <meta property="og:url">, and
 * <link rel="alternate" hreflang=...> for those static pages. It is deliberately
 * scoped to those three head tags (matched line-by-line) and does NOT touch body
 * links — internal-link clean-up is Phase 2.
 *
 * Idempotent. Run after build:pages / build:comparisons, before build:schema.
 *
 * Spec: specs/114-clean-url-canonical-sitemap.md
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STATIC_PAGES = ['buy.html', 'refund.html', 'activate.html'];

// Only rewrite URLs that live on one of these head tags.
const HEAD_TAG_RE = /rel="canonical"|property="og:url"|hreflang=/;
// Strip a single trailing `.html` from an absolute keeply.work URL (before the
// closing quote). Keeps query/hash-less head refs; body relative links untouched.
const URL_HTML_RE = /(https:\/\/keeply\.work\/[^"']*?)\.html(["'])/g;

// Collect target files: ROOT/<page> + ROOT/<dir>/<page> for every immediate subdir.
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

console.log('=== build:clean-static (RC-3 Phase 1b) ===');
let changedFiles = 0;
let changedRefs = 0;
for (const file of collectFiles()) {
  const before = fs.readFileSync(file, 'utf8');
  let fileRefs = 0;
  const after = before
    .split('\n')
    .map((line) => {
      if (!HEAD_TAG_RE.test(line)) return line;
      return line.replace(URL_HTML_RE, (_m, base, quote) => {
        fileRefs++;
        return base + quote;
      });
    })
    .join('\n');
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changedFiles++;
    changedRefs += fileRefs;
  }
}
console.log(`[clean-static] normalized ${changedRefs} canonical/og/hreflang ref(s) across ${changedFiles} static page file(s)`);
