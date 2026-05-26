#!/usr/bin/env node
/**
 * Template Engine - M11 Haiku Template System
 *
 * 三層模型委派的第三層：把 Type 2（程序式）任務降級為
 * Type 1（宣告式模板），讓 Haiku 可機械性執行。
 *
 * Architecture:
 * - template-engine.js: 分類 + 模板組裝 + 驗證 + 統計
 * - templates/_stats.json: 各模板類型的成功率追蹤
 * - speckit.tasks Step 2.7: [H] 標記分類
 * - speckit.plan Step 2.6E: CB-H entries 產出
 * - speckit.implement Step 6.5: 三層路由
 *
 * @version 1.0.0
 * @since 2026-03-25
 * @module M11
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// Constants
// ============================================================

const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'memory', 'templates');
const STATS_FILE = path.join(TEMPLATES_DIR, '_stats.json');

// Speckit-guarded paths (mirrors speckit.tasks E1)
const SPECKIT_PATHS = [
  'i18n/',
  'i18n.js',
  'i18n-loader.js',
  '.specify/'
];

// Template types
const TEMPLATE_TYPES = {
  'code-transform': {
    name: 'Code Transform',
    description: 'Rename, import path update, codemod',
  },
  'function-fill': {
    name: 'Function Fill-In',
    description: 'Given complete signature + constraints, fill the body',
  },
  'page-scaffold': {
    name: 'Page Scaffold',
    description: 'Given page layout + i18n keys, create HTML page skeleton',
  },
  // Generic (non-SDD) template types
  'scan-report': {
    name: 'Scan Report',
    description: 'Grep/search + format results into markdown table',
  },
  'git-ops': {
    name: 'Git Operations',
    description: 'Execute pre-determined git command sequence',
  },
  'checklist-fill': {
    name: 'Checklist Fill',
    description: 'Fill template checklist with runtime data',
  },
  'diff-review': {
    name: 'Diff Review',
    description: 'Analyze git diff for a specific review dimension',
  },
  // parallel-dev delegation template types
  'consumer-scan': {
    name: 'Consumer Scan',
    description: 'Find all files that import a target export (BP-002 refactor safety)',
  },
  'batch-dispatch': {
    name: 'Batch Task Dispatch',
    description: 'Execute ONE task from multi-task batch plan (1-Agent-1-Task)',
  },
};

// Auto-disable threshold
const MIN_SUCCESS_RATE = 0.5;
const MIN_SAMPLE_SIZE = 5;

// Haiku context limits
const MAX_FILE_LINES = 500;
const MAX_REFERENCE_LINES = 50;
const MAX_PROTOCOLS_HAIKU = 2;

// ============================================================
// Template Registry (data-driven prompt templates)
// ============================================================

/**
 * Load a prompt template from JSON data file
 * Returns null if file doesn't exist → caller falls back to hardcoded
 *
 * @param {string} templateType - e.g. 'scan-report', 'function-fill'
 * @param {string} tier - 'haiku' | 'sonnet'
 * @returns {object | null}
 */
function loadTemplate(templateType, tier) {
  const fp = path.join(TEMPLATES_DIR, `PT-${tier}-${templateType}.json`);
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); }
  catch { return null; }
}

/**
 * Save a template back to its JSON file
 * @param {object} tmpl - template object with id field
 */
function saveTemplate(tmpl) {
  if (!tmpl || !tmpl.id) return;
  const fp = path.join(TEMPLATES_DIR, `${tmpl.id}.json`);
  if (!fs.existsSync(TEMPLATES_DIR)) {
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  }
  fs.writeFileSync(fp, JSON.stringify(tmpl, null, 2), 'utf-8');
}

/**
 * Render a skeleton template with variable interpolation
 * Only does simple {{varName}} → variables[varName] lookup (no eval)
 *
 * @param {string[]} skeleton - array of template lines
 * @param {object} variables - key-value pairs for interpolation
 * @returns {string}
 */
function renderSkeleton(skeleton, variables) {
  if (!Array.isArray(skeleton)) return '';
  const vars = variables || {};
  return skeleton
    .map(line => line.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || ''))
    .filter(line => line.trim() !== '')
    .join('\n');
}

/**
 * Record a template use result into the template's effectiveness block
 * Separate from _stats.json aggregate — tracks per-template per-version
 *
 * @param {string} templateType
 * @param {string} tier
 * @param {string} resultType - 'success' | 'retry1' | 'retry2' | 'escalated'
 */
