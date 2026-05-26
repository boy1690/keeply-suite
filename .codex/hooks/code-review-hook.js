#!/usr/bin/env node
/**
 * Code Review Hook - KBI/FAR 指標收集
 *
 * 基於 Defect-Focused Code Review 論文 (arXiv:2505.17928)
 * 收集 Key Bug Inclusion (KBI) 和 False Alarm Rate (FAR) 指標
 *
 * @version 1.0.0 - V55.4 新增
 * @since 2026-01-13
 * @see https://arxiv.org/abs/2505.17928 (Defect-Focused Code Review)
 * @see https://arxiv.org/abs/2506.10330 (LLMs + Static Analysis)
 *
 * 指標定義：
 * - KBI (Key Bug Inclusion): 關鍵 bug 被發現數 / 實際關鍵 bug 數 (目標 >80%)
 * - FAR (False Alarm Rate): 誤報數 / 總警報數 (目標 <20%)
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// 配置
// ============================================================

const CONFIG = {
  METRICS_FILE: path.join(__dirname, '..', 'metrics', 'quality-metrics.json'),
  REVIEW_LOG_DIR: path.join(__dirname, '..', 'logs', 'reviews'),
  MAX_HISTORY_ENTRIES: 100,
  PARALLEL_THRESHOLD_FILES: 5,
  PARALLEL_ASPECTS: ['correctness', 'security', 'performance', 'architecture', 'testing'],
};

// ============================================================
// 常數
// ============================================================

/**
 * Finding 嚴重程度
 */
const Severity = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
};

/**
 * Finding 類型
 */
const FindingType = {
  BUG: 'bug',
  VULNERABILITY: 'vulnerability',
  CODE_SMELL: 'code-smell',
  PERFORMANCE: 'performance',
  STYLE: 'style',
};

/**
 * 用戶反饋類型
 */
const FeedbackType = {
  VALID: 'valid',           // 確認是真正的問題
  FALSE_POSITIVE: 'false-positive', // 誤報
  WONT_FIX: 'wont-fix',     // 不修復
  DUPLICATE: 'duplicate',   // 重複
};

// ============================================================
// 審查指標追蹤器
// ============================================================

/**
 * 審查指標狀態
 */
const ReviewMetrics = {
  totalReviews: 0,
  totalFindings: 0,
  keyBugsFound: 0,
  keyBugsTotal: 0,
  falseAlarms: 0,
  validFindings: 0,
  sessionId: null,
};

/**
 * 初始化審查 session
 * @returns {string} Session ID
 */
