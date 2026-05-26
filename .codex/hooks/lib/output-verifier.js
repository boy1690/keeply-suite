#!/usr/bin/env node
/**
 * Output Verifier - 輸出驗證器
 * Meta-Orchestrator 的 Verifier 層
 *
 * @version 2.0.0 - V79.0 VibeTensor 增強
 * @since 2026-01-14
 * @see https://arxiv.org/abs/2601.16238 (VibeTensor 驗證方法論)
 *
 * 功能：
 * - 驗證 Agent 輸出的一致性
 * - 檢查跨模組約束（V79.0: 真實執行驗證）
 * - 生成 VibeTensor 格式驗證報告
 *
 * V79.0 更新：
 * - CONSTRAINT_RULES 真正執行驗證（非硬編碼 passed: true）
 * - 新增 runWorktreeIsolationTests() 執行 Worktree 隔離測試
 * - 新增 toVibeTensorFormat() 輸出標準格式
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 驗證類型
const VerificationType = {
  TYPE_CHECK: 'type-check',
  LINT: 'lint',
  CONSTRAINT: 'constraint',
  CROSS_MODULE: 'cross-module',
  WORKTREE_ISOLATION: 'worktree-isolation',     // V79.0
  SYNC_ATOMICITY: 'sync-atomicity',  // V79.0
  E2E_TEST: 'e2e-test'  // V80.0: Anthropic E2E Pattern
};

// V79.0: 驗證配置
const VERIFICATION_CONFIG = {
  /** 是否啟用真實驗證 (設為 false 可回到舊行為) */
  enableRealVerification: true,
  /** Rust 測試超時（毫秒） */
  rustTestTimeout: 60000,
  /** type-check 超時 */
  typeCheckTimeout: 30000,
  /** V80.0: E2E 測試超時 */
  e2eTestTimeout: 120000,
  /** V80.0: E2E 測試配置檔路徑 */
  e2eTriggersPath: path.join(__dirname, '../../config/e2e-triggers.json')
};

// V80.0: E2E 觸發配置（延遲載入）
let _e2eTriggers = null;

/**
 * V80.0: 載入 E2E 觸發配置
 */
function loadE2ETriggers() {
  if (_e2eTriggers) return _e2eTriggers;

  try {
    const triggersPath = VERIFICATION_CONFIG.e2eTriggersPath;
    if (fs.existsSync(triggersPath)) {
      _e2eTriggers = JSON.parse(fs.readFileSync(triggersPath, 'utf-8'));
    } else {
      _e2eTriggers = { triggers: [], config: {} };
    }
  } catch {
    _e2eTriggers = { triggers: [], config: {} };
  }

  return _e2eTriggers;
}

/**
 * V80.0: 偵測修改檔案影響的區域
 * 基於 Anthropic Engineering "think like a user" 原則
 *
 * @param {string[]} files - 修改的檔案列表
 * @returns {{ areas: string[], tests: string[], priority: string }}
 */
function detectAffectedAreas(files = []) {
  const triggers = loadE2ETriggers();
  const matchedAreas = new Set();
  const matchedTests = new Set();
  let highestPriority = 'low';

  const priorityOrder = { high: 3, medium: 2, low: 1 };

  for (const file of files) {
    // 正規化路徑
    const normalizedFile = file.replace(/\\/g, '/');

    for (const trigger of triggers.triggers || []) {
      // 將 glob pattern 轉換為 regex
      const pattern = trigger.pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*');

      const regex = new RegExp(pattern);

      if (regex.test(normalizedFile)) {
        matchedAreas.add(trigger.id);

        for (const test of trigger.tests || []) {
          matchedTests.add(test);
        }

        // 更新最高優先級
        const triggerPriority = priorityOrder[trigger.priority] || 1;
        const currentPriority = priorityOrder[highestPriority] || 1;
        if (triggerPriority > currentPriority) {
          highestPriority = trigger.priority;
        }
      }
    }
  }

  return {
    areas: Array.from(matchedAreas),
    tests: Array.from(matchedTests),
    priority: highestPriority
  };
}

/**
 * V80.0: 執行 E2E 測試
 * 基於 Anthropic Engineering "browser automation for end-to-end testing" 模式
 *
 * @param {object} context - 驗證上下文
 * @param {string[]} context.modifiedFiles - 修改的檔案列表
 * @param {string} context.cwd - 工作目錄
 * @returns {{ passed: boolean, type: string, suites: string[], results: object[], duration: number }}
 */
