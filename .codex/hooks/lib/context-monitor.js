#!/usr/bin/env node
/**
 * Context Monitor - Context Rot 監控器
 *
 * @version 1.1.0 - V128 加入 refetch 追蹤
 * @since 2026-01-14
 * @updated 2026-02-24 - 加入 fileReadCounts / recordFileRead（Context Degradation 研究）
 * @see https://www.primeintellect.ai/blog/rlm (Recursive Language Models)
 *
 * 功能：
 * - 追蹤 session 內 context 大小
 * - 監控 token 使用量
 * - 在接近閾值時發出警告
 * - 追蹤檔案重複讀取頻率（refetch = 壓縮品質信號）
 */

const fs = require('fs');
const path = require('path');

// 監控狀態檔案
const MONITOR_FILE = path.join(__dirname, '..', '..', 'metrics', 'context-monitor.json');

// Context 閾值配置
const CONTEXT_THRESHOLDS = {
  warning: 100000,    // 100K tokens 警告
  critical: 150000,   // 150K tokens 嚴重警告
  emergency: 180000   // 180K tokens 緊急（建議 /clear）
};

// Token 估算係數（字元 → tokens 近似）
const TOKEN_RATIO = {
  english: 0.25,      // 英文約 4 字元 = 1 token
  chinese: 0.67,      // 中文約 1.5 字元 = 1 token
  mixed: 0.4          // 混合內容
};

/**
 * 讀取監控狀態
 * @returns {object} 監控狀態
 */
function readState() {
  if (!fs.existsSync(MONITOR_FILE)) {
    return createInitialState();
  }
  try {
    return JSON.parse(fs.readFileSync(MONITOR_FILE, 'utf-8'));
  } catch {
    return createInitialState();
  }
}

/**
 * 創建初始狀態
 * @returns {object} 初始狀態
 */
function createInitialState() {
  return {
    sessionId: `session-${Date.now()}`,
    startTime: new Date().toISOString(),
    totalTokens: 0,
    messageCount: 0,
    toolCallCount: 0,
    contextHistory: [],
    warnings: [],
    lastCheck: null,
    fileReadCounts: {}  // { "src/foo.ts": 3, ... } — refetch 追蹤
  };
}

/**
 * 保存監控狀態
 * @param {object} state - 監控狀態
 */
