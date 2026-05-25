#!/usr/bin/env node
/**
 * Clean-URL normalizer for internal BODY links (Ahrefs RC-3, Phase 2).
 *
 * Cloudflare Pages 308-redirects the .html form to the clean URL. Phase 1 fixed
 * canonical/sitemap/hreflang/og; components.js (runtime nav/footer) was fixed at
 * source. This step rewrites the remaining static <a href="…"> body links across
 * every built HTML page so they point straight at the clean 200 URL instead of a
 * 308 hop — Ahrefs "Page has links to redirect" / "3XX redirect".
 *
 * Rewrites href values that are internal page links ending in `.html`
 * (relative, or absolute on https://keeply.work). Preserves ?query and #fragment.
 * Special-cases index: `.../index.html` -> `.../` (directory); bare `index.html`
 * -> `./`. Skips external hosts, mailto:/tel:, protocol-relative, and asset/script
 * refs (only <a href> is touched, never src=).
 *
 * Idempotent. Runs after build:clean-static, before build:schema.
 * Spec: specs/114-clean-url-canonical-sitemap.md
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['_dev', '_archive', 'specs', 'idea', 'node_modules', '.git', '.github', 'cloudflare']);

// href="<path>.html[?query][#frag]" — capture path / query / frag.
const HREF_RE = /href="([^"]*?)\.html(\?[^"#]*)?(#[^"]*)?"/g;
// og:url / twitter:url etc: content="https://keeply.work/<path>.html". build.js
// cleans og:url on /{locale}/ pages, but root template copies (/install, /contact …)
// can slip through → "OG URL not matching canonical". Strip .html universally.
const OG_RE = /content="(https:\/\/keeply\.work\/[^"]*?)\.html(\?[^"#]*)?(#[^"]*)?"/g;

function isInternal(p) {
  if (/^(mailto:|tel:|\/\/)/i.test(p)) return false;       // mail / tel / protocol-relative
  if (/^https?:\/\//i.test(p)) return /^https?:\/\/keeply\.work\//i.test(p); // only our host
  return true;                                              // relative
}

// Map the `.html`-stripped path to its clean form (handle index → directory).
function cleanPath(p) {
  if (p === 'index') return './';            // bare relative index
  if (p.endsWith('/index')) return p.slice(0, -'index'.length); // keep trailing slash
  return p;                                   // plain page: just drop .html
}

function rewrite(html) {
  let n = 0;
  let out = html.replace(HREF_RE, (m, p, query, frag) => {
    if (!isInternal(p)) return m;
    const cleaned = cleanPath(p) + (query || '') + (frag || '');
    n++;
    return `href="${cleaned}"`;
  });
  out = out.replace(OG_RE, (m, base, query, frag) => {
    const b = base.endsWith('/index') ? base.slice(0, -'index'.length) : base; // /…/index.html → /…/
    n++;
    return `content="${b}${query || ''}${frag || ''}"`;
  });
  return { out, n };
}

function listHtml(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const abs = path.join(dir, name);
    const st = fs.statSync(abs);
    if (st.isDirectory()) listHtml(abs, acc);
    else if (name.endsWith('.html')) acc.push(abs);
  }
  return acc;
}

console.log('=== build:clean-links (RC-3 Phase 2) ===');
let changedFiles = 0;
let changedRefs = 0;
for (const file of listHtml(ROOT, [])) {
  const before = fs.readFileSync(file, 'utf8');
  const { out, n } = rewrite(before);
  if (out !== before) {
    fs.writeFileSync(file, out, 'utf8');
    changedFiles++;
    changedRefs += n;
  }
}
console.log(`[clean-links] rewrote ${changedRefs} internal .html href(s) across ${changedFiles} HTML file(s)`);