function initReviewSession() {
  ReviewMetrics.sessionId = `review-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  ReviewMetrics.totalReviews = 0;
  ReviewMetrics.totalFindings = 0;
  ReviewMetrics.keyBugsFound = 0;
  ReviewMetrics.keyBugsTotal = 0;
  ReviewMetrics.falseAlarms = 0;
  ReviewMetrics.validFindings = 0;

  return ReviewMetrics.sessionId;
}

/**
 * 記錄審查發現
 * @param {object} finding - 發現物件
 * @param {string} finding.id - 唯一 ID
 * @param {string} finding.type - 類型 (使用 FindingType)
 * @param {string} finding.severity - 嚴重程度 (使用 Severity)
 * @param {string} finding.file - 檔案路徑
 * @param {number} finding.line - 行號
 * @param {string} finding.message - 訊息
 * @param {string} [finding.rule] - 規則名稱
 */
function recordFinding(finding) {
  ReviewMetrics.totalFindings++;

  // 關鍵 bug = critical 或 high severity 的 bug/vulnerability
  const isKeyBug =
    (finding.type === FindingType.BUG || finding.type === FindingType.VULNERABILITY) &&
    (finding.severity === Severity.CRITICAL || finding.severity === Severity.HIGH);

  if (isKeyBug) {
    ReviewMetrics.keyBugsTotal++;
  }

  // 記錄到日誌
  logFinding(finding, isKeyBug);

  return { findingId: finding.id, isKeyBug };
}

/**
 * 記錄用戶對發現的反饋
 * @param {string} findingId - 發現 ID
 * @param {string} feedback - 反饋類型 (使用 FeedbackType)
 * @param {object} [context] - 額外上下文
 */
function recordFeedback(findingId, feedback, context = {}) {
  switch (feedback) {
    case FeedbackType.VALID:
      ReviewMetrics.validFindings++;
      // 如果是關鍵 bug 且被確認為有效
      if (context.isKeyBug) {
        ReviewMetrics.keyBugsFound++;
      }
      break;

    case FeedbackType.FALSE_POSITIVE:
      ReviewMetrics.falseAlarms++;
      break;

    case FeedbackType.WONT_FIX:
    case FeedbackType.DUPLICATE:
      // 這些不影響 KBI/FAR 計算
      break;
  }

  // 記錄到日誌
  logFeedback(findingId, feedback, context);

  return calculateMetrics();
}

/**
 * 完成審查並計算指標
 * @returns {{ KBI: number|null, FAR: number|null }}
 */
function completeReview() {
  ReviewMetrics.totalReviews++;

  const metrics = calculateMetrics();

  // 持久化到 quality-metrics.json
  persistMetrics(metrics);

  return metrics;
}

/**
 * 計算 KBI/FAR 指標
 * @returns {{ KBI: number|null, FAR: number|null, targets: object }}
 */
function calculateMetrics() {
  const KBI =
    ReviewMetrics.keyBugsTotal > 0
      ? Math.round((ReviewMetrics.keyBugsFound / ReviewMetrics.keyBugsTotal) * 100)
      : null;

  const FAR =
    ReviewMetrics.totalFindings > 0
      ? Math.round((ReviewMetrics.falseAlarms / ReviewMetrics.totalFindings) * 100)
      : null;

  return {
    KBI,
    FAR,
    keyBugsFound: ReviewMetrics.keyBugsFound,
    keyBugsTotal: ReviewMetrics.keyBugsTotal,
    falseAlarms: ReviewMetrics.falseAlarms,
    totalFindings: ReviewMetrics.totalFindings,
    validFindings: ReviewMetrics.validFindings,
    targets: {
      KBI: '>80%',
      FAR: '<20%',
    },
  };
}

/**
 * 取得當前審查狀態
 */
function getReviewStatus() {
  return {
    sessionId: ReviewMetrics.sessionId,
    ...calculateMetrics(),
    totalReviews: ReviewMetrics.totalReviews,
  };
}

// ============================================================
// 持久化函數
// ============================================================

/**
 * 將指標持久化到 quality-metrics.json
 */
function persistMetrics(metrics) {
  try {
    if (!fs.existsSync(CONFIG.METRICS_FILE)) {
      console.error('[CodeReviewHook] Metrics file not found');
      return false;
    }

    const data = JSON.parse(fs.readFileSync(CONFIG.METRICS_FILE, 'utf8'));
    const timestamp = new Date().toISOString();

    // 更新 KBI
    if (metrics.KBI !== null && data.metrics.keyBugInclusion) {
      data.metrics.keyBugInclusion.current = metrics.KBI;
      data.metrics.keyBugInclusion.history.push({
        timestamp,
        value: metrics.KBI,
        context: {
          sessionId: ReviewMetrics.sessionId,
          keyBugsFound: metrics.keyBugsFound,
          keyBugsTotal: metrics.keyBugsTotal,
        },
      });

      // 限制歷史記錄數量
      if (data.metrics.keyBugInclusion.history.length > CONFIG.MAX_HISTORY_ENTRIES) {
        data.metrics.keyBugInclusion.history =
          data.metrics.keyBugInclusion.history.slice(-CONFIG.MAX_HISTORY_ENTRIES);
      }
    }

    // 更新 FAR
    if (metrics.FAR !== null && data.metrics.falseAlarmRate) {
      data.metrics.falseAlarmRate.current = metrics.FAR;
      data.metrics.falseAlarmRate.history.push({
        timestamp,
        value: metrics.FAR,
        context: {
          sessionId: ReviewMetrics.sessionId,
          falseAlarms: metrics.falseAlarms,
          totalFindings: metrics.totalFindings,
        },
      });

      // 限制歷史記錄數量
      if (data.metrics.falseAlarmRate.history.length > CONFIG.MAX_HISTORY_ENTRIES) {
        data.metrics.falseAlarmRate.history =
          data.metrics.falseAlarmRate.history.slice(-CONFIG.MAX_HISTORY_ENTRIES);
      }
    }

    data.lastUpdated = timestamp;

    fs.writeFileSync(CONFIG.METRICS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`[CodeReviewHook] Failed to persist metrics: ${error.message}`);
    return false;
  }
}

// ============================================================
// 日誌函數
// ============================================================

/**
 * 確保日誌目錄存在
 */
function ensureLogDir() {
  if (!fs.existsSync(CONFIG.REVIEW_LOG_DIR)) {
    fs.mkdirSync(CONFIG.REVIEW_LOG_DIR, { recursive: true });
  }
}

/**
 * 記錄發現到日誌
 */
function logFinding(finding, isKeyBug) {
  ensureLogDir();

  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(CONFIG.REVIEW_LOG_DIR, `${today}.ndjson`);

  const entry = {
    type: 'finding',
    timestamp: new Date().toISOString(),
    sessionId: ReviewMetrics.sessionId,
    finding,
    isKeyBug,
  };

  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}

/**
 * 記錄反饋到日誌
 */
function logFeedback(findingId, feedback, context) {
  ensureLogDir();

  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(CONFIG.REVIEW_LOG_DIR, `${today}.ndjson`);

  const entry = {
    type: 'feedback',
    timestamp: new Date().toISOString(),
    sessionId: ReviewMetrics.sessionId,
    findingId,
    feedback,
    context,
    metrics: calculateMetrics(),
  };

  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}

// ============================================================
// CLI 支援
// ============================================================

/**
 * 從命令列執行
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'init':
      const sessionId = initReviewSession();
      console.log(JSON.stringify({ status: 'ok', sessionId }));
      break;

    case 'status':
      console.log(JSON.stringify(getReviewStatus()));
      break;

    case 'complete':
      console.log(JSON.stringify(completeReview()));
      break;

    case 'help':
    default:
      console.log(`
Code Review Hook - KBI/FAR Metrics Collector (V55.4)

Commands:
  init      Initialize a new review session
  status    Get current review status and metrics
  complete  Complete review and persist metrics

Programmatic Usage:
  const { initReviewSession, recordFinding, recordFeedback, completeReview } = require('./code-review-hook');

  initReviewSession();
  recordFinding({ id: '1', type: 'bug', severity: 'high', file: 'src/app.ts', line: 42, message: 'Null check missing' });
  recordFeedback('1', 'valid', { isKeyBug: true });
  completeReview();
      `);
      break;
  }
}

// 如果直接執行則運行 CLI
if (require.main === module) {
  main();
}

// ============================================================
// 並行審查判斷（V160）
// ============================================================

/**
 * 判斷是否應使用並行審查模式
 *
 * 規則：
 * - >=5 個變更檔案 → 並行（5 subagent 各負責一個面向）
 * - 跨 2+ 個頂層目錄（如 src/lib/ + src/components/）→ 並行
 * - 用戶明確要求「深度審查」→ 並行
 *
 * @param {object} options
 * @param {number} options.filesChanged - 變更檔案數
 * @param {string[]} [options.filePaths] - 變更檔案路徑列表
 * @param {boolean} [options.deepReview] - 用戶是否要求深度審查
 * @returns {{ parallel: boolean, reason: string, aspects: string[] }}
 */
function shouldUseParallelReview({ filesChanged, filePaths = [], deepReview = false }) {
  if (deepReview) {
    return {
      parallel: true,
      mode: 'full',
      reason: 'User requested deep review',
      aspects: CONFIG.PARALLEL_ASPECTS,
    };
  }

  if (filesChanged >= CONFIG.PARALLEL_THRESHOLD_FILES) {
    return {
      parallel: true,
      mode: 'full',
      reason: `${filesChanged} files changed (threshold: ${CONFIG.PARALLEL_THRESHOLD_FILES})`,
      aspects: CONFIG.PARALLEL_ASPECTS,
    };
  }

  // 檢查是否跨多個頂層模組
  const topDirs = new Set(
    filePaths
      .filter(p => p.startsWith('src/'))
      .map(p => {
        const parts = p.split('/');
        return parts.length >= 3 ? `${parts[0]}/${parts[1]}` : parts[0];
      })
  );

  if (topDirs.size >= 2) {
    return {
      parallel: true,
      mode: 'full',
      reason: `Cross-module changes: ${[...topDirs].join(', ')}`,
      aspects: CONFIG.PARALLEL_ASPECTS,
    };
  }

  if (filesChanged > 0) {
    return {
      parallel: false,
      mode: 'quick',
      reason: `${filesChanged} files, single module — quick review`,
      aspects: [],
    };
  }

  return {
    parallel: false,
    mode: 'skip',
    reason: 'No src files changed — skip review',
    aspects: [],
  };
}

// ============================================================
// 匯出
// ============================================================

module.exports = {
  // 常數
  Severity,
  FindingType,
  FeedbackType,
  CONFIG,

  // 核心函數
  initReviewSession,
  recordFinding,
  recordFeedback,
  completeReview,
  calculateMetrics,
  getReviewStatus,

  // 並行審查（V160）
  shouldUseParallelReview,

  // 內部狀態（供測試用）
  _getMetrics: () => ({ ...ReviewMetrics }),
  _resetMetrics: () => {
    ReviewMetrics.totalReviews = 0;
    ReviewMetrics.totalFindings = 0;
    ReviewMetrics.keyBugsFound = 0;
    ReviewMetrics.keyBugsTotal = 0;
    ReviewMetrics.falseAlarms = 0;
    ReviewMetrics.validFindings = 0;
    ReviewMetrics.sessionId = null;
  },
};