function saveState(state) {
  const dir = path.dirname(MONITOR_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(MONITOR_FILE, JSON.stringify(state, null, 2));
}

/**
 * 估算 token 數量
 * @param {string} text - 文本內容
 * @returns {number} 估算的 token 數
 */
function estimateTokens(text) {
  if (!text) return 0;

  // 檢測內容類型
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const totalChars = text.length;
  const chineseRatio = chineseChars / totalChars;

  let ratio;
  if (chineseRatio > 0.5) {
    ratio = TOKEN_RATIO.chinese;
  } else if (chineseRatio < 0.1) {
    ratio = TOKEN_RATIO.english;
  } else {
    ratio = TOKEN_RATIO.mixed;
  }

  return Math.ceil(text.length * ratio);
}

/**
 * 記錄 context 增量
 * @param {string} source - 來源（user/assistant/tool）
 * @param {number} tokens - token 數量
 * @returns {object} 更新後的狀態
 */
function recordContext(source, tokens) {
  const state = readState();

  state.totalTokens += tokens;
  state.messageCount++;
  state.lastCheck = new Date().toISOString();

  state.contextHistory.push({
    source,
    tokens,
    cumulative: state.totalTokens,
    timestamp: state.lastCheck
  });

  // 限制歷史記錄
  if (state.contextHistory.length > 100) {
    state.contextHistory = state.contextHistory.slice(-100);
  }

  // 檢查閾值
  const warning = checkThresholds(state.totalTokens);
  if (warning && !state.warnings.some(w => w.level === warning.level)) {
    state.warnings.push(warning);
  }

  saveState(state);

  return state;
}

/**
 * 檢查閾值
 * @param {number} tokens - 當前 token 數
 * @returns {object|null} 警告對象或 null
 */
function checkThresholds(tokens) {
  if (tokens >= CONTEXT_THRESHOLDS.emergency) {
    return {
      level: 'emergency',
      message: `Context 已達 ${Math.round(tokens / 1000)}K tokens，強烈建議執行 /clear`,
      timestamp: new Date().toISOString()
    };
  }

  if (tokens >= CONTEXT_THRESHOLDS.critical) {
    return {
      level: 'critical',
      message: `Context 已達 ${Math.round(tokens / 1000)}K tokens，建議執行 /clear`,
      timestamp: new Date().toISOString()
    };
  }

  if (tokens >= CONTEXT_THRESHOLDS.warning) {
    return {
      level: 'warning',
      message: `Context 已達 ${Math.round(tokens / 1000)}K tokens，接近上限`,
      timestamp: new Date().toISOString()
    };
  }

  return null;
}

/**
 * 獲取當前狀態摘要
 * @returns {object} 狀態摘要
 */
function getSummary() {
  const state = readState();

  const usagePercent = Math.round((state.totalTokens / CONTEXT_THRESHOLDS.emergency) * 100);

  return {
    sessionId: state.sessionId,
    totalTokens: state.totalTokens,
    usagePercent,
    messageCount: state.messageCount,
    startTime: state.startTime,
    duration: getDuration(state.startTime),
    status: getStatus(state.totalTokens),
    warnings: state.warnings.slice(-3),
    topRefetched: getTopRefetched()
  };
}

/**
 * 獲取狀態
 * @param {number} tokens - token 數
 * @returns {string} 狀態
 */
function getStatus(tokens) {
  if (tokens >= CONTEXT_THRESHOLDS.emergency) return 'EMERGENCY';
  if (tokens >= CONTEXT_THRESHOLDS.critical) return 'CRITICAL';
  if (tokens >= CONTEXT_THRESHOLDS.warning) return 'WARNING';
  return 'HEALTHY';
}

/**
 * 計算持續時間
 * @param {string} startTime - 開始時間
 * @returns {string} 持續時間描述
 */
function getDuration(startTime) {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now - start;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

/**
 * 格式化狀態提示
 * @returns {string} 格式化的提示
 */
function formatStatusHint() {
  const summary = getSummary();

  if (summary.status === 'HEALTHY') {
    return '';
  }

  const emoji = {
    WARNING: '⚠️',
    CRITICAL: '🔴',
    EMERGENCY: '🆘'
  };

  return `\n${emoji[summary.status]} **Context ${summary.status}**: ${Math.round(summary.totalTokens / 1000)}K tokens (${summary.usagePercent}%)`;
}

/**
 * 重置監控狀態（新 session）
 */
function reset() {
  saveState(createInitialState());
}

/**
 * 記錄檔案讀取（refetch 追蹤）
 *
 * 基於 Context Engineering 研究：tokens-per-task 才是正確指標。
 * 同一檔案被重複讀取 > 2 次 = 壓縮品質差的信號（關鍵資訊在壓縮時遺失）。
 *
 * @param {string} filePath - 被讀取的檔案路徑
 * @returns {object} { warning: boolean, file?, count?, hint? }
 */
function recordFileRead(filePath) {
  if (!filePath) return { warning: false };

  const state = readState();

  // 確保欄位存在（向後相容舊 state）
  if (!state.fileReadCounts) {
    state.fileReadCounts = {};
  }

  // Windows 路徑正規化
  const normalized = filePath.replace(/\\/g, '/');
  state.fileReadCounts[normalized] = (state.fileReadCounts[normalized] || 0) + 1;

  // 限制追蹤的檔案數量，避免 state 無限膨脹
  const entries = Object.entries(state.fileReadCounts);
  if (entries.length > 200) {
    // 只保留讀取次數 > 1 的 + 最近的 100 個
    const frequent = entries.filter(([, count]) => count > 1);
    const recent = entries.slice(-100);
    const merged = new Map([...recent, ...frequent]);
    state.fileReadCounts = Object.fromEntries(merged);
  }

  saveState(state);

  if (state.fileReadCounts[normalized] > 2) {
    return {
      warning: true,
      file: normalized,
      count: state.fileReadCounts[normalized],
      hint: '此檔案被重複讀取，可能表示壓縮品質不佳'
    };
  }
  return { warning: false };
}

/**
 * 獲取高頻重讀檔案（供 pre-compact 使用）
 * @param {number} threshold - 最低讀取次數（預設 > 2）
 * @returns {Array<{file: string, count: number}>} 排序後的高頻檔案
 */
function getTopRefetched(threshold = 2) {
  const state = readState();
  if (!state.fileReadCounts) return [];

  return Object.entries(state.fileReadCounts)
    .filter(([, count]) => count > threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([file, count]) => ({ file, count }));
}

/**
 * 記錄工具調用
 */
function recordToolCall() {
  const state = readState();
  state.toolCallCount++;
  saveState(state);
}

/**
 * 偵測 refetch 爆發（短時間內大量重複讀取）
 * 用於 plan-context hook 判斷是否需要 compaction recovery injection
 *
 * Heuristic: 3+ 檔案的 refetch count > 2 = 可能的 post-compaction amnesia
 *
 * @param {number} [threshold=2] - 最低 refetch count
 * @param {number} [minFiles=3] - 最少幾個檔案超過 threshold
 * @returns {{ detected: boolean, files: Array<{file: string, count: number}>, hint: string }}
 */
function getRefetchBurst(threshold = 2, minFiles = 3) {
  const topFiles = getTopRefetched(threshold);
  const detected = topFiles.length >= minFiles;

  return {
    detected,
    files: topFiles,
    hint: detected
      ? `${topFiles.length} files re-read ${threshold}+ times — possible post-compaction amnesia`
      : ''
  };
}

module.exports = {
  recordContext,
  estimateTokens,
  getSummary,
  getStatus,
  formatStatusHint,
  reset,
  recordToolCall,
  recordFileRead,
  getTopRefetched,
  getRefetchBurst,
  checkThresholds,
  CONTEXT_THRESHOLDS
};
