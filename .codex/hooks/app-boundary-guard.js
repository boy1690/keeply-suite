#!/usr/bin/env node
/**
 * app-boundary-guard.js — PreToolUse(Edit|Write) hook.
 *
 * From a keeply-suite session, blocks writing into OTHER product repos under
 * d:/tools/doing/ (i.e. any sibling whose name is not `keeply-*`). This is the
 * cross-repo boundary from apps/blog/CLAUDE.md: keeply content/specs/tooling
 * must never leak into d:/tools/doing/Keeply/ (Tauri desktop app), Ocular/, etc.
 *
 * DENYLIST by design (not allowlist): only sibling product repos under
 * d:/tools/doing/ are blocked. Everything else — keeply-suite itself, keeply-*
 * siblings (keeply-blog mirror), ~/.claude (memory/framework), temp dirs, other
 * drives — is allowed. Failure mode is "miss a catch", never "false-block".
 *
 * Incident it addresses: 2026-05-02 a translation template was written into
 * d:/tools/doing/Keeply/website/i18n/ from a keeply session.
 *
 * Contract: exit 0 = allow · exit 2 + stderr = block. Fail-open on any error.
 *
 * @version 1.0.0  @since 2026-05-20
 */

// d:/tools/doing/<sibling>/...  — capture the sibling dir name.
const SIBLING = /[\\/]tools[\\/]doing[\\/]([^\\/]+)[\\/]/i;

function offLimits(filePath) {
  const norm = (filePath || '').replace(/\\/g, '/');
  const m = norm.match(SIBLING);
  if (!m) return null;                       // not under tools/doing → not our concern
  const sibling = m[1];
  if (/^keeply-/i.test(sibling)) return null; // keeply-suite, keeply-blog, … → allowed
  return sibling;                            // any other product repo → blocked
}

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  let input;
  try { input = JSON.parse(Buffer.concat(chunks).toString()); } catch { process.exit(0); }

  const filePath = (input.tool_input && input.tool_input.file_path) || '';
  const repo = offLimits(filePath);
  if (!repo) process.exit(0);

  process.stderr.write(
    '\n❌ app-boundary-guard: blocked a write into another product repo.\n\n' +
    `  file: ${filePath.replace(/\\/g, '/')}\n` +
    `  repo: d:/tools/doing/${repo}/  — OFF-LIMITS from a keeply-suite session\n\n` +
    '  keeply content / specs / tooling stay inside keeply-suite (or keeply-* siblings).\n' +
    '  If this is website/blog material, write it under apps/website/ or apps/blog/ instead.\n' +
    '  policy: apps/blog/CLAUDE.md → App Boundary\n'
  );
  process.exit(2);
}

main().catch(() => process.exit(0));