function recordTemplateUse(templateType, tier, resultType) {
  const tmpl = loadTemplate(templateType, tier);
  if (!tmpl || !tmpl.effectiveness) return;

  const e = tmpl.effectiveness;
  e.total_uses = (e.total_uses || 0) + 1;
  if (resultType === 'success') e.success = (e.success || 0) + 1;
  else if (resultType === 'retry1' || resultType === 'retry2') e.retry = (e.retry || 0) + 1;
  else e.escalated = (e.escalated || 0) + 1;
  e.last_used = new Date().toISOString().split('T')[0];

  saveTemplate(tmpl);
}

/**
 * Get all template files with their effectiveness data
 * Used by template-stats subcommand
 *
 * @returns {object} map of template id → { version, effectiveness, iterate_suggested }
 */
function getTemplateStats() {
  if (!fs.existsSync(TEMPLATES_DIR)) return {};
  const result = {};
  const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.startsWith('PT-') && f.endsWith('.json'));

  for (const file of files) {
    try {
      const tmpl = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, file), 'utf-8'));
      const e = tmpl.effectiveness || {};
      const total = e.total_uses || 0;
      const successCount = (e.success || 0) + (e.retry || 0);
      const successRate = total > 0 ? successCount / total : null;

      result[tmpl.id] = {
        version: tmpl.version || 1,
        template_type: tmpl.template_type,
        tier: tmpl.tier,
        total_uses: total,
        success_rate: successRate !== null ? Math.round(successRate * 100) / 100 : null,
        iterate_suggested: total >= 5 && successRate !== null && successRate < 0.7,
        ...(total >= 5 && successRate !== null && successRate < 0.7
          ? { reason: `success rate ${Math.round(successRate * 100)}% below 70% threshold` }
          : {})
      };
    } catch { /* skip corrupted files */ }
  }

  return result;
}

// ============================================================
// Task Parsing
// ============================================================

/**
 * Parse a single task line from tasks.md
 * Format: - [ ] T### [P?] [H?] [US#?] Description (`file paths`) [⚠️?]
 *
 * @param {string} line
 * @returns {{ id: string, description: string, filePaths: string[], markers: string[] } | null}
 */
