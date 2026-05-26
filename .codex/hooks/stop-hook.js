#!/usr/bin/env node
/**
 * Stop hook: 任務完成時自動驗證
 *
 * V3.0.0 架構：Hook-First, Skill-Assist
 * - Hook 負責所有機械式驗證（type-check、stash、DevLabel、Spec-Sync）
 * - Skill 只處理需判斷的步驟（HANDOVER、commit message）
 *
 * @version 3.2.0
 * @since 2026-01-03
 * @updated 2026-03-17 - V3: Hook-First 架構重寫
 * @updated 2026-03-31 - V3.2: IBV BUILD quality gate (v1.4)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// AgentOps 可觀測性整合
const { withTiming } = require('./lib/timing-wrapper');

// Memory Engine - Session 狀態持久化
let memoryEngine;
try {
  memoryEngine = require('./lib/memory-engine');
} catch {
  memoryEngine = null;
}

/**
 * 核心驗證邏輯 — 結構化輸出 blockers/warnings/info
 */
async function processStopVerification(input) {
  const blockers = [];
  const warnings = [];
  const infos = [];

  // 1. Stash 安全（最先檢查，最危險）
  const stashCheck = checkStashSafety();
  if (stashCheck.dangerous) {
    blockers.push(`lint-staged automatic backup detected in stash — resolve before continuing`);
  }

  // 2. Type-check（必要驗證）
  const typeCheck = runTypeCheck();
  if (!typeCheck.passed) {
    blockers.push(`Type-check failed: ${typeCheck.error}`);
  }

  // 3. 未提交變更摘要
  const stagedCheck = checkStagedChanges();
  if (stagedCheck.hasStaged) {
    infos.push(`${stagedCheck.count} files staged but not committed`);
  }
  if (stagedCheck.hasModified) {
    infos.push(`${stagedCheck.modifiedCount} files modified but not staged`);
  }

  // 3.5 Semgrep 安全掃描（plugin: semgrep）
  const semgrepCheck = runSemgrepScan();
  if (semgrepCheck.findings > 0) {
    warnings.push(`Semgrep: ${semgrepCheck.findings} security finding(s) in changed files — review before commit`);
  }

  // 4. HANDOVER.md 新鮮度
  const handoverCheck = checkHandoverUpdated();
  if (!handoverCheck.updated) {
    warnings.push(`HANDOVER.md may need update (P0 requirement)`);
  }

  // 5. DevLabel 掃描（新 .tsx 元件）
  const devLabelCheck = scanDevLabels();
  if (devLabelCheck.missing.length > 0) {
    warnings.push(`New .tsx components missing <DevLabel>: ${devLabelCheck.missing.join(', ')}`);
  }

  // 6. Spec-Sync 偵測（架構變更）
  const specSyncCheck = detectSpecSync();
  if (specSyncCheck.triggered) {
    warnings.push(`Architecture changes detected — consider updating .speckit/ docs: ${specSyncCheck.reason}`);
  }

  // 6.5 SDD Spec Renew 偵測 + implement 模式重設
  const sddCheck = checkSddSpecRenew();
  if (sddCheck.renewNeeded.length > 0) {
    for (const spec of sddCheck.renewNeeded) {
      warnings.push(`Spec renew needed: ${spec} — 程式碼已修改但 spec 未更新。執行 /speckit.renew ${spec}`);
    }
  }
  if (sddCheck.pendingSpecs.length > 0) {
    for (const { id, pending, total } of sddCheck.pendingSpecs) {
      infos.push(`Spec ${id} 還有 ${pending}/${total} 個待完成任務`);
    }
  }
  if (sddCheck.relayIncomplete.length > 0) {
    for (const spec of sddCheck.relayIncomplete) {
      warnings.push(`SDD relay incomplete: ${spec} — spec renewed but task-completion not run. Execute task-completion skill.`);
    }
  }
  if (sddCheck.bypassCount > 0) {
    infos.push(`本 session 有 ${sddCheck.bypassCount} 次 SDD-BYPASS`);
  }

  // 7. Workflow tracker auto-pause
  try {
    const tracker = require('./lib/workflow-tracker');
    const wfStatus = tracker.getStatus();
    if (wfStatus.active) {
      tracker.pause();
      infos.push(`Workflow ${wfStatus.workflowId} paused at ${tracker.getProgressHint()}`);
    }
  } catch { /* tracker failure must not block stop hook */ }

  // 8. Code review gate reminder（mandatory for non-SDD, V5.0 task-completion）
  const reviewSuggestion = suggestCodeReview();
  if (reviewSuggestion.suggest) {
    warnings.push(`Code review required: ${reviewSuggestion.message} — task-completion Step 2.5 will enforce`);
  } else if (reviewSuggestion.srcCount > 0) {
    infos.push(`${reviewSuggestion.srcCount} src file(s) changed — quick code review will run in Step 2.5`);
  }

  // 9. Session state 持久化（靜默）
  saveSessionState();

  // 10. IBV BUILD Quality Gate (v1.4)
  const buildGate = checkIbvBuildGate(blockers);

  // 組裝輸出
  if (buildGate) {
    // BUILD 階段有 blockers → 強制性指令（P0）
    return {
      result: 'continue',
      additionalContext: buildGate
    };
  }

  if (blockers.length > 0) {
    return {
      result: 'continue',
      additionalContext: formatReport(blockers, warnings, infos, true)
    };
  }

  if (warnings.length > 0 || infos.length > 0) {
    return {
      result: 'continue',
      additionalContext: formatReport(blockers, warnings, infos, false)
    };
  }

  return {
    result: 'continue',
    additionalContext: `**Stop Hook**: All verification checks passed!`
  };
}

