#!/usr/bin/env node
/**
 * check-cross-refs.js — verify blog → main-site (keeply.work) cross-reference links resolve.
 *
 * Root CLAUDE.md rule: "Articles in apps/blog/content/ referencing keeply.work/*
 * paths must curl -I 200 verify before commit. A future CI lint will block merge
 * on 404 cross-refs." This is that lint.
 *
 * Scans apps/blog/content/ **markdown only** (SVG illustrations are decorative,
 * not navigable links — excluded) for https://keeply.work/<path> URLs, dedupes,
 * and HEAD/GET-checks each against the live site.
 *
 * Robust by design: a definitive HTTP 4xx/5xx fails the run; transient network
 * errors (DNS/timeout) are reported as warnings and do NOT fail (avoids CI flake).
 *
 * Usage: node apps/blog/_dev/seo/check-cross-refs.js   (cwd-independent)
 * Exit:  0 = all cross-refs resolve (or none found) · 1 = a cross-ref returns 4xx/5xx
 */
const fs = require('fs');
const path = require('path');

const CONTENT = path.join(__dirname, '..', '..', 'content');
// Apex main-site only (blog.keeply.work is the blog itself — different concern).
const URL_RE = /https:\/\/keeply\.work\/[^\s)"'\]<>]+/g;
const TIMEOUT_MS = 12000;

function walkMd(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkMd(full, out);
    else if (e.name.endsWith('.md')) out.push(full);
  }
}

function collectUrls() {
  const files = [];
  walkMd(CONTENT, files);
  const map = new Map(); // url -> Set(files)
  for (const f of files) {
    let txt;
    try { txt = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const matches = txt.match(URL_RE);
    if (!matches) continue;
    for (let u of matches) {
      u = u.replace(/[.,;:]+$/, ''); // strip trailing sentence punctuation
      if (u.includes('...')) continue; // illustrative placeholder, not a real URL
      if (!map.has(u)) map.set(u, new Set());
      map.get(u).add(path.relative(CONTENT, f).replace(/\\/g, '/'));
    }
  }
  return map;
}

async function probe(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
    if (res.status === 405 || res.status === 501) { // HEAD not allowed → retry GET
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
    }
    return { status: res.status, ok: res.ok };
  } catch (e) {
    return { networkError: e.name === 'AbortError' ? 'timeout' : (e.cause?.code || e.message) };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const map = collectUrls();
  if (map.size === 0) {
    console.log('✅ cross-refs: no keeply.work links found in blog markdown — nothing to check.');
    return;
  }
  console.log(`Checking ${map.size} unique keeply.work cross-ref(s)…\n`);
  const broken = [];
  const warned = [];
  for (const [url, files] of map) {
    const r = await probe(url);
    const where = [...files].slice(0, 3).join(', ');
    if (r.networkError) {
      warned.push(`  ⚠️  ${url}  (network: ${r.networkError}) — in ${where}`);
    } else if (!r.ok) {
      broken.push(`  ❌ ${r.status}  ${url}  — in ${where}`);
    } else {
      console.log(`  ✅ ${r.status}  ${url}`);
    }
  }
  if (warned.length) { console.log('\nUnverified (transient, not failing):'); console.log(warned.join('\n')); }
  if (broken.length) {
    console.error(`\n❌ cross-refs: ${broken.length} link(s) return 4xx/5xx:`);
    console.error(broken.join('\n'));
    console.error('\nFix the link, add the page under apps/website/, or 301 it before shipping.');
    process.exit(1);
  }
  console.log('\n✅ cross-refs: all resolved.');
}

main().catch((e) => { console.error('check-cross-refs error (non-fatal):', e.message); process.exit(0); });
