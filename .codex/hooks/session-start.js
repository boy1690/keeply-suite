#!/usr/bin/env node
/**
 * SessionStart hook: 自動注入關鍵 context
 * 對應 Meetup 筆記的 Context 持久化建議
 *
 * "Session start hooks 會讀取專案文件，在任何使用者互動開始前注入必要的 context。
 *  當壓縮發生後，下一次工作階段會自動恢復原本可能流失的基礎 context。"
 *
 * @version 1.5.0
 * @since 2026-01-03
 * @updated 2026-01-14 - V57.5: hook-registry 動態載入整合
 * @updated 2026-01-29 - V75.0: 注入 semantic memory 學習經驗
 * @updated 2026-03-09 - V175: Auto-resume paused workflow tracker
 * @updated 2026-03-25 - V237: Flow Position injection (Anti-Amnesia)
 */

const fs = require('fs');
const path = require('path');

// AgentOps 可觀測性整合
const { withTiming } = require('./lib/timing-wrapper');

// V62.0: Memory Engine - Session 狀態恢復
let memoryEngine;
try {
  memoryEngine = require('./lib/memory-engine');
} catch {
  memoryEngine = null;
}

// V57.5: Hook Registry 動態載入
let hookRegistry;
try {
  hookRegistry = require('./lib/hook-registry');
} catch {
  hookRegistry = null;
}

// V80.0: Progress Generator (Anthropic Pattern)
let progressGenerator;
try {
  progressGenerator = require('./lib/progress-generator');
} catch {
  progressGenerator = null;
}

/**
 * V232: 自動維護膨脹檔案（每次 session 啟動時檢查）
 * memories.json > 200 條 → trim 到 100 條
 * workflow-progress.json history > 100 條 → trim 到 50 條
 */
function autoTrimMemory() {
  const cwd = process.cwd();

  // 1. episodic memories.json
  try {
    const memPath = path.join(cwd, '.claude/memory/episodic/memories.json');
    if (fs.existsSync(memPath)) {
      const data = JSON.parse(fs.readFileSync(memPath, 'utf8'));
      if (Array.isArray(data) && data.length > 200) {
        fs.writeFileSync(memPath, JSON.stringify(data.slice(-100), null, 2), 'utf8');
      }
    }
  } catch { /* trim failure must not block session start */ }

  // 2. workflow-progress.json history
  try {
    const wpPath = path.join(cwd, '.claude/metrics/workflow-progress.json');
    if (fs.existsSync(wpPath)) {
      const data = JSON.parse(fs.readFileSync(wpPath, 'utf8'));
      if (Array.isArray(data.history) && data.history.length > 100) {
        data.history = data.history.slice(-50);
        fs.writeFileSync(wpPath, JSON.stringify(data, null, 2), 'utf8');
      }
    }
  } catch { /* trim failure must not block session start */ }
}