/**
 * 格式化結構化報告
 */
function formatReport(blockers, warnings, infos, hasBlockers) {
  const lines = ['**Stop Hook Verification Report**', ''];

  if (blockers.length > 0) {
    lines.push('🚫 **Blockers** (must resolve):');
    blockers.forEach(b => lines.push(`  - ${b}`));
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push('⚠️ **Warnings** (review before commit):');
    warnings.forEach(w => lines.push(`  - ${w}`));
    lines.push('');
  }

  if (infos.length > 0) {
    lines.push('ℹ️ **Info**:');
    infos.forEach(i => lines.push(`  - ${i}`));
    lines.push('');
  }

  if (hasBlockers) {
    lines.push('**Action required**: Resolve blockers before proceeding with task-completion.');
  }

  return lines.join('\n');
}

// ============================================================
// 檢查函數
// ============================================================

/**
 * 檢查 stash 中是否有 lint-staged automatic backup
 */
function checkStashSafety() {
  try {
    const result = execSync('git stash list', {
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: 5000
    });
    const dangerous = result.includes('lint-staged automatic backup');
    return { dangerous };
  } catch {
    return { dangerous: false };
  }
}

/**
 * 執行 type-check
 */
function runTypeCheck() {
  try {
    execSync('npm run type-check', {
      stdio: 'pipe',
      timeout: 30000
    });
    return { passed: true };
  } catch {
    return {
      passed: false,
      error: 'TypeScript compilation errors'
    };
  }
}

/**
 * 檢查 staged 和 modified 變更
 */
function checkStagedChanges() {
  try {
    const result = execSync('git status --porcelain', {
      stdio: 'pipe',
      encoding: 'utf-8'
    });

    const lines = result.trim().split('\n').filter(f => f);
    const staged = lines.filter(l => /^[MADRC]/.test(l));
    const modified = lines.filter(l => /^.[MADRC]/.test(l));

    return {
      hasStaged: staged.length > 0,
      count: staged.length,
      hasModified: modified.length > 0,
      modifiedCount: modified.length
    };
  } catch {
    return { hasStaged: false, count: 0, hasModified: false, modifiedCount: 0 };
  }
}

/**
 * 檢查 HANDOVER.md 是否最近更新過
 */
