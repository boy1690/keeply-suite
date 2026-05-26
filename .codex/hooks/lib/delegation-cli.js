#!/usr/bin/env node
/**
 * Delegation CLI — 三層模型委派的執行橋接層
 *
 * Agent 透過 Bash 呼叫此 CLI，取得組裝好的 prompt，
 * 再餵給 Task(model="haiku/sonnet") 進行實際委派。
 *
 * Subcommands:
 *   classify         — 分類所有 tasks 為 opus/sonnet/haiku
 *   assemble-haiku   — 組裝 Haiku 零歧義 prompt
 *   assemble-sonnet  — 組裝 Sonnet 完整 context bundle
 *   match-protocols  — 匹配 M10 行為協議
 *   record           — 記錄 Haiku 執行結果
 *   build-retry      — 組裝 Haiku 重試 prompt
 *   build-escalation — 組裝 Haiku→Sonnet 升級 prompt
 *   group-tasks      — 並行分組（non-conflicting）
 *   stats            — 查看模板統計
 *
 * Generic (non-SDD) subcommands:
 *   classify-inline         — 分類單一 ad-hoc 任務（不需 tasks.md）
 *   assemble-haiku-generic  — 組裝 Haiku prompt（不需 plan.md/tasks.md）
 *   assemble-sonnet-generic — 組裝 Sonnet context bundle（不需 plan.md/tasks.md）
 *
 * Scout subcommand (lightweight Haiku recon):
 *   scout                   — 組裝 Haiku 偵察 prompt（file-scan/grep-scan/status-check/progress-poll）
 *
 * Batch Execution subcommands (parallel-dev delegation):
 *   batch-plan           — 拓撲排序 + tier 分層（零 token）
 *   batch-dispatch       — 組裝 1:1 sub-agent lean prompt
 *   batch-verify         — type-check + domain invariants（零 token）
 *
 * @version 2.3.0
 * @since 2026-03-25
 */

const fs = require('fs');
const path = require('path');

// Load engines from same directory
const templateEngine = require('./template-engine.js');
const protocolEngine = require('./protocol-engine.js');

// ============================================================
// Arg parsing (zero dependencies)
// ============================================================

function parseArgs(argv) {
  const args = {};
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else {
      positional.push(argv[i]);
    }
  }

  return { args, positional };
}

// ============================================================
// Helpers: tasks.md parsing
// ============================================================

/**
 * Find a specific task by ID from tasks.md content
 */
function parseTaskById(tasksContent, taskId) {
  const lines = tasksContent.split('\n');
  for (const line of lines) {
    const task = templateEngine.parseTaskLine(line);
    if (task && task.id === taskId) return task;
  }
  return null;
}

/**
 * Parse all tasks from tasks.md content
 */
function parseAllTasks(tasksContent) {
  const tasks = [];
  const lines = tasksContent.split('\n');
  for (const line of lines) {
    const task = templateEngine.parseTaskLine(line);
    if (task) tasks.push(task);
  }
  return tasks;
}

// ============================================================
// Helpers: plan.md Codebook extraction
// ============================================================

/**
 * Extract a specific CB-H or CB-N entry from plan.md
 * Searches for ### CB-H1, ### CB-1, etc.
 */
function extractCodebookEntry(planContent, taskId, section) {
  const prefix = section === 'H' ? 'CB-H' : 'CB-';

  // Try matching by task ID reference (e.g., "**Task Match**: T004")
  const taskPattern = new RegExp(
    `### ${prefix}\\d+[^]*?\\*\\*Task Match\\*\\*:\\s*${taskId}[^]*?(?=\\n### |\\n## |$)`,
    'g'
  );
  const taskMatch = planContent.match(taskPattern);
  if (taskMatch) return taskMatch[0].trim();

  // Fallback: search for any CB-H entry mentioning the task ID
  const fallbackPattern = new RegExp(
    `### ${prefix}\\d+[^]*?${taskId}[^]*?(?=\\n### |\\n## |$)`,
    'g'
  );
  const fallbackMatch = planContent.match(fallbackPattern);
  if (fallbackMatch) return fallbackMatch[0].trim();

  return null;
}

/**
 * Extract all Codebook entries relevant to given file paths
 */
function extractRelevantCodebookEntries(planContent, targetFiles) {
  const entries = [];

  // Match all CB-N sections (A: Function Blueprints, C: Do/Don't, D: Tests)
  const cbPattern = /### (CB-\w+):\s*([^\n]+)\n([\s\S]*?)(?=\n### CB-|\n## |$)/g;
  let match;

  while ((match = cbPattern.exec(planContent)) !== null) {
    const cbId = match[1];
    const cbTitle = match[2].trim();
    const cbContent = match[3];

    // Check if entry references any target file
    const isRelevant = targetFiles.some(tf => {
      const basename = path.basename(tf);
      return cbContent.includes(basename) || cbContent.includes(tf);
    });

    if (isRelevant) {
      entries.push({
        id: cbId,
        title: cbTitle,
        content: `### ${cbId}: ${cbTitle}\n${cbContent.trim()}`
      });
    }
  }

  return entries;
}

// ============================================================
// Helpers: Reference pattern + Constitution
// ============================================================

/**
 * Find a reference pattern file in the same directory as target
 */
function grepReferencePattern(targetFile) {
  const dir = path.dirname(targetFile);
  if (!fs.existsSync(dir)) return '';

  const ext = path.extname(targetFile);
  const basename = path.basename(targetFile);

  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith(ext) && f !== basename && !f.includes('.test.'))
      .sort()
      .slice(0, 1);

    if (files.length === 0) return '';

    const refContent = fs.readFileSync(path.join(dir, files[0]), 'utf-8');
    const lines = refContent.split('\n').slice(0, 50);
    return lines.join('\n');
  } catch {
    return '';
  }
}

/**
 * Load applicable constitution rules based on file paths
 */
function loadConstitutionRules(filePaths) {
  const rules = new Set();

  for (const fp of filePaths) {
    rules.add('Art. 5: Code Hygiene - Use `logger` from `@/lib/utils/logger.ts`, NEVER `console.log`');
    rules.add('Art. 2: Type Safety - No `any` types');

    if (fp.includes('src/lib/')) {
      rules.add('Art. 1: Library-First - Business logic in src/lib/, not components');
      rules.add('Art. 8: Testing - Core logic requires TDD (write test first)');
    }

    if (fp.includes('src-tauri/src/git/') || fp.includes('src-tauri/src/nas/') || fp.includes('.speckit/')) {
      rules.add('Art. 13: SDD - Speckit paths require parity gate verification');
    }

    if (fp.includes('src/components/')) {
      rules.add('Art. 6: File Naming - PascalCase for components, kebab-case for utils');
    }
  }

  return [...rules];
}