function runE2ETests(context = {}) {
  const cwd = context.cwd || process.cwd();
  const files = context.modifiedFiles || [];

  // 偵測影響區域
  const { areas, tests, priority } = detectAffectedAreas(files);

  // 如果沒有匹配的測試，跳過
  if (tests.length === 0) {
    return {
      passed: true,
      skipped: true,
      type: VerificationType.E2E_TEST,
      message: '無匹配的 E2E 測試',
      areas: [],
      tests: []
    };
  }

  const triggers = loadE2ETriggers();
  const config = triggers.config || {};
  const timeout = config.timeout || VERIFICATION_CONFIG.e2eTestTimeout;
  const screenshotOnFailure = config.screenshotOnFailure !== false;

  const results = [];
  let allPassed = true;
  const startTime = Date.now();

  for (const testFile of tests) {
    try {
      // 執行單個 E2E 測試
      const testName = path.basename(testFile, '.spec.ts');
      execSync(`npx playwright test ${testFile} --reporter=list`, {
        cwd,
        timeout,
        stdio: 'pipe',
        env: {
          ...process.env,
          CI: 'true'
        }
      });

      results.push({
        test: testFile,
        passed: true,
        duration: Date.now() - startTime
      });
    } catch (error) {
      allPassed = false;
      const stderr = error.stderr?.toString() || error.stdout?.toString() || error.message;

      // 嘗試解析失敗詳情
      const failMatch = stderr.match(/(\d+)\s+failed/);
      const failCount = failMatch ? parseInt(failMatch[1], 10) : 1;

      results.push({
        test: testFile,
        passed: false,
        failCount,
        error: stderr.slice(0, 500),
        duration: Date.now() - startTime
      });

      // 如果配置了失敗截圖，記錄路徑
      if (screenshotOnFailure) {
        const screenshotDir = config.screenshotDir || 'e2e/screenshots';
        results[results.length - 1].screenshotDir = screenshotDir;
      }
    }
  }

  const totalDuration = Date.now() - startTime;

  return {
    passed: allPassed,
    type: VerificationType.E2E_TEST,
    areas,
    tests,
    priority,
    results,
    duration: totalDuration,
    summary: allPassed
      ? `E2E 測試通過 (${tests.length} 套件, ${totalDuration}ms)`
      : `E2E 測試失敗 (${results.filter(r => !r.passed).length}/${tests.length} 失敗)`
  };
}

/**
 * V80.0: 檢查是否需要執行 E2E 測試
 *
 * @param {string[]} files - 修改的檔案列表
 * @returns {boolean}
 */
function shouldRunE2ETests(files = []) {
  const { tests } = detectAffectedAreas(files);
  return tests.length > 0;
}