async function processSession(input) {
  // V232: 啟動時自動清理膨脹檔案
  autoTrimMemory();

  const contextParts = [];
  const cwd = process.cwd();

  // V57.5: 初始化 Hook Registry
  let hookStats = null;
  if (hookRegistry) {
    try {
      hookStats = hookRegistry.getStats();
      const eagerHooks = hookRegistry.getHooksForEvent('SessionStart', {});
      // 記錄載入的 hooks
      if (eagerHooks.length > 0) {
        contextParts.push(`### Hook Registry (V57.5)
\`\`\`
Loaded: ${hookStats.totalHooks} hooks (${hookStats.byStrategy.eager} eager, ${hookStats.byStrategy.lazy} lazy, ${hookStats.byStrategy.conditional} conditional)
SessionStart hooks: ${eagerHooks.map(h => h.id).join(', ')}
\`\`\``);
      }
    } catch {
      // Registry 載入失敗，繼續執行
    }
  }

  // 0. V62.0: 恢復上一次 Session 狀態
  const sessionContext = restoreSessionContext();
  if (sessionContext) {
    contextParts.push(sessionContext);
  }

  // 0.5 V75.0: 注入最近的學習經驗 (semantic memory)
  const lessonsContext = retrieveRecentLessons();
  if (lessonsContext) {
    contextParts.push(lessonsContext);
  }

  // 0.7 V80.0: 注入進度摘要 (Anthropic Pattern)
  // 優先於 HANDOVER.md，因為進度摘要更簡潔、更聚焦於當前任務
  const progressContext = readProgressContext();
  if (progressContext) {
    contextParts.push(progressContext);
  }

  // 0.9 V175: Resume paused workflow tracker
  const workflowContext = resumeWorkflow();
  if (workflowContext) {
    contextParts.push(workflowContext);
  }

  // 0.95 V237: SDD Flow Position (Anti-Amnesia)
  const flowContext = injectFlowPosition();
  if (flowContext) {
    contextParts.push(flowContext);
  }

  // 1. HANDOVER.md - 專案狀態（最重要）
  const handoverPath = path.join(cwd, 'HANDOVER.md');
  const handoverContext = readContextFile(handoverPath, 'HANDOVER.md', 100);
  if (handoverContext) {
    contextParts.push(handoverContext);
  }

  // 2. constitution.md - 核心規則
  const constitutionPath = path.join(cwd, '.specify', 'memory', 'constitution.md');
  const constitutionContext = readContextFile(constitutionPath, 'Constitution', 50);
  if (constitutionContext) {
    contextParts.push(constitutionContext);
  }

  // 3. today-draft.md - 即時筆記（如果存在）
  const todayDraftPath = path.join(cwd, 'marketing', 'materials', 'today-draft.md');
  const todayDraftContext = readContextFile(todayDraftPath, 'Today Draft', 30);
  if (todayDraftContext) {
    contextParts.push(todayDraftContext);
  }

  if (contextParts.length > 0) {
    return {
      result: 'continue',
      additionalContext: `
**Session Context Auto-Loaded** (via session-start hook)

${contextParts.join('\n\n---\n\n')}

---
*Context injected at session start. Files: HANDOVER.md, constitution.md${fs.existsSync(todayDraftPath) ? ', today-draft.md' : ''}*
`
    };
  }
  return { result: 'continue' };
}

/**
 * V62.0: 恢復上一次 Session 狀態
 * 對應 everything-claude-code 的 session-start.sh 功能
 */
function restoreSessionContext() {
  if (!memoryEngine) {
    return null;
  }

  try {
    // 從 episodic 記憶層檢索最近的 session 狀態
    const recentSessions = memoryEngine.retrieve('episodic', {
      metadata: { type: 'session_state' },
      limit: 1
    });

    if (recentSessions.length === 0) {
      return null;
    }

    const lastSession = recentSessions[0];
    const state = lastSession.content;

    // 檢查是否是今天之內的 session（避免恢復太舊的狀態）
    const lastDate = new Date(state.timestamp);
    const now = new Date();
    const hoursDiff = (now - lastDate) / (1000 * 60 * 60);

    // 超過 24 小時的 session 不恢復
    if (hoursDiff > 24) {
      return null;
    }

    // 格式化為可讀的 context
    return formatSessionContext(state, hoursDiff);
  } catch {
    return null;
  }
}

/**
 * 格式化 Session 狀態為可讀上下文
 */
function formatSessionContext(state, hoursDiff) {
  const lines = ['### 上次 Session 狀態 (自動恢復)'];

  // 時間資訊
  const timeAgo = hoursDiff < 1
    ? `${Math.round(hoursDiff * 60)} 分鐘前`
    : `${Math.round(hoursDiff)} 小時前`;
  lines.push(`\`\`\``);
  lines.push(`時間: ${timeAgo} | 分支: ${state.branch || 'unknown'}`);

  // 未完成工作
  if (state.pendingTasks?.hasUncommittedWork) {
    const pt = state.pendingTasks;
    lines.push(`待處理: ${pt.modifiedFiles || 0} 修改, ${pt.stagedFiles || 0} staged, ${pt.untrackedFiles || 0} 新增`);
  }

  // 最近決策
  if (state.recentDecisions?.length > 0) {
    lines.push(`最近 commits:`);
    state.recentDecisions.slice(0, 3).forEach(d => {
      lines.push(`  - ${d}`);
    });
  }

  lines.push('```');
  lines.push('*💡 這是上次 session 的狀態，可幫助你快速回到工作上下文*');

  return lines.join('\n');
}

