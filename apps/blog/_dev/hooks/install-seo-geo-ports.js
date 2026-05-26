#!/usr/bin/env node
/**
 * install-seo-geo-ports.js — wire the 3 seo-geo hook ports.
 *
 * YOU run this (the agent is hard-blocked from editing .claude config).
 *   node apps/blog/_dev/hooks/install-seo-geo-ports.js            # apply
 *   node apps/blog/_dev/hooks/install-seo-geo-ports.js --dry-run  # preview only
 *
 * Idempotent: re-running skips anything already wired. Backs up every file it
 * touches with a timestamp suffix before changing it.
 *
 * Does:
 *  1. project .claude/settings.json : add PostToolUse Write|Edit -> memory-size-guard.py
 *  2. project .claude/settings.json : add the skeleton-gate command into the existing
 *                                     PreToolUse Edit|Write block that runs red-team-gate.py
 *  3. ~/.claude/hooks/bwf-keyword-bank-inject.py : replace with the SANITIZED variant
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

const DRY = process.argv.includes("--dry-run");
const SKIP_INJECTOR = process.argv.includes("--skip-injector");
const TS = new Date().toISOString().replace(/[:.]/g, "-");

const HOOKS_DIR = __dirname;                                  // .../apps/blog/_dev/hooks
const ROOT = path.resolve(__dirname, "../../../..");          // repo root
const SETTINGS = path.join(ROOT, ".claude", "settings.json");
const INJ_SRC = path.join(HOOKS_DIR, "bwf-keyword-bank-inject.SANITIZED.py");
const INJ_DST = path.join(os.homedir(), ".claude", "hooks", "bwf-keyword-bank-inject.py");

const MEM_CMD = 'python "$CLAUDE_PROJECT_DIR/apps/blog/_dev/hooks/memory-size-guard.py"';
const SKEL_CMD = 'python "$CLAUDE_PROJECT_DIR/apps/blog/_dev/hooks/bwf-skeleton-completeness-gate.py"';

const log = (...a) => console.log(...a);
const tag = DRY ? "[dry-run]" : "[apply]";
let changed = 0;

function backup(file) {
  const b = `${file}.bak-${TS}`;
  if (!DRY) fs.copyFileSync(file, b);
  log(`  backup -> ${b}`);
}

// command already wired anywhere in a hooks tree?
function hasCmd(hookGroups, needle) {
  if (!Array.isArray(hookGroups)) return false;
  return hookGroups.some(g =>
    Array.isArray(g.hooks) && g.hooks.some(h => (h.command || "").includes(needle)));
}

log(`\n=== seo-geo hook ports installer ${tag} ===`);
log(`repo root : ${ROOT}`);

// ---- sanity: the ported scripts must exist ----
for (const f of [
  path.join(HOOKS_DIR, "memory-size-guard.py"),
  path.join(HOOKS_DIR, "bwf-skeleton-completeness-gate.py"),
  INJ_SRC,
]) {
  if (!fs.existsSync(f)) { console.error(`ERROR: missing ${f}\nRun from the keeply-suite repo.`); process.exit(1); }
}
if (!fs.existsSync(SETTINGS)) { console.error(`ERROR: ${SETTINGS} not found`); process.exit(1); }

// ---- actions 1 & 2: project settings.json ----
log(`\n[1+2] ${SETTINGS}`);
const cfg = JSON.parse(fs.readFileSync(SETTINGS, "utf8"));
cfg.hooks = cfg.hooks || {};
let settingsTouched = false;

// (1) PostToolUse -> memory-size-guard
cfg.hooks.PostToolUse = cfg.hooks.PostToolUse || [];
if (hasCmd(cfg.hooks.PostToolUse, "memory-size-guard.py")) {
  log("  (1) memory-size-guard: already wired, skip");
} else {
  cfg.hooks.PostToolUse.push({ matcher: "Write|Edit", hooks: [{ type: "command", command: MEM_CMD }] });
  log("  (1) memory-size-guard: ADDED to PostToolUse Write|Edit");
  settingsTouched = true; changed++;
}

// (2) skeleton-gate -> the PreToolUse Edit|Write block that runs red-team-gate.py
cfg.hooks.PreToolUse = cfg.hooks.PreToolUse || [];
if (hasCmd(cfg.hooks.PreToolUse, "bwf-skeleton-completeness-gate.py")) {
  log("  (2) skeleton-gate: already wired, skip");
} else {
  let block = cfg.hooks.PreToolUse.find(g =>
    g.matcher === "Edit|Write" && Array.isArray(g.hooks) &&
    g.hooks.some(h => (h.command || "").includes("red-team-gate.py")));
  if (!block) {
    block = { matcher: "Edit|Write", hooks: [] };
    cfg.hooks.PreToolUse.push(block);
    log("  (2) skeleton-gate: no red-team block found -> created new Edit|Write block");
  } else {
    log("  (2) skeleton-gate: found red-team-gate block, appending");
  }
  block.hooks.push({ type: "command", command: SKEL_CMD });
  log("  (2) skeleton-gate: ADDED");
  settingsTouched = true; changed++;
}

if (settingsTouched) {
  backup(SETTINGS);
  if (!DRY) fs.writeFileSync(SETTINGS, JSON.stringify(cfg, null, 2) + "\n", "utf8");
  log("  settings.json written" + (DRY ? " (skipped — dry-run)" : ""));
}

// ---- action 3: swap the injector ----
log(`\n[3] ${INJ_DST}`);
if (SKIP_INJECTOR) {
  log("  --skip-injector: leaving current injector in place");
} else {
  const already = fs.existsSync(INJ_DST) &&
    fs.readFileSync(INJ_DST, "utf8").includes("SANITIZED variant");
  if (already) {
    log("  injector: already the sanitized variant, skip");
  } else {
    if (fs.existsSync(INJ_DST)) backup(INJ_DST);
    else log("  (no existing injector — will create)");
    if (!DRY) {
      fs.mkdirSync(path.dirname(INJ_DST), { recursive: true });
      fs.copyFileSync(INJ_SRC, INJ_DST);
    }
    log("  injector: REPLACED with sanitized variant" + (DRY ? " (skipped — dry-run)" : ""));
    changed++;
  }
}

// ---- summary ----
log(`\n=== done ${tag} — ${changed} change(s) ${DRY ? "would be" : "were"} made ===`);
if (changed && !DRY) log("Restart the Claude Code session to load the new hooks.");
if (DRY) log("Re-run without --dry-run to apply.");
