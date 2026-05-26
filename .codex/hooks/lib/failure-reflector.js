#!/usr/bin/env node
/**
 * Failure Reflector - 失敗反思器
 * Meta-Orchestrator 的 Reflector 層
 *
 * @version 1.0.0 - V57.1 新增
 * @since 2026-01-14
 *
 * 功能：
 * - 分析失敗的根本原因
 * - 分類失敗類型
 * - 建議恢復策略
 */

// 失敗類型
const FailureCategory = {
  TOOL_ERROR: 'tool-error',           // 工具執行錯誤
  REASONING_ERROR: 'reasoning-error', // 推理錯誤
  CONSTRAINT_VIOLATION: 'constraint-violation', // 約束違反
  TIMEOUT: 'timeout',                 // 超時
  UNKNOWN: 'unknown'
};

// 恢復策略
const RecoveryStrategy = {
  AUTO_RETRY: 'auto-retry',           // 自動重試
  PROVIDE_CONTEXT: 'provide-context', // 提供更多上下文
  AUTO_FIX: 'auto-fix',               // 自動修復
  ROLLBACK: 'rollback',               // 回滾
  ESCALATE_HUMAN: 'escalate-human'    // 升級人工介入
};

// 錯誤模式匹配
const ERROR_PATTERNS = [
  {
    pattern: /type.*(error|mismatch)/i,
    category: FailureCategory.TOOL_ERROR,
    recoverable: true,
    strategy: RecoveryStrategy.AUTO_FIX,
    suggestion: '執行 type-check 並修復型別錯誤'
  },
  {
    pattern: /lint|eslint/i,
    category: FailureCategory.TOOL_ERROR,
    recoverable: true,
    strategy: RecoveryStrategy.AUTO_FIX,
    suggestion: '執行 npm run lint:fix'
  },
  {
    pattern: /timeout|timed out/i,
    category: FailureCategory.TIMEOUT,
    recoverable: true,
    strategy: RecoveryStrategy.AUTO_RETRY,
    suggestion: '增加超時時間或分解任務'
  },
  {
    pattern: /cannot find|not found|missing/i,
    category: FailureCategory.REASONING_ERROR,
    recoverable: true,
    strategy: RecoveryStrategy.PROVIDE_CONTEXT,
    suggestion: '提供檔案路徑或模組名稱'
  },
  {
    pattern: /constraint|conservation|mismatch/i,
    category: FailureCategory.CONSTRAINT_VIOLATION,
    recoverable: true,
    strategy: RecoveryStrategy.ROLLBACK,
    suggestion: '回滾變更並重新計算'
  },
  {
    pattern: /permission|access denied/i,
    category: FailureCategory.TOOL_ERROR,
    recoverable: false,
    strategy: RecoveryStrategy.ESCALATE_HUMAN,
    suggestion: '需要人工檢查權限設定'
  }
];

// 重試配置
const RETRY_CONFIG = {
  [FailureCategory.TOOL_ERROR]: { maxRetries: 3, backoff: 1000 },
  [FailureCategory.TIMEOUT]: { maxRetries: 2, backoff: 2000 },
  [FailureCategory.REASONING_ERROR]: { maxRetries: 1, backoff: 0 },
  [FailureCategory.CONSTRAINT_VIOLATION]: { maxRetries: 1, backoff: 0 },
  [FailureCategory.UNKNOWN]: { maxRetries: 1, backoff: 0 }
};

/**
 * 識別根本原因
 */
function identifyRootCause(failure) {
  const errorMessage = failure.error || failure.message || String(failure);

  for (const pattern of ERROR_PATTERNS) {
    if (pattern.pattern.test(errorMessage)) {
      return {
        matched: true,
        pattern: pattern.pattern.toString(),
        suggestion: pattern.suggestion
      };
    }
  }

  return {
    matched: false,
    suggestion: '需要人工分析'
  };
}

/**
 * 分類失敗
 */
function categorizeFailure(failure) {
  const errorMessage = failure.error || failure.message || String(failure);

  for (const pattern of ERROR_PATTERNS) {
    if (pattern.pattern.test(errorMessage)) {
      return pattern.category;
    }
  }

  return FailureCategory.UNKNOWN;
}

/**
 * 判斷是否可恢復
 */
function isRecoverable(failure) {
  const errorMessage = failure.error || failure.message || String(failure);

  for (const pattern of ERROR_PATTERNS) {
    if (pattern.pattern.test(errorMessage)) {
      return pattern.recoverable;
    }
  }

  return false;
}

/**
 * 建議恢復策略
 */
function suggestRecoveryStrategy(failure) {
  const errorMessage = failure.error || failure.message || String(failure);

  for (const pattern of ERROR_PATTERNS) {
    if (pattern.pattern.test(errorMessage)) {
      return {
        strategy: pattern.strategy,
        suggestion: pattern.suggestion,
        retryConfig: RETRY_CONFIG[pattern.category]
      };
    }
  }

  return {
    strategy: RecoveryStrategy.ESCALATE_HUMAN,
    suggestion: '無法自動恢復，需要人工介入',
    retryConfig: RETRY_CONFIG[FailureCategory.UNKNOWN]
  };
}

/**
 * 主要反思函式
 */
function reflectOnFailure(failure, context = {}) {
  const rootCause = identifyRootCause(failure);
  const category = categorizeFailure(failure);
  const recoverable = isRecoverable(failure);
  const recovery = suggestRecoveryStrategy(failure);

  const analysis = {
    rootCause,
    category,
    recoverable,
    strategy: recovery.strategy,
    suggestion: recovery.suggestion,
    retryConfig: recovery.retryConfig,
    timestamp: new Date().toISOString()
  };

  // 決定行動
  if (recoverable && recovery.strategy !== RecoveryStrategy.ESCALATE_HUMAN) {
    return {
      action: 'auto-recover',
      analysis,
      nextStep: recovery.suggestion
    };
  }

  return {
    action: 'escalate-human',
    analysis,
    reason: rootCause.suggestion || '無法自動恢復'
  };
}

/**
 * 格式化反思報告
 */
function formatReflectionReport(reflection) {
  const emoji = reflection.action === 'auto-recover' ? '🔄' : '🚨';
  let report = `## 失敗分析 ${emoji}\n\n`;

  report += `**類別**: ${reflection.analysis.category}\n`;
  report += `**可恢復**: ${reflection.analysis.recoverable ? '是' : '否'}\n`;
  report += `**建議策略**: ${reflection.analysis.strategy}\n\n`;

  if (reflection.nextStep) {
    report += `### 下一步\n${reflection.nextStep}\n`;
  }

  if (reflection.reason) {
    report += `### 需要人工介入\n${reflection.reason}\n`;
  }

  return report;
}

module.exports = {
  reflectOnFailure,
  formatReflectionReport,
  identifyRootCause,
  categorizeFailure,
  isRecoverable,
  suggestRecoveryStrategy,
  FailureCategory,
  RecoveryStrategy,
  RETRY_CONFIG
};