// ============================================================
// Subcommand: classify
// ============================================================

function handleClassify(args) {
  const tasksFile = path.resolve(args['tasks-file']);
  if (!fs.existsSync(tasksFile)) {
    process.stderr.write(`ERROR: tasks file not found: ${tasksFile}\n`);
    process.exit(1);
  }

  const tasksContent = fs.readFileSync(tasksFile, 'utf-8');
  const allTasks = parseAllTasks(tasksContent);
  const classification = { opus: [], sonnet: [], haiku: [], metadata: {} };

  let speckitPaths = 0;

  for (const task of allTasks) {
    const tier = templateEngine.classifyTask(task);
    classification[tier].push(task.id);

    if (task.filePaths.some(p => templateEngine.SPECKIT_PATHS.some(sp => p.includes(sp)))) {
      speckitPaths++;
    }
  }

  classification.metadata = {
    total: allTasks.length,
    speckit_paths: speckitPaths
  };

  console.log(JSON.stringify(classification, null, 2));
}

// ============================================================
// Subcommand: assemble-haiku
// ============================================================

function handleAssembleHaiku(args) {
  const taskId = args.task;
  const planFile = path.resolve(args['plan-file']);
  const targetFile = path.resolve(args['target-file']);
  const tasksFile = path.resolve(args['tasks-file']);

  if (!taskId || !args['plan-file'] || !args['target-file'] || !args['tasks-file']) {
    process.stderr.write('ERROR: assemble-haiku requires --task, --plan-file, --target-file, --tasks-file\n');
    process.exit(1);
  }

  const tasksContent = fs.readFileSync(tasksFile, 'utf-8');
  const task = parseTaskById(tasksContent, taskId);
  if (!task) {
    process.stderr.write(`ERROR: Task ${taskId} not found in ${tasksFile}\n`);
    process.exit(1);
  }

  // Defensive checks
  if (task.markers.includes('warning')) {
    process.stderr.write(`ERROR: Task ${taskId} has Speckit path marker - cannot use Haiku mode\n`);
    process.exit(1);
  }
  if (task.filePaths.length > 2) {
    process.stderr.write(`ERROR: Task ${taskId} has ${task.filePaths.length} files - cannot use Haiku mode (max 2)\n`);
    process.exit(1);
  }

  // Detect template type
  const templateType = templateEngine.detectTemplateType(task);

  // Check if disabled
  if (templateEngine.isTemplateTypeDisabled(templateType)) {
    process.stderr.write(`WARN: Template type "${templateType}" is auto-disabled (low success rate) - escalating to sonnet\n`);
    process.exit(1);
  }

  // Extract CB-H entry from plan.md
  const planContent = fs.readFileSync(planFile, 'utf-8');
  const codebookEntryRaw = extractCodebookEntry(planContent, taskId, 'H');

  // Parse CB-H into structured object (or null)
  let codebookEntry = null;
  if (codebookEntryRaw) {
    // Pass raw markdown as a simple object with description
    codebookEntry = { description: codebookEntryRaw };
  }

  // Read target file
  const fileContent = fs.existsSync(targetFile)
    ? fs.readFileSync(targetFile, 'utf-8')
    : '';

  // Find reference pattern
  const referencePattern = grepReferencePattern(targetFile);

  // Match protocols
  const protocolMatches = protocolEngine.matchProtocols({
    filePaths: [targetFile],
    keywords: task.description.split(/\s+/).filter(w => w.length > 3),
    codePatterns: []
  });

  // Assemble prompt
  const prompt = templateEngine.assembleHaikuPrompt({
    task,
    templateType,
    codebookEntry,
    fileContent,
    referencePattern,
    protocols: protocolMatches.slice(0, 2)
  });

  console.log(prompt);
}

// ============================================================
// Subcommand: assemble-sonnet
// ============================================================

function handleAssembleSonnet(args) {
  const taskId = args.task;
  const planFile = path.resolve(args['plan-file']);
  const targetFilesStr = args['target-files'];
  const tasksFile = path.resolve(args['tasks-file']);

  if (!taskId || !args['plan-file'] || !targetFilesStr || !args['tasks-file']) {
    process.stderr.write('ERROR: assemble-sonnet requires --task, --plan-file, --target-files, --tasks-file\n');
    process.exit(1);
  }

  const targetFiles = targetFilesStr.split(',').map(f => path.resolve(f.trim()));
  const tasksContent = fs.readFileSync(tasksFile, 'utf-8');
  const task = parseTaskById(tasksContent, taskId);
  if (!task) {
    process.stderr.write(`ERROR: Task ${taskId} not found in ${tasksFile}\n`);
    process.exit(1);
  }

  const planContent = fs.readFileSync(planFile, 'utf-8');

  // Extract relevant Codebook entries
  const codebookEntries = extractRelevantCodebookEntries(planContent, targetFiles);

  // Read target files
  const fileContents = targetFiles.map(fp => ({
    path: fp.replace(/\\/g, '/'),
    content: fs.existsSync(fp) ? fs.readFileSync(fp, 'utf-8') : ''
  }));

  // Match protocols (max 3 for Sonnet)
  const protocolMatches = protocolEngine.matchProtocols({
    filePaths: targetFiles,
    keywords: task.description.split(/\s+/).filter(w => w.length > 3),
    codePatterns: []
  });

  // Load constitution rules
  const constitutionRules = loadConstitutionRules(targetFiles);

  // Load Sonnet template (fallback to hardcoded)
  const sonnetTmpl = templateEngine.loadTemplate('default', 'sonnet');
  const maxFileLines = sonnetTmpl?.limits?.max_file_lines || 500;

  // Assemble context bundle
  const sections = [];

  // Header
  sections.push(`# Task: ${task.id} ${task.description}`);
  sections.push('');
  sections.push(`> ${sonnetTmpl?.sections?.role || 'Execution Model: Sonnet (delegated). All design decisions made by Opus.'}`);
  sections.push('');
  sections.push('---');
  sections.push('');

  // Task description
  sections.push('## Task Description');
  sections.push('');
  sections.push(task.description);
  sections.push('');
  if (task.filePaths.length > 0) {
    sections.push('Files to modify:');
    task.filePaths.forEach(fp => sections.push(`- \`${fp}\``));
    sections.push('');
  }
  sections.push('---');
  sections.push('');

  // Codebook entries
  if (codebookEntries.length > 0) {
    sections.push('## Implementation Codebook');
    sections.push('');
    sections.push('> From plan.md - follow these blueprints exactly.');
    sections.push('');
    codebookEntries.forEach(entry => {
      sections.push(entry.content);
      sections.push('');
    });
    sections.push('---');
    sections.push('');
  }

  // File contents (truncated)
  sections.push('## Current File Content');
  sections.push('');
  fileContents.forEach(({ path: fp, content }) => {
    const relativePath = fp.replace(process.cwd().replace(/\\/g, '/') + '/', '');
    sections.push(`### ${relativePath}`);
    if (!content) {
      sections.push('> File does not exist yet (new file)');
    } else {
      sections.push('```typescript');
      const lines = content.split('\n');
      sections.push(lines.slice(0, maxFileLines).join('\n'));
      if (lines.length > maxFileLines) {
        sections.push(`// ... truncated (${lines.length - maxFileLines} more lines)`);
      }
      sections.push('```');
    }
    sections.push('');
  });
  sections.push('---');
  sections.push('');

  // Protocols
  if (protocolMatches.length > 0) {
    const formatted = protocolEngine.formatForSonnet(protocolMatches);
    if (formatted) {
      sections.push(formatted);
      sections.push('');
    }
  }

  // Constitution rules
  if (constitutionRules.length > 0) {
    sections.push('## Constitution Rules');
    sections.push('');
    constitutionRules.forEach(rule => sections.push(`- **${rule}**`));
    sections.push('');
    sections.push('---');
    sections.push('');
  }

  // Output requirements (from template or hardcoded)
  sections.push('## Output Requirements');
  sections.push('');
  if (sonnetTmpl?.sections?.output_format) {
    sections.push(sonnetTmpl.sections.output_format);
  } else {
    sections.push('1. Return ONLY the modified file content (complete file, not diffs)');
    sections.push('2. Must pass `npm run type-check`');
    sections.push('3. Follow existing code style');
  }
  if (task.markers.includes('warning')) {
    sections.push('4. Speckit path detected - parity gate will run after implementation');
  }

  console.log(sections.join('\n'));
}