function parseTaskLine(line) {
  const match = line.match(/^- \[[ x]\] (T\d+)\s*((?:\[[^\]]+\]\s*)*)(.*?)$/);
  if (!match) return null;

  const id = match[1];
  const tagBlock = match[2];
  const description = match[3].trim();

  // Extract tags: [P], [H], [US1], etc.
  const markers = [];
  const tagMatches = tagBlock.matchAll(/\[([^\]]+)\]/g);
  for (const tm of tagMatches) markers.push(tm[1]);

  // Extract file paths from backtick-parens: (`path/to/file.html`)
  const filePaths = [];
  const fileMatches = description.matchAll(/\(`([^`]+)`\)/g);
  for (const fm of fileMatches) filePaths.push(fm[1]);

  // Also match inline backtick paths without parens
  if (filePaths.length === 0) {
    const inlineMatches = description.matchAll(/`([a-zA-Z][\w./\\-]*\.\w+)`/g);
    for (const im of inlineMatches) filePaths.push(im[1]);
  }

  // Check for special markers
  if (description.includes('\u26a0\ufe0f')) markers.push('warning');
  if (description.includes('\ud83e\uddea')) markers.push('E2E');

  return { id, description, filePaths, markers };
}

// ============================================================
// Task Classification
// ============================================================

/**
 * Check if file paths touch multiple domains
 * @param {string[]} filePaths
 * @returns {boolean}
 */
function hasMultipleDomains(filePaths) {
  const domains = new Set();
  for (const p of filePaths) {
    if (p.includes('/i18n/')) domains.add('i18n');
    else if (p.includes('.html')) domains.add('pages');
    else if (p.includes('.js')) domains.add('scripts');
    else if (p.includes('.css')) domains.add('styles');
  }
  return domains.size > 2;
}

// Classification rules
const OPUS_RULES = [
  { rule: 'speckit_guard', test: (task) => task.markers.includes('warning') },
  { rule: 'architecture', test: (task) => /architect|design\s+decision|novel\s+algorithm/i.test(task.description) },
  { rule: 'speckit_path', test: (task) => task.filePaths.some(p => SPECKIT_PATHS.some(sp => p.includes(sp))) },
  { rule: 'cross_domain', test: (task) => task.filePaths.length > 3 && hasMultipleDomains(task.filePaths) },
];

const HAIKU_POSITIVE = [
  { rule: 'rename_codemod', test: (task) => /rename|codemod|import.*updat|replace.*with|sed\s+/i.test(task.description) },
  { rule: 'scaffold', test: (task) => /scaffold|skeleton|stub|boilerplate|empty.*page|new.*page/i.test(task.description) },
  { rule: 'deprecated_mark', test: (task) => /deprecat|JSDoc|@deprecated|remove.*unused|dead.*code/i.test(task.description) },
  { rule: 'import_update', test: (task) => /import.*updat|import.*add|re-export|barrel/i.test(task.description) && task.filePaths.length <= 2 },
  // Generic (non-SDD) positive rules
  { rule: 'scan_report', test: (task) => /scan|grep.*report|completeness|search.*pattern|search.*codebase/i.test(task.description) },
  { rule: 'git_ops', test: (task) => /git\s+(add|commit|push|tag|worktree|bisect)/i.test(task.description) && task.filePaths.length <= 1 },
  { rule: 'checklist_fill', test: (task) => /checklist|summary|report.*status|initialize.*review/i.test(task.description) },
];

const HAIKU_NEGATIVE = [
  { rule: 'multi_file', test: (task) => task.filePaths.length > 2 },
  { rule: 'reasoning_required', test: (task) => /implement.*logic|business.*logic|algorithm|complex|recursive|state.*manag/i.test(task.description) },
  { rule: 'speckit_path', test: (task) => task.filePaths.some(p => SPECKIT_PATHS.some(sp => p.includes(sp))) },
  { rule: 'wiring_multi', test: (task) => /wire|mount|integration|consumer|toolbar/i.test(task.description) && task.filePaths.length > 1 },
  { rule: 'e2e_marker', test: (task) => task.markers.includes('E2E') },
  // Generic negative: tasks requiring judgment
  { rule: 'review_judgment', test: (task) => /review.*logic|assess.*architecture|evaluate.*design/i.test(task.description) },
];

/**
 * Classify a task into execution tier
 *
 * Priority: opus > haiku > sonnet (default)
 * Conservative: when in doubt, classify as sonnet
 *
 * @param {{ id: string, description: string, filePaths: string[], markers: string[] }} task
 * @returns {'opus' | 'sonnet' | 'haiku'}
 */
function classifyTask(task) {
  // Step 1: Check opus rules (highest priority)
  for (const rule of OPUS_RULES) {
    if (rule.test(task)) return 'opus';
  }

  // Step 2: Check haiku eligibility (positive AND no negative)
  const hasPositive = HAIKU_POSITIVE.some(r => r.test(task));
  const hasNegative = HAIKU_NEGATIVE.some(r => r.test(task));

  if (hasPositive && !hasNegative) {
    // Extra check: template type must not be disabled
    const templateType = detectTemplateType(task);
    if (!isTemplateTypeDisabled(templateType)) {
      return 'haiku';
    }
  }

  // Step 3: Default to sonnet
  return 'sonnet';
}

/**
 * Classify all tasks from tasks.md content
 *
 * @param {string} tasksContent - full content of tasks.md
 * @returns {Map<string, 'opus' | 'sonnet' | 'haiku'>}
 */
function classifyAllTasks(tasksContent) {
  const results = new Map();
  const lines = tasksContent.split('\n');

  for (const line of lines) {
    const task = parseTaskLine(line);
    if (!task) continue;

    const tier = classifyTask(task);
    results.set(task.id, tier);
  }

  return results;
}

// ============================================================
// Template Type Detection
// ============================================================

/**
 * Detect which template type applies to a Haiku-eligible task
 *
 * @param {{ description: string }} task
 * @returns {string} template type key
 */
function detectTemplateType(task) {
  const desc = task.description.toLowerCase();

  if (/rename|codemod|import.*updat|replace.*with|move.*to|re-export|sed\s+/i.test(desc)) return 'code-transform';
  if (/scaffold|skeleton|stub|empty.*page|new.*page|boilerplate/i.test(desc)) return 'page-scaffold';
  // parallel-dev delegation types (check before generic scan-report)
  if (/consumer.*scan|find.*import|all.*consumer|impact.*map.*import/i.test(desc)) return 'consumer-scan';
  if (/batch.*dispatch|execute.*task.*from.*plan|batch.*task.*execut/i.test(desc)) return 'batch-dispatch';
  // Generic (non-SDD) template types
  if (/scan|grep.*report|completeness|search.*pattern|search.*codebase/i.test(desc)) return 'scan-report';
  if (/git\s+(add|commit|push|tag|worktree|bisect)/i.test(desc)) return 'git-ops';
  if (/checklist|summary|report.*status|initialize.*review/i.test(desc)) return 'checklist-fill';
  if (/review.*diff|analyze.*changes|review.*code/i.test(desc)) return 'diff-review';
  return 'function-fill'; // default
}

// ============================================================
// Prompt Assembly
// ============================================================

/**
 * Build template-specific instruction section
 *
 * @param {string} templateType
 * @param {object} cb - Codebook CB-H entry (may be null)
 * @returns {string}
 */
function buildTemplateSection(templateType, cb) {
  if (!cb) return '## Instructions\nFollow the task description exactly.';

  switch (templateType) {
    case 'code-transform':
      return [
        '## Instructions',
        cb.searchPattern ? `Search for: \`${cb.searchPattern}\`` : '',
        cb.replacePattern ? `Replace with: \`${cb.replacePattern}\`` : '',
        cb.scope ? `Scope: ${cb.scope}` : '',
        'Apply the transformation to EVERY occurrence in the file.',
      ].filter(Boolean).join('\n');

    case 'function-fill':
      return [
        cb.signature ? `## Function to Implement\n\`\`\`js\n${cb.signature}\n\`\`\`` : '',
        cb.pseudocode ? `\n## Pseudocode\n\`\`\`\n${cb.pseudocode}\n\`\`\`` : '',
        cb.imports ? `\n## Required Imports\n\`\`\`js\n${cb.imports}\n\`\`\`` : '',
        cb.edgeCases ? `\n## Edge Cases\n${cb.edgeCases.map(e => `- ${e}`).join('\n')}` : '',
      ].filter(Boolean).join('\n');

    case 'page-scaffold':
      return [
        `## Page to Create`,
        cb.pageName ? `Name: \`${cb.pageName}\`` : '',
        cb.i18nKeys ? `\n## i18n Keys\n${cb.i18nKeys.map(k => `- \`${k}\``).join('\n')}` : '',
        `\n## Structure`,
        cb.structure || 'Follow existing HTML page structure (nav, sections, footer).',
      ].filter(Boolean).join('\n');

    default:
      return '## Instructions\nFollow the task description exactly.';
  }
}

