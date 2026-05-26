#!/usr/bin/env node
/**
 * Timing Wrapper - Hook 執行計時工具
 * 包裝所有 hook 計算執行時間，輸出到 additionalContext
 *
 * @version 1.0.0
 * @since 2026-01-12
 * @see https://arxiv.org/abs/2411.05285 (AgentOps)
 *
 * 用法：
 * const { withTiming, createTimedHook } = require('./lib/timing-wrapper');
 *
 * // 方法 1: 包裝現有函數
 * const timedMain = withTiming(main, 'skill-reminder');
 *
 * // 方法 2: 建立計時 hook
 * const hook = createTimedHook('my-hook', async (input) => {
 *   // hook 邏輯
 *   return { result: 'continue' };
 * });
 */

// telemetry-client removed in V156; inline no-op stubs
function recordHookDuration() {}
function emitPerformanceAlert() {}

// 配置
const CONFIG = {
  // 效能閾值 (ms)
  PERFORMANCE_THRESHOLDS: {
    warning: 100,  // 100ms 警告
    critical: 500, // 500ms 嚴重
  },
  // 是否在 additionalContext 輸出計時資訊
  INJECT_TIMING_CONTEXT: true,
  // 高精度計時
  USE_HIGH_PRECISION: true,
};

/**
 * 取得高精度時間 (ms)
 */
function getHighPrecisionTime() {
  if (CONFIG.USE_HIGH_PRECISION && process.hrtime) {
    const [seconds, nanoseconds] = process.hrtime();
    return seconds * 1000 + nanoseconds / 1000000;
  }
  return Date.now();
}

/**
 * 格式化持續時間
 */
function formatDuration(ms) {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(0)}μs`;
  } else if (ms < 1000) {
    return `${ms.toFixed(1)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

/**
 * 包裝函數添加計時功能
 *
 * @param {Function} fn - 要包裝的函數
 * @param {string} hookName - hook 名稱
 * @param {object} [options] - 選項
 * @returns {Function} 包裝後的函數
 */
function withTiming(fn, hookName, options = {}) {
  const {
    injectContext = CONFIG.INJECT_TIMING_CONTEXT,
    thresholds = CONFIG.PERFORMANCE_THRESHOLDS,
  } = options;

  return async function timedFunction(...args) {
    const startTime = getHighPrecisionTime();

    try {
      // 執行原始函數
      const result = await fn.apply(this, args);
      const endTime = getHighPrecisionTime();
      const durationMs = endTime - startTime;

      // 記錄 metric
      recordHookDuration(hookName, durationMs);

      // 檢查效能閾值
      if (durationMs >= thresholds.critical) {
        emitPerformanceAlert({
          hook: hookName,
          duration_ms: durationMs,
          severity: 'critical',
          message: `Hook ${hookName} exceeded critical threshold (${thresholds.critical}ms)`,
        });
      } else if (durationMs >= thresholds.warning) {
        emitPerformanceAlert({
          hook: hookName,
          duration_ms: durationMs,
          severity: 'warning',
          message: `Hook ${hookName} exceeded warning threshold (${thresholds.warning}ms)`,
        });
      }

      // 注入計時資訊到 additionalContext
      if (injectContext && result && typeof result === 'object') {
        const timingComment = `<!-- hookTiming: ${hookName}=${formatDuration(durationMs)} -->`;

        if (result.additionalContext) {
          result.additionalContext = `${timingComment}\n${result.additionalContext}`;
        } else {
          // 只在有其他內容時才注入
          result._timing = {
            hook: hookName,
            duration_ms: durationMs,
            formatted: formatDuration(durationMs),
          };
        }
      }

      return result;
    } catch (error) {
      const endTime = getHighPrecisionTime();
      const durationMs = endTime - startTime;

      // 即使失敗也記錄時間
      recordHookDuration(hookName, durationMs);

      // 重新拋出錯誤
      throw error;
    }
  };
}

/**
 * 建立計時 Hook
 * 完整的 hook 包裝，包含 stdin 讀取和 JSON 解析
 *
 * @param {string} hookName - hook 名稱
 * @param {Function} handler - 處理函數 (input) => response
 * @param {object} [options] - 選項
 */
function createTimedHook(hookName, handler, options = {}) {
  const timedHandler = withTiming(handler, hookName, options);

  return async function runHook() {
    const chunks = [];

    // 讀取 stdin
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }

    try {
      const input = JSON.parse(Buffer.concat(chunks).toString());
      const response = await timedHandler(input);

      // 確保輸出是有效的 JSON
      console.log(JSON.stringify(response || { result: 'continue' }));
    } catch (error) {
      console.log(
        JSON.stringify({
          result: 'continue',
          error: error.message,
          _timing: {
            hook: hookName,
            error: true,
          },
        })
      );
    }
  };
}

/**
 * 計時器類（用於更細粒度的控制）
 */
class Timer {
  constructor(name) {
    this.name = name;
    this.startTime = null;
    this.checkpoints = [];
  }

  start() {
    this.startTime = getHighPrecisionTime();
    return this;
  }

  checkpoint(label) {
    if (!this.startTime) {
      throw new Error('Timer not started');
    }
    const now = getHighPrecisionTime();
    this.checkpoints.push({
      label,
      timestamp: now,
      elapsed: now - this.startTime,
    });
    return this;
  }

  stop() {
    if (!this.startTime) {
      throw new Error('Timer not started');
    }
    const endTime = getHighPrecisionTime();
    const totalMs = endTime - this.startTime;

    return {
      name: this.name,
      total_ms: totalMs,
      formatted: formatDuration(totalMs),
      checkpoints: this.checkpoints.map((cp, i) => ({
        label: cp.label,
        elapsed_ms: cp.elapsed,
        delta_ms:
          i === 0 ? cp.elapsed : cp.elapsed - this.checkpoints[i - 1].elapsed,
      })),
    };
  }
}

/**
 * 建立計時器
 */
function createTimer(name) {
  return new Timer(name);
}

/**
 * 批次計時（用於多個操作）
 */
class BatchTimer {
  constructor() {
    this.timers = {};
  }

  start(name) {
    this.timers[name] = {
      start: getHighPrecisionTime(),
      end: null,
    };
    return this;
  }

  stop(name) {
    if (this.timers[name]) {
      this.timers[name].end = getHighPrecisionTime();
    }
    return this;
  }

  getSummary() {
    const results = {};
    Object.entries(this.timers).forEach(([name, timer]) => {
      if (timer.end) {
        const duration = timer.end - timer.start;
        results[name] = {
          duration_ms: duration,
          formatted: formatDuration(duration),
        };
      }
    });
    return results;
  }

  getTotal() {
    const durations = Object.values(this.timers)
      .filter((t) => t.end)
      .map((t) => t.end - t.start);

    if (durations.length === 0) return 0;
    return durations.reduce((a, b) => a + b, 0);
  }
}

/**
 * 建立批次計時器
 */
function createBatchTimer() {
  return new BatchTimer();
}

// ============================================================
// 匯出
// ============================================================

module.exports = {
  withTiming,
  createTimedHook,
  createTimer,
  createBatchTimer,
  formatDuration,
  getHighPrecisionTime,
  CONFIG,
};
