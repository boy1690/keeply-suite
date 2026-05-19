#!/usr/bin/env node
// Bump frontmatter `date:` 到「現在 - 1 小時」across 6 launch locales。
//
// Why -1 hour: Hugo CI 不跑 --buildFuture，date 在未來 = Hugo skip
// → 404 → CF cache 4 小時。sweet spot = 現在 - 1h，剛好新到觸發
// Google recrawl 但不會被 Hugo skip。See memory
// reference_article_date_must_predate_ci.md.
//
// When to run: Phase 5.0 weekly retrofit Issue 處理完一篇後（Jerry
// freshness 招式）。預期 retrofit ≥10% 內容變動才 bump，純錯字修正
// 不算。
//
// Run:
//   node _dev/blog/bump-date.js <slug>                 # bump 6 locales
//   node _dev/blog/bump-date.js <slug> --dry-run       # 只顯示變動
//   node _dev/blog/bump-date.js <slug> --advise        # 用 git diff
//                                                       建議是否該 bump
//   node _dev/blog/bump-date.js <slug> --locales zh-tw,en
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const LOCALE_DIR = {
  'zh-tw': 'zh-tw',
  'en': 'english',
  'zh-cn': 'zh-cn',
  'ja': 'ja',
  'ko': 'ko',
  'it': 'it',
};
const DEFAULT_LOCALES = Object.keys(LOCALE_DIR);

// ≥10% lines changed = recommended bump threshold (Jerry's heuristic;
// pure typo / link patches don't move the freshness needle).
const BUMP_THRESHOLD_PCT = 10;

function parseArgs() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) {
    console.error('Usage: bump-date.js <slug> [--dry-run] [--advise] [--locales zh-tw,en,...]');
    process.exit(1);
  }
  const slug = argv[0];
  const dryRun = argv.includes('--dry-run');
  const advise = argv.includes('--advise');
  let locales = DEFAULT_LOCALES;
  const li = argv.indexOf('--locales');
  if (li >= 0 && argv[li + 1]) {
    locales = argv[li + 1].split(',').map((s) => s.trim()).filter((s) => LOCALE_DIR[s]);
  }
  return { slug, dryRun, advise, locales };
}

// "now - 1 hour" 格式為 Hugo-friendly RFC3339 + +08:00 timezone。
// +08:00 是 Asia/Taipei 全年無 DST，硬編進 timezone offset 不會錯。
function newDateString() {
  const d = new Date(Date.now() - 60 * 60 * 1000);
  // Convert UTC to TPE: TPE = UTC + 8
  const tpe = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = tpe.getUTCFullYear();
  const mm = pad(tpe.getUTCMonth() + 1);
  const dd = pad(tpe.getUTCDate());
  const hh = pad(tpe.getUTCHours());
  const mi = pad(tpe.getUTCMinutes());
  const ss = pad(tpe.getUTCSeconds());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+08:00`;
}

function filePath(locale, slug) {
  return path.join(REPO_ROOT, 'content', LOCALE_DIR[locale], 'post', slug, 'index.md');
}

function bumpFile(fp, newDate, dryRun) {
  const raw = fs.readFileSync(fp, 'utf8');
  const re = /^date:\s*(.+)$/m;
  const m = raw.match(re);
  if (!m) return { ok: false, reason: 'NO_DATE_FIELD' };
  const oldDate = m[1].trim();
  const updated = raw.replace(re, `date: ${newDate}`);
  if (raw === updated) return { ok: false, reason: 'NO_CHANGE' };
  if (!dryRun) fs.writeFileSync(fp, updated);
  return { ok: true, oldDate, newDate };
}

// git diff --shortstat HEAD -- <path> → "1 file changed, 4 insertions(+), 2 deletions(-)"
// 用相對 path 給 git，回 % lines changed since last commit on this file.
function adviseFromGitDiff(slug, locales) {
  const totals = [];
  for (const loc of locales) {
    const fp = filePath(loc, slug);
    const rel = path.relative(REPO_ROOT, fp).replace(/\\/g, '/');
    if (!fs.existsSync(fp)) continue;
    let stat = '';
    try {
      stat = execSync(`git diff --numstat HEAD -- "${rel}"`, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
    } catch (_) {
      continue;
    }
    if (!stat) { totals.push({ locale: loc, added: 0, deleted: 0, total: 0, changed: 0, pct: 0 }); continue; }
    const [added, deleted] = stat.split(/\s+/).map((n) => parseInt(n, 10) || 0);
    const totalLines = fs.readFileSync(fp, 'utf8').split('\n').length;
    const changed = added + deleted;
    const pct = totalLines > 0 ? (changed / totalLines) * 100 : 0;
    totals.push({ locale: loc, added, deleted, total: totalLines, changed, pct });
  }
  return totals;
}

function main() {
  const { slug, dryRun, advise, locales } = parseArgs();
  const newDate = newDateString();

  if (advise) {
    const stats = adviseFromGitDiff(slug, locales);
    console.log(`\nGit diff for slug \`${slug}\` (vs HEAD):\n`);
    console.log('| Locale | Added | Deleted | Total lines | % changed |');
    console.log('|---|---|---|---|---|');
    let anyAbove = false;
    for (const s of stats) {
      const flag = s.pct >= BUMP_THRESHOLD_PCT ? ' ⚠️' : '';
      if (s.pct >= BUMP_THRESHOLD_PCT) anyAbove = true;
      console.log(`| ${s.locale} | ${s.added} | ${s.deleted} | ${s.total} | ${s.pct.toFixed(1)}%${flag} |`);
    }
    console.log('');
    console.log(`Threshold: ≥${BUMP_THRESHOLD_PCT}% lines changed = recommended bump`);
    console.log(`Verdict: ${anyAbove ? '**bump recommended**（任一 locale 變動 ≥ 10%）' : 'skip bump（變動太小，純錯字 / link 修正不算 refresh）'}`);
    return;
  }

  console.log(`\nBumping \`date:\` → ${newDate} for slug \`${slug}\` across ${locales.length} locale(s)${dryRun ? ' [DRY RUN]' : ''}:\n`);
  let okCount = 0, missCount = 0;
  for (const loc of locales) {
    const fp = filePath(loc, slug);
    if (!fs.existsSync(fp)) {
      console.log(`  ${loc.padEnd(6)} → missing: ${fp}`);
      missCount++;
      continue;
    }
    const r = bumpFile(fp, newDate, dryRun);
    if (r.ok) {
      console.log(`  ${loc.padEnd(6)} → ${r.oldDate}  →  ${r.newDate}`);
      okCount++;
    } else {
      console.log(`  ${loc.padEnd(6)} → skipped (${r.reason})`);
    }
  }
  console.log(`\nDone: ${okCount} bumped, ${missCount} missing${dryRun ? ' (dry run — no files written)' : ''}.`);
}

main();