/**
 * V75.0: 檢索最近的學習經驗 (semantic memory)
 * 對應 history-search skill 的自動注入功能
 */
function retrieveRecentLessons() {
  if (!memoryEngine) {
    return null;
  }

  try {
    // 從 semantic 記憶層檢索最近 7 天的 lessons
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLessons = memoryEngine.retrieve('semantic', {
      since: sevenDaysAgo.toISOString(),
      limit: 5
    });

    if (recentLessons.length === 0) {
      return null;
    }

    const lines = ['### 最近學習到的經驗 (V75.0)'];
    lines.push('```');

    for (const lesson of recentLessons) {
      const content = lesson.content;
      if (content.insight) {
        lines.push(`- ${content.insight}`);
      } else if (content.type === 'session_summary') {
        const skills = content.skills_used?.join(', ') || 'N/A';
        const rate = Math.round((content.overall_success_rate || 0) * 100);
        lines.push(`- [Session] Skills: ${skills} | 成功率: ${rate}%`);
      }
    }

    lines.push('```');
    lines.push('*💡 這些是累積的學習經驗，可幫助你避免重複錯誤*');

    return lines.join('\n');
  } catch {
    return null;
  }
}

/**
 * V80.0: 讀取進度摘要 (Anthropic Pattern)
 * 基於 https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
 */
function readProgressContext() {
  if (!progressGenerator) {
    return null;
  }

  try {
    // 嘗試生成/更新進度檔案
    const result = progressGenerator.generateProgressFile();

    if (!result.success || !result.content) {
      return null;
    }

    // 獲取簡潔版本用於 context 注入
    const summary = progressGenerator.getProgressSummaryForContext(25);
    if (!summary || summary.trim() === '') {
      return null;
    }

    const lines = ['### Current Progress (V80.0 Anthropic Pattern)'];
    lines.push('```markdown');
    lines.push(summary);
    lines.push('```');
    lines.push('*💡 這是當前任務的進度摘要，幫助你快速理解工作狀態*');

    return lines.join('\n');
  } catch {
    return null;
  }
}

/**
 * V175: Resume paused workflow tracker
 */
function resumeWorkflow() {
  try {
    const tracker = require('./lib/workflow-tracker');
    const status = tracker.getStatus();
    if (status.active && status.pausedAt) {
      tracker.resume();
      const current = status.steps.find(s => s.status === 'current');
      const done = status.steps.filter(s => s.status === 'completed' || s.status === 'skipped').length;
      const progress = `${done}/${status.steps.length}`;
      return `### Workflow Resumed (V175)\n\`\`\`\n${status.workflowId} — step ${progress} (next: ${current ? current.skill : 'done'})\n\`\`\``;
    }
  } catch { /* tracker failure must not block session start */ }
  return null;
}

/**
 * V237: 注入 SDD Flow Position（壓縮後恢復用）
 * 讀取 flowTracker 狀態，若有 inAutoChain spec 則注入命令式提醒
 */
function injectFlowPosition() {
  try {
    const sddState = require('./lib/sdd-state');
    const checklist = sddState.getFlowChecklist();
    if (!checklist) return null;

    return `### SDD Flow Position (V237 Anti-Amnesia)\n\`\`\`\n${checklist}\n\`\`\`\n*If in AUTO-CHAIN ZONE, resume the NEXT step immediately without asking.*`;
  } catch {
    return null;
  }
}

/**
 * 讀取 context 檔案並截取前 N 行
 */
function readContextFile(filePath, label, maxLines) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // 取前 maxLines 行
    const truncated = lines.slice(0, maxLines);
    const hasMore = lines.length > maxLines;

    let result = `### ${label}\n\`\`\`\n${truncated.join('\n')}`;
    if (hasMore) {
      result += `\n... (${lines.length - maxLines} more lines)`;
    }
    result += '\n```';

    return result;
  } catch {
    return null;
  }
}

// 包裝核心邏輯添加計時功能
const timedProcessSession = withTiming(processSession, 'session-start');

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const response = await timedProcessSession(input);
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(JSON.stringify({
      result: 'continue',
      error: error.message
    }));
  }
}

main();
