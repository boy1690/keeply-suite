#!/usr/bin/env node
/**
 * Tag inventory snapshot + diff for the 6 core locales.
 *
 * Two modes:
 *   --snapshot   Write current tag inventory to tag-inventory.json (baseline)
 *   --diff       Compare current content/ vs snapshot, exit 1 if any tag REMOVED
 *                (REMOVED tag = old URL becomes 404 unless Cloudflare redirect
 *                or Hugo alias is added; see _dev/seo/cloudflare-bulk-redirects-*.csv)
 *
 * Why this exists:
 *   Root cause R1 of 2026-05-11 GSC audit — tag renames left 15 dangling 404
 *   URLs. This script blocks the same regression: PR that drops a tag must
 *   either restore the tag, add a CF redirect entry, or explicitly accept
 *   the 404 by updating the snapshot.
 *
 * Usage:
 *   node _dev/seo/tag-inventory.js --snapshot
 *   node _dev/seo/tag-inventory.js --diff
 */
'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const CORE_LOCALES = [
  { lang: 'en', dir: 'content/english/post' },
  { lang: 'zh-tw', dir: 'content/zh-tw/post' },
  { lang: 'zh-cn', dir: 'content/zh-cn/post' },
  { lang: 'ja', dir: 'content/ja/post' },
  { lang: 'ko', dir: 'content/ko/post' },
  { lang: 'it', dir: 'content/it/post' },
];
const SNAPSHOT_PATH = path.join(__dirname, 'tag-inventory.json');

function parseFrontmatterTags(md) {
  const normalized = md.replace(/\r\n/g, '\n');
  const m = normalized.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return [];
  const fm = m[1];
  const tagLine = fm.split('\n').find(l => /^tags\s*:/.test(l));
  if (!tagLine) return [];
  const rhs = tagLine.replace(/^tags\s*:\s*/, '').trim();
  if (rhs.startsWith('[') && rhs.endsWith(']')) {
    return rhs.slice(1, -1)
      .split(',')
      .map(s => s.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  return [];
}

function collectTags() {
  const inventory = {};
  for (const { lang, dir } of CORE_LOCALES) {
    const localeDir = path.join(REPO_ROOT, dir);
    if (!fs.existsSync(localeDir)) continue;
    const tags = new Set();
    const usage = {};
    for (const slug of fs.readdirSync(localeDir)) {
      const mdPath = path.join(localeDir, slug, 'index.md');
      if (!fs.existsSync(mdPath)) continue;
      const md = fs.readFileSync(mdPath, 'utf8');
      for (const t of parseFrontmatterTags(md)) {
        tags.add(t);
        usage[t] = (usage[t] || []);
        usage[t].push(slug);
      }
    }
    inventory[lang] = {
      tags: [...tags].sort((a, b) => a.localeCompare(b)),
      usage,
    };
  }
  return inventory;
}

function snapshot() {
  const inv = collectTags();
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(inv, null, 2) + '\n');
  const total = Object.values(inv).reduce((s, x) => s + x.tags.length, 0);
  console.log(`Wrote ${SNAPSHOT_PATH}`);
  console.log(`Total tags across 6 core locales: ${total}`);
  for (const lang of Object.keys(inv)) {
    console.log(`  ${lang.padEnd(6)} ${inv[lang].tags.length} tags`);
  }
}

function diff() {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    console.error(`No snapshot at ${SNAPSHOT_PATH}. Run with --snapshot first.`);
    process.exit(2);
  }
  const baseline = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
  const current = collectTags();
  let removedCount = 0;
  let addedCount = 0;
  for (const lang of Object.keys(baseline)) {
    const base = new Set(baseline[lang].tags);
    const cur = new Set((current[lang] && current[lang].tags) || []);
    const removed = [...base].filter(t => !cur.has(t));
    const added = [...cur].filter(t => !base.has(t));
    if (removed.length || added.length) {
      console.log(`\n[${lang}]`);
      for (const t of removed) {
        console.log(`  REMOVED: ${t}  → /${lang}/tags/${encodeURIComponent(t)}/ will 404`);
        removedCount++;
      }
      for (const t of added) {
        console.log(`  ADDED:   ${t}  → new tag (verify it's not a typo of an existing one)`);
        addedCount++;
      }
    }
  }
  console.log(`\nSummary: ${removedCount} removed, ${addedCount} added.`);
  if (removedCount > 0) {
    console.log(
      `\nACTION REQUIRED for each REMOVED tag:\n` +
      `  1. Add the old URL to _dev/seo/cloudflare-bulk-redirects-*.csv with a 301 to locale homepage\n` +
      `  2. Upload to Cloudflare Bulk Redirects (Account → Bulk Redirects)\n` +
      `  3. Once redirected, re-run with --snapshot to update baseline`
    );
    process.exit(1);
  }
  if (addedCount === 0 && removedCount === 0) {
    console.log('No tag changes.');
  }
}

const mode = process.argv[2];
if (mode === '--snapshot') snapshot();
else if (mode === '--diff') diff();
else {
  console.error('Usage: tag-inventory.js --snapshot | --diff');
  process.exit(2);
}
