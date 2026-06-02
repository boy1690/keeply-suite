#!/usr/bin/env node
/**
 * Email-link normalizer (Ahrefs RC-4 / "Page has links to broken page").
 *
 * Cloudflare's Email Address Obfuscation (Scrape Shield) rewrites every
 * `mailto:` into `/cdn-cgi/l/email-protection#…`, which crawlers (Ahrefs,
 * Googlebot without the JS decode) see as a 404 → 115 pages flagged as
 * "links to broken page". Real users with JS are fine, but the noise is large.
 *
 * Decision (user): keep the founder email private (do NOT disable CF
 * obfuscation), but stop linking via `mailto:` so there is nothing for CF to
 * rewrite. This step, on the BUILT output (never the source):
 *
 *   - non-contact pages:  <a href="mailto:…">INNER</a>  →  <a href="{loc}contact">INNER</a>
 *                         (route the action to the /contact page)
 *   - contact pages:      <a href="mailto:…">INNER</a>  →  <span>INNER</span>
 *                         (email stays visible as text; the page's Google Form
 *                          remains the actual contact path)
 *
 * INNER keeps its honeypot decoy span, so the address is still obscured from
 * plaintext scrapers and — with no `mailto:` — CF emits no /cdn-cgi/ link.
 * Idempotent. Run after build:clean-links, before build:schema.
 * Spec: specs/115-ahrefs-hreflang-tool-email-fixes.md
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Locale dirs to scan (mirror build.js LOCALES); root ('') covers no-locale pages.
const LOCALES = [
  '', 'zh-TW', 'zh-CN', 'en', 'ja', 'ko',
  'de', 'fr', 'es', 'pt', 'it',
  'nl', 'pl', 'cs', 'hu', 'tr',
  'fi', 'sv', 'no', 'da',
  'vi', 'th'
];

// <a href="mailto:…"[attrs]>INNER</a>  — attrs (class/etc.) preserved, inner HTML kept.
const MAILTO_A_RE = /<a\s+href="mailto:[^"]*"([^>]*)>([\s\S]*?)<\/a>/g;

function processFile(file, localePrefix, counter) {
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes('mailto:')) return false;
  const isContact = path.basename(file) === 'contact.html';
  const after = before.replace(MAILTO_A_RE, (_m, attrs, inner) => {
    counter.links++;
    return isContact
      ? `<span${attrs}>${inner}</span>`
      : `<a href="${localePrefix}contact"${attrs}>${inner}</a>`;
  });
  if (after === before) return false;
  fs.writeFileSync(file, after, 'utf8');
  return true;
}

console.log('=== build:clean-email (RC-4) ===');
const counter = { links: 0 };
let changedFiles = 0;
for (const loc of LOCALES) {
  const dir = loc ? path.join(ROOT, loc) : ROOT;
  if (!fs.existsSync(dir)) continue;
  const prefix = loc ? `/${loc}/` : '/';
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    if (processFile(path.join(dir, entry.name), prefix, counter)) changedFiles++;
  }
}
console.log(`[clean-email] rerouted ${counter.links} mailto link(s) across ${changedFiles} file(s)`);
