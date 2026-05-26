#!/usr/bin/env node
/**
 * download-url-guard.js — PreToolUse(Edit|Write) hook.
 *
 * Blocks writing the PRIVATE repo download URL `github.com/boy1690/Keeply/...`
 * into apps/website source files. Logged-out visitors hitting a private-repo URL
 * get a 404 + GitHub sign-in wall → the download conversion funnel dies.
 * The public mirror `github.com/boy1690/keeply-releases/...` must be used instead.
 *
 * Policy: apps/website/CLAUDE.md P0.1 + memory feedback_website_download_url_policy.
 *
 * Scope: only guards files under apps/website/ (download CTAs live there).
 * Prose elsewhere (blog, docs) may legitimately name the private source repo.
 *
 * Contract (hook mode): exit 0 = allow · exit 2 + stderr = block. Fail-open on error.
 * CLI mode: `node .claude/hooks/download-url-guard.js --scan` walks apps/website
 *           and exits 1 if any private-repo URL is found (0 if clean).
 *
 * @version 1.0.0  @since 2026-05-20
 */
const fs = require('fs');
const path = require('path');

// Private repo, CASE-SENSITIVE. The \b after "Keeply" still matches before "/",
// and the lowercase public mirror "keeply-releases" can never match (lowercase k).
const BAD = /boy1690\/Keeply\b/;

// Only police SHIPPED web assets. Docs (.md) and gitignored specs/ legitimately
// quote the forbidden URL to *document* the policy — guarding them would block
// editing the policy file itself.
const GUARDED_EXT = new Set(['.html', '.htm', '.js', '.mjs', '.cjs', '.json']);

function isGuardedWebFile(p) {
  const norm = (p || '').replace(/\\/g, '/');
  if (!/\/apps\/website\//.test(norm)) return false;
  if (/\/apps\/website\/specs\//.test(norm)) return false; // gitignored dev artifacts
  if (/\/apps\/website\/_dev\//.test(norm)) return false;  // build tooling, excluded from deploy (may name the private repo to guard it)
  return GUARDED_EXT.has(path.extname(norm).toLowerCase());
}

function blockMessage(filePath, where) {
  return (
    '\n❌ download-url-guard: blocked a PRIVATE repo download URL.\n\n' +
    `  file:  ${filePath}\n` +
    `  found: github.com/boy1690/Keeply/...  (${where})\n` +
    '         → private repo: logged-out visitors get 404 + GitHub sign-in wall (conversion funnel dies)\n\n' +
    '  ✅ use the PUBLIC mirror: github.com/boy1690/keeply-releases/releases/...\n' +
    '  policy: apps/website/CLAUDE.md P0.1\n'
  );
}

// ---- CLI scan mode -------------------------------------------------------
function walk(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'specs' || e.name === '_dev') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (GUARDED_EXT.has(path.extname(e.name).toLowerCase())) out.push(full);
  }
}

function scan() {
  const root = path.join(process.cwd(), 'apps', 'website');
  if (!fs.existsSync(root)) {
    process.stdout.write('download-url-guard --scan: apps/website not found (skipped).\n');
    return 0;
  }
  const files = [];
  walk(root, files);
  const hits = [];
  for (const f of files) {
    let txt;
    try { txt = fs.readFileSync(f, 'utf8'); } catch { continue; }
    if (BAD.test(txt)) hits.push(path.relative(process.cwd(), f));
  }
  if (hits.length) {
    process.stderr.write(`❌ download-url-guard --scan: ${hits.length} file(s) contain a private-repo URL:\n`);
    for (const h of hits) process.stderr.write(`  ${h}\n`);
    process.stderr.write('  → replace boy1690/Keeply with boy1690/keeply-releases\n');
    return 1;
  }
  process.stdout.write(`download-url-guard --scan: clean (${files.length} files, 0 private-repo URLs).\n`);
  return 0;
}

// ---- Hook mode -----------------------------------------------------------
async function hook() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  let input;
  try { input = JSON.parse(Buffer.concat(chunks).toString()); } catch { process.exit(0); }

  const ti = input.tool_input || {};
  const filePath = ti.file_path || '';
  if (!isGuardedWebFile(filePath)) process.exit(0); // out of scope (docs/specs/non-web)

  // Write → .content ; Edit → .new_string ; MultiEdit → .edits[].new_string
  const parts = [];
  if (typeof ti.content === 'string') parts.push(ti.content);
  if (typeof ti.new_string === 'string') parts.push(ti.new_string);
  if (Array.isArray(ti.edits)) for (const ed of ti.edits) if (ed && typeof ed.new_string === 'string') parts.push(ed.new_string);
  const text = parts.join('\n');
  if (!text) process.exit(0);

  if (BAD.test(text)) {
    process.stderr.write(blockMessage(filePath.replace(/\\/g, '/'), 'in content being written'));
    process.exit(2);
  }
  process.exit(0);
}

if (process.argv.includes('--scan')) {
  process.exit(scan());
} else {
  hook().catch(() => process.exit(0));
}
