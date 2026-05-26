#!/usr/bin/env node
/**
 * Scout Scripts — zero-token recon (replaces Haiku for 3 of 4 scout types)
 *
 * Usage:
 *   node scout-scripts.js file-scan --scope "src/components/" --pattern "*.tsx"
 *   node scout-scripts.js grep-scan --pattern "console\.log" --scope "src/"
 *   node scout-scripts.js status-check
 *
 *   node scout-scripts.js consumer-scan --export-name "buildFlatPaneItems" --scope "src/"
 *
 * Output: Markdown table to stdout (same format as Haiku scout)
 *
 * @version 1.1.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── Parse CLI args ──────────────────────────────────────────
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      args[key] = (next && !next.startsWith('--')) ? argv[++i] : true;
    } else if (!args._cmd) {
      args._cmd = argv[i];
    }
  }
  return args;
}

// ── Safety ──────────────────────────────────────────────────
const BANNED_PATHS = ['.speckit/', 'src-tauri/src/git/', 'src-tauri/src/nas/'];
const MAX_RESULTS = 30;

function checkBannedPaths(scope) {
  if (BANNED_PATHS.some(bp => scope.includes(bp))) {
    process.stderr.write(`ERROR: Cannot scan protected path "${scope}". Use Opus directly.\n`);
    process.exit(1);
  }
}

// ── file-scan ───────────────────────────────────────────────
function fileScan(args) {
  const scope = args.scope || 'src/';
  const pattern = args.pattern || '*';
  checkBannedPaths(scope);

  const globPattern = path.join(scope, '**', pattern).replace(/\\/g, '/');

  let files;
  try {
    // Prefer git ls-files (works everywhere, respects .gitignore)
    const s = scope.replace(/\\/g, '/').replace(/\/$/, '');
    const cmd = `git ls-files "${s}/${pattern}" "${s}/**/${pattern}"`;
    const out = execSync(cmd, { encoding: 'utf8', timeout: 10000, stdio: ['pipe', 'pipe', 'pipe'] });
    files = out.trim().split('\n').filter(Boolean).slice(0, MAX_RESULTS);
  } catch {
    // Fallback: glob via find/dir
    try {
      const cmd = process.platform === 'win32'
        ? `dir /s /b "${scope.replace(/\//g, '\\')}\\${pattern}" 2>nul`
        : `find "${scope}" -name "${pattern}" -type f 2>/dev/null`;
      const out = execSync(cmd, { encoding: 'utf8', timeout: 10000, stdio: ['pipe', 'pipe', 'pipe'] });
      files = out.trim().split('\n').filter(Boolean).slice(0, MAX_RESULTS);
    } catch {
      files = [];
    }
  }

  if (files.length === 0) {
    console.log(`No files matching \`${pattern}\` in \`${scope}\``);
    return;
  }

  console.log(`| File | Lines | Size |`);
  console.log(`| ---- | ----- | ---- |`);

  for (const f of files) {
    try {
      const stat = fs.statSync(f);
      const content = fs.readFileSync(f, 'utf8');
      const lines = content.split('\n').length;
      const sizeKB = (stat.size / 1024).toFixed(1);
      const rel = path.relative('.', f).replace(/\\/g, '/');
      console.log(`| ${rel} | ${lines} | ${sizeKB}KB |`);
    } catch {
      const rel = path.relative('.', f).replace(/\\/g, '/');
      console.log(`| ${rel} | ? | ? |`);
    }
  }

  if (files.length >= MAX_RESULTS) {
    console.log(`\n*${MAX_RESULTS}+ files matched, showing first ${MAX_RESULTS}.*`);
  }
}