// ============================================================
// Subcommand: match-protocols
// ============================================================

function handleMatchProtocols(args) {
  const files = (args.files || '').split(',').filter(Boolean).map(f => path.resolve(f.trim()));
  const keywords = (args.keywords || '').split(',').filter(Boolean);

  if (files.length === 0 && keywords.length === 0) {
    process.stderr.write('ERROR: match-protocols requires --files and/or --keywords\n');
    process.exit(1);
  }

  const matches = protocolEngine.matchProtocols({
    filePaths: files,
    keywords,
    codePatterns: []
  });

  const result = matches.map(({ protocol, matchedKeywords, score }) => ({
    id: protocol.id,
    name: protocol.name,
    severity: protocol.severity,
    category: protocol.category,
    score: Math.round(score * 100) / 100,
    matched_keywords: matchedKeywords
  }));

  console.log(JSON.stringify(result, null, 2));
}

// ============================================================
// Subcommand: record
// ============================================================

function handleRecord(args) {
  const taskId = args.task;
  const templateType = args['template-type'];
  const resultType = args.result;

  if (!taskId || !templateType || !resultType) {
    process.stderr.write('ERROR: record requires --task, --template-type, --result (success|retry1|retry2|escalated)\n');
    process.exit(1);
  }

  const validResults = ['success', 'retry1', 'retry2', 'escalated'];
  if (!validResults.includes(resultType)) {
    process.stderr.write(`ERROR: --result must be one of: ${validResults.join(', ')}\n`);
    process.exit(1);
  }

  const result = {
    success: resultType !== 'escalated',
    retries: resultType === 'retry1' ? 1 : resultType === 'retry2' ? 2 : 0
  };

  const source = args.source || 'sdd';
  templateEngine.recordResult(taskId, templateType, result, source);

  // Also update per-template effectiveness (PT-*.json)
  const tier = args.tier || 'haiku';
  templateEngine.recordTemplateUse(templateType, tier, resultType);

  const stats = templateEngine.getStats();
  const typeStats = stats[templateType] || {};
  const total = typeStats.total || 0;
  const successRate = total > 0
    ? ((typeStats.success || 0) + (typeStats.retry1 || 0) + (typeStats.retry2 || 0)) / total
    : null;

  console.log(JSON.stringify({
    recorded: true,
    task: taskId,
    template_type: templateType,
    result: resultType,
    stats: {
      [templateType]: {
        ...typeStats,
        success_rate: successRate !== null ? Math.round(successRate * 100) / 100 : null,
        disabled: templateEngine.isTemplateTypeDisabled(templateType)
      }
    }
  }, null, 2));
}

// ============================================================
// Subcommand: build-retry
// ============================================================

function handleBuildRetry(args) {
  const taskId = args.task;
  const errors = args.errors;

  if (!taskId || !errors) {
    process.stderr.write('ERROR: build-retry requires --task, --errors, and (--tasks-file or --description)\n');
    process.exit(1);
  }

  let task;
  if (args.description) {
    // Generic mode: build task from inline args
    task = buildInlineTask(args);
  } else if (args['tasks-file']) {
    // SDD mode: parse from tasks.md
    const tasksFile = path.resolve(args['tasks-file']);
    const tasksContent = fs.readFileSync(tasksFile, 'utf-8');
    task = parseTaskById(tasksContent, taskId);
    if (!task) {
      process.stderr.write(`ERROR: Task ${taskId} not found\n`);
      process.exit(1);
    }
  } else {
    process.stderr.write('ERROR: build-retry requires --tasks-file or --description\n');
    process.exit(1);
  }

  const errorList = errors.split('\\n').filter(Boolean);
  const prompt = templateEngine.buildRetryPrompt({ task }, errorList);
  console.log(prompt);
}

// ============================================================
// Subcommand: build-escalation
// ============================================================