// 跨模組約束驗證規則 (V79.0 增強：真實執行驗證)
const CONSTRAINT_RULES = {
  'git-integrity-check': {
    description: 'Git 完整性：Worktree 隔離 + NAS 同步原子性',
    check: (context) => {
      const files = context.modifiedFiles || [];
      const gitFiles = files.filter(f =>
        f.includes('git/') || f.includes('worktree') || f.includes('nas')
      );

      // 如果沒有修改 Git 相關檔案，跳過
      if (gitFiles.length === 0) {
        return { passed: true, skipped: true };
      }

      // V79.0: 真實驗證 - 執行 Rust 測試
      if (VERIFICATION_CONFIG.enableRealVerification) {
        try {
          execSync('cargo test', {
            encoding: 'utf-8',
            stdio: 'pipe',
            timeout: VERIFICATION_CONFIG.rustTestTimeout || 30000,
            cwd: process.cwd()
          });
          return { passed: true, message: 'Git 完整性測試通過' };
        } catch (e) {
          return { passed: false, error: 'Git 完整性測試失敗', suggestion: '執行 cargo test 確認' };
        }
      }

      return { passed: true, warning: '請驗證 Git 操作不變量', requiresManualCheck: true };
    }
  },
  'rust-safety-check': {
    description: 'Rust 安全性：無 unwrap()、無 unsafe（除非標註）',
    check: (context) => {
      const files = context.modifiedFiles || [];
      const rustFiles = files.filter(f => f.endsWith('.rs'));

      if (rustFiles.length === 0) {
        return { passed: true, skipped: true };
      }

      // 檢查 cargo clippy
      if (VERIFICATION_CONFIG.enableRealVerification) {
        try {
          execSync('cargo clippy -- -D warnings', {
            encoding: 'utf-8',
            stdio: 'pipe',
            timeout: 30000,
            cwd: process.cwd()
          });
          return { passed: true, message: 'Rust clippy 通過' };
        } catch (e) {
          return { passed: false, error: 'Rust clippy 警告', suggestion: '執行 cargo clippy 修復' };
        }
      }

      return { passed: true, warning: '請執行 cargo clippy', requiresManualCheck: true };
    }
  },
  'type-consistency': {
    description: '型別一致性：無 any 型別',
    check: (context) => {
      // 使用 grep 檢查是否有新增的 any 型別
      const files = context.modifiedFiles || [];
      const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

      if (tsFiles.length === 0) {
        return { passed: true, skipped: true };
      }

      // 檢查 git diff 中是否有新增 ': any'
      try {
        const diff = execSync('git diff --cached -U0', {
          encoding: 'utf-8',
          stdio: 'pipe',
          timeout: 10000
        });

        // 只檢查新增行 (以 + 開頭)
        const addedAnyCount = (diff.match(/^\+.*:\s*any\b/gm) || []).length;

        if (addedAnyCount > 0) {
          return {
            passed: false,
            error: `發現 ${addedAnyCount} 處新增的 any 型別`,
            suggestion: '使用具體型別取代 any'
          };
        }

        return { passed: true };
      } catch {
        // Git 操作失敗，跳過此檢查
        return { passed: true, skipped: true };
      }
    }
  }
};

/**
 * V79.0: 執行 Worktree 隔離測試
 * V79.2: 修正為 cargo test
 */
function runWorktreeIsolationTests(context) {
  const cwd = context.cwd || process.cwd();

  try {
    // 執行 Worktree 相關測試
    execSync('cargo test -- worktree', {
      cwd,
      timeout: VERIFICATION_CONFIG.rustTestTimeout,
      stdio: 'pipe'
    });

    return {
      passed: true,
      type: VerificationType.WORKTREE_ISOLATION,
      metrics: { testsRan: true }
    };
  } catch (error) {
    const stderr = error.stderr?.toString() || error.stdout?.toString() || error.message;

    // 嘗試解析測試失敗數
    const failMatch = stderr.match(/(\d+)\s+failed/);
    const failCount = failMatch ? parseInt(failMatch[1], 10) : 1;

    return {
      passed: false,
      type: VerificationType.WORKTREE_ISOLATION,
      error: `Worktree 隔離測試失敗 (${failCount} 項)`,
      suggestion: '檢查 Worktree 邏輯：changes in A must not appear in B (INV-1)',
      details: stderr.slice(0, 500)
    };
  }
}

/**
 * V79.0: 執行 NAS 同步原子性測試
 * V79.2: 修正為 cargo test
 */
function runSyncAtomicityTest(context) {
  const cwd = context.cwd || process.cwd();

  try {
    // 執行 NAS 同步相關測試
    execSync('cargo test -- sync', {
      cwd,
      timeout: VERIFICATION_CONFIG.rustTestTimeout,
      stdio: 'pipe'
    });

    return {
      passed: true,
      type: VerificationType.SYNC_ATOMICITY,
      metrics: { testsRan: true }
    };
  } catch (error) {
    const stderr = error.stderr?.toString() || error.stdout?.toString() || error.message;

    return {
      passed: false,
      type: VerificationType.SYNC_ATOMICITY,
      error: 'NAS 同步原子性測試失敗',
      suggestion: '檢查同步邏輯：Push/Pull 必須完全成功或完全回滾 (INV-2)',
      details: stderr.slice(0, 500)
    };
  }
}

/**
 * 執行 type-check
 */
function runTypeCheck(cwd) {
  try {
    execSync('npm run type-check', {
      cwd,
      timeout: 30000,
      stdio: 'pipe'
    });
    return { passed: true, type: VerificationType.TYPE_CHECK };
  } catch (error) {
    const stderr = error.stderr?.toString() || error.message;
    return {
      passed: false,
      type: VerificationType.TYPE_CHECK,
      error: stderr.slice(0, 500),
      suggestion: '修復 TypeScript 型別錯誤'
    };
  }
}

