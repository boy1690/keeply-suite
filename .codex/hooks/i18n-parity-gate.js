#!/usr/bin/env node
/**
 * i18n-parity-gate.js — PreToolUse(Bash) hook.
 *
 * When a `git commit` is about to run AND staged files include any
 * apps/website/i18n/*.json, verify every locale carries the same key set as
 * en.json (the source of truth per apps/website/CLAUDE.md). Blocks the commit
 * on drift (missing or extra keys), so a key added to en.json can't ship
 * without its 18 siblings.
 *
 * Contract (hook mode): exit 0 = allow · exit 2 + stderr = block. Fail-open on
 * any infra error (git missing, not a repo, unreadable dir) — never brick a commit.
 *
 * CLI mode: `node .claude/hooks/i18n-parity-gate.js --check` runs the parity
 *           comparison directly (ignores git/stdin) and exits 1 on drift, 0 if clean.
 *
 * @version 1.0.0  @since 2026-05-20
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const I18N_REL = path.join('apps', 'website', 'i18n');
const REF_LOCALE = 'en';
const MAX_SHOWN = 12;

function isGitCommit(cmd) {
  // `git commit`, `git -c k=v commit`, `... && git commit -m` — but NOT
  // `git commit-tree`/`commit-graph` and NOT `commit` appearing as a log arg.
  return /\bgit\s+(?:-\S+\s+)*commit(?![\w-])/.test(cmd);
}

function flatten(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out.add(key);
  }
}

/** Returns { refCount, problems: string[] } — problems empty when in parity. */
function checkParity(i18nDir) {
  const refPath = path.join(i18nDir, `${REF_LOCALE}.json`);
  const refKeys = new Set();
  flatten(JSON.parse(fs.readFileSync(refPath, 'utf8')), '', refKeys);

  const files = fs.readdirSync(i18nDir)
    .filter((f) => f.endsWith('.json') && f !== `${REF_LOCALE}.json`);

  const problems = [];
  for (const f of files) {
    const loc = f.replace(/\.json$/, '');
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(i18nDir, f), 'utf8')); }
    catch (e) { problems.push(`  ${loc} — invalid JSON: ${e.message}`); continue; }
    const keys = new Set();
    flatten(data, '', keys);
    const missing = [...refKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !refKeys.has(k));
    if (missing.length || extra.length) {
      const fmt = (arr) => arr.slice(0, MAX_SHOWN).join(', ') + (arr.length > MAX_SHOWN ? ` …(+${arr.length - MAX_SHOWN})` : '');
      const seg = [];
      if (missing.length) seg.push(`missing ${missing.length} [${fmt(missing)}]`);
      if (extra.length) seg.push(`extra ${extra.length} [${fmt(extra)}]`);
      problems.push(`  ${loc} — ${seg.join(' | ')}`);
    }
  }
  return { refCount: refKeys.size, problems };
}

function report({ refCount, problems }) {
  return (
    `\n❌ i18n-parity-gate: ${problems.length} locale(s) out of parity with ${REF_LOCALE}.json (${refCount} keys).\n\n` +
    problems.join('\n') +
    '\n\n  Fix: every locale must carry exactly en.json’s key set (add missing / remove extra), then re-stage.\n' +
    '  (apps/website/CLAUDE.md: a key added to en.json must exist in all 18 others.)\n'
  );
}

// ---- CLI check mode ------------------------------------------------------
function cliCheck() {
  const i18nDir = path.join(process.cwd(), I18N_REL);
  if (!fs.existsSync(path.join(i18nDir, `${REF_LOCALE}.json`))) {
    process.stdout.write('i18n-parity-gate --check: en.json not found (skipped).\n');
    return 0;
  }
  const res = checkParity(i18nDir);
  if (res.problems.length) { process.stderr.write(report(res)); return 1; }
  process.stdout.write(`i18n-parity-gate --check: all locales in parity with ${REF_LOCALE}.json (${res.refCount} keys).\n`);
  return 0;
}

// ---- Hook mode -----------------------------------------------------------
async function hook() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  let input;
  try { input = JSON.parse(Buffer.concat(chunks).toString()); } catch { process.exit(0); }

  if ((input.tool_name || '') !== 'Bash') process.exit(0);
  const cmd = (input.tool_input && input.tool_input.command) || '';
  if (!isGitCommit(cmd)) process.exit(0);

  const root = process.cwd();
  const i18nDir = path.join(root, I18N_REL);
  if (!fs.existsSync(path.join(i18nDir, `${REF_LOCALE}.json`))) process.exit(0);

  let staged;
  try { staged = execFileSync('git', ['diff', '--cached', '--name-only'], { cwd: root, encoding: 'utf8' }); }
  catch { process.exit(0); } // not a repo / git missing → fail-open
  const touchesI18n = staged.split(/\r?\n/).some((f) => /^apps\/website\/i18n\/.+\.json$/.test(f.trim()));
  if (!touchesI18n) process.exit(0);

  let res;
  try { res = checkParity(i18nDir); } catch { process.exit(0); } // unreadable → fail-open
  if (res.problems.length) { process.stderr.write(report(res)); process.exit(2); }
  process.exit(0);
}

if (process.argv.includes('--check')) {
  process.exit(cliCheck());
} else {
  hook().catch(() => process.exit(0));
}