function checkHandoverUpdated() {
  try {
    const result = execSync('git diff --name-only HEAD~1..HEAD 2>/dev/null || git diff --name-only', {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    return { updated: result.includes('HANDOVER.md') };
  } catch {
    return { updated: true };
  }
}

/**
 * 掃描新增的 .tsx 元件是否缺少 DevLabel
 * 從 SKILL 步驟 3.3 移入
 */
function scanDevLabels() {
  try {
    // 取得新增的 .tsx 檔案
    const result = execSync('git diff --name-only --diff-filter=A HEAD 2>/dev/null || echo ""', {
      stdio: 'pipe',
      encoding: 'utf-8'
    });

    const newTsx = result.trim().split('\n')
      .filter(f => f.match(/^src\/components\/.*\.tsx$/))
      // 排除 Context/Provider/utils 和小檔案
      .filter(f => !f.match(/\/(Context|Provider|utils|hooks|types)\//i));

    const missing = [];
    for (const file of newTsx) {
      try {
        const fullPath = path.join(process.cwd(), file);
        if (!fs.existsSync(fullPath)) continue;

        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');

        // 跳過 < 20 行的檔案
        if (lines.length < 20) continue;

        if (!content.includes('DevLabel')) {
          missing.push(file);
        }
      } catch {
        // 忽略讀取錯誤
      }
    }

    return { missing };
  } catch {
    return { missing: [] };
  }
}

/**
 * 偵測是否涉及架構變更，需要 Spec-Sync
 * 從 SKILL 步驟 3.4 移入
 */
function detectSpecSync() {
  try {
    const result = execSync('git diff --name-only HEAD 2>/dev/null || echo ""', {
      stdio: 'pipe',
      encoding: 'utf-8'
    });

    const files = result.trim().split('\n').filter(f => f);

    // 檢查觸發條件
    const libStructureChange = files.some(f =>
      f.startsWith('src/lib/') && (f.endsWith('.ts') || f.endsWith('.tsx'))
    );
    const hookInterfaceChange = files.some(f =>
      f.startsWith('.claude/hooks/') && f.endsWith('.js')
    );
    const stateManagementChange = files.some(f =>
      f.includes('store') || f.includes('zustand') || f.includes('context')
    );

    const reasons = [];
    if (libStructureChange) reasons.push('src/lib/ module changes');
    if (hookInterfaceChange) reasons.push('hook interface changes');
    if (stateManagementChange) reasons.push('state management changes');

    return {
      triggered: reasons.length > 0,
      reason: reasons.join(', ')
    };
  } catch {
    return { triggered: false, reason: '' };
  }
}

// ============================================================
// Semgrep 安全掃描（V3.1 新增，plugin: semgrep）
// ============================================================

/**
 * 對 git diff 的變更檔案執行 semgrep 掃描
 * 靜默失敗（semgrep 未安裝時不阻擋）
 */
function runSemgrepScan() {
  try {
    // 先確認 semgrep 是否可用
    execSync('semgrep --version', { stdio: 'pipe', timeout: 5000 });
  } catch {
    return { findings: 0, skipped: true };
  }

  try {
    // 取得變更的 .ts/.tsx 檔案
    const diffResult = execSync('git diff --name-only HEAD 2>/dev/null || echo ""', {
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: 5000
    });

    const changedFiles = diffResult.trim().split('\n')
      .filter(f => f.match(/\.(ts|tsx)$/));

    if (changedFiles.length === 0) {
      return { findings: 0, skipped: false };
    }

    // 對變更檔案執行 semgrep（15s timeout，避免阻塞）
    const result = execSync(
      `semgrep scan --json --severity ERROR --severity WARNING ${changedFiles.join(' ')}`,
      { stdio: 'pipe', encoding: 'utf-8', timeout: 15000 }
    );

    const parsed = JSON.parse(result);
    return { findings: (parsed.results || []).length, skipped: false };
  } catch {
    return { findings: 0, skipped: true };
  }
}

// ============================================================
// Code Review 建議（V3.1 新增，plugin: code-review / pr-review-toolkit）
// ============================================================

/**
 * 根據變更規模建議執行 code review
 * 利用已安裝的 code-review 和 pr-review-toolkit plugins
 */
function suggestCodeReview() {
  try {
    const result = execSync('git diff --name-only HEAD 2>/dev/null || echo ""', {
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: 5000
    });

    const changedFiles = result.trim().split('\n').filter(f => f);
    const srcFiles = changedFiles.filter(f => f.startsWith('src/'));

    // ≥5 個 src 檔案 或 跨 2+ 個頂層模組 → full review
    const topDirs = new Set(
      srcFiles
        .map(f => f.split('/').slice(0, 2).join('/'))
    );

    if (srcFiles.length >= 5 || topDirs.size >= 2) {
      return {
        suggest: true,
        mode: 'full',
        srcCount: srcFiles.length,
        moduleCount: topDirs.size,
        message: `${srcFiles.length} src files changed across ${topDirs.size} module(s) — full review required (Step 2.5)`
      };
    }

    return {
      suggest: false,
      mode: srcFiles.length > 0 ? 'quick' : 'skip',
      srcCount: srcFiles.length,
      moduleCount: topDirs.size
    };
  } catch {
    return { suggest: false, mode: 'skip', srcCount: 0, moduleCount: 0 };
  }
}

// ============================================================
// IBV BUILD Quality Gate（V3.2 新增，v1.4）
// ============================================================

/**
 * IBV BUILD 階段的確定性品質門檻
 * 當 agent 在 BUILD 階段且有 type-check/cargo 失敗時，
 * 返回強制性 P0 指令阻止 agent 停止工作
 *
 * @param {string[]} blockers - 當前已偵測到的 blockers
 * @returns {string|null} - 強制性指令文字，或 null 表示不在 BUILD 或無問題
 */
function checkIbvBuildGate(blockers) {
  try {
    const sddState = require('./lib/sdd-state');
    const buildCheck = sddState.isInIbvBuild();

    if (!buildCheck.inBuild) return null;
    if (blockers.length === 0) return null;

    // BUILD 階段有 blockers → 強制性指令
    const lines = [
      '## BUILD QUALITY GATE — DO NOT STOP',
      '',
      'You are in **IBV BUILD phase**. Verification checks have FAILED.',
      '**You MUST fix these errors before stopping.** This is a P0 requirement.',
      ''
    ];

    if (buildCheck.specId) {
      lines.push(`Active spec: \`${buildCheck.specId}\``);
    }

    lines.push('', 'Failing checks:');
    blockers.forEach(b => lines.push(`- ${b}`));

    // LoopGuard 狀態整合
    if (buildCheck.loopGuard) {
      const lg = buildCheck.loopGuard;
      if (lg.status === 'stuck' || lg.status === 'oscillation' || lg.status === 'stall') {
        lines.push('');
        lines.push(`**LoopGuard: ${lg.status.toUpperCase()}** — ${lg.detail}`);
        lines.push('LoopGuard has detected convergence failure. Consider ESCALATE to user.');
      } else if (lg.status === 'warn') {
        lines.push('');
        lines.push(`LoopGuard warning: ${lg.detail} — try a different approach.`);
      }
    }

    lines.push('');
    lines.push('Resume the current task and fix these errors. Do NOT stop until all checks pass.');

    return lines.join('\n');
  } catch {
    return null;
  }
}

// ============================================================
// SDD Spec Renew 偵測（V3 新增）
// ============================================================

/**
 * 檢查本 session 是否有需要 renew 的 spec，並重設 implement 模式
 * @returns {{ renewNeeded: string[], pendingSpecs: Array<{id: string, pending: number, total: number}>, bypassCount: number, relayIncomplete: string[] }}
 */
function checkSddSpecRenew() {
  const result = { renewNeeded: [], pendingSpecs: [], bypassCount: 0, relayIncomplete: [] };

  try {
    const sddState = require('./lib/sdd-state');
    const state = sddState.loadState();

    // 重設 implement 模式
    if (state.implementActive) {
      sddState.setImplementActive(false);
    }

    // Bypass 統計
    result.bypassCount = state.bypassLog.length;

    // 掃描 session 中編輯過的檔案，找匹配的 spec
    const touchedSpecs = new Set();
    for (const edit of (state.sessionEdits || [])) {
      const specInfo = sddState.findSpecForFile(edit);
      if (specInfo && specInfo.id) {
        touchedSpecs.add(specInfo.id);
      }
    }

    // 檢查每個被碰到的 spec 的 phase
    for (const specId of touchedSpecs) {
      const specDir = path.join(sddState.SPECS_DIR, specId);
      const phase = sddState.detectSpecPhase(specDir);

      if (phase === 'implement_done') {
        result.renewNeeded.push(specId);
      } else if (phase === 'renewed') {
        // Spec renewed — check if task-completion relay ran (HANDOVER updated)
        const handoverPath = path.join(process.cwd(), 'HANDOVER.md');
        if (fs.existsSync(handoverPath)) {
          const handoverContent = fs.readFileSync(handoverPath, 'utf-8');
          if (!handoverContent.includes(specId)) {
            result.relayIncomplete.push(specId);
          }
        }
      } else if (phase === 'tasks') {
        // 統計待完成任務
        const tasksPath = path.join(specDir, 'tasks.md');
        if (fs.existsSync(tasksPath)) {
          const content = fs.readFileSync(tasksPath, 'utf-8');
          const checked = (content.match(/- \[x\]/gi) || []).length;
          const unchecked = (content.match(/- \[ \]/g) || []).length;
          if (unchecked > 0) {
            result.pendingSpecs.push({ id: specId, pending: unchecked, total: checked + unchecked });
          }
        }
      }
    }
  } catch {
    // sdd-state 載入失敗不阻擋 stop hook
  }

  return result;
}

// ============================================================
// Session 狀態持久化
// ============================================================

/**
 * 保存 Session 狀態到 episodic 記憶
 */
function saveSessionState() {
  if (!memoryEngine) return { saved: false };

  try {
    const cwd = process.cwd();
    const sessionState = {
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      workingContext: extractWorkingContext(cwd),
      pendingTasks: extractPendingTasks(),
      recentDecisions: extractRecentDecisions(),
      branch: getCurrentBranch()
    };

    memoryEngine.storeEpisodic(sessionState, {
      type: 'session_state',
      source: 'stop-hook'
    });

    return { saved: true };
  } catch {
    return { saved: false };
  }
}

function extractWorkingContext(cwd) {
  try {
    const handoverPath = path.join(cwd, 'HANDOVER.md');
    if (fs.existsSync(handoverPath)) {
      const content = fs.readFileSync(handoverPath, 'utf-8');
      return {
        source: 'HANDOVER.md',
        summary: content.split('\n').slice(0, 20).join('\n')
      };
    }
    return null;
  } catch {
    return null;
  }
}

function extractPendingTasks() {
  try {
    const status = execSync('git status --porcelain', {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    const lines = status.trim().split('\n').filter(l => l);
    return {
      modifiedFiles: lines.filter(l => l.startsWith(' M') || l.startsWith('M ')).length,
      untrackedFiles: lines.filter(l => l.startsWith('??')).length,
      stagedFiles: lines.filter(l => l.startsWith('A ') || l.startsWith('M ')).length,
      hasUncommittedWork: lines.length > 0
    };
  } catch {
    return null;
  }
}

function extractRecentDecisions() {
  try {
    return execSync('git log --oneline -5 2>/dev/null', {
      stdio: 'pipe',
      encoding: 'utf-8'
    }).trim().split('\n').slice(0, 5);
  } catch {
    return [];
  }
}

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', {
      stdio: 'pipe',
      encoding: 'utf-8'
    }).trim();
  } catch {
    return 'unknown';
  }
}

// ============================================================
// Main
// ============================================================

const timedProcessStopVerification = withTiming(processStopVerification, 'stop-hook');

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const response = await timedProcessStopVerification(input);
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(JSON.stringify({
      result: 'continue',
      error: error.message
    }));
  }
}

main();
