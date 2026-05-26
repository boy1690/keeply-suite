#!/usr/bin/env node
/**
 * Plan-Mode Auto-Context Hook (UserPromptSubmit)
 *
 * Detects planning/discussion intent and injects:
 * 1. Current git state (branch, modified files grouped by module)
 * 2. Impact analysis for affected modules (via impact-map.js)
 * 3. Recent commit context
 *
 * Budget: <200ms total, <40 lines output
 *
 * @version 1.1.0
 * @since 2026-02-11
 * @updated 2026-03-31 - v1.1: IBV BUILD compaction recovery injection
 */

const fs = require('fs');
const path = require('path');
const { createTimedHook } = require('./lib/timing-wrapper');
const { getGitState, categorizeByModule } = require('./lib/git-state');
const { extractModuleName, getModuleImpact } = require('./lib/impact-map');

// --- Intent Detection Keywords ---

const PLAN_KEYWORDS = [
  // English
  'plan', 'design', 'architect', 'approach', 'strategy', 'how should',
  'what if', 'trade-off', 'tradeoff', 'consider', 'evaluate', 'compare',
  'before we', 'impact', 'affect', 'scope', 'assess',
  'proposal', 'options', 'alternative',
  // Chinese
  '規劃', '設計', '架構', '方案', '策略', '影響', '評估', '比較',
  '方向', '取捨', '範圍', '衡量', '考慮', '提案', '先想',
  '怎麼做', '該怎麼', '可能影響', '要注意什麼',
];

const EXECUTION_KEYWORDS = [
  '改', '修', '做', '加', '刪', '建', '實作',
  'fix', 'implement', 'create', 'add', 'remove', 'build',
];

const KNOWN_MODULES = [
  'git', 'worktree', 'workspace', 'sync', 'nas',
  'types', 'utils', 'state', 'commands', 'history',
  'stores', 'hooks', 'ui',
];

// Per-command timeouts are in git-state.js (50-100ms each).
// Overall timing monitored by timing-wrapper (warning=100ms, critical=500ms).

/**
 * Detect if the user prompt has planning/discussion intent.
 * @param {string} prompt
 * @returns {{ isPlan: boolean, score: number, mentionedModules: string[] }}
 */
function detectPlanIntent(prompt) {
  const lower = prompt.toLowerCase();
  let score = 0;
  const mentionedModules = [];

  // Plan keywords (+2 each)
  for (const kw of PLAN_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) score += 2;
  }

  // Question marks suggest planning (+1)
  if (prompt.includes('?') || prompt.includes('\uff1f')) score += 1;

  // Execution keywords reduce score (-1 each, floor at 0)
  for (const kw of EXECUTION_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) score -= 1;
  }

  // Explicit file/module path mentions (+3)
  const pathPatterns = [
    /src\/lib\/(\w+)/g,
    /src\/components\/([\w-]+)/g,
    /@\/lib\/(\w+)/g,
  ];
  for (const pattern of pathPatterns) {
    let match;
    while ((match = pattern.exec(prompt)) !== null) {
      mentionedModules.push(match[1]);
      score += 3;
    }
  }
  if (/src\/types/i.test(prompt)) {
    mentionedModules.push('types');
    score += 3;
  }

  // Known module name mentions (+1)
  for (const mod of KNOWN_MODULES) {
    if (lower.includes(mod) && !mentionedModules.includes(mod)) {
      mentionedModules.push(mod);
      score += 1;
    }
  }

  return {
    isPlan: Math.max(0, score) >= 2,
    score: Math.max(0, score),
    mentionedModules: [...new Set(mentionedModules)],
  };
}

/**
 * Build compact context string from git state and impact data.
 * @param {object} gitState - From getGitState()
 * @param {string[]} mentionedModules
 * @returns {string} Markdown context, max ~40 lines
 */
function buildPlanContext(gitState, mentionedModules) {
  const lines = [];
  const allFiles = [...new Set([...gitState.modified, ...gitState.staged])];

  // Section 1: Working State
  lines.push('### Plan Context (auto)');

  const modCount = gitState.modified.length;
  const stagedCount = gitState.staged.length;
  const untrackedCount = gitState.untracked.length;

  if (modCount + stagedCount + untrackedCount === 0) {
    lines.push(`Branch: ${gitState.branch} | Working tree: clean`);
  } else {
    lines.push(`Branch: ${gitState.branch} | ${modCount} modified, ${stagedCount} staged, ${untrackedCount} untracked`);

    // Group modified files by module (max 5 groups)
    const groups = categorizeByModule(allFiles);
    const entries = Object.entries(groups).slice(0, 5);
    if (entries.length > 0) {
      lines.push('```');
      for (const [mod, files] of entries) {
        const fileList = files.length <= 3
          ? files.map(f => path.basename(f)).join(', ')
          : `${files.length} files`;
        lines.push(`  ${mod}: ${fileList}`);
      }
      lines.push('```');
    }
  }

  // Section 2: Impact Analysis
  const affectedModules = new Set(mentionedModules);
  for (const file of allFiles) {
    const mod = extractModuleName(file);
    if (mod) affectedModules.add(mod);
  }

  if (affectedModules.size > 0) {
    const impactLines = [];
    for (const mod of affectedModules) {
      const impact = getModuleImpact(mod);
      if (impact) {
        const consumers = [
          ...impact.libConsumers.slice(0, 3),
          ...impact.componentConsumers.slice(0, 3),
        ].join(', ');
        const total = impact.libConsumers.length + impact.componentConsumers.length;
        const shown = Math.min(impact.libConsumers.length, 3) + Math.min(impact.componentConsumers.length, 3);
        const more = total > shown ? ` +${total - shown}` : '';
        impactLines.push(`- **${mod}** (${impact.type}, ${impact.refs} refs) \u2192 ${consumers}${more}`);
      }
    }
    if (impactLines.length > 0) {
      lines.push('');
      lines.push('**Impact:**');
      lines.push(...impactLines);
    }
  }

  // Section 3: Recent commits (max 3)
  if (gitState.recentCommits.length > 0) {
    lines.push('');
    lines.push('**Recent:**');
    for (const commit of gitState.recentCommits.slice(0, 3)) {
      lines.push(`- ${commit}`);
    }
  }

  // Budget: max 40 lines
  if (lines.length > 40) {
    return lines.slice(0, 38).join('\n') + '\n... (truncated)';
  }

  return lines.join('\n');
}