/**
 * Assemble a complete Haiku-ready prompt
 *
 * Zero ambiguity — all decisions pre-made by Opus.
 *
 * @param {object} params
 * @param {object} params.task - parsed task
 * @param {string} params.templateType - from detectTemplateType
 * @param {object} [params.codebookEntry] - CB-H entry from plan.md
 * @param {string} [params.fileContent] - target file content (pre-read by Opus)
 * @param {string} [params.referencePattern] - similar code from codebase
 * @param {Array<{ protocol: object }>} [params.protocols] - matched M10 protocols
 * @returns {string}
 */
function assembleHaikuPrompt(params) {
  const { task, templateType, codebookEntry, fileContent, referencePattern, protocols } = params;
  const tmpl = loadTemplate(templateType, 'haiku');

  // Use template limits or global defaults
  const maxFileLines = tmpl?.limits?.max_file_lines || MAX_FILE_LINES;
  const maxRefLines = tmpl?.limits?.max_reference_lines || MAX_REFERENCE_LINES;
  const maxProtos = tmpl?.limits?.max_protocols || MAX_PROTOCOLS_HAIKU;

  const sections = [];

  // Section 1: Role constraint (from template or hardcoded fallback)
  sections.push(tmpl?.sections?.role || 'You are a code executor. You follow instructions exactly. Do NOT make design decisions — all decisions have been made for you.');
  sections.push('');

  // Section 2: Task (always dynamic)
  sections.push(`## Task: ${task.id}`);
  sections.push(task.description);
  sections.push('');

  // Section 3: Template-specific structure (from skeleton or buildTemplateSection fallback)
  if (tmpl?.sections?.instructions_skeleton && codebookEntry) {
    sections.push(renderSkeleton(tmpl.sections.instructions_skeleton, codebookEntry));
  } else {
    sections.push(buildTemplateSection(templateType, codebookEntry));
  }
  sections.push('');

  // Section 4: Current file content (truncated)
  if (fileContent) {
    const lines = fileContent.split('\n');
    const truncated = lines.slice(0, maxFileLines).join('\n');
    sections.push('## Current File Content');
    sections.push('```html');
    sections.push(truncated);
    if (lines.length > maxFileLines) {
      sections.push(`<!-- ... truncated (${lines.length - maxFileLines} more lines) -->`);
    }
    sections.push('```');
    sections.push('');
  }

  // Section 5: Reference pattern (truncated)
  if (referencePattern) {
    const lines = referencePattern.split('\n');
    const truncated = lines.slice(0, maxRefLines).join('\n');
    sections.push('## Reference Pattern (follow this style)');
    sections.push('```html');
    sections.push(truncated);
    sections.push('```');
    sections.push('');
  }

  // Section 6: Constraints (from template or hardcoded fallback)
  const constraints = tmpl?.sections?.constraints || [
    'Output MUST render correctly in Chrome, Firefox, Safari, Edge',
    'Use Tailwind CSS classes for all styling (no inline styles)',
    'All user-facing text must use data-i18n attributes',
    'Follow existing HTML structure (semantic elements)',
    'Zero external dependencies — no npm, no build tools',
  ];
  sections.push('## Constraints');
  constraints.forEach(c => sections.push(`- ${c}`));
  sections.push('');

  // Section 7: M10 Protocols (condensed DO/DON'T only)
  if (protocols && protocols.length > 0) {
    const condensed = formatProtocolsForHaiku(protocols.slice(0, maxProtos));
    if (condensed) {
      sections.push(condensed);
      sections.push('');
    }
  }

  // Section 8: Output format (from template or hardcoded fallback)
  sections.push('## Output');
  sections.push(tmpl?.sections?.output_format || 'Return ONLY the complete modified file content. No explanations, no markdown fences around the outer response.');

  return sections.join('\n');
}

