#!/usr/bin/env node
/**
 * check-download-url.js — CI/local guard against PRIVATE-repo download URLs.
 *
 * Shipped web assets (.html/.js/.json) under apps/website must never reference
 * the private repo github.com/boy1690/Keeply/... — logged-out visitors get a
 * 404 + GitHub sign-in wall and the download funnel dies. The public mirror
 * github.com/boy1690/keeply-releases/... must be used instead.
 * Policy: apps/website/CLAUDE.md P0.1.
 *
 * Docs (.md), gitignored specs/, and _dev/ tooling legitimately name the
 * forbidden URL (to document or guard it) and are excluded.
 *
 * Tracked twin of the local PreToolUse gate (.claude/hooks/download-url-guard.js).
 *
 * Usage: node apps/website/_dev/check-download-url.js   (cwd-independent)
 * Exit:  0 = clean · 1 = a private-repo URL was found
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');               // apps/website
const BAD = /boy1690\/Kee\x70ly\b/;                     // case-sensitive; public "keeply-releases" never matches
const GUARDED_EXT = new Set(['.html', '.htm', '.js', '.mjs', '.cjs', '.json']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'specs', '_dev']);

function walk(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (GUARDED_EXT.has(path.extname(e.name).toLowerCase())) out.push(full);
  }
}

function main() {
  const files = [];
  walk(ROOT, files);
  const hits = [];
  for (const f of files) {
    let txt;
    try { txt = fs.readFileSync(f, 'utf8'); } catch { continue; }
    if (BAD.test(txt)) hits.push(path.relative(ROOT, f).replace(/\\/g, '/'));
  }
  if (hits.length) {
    console.error(`❌ download-url: ${hits.length} shipped asset(s) reference the PRIVATE repo:`);
    for (const h of hits) console.error(`  apps/website/${h}`);
    console.error('  -> use boy1690/keeply-releases instead (apps/website/CLAUDE.md P0.1)');
    process.exit(1);
  }
  console.log(`✅ download-url: clean (${files.length} shipped assets, 0 private-repo URLs).`);
}

main();