/**
 * Core hook logic.
 * @param {object} input - { prompt: string }
 * @returns {object} { result: 'continue', additionalContext?: string }
 */
async function processPlanContext(input) {
  const prompt = input.prompt || '';

  // Skill commands have their own workflows — skip plan context injection
  if (/^\/(speckit\.|sdd\b|verify\b)/i.test(prompt.trim())) {
    return { result: 'continue' };
  }

  // Short-circuit: empty or very short prompts
  if (prompt.length < 5) {
    return { result: 'continue' };
  }

  // IBV BUILD compaction recovery (v1.1)
  const recoveryContext = checkCompactionRecovery();
  if (recoveryContext) {
    const { isPlan, score, mentionedModules } = detectPlanIntent(prompt);
    let extra = '';
    if (isPlan) {
      const gitState = getGitState();
      extra = '\n\n' + buildPlanContext(gitState, mentionedModules);
    }
    return {
      result: 'continue',
      additionalContext: recoveryContext + extra
    };
  }

  const { isPlan, score, mentionedModules } = detectPlanIntent(prompt);

  if (!isPlan) {
    return { result: 'continue' };
  }

  const gitState = getGitState();

  const context = buildPlanContext(gitState, mentionedModules);

  return {
    result: 'continue',
    additionalContext: `<!-- planContext: score=${score} modules=${mentionedModules.join(',')} -->\n${context}`,
  };
}

// --- Compaction Recovery (v1.1) ---

/**
 * Detect post-compaction amnesia and inject recovery context from STATUS.md
 * Heuristic: if context-monitor shows 3+ files re-read >2 times, agent likely
 * lost context after compaction. Inject Active Context Checkpoint from STATUS.md.
 *
 * @returns {string|null} Recovery context or null
 */
function checkCompactionRecovery() {
  try {
    const { getRefetchBurst } = require('./lib/context-monitor');
    const sddState = require('./lib/sdd-state');

    const burst = getRefetchBurst(2, 3);
    if (!burst.detected) return null;

    // Only inject during IBV BUILD
    const buildCheck = sddState.isInIbvBuild();
    if (!buildCheck.inBuild || !buildCheck.specId) return null;

    // Read STATUS.md Active Context Checkpoint
    const specsDir = path.join(process.cwd(), 'specs');
    const statusPath = findStatusFile(specsDir, buildCheck.specId);
    if (!statusPath) return null;

    const content = fs.readFileSync(statusPath, 'utf-8');
    const checkpoint = extractCheckpoint(content);
    if (!checkpoint) return null;

    const lines = [
      '### Context Recovery (auto-injected after compaction)',
      '',
      `Spec: \`${buildCheck.specId}\``,
      '',
      checkpoint,
      '',
      `_${burst.hint}_`
    ];

    return lines.join('\n');
  } catch {
    return null;
  }
}

/**
 * Find STATUS.md file for a spec (searches common patterns)
 */
function findStatusFile(specsDir, specId) {
  // Try direct match first
  const directPaths = [
    path.join(specsDir, specId, 'STATUS.md'),
  ];

  // Also try glob-like search for partial matches
  if (fs.existsSync(specsDir)) {
    try {
      const dirs = fs.readdirSync(specsDir);
      for (const dir of dirs) {
        if (dir.includes(specId) || specId.includes(dir)) {
          directPaths.push(path.join(specsDir, dir, 'STATUS.md'));
        }
      }
    } catch { /* ignore */ }
  }

  for (const p of directPaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Extract Active Context Checkpoint section from STATUS.md
 */
function extractCheckpoint(content) {
  const marker = '## Active Context Checkpoint';
  const idx = content.indexOf(marker);
  if (idx === -1) return null;

  // Extract until next ## heading or end
  const rest = content.slice(idx + marker.length);
  const nextHeading = rest.indexOf('\n## ');
  const section = nextHeading >= 0 ? rest.slice(0, nextHeading) : rest;

  // Trim to max 15 lines
  const lines = section.trim().split('\n').slice(0, 15);
  return lines.join('\n');
}

// --- Main ---

const hook = createTimedHook('plan-context', processPlanContext);
hook();
