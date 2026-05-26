#!/usr/bin/env node
/**
 * Progress Generator - 進度摘要生成器
 *
 * @version 1.0.0
 * @since 2026-02-04
 * @see https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
 *
 * 基於 Anthropic Engineering "claude-progress.txt" Pattern：
 * > "The key insight was finding a way for agents to quickly understand
 * >  the state of work when starting with a fresh context window"
 *
 * 功能：
 * - 從 Bead checkpoint 生成結構化進度摘要
 * - 輸出到 .claude/progress/current-progress.md
 * - 供 session-start hook 注入到新 context
 */

const fs = require('fs');
const path = require('path');

// 進度檔案路徑
const PROGRESS_DIR = path.join(__dirname, '..', '..', 'progress');
const PROGRESS_FILE = path.join(PROGRESS_DIR, 'current-progress.md');

// 確保目錄存在
if (!fs.existsSync(PROGRESS_DIR)) {
  fs.mkdirSync(PROGRESS_DIR, { recursive: true });
}

/**
 * 從 Bead 生成進度摘要
 *
 * @param {object} bead - Bead 物件
 * @param {object} options - 選項
 * @param {number} [options.maxCheckpoints=3] - 最大 checkpoint 數量
 * @param {number} [options.maxDecisions=5] - 最大決策數量
 * @returns {string} Markdown 格式的進度摘要
 */
function generateProgressSummary(bead, options = {}) {
  const { maxCheckpoints = 3, maxDecisions = 5 } = options;

  if (!bead || !bead.checkpoints || bead.checkpoints.length === 0) {
    return generateEmptyProgress();
  }

  const recentCheckpoints = bead.checkpoints.slice(-maxCheckpoints);
  const latestCheckpoint = recentCheckpoints[recentCheckpoints.length - 1];
  const progressSummary = latestCheckpoint.progressSummary || {};

  // 收集所有決策（從最近的 checkpoints）
  const allDecisions = recentCheckpoints
    .flatMap(cp => cp.progressSummary?.decisions || [])
    .slice(-maxDecisions);

  // 生成 Markdown
  const sections = [];

  // 標題
  sections.push(`# Current Progress`);
  sections.push(`> Bead: ${bead.id}`);
  sections.push(`> Updated: ${latestCheckpoint.timestamp}`);
  sections.push('');

  // Current Status
  sections.push('## Current Status');
  if (progressSummary.completed && progressSummary.completed.length > 0) {
    progressSummary.completed.forEach(item => {
      sections.push(`- ${item}`);
    });
  } else {
    sections.push(`- ${latestCheckpoint.description || 'In progress'}`);
  }
  sections.push('');

  // Next Actions
  sections.push('## Next Actions');
  if (progressSummary.nextActions && progressSummary.nextActions.length > 0) {
    progressSummary.nextActions.forEach(item => {
      sections.push(`- [ ] ${item}`);
    });
  } else {
    sections.push('- [ ] Continue with current task');
  }
  sections.push('');

  // Recent Decisions
  if (allDecisions.length > 0) {
    sections.push('## Recent Decisions');
    allDecisions.forEach(decision => {
      sections.push(`- ${decision}`);
    });
    sections.push('');
  }

  // Blockers
  if (progressSummary.blockers && progressSummary.blockers.length > 0) {
    sections.push('## Blockers');
    progressSummary.blockers.forEach(item => {
      sections.push(`- ${item}`);
    });
    sections.push('');
  }

  // Modified Files (簡要)
  if (bead.modifiedFiles && bead.modifiedFiles.length > 0) {
    sections.push('## Modified Files');
    const recentFiles = bead.modifiedFiles.slice(-10);
    recentFiles.forEach(file => {
      sections.push(`- \`${file}\``);
    });
    if (bead.modifiedFiles.length > 10) {
      sections.push(`- ... and ${bead.modifiedFiles.length - 10} more`);
    }
    sections.push('');
  }

  // Verification Status
  const latestVerification = latestCheckpoint.verificationResults;
  if (latestVerification) {
    sections.push('## Verification Status');
    const status = latestVerification.passed ? '✅ Passed' : '❌ Failed';
    sections.push(`- Status: ${status}`);
    if (latestVerification.e2eTests) {
      const e2eStatus = latestVerification.e2eTests.passed ? '✅' : '❌';
      sections.push(`- E2E Tests: ${e2eStatus} (${latestVerification.e2eTests.tests?.length || 0} suites)`);
    }
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * 生成空白進度模板
 */
function generateEmptyProgress() {
  return `# Current Progress

> No active bead found

## Current Status
- Starting new session

## Next Actions
- [ ] Review HANDOVER.md for context
- [ ] Understand current project state

## Recent Decisions
(None recorded)

## Blockers
(None)
`;
}

/**
 * 從 Bead Manager 獲取活躍 Bead 並生成進度檔案
 *
 * @returns {{ success: boolean, path: string, content: string }}
 */
function generateProgressFile() {
  // bead-manager removed in V156; generate empty progress
  const content = generateEmptyProgress();
  fs.writeFileSync(PROGRESS_FILE, content, 'utf-8');

  return {
    success: true,
    path: PROGRESS_FILE,
    content,
    beadId: null,
  };
}

/**
 * 讀取當前進度檔案
 *
 * @returns {string|null} 進度內容或 null
 */
function readProgressFile() {
  if (!fs.existsSync(PROGRESS_FILE)) {
    return null;
  }

  try {
    return fs.readFileSync(PROGRESS_FILE, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * 更新進度檔案（在 checkpoint 後呼叫）
 *
 * @param {object} bead - 更新後的 Bead
 * @returns {{ success: boolean }}
 */
function updateProgressFile(bead) {
  const content = generateProgressSummary(bead);
  fs.writeFileSync(PROGRESS_FILE, content, 'utf-8');
  return { success: true };
}

/**
 * 獲取進度檔案的摘要版本（適合注入 context）
 *
 * @param {number} maxLines - 最大行數
 * @returns {string} 摘要內容
 */
function getProgressSummaryForContext(maxLines = 30) {
  const content = readProgressFile();
  if (!content) {
    return '';
  }

  const lines = content.split('\n');
  if (lines.length <= maxLines) {
    return content;
  }

  // 截取重要部分
  const sections = ['# Current Progress', '## Current Status', '## Next Actions', '## Blockers'];
  const result = [];
  let currentSection = null;
  let lineCount = 0;

  for (const line of lines) {
    if (sections.some(s => line.startsWith(s))) {
      currentSection = line;
    }

    if (currentSection && lineCount < maxLines) {
      result.push(line);
      lineCount++;
    }
  }

  if (lineCount >= maxLines) {
    result.push('...(truncated)');
  }

  return result.join('\n');
}

module.exports = {
  generateProgressSummary,
  generateEmptyProgress,
  generateProgressFile,
  readProgressFile,
  updateProgressFile,
  getProgressSummaryForContext,
  PROGRESS_FILE,
  PROGRESS_DIR
};