/**
 * Extract only DO/DON'T blocks from protocols for Haiku
 * Haiku doesn't need STOP/CHECK reasoning — just mechanical rules
 *
 * @param {Array<{ protocol: object }>} matches
 * @returns {string}
 */
function formatProtocolsForHaiku(matches) {
  if (!matches || matches.length === 0) return '';

  const lines = ['## Safety Rules', ''];

  for (const { protocol } of matches.slice(0, MAX_PROTOCOLS_HAIKU)) {
    const doMatch = protocol.prompt_block.match(/DO:\n```[\s\S]*?```/);
    const dontMatch = protocol.prompt_block.match(/DON'T:\n```[\s\S]*?```/);

    if (doMatch || dontMatch) {
      lines.push(`### ${protocol.name}`);
      if (doMatch) lines.push(doMatch[0]);
      if (dontMatch) lines.push(dontMatch[0]);
      lines.push('');
    }
  }

  return lines.length > 2 ? lines.join('\n') : '';
}

// ============================================================
// Verification Helpers
// ============================================================

/**
 * Build retry prompt with error context
 *
 * @param {object} originalParams - original assembleHaikuPrompt params
 * @param {string[]} errors - type-check errors
 * @returns {string}
 */
function buildRetryPrompt(originalParams, errors) {
  return [
    '## RETRY: Your previous output had type errors',
    '',
    '### Errors',
    errors.map(e => `- ${e}`).join('\n'),
    '',
    '### Instructions',
    'Fix ONLY the type errors listed above. Do not change anything else.',
    'Return the complete corrected file content.',
    '',
    `### Original Task: ${originalParams.task.id}`,
    originalParams.task.description,
  ].join('\n');
}

/**
 * Build Sonnet escalation context from Haiku failure
 *
 * @param {object} params
 * @param {object} params.originalTask
 * @param {string} params.haikuOutput - last Haiku attempt
 * @param {string[]} params.errors - accumulated errors
 * @param {object} [params.codebookEntry]
 * @returns {string}
 */
function buildEscalationContext(params) {
  const { originalTask, haikuOutput, errors, codebookEntry } = params;

  return [
    `## Escalated Task: ${originalTask.id}`,
    '> Haiku attempted this task twice and failed. You are taking over.',
    '',
    '### Task Description',
    originalTask.description,
    '',
    '### Haiku\'s Last Attempt (had errors)',
    '```html',
    haikuOutput,
    '```',
    '',
    '### Errors to Fix',
    errors.map(e => `- ${e}`).join('\n'),
    '',
    codebookEntry ? `### Codebook Reference\n${JSON.stringify(codebookEntry, null, 2)}` : '',
    '',
    '### Instructions',
    'Fix the errors and complete the implementation. You have full reasoning capabilities.',
  ].filter(Boolean).join('\n');
}

// ============================================================
// Conflict Detection
// ============================================================

/**
 * Group tasks into non-conflicting batches (same file = sequential)
 *
 * @param {Array<{ id: string, filePaths: string[] }>} tasks
 * @returns {Array<Array<{ id: string, filePaths: string[] }>>} groups of non-conflicting tasks
 */
function groupNonConflicting(tasks) {
  const groups = [];
  const assigned = new Set();

  for (const task of tasks) {
    if (assigned.has(task.id)) continue;

    const group = [task];
    assigned.add(task.id);

    for (const other of tasks) {
      if (assigned.has(other.id)) continue;

      const overlap = task.filePaths.some(f => other.filePaths.includes(f));
      if (!overlap) {
        group.push(other);
        assigned.add(other.id);
      }
    }

    groups.push(group);
  }

  return groups;
}

// ============================================================
// Statistics Tracking
// ============================================================

/**
 * Load stats from _stats.json
 * @returns {object}
 */
function loadStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
    }
  } catch {
    // Corrupted stats file — start fresh
  }
  return {};
}

