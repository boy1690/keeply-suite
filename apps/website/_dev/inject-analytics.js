#!/usr/bin/env node
/**
 * Ahrefs Web Analytics injector (spec 115).
 *
 * Injects the free, cookieless Ahrefs Web Analytics beacon into every built page
 * + opens the meta CSP for its origin. Cookieless → NOT consent-gated (unlike
 * GA4/Clarity), so it loads directly (captures pre-consent traffic too).
 *
 * Two edits per page (idempotent):
 *   1. Add `https://analytics.ahrefs.com` to the meta CSP `script-src` and
 *      `connect-src` (so the meta half of the header∩meta intersection allows it).
 *   2. Inject `<script src="https://analytics.ahrefs.com/analytics.js"
 *      data-key="…" async></script>` before </head>.
 *
 * ⚠️ ACTIVATION GATE (out of repo): the AUTHORITATIVE CSP is the Cloudflare
 * "Keeply Security Headers" Transform Rule (dashboard) — `cloudflare/_headers` is
 * excluded from the deploy. analytics.ahrefs.com must ALSO be added there
 * (script-src + connect-src) or the beacon is CSP-blocked (0 sessions, same trap
 * as Clarity). See specs/115 + memory reference_cloudflare_csp_rule.
 *
 * Runs LAST (after build:sri / build:font-preload) so the external beacon never
 * gets an SRI integrity attr. Usage: node _dev/inject-analytics.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const WA_ORIGIN = 'https://analytics.ahrefs.com';
const WA_KEY = 'CkWgapWieQbtB5UHVJhlVw';
const WA_SCRIPT =
  '  <!-- Ahrefs Web Analytics (cookieless, no consent gate) -->\n' +
  `  <script src="${WA_ORIGIN}/analytics.js" data-key="${WA_KEY}" async></script>\n`;

const EXCLUDE_DIRS = new Set([
  'node_modules', '_dev', 'specs', 'cloudflare', 'docs', 'idea',
  '_full-backup', 'fonts', '.git', '.github',
]);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) walk(path.join(dir, entry.name), out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

// Add WA_ORIGIN to a CSP directive (e.g. script-src) right after its 'self'.
// Idempotent PER directive (checking the whole policy would skip connect-src
// once script-src is opened).
function allowInDirective(csp, directive) {
  const anchor = `${directive} 'self'`;
  if (csp.includes(`${anchor} ${WA_ORIGIN}`)) return csp; // this directive already opened
  return csp.replace(anchor, `${anchor} ${WA_ORIGIN}`);
}

function processFile(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.indexOf('</head>') === -1) return 'skip-no-head';
  const before = html;

  // 1. Open meta CSP (script-src + connect-src) — only within the CSP meta tag.
  html = html.replace(
    /(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(")/,
    (_m, p1, csp, p3) => p1 + allowInDirective(allowInDirective(csp, 'script-src'), 'connect-src') + p3
  );

  // 2. Inject the beacon before </head> (idempotent on data-key).
  if (html.indexOf(`data-key="${WA_KEY}"`) === -1) {
    html = html.replace('</head>', WA_SCRIPT + '</head>');
  }

  if (html === before) return 'skip-already';
  fs.writeFileSync(file, html, 'utf8');
  return 'injected';
}

console.log('=== build:analytics (Ahrefs Web Analytics — spec 115) ===');
const files = walk(ROOT_DIR, []);
const tally = files.reduce((acc, f) => { const s = processFile(f); acc[s] = (acc[s] || 0) + 1; return acc; }, {});
console.log(`[analytics] injected ${tally.injected || 0} / already ${tally['skip-already'] || 0} / no-head ${tally['skip-no-head'] || 0} (of ${files.length} HTML)`);