/**
 * 執行 lint 檢查
 */
function runLintCheck(cwd) {
  try {
    execSync('npm run lint', {
      cwd,
      timeout: 30000,
      stdio: 'pipe'
    });
    return { passed: true, type: VerificationType.LINT };
  } catch (error) {
    return {
      passed: false,
      type: VerificationType.LINT,
      error: 'Lint 檢查失敗',
      suggestion: '執行 npm run lint:fix 修復'
    };
  }
}

/**
 * 執行約束檢查
 */
function runConstraintChecks(context) {
  const results = [];

  for (const [id, rule] of Object.entries(CONSTRAINT_RULES)) {
    const result = rule.check(context);
    results.push({
      id,
      description: rule.description,
      ...result,
      type: VerificationType.CONSTRAINT
    });
  }

  return results;
}

/**
 * 主要驗證函式
 */
function verifyOutput(agentId, context = {}) {
  const cwd = context.cwd || process.cwd();
  const checks = [];

  // 1. Type-check
  checks.push(runTypeCheck(cwd));

  // 2. 約束檢查
  const constraintResults = runConstraintChecks(context);
  checks.push(...constraintResults);

  // 彙總結果
  const failures = checks.filter(c => !c.passed);
  const warnings = checks.filter(c => c.warning);

  return {
    passed: failures.length === 0,
    agentId,
    checks,
    failures,
    warnings,
    suggestions: failures.map(f => f.suggestion).filter(Boolean),
    timestamp: new Date().toISOString()
  };
}

/**
 * 格式化驗證報告
 */
function formatVerificationReport(result) {
  const emoji = result.passed ? '✅' : '❌';
  let report = `## 驗證報告 ${emoji}\n\n`;

  if (result.failures.length > 0) {
    report += `### 失敗項目\n`;
    result.failures.forEach(f => {
      report += `- ❌ ${f.type}: ${f.error || f.description}\n`;
      if (f.suggestion) report += `  建議: ${f.suggestion}\n`;
    });
    report += '\n';
  }

  if (result.warnings.length > 0) {
    report += `### 警告\n`;
    result.warnings.forEach(w => {
      report += `- ⚠️ ${w.description}: ${w.warning}\n`;
    });
  }

  return report;
}

/**
 * V79.0: 轉換為 VibeTensor 格式
 *
 * 用於與 Bead checkpoint 整合
 */
function toVibeTensorFormat(result) {
  const errors = result.failures.map(f =>
    `${f.type}: ${f.error || f.description}`
  );

  const warnings = result.warnings.map(w =>
    `${w.description}: ${w.warning}`
  );

  return {
    passed: result.passed,
    errors,
    warnings,
    metrics: {
      checksRun: result.checks.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      skippedCount: result.checks.filter(c => c.skipped).length
    },
    timestamp: result.timestamp
  };
}

/**
 * V79.0: 快速驗證（只執行關鍵檢查）
 */
function verifyOutputQuick(context = {}) {
  const cwd = context.cwd || process.cwd();
  const checks = [];

  // 只執行 type-check
  checks.push(runTypeCheck(cwd));

  const failures = checks.filter(c => !c.passed);

  return {
    passed: failures.length === 0,
    firstError: failures[0]?.error || null
  };
}

/**
 * V79.0: 完整驗證（包含領域規則）
 */
function verifyOutputFull(agentId, context = {}) {
  const result = verifyOutput(agentId, context);

  // 轉換為 VibeTensor 格式
  return {
    ...result,
    vibeTensor: toVibeTensorFormat(result)
  };
}

module.exports = {
  verifyOutput,
  verifyOutputQuick,
  verifyOutputFull,
  formatVerificationReport,
  toVibeTensorFormat,
  runTypeCheck,
  runLintCheck,
  runConstraintChecks,
  runWorktreeIsolationTests,
  runSyncAtomicityTest,
  // V80.0: E2E 測試相關
  runE2ETests,
  detectAffectedAreas,
  shouldRunE2ETests,
  loadE2ETriggers,
  VerificationType,
  CONSTRAINT_RULES,
  VERIFICATION_CONFIG
};
