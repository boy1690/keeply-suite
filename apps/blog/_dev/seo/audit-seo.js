#!/usr/bin/env node
/**
 * Pre-publish SEO lint for blog.keeply.work (Ahrefs RC-10 prevention).
 *
 * Runs on the BUILT Hugo output (public/) and fails (exit 1) if a home page
 * emits an hreflang <link> to a locale whose home 301-redirects to /en/
 * (de/es/fr/pl/tr — thin noindex pilot homes, redirected at the CF edge). That
 * is "Hreflang to redirect or broken page" in Ahrefs. The templates
 * (layouts/_partials/head.html + layouts/alias.html) already skip these on
 * .IsHome; this guards against the list drifting or a new redirected locale.
 *
 * Keep REDIRECT_LOCALES in sync with the $redirectHomes slice in those layouts.
 * Run after `hugo --gc --minify` (locally in DELIVER, or in deploy CI).
 * Spec: apps/website/specs/115-ahrefs-hreflang-tool-email-fixes.md (RC-10)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PUBLIC = path.resolve(__dirname, '..', '..', 'public');
const REDIRECT_LOCALES = ['de', 'es', 'fr', 'pl', 'tr'];

const errors = [];

if (!fs.existsSync(PUBLIC)) {
  console.error('[audit:seo] public/ not found — run `hugo --gc --minify` first');
  process.exit(1);
}

// Home pages: root alias + each locale home (one level deep).
const homes = [path.join(PUBLIC, 'index.html')];
for (const e of fs.readdirSync(PUBLIC, { withFileTypes: true })) {
  if (e.isDirectory()) {
    const f = path.join(PUBLIC, e.name, 'index.html');
    if (fs.existsSync(f)) homes.push(f);
  }
}

// Matches minified (hreflang=de) and quoted (hreflang="de") alternate links.
const re = new RegExp(`<link\\s+rel="?alternate"?\\s+hreflang="?(${REDIRECT_LOCALES.join('|')})"?[\\s/>]`, 'i');

for (const f of homes) {
  const html = fs.readFileSync(f, 'utf8');
  const hit = html.match(re);
  if (hit) errors.push(`RC-10: ${path.relative(PUBLIC, f)} has hreflang → ${hit[1]} (that locale home 301-redirects to /en/)`);
}

console.log('=== audit:seo (blog Ahrefs RC-10 guard) ===');
if (errors.length) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`\n[audit:seo] FAILED — ${errors.length} home(s) hreflang at a redirecting locale. Fix layouts before publishing.`);
  process.exit(1);
}
console.log(`[audit:seo] OK — ${homes.length} home page(s), none hreflang at a redirecting locale (${REDIRECT_LOCALES.join('/')}).`);