// ── grep-scan ───────────────────────────────────────────────
function grepScan(args) {
  const scope = args.scope || 'src/';
  const pattern = args.pattern;
  checkBannedPaths(scope);

  if (!pattern) {
    process.stderr.write('ERROR: grep-scan requires --pattern\n');
    process.exit(1);
  }

  let output;
  try {
    // Try rg first, fallback to git grep
    const cmd = `rg -n --no-heading --max-count 3 "${pattern}" "${scope}"`;
    output = execSync(cmd, { encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    if (e.stdout && e.stdout.trim()) {
      output = e.stdout;
    } else {
      // Fallback: git grep
      try {
        const cmd2 = `git grep -n "${pattern}" -- "${scope}"`;
        output = execSync(cmd2, { encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'] });
      } catch (e2) {
        output = e2.stdout || '';
      }
    }
  }
  if (!output || !output.trim()) {
    console.log(`No matches for \`${pattern}\` in \`${scope}\``);
    return;
  }

  const lines = output.trim().split('\n').filter(Boolean).slice(0, MAX_RESULTS);
  if (lines.length === 0) {
    console.log(`No matches for \`${pattern}\` in \`${scope}\``);
    return;
  }

  console.log(`| File:Line | Match |`);
  console.log(`| --------- | ----- |`);

  for (const line of lines) {
    // Format: file:line:content
    const firstColon = line.indexOf(':');
    const secondColon = line.indexOf(':', firstColon + 1);
    if (firstColon === -1 || secondColon === -1) continue;

    const file = path.relative('.', line.slice(0, firstColon)).replace(/\\/g, '/');
    const lineNum = line.slice(firstColon + 1, secondColon);
    const match = line.slice(secondColon + 1).trim().slice(0, 80);
    console.log(`| ${file}:${lineNum} | \`${match.replace(/\|/g, '\\|')}\` |`);
  }

  if (lines.length >= MAX_RESULTS) {
    console.log(`\n*${MAX_RESULTS}+ matches, showing first ${MAX_RESULTS}.*`);
  }
}

// ── status-check ────────────────────────────────────────────
function statusCheck() {
  let status, diffStat, recentLog;

  try {
    status = execSync('git status --porcelain', { encoding: 'utf8', timeout: 5000 });
  } catch {
    status = '';
  }
  try {
    diffStat = execSync('git diff --stat', { encoding: 'utf8', timeout: 5000 });
  } catch {
    diffStat = '';
  }
  try {
    recentLog = execSync('git log --oneline -5', { encoding: 'utf8', timeout: 5000 });
  } catch {
    recentLog = '';
  }

  const lines = status.trim().split('\n').filter(Boolean);
  const modified = [];
  const untracked = [];
  const staged = [];

  for (const line of lines) {
    const x = line[0]; // index status
    const y = line[1]; // worktree status
    const file = line.slice(3);
    if (x === '?' && y === '?') {
      untracked.push(file);
    } else if (x !== ' ' && x !== '?') {
      staged.push(file);
    } else if (y !== ' ') {
      modified.push(file);
    }
  }

  console.log('## Status\n');
  console.log(`- **Staged** (${staged.length}): ${staged.slice(0, 10).join(', ') || 'none'}`);
  console.log(`- **Modified** (${modified.length}): ${modified.slice(0, 10).join(', ') || 'none'}`);
  console.log(`- **Untracked** (${untracked.length}): ${untracked.slice(0, 10).join(', ') || 'none'}`);

  if (diffStat.trim()) {
    console.log('\n## Diff Summary\n');
    console.log('```');
    console.log(diffStat.trim());
    console.log('```');
  }

  if (recentLog.trim()) {
    console.log('\n## Recent Commits\n');
    console.log('```');
    console.log(recentLog.trim());
    console.log('```');
  }
}

// ── consumer-scan ──────────────────────────────────────────
/**
 * Find all files that import a target export (zero-token BP-002 pattern).
 *
 * Searches 3 layers:
 *   1. Direct imports: import { name } from ...
 *   2. Barrel re-exports: export { name } from ...
 *   3. Other references: string refs, keyof typeof, dynamic
 *
 * @param {object} args - { 'export-name': string, scope?: string }
 */
function consumerScan(args) {
  const exportName = args['export-name'];
  const scope = args.scope || 'src/';

  if (!exportName) {
    process.stderr.write('ERROR: consumer-scan requires --export-name\n');
    process.exit(1);
  }
  checkBannedPaths(scope);

  const seen = new Map(); // file:line → row object (dedup)

  function runRg(pattern, importType) {
    try {
      const cmd = `rg -n --no-heading --type ts --type-add "tsx:*.tsx" --type tsx "${pattern}" "${scope}"`;
      const out = execSync(cmd, { encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'] });
      return out;
    } catch (e) {
      // rg exit code 1 = no matches (normal), capture stdout if any
      if (e.stdout && e.stdout.trim()) return e.stdout;
      // Fallback: git grep
      try {
        const cmd2 = `git grep -n "${pattern}" -- "${scope}"`;
        const out2 = execSync(cmd2, { encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'] });
        return out2;
      } catch (e2) {
        return e2.stdout || '';
      }
    }
  }

  function parseLines(output, importType) {
    if (!output || !output.trim()) return;
    const lines = output.trim().split('\n').filter(Boolean);
    for (const line of lines) {
      const firstColon = line.indexOf(':');
      const secondColon = line.indexOf(':', firstColon + 1);
      if (firstColon === -1 || secondColon === -1) continue;

      const filePath = line.slice(0, firstColon);
      const lineNum = line.slice(firstColon + 1, secondColon);
      const context = line.slice(secondColon + 1).trim().slice(0, 80);
      const rel = path.relative('.', filePath).replace(/\\/g, '/');
      const key = `${rel}:${lineNum}`;

      if (!seen.has(key)) {
        seen.set(key, { file: rel, type: importType, line: lineNum, context });
      }
    }
  }

  // Layer 1: Direct imports — import { name } from ...
  parseLines(runRg(`import.*\\\\{[^}]*${exportName}[^}]*\\\\}.*from`, 'direct'), 'direct');
  // Simpler pattern as fallback (handles default imports, aliased)
  parseLines(runRg(`import.*${exportName}.*from`, 'direct'), 'direct');

  // Layer 2: Barrel re-exports — export { name }
  parseLines(runRg(`export.*\\\\{[^}]*${exportName}`, 're-export'), 're-export');

  // Layer 3: Other references — string refs, typeof, dynamic import
  parseLines(runRg(`${exportName}`, 'reference'), 'reference');

  // Upgrade type: if line has import → direct; if line has export → re-export
  for (const row of seen.values()) {
    if (row.type === 'reference') {
      if (/import\s/.test(row.context)) row.type = 'direct';
      else if (/export\s/.test(row.context)) row.type = 're-export';
    }
  }

  const results = [...seen.values()].slice(0, MAX_RESULTS);

  if (results.length === 0) {
    console.log(`No consumers of \`${exportName}\` found in \`${scope}\``);
    return;
  }

  console.log(`| File | Import Type | Line | Context |`);
  console.log(`| ---- | ----------- | ---- | ------- |`);

  for (const r of results) {
    const ctx = r.context.replace(/\|/g, '\\|');
    console.log(`| ${r.file} | ${r.type} | ${r.line} | \`${ctx}\` |`);
  }

  if (seen.size > MAX_RESULTS) {
    console.log(`\n*${seen.size} total matches, showing first ${MAX_RESULTS}.*`);
  }

  console.log(`\n**Total: ${results.length} consumer(s) found.**`);
}

// ── Main ────────────────────────────────────────────────────
const args = parseArgs(process.argv);
const cmd = args._cmd;

switch (cmd) {
  case 'file-scan':
    fileScan(args);
    break;
  case 'grep-scan':
    grepScan(args);
    break;
  case 'status-check':
    statusCheck();
    break;
  case 'consumer-scan':
    consumerScan(args);
    break;
  default:
    process.stderr.write(`Usage: scout-scripts.js <file-scan|grep-scan|status-check|consumer-scan> [options]\n`);
    process.stderr.write(`\n  file-scan      --scope <dir> --pattern <glob>\n`);
    process.stderr.write(`  grep-scan      --pattern <regex> --scope <dir>\n`);
    process.stderr.write(`  status-check\n`);
    process.stderr.write(`  consumer-scan  --export-name <name> --scope <dir>\n`);
    process.exit(1);
}