function handleBuildEscalation(args) {
  const taskId = args.task;
  const haikuOutput = args['haiku-output'] || '';
  const errors = args.errors || '';
  const planFile = args['plan-file'] ? path.resolve(args['plan-file']) : null;

  if (!taskId) {
    process.stderr.write('ERROR: build-escalation requires --task and (--tasks-file or --description)\n');
    process.exit(1);
  }

  let task;
  if (args.description) {
    // Generic mode
    task = buildInlineTask(args);
  } else if (args['tasks-file']) {
    // SDD mode
    const tasksFile = path.resolve(args['tasks-file']);
    const tasksContent = fs.readFileSync(tasksFile, 'utf-8');
    task = parseTaskById(tasksContent, taskId);
    if (!task) {
      process.stderr.write(`ERROR: Task ${taskId} not found\n`);
      process.exit(1);
    }
  } else {
    process.stderr.write('ERROR: build-escalation requires --tasks-file or --description\n');
    process.exit(1);
  }

  let codebookEntry = null;
  if (planFile && fs.existsSync(planFile)) {
    const planContent = fs.readFileSync(planFile, 'utf-8');
    const raw = extractCodebookEntry(planContent, taskId, 'H');
    if (raw) codebookEntry = { description: raw };
  } else if (args.instructions) {
    codebookEntry = { description: args.instructions };
  }

  const errorList = errors.split('\\n').filter(Boolean);
  const prompt = templateEngine.buildEscalationContext({
    originalTask: task,
    haikuOutput,
    errors: errorList,
    codebookEntry
  });

  console.log(prompt);
}

// ============================================================
// Subcommand: group-tasks
// ============================================================

function handleGroupTasks(args) {
  const taskIds = (args.tasks || '').split(',').filter(Boolean);
  const tasksFile = path.resolve(args['tasks-file']);

  if (taskIds.length === 0 || !args['tasks-file']) {
    process.stderr.write('ERROR: group-tasks requires --tasks (comma-separated) and --tasks-file\n');
    process.exit(1);
  }

  const tasksContent = fs.readFileSync(tasksFile, 'utf-8');
  const tasks = taskIds.map(id => parseTaskById(tasksContent, id)).filter(Boolean);

  if (tasks.length === 0) {
    process.stderr.write('ERROR: No valid tasks found\n');
    process.exit(1);
  }

  const groups = templateEngine.groupNonConflicting(tasks);

  const result = {
    groups: groups.map((group, idx) => ({
      group_id: idx + 1,
      tasks: group.map(t => t.id),
      files: [...new Set(group.flatMap(t => t.filePaths))]
    }))
  };

  console.log(JSON.stringify(result, null, 2));
}

// ============================================================
// Subcommand: stats
// ============================================================

function handleStats() {
  const stats = templateEngine.getStats();

  // Enrich with success rates and disabled status
  for (const [type, data] of Object.entries(stats)) {
    if (type === 'last_updated') continue;
    if (typeof data !== 'object' || data === null) continue;
    const total = data.total || 0;
    if (total > 0) {
      data.success_rate = Math.round(
        ((data.success || 0) + (data.retry1 || 0) + (data.retry2 || 0)) / total * 100
      ) / 100;
      data.disabled = templateEngine.isTemplateTypeDisabled(type);
    }
  }

  console.log(JSON.stringify(stats, null, 2));
}

// ============================================================
// Subcommand: template-stats
// ============================================================

function handleTemplateStats() {
  const stats = templateEngine.getTemplateStats();

  if (Object.keys(stats).length === 0) {
    console.log(JSON.stringify({ message: 'No template files found in .claude/memory/templates/' }, null, 2));
    return;
  }

  console.log(JSON.stringify(stats, null, 2));
}

// ============================================================
// Generic (non-SDD) helpers
// ============================================================

/**
 * Build a task object from inline CLI args (no tasks.md needed)
 * @param {object} args - parsed CLI arguments
 * @returns {{ id: string, description: string, filePaths: string[], markers: string[] }}
 */
function buildInlineTask(args) {
  const description = args.description || '';
  const filesRaw = args.files || args['target-file'] || args['target-files'] || '';
  const filePaths = filesRaw.split(',').filter(Boolean).map(f => f.trim());
  const id = args.id || `GEN-${Date.now() % 10000}`;
  const markers = [];

  if (filePaths.some(p => templateEngine.SPECKIT_PATHS.some(sp => p.includes(sp)))) {
    markers.push('warning');
  }

  return { id, description, filePaths, markers };
}

// ============================================================
// Subcommand: classify-inline (generic)
// ============================================================

function handleClassifyInline(args) {
  if (!args.description) {
    process.stderr.write('ERROR: classify-inline requires --description\n');
    process.exit(1);
  }

  const task = buildInlineTask(args);
  const tier = templateEngine.classifyTask(task);
  const templateType = templateEngine.detectTemplateType(task);

  console.log(JSON.stringify({
    id: task.id,
    tier,
    templateType,
    filePaths: task.filePaths,
    markers: task.markers,
    disabled: templateEngine.isTemplateTypeDisabled(templateType)
  }, null, 2));
}

// ============================================================
// Subcommand: assemble-haiku-generic (generic)
// ============================================================

function handleAssembleHaikuGeneric(args) {
  if (!args.description || !args.instructions) {
    process.stderr.write('ERROR: assemble-haiku-generic requires --description and --instructions\n');
    process.exit(1);
  }

  const task = buildInlineTask(args);

  // Defensive checks (same as SDD version)
  if (task.markers.includes('warning')) {
    process.stderr.write(`ERROR: Task ${task.id} touches Speckit paths - cannot use Haiku mode\n`);
    process.exit(1);
  }
  if (task.filePaths.length > 2) {
    process.stderr.write(`ERROR: Task ${task.id} has ${task.filePaths.length} files - cannot use Haiku mode (max 2)\n`);
    process.exit(1);
  }

  const templateType = templateEngine.detectTemplateType(task);
  if (templateEngine.isTemplateTypeDisabled(templateType)) {
    process.stderr.write(`WARN: Template type "${templateType}" is auto-disabled - escalating to sonnet\n`);
    process.exit(1);
  }

  // Read target file (if specified and exists)
  const targetFile = args['target-file'] ? path.resolve(args['target-file']) : null;
  const fileContent = targetFile && fs.existsSync(targetFile)
    ? fs.readFileSync(targetFile, 'utf-8')
    : '';

  // Find reference pattern
  const referencePattern = targetFile ? grepReferencePattern(targetFile) : '';

  // Match protocols
  const protocolMatches = protocolEngine.matchProtocols({
    filePaths: task.filePaths.map(f => path.resolve(f)),
    keywords: task.description.split(/\s+/).filter(w => w.length > 3),
    codePatterns: []
  });

  // Use --instructions as the codebook entry
  const codebookEntry = { description: args.instructions };

  // Assemble prompt using existing engine
  const prompt = templateEngine.assembleHaikuPrompt({
    task,
    templateType,
    codebookEntry,
    fileContent,
    referencePattern,
    protocols: protocolMatches.slice(0, 2)
  });

  console.log(prompt);
}

