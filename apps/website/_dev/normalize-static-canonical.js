#!/usr/bin/env node
/**
 * Clean-URL + hreflang normalizer for STATIC per-locale pages
 * (Ahrefs RC-3 Phase 1b + RC-5).
 *
 * buy.html / refund.html / activate.html are hand-maintained static per-locale
 * copies that build.js does NOT regenerate. Two problems this step fixes in the
 * build output (never the source):
 *
 *  (1) RC-3 Phase 1b — <head> hard-codes the `.html` form
 *      (https://keeply.work/en/buy.html) that Cloudflare 308-redirects. Strip the
 *      `.html` off absolute keeply.work URLs inside <link rel="canonical">,
 *      <meta property="og:url">, and <link rel="alternate" hreflang=…>.
 *
 *  (2) RC-5 — the 19 older locale copies omit vi + th from their hreflang set,
 *      while the (later-added) vi/th copies list all 21 → "missing reciprocal
 *      hreflang (no return-tag)". Inject vi + th alternates (before x-default) on
 *      any static page whose hreflang block lacks them, so every copy lists the
 *      full set and reciprocates.
 *
 * Deliberately scoped to those head tags only — body links are handled by
 * build:clean-links. Idempotent. Run after build:pages / build:comparisons,
 * before build:schema. Spec: specs/114-clean-url-canonical-sitemap.md
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STATIC_PAGES = ['buy.html', 'refund.html', 'activate.html'];

const HEAD_TAG_RE = /rel="canonical"|property="og:url"|hreflang=/;
const URL_HTML_RE = /(https:\/\/keeply\.work\/[^"']*?)\.html(["'])/g;

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

// (1) strip .html off canonical/og/hreflang absolute URLs (line-scoped).
function stripHtml(html, counter) {
  return html
    .split('\n')
    .map((line) => {
      if (!HEAD_TAG_RE.test(line)) return line;
      return line.replace(URL_HTML_RE, (_m, base, quote) => {
        counter.n++;
        return base + quote;
      });
    })
    .join('\n');
}

// (2) ensure vi + th hreflang alternates exist (inject before x-default).
function ensureViTh(html, page, counter) {
  if (/hreflang="vi"/.test(html) || !/hreflang="x-default"/.test(html)) return html;
  counter.injected++;
  return html.replace(
    /( *)(<link rel="alternate" hreflang="x-default")/,
    `$1<link rel="alternate" hreflang="vi" href="https://keeply.work/vi/${page}" />\n` +
      `$1<link rel="alternate" hreflang="th" href="https://keeply.work/th/${page}" />\n` +
      `$1$2`
  );
}

console.log('=== build:clean-static (RC-3 Phase 1b + RC-5) ===');
const counter = { n: 0, injected: 0 };
let changedFiles = 0;
for (const file of collectFiles()) {
  const before = fs.readFileSync(file, 'utf8');
  const page = path.basename(file, '.html'); // buy | refund | activate
  let out = stripHtml(before, counter);
  out = ensureViTh(out, page, counter);
  if (out !== before) {
    fs.writeFileSync(file, out, 'utf8');
    changedFiles++;
  }
}
console.log(
  `[clean-static] normalized ${counter.n} canonical/og/hreflang ref(s) + injected vi/th hreflang on ${counter.injected} page(s) across ${changedFiles} file(s)`
);