/**
 * Save stats to _stats.json
 * @param {object} stats
 */
function saveStats(stats) {
  const dir = path.dirname(STATS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
}

/**
 * Record a Haiku task result
 *
 * @param {string} taskId
 * @param {string} templateType
 * @param {{ success: boolean, retries: number }} result
 * @param {string} [source='sdd'] - Source workflow (sdd|fix-completeness|task-completion|...)
 */
function recordResult(taskId, templateType, result, source = 'sdd') {
  const stats = loadStats();

  if (!stats[templateType]) {
    stats[templateType] = { total: 0, success: 0, retry1: 0, retry2: 0, escalated: 0, sources: {} };
  }

  const s = stats[templateType];
  s.total++;

  if (result.success) {
    if (result.retries === 0) s.success++;
    else if (result.retries === 1) s.retry1++;
    else s.retry2++;
  } else {
    s.escalated++;
  }

  // Track source workflow
  if (!s.sources) s.sources = {};
  s.sources[source] = (s.sources[source] || 0) + 1;

  stats.last_updated = new Date().toISOString().split('T')[0];
  saveStats(stats);
}

/**
 * Get success rate for a template type
 * Success = first attempt + retry1 + retry2 (anything that didn't escalate)
 *
 * @param {string} templateType
 * @returns {number | null} rate (0-1) or null if insufficient data
 */
function getSuccessRate(templateType) {
  const stats = loadStats();
  const s = stats[templateType];
  if (!s || s.total < MIN_SAMPLE_SIZE) return null;
  return (s.success + s.retry1 + s.retry2) / s.total;
}

/**
 * Check if a template type should be auto-disabled
 * Disabled when escalation rate > 50% after MIN_SAMPLE_SIZE attempts
 *
 * @param {string} templateType
 * @returns {boolean}
 */
function isTemplateTypeDisabled(templateType) {
  const rate = getSuccessRate(templateType);
  if (rate === null) return false; // insufficient data, allow
  return rate < MIN_SUCCESS_RATE;
}

/**
 * Get full stats object
 * @returns {object}
 */
function getStats() {
  return loadStats();
}

// ============================================================
// Module Exports
// ============================================================

module.exports = {
  // Constants
  TEMPLATE_TYPES,
  SPECKIT_PATHS,

  // Template Registry
  loadTemplate,
  saveTemplate,
  renderSkeleton,
  recordTemplateUse,
  getTemplateStats,

  // Parsing
  parseTaskLine,

  // Classification
  classifyTask,
  classifyAllTasks,

  // Template detection
  detectTemplateType,

  // Prompt assembly
  buildTemplateSection,
  assembleHaikuPrompt,
  formatProtocolsForHaiku,

  // Verification
  buildRetryPrompt,
  buildEscalationContext,

  // Conflict detection
  groupNonConflicting,

  // Statistics
  recordResult,
  getSuccessRate,
  isTemplateTypeDisabled,
  getStats,
};