// ============================================================
// Subcommand: assemble-sonnet-generic (generic)
// ============================================================

function handleAssembleSonnetGeneric(args) {
  if (!args.description || !args.instructions) {
    process.stderr.write('ERROR: assemble-sonnet-generic requires --description and --instructions\n');
    process.exit(1);
  }

  const task = buildInlineTask(args);
  const targetFiles = (args['target-files'] || args['target-file'] || '')
    .split(',').filter(Boolean).map(f => path.resolve(f.trim()));

  // Read target files
  const fileContents = targetFiles.map(fp => ({
    path: fp.replace(/\\/g, '/'),
    content: fs.existsSync(fp) ? fs.readFileSync(fp, 'utf-8') : ''
  }));

  // Match protocols (max 3 for Sonnet)
  const protocolMatches = protocolEngine.matchProtocols({
    filePaths: targetFiles,
    keywords: task.description.split(/\s+/).filter(w => w.length > 3),
    codePatterns: []
  });

  // Load constitution rules
  const constitutionRules = loadConstitutionRules(targetFiles);

  // Load Sonnet template (fallback to hardcoded)
  const sonnetTmpl = templateEngine.loadTemplate('default', 'sonnet');
  const maxFileLines = sonnetTmpl?.limits?.max_file_lines || 500;

  // Assemble context bundle
  const sections = [];

  // Header
  sections.push(`# Task: ${task.id}`);
  sections.push('');
  sections.push(`> ${sonnetTmpl?.sections?.role || 'Execution Model: Sonnet (delegated). All design decisions made by Opus.'}`);
  sections.push('');
  sections.push('---');
  sections.push('');

  // Task description
  sections.push('## Task Description');
  sections.push('');
  sections.push(task.description);
  sections.push('');
  sections.push('---');
  sections.push('');

  // Implementation Instructions (replaces Codebook)
  sections.push('## Implementation Instructions');
  sections.push('');
  sections.push(args.instructions);
  sections.push('');
  sections.push('---');
  sections.push('');

  // Additional context (optional)
  if (args.context) {
    sections.push('## Additional Context');
    sections.push('');
    sections.push(args.context);
    sections.push('');
    sections.push('---');
    sections.push('');
  }

  // File contents (truncated)
  if (fileContents.length > 0) {
    sections.push('## Current File Content');
    sections.push('');
    fileContents.forEach(({ path: fp, content }) => {
      const relativePath = fp.replace(process.cwd().replace(/\\/g, '/') + '/', '');
      sections.push(`### ${relativePath}`);
      if (!content) {
        sections.push('> File does not exist yet (new file)');
      } else {
        sections.push('```typescript');
        const lines = content.split('\n');
        sections.push(lines.slice(0, maxFileLines).join('\n'));
        if (lines.length > maxFileLines) {
          sections.push(`// ... truncated (${lines.length - maxFileLines} more lines)`);
        }
        sections.push('```');
      }
      sections.push('');
    });
    sections.push('---');
    sections.push('');
  }

  // Protocols
  if (protocolMatches.length > 0) {
    const formatted = protocolEngine.formatForSonnet(protocolMatches);
    if (formatted) {
      sections.push(formatted);
      sections.push('');
    }
  }

  // Constitution rules
  if (constitutionRules.length > 0) {
    sections.push('## Constitution Rules');
    sections.push('');
    constitutionRules.forEach(rule => sections.push(`- **${rule}**`));
    sections.push('');
    sections.push('---');
    sections.push('');
  }

  // Output requirements (from template or hardcoded)
  sections.push('## Output Requirements');
  sections.push('');
  if (sonnetTmpl?.sections?.output_format) {
    sections.push(sonnetTmpl.sections.output_format);
  } else {
    sections.push('1. Return ONLY the modified file content (complete file, not diffs)');
    sections.push('2. Follow existing code style');
  }

  console.log(sections.join('\n'));
}

// ============================================================
// Subcommand: scout (lightweight Haiku recon)
// ============================================================

const SCOUT_TYPES = {
  'file-scan': {
    role: 'You are a file scanner. Return ONLY structured data.',
    outputFormat: '| File | Lines | Key Exports | Last Modified |\n|------|-------|-------------|---------------|',
    tools: 'Use Read and Glob tools only.',
  },
  'grep-scan': {
    role: 'You are a pattern scanner. Return ONLY matching results.',
    outputFormat: '| File:Line | Match | Context (±1 line) |\n|-----------|-------|-------------------|',
    tools: 'Use Grep tool only.',
  },
  'status-check': {
    role: 'You are a status reporter. Return ONLY current state.',
    outputFormat: '## Status\n- Clean: [list]\n- Modified: [list]\n- Untracked: [list]',
    tools: 'Use Bash (read-only: git status, git diff --stat, git log --oneline) only.',
  },
  'progress-poll': {
    role: 'You are a progress monitor. Summarize task output concisely.',
    outputFormat: '## Progress\n- Status: [running/completed/error]\n- Output summary: [1-3 sentences]\n- Key findings: [bullet list]',
    tools: 'Use Read tool to check the output file.',
  },
};

const SCOUT_BANNED_PATHS = ['.speckit/', 'src-tauri/src/git/', 'src-tauri/src/nas/'];
const SCOUT_MAX_FILES = 5;

function handleScout(args) {
  const type = args.type;
  const description = args.description || '';
  const scope = args.scope || 'src/';
  const format = args.format || 'table';

  if (!type || !SCOUT_TYPES[type]) {
    process.stderr.write(`ERROR: scout requires --type (${Object.keys(SCOUT_TYPES).join('|')})\n`);
    process.exit(1);
  }

  // ── V235.2: 3 types use zero-token scripts directly ──
  const SCRIPT_TYPES = ['file-scan', 'grep-scan', 'status-check'];
  if (SCRIPT_TYPES.includes(type)) {
    const scriptPath = path.join(__dirname, 'scout-scripts.js');
    const scriptArgs = [type];
    if (scope) scriptArgs.push('--scope', scope);
    if (args.pattern) scriptArgs.push('--pattern', args.pattern);
    try {
      const { execSync } = require('child_process');
      const out = execSync(`node "${scriptPath}" ${scriptArgs.join(' ')}`, {
        encoding: 'utf8',
        timeout: 20000,
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      console.log(out);
    } catch (e) {
      if (e.stdout) console.log(e.stdout);
      if (e.stderr) process.stderr.write(e.stderr);
      process.exit(e.status || 1);
    }
    return;
  }

  // ── progress-poll: still needs Haiku AI (assembles prompt) ──
  if (!description) {
    process.stderr.write('ERROR: scout requires --description\n');
    process.exit(1);
  }

  // Safety: check banned paths
  if (SCOUT_BANNED_PATHS.some(bp => scope.includes(bp))) {
    process.stderr.write(`ERROR: Scout cannot scan protected path "${scope}". Use Opus directly.\n`);
    process.exit(1);
  }

  const template = SCOUT_TYPES[type];

  const sections = [];
  sections.push(`# Scout Task: ${type}`);
  sections.push('');
  sections.push(`> ${template.role}`);
  sections.push('');
  sections.push('---');
  sections.push('');
  sections.push('## Task');
  sections.push('');
  sections.push(description);
  sections.push('');
  sections.push(`**Scope**: \`${scope}\``);
  sections.push('');
  sections.push('---');
  sections.push('');
  sections.push('## Constraints');
  sections.push('');
  sections.push(`- ${template.tools}`);
  sections.push(`- Maximum ${SCOUT_MAX_FILES} files. If more than ${SCOUT_MAX_FILES} match, return the first ${SCOUT_MAX_FILES} and note "N more files omitted".`);
  sections.push('- Do NOT modify any files.');
  sections.push('- Do NOT provide analysis, opinions, or recommendations.');
  sections.push('- Do NOT read files outside the specified scope.');
  sections.push(`- BANNED paths (skip silently): ${SCOUT_BANNED_PATHS.join(', ')}`);
  sections.push('');
  sections.push('---');
  sections.push('');
  sections.push('## Required Output Format');
  sections.push('');
  if (format === 'table') {
    sections.push(template.outputFormat);
  } else {
    sections.push('Return results as a bullet list.');
  }
  sections.push('');
  sections.push('Return ONLY the formatted data above. No intro, no summary, no commentary.');

  console.log(sections.join('\n'));
}

// ============================================================
// Subcommand: batch-plan (zero-token topological sort)
// ============================================================

/**
 * Build dependency graph + tier assignment from inline task list.
 * Pure algorithm — no AI cost.
 *
 * Input: --tasks-json '[{"id":"T001","desc":"...","files":["..."],"deps":[]}]'
 * Output: JSON with tiers, graph, validation
 */
function handleBatchPlan(args) {
  const tasksJsonRaw = args['tasks-json'];
  if (!tasksJsonRaw) {
    process.stderr.write('ERROR: batch-plan requires --tasks-json (JSON array of {id, desc, files, deps})\n');
    process.exit(1);
  }

  let tasks;
  try {
    tasks = JSON.parse(tasksJsonRaw);
  } catch (e) {
    process.stderr.write(`ERROR: Invalid JSON in --tasks-json: ${e.message}\n`);
    process.exit(1);
  }

  if (!Array.isArray(tasks) || tasks.length === 0) {
    process.stderr.write('ERROR: --tasks-json must be a non-empty array\n');
    process.exit(1);
  }

  // Build adjacency map
  const taskMap = new Map();
  for (const t of tasks) {
    taskMap.set(t.id, {
      id: t.id,
      desc: t.desc || '',
      files: t.files || [],
      deps: t.deps || [],
      blocks: [],
    });
  }

  // Compute reverse edges (blocks)
  for (const t of tasks) {
    for (const dep of (t.deps || [])) {
      const parent = taskMap.get(dep);
      if (parent) parent.blocks.push(t.id);
    }
  }

  // Cycle detection via DFS
  const UNVISITED = 0, VISITING = 1, VISITED = 2;
  const state = new Map();
  taskMap.forEach((_, id) => state.set(id, UNVISITED));
  let hasCycles = false;
  const cyclePath = [];

  function dfs(nodeId, path) {
    if (hasCycles) return;
    state.set(nodeId, VISITING);
    path.push(nodeId);

    const node = taskMap.get(nodeId);
    for (const dep of (node?.deps || [])) {
      if (!taskMap.has(dep)) continue; // skip unknown deps
      const depState = state.get(dep);
      if (depState === VISITING) {
        hasCycles = true;
        const cycleStart = path.indexOf(dep);
        cyclePath.push(...path.slice(cycleStart), dep);
        return;
      }
      if (depState === UNVISITED) {
        dfs(dep, path);
      }
    }

    state.set(nodeId, VISITED);
    path.pop();
  }

  for (const id of taskMap.keys()) {
    if (state.get(id) === UNVISITED) dfs(id, []);
  }

  if (hasCycles) {
    console.log(JSON.stringify({
      tiers: [],
      total_tiers: 0,
      has_cycles: true,
      cycle_path: cyclePath,
    }, null, 2));
    return;
  }

  // Topological tier assignment (Kahn's algorithm)
  const tiers = [];
  const assigned = new Set();
  const remaining = new Set(taskMap.keys());

  while (remaining.size > 0) {
    const tierTasks = [];
    for (const id of remaining) {
      const node = taskMap.get(id);
      const allDepsSatisfied = node.deps.every(d => assigned.has(d) || !taskMap.has(d));
      if (allDepsSatisfied) tierTasks.push(id);
    }

    if (tierTasks.length === 0) {
      // Should not happen if cycle check passed, but safety net
      process.stderr.write('ERROR: Unresolvable dependencies remain\n');
      break;
    }

    // Detect file conflicts within tier
    const tierFiles = new Map();
    let hasConflicts = false;
    for (const id of tierTasks) {
      const node = taskMap.get(id);
      for (const f of node.files) {
        if (tierFiles.has(f)) {
          hasConflicts = true;
          break;
        }
        tierFiles.set(f, id);
      }
      if (hasConflicts) break;
    }

    tiers.push({
      tier: tiers.length,
      tasks: tierTasks,
      parallel: tierTasks.length > 1 && !hasConflicts,
      count: tierTasks.length,
    });

    for (const id of tierTasks) {
      assigned.add(id);
      remaining.delete(id);
    }
  }

  // Build graph summary
  const graph = {};
  for (const [id, node] of taskMap) {
    graph[id] = {
      desc: node.desc,
      files: node.files,
      deps: node.deps,
      blocks: node.blocks,
    };
  }

  console.log(JSON.stringify({
    tiers,
    total_tiers: tiers.length,
    has_cycles: false,
    graph,
  }, null, 2));
}

// ============================================================
// Subcommand: batch-dispatch (assemble single sub-agent prompt)
// ============================================================

/**
 * Assemble a lean prompt for ONE sub-agent task (V240 1:1 rule).
 * Reuses buildInlineTask + protocolEngine.matchProtocols.
 *
 * Input: --task-id, --description, --target-files, --instructions, --prev-context
 * Output: Sonnet-ready Markdown prompt to stdout
 */
function handleBatchDispatch(args) {
  if (!args.description || !args.instructions) {
    process.stderr.write('ERROR: batch-dispatch requires --description and --instructions\n');
    process.exit(1);
  }

  const task = buildInlineTask(args);
  const taskId = args['task-id'] || task.id;
  const targetFiles = (args['target-files'] || args['target-file'] || '')
    .split(',').filter(Boolean).map(f => path.resolve(f.trim()));
  const prevContext = args['prev-context'] || '';

  // Load batch-dispatch template (fallback to sonnet-default)
  const batchTmpl = templateEngine.loadTemplate('batch-dispatch', 'sonnet');
  const sonnetTmpl = templateEngine.loadTemplate('default', 'sonnet');
  const tmpl = batchTmpl || sonnetTmpl;
  const maxFileLines = tmpl?.limits?.max_file_lines || 500;

  // Read target files
  const fileContents = targetFiles.map(fp => ({
    path: fp.replace(/\\/g, '/'),
    content: fs.existsSync(fp) ? fs.readFileSync(fp, 'utf-8') : '',
  }));

  // Match protocols (max 3 for Sonnet)
  const protocolMatches = protocolEngine.matchProtocols({
    filePaths: targetFiles,
    keywords: task.description.split(/\s+/).filter(w => w.length > 3),
    codePatterns: [],
  });

  // Load constitution rules
  const constitutionRules = loadConstitutionRules(targetFiles);

  // Assemble prompt
  const sections = [];

  // Role
  const role = batchTmpl?.sections?.role
    || "Execution Model: Sonnet (delegated). All design decisions made by Opus. You implement ONE task. Do NOT modify files outside scope. If you need architectural decisions, output 'ESCALATE: [reason]' and stop.";
  sections.push(`# Task: ${taskId}`);
  sections.push('');
  sections.push(`> ${role}`);
  sections.push('');
  sections.push('---');
  sections.push('');

  // Task description
  sections.push('## Task Description');
  sections.push('');
  sections.push(task.description);
  sections.push('');
  sections.push(`Files to modify: ${targetFiles.map(f => '`' + path.relative(process.cwd(), f).replace(/\\/g, '/') + '`').join(', ')}`);
  sections.push('');
  sections.push('---');
  sections.push('');

  // Instructions
  sections.push('## Implementation Instructions');
  sections.push('');
  sections.push(args.instructions);
  sections.push('');
  sections.push('---');
  sections.push('');

  // Previous task context (if any)
  if (prevContext) {
    sections.push('## Context from Previous Tasks');
    sections.push('');
    sections.push(prevContext);
    sections.push('');
    sections.push('---');
    sections.push('');
  }

  // File contents (truncated)
  if (fileContents.length > 0) {
    sections.push('## Current File Content');
    sections.push('');
    fileContents.forEach(({ path: fp, content }) => {
      const relativePath = path.relative(process.cwd(), fp).replace(/\\/g, '/');
      sections.push(`### ${relativePath}`);
      if (!content) {
        sections.push('> File does not exist yet (new file)');
      } else {
        sections.push('```typescript');
        const lines = content.split('\n');
        sections.push(lines.slice(0, maxFileLines).join('\n'));
        if (lines.length > maxFileLines) {
          sections.push(`// ... truncated (${lines.length - maxFileLines} more lines)`);
        }
        sections.push('```');
      }
      sections.push('');
    });
    sections.push('---');
    sections.push('');
  }

  // Protocols
  if (protocolMatches.length > 0) {
    const formatted = protocolEngine.formatForSonnet(protocolMatches);
    if (formatted) {
      sections.push(formatted);
      sections.push('');
    }
  }

  // Constitution rules
  if (constitutionRules.length > 0) {
    sections.push('## Constitution Rules');
    sections.push('');
    constitutionRules.forEach(rule => sections.push(`- **${rule}**`));
    sections.push('');
    sections.push('---');
    sections.push('');
  }

  // Constraints
  const constraints = batchTmpl?.sections?.constraints || [
    'Output MUST pass `npm run type-check`',
    'Use `logger` from `@/lib/utils/logger.ts`, NEVER `console.log`',
    'No `any` types',
    'Follow existing code style (indentation, naming conventions)',
    'Only modify files listed in your task scope',
    'After completion, run `npm run type-check` and report the result',
  ];
  sections.push('## Constraints');
  sections.push('');
  constraints.forEach(c => sections.push(`- ${c}`));
  sections.push('');
  sections.push('---');
  sections.push('');

  // Output requirements
  sections.push('## Output Requirements');
  sections.push('');
  const outputFmt = batchTmpl?.sections?.output_format
    || "1. Return ONLY the modified file content (complete file, not diffs)\n2. Must pass `npm run type-check`\n3. If blocked, output 'ESCALATE: [reason]' and stop";
  sections.push(outputFmt);

  console.log(sections.join('\n'));
}

// ============================================================
// Subcommand: batch-verify (zero-token verification)
// ============================================================

/**
 * Run type-check + domain invariants, return JSON verdict.
 * Pure Node.js + child_process — no AI cost.
 *
 * Input: --batch-id, --check-invariants "cpm,boq" (optional)
 * Output: JSON with type_check, invariants, verdict
 */
function handleBatchVerify(args) {
  const { execSync } = require('child_process');
  const batchId = args['batch-id'] || '0';
  const invariantsList = (args['check-invariants'] || '').split(',').filter(Boolean);

  const result = {
    batch_id: batchId,
    type_check: { passed: false, error_count: 0, errors: [] },
    invariants: {},
    verdict: 'FAIL',
  };

  // Run type-check
  try {
    execSync('npm run type-check', {
      encoding: 'utf8',
      timeout: 120000, // 2 min
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    result.type_check.passed = true;
    result.type_check.error_count = 0;
  } catch (e) {
    const stderr = e.stderr || e.stdout || '';
    // Parse TSC errors: "src/file.ts(line,col): error TS..."
    const errorLines = stderr.split('\n').filter(l => /error TS\d+/.test(l));
    result.type_check.passed = false;
    result.type_check.error_count = errorLines.length;
    result.type_check.errors = errorLines.slice(0, 10); // cap at 10
  }

  // Run domain invariants (if specified)
  const INVARIANT_COMMANDS = {
    git: 'cargo test',
    worktree: 'cargo test -- worktree',
  };

  for (const inv of invariantsList) {
    const cmd = INVARIANT_COMMANDS[inv];
    if (!cmd) {
      result.invariants[inv] = { passed: false, error: `Unknown invariant: ${inv}` };
      continue;
    }
    try {
      execSync(cmd, {
        encoding: 'utf8',
        timeout: 60000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      result.invariants[inv] = { passed: true };
    } catch (e) {
      result.invariants[inv] = {
        passed: false,
        error: (e.stderr || e.stdout || '').slice(0, 500),
      };
    }
  }

  // Compute verdict
  const allInvariantsPass = Object.values(result.invariants).every(v => v.passed);
  result.verdict = result.type_check.passed && allInvariantsPass ? 'PASS' : 'FAIL';

  console.log(JSON.stringify(result, null, 2));
}

// ============================================================
// Main dispatcher
// ============================================================

function main() {
  const rawArgs = process.argv.slice(2);
  if (rawArgs.length === 0) {
    printUsage();
    process.exit(0);
  }

  const subcommand = rawArgs[0];
  const { args } = parseArgs(rawArgs.slice(1));

  switch (subcommand) {
    case 'classify':
      handleClassify(args);
      break;
    case 'assemble-haiku':
      handleAssembleHaiku(args);
      break;
    case 'assemble-sonnet':
      handleAssembleSonnet(args);
      break;
    case 'match-protocols':
      handleMatchProtocols(args);
      break;
    case 'record':
      handleRecord(args);
      break;
    case 'build-retry':
      handleBuildRetry(args);
      break;
    case 'build-escalation':
      handleBuildEscalation(args);
      break;
    case 'group-tasks':
      handleGroupTasks(args);
      break;
    case 'stats':
      handleStats();
      break;
    case 'template-stats':
      handleTemplateStats();
      break;
    case 'classify-inline':
      handleClassifyInline(args);
      break;
    case 'assemble-haiku-generic':
      handleAssembleHaikuGeneric(args);
      break;
    case 'assemble-sonnet-generic':
      handleAssembleSonnetGeneric(args);
      break;
    case 'scout':
      handleScout(args);
      break;
    case 'batch-plan':
      handleBatchPlan(args);
      break;
    case 'batch-dispatch':
      handleBatchDispatch(args);
      break;
    case 'batch-verify':
      handleBatchVerify(args);
      break;
    default:
      process.stderr.write(`ERROR: Unknown subcommand "${subcommand}"\n\n`);
      printUsage();
      process.exit(1);
  }
}

function printUsage() {
  console.log(`delegation-cli.js — Three-tier model delegation bridge (v2.3)

Usage: node delegation-cli.js <subcommand> [options]

=== SDD Subcommands (require tasks.md + plan.md) ===

  classify            Classify tasks into opus/sonnet/haiku tiers
    --tasks-file      Path to tasks.md

  assemble-haiku      Assemble zero-ambiguity Haiku prompt
    --task            Task ID (e.g., T004)
    --plan-file       Path to plan.md
    --target-file     Path to target source file
    --tasks-file      Path to tasks.md

  assemble-sonnet     Assemble Sonnet context bundle
    --task            Task ID
    --plan-file       Path to plan.md
    --target-files    Comma-separated target file paths
    --tasks-file      Path to tasks.md

=== Generic Subcommands (no tasks.md/plan.md needed) ===

  classify-inline     Classify a single ad-hoc task
    --description     Task description text
    --files           Comma-separated file paths (optional)
    --id              Task ID (optional, auto-generated)

  assemble-haiku-generic   Assemble Haiku prompt from inline args
    --description     Task description
    --target-file     Path to target source file
    --instructions    Explicit step-by-step instructions (replaces Codebook)
    --id              Task ID (optional)

  assemble-sonnet-generic  Assemble Sonnet context bundle from inline args
    --description     Task description
    --target-files    Comma-separated target file paths
    --instructions    Explicit instructions (replaces Codebook)
    --context         Additional context (e.g., git diff output)
    --id              Task ID (optional)

=== Shared Subcommands ===

  match-protocols     Match M10 behavioral protocols
    --files           Comma-separated file paths
    --keywords        Comma-separated keywords

  record              Record task execution result
    --task            Task ID
    --template-type   code-transform|function-fill|test-gen|type-def|component-scaffold|scan-report|git-ops|checklist-fill|diff-review
    --result          success|retry1|retry2|escalated
    --source          Source workflow (sdd|fix-completeness|task-completion|code-review|...) [default: sdd]
    --tier            Model tier (haiku|sonnet) for per-template tracking [default: haiku]

  build-retry         Build retry prompt with error context
    --task            Task ID
    --errors          Error messages (\\n separated)
    --tasks-file      Path to tasks.md (SDD mode)
    --description     Task description (generic mode, alternative to --tasks-file)

  build-escalation    Build Haiku->Sonnet escalation prompt
    --task            Task ID
    --haiku-output    Haiku's last output
    --errors          Error messages (\\n separated)
    --tasks-file      Path to tasks.md (SDD mode)
    --description     Task description (generic mode, alternative to --tasks-file)
    --instructions    Original instructions (generic mode)
    --plan-file       Path to plan.md (optional, SDD mode)

  group-tasks         Group tasks into non-conflicting parallel batches
    --tasks           Comma-separated task IDs
    --tasks-file      Path to tasks.md

  stats               Show template execution statistics (_stats.json aggregate)

  template-stats      Show per-template effectiveness + iterate suggestions (PT-*.json)

=== Scout Subcommand (lightweight Haiku recon) ===

  scout               Assemble Haiku scout prompt for background detection
    --type            file-scan|grep-scan|status-check|progress-poll
    --description     What to scan/detect
    --scope           Directory scope (default: src/)
    --format          Output format: table|list (default: table)

=== Batch Execution Subcommands (parallel-dev delegation) ===

  batch-plan          Build dependency graph + tier assignment (zero-token)
    --tasks-json      JSON array: [{"id":"T001","desc":"...","files":[...],"deps":[...]}]

  batch-dispatch      Assemble lean sub-agent prompt (1-Agent-1-Task V240)
    --task-id         Task ID
    --description     Task description
    --target-files    Comma-separated target file paths
    --instructions    Step-by-step implementation instructions
    --prev-context    Context from previous tasks (optional)

  batch-verify        Run type-check + domain invariants (zero-token)
    --batch-id        Batch identifier
    --check-invariants  Comma-separated: cpm,boq (optional)
`);

}

main();
